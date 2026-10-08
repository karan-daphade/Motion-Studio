"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  QrCode, 
  Users, 
  Phone, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  MapPin, 
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  ShieldAlert,
  UserX,
  X
} from "lucide-react";
import { appName } from "@/config/branding";
import { createClient } from "@/lib/supabase/client";
import UnifiedDiningSessionPanel, { DiningSessionData } from "@/components/operations/panels/UnifiedDiningSessionPanel";

interface TableScanData {
  id: string;
  name: string;
  label: string;
  seatingCapacity: number;
  status: string;
  branchId: string;
  branchName?: string;
  sectionId?: string;
  sectionName?: string;
  activeSessionId?: string | null;
}

interface TableQRScanClientProps {
  initialStatus: "AVAILABLE" | "OCCUPIED" | "HELD";
  table: TableScanData;
}

const STORAGE_DEVICE_TOKEN_KEY = "bharatqr_device_token";
const STORAGE_ACTIVE_REQUEST_KEY = "bharatqr_table_request_id";
const STORAGE_ACTIVE_SESSION_KEY = "bharatqr_active_table_session";

function formatTableLabel(lbl?: string): string {
  if (!lbl) return "Table";
  const trimmed = lbl.trim();
  const stripped = trimmed.replace(/^(table\s*)+/i, "").trim();
  return stripped ? `Table ${stripped}` : "Table";
}

const formatTableDisplay = formatTableLabel;

export default function TableQRScanClient({
  initialStatus,
  table,
}: TableQRScanClientProps) {
  // Client state
  const [operationalStatus, setOperationalStatus] = useState<"AVAILABLE" | "OCCUPIED" | "HELD">(initialStatus);
  const [deviceToken, setDeviceToken] = useState<string>("");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  // Request Form fields
  const [guestName, setGuestName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Waiting screen & Decision state
  const [approvalStatus, setApprovalStatus] = useState<"IDLE" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED">("IDLE");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [diningSession, setDiningSession] = useState<DiningSessionData | null>(null);
  const [waitTimer, setWaitTimer] = useState<number>(0);
  const [showApprovalBanner, setShowApprovalBanner] = useState<boolean>(true);
  const [moderationStatus, setModerationStatus] = useState<"NONE" | "REMOVED" | "BLOCKED">("NONE");

  // Server verification: Check live status for this device and table on mount, refocus, or realtime events
  const verifyDeviceSession = useCallback(async (tokenParam?: string, reqIdParam?: string) => {
    const token = tokenParam || deviceToken || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY) : null);
    const reqId = reqIdParam || activeRequestId || (typeof window !== "undefined" ? localStorage.getItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`) : null);

    if (!token && !reqId) return;

    // Check device moderation status first (Story 15.7)
    if (token && table.id) {
      try {
        const modRes = await fetch(`/api/v1/public/session/validate-device?table_id=${table.id}&device_token=${token}&branch_id=${table.branchId || ""}`, {
          headers: { "x-device-token": token },
        });
        const modData = await modRes.json();
        if (modData.status === "REMOVED") {
          setModerationStatus("REMOVED");
          if (typeof window !== "undefined") {
            localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
          }
          return;
        }
        if (modData.status === "BLOCKED") {
          setModerationStatus("BLOCKED");
          if (typeof window !== "undefined") {
            localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
          }
          return;
        }
      } catch {}
    }

    try {
      const q = new URLSearchParams();
      if (reqId) q.set("request_id", reqId);
      if (token) q.set("device_token", token);
      if (table.id) q.set("table_id", table.id);

      const res = await fetch(`/api/v1/public/table-access/status?${q.toString()}`, {
        headers: {
          "x-device-token": token || "",
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.status === "APPROVED" && data.session) {
          const activeSess: DiningSessionData = {
            id: data.session.id,
            table_id: data.session.table_id || table.id,
            table_label: data.session.table_label || table.label,
            customer_name: data.session.customer_name || guestName || "Guest",
            guest_count: data.session.guest_count || partySize,
            started_at: data.session.started_at || new Date().toISOString(),
            branch_name: table.branchName,
            section_name: table.sectionName,
          };
          setApprovalStatus("APPROVED");
          setDiningSession(activeSess);
          if (activeSess.started_at && Date.now() - new Date(activeSess.started_at).getTime() > 20000) {
            setShowApprovalBanner(false);
          }
          if (typeof window !== "undefined") {
            localStorage.setItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`, JSON.stringify(activeSess));
            localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
          }
        } else if (data.status === "PENDING_APPROVAL") {
          setApprovalStatus("PENDING_APPROVAL");
        } else if (data.status === "REJECTED") {
          setApprovalStatus("REJECTED");
          setRejectionReason(data.rejection_reason || null);
          if (typeof window !== "undefined") {
            localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
            localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
          }
        }
      } else if (res.status === 404 || !data.success) {
        // Table session ended or access request no longer exists: cleanly reset client
        if (typeof window !== "undefined") {
          localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
          localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
        }
        setDiningSession(null);
        setApprovalStatus("IDLE");
        if (initialStatus !== "OCCUPIED") {
          setOperationalStatus("AVAILABLE");
        }
      }
    } catch {
      // network error: keep existing state
    }
  }, [table.id, table.label, table.branchName, table.sectionName, deviceToken, activeRequestId, guestName, partySize, initialStatus]);

  // 1. Initialize anonymous device token and restore active session / request on mount / refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    let token = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
    if (!token) {
      token = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_DEVICE_TOKEN_KEY, token);
    }
    setDeviceToken(token);

    // Fast-path: Check if there's a cached active session stored locally
    const cachedSessionJson = localStorage.getItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
    if (cachedSessionJson) {
      try {
        const cached = JSON.parse(cachedSessionJson);
        if (cached && cached.id) {
          setDiningSession(cached);
          setApprovalStatus("APPROVED");
          if (cached.started_at && Date.now() - new Date(cached.started_at).getTime() > 20000) {
            setShowApprovalBanner(false);
          }
        }
      } catch {}
    }

    // Check if there's an ongoing active request stored locally
    const storedReqId = localStorage.getItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
    if (storedReqId && !cachedSessionJson) {
      setActiveRequestId(storedReqId);
      setApprovalStatus("PENDING_APPROVAL");
    }

    verifyDeviceSession(token, storedReqId || undefined);
  }, [table.id, verifyDeviceSession]);

  // 2. Poll live status when in PENDING_APPROVAL
  const checkRequestStatus = async (reqId?: string) => {
    const idToCheck = reqId || activeRequestId;
    if (!idToCheck && !deviceToken) return;

    try {
      const q = new URLSearchParams();
      if (idToCheck) q.set("request_id", idToCheck);
      if (deviceToken) q.set("device_token", deviceToken);
      if (table.id) q.set("table_id", table.id);

      const res = await fetch(`/api/v1/public/table-access/status?${q.toString()}`, {
        headers: {
          "x-device-token": deviceToken,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.status === "APPROVED") {
          setApprovalStatus("APPROVED");
          if (data.session) {
            const activeSess: DiningSessionData = {
              id: data.session.id,
              table_id: data.session.table_id || table.id,
              table_label: data.session.table_label || table.label,
              customer_name: data.session.customer_name || guestName,
              guest_count: data.session.guest_count || partySize,
              started_at: data.session.started_at || new Date().toISOString(),
              branch_name: table.branchName,
              section_name: table.sectionName,
            };
            setDiningSession(activeSess);
            if (typeof window !== "undefined") {
              localStorage.setItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`, JSON.stringify(activeSess));
              localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
            }
          }
        } else if (data.status === "REJECTED") {
          setApprovalStatus("REJECTED");
          setRejectionReason(data.rejection_reason || null);
          if (typeof window !== "undefined") {
            localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
            localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
          }
        } else if (data.status === "PENDING_APPROVAL") {
          setApprovalStatus("PENDING_APPROVAL");
        }
      }
    } catch (err) {
      // Ignored
    }
  };

  useEffect(() => {
    if (approvalStatus !== "PENDING_APPROVAL") return;

    // Initial check on entering pending approval
    checkRequestStatus();

    // Smooth UI seconds ticker (pure client calculation, zero network calls)
    const uiTickInterval = setInterval(() => {
      setWaitTimer((prev) => prev + 1);
    }, 1000);

    // Passive safety fallback check every 25s (reduced from 3s aggressive poll)
    const passiveFallback = setInterval(() => {
      checkRequestStatus();
    }, 25000);

    // Recheck immediately if network reconnects
    const handleOnline = () => checkRequestStatus();
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(uiTickInterval);
      clearInterval(passiveFallback);
      window.removeEventListener("online", handleOnline);
    };
  }, [approvalStatus, activeRequestId, deviceToken, table.id]);

  // 3. Supabase Realtime channel subscription for instant approval/rejection while waiting
  useEffect(() => {
    if (approvalStatus !== "PENDING_APPROVAL" || !table.branchId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`table_access_${table.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "table_access_requests",
          filter: `table_id=eq.${table.id}`,
        },
        (payload: any) => {
          const updated = payload.new;
          if (updated && (updated.id === activeRequestId || updated.device_token === deviceToken)) {
            if (updated.status === "APPROVED") {
              checkRequestStatus(updated.id);
            } else if (updated.status === "REJECTED") {
              setApprovalStatus("REJECTED");
              setRejectionReason(updated.rejection_reason || null);
              if (typeof window !== "undefined") {
                localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
              }
            }
          }
        }
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          checkRequestStatus();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [approvalStatus, activeRequestId, deviceToken, table.id, table.branchId]);

  // 3b. Realtime channel subscription for table release / session termination when dining is active
  useEffect(() => {
    if (approvalStatus !== "APPROVED") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`table_session_state_${table.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "table_sessions",
          filter: `table_id=eq.${table.id}`,
        },
        (payload: any) => {
          if (payload.new?.status === "closed") {
            if (typeof window !== "undefined") {
              localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
              localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
            }
            setDiningSession(null);
            setApprovalStatus("IDLE");
            setOperationalStatus("AVAILABLE");
          } else {
            verifyDeviceSession();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tables",
          filter: `id=eq.${table.id}`,
        },
        (payload: any) => {
          if (payload.new?.status === "active") {
            verifyDeviceSession();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_devices",
        },
        (payload: any) => {
          const dev = payload.new;
          if (dev && dev.device_token === deviceToken) {
            if (dev.status === "REMOVED") {
              setModerationStatus("REMOVED");
              if (typeof window !== "undefined") {
                localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
              }
            } else if (dev.status === "BLOCKED") {
              setModerationStatus("BLOCKED");
              if (typeof window !== "undefined") {
                localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
              }
            }
          }
        }
      )
      .subscribe();

    // Passive safety heartbeat every 30s while session is active
    const passiveHeartbeat = setInterval(() => {
      verifyDeviceSession();
    }, 30000);

    // Recheck immediately on window focus or reconnect
    const handleFocusOrOnline = () => verifyDeviceSession();
    window.addEventListener("focus", handleFocusOrOnline);
    window.addEventListener("online", handleFocusOrOnline);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(passiveHeartbeat);
      window.removeEventListener("focus", handleFocusOrOnline);
      window.removeEventListener("online", handleFocusOrOnline);
    };
  }, [approvalStatus, table.id, verifyDeviceSession]);

  // Auto-dismiss the celebratory "Access Approved" banner after 20 seconds
  useEffect(() => {
    if (approvalStatus !== "APPROVED" || !showApprovalBanner) return;

    if (diningSession?.started_at) {
      const elapsed = Date.now() - new Date(diningSession.started_at).getTime();
      if (elapsed > 20000) {
        setShowApprovalBanner(false);
        return;
      }
      const remaining = Math.max(1000, 20000 - elapsed);
      const timer = setTimeout(() => {
        setShowApprovalBanner(false);
      }, remaining);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowApprovalBanner(false);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [approvalStatus, diningSession?.started_at, showApprovalBanner]);

  // 4. Handle Request Form Submission (Story 15.6 Section 4 Step 2)
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate inputs
    const errors: { [key: string]: string } = {};
    const trimmedName = guestName.trim();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = "Please enter your name (at least 2 letters).";
    }

    const indianRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !indianRegex.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number (starts with 6-9).";
    }

    if (!partySize || partySize < 1 || partySize > 50) {
      errors.partySize = "Party size must be between 1 and 50 guests.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/public/table-access/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-token": deviceToken,
        },
        body: JSON.stringify({
          table_id: table.id,
          customer_name: trimmedName,
          customer_phone: cleanPhone,
          party_size: partySize,
          device_token: deviceToken,
          branch_id: table.branchId,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok && data?.success) {
        if (data.status === "APPROVED") {
          setApprovalStatus("APPROVED");
          if (data.session) {
            const sessObj: DiningSessionData = {
              id: data.session.id,
              table_id: data.session.table_id || table.id,
              table_label: data.session.table_label || table.label,
              customer_name: data.session.customer_name || trimmedName,
              guest_count: data.session.guest_count || partySize,
              started_at: data.session.started_at || new Date().toISOString(),
              branch_name: table.branchName,
              section_name: table.sectionName,
            };
            setDiningSession(sessObj);
            if (typeof window !== "undefined") {
              localStorage.setItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`, JSON.stringify(sessObj));
              localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
            }
          } else {
            checkRequestStatus(data.requestId);
          }
          return;
        }

        const reqId = data.request_id;
        setActiveRequestId(reqId);
        setApprovalStatus("PENDING_APPROVAL");
        if (typeof window !== "undefined") {
          localStorage.setItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`, reqId);
        }
      } else {
        setSubmitError(data?.error || (res.status === 404 ? "Table could not be verified in the restaurant system. Please ask staff for assistance." : "Failed to submit table request. Please ask a staff member."));
      }
    } catch {
      setSubmitError("Connection issue. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset flow
  const handleTryAgain = () => {
    setApprovalStatus("IDLE");
    setSubmitError(null);
    setRejectionReason(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${STORAGE_ACTIVE_REQUEST_KEY}_${table.id}`);
      localStorage.removeItem(`${STORAGE_ACTIVE_SESSION_KEY}_${table.id}`);
    }
  };

  return (
    <div className={`min-h-screen bg-brand-background flex flex-col ${
      approvalStatus === "APPROVED" && diningSession 
        ? "justify-start py-3 px-3 sm:py-5 sm:px-6" 
        : "justify-between py-6 px-4 sm:px-6 lg:px-8"
    }`}>
      {/* 1. BRAND & OUTLET HEADER */}
      {approvalStatus === "APPROVED" && diningSession ? (
        <header className="mx-auto w-full max-w-xl sm:max-w-2xl px-1 sm:px-2 mb-2 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="h-4.5 w-4.5 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-brand-secondary tracking-tight leading-tight">
                {table.branchName || "Restaurant Dining"}
              </h1>
              {table.sectionName && (
                <p className="text-xs text-brand-text-muted flex items-center gap-1 font-medium">
                  <MapPin className="h-3 w-3 text-brand-primary" />
                  <span>{table.sectionName}</span>
                </p>
              )}
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Session</span>
          </div>
        </header>
      ) : (
        <header className="mx-auto w-full text-center max-w-md px-3 sm:px-0 transition-all duration-300">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-border shadow-xs mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
            <span>{appName} Table Dining</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
            {table.branchName || "Restaurant Dining"}
          </h1>

          <p className="mt-1 text-xs text-brand-text-muted flex items-center justify-center gap-1.5 font-medium">
            {table.sectionName && (
              <>
                <MapPin className="h-3 w-3 text-brand-primary" />
                <span>{table.sectionName}</span>
                <span>•</span>
              </>
            )}
            <span className="font-bold text-brand-secondary">{formatTableLabel(table.label)}</span>
          </p>
        </header>
      )}

      {/* 2. MAIN WORKFLOW CONTAINER */}
      <main className={`mx-auto w-full transition-all duration-300 ${
        approvalStatus === "APPROVED" && diningSession 
          ? "max-w-xl sm:max-w-2xl px-0 sm:px-2 mt-1" 
          : "max-w-md px-3 sm:px-0 mt-5"
      }`}>
        {/* ========================================================================= */}
        {/* CASE MODERATION: DEVICE REMOVED OR BLOCKED BY STAFF (Story 15.7)          */}
        {/* ========================================================================= */}
        {moderationStatus === "BLOCKED" ? (
          <div className="rounded-3xl border-2 border-red-300 bg-white p-6 sm:p-8 text-center shadow-brandCard animate-in zoom-in-95 duration-200 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-4 ring-red-100">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 text-[10px] font-black uppercase tracking-wider mb-2">
                1-Hour Outlet Ban Active
              </span>
              <h2 className="text-xl font-black text-brand-secondary tracking-tight">
                Access Temporarily Restricted
              </h2>
              <p className="text-xs text-red-700 font-semibold mt-1">
                Your device has been restricted by restaurant staff for 1 hour.
              </p>
            </div>

            <p className="text-[11px] text-brand-text-muted leading-relaxed">
              If you believe this restriction was made in error, please speak directly with a restaurant supervisor or floor manager.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover shadow-brandCard transition-all inline-block"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : moderationStatus === "REMOVED" ? (
          <div className="rounded-3xl border-2 border-amber-300 bg-white p-6 sm:p-8 text-center shadow-brandCard animate-in zoom-in-95 duration-200 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 ring-4 ring-amber-100">
              <UserX className="h-8 w-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-2">
                Session Access Ended
              </span>
              <h2 className="text-xl font-black text-brand-secondary tracking-tight">
                Removed From Session
              </h2>
              <p className="text-xs text-amber-800 font-semibold mt-1">
                You have been removed from this dining session by restaurant staff.
              </p>
            </div>

            <p className="text-[11px] text-brand-text-muted leading-relaxed">
              You are no longer connected to {formatTableLabel(table.label)}. If you wish to join again or need help, please ask your table host or staff.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover shadow-brandCard transition-all inline-block"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : approvalStatus === "APPROVED" && diningSession ? (
          <div className="animate-in zoom-in-95 duration-200 space-y-3">
            {/* Celebratory Banner (Auto-dismisses in 20s or on manual dismiss) */}
            {showApprovalBanner && (
              <div className="relative rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 p-3.5 sm:p-4 shadow-xs animate-in slide-in-from-top-2 duration-300 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="text-xs sm:text-sm font-black text-emerald-950">
                    Access Approved! Welcome to {formatTableLabel(table.label)}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-emerald-800 mt-0.5 leading-snug">
                    Your dining session is active. You can browse the menu, place orders, and call waitstaff.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApprovalBanner(false)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200/50 transition-colors"
                  aria-label="Dismiss banner"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Mirror of Staff Session Panel with Customer-Safe Permissions */}
            <UnifiedDiningSessionPanel
              session={diningSession}
              isCustomerView={true}
              branchName={table.branchName}
              onRefresh={() => checkRequestStatus()}
            />
          </div>
        ) : approvalStatus === "REJECTED" ? (
          /* ========================================================================= */
          /* CASE B: REJECTED STATE (Story 15.6 Section 5 Path B)                      */
          /* ========================================================================= */
          <div className="rounded-3xl border-2 border-rose-300 bg-white p-6 sm:p-8 text-center shadow-brandCard animate-in zoom-in-95 duration-200 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 ring-4 ring-rose-100">
              <XCircle className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-brand-secondary tracking-tight">
                Request Declined
              </h2>
              <p className="text-xs text-rose-700 font-semibold mt-1">
                Please contact restaurant staff for assistance.
              </p>
            </div>

            {rejectionReason && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <span className="font-bold">Reason: </span>
                <span>{rejectionReason}</span>
              </div>
            )}

            <p className="text-[11px] text-brand-text-muted leading-relaxed">
              {formatTableLabel(table.label)} could not be allocated at this moment (e.g. reserved or shifted). Please speak with our floor host or try another table.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTryAgain}
                className="w-full py-3 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover shadow-brandCard transition-all"
              >
                Try Requesting Again
              </button>

              <Link
                href="/"
                className="w-full py-2.5 text-xs text-brand-text-muted hover:text-brand-secondary font-medium transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : approvalStatus === "PENDING_APPROVAL" ? (
          /* ========================================================================= */
          /* CASE C: WAITING SCREEN (Story 15.6 Section 4 Step 3)                      */
          /* ========================================================================= */
          <div className="rounded-3xl border-2 border-brand-primary/40 bg-white p-6 sm:p-8 text-center shadow-brandCard animate-in zoom-in-95 duration-200 space-y-5">
            {/* Pulsing Wait Indicator */}
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
              <Clock className="h-8 w-8 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-primary" />
              </span>
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                Request Submitted
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                Waiting For Staff Approval
              </h2>

              <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs mx-auto">
                Please wait at <span className="font-bold text-brand-secondary">{formatTableLabel(table.label)}</span>.
                A staff member will approve your table access shortly.
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 rounded-2xl bg-brand-surface-muted border border-brand-border/80 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-brand-text-muted">Table:</span>
                <span className="font-black text-brand-secondary">{formatTableLabel(table.label)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-text-muted">Guest:</span>
                <span className="font-bold text-brand-secondary">{guestName || "Guest"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-text-muted">Party Size:</span>
                <span className="font-bold text-brand-secondary">{partySize} {partySize === 1 ? "Guest" : "Guests"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-text-muted">Mobile:</span>
                <span className="font-mono font-bold text-brand-secondary">+91 {phone}</span>
              </div>
            </div>

            {/* Heartbeat notification */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-brand-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
              <span>Checking real-time updates every 3 seconds...</span>
            </div>

            <button
              type="button"
              onClick={() => checkRequestStatus()}
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-brand-border bg-white text-[11px] font-bold text-brand-text-secondary hover:bg-brand-surface-muted transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Status Now</span>
            </button>
          </div>
        ) : operationalStatus === "OCCUPIED" ? (
          /* ========================================================================= */
          /* CASE D: TABLE OCCUPIED ON SCAN (Story 15.7 Workflow 1 Guided Notice)      */
          /* ========================================================================= */
          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 text-center shadow-brandCard space-y-4 animate-in zoom-in-95 duration-200">
            {/* Table Badge */}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-900 border border-amber-200">
              <UtensilsCrossed className="h-3.5 w-3.5 text-amber-800 shrink-0" />
              <span>{formatTableLabel(table.label)}</span>
              <span>•</span>
              <span className="font-semibold text-amber-800">Occupied</span>
            </div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-brand-secondary">
                Table Currently Occupied
              </h2>
              <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
                Table is currently occupied. If joining, ask your host to share session QR.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-surface-muted border border-brand-border/60 text-xs text-left space-y-1.5">
              <p className="font-bold text-brand-secondary">Are you joining a seated party?</p>
              <p className="text-[11px] text-brand-text-secondary">
                Ask the host (primary seated guest) to tap &ldquo;Session QR&rdquo; on their dining screen so you can join immediately.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
              >
                <span>Close</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE E: WELCOME SCREEN & ACCESS REQUEST FORM (Available Table)            */
          /* ========================================================================= */
          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard text-left space-y-5">
            {/* Table Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary-light px-4 py-2 text-xs font-black text-brand-primary border border-brand-primary/30 mb-2">
                <UtensilsCrossed className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>{formatTableLabel(table.label)}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-brand-secondary">
                  <Users className="h-3 w-3" />
                  Up to {table.seatingCapacity} Seater
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                Welcome to {table.branchName || "Our Restaurant"}
              </h2>

              <p className="text-xs text-brand-text-secondary mt-1 max-w-xs mx-auto">
                Please enter your details to request table activation. Our staff will approve access right away.
              </p>
            </div>

            {submitError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Request Form */}
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* 1. Guest Name */}
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Guest Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary outline-none transition-all ${
                    formErrors.name
                      ? "border-rose-300 ring-2 ring-rose-200"
                      : "border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* 2. Mobile Number (10-digit Indian: ^[6-9]\d{9}$) */}
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 flex items-center gap-1 text-xs font-bold text-brand-text-muted pointer-events-none">
                    <Phone className="h-3.5 w-3.5" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" }));
                    }}
                    placeholder="9876543210"
                    className={`w-full rounded-xl border bg-white pl-14 pr-3.5 py-2.5 text-xs text-brand-text-primary font-mono outline-none transition-all ${
                      formErrors.phone
                        ? "border-rose-300 ring-2 ring-rose-200"
                        : "border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    }`}
                  />
                </div>
                {formErrors.phone ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.phone}</p>
                ) : (
                  <p className="text-[10px] text-brand-text-muted mt-1">
                    No OTP required. Used for staff verification and bill invoice.
                  </p>
                )}
              </div>

              {/* 3. Party Size */}
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Party Size <span className="text-rose-500">*</span>
                </label>

                {/* Quick selection chips 1..6 */}
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setPartySize(num);
                        if (formErrors.partySize) setFormErrors((p) => ({ ...p, partySize: "" }));
                      }}
                      className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                        partySize === num
                          ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                          : "bg-brand-surface-muted/60 text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
                      }`}
                    >
                      {num === 6 ? "6+" : num}
                    </button>
                  ))}
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                    className="h-9 w-9 rounded-xl border border-brand-border bg-white text-base font-bold text-brand-secondary hover:bg-brand-surface-muted flex items-center justify-center transition-all select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={partySize}
                    onChange={(e) => {
                      const val = Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1));
                      setPartySize(val);
                    }}
                    className="flex-1 rounded-xl border border-brand-border bg-white px-3 py-2 text-center text-xs font-bold text-brand-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setPartySize((p) => Math.min(50, p + 1))}
                    className="h-9 w-9 rounded-xl border border-brand-border bg-white text-base font-bold text-brand-secondary hover:bg-brand-surface-muted flex items-center justify-center transition-all select-none"
                  >
                    +
                  </button>
                </div>
                {formErrors.partySize && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.partySize}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-xs font-black text-white shadow-brandCard hover:bg-brand-primary-hover transition-all disabled:opacity-50 select-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Requesting Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Table Session</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="text-center text-[11px] text-brand-text-muted mt-8">
        Powered by {appName}
      </footer>
    </div>
  );
}
