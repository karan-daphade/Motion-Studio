import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { 
  validateWaitlistRegistration, 
  getSectionTokenPrefix, 
  formatWaitlistToken, 
  calculateEstimatedWaitTime,
  checkWaitlistRateLimit
} from "@/lib/waitlist/waitlist-service";

/**
 * Helper to extract client IP for lightweight rate limiting.
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * POST /api/v1/public/waitlist/join
 * Customer self-service waitlist queue registration (User Story 15.3 Updated).
 * Zero authentication required.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));

    // 1. Rate Limiting Check (Anti-Abuse)
    const rateIdentifier = body.device_token ? `${ip}:${body.device_token}` : ip;
    const rateCheck = checkWaitlistRateLimit(rateIdentifier, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many queue requests. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.` 
        },
        { 
          status: 429, 
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } 
        }
      );
    }

    // 2. Input Validation
    const validation = validateWaitlistRegistration(body);
    if (!validation.isValid || !validation.cleaned) {
      return NextResponse.json(
        { 
          success: false, 
          error: Object.values(validation.errors)[0] || "Validation failed",
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    const { 
      device_token, 
      section_id, 
      guest_name, 
      phone_number, 
      party_size, 
      special_request 
    } = validation.cleaned;

    const supabase = createServiceRoleClient();

    // 3. Resolve section & branch with graceful fallback
    let resolvedSection: any = null;
    let branchId = body.branch_id || body.restaurant_id;

    if (section_id) {
      const { data: section } = await supabase
        .from("sections")
        .select("id, name, branch_id, type, active")
        .eq("id", section_id)
        .maybeSingle();

      if (section) {
        resolvedSection = section;
        branchId = section.branch_id;
      }
    }

    // Fallback: If section is missing or invalid, fallback to the default/main branch waiting queue
    if (!resolvedSection && branchId) {
      const { data: defaultSections } = await supabase
        .from("sections")
        .select("id, name, branch_id, type, active")
        .eq("branch_id", branchId)
        .neq("type", "room")
        .order("created_at", { ascending: true })
        .limit(1);

      if (defaultSections && defaultSections.length > 0) {
        resolvedSection = defaultSections[0];
      }
    }

    if (!resolvedSection) {
      return NextResponse.json(
        { success: false, error: "Dining section not found or inactive for waitlist queue." },
        { status: 404 }
      );
    }

    if (resolvedSection.type === "room") {
      return NextResponse.json(
        { success: false, error: "Waitlist queuing is not applicable for Hotel Room sections." },
        { status: 400 }
      );
    }

    const effectiveSectionId = resolvedSection.id;

    // 4. Idempotency & Duplicate Check:
    // Check if device_token already has an active WAITING or TABLE_ASSIGNED entry in THIS section
    let existingActive: any = null;
    let isWaitingListTableMissing = false;
    let isQueueEntriesTableMissing = false;

    try {
      const { data, error } = await supabase
        .from("waiting_list_entries")
        .select("id, queue_token, customer_name, mobile_number, guest_count, special_request, status, created_at, section_id")
        .eq("section_id", effectiveSectionId)
        .eq("device_token", device_token)
        .in("status", ["WAITING", "waiting", "TABLE_ASSIGNED", "assigned"])
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error && (error.message?.includes("table") || error.message?.includes("schema cache"))) {
        isWaitingListTableMissing = true;
      } else {
        existingActive = data;
      }
    } catch {
      isWaitingListTableMissing = true;
    }

    // Fallback 1: check in queue_entries
    if (isWaitingListTableMissing || !existingActive) {
      try {
        const { data: qeData, error: qeErr } = await supabase
          .from("queue_entries")
          .select("id, token_number, queue_number, customer_name, guest_name, phone, guest_mobile, party_size, status, created_at, section_id")
          .eq("section_id", effectiveSectionId)
          .eq("device_token", device_token)
          .in("status", ["waiting", "WAITING", "assigned", "TABLE_ASSIGNED"])
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (qeErr && (qeErr.message?.includes("table") || qeErr.message?.includes("schema cache"))) {
          isQueueEntriesTableMissing = true;
        } else if (qeData) {
          existingActive = {
            id: qeData.id,
            queue_token: qeData.token_number || qeData.queue_number,
            customer_name: qeData.customer_name || qeData.guest_name,
            guest_count: qeData.party_size,
            special_request: null,
            status: qeData.status.toUpperCase() === "ASSIGNED" ? "TABLE_ASSIGNED" : "WAITING",
            created_at: qeData.created_at,
            section_id: qeData.section_id,
          };
        }
      } catch {
        isQueueEntriesTableMissing = true;
      }
    }

    // Fallback 2 (ADR-045 style dual-storage): check in branch onboarding_progress JSONB
    let branchProgress: any = null;
    if ((isWaitingListTableMissing && isQueueEntriesTableMissing) || !existingActive) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("id, onboarding_progress")
          .eq("id", branchId)
          .single();

        if (bData?.onboarding_progress) {
          branchProgress = bData.onboarding_progress;
          const waitlistJson = branchProgress.waitlist_entries || [];
          const found = waitlistJson.find(
            (w: any) =>
              w.section_id === effectiveSectionId &&
              w.device_token === device_token &&
              (w.status === "WAITING" || w.status === "TABLE_ASSIGNED")
          );
          if (found) {
            existingActive = found;
          }
        }
      } catch {
        // branch progress check fallback
      }
    }

    if (existingActive) {
      const isAssigned = existingActive.status === "TABLE_ASSIGNED" || existingActive.status === "assigned";
      
      let existingPosition = 0;
      if (!isAssigned) {
        if (!isWaitingListTableMissing) {
          const { count: aheadCount } = await supabase
            .from("waiting_list_entries")
            .select("id", { count: "exact", head: true })
            .eq("section_id", existingActive.section_id || effectiveSectionId)
            .in("status", ["WAITING", "waiting"])
            .lt("created_at", existingActive.created_at);

          existingPosition = (aheadCount || 0) + 1;
        } else if (!isQueueEntriesTableMissing) {
          const { count: aheadCount } = await supabase
            .from("queue_entries")
            .select("id", { count: "exact", head: true })
            .eq("section_id", existingActive.section_id || effectiveSectionId)
            .in("status", ["waiting", "WAITING"])
            .lt("created_at", existingActive.created_at);

          existingPosition = (aheadCount || 0) + 1;
        } else if (branchProgress?.waitlist_entries) {
          const ahead = (branchProgress.waitlist_entries as any[]).filter(
            (w) =>
              w.section_id === (existingActive.section_id || effectiveSectionId) &&
              w.status === "WAITING" &&
              new Date(w.created_at) < new Date(existingActive.created_at)
          );
          existingPosition = ahead.length + 1;
        } else {
          existingPosition = 1;
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "You already have an active waitlist entry in this section.",
          has_active_entry: true,
          device_token,
          waitlist_entry_id: existingActive.id,
          entry: {
            id: existingActive.id,
            section_id: existingActive.section_id || effectiveSectionId,
            token_number: existingActive.queue_token,
            guest_name: existingActive.customer_name,
            party_size: existingActive.guest_count,
            special_request: existingActive.special_request || null,
            position: existingPosition,
            parties_ahead: Math.max(0, existingPosition - 1),
            section_name: resolvedSection.name,
            estimated_wait_minutes: isAssigned ? 0 : calculateEstimatedWaitTime(existingPosition),
            status: isAssigned ? "TABLE_ASSIGNED" : "WAITING",
            created_at: existingActive.created_at,
          },
        },
        { status: 409 }
      );
    }

    // 5. Generate daily sequential token (e.g. A-01, A-02)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let dailyCount = 0;
    if (!isWaitingListTableMissing) {
      const { count } = await supabase
        .from("waiting_list_entries")
        .select("id", { count: "exact", head: true })
        .eq("section_id", effectiveSectionId)
        .gte("created_at", todayStart.toISOString());
      dailyCount = count || 0;
    } else if (!isQueueEntriesTableMissing) {
      const { count } = await supabase
        .from("queue_entries")
        .select("id", { count: "exact", head: true })
        .eq("section_id", effectiveSectionId)
        .gte("created_at", todayStart.toISOString());
      dailyCount = count || 0;
    } else if (branchProgress?.waitlist_entries) {
      const list = (branchProgress.waitlist_entries as any[]).filter(
        (w) =>
          w.section_id === effectiveSectionId &&
          new Date(w.created_at) >= todayStart
      );
      dailyCount = list.length;
    }

    const seq = dailyCount + 1;
    const prefix = getSectionTokenPrefix(resolvedSection.name);
    const tokenNumber = formatWaitlistToken(prefix, seq);

    // 6. Compute initial position: current active waiting entries in this section + 1
    let activeWaitingCount = 0;
    if (!isWaitingListTableMissing) {
      const { count } = await supabase
        .from("waiting_list_entries")
        .select("id", { count: "exact", head: true })
        .eq("section_id", effectiveSectionId)
        .in("status", ["WAITING", "waiting"]);
      activeWaitingCount = count || 0;
    } else if (!isQueueEntriesTableMissing) {
      const { count } = await supabase
        .from("queue_entries")
        .select("id", { count: "exact", head: true })
        .eq("section_id", effectiveSectionId)
        .in("status", ["waiting", "WAITING"]);
      activeWaitingCount = count || 0;
    } else if (branchProgress?.waitlist_entries) {
      const list = (branchProgress.waitlist_entries as any[]).filter(
        (w) => w.section_id === effectiveSectionId && w.status === "WAITING"
      );
      activeWaitingCount = list.length;
    }

    const initialPosition = activeWaitingCount + 1;
    const estimatedWaitMinutes = calculateEstimatedWaitTime(initialPosition);

    // 7. Insert record into waiting_list_entries (or fallback to queue_entries or branch metadata)
    const insertPayload: any = {
      branch_id: branchId,
      section_id: effectiveSectionId,
      queue_token: tokenNumber,
      customer_name: guest_name,
      mobile_number: phone_number,
      guest_count: party_size,
      special_request: special_request || null,
      notes: special_request || null,
      device_token: device_token,
      registration_method: "CUSTOMER_SELF",
      created_by_name: "Customer Self-Service",
      status: "WAITING",
    };

    let newEntry: any = null;
    let didFallbackToQueueEntries = isWaitingListTableMissing;

    if (!isWaitingListTableMissing) {
      const { data: inserted, error: insertErr } = await supabase
        .from("waiting_list_entries")
        .insert(insertPayload)
        .select()
        .single();

      if (insertErr) {
        if (insertErr.message?.includes("table") || insertErr.message?.includes("schema cache")) {
          didFallbackToQueueEntries = true;
        } else if (insertErr.message?.includes("column")) {
          delete insertPayload.device_token;
          delete insertPayload.special_request;
          const { data: fbInserted, error: fbErr } = await supabase
            .from("waiting_list_entries")
            .insert(insertPayload)
            .select()
            .single();

          if (fbErr || !fbInserted) {
            didFallbackToQueueEntries = true;
          } else {
            newEntry = fbInserted;
          }
        } else {
          didFallbackToQueueEntries = true;
        }
      } else {
        newEntry = inserted;
      }
    }

    // Zero-Downtime Fallback 1: insert directly into queue_entries
    let didFallbackToJsonb = false;
    if (didFallbackToQueueEntries && !newEntry) {
      const { data: qeInserted, error: qeErr } = await supabase
        .from("queue_entries")
        .insert({
          branch_id: branchId,
          section_id: effectiveSectionId,
          customer_name: guest_name,
          guest_name: guest_name,
          phone: phone_number,
          guest_mobile: phone_number,
          party_size: party_size,
          token_number: tokenNumber,
          queue_number: tokenNumber,
          status: "waiting",
          registered_by: "Customer Self-Service",
          device_token: device_token,
          special_request: special_request || null,
        })
        .select()
        .single();

      if (qeErr && (qeErr.message?.includes("table") || qeErr.message?.includes("schema cache"))) {
        didFallbackToJsonb = true;
      } else if (!qeErr && qeInserted) {
        newEntry = {
          id: qeInserted.id,
          created_at: qeInserted.created_at || new Date().toISOString(),
        };
      } else {
        didFallbackToJsonb = true;
      }
    }

    // Zero-Downtime Fallback 2 (ADR-045): store in branch.onboarding_progress.waitlist_entries
    if (didFallbackToJsonb || !newEntry) {
      const entryId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const record = {
        id: entryId,
        branch_id: branchId,
        section_id: effectiveSectionId,
        queue_token: tokenNumber,
        customer_name: guest_name,
        mobile_number: phone_number,
        guest_count: party_size,
        special_request: special_request || null,
        device_token: device_token,
        status: "WAITING",
        created_at: createdAt,
      };

      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("id, onboarding_progress")
          .eq("id", branchId)
          .single();

        const currentProg = bData?.onboarding_progress || {};
        const currentEntries = currentProg.waitlist_entries || [];
        currentEntries.push(record);
        currentProg.waitlist_entries = currentEntries;

        await supabase
          .from("branches")
          .update({ onboarding_progress: currentProg })
          .eq("id", branchId);

        newEntry = { id: entryId, created_at: createdAt };
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: err?.message || "Failed to persist waitlist queue entry." },
          { status: 500 }
        );
      }
    } else {
      // If waiting_list_entries succeeded, also sync to shadow queue_entries
      try {
        await supabase.from("queue_entries").insert({
          id: newEntry.id,
          branch_id: branchId,
          section_id: effectiveSectionId,
          customer_name: guest_name,
          guest_name: guest_name,
          phone: phone_number,
          guest_mobile: phone_number,
          party_size: party_size,
          token_number: tokenNumber,
          queue_number: tokenNumber,
          status: "waiting",
          registered_by: "Customer Self-Service",
          device_token: device_token,
          special_request: special_request || null,
        });
      } catch {
        // non-blocking sync
      }
    }

    // 8. Log audit events
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: newEntry.id,
        event_type: "WAITLIST_ENTRY_CREATED",
        actor_name: "Customer",
        note: `Self-registered via Waitlist QR: Token ${tokenNumber} (Party of ${party_size})`,
        state_diff: {
          token_number: tokenNumber,
          party_size: party_size,
          position: initialPosition,
          special_request: special_request || null,
          source: "Waitlist QR",
        },
      });
    } catch {
      // Non-blocking telemetry
    }

    try {
      await supabase.from("activity_log").insert({
        entity_type: "waitlist_entry",
        entity_id: newEntry.id,
        action: "created",
        actor_type: "customer",
        actor_name: "Customer",
        note: `Waitlist QR registration: ${tokenNumber}`,
      });
    } catch {
      // Non-blocking telemetry
    }

    // 9. Return HTTP 201 Created
    return NextResponse.json(
      {
        success: true,
        device_token: device_token,
        waitlist_entry_id: newEntry.id,
        entry: {
          id: newEntry.id,
          token_number: tokenNumber,
          guest_name: guest_name,
          phone_number: phone_number,
          party_size: party_size,
          special_request: special_request || null,
          position: initialPosition,
          parties_ahead: Math.max(0, initialPosition - 1),
          section_name: resolvedSection.name,
          estimated_wait_minutes: estimatedWaitMinutes,
          status: "WAITING",
          created_at: newEntry.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
