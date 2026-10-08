"use server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { generateShortCode } from "@/lib/onboarding/short-code";
import type { BranchQRPayload } from "@/lib/qr/client-qr-generator";
import { parseTableNumber } from "@/lib/utils";

/**
 * Derives a clean 1-2 character token prefix from a section name.
 * e.g. "AC Hall" -> "A", "Rooftop" -> "R", "Section B" -> "B"
 */
function getSectionTokenPrefix(sectionName: string): string {
  const clean = sectionName.trim();
  const matchSectionLetter = clean.match(/section\s+([a-zA-Z0-9])/i);
  if (matchSectionLetter) return matchSectionLetter[1].toUpperCase();

  const firstLetter = clean.charAt(0).toUpperCase();
  return /^[A-Z0-9]$/.test(firstLetter) ? firstLetter : "A";
}

/**
 * Normalizes base application URL from env or client request.
 */
function resolveBaseUrl(customBaseUrl?: string): string {
  const base =
    customBaseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

/**
 * Fetches the lightweight QR payload for a branch:
 * - Branch staff login target URL
 * - Sections with queue target URLs (omitted for Room types)
 * - ACTIVE tables only (inactive/deactivated tables are strictly excluded)
 */
export async function getBranchQRPayload(
  branchId: string,
  clientOrigin?: string
): Promise<{ success: boolean; data?: BranchQRPayload; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const baseUrl = resolveBaseUrl(clientOrigin);

    // 1. Fetch branch (with schema resilience)
    let branch: any = null;
    const { data: branchWithCode, error: branchErr } = await supabase
      .from("branches")
      .select("id, name, short_code")
      .eq("id", branchId)
      .single();

    if (branchErr) {
      if (branchErr.message?.includes("column")) {
        const { data: fbBranch, error: fbErr } = await supabase
          .from("branches")
          .select("id, name")
          .eq("id", branchId)
          .single();
        if (fbErr || !fbBranch) return { success: false, error: "Branch not found" };
        branch = fbBranch;
      } else {
        return { success: false, error: "Branch not found" };
      }
    } else {
      branch = branchWithCode;
    }

    // 2. Fetch sections for branch (with schema resilience)
    let sections: any[] = [];
    const { data: secData, error: secErr } = await supabase
      .from("sections")
      .select("id, name, type, short_code, queue_url, deleted_at")
      .eq("branch_id", branch.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (secErr) {
      if (secErr.message?.includes("column")) {
        const { data: fbSecs } = await supabase
          .from("sections")
          .select("id, name, type")
          .eq("branch_id", branch.id);
        sections = fbSecs || [];
      } else {
        return { success: false, error: "Failed to fetch dining sections" };
      }
    } else {
      sections = secData || [];
    }

    const sectionIds = sections.map((s) => s.id);

    // 3. Fetch tables (avoid requesting table_number from SQL to prevent 42703 column errors)
    let activeTables: any[] = [];
    if (sectionIds.length > 0) {
      let tbls: any[] | null = null;
      const { data: qTbls, error: tblErr } = await supabase
        .from("tables")
        .select("id, section_id, table_name, qr_url, status, deleted_at")
        .in("section_id", sectionIds)
        .eq("status", "active")
        .is("deleted_at", null);

      if (tblErr && (tblErr.message?.includes("column") || tblErr.code === "42703")) {
        const { data: fbTables } = await supabase
          .from("tables")
          .select("id, section_id, table_name, qr_url, status")
          .in("section_id", sectionIds)
          .eq("status", "active");
        tbls = fbTables;
      } else {
        tbls = qTbls;
      }
      activeTables = tbls || [];
    }

    // Attempt to extract existing short_code from table qr_urls if column wasn't in DB
    let branchShortCode = branch.short_code;
    if (!branchShortCode) {
      for (const t of activeTables) {
        if (t.qr_url && t.qr_url.startsWith("/o/")) {
          const parts = t.qr_url.split("/");
          if (parts.length >= 4) {
            branchShortCode = parts[2];
            break;
          }
        }
      }
    }

    if (!branchShortCode && (branch.onboarding_progress as any)?.short_code) {
      branchShortCode = (branch.onboarding_progress as any).short_code;
    }

    // If still missing, generate and persist
    if (!branchShortCode) {
      branchShortCode = generateShortCode(6);
      try {
        await supabase
          .from("branches")
          .update({ short_code: branchShortCode })
          .eq("id", branch.id);
      } catch {}
      try {
        const curProg = branch.onboarding_progress || {};
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, short_code: branchShortCode } })
          .eq("id", branch.id);
      } catch {}
    }

    const staffLoginUrl = `${baseUrl}/staff/login?b=${branchShortCode}`;

    // Group tables by section
    const tablesBySection = new Map<string, any[]>();
    for (const tbl of activeTables) {
      const list = tablesBySection.get(tbl.section_id) || [];
      list.push(tbl);
      tablesBySection.set(tbl.section_id, list);
    }

    // 4. Construct payload
    const structuredSections: BranchQRPayload["sections"] = [];
    const sectionShortCodesMap: Record<string, string> = {
      ...((branch.onboarding_progress as any)?.section_short_codes || {}),
    };

    for (const sec of sections || []) {
      const rawSecTblList = tablesBySection.get(sec.id) || [];

      // Deterministically sort tables by their parsed table number (1..N)
      const secTblList = [...rawSecTblList].sort(
        (a, b) => parseTableNumber(a) - parseTableNumber(b)
      );

      // Auto-discover section short_code if missing
      let secShortCode = sec.short_code;
      if (!secShortCode) {
        for (const t of secTblList) {
          if (t.qr_url && t.qr_url.startsWith("/o/")) {
            const parts = t.qr_url.split("/");
            if (parts.length >= 4 && parts[3]) {
              secShortCode = parts[3];
              break;
            }
          }
        }
      }

      if (!secShortCode && sectionShortCodesMap[sec.id]) {
        secShortCode = sectionShortCodesMap[sec.id];
      }

      if (!secShortCode) {
        secShortCode = generateShortCode(6);
        try {
          await supabase
            .from("sections")
            .update({ short_code: secShortCode })
            .eq("id", sec.id);
        } catch {}
      }

      sectionShortCodesMap[sec.id] = secShortCode;

      // Room-type sections do not have a walk-in queue QR
      const isRoom = sec.type === "room";
      const queueUrl = isRoom
        ? null
        : `${baseUrl}/q/${branchShortCode}/${secShortCode}`;

      const secTables = secTblList.map((tbl) => {
        const tableNum = parseTableNumber(tbl);
        let targetUrl = `${baseUrl}/o/${branchShortCode}/${secShortCode}/${tableNum}`;
        if (tbl.qr_url && tbl.qr_url.startsWith("/o/")) {
          targetUrl = `${baseUrl}${tbl.qr_url.startsWith("/") ? "" : "/"}${tbl.qr_url}`;
        }
        return {
          id: tbl.id,
          table_name: tbl.table_name || `${sec.unit_label || "Table"} ${tableNum}`,
          table_number: tableNum,
          target_url: targetUrl,
          status: "active",
        };
      });

      structuredSections.push({
        id: sec.id,
        name: sec.name,
        type: sec.type || "hall",
        short_code: secShortCode,
        queue_url: queueUrl,
        tables: secTables,
      });
    }

    // Persist unified branch and section short codes into onboarding_progress
    try {
      const curProg = branch.onboarding_progress || {};
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...curProg,
            short_code: branchShortCode,
            section_short_codes: sectionShortCodesMap,
          },
        })
        .eq("id", branch.id);
    } catch {}

    return {
      success: true,
      data: {
        branch: {
          id: branch.id,
          name: branch.name,
          short_code: branchShortCode,
          staff_login_url: staffLoginUrl,
        },
        sections: structuredSections,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while fetching QR payload",
    };
  }
}

export interface ResolvedBranchAndSection {
  branch: {
    id: string;
    restaurantId: string;
    name: string;
    city: string | null;
    shortCode: string;
    address?: string | null;
    onboardingProgress?: any;
  };
  section: {
    id: string;
    name: string;
    type: string;
    shortCode: string;
    unitLabel: string;
    branchId: string;
  };
}

export type ResolveBranchAndSectionResult =
  | { success: true; data: ResolvedBranchAndSection; isRoom?: boolean; error?: undefined }
  | { success: false; error: string; isRoom?: boolean; data?: undefined };

/**
 * Universal multi-tier resolver for branch and dining section.
 * Handles URL percent-encoding, short-codes, UUIDs, section indices (1, 2),
 * section types (outdoor, hall), slugs, names, reverse table lookups, and deterministic fallbacks.
 */
export async function resolveBranchAndSection(
  rawBranchCode?: string | null,
  rawSectionCode?: string | null
): Promise<ResolveBranchAndSectionResult> {
  try {
    const supabase = createServiceRoleClient();

    const safeDecode = (val: string | null | undefined): string => {
      if (!val) return "";
      try {
        return decodeURIComponent(String(val)).trim();
      } catch {
        return String(val).trim();
      }
    };

    const branchCode = safeDecode(rawBranchCode);
    const sectionCode = safeDecode(rawSectionCode);

    const isBranchUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(branchCode);
    const isSectionUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionCode);

    let branch: any = null;
    let preMatchedSection: any = null;

    // Helper: probe sectionCode globally to assist reverse lookup if branch is unknown
    if (sectionCode) {
      if (isSectionUuid) {
        const { data: s } = await supabase
          .from("sections")
          .select("id, name, type, active, branch_id")
          .eq("id", sectionCode)
          .maybeSingle();
        if (s) preMatchedSection = s;
      } else {
        try {
          const { data: matchedTbl } = await supabase
            .from("tables")
            .select("section_id, qr_url")
            .ilike("qr_url", `%/${sectionCode}/%`)
            .limit(1)
            .maybeSingle();

          if (matchedTbl?.section_id) {
            const { data: s } = await supabase
              .from("sections")
              .select("id, name, type, active, branch_id")
              .eq("id", matchedTbl.section_id)
              .maybeSingle();
            if (s) preMatchedSection = s;
          }
        } catch {}
      }
    }

    // 1. Resolve Branch
    if (isBranchUuid) {
      const { data } = await supabase
        .from("branches")
        .select("id, name, address, restaurant_id, onboarding_progress")
        .eq("id", branchCode)
        .maybeSingle();
      branch = data;
    }

    if (!branch && branchCode && branchCode.toLowerCase() !== "default") {
      // Defensive short_code column check
      try {
        const { data } = await supabase
          .from("branches")
          .select("id, name, short_code, address, restaurant_id, onboarding_progress")
          .eq("short_code", branchCode)
          .maybeSingle();
        if (data) branch = data;
      } catch {}

      // Tables qr_url matching /o/${branchCode}/ or /q/${branchCode}/
      if (!branch) {
        try {
          const { data: matchedTbl } = await supabase
            .from("tables")
            .select("section_id, qr_url")
            .ilike("qr_url", `%/${branchCode}/%`)
            .limit(1)
            .maybeSingle();

          if (matchedTbl?.section_id) {
            const { data: matchedSec } = await supabase
              .from("sections")
              .select("branch_id")
              .eq("id", matchedTbl.section_id)
              .maybeSingle();
            if (matchedSec?.branch_id) {
              const { data: b } = await supabase
                .from("branches")
                .select("id, name, address, restaurant_id, onboarding_progress")
                .eq("id", matchedSec.branch_id)
                .maybeSingle();
              branch = b;
            }
          }
        } catch {}
      }

      // Check onboarding_progress across branches
      if (!branch) {
        try {
          const { data: allBranches } = await supabase
            .from("branches")
            .select("id, name, address, restaurant_id, onboarding_progress");
          if (allBranches) {
            for (const b of allBranches) {
              const prog = b.onboarding_progress as any;
              if (
                prog?.short_code === branchCode ||
                prog?.branch_meta?.short_code === branchCode ||
                (prog?.section_short_codes && Object.values(prog.section_short_codes).includes(branchCode)) ||
                (sectionCode && prog?.section_short_codes && Object.values(prog.section_short_codes).includes(sectionCode))
              ) {
                branch = b;
                break;
              }
            }
          }
        } catch {}
      }

      // Branch name or slug match
      if (!branch) {
        try {
          const cleanBranch = branchCode.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanBranch.length >= 2) {
            const { data: allBranches } = await supabase
              .from("branches")
              .select("id, name, address, restaurant_id, onboarding_progress");
            if (allBranches) {
              for (const b of allBranches) {
                const cleanName = (b.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                if (cleanName === cleanBranch || cleanName.includes(cleanBranch) || cleanBranch.includes(cleanName)) {
                  branch = b;
                  break;
                }
              }
            }
          }
        } catch {}
      }
    }

    // If branch still not resolved, but preMatchedSection has branch_id, load that branch
    if (!branch && preMatchedSection?.branch_id) {
      const { data: b } = await supabase
        .from("branches")
        .select("id, name, address, restaurant_id, onboarding_progress")
        .eq("id", preMatchedSection.branch_id)
        .maybeSingle();
      branch = b;
    }

    // Default or single branch fallback
    if (!branch) {
      const { data: firstBranch } = await supabase
        .from("branches")
        .select("id, name, address, restaurant_id, onboarding_progress")
        .limit(1)
        .maybeSingle();
      branch = firstBranch;
    }

    if (!branch) {
      return { success: false, error: "Restaurant outlet not found" };
    }

    // 2. Resolve Section within the branch
    let sections: any[] = [];
    const { data: secRows, error: secErr } = await supabase
      .from("sections")
      .select("id, name, type, active, branch_id, unit_label")
      .eq("branch_id", branch.id)
      .order("created_at", { ascending: true });

    if (secErr) {
      const { data: fbSecRows } = await supabase
        .from("sections")
        .select("id, name, type, active, branch_id")
        .eq("branch_id", branch.id)
        .order("created_at", { ascending: true });
      sections = fbSecRows || [];
    } else {
      sections = secRows || [];
    }

    const activeSections = sections.filter((s) => s.active !== false);
    if (activeSections.length === 0) {
      return { success: false, error: "No active dining sections found for this branch" };
    }

    let resolvedSection: any = null;

    // Check if preMatchedSection belongs to this branch
    if (preMatchedSection && preMatchedSection.branch_id === branch.id) {
      resolvedSection = activeSections.find((s) => s.id === preMatchedSection.id) || preMatchedSection;
    }

    // Match Tier 1: UUID
    if (!resolvedSection && isSectionUuid) {
      resolvedSection = activeSections.find((s) => s.id === sectionCode) || null;
    }

    // Match Tier 2: Check onboarding_progress.section_short_codes
    if (!resolvedSection && sectionCode) {
      const secMap = (branch.onboarding_progress as any)?.section_short_codes || {};
      for (const [secId, code] of Object.entries(secMap)) {
        if (String(code).toUpperCase() === sectionCode.toUpperCase()) {
          resolvedSection = activeSections.find((s) => s.id === secId) || null;
          if (resolvedSection) break;
        }
      }
    }

    // Match Tier 3: Defensive short_code column check on section
    if (!resolvedSection && sectionCode) {
      try {
        const { data: sCodeMatch } = await supabase
          .from("sections")
          .select("id, name, type, active, branch_id, unit_label, short_code")
          .eq("branch_id", branch.id)
          .eq("short_code", sectionCode)
          .maybeSingle();
        if (sCodeMatch) {
          resolvedSection = activeSections.find((s) => s.id === sCodeMatch.id) || sCodeMatch;
        }
      } catch {}
    }

    // Match Tier 4: Table qr_url within branch sections
    if (!resolvedSection && sectionCode) {
      try {
        const secIds = activeSections.map((s) => s.id);
        const { data: matchedTbl } = await supabase
          .from("tables")
          .select("section_id, qr_url")
          .in("section_id", secIds)
          .ilike("qr_url", `%/${sectionCode}/%`)
          .limit(1)
          .maybeSingle();

        if (matchedTbl?.section_id) {
          resolvedSection = activeSections.find((s) => s.id === matchedTbl.section_id) || null;
        }
      } catch {}
    }

    // Match Tier 5: Exact or normalized name / slug match
    if (!resolvedSection && sectionCode) {
      const cleanCode = sectionCode.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Exact normalized match
      for (const s of activeSections) {
        const cleanName = (s.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanName === cleanCode) {
          resolvedSection = s;
          break;
        }
      }

      // Substring match if cleanCode is at least 3 letters
      if (!resolvedSection && cleanCode.length >= 3) {
        for (const s of activeSections) {
          const cleanName = (s.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanName.includes(cleanCode) || cleanCode.includes(cleanName)) {
            resolvedSection = s;
            break;
          }
        }
      }
    }

    // Match Tier 6: Numerical 1-based index (e.g. "1", "2", "sec-1", "section-2", "01")
    if (!resolvedSection && sectionCode) {
      const indexMatch = sectionCode.match(/^(?:sec(?:tion)?[-_]?)?0*(\d+)$/i);
      if (indexMatch) {
        const idx = parseInt(indexMatch[1], 10);
        if (idx >= 1 && idx <= activeSections.length) {
          resolvedSection = activeSections[idx - 1];
        }
      }
    }

    // Match Tier 7: Section type match (e.g. "outdoor", "hall", "terrace", "rooftop")
    if (!resolvedSection && sectionCode) {
      const cleanType = sectionCode.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanType.length >= 2) {
        const byType = activeSections.filter((s) => {
          const t = (s.type || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const n = (s.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return t === cleanType || (cleanType.length >= 3 && (t.includes(cleanType) || n.includes(cleanType)));
        });
        if (byType.length > 0) {
          resolvedSection = byType[0];
        }
      }
    }

    // Match Tier 8: Resilient fallback to primary non-room dining section
    if (!resolvedSection) {
      const nonRoomSecs = activeSections.filter((s) => s.type !== "room");
      resolvedSection = nonRoomSecs[0] || activeSections[0];
    }

    if (!resolvedSection) {
      return { success: false, error: "Dining section not found" };
    }

    // Compute unified short codes
    const secShortMap = (branch.onboarding_progress as any)?.section_short_codes || {};
    const finalBranchShortCode =
      branch.short_code ||
      (branch.onboarding_progress as any)?.short_code ||
      (isBranchUuid ? branch.id.substring(0, 6).toUpperCase() : branchCode || branch.id.substring(0, 6).toUpperCase());

    const finalSecShortCode =
      resolvedSection.short_code ||
      secShortMap[resolvedSection.id] ||
      (isSectionUuid ? resolvedSection.id.substring(0, 6).toUpperCase() : sectionCode || resolvedSection.id.substring(0, 6).toUpperCase());

    // Ensure discovered or generated short codes are persisted into onboarding_progress for fast subsequent resolution
    if (!secShortMap[resolvedSection.id] || !branch.onboarding_progress?.short_code) {
      try {
        const curProg = branch.onboarding_progress || {};
        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...curProg,
              short_code: finalBranchShortCode,
              section_short_codes: {
                ...secShortMap,
                [resolvedSection.id]: finalSecShortCode,
              },
            },
          })
          .eq("id", branch.id);
      } catch {}
    }

    const unitLabel = resolvedSection.unit_label || (resolvedSection.type === "room" ? "Room" : "Table");

    return {
      success: true,
      isRoom: resolvedSection.type === "room",
      data: {
        branch: {
          id: branch.id,
          restaurantId: branch.restaurant_id || branch.id,
          name: branch.name,
          city: branch.city || branch.address?.split(",")?.[0]?.trim() || "Main",
          shortCode: finalBranchShortCode,
          address: branch.address,
          onboardingProgress: branch.onboarding_progress,
        },
        section: {
          id: resolvedSection.id,
          name: resolvedSection.name,
          type: resolvedSection.type || "hall",
          shortCode: finalSecShortCode,
          unitLabel,
          branchId: branch.id,
        },
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to resolve section and branch" };
  }
}

export interface QueueSectionResult {
  success: boolean;
  data?: {
    branch: {
      id: string;
      restaurantId: string;
      name: string;
      city: string | null;
      shortCode: string;
    };
    section: {
      id: string;
      name: string;
      type: string;
      shortCode: string;
      unitLabel: string;
    };
  };
  error?: string;
  isRoom?: boolean;
}

/**
 * Public resolver for the section queue registration page (/q/[branchCode]/[sectionCode]).
 * Resilient to missing schema columns, short-codes vs UUIDs, and unpersisted codes.
 */
export async function getQueueSectionInfo(
  branchCode: string,
  sectionCode: string
): Promise<QueueSectionResult> {
  const res = await resolveBranchAndSection(branchCode, sectionCode);
  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Dining section not found",
      isRoom: res.isRoom,
    };
  }

  if (res.isRoom || res.data.section.type === "room") {
    return {
      success: false,
      error: "Walk-in queuing is not available for Room reservations.",
      isRoom: true,
    };
  }

  return {
    success: true,
    data: {
      branch: {
        id: res.data.branch.id,
        restaurantId: res.data.branch.restaurantId,
        name: res.data.branch.name,
        city: res.data.branch.city,
        shortCode: res.data.branch.shortCode,
      },
      section: {
        id: res.data.section.id,
        name: res.data.section.name,
        type: res.data.section.type,
        shortCode: res.data.section.shortCode,
        unitLabel: res.data.section.unitLabel,
      },
    },
  };
}

/**
 * Resolves section and branch details for /waitlist/join?section_id={section_id}&branch_id={branch_id}.
 * If section_id is missing or invalid, falls back to the default/main branch waiting queue.
 */
export async function resolveWaitlistJoinSection(
  sectionId?: string | null,
  branchId?: string | null
): Promise<QueueSectionResult> {
  const res = await resolveBranchAndSection(branchId, sectionId);
  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "No active dining section or branch available for waitlist registration.",
      isRoom: res.isRoom,
    };
  }

  if (res.isRoom || res.data.section.type === "room") {
    return {
      success: false,
      error: "Waitlist queuing is not applicable for Hotel Room sections.",
      isRoom: true,
    };
  }

  return {
    success: true,
    data: {
      branch: {
        id: res.data.branch.id,
        restaurantId: res.data.branch.restaurantId,
        name: res.data.branch.name,
        city: res.data.branch.city,
        shortCode: res.data.branch.shortCode,
      },
      section: {
        id: res.data.section.id,
        name: res.data.section.name,
        type: res.data.section.type,
        shortCode: res.data.section.shortCode,
        unitLabel: res.data.section.unitLabel,
      },
    },
  };
}



export interface RegisterQueueInput {
  branchCode: string;
  sectionCode: string;
  customerName: string;
  phone: string;
  partySize: number;
  deviceToken?: string;
  specialRequest?: string;
}

/**
 * Registers a walk-in customer into waiting_list_entries and queue_entries.
 * Generates a deterministic daily-reset token (e.g. "A-01").
 */
export async function registerCustomerQueueToken(data: RegisterQueueInput) {
  try {
    const supabase = createServiceRoleClient();

    // 1. Validation
    const name = (data.customerName || "").trim();
    const phone = (data.phone || "").trim().replace(/\D/g, "");
    const partySize = Number(data.partySize);

    if (!name || name.length < 2) {
      return { success: false, error: "Please provide a valid customer name (at least 2 letters)." };
    }
    if (!phone || phone.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit phone number." };
    }
    if (isNaN(partySize) || partySize < 1 || partySize > 50) {
      return { success: false, error: "Please specify party size between 1 and 50 guests." };
    }

    // 2. Resolve section & branch
    const secInfo = await getQueueSectionInfo(data.branchCode, data.sectionCode);
    if (!secInfo.success || !secInfo.data) {
      return { success: false, error: secInfo.error || "Invalid queue URL" };
    }

    const { section, branch } = secInfo.data;

    // 3. Compute daily-reset sequential token
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: dailyCount } = await supabase
      .from("waiting_list_entries")
      .select("id", { count: "exact", head: true })
      .eq("section_id", section.id)
      .gte("created_at", todayStart.toISOString());

    const tokenSeq = (dailyCount || 0) + 1;
    const tokenPrefix = getSectionTokenPrefix(section.name);
    const tokenNumber = `${tokenPrefix}-${String(tokenSeq).padStart(2, "0")}`;

    // 4. Insert into waiting_list_entries (with fallback to queue_entries)
    let newEntry: any = null;
    const { data: wlEntry, error: insertErr } = await supabase
      .from("waiting_list_entries")
      .insert({
        branch_id: branch.id,
        section_id: section.id,
        queue_token: tokenNumber,
        customer_name: name,
        mobile_number: phone,
        guest_count: partySize,
        special_request: data.specialRequest?.trim() || null,
        notes: data.specialRequest?.trim() || null,
        device_token: data.deviceToken?.trim() || null,
        registration_method: "CUSTOMER_SELF",
        created_by_name: "Customer Self-Service",
        status: "WAITING",
      })
      .select()
      .single();

    if (!insertErr && wlEntry) {
      newEntry = {
        id: wlEntry.id,
        token_number: wlEntry.queue_token,
        customer_name: wlEntry.customer_name,
        phone: wlEntry.mobile_number,
        party_size: wlEntry.guest_count,
        status: wlEntry.status,
        created_at: wlEntry.created_at,
      };
    } else {
      // Fallback to queue_entries
      const { data: qeEntry, error: qeErr } = await supabase
        .from("queue_entries")
        .insert({
          section_id: section.id,
          token_number: tokenNumber,
          customer_name: name,
          phone: phone,
          party_size: partySize,
          device_token: data.deviceToken?.trim() || null,
          special_request: data.specialRequest?.trim() || null,
          status: "waiting",
        })
        .select()
        .single();

      if (qeErr || !qeEntry) {
        return {
          success: false,
          error: qeErr?.message || insertErr?.message || "Failed to issue waiting queue token.",
        };
      }
      newEntry = qeEntry;
    }

    return {
      success: true,
      data: {
        id: newEntry.id,
        tokenNumber: newEntry.token_number,
        customerName: newEntry.customer_name,
        phone: newEntry.phone,
        partySize: newEntry.party_size,
        status: newEntry.status,
        createdAt: newEntry.created_at,
        branchName: branch.name,
        sectionName: section.name,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while registering for the queue.",
    };
  }
}

/**
 * Public resolver for the table ordering placeholder page (/o/{branch}/{section}/{table}).
 */
export async function getTableOrderingInfo(
  branchCode: string,
  sectionCode: string,
  tableNumber: string | number
) {
  try {
    const supabase = createServiceRoleClient();
    const parsedNum = Number(tableNumber);

    // 1 & 2: Resolve Branch and Section
    const resolved = await resolveBranchAndSection(branchCode, sectionCode);
    if (!resolved.success || !resolved.data) {
      return {
        success: false,
        error: resolved.error || "Dining section or restaurant outlet not found",
      };
    }

    const { branch, section } = resolved.data;

    // 3. Table resolution (robust across schemas without table_number column)
    const { data: sectionTables, error: tErr } = await supabase
      .from("tables")
      .select("id, table_name, seating_capacity, status, qr_url")
      .eq("section_id", section.id)
      .is("deleted_at", null);

    if (tErr || !sectionTables || sectionTables.length === 0) {
      return {
        success: false,
        error: `No tables found in ${section.name}.`,
      };
    }

    // Match by table number (derived from table_name / qr_url), exact URL ending, or parsed integer
    const matchedTable = sectionTables.find((t) => {
      if (parseTableNumber(t) === parsedNum) return true;
      if (t.qr_url) {
        const parts = t.qr_url.split("/");
        if (parts[parts.length - 1] === String(parsedNum)) return true;
      }
      const numMatch = t.table_name?.match(/\d+/);
      if (numMatch && parseInt(numMatch[0], 10) === parsedNum) return true;
      return false;
    }) || (sectionTables.length === 1 ? sectionTables[0] : null);

    if (!matchedTable) {
      return {
        success: false,
        error: `${section.unitLabel || "Table"} #${parsedNum} does not exist in ${section.name}.`,
      };
    }

    // 4. Resolve Active Session (Shared session resolution for merged tables)
    let activeSessionData: any = null;

    // Check direct session
    try {
      const { data: directSession } = await supabase
        .from("table_sessions")
        .select("id, opened_at, guest_count, status")
        .eq("table_id", matchedTable.id)
        .eq("status", "active")
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (directSession) {
        activeSessionData = directSession;
      }
    } catch {}

    // If not direct, check if this table is merged into another table's session via session_tables
    if (!activeSessionData) {
      try {
        const { data: stLink } = await supabase
          .from("session_tables")
          .select("session_id")
          .eq("table_id", matchedTable.id)
          .limit(1)
          .maybeSingle();

        if (stLink?.session_id) {
          const { data: sharedSession } = await supabase
            .from("table_sessions")
            .select("id, opened_at, guest_count, status")
            .eq("id", stLink.session_id)
            .eq("status", "active")
            .maybeSingle();

          if (sharedSession) {
            activeSessionData = sharedSession;
          }
        }
      } catch {}
    }

    return {
      success: true,
      data: {
        branch: {
          id: branch.id,
          name: branch.name,
          city: branch.city,
          shortCode: branch.shortCode,
        },
        section: {
          name: section.name,
          type: section.type,
          unitLabel: section.unitLabel || "Table",
        },
        table: {
          id: matchedTable.id,
          name: matchedTable.table_name,
          number: parsedNum || 1,
          status: matchedTable.status,
          seatingCapacity: matchedTable.seating_capacity,
        },
        session: activeSessionData
          ? {
              id: activeSessionData.id,
              openedAt: activeSessionData.opened_at,
              guestCount: activeSessionData.guest_count,
            }
          : null,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load table details" };
  }
}
