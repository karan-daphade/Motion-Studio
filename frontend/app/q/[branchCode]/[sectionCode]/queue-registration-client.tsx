"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { appName } from "@/config/branding";
import { 
  Ticket, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Radio, 
  Sparkles,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  RefreshCw,
  PartyPopper,
  XCircle,
  Phone
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface QueueRegistrationClientProps {
  branchId?: string;
  restaurantId?: string;
  sectionId: string;
  branchCode?: string;
  sectionCode?: string;
  branchName: string;
  branchCity?: string | null;
  sectionName: string;
  unitLabel: string;
}

interface ActiveQueueEntry {
  id: string;
  token_number: string;
  guest_name: string;
  phone_number?: string;
  party_size: number;
  special_request?: string | null;
  position: number;
  estimated_wait_minutes: number;
  status: string; // 'WAITING' | 'TABLE_ASSIGNED' | 'NO_SHOW' | 'REMOVED'
  assigned_table_label?: string | null;
  assigned_at?: string | null;
  created_at: string;
}

const STORAGE_KEY = "bharatqr_device_token";

/**
 * Returns or generates a persistent device token from localStorage, scoped per section.
 */
function getOrCreateDeviceToken(sectionId?: string): string {
  if (typeof window === "undefined") return "";
  try {
    const sectionKey = sectionId ? `bharatqr_device_token_${sectionId}` : STORAGE_KEY;
    let token = localStorage.getItem(sectionKey);
    if (!token) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        token = crypto.randomUUID();
      } else {
        token = `bqr_dev_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      }
      localStorage.setItem(sectionKey, token);
    }
    return token;
  } catch {
    return `bqr_dev_fallback_${Date.now()}`;
  }
}

export default function QueueRegistrationClient({
  branchId,
  restaurantId,
  sectionId,
  branchName,
  branchCity,
  sectionName,
  unitLabel,
}: QueueRegistrationClientProps) {
  // Device & Status state
  const [deviceToken, setDeviceToken] = useState<string>("");
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [activeEntry, setActiveEntry] = useState<ActiveQueueEntry | null>(null);

  // Form state
  const [guestName, setGuestName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    guestName?: string;
    phone?: string;
    partySize?: string;
    specialRequest?: string;
    general?: string;
  }>({});

  const [, startTransition] = useTransition();

  // 1. Status Checker Function
  const fetchStatus = useCallback(async (tokenParam?: string) => {
    const token = tokenParam || deviceToken || getOrCreateDeviceToken(sectionId);
    if (!token) return;

    try {
      const url = new URL("/api/waitlist/status", window.location.origin);
      url.searchParams.set("device_token", token);
      if (sectionId) url.searchParams.set("section_id", sectionId);
      if (branchId) url.searchParams.set("branch_id", branchId);
      if (restaurantId) url.searchParams.set("restaurant_id", restaurantId);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.has_active_entry && json.entry) {
          // Verify section match
          if (!sectionId || !json.entry.section_id || json.entry.section_id === sectionId) {
            setActiveEntry(json.entry);
          } else {
            setActiveEntry(null);
          }
        } else {
          setActiveEntry(null);
        }
      }
    } catch (err) {
      console.warn("Failed to check waitlist status:", err);
    }
  }, [sectionId, branchId, restaurantId, deviceToken]);

  // Initial mount: asynchronously resolve token and status
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const token = getOrCreateDeviceToken(sectionId);
      try {
        const url = new URL("/api/waitlist/status", window.location.origin);
        url.searchParams.set("device_token", token);
        if (sectionId) url.searchParams.set("section_id", sectionId);
        if (branchId) url.searchParams.set("branch_id", branchId);
        if (restaurantId) url.searchParams.set("restaurant_id", restaurantId);

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.has_active_entry && json.entry) {
            setActiveEntry(json.entry);
          } else {
            setActiveEntry(null);
          }
        }
      } catch (err) {
        console.warn("Failed to check waitlist status:", err);
      } finally {
        if (isMounted) {
          setDeviceToken(token);
          setIsLoadingStatus(false);
        }
      }
    }

    void initializeSession();

    return () => {
      isMounted = false;
    };
  }, [sectionId, branchId, restaurantId]);

  // 2. Supabase Realtime Subscription: auto-updates queue position without page refresh
  useEffect(() => {
    if (!activeEntry?.id || !sectionId) return;

    let supabase: any = null;
    try {
      supabase = createClient();
      const channel = supabase
        .channel(`waitlist_live_${sectionId}`)
        // Listen to changes on waiting_list_entries
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "waiting_list_entries",
          },
          (payload: any) => {
            // If our own entry updated (e.g. table assigned, status change)
            if (payload.new && payload.new.id === activeEntry.id) {
              const updatedStatus = (payload.new.status || "").toUpperCase();
              startTransition(() => {
                setActiveEntry((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: updatedStatus,
                        assigned_table_label: payload.new.assigned_table_label ?? (updatedStatus === "WAITING" ? null : prev.assigned_table_label),
                        assigned_at: payload.new.assigned_at ?? (updatedStatus === "WAITING" ? null : prev.assigned_at),
                        position: updatedStatus === "TABLE_ASSIGNED" ? 0 : prev.position,
                        estimated_wait_minutes: updatedStatus === "TABLE_ASSIGNED" ? 0 : prev.estimated_wait_minutes,
                      }
                    : null
                );
              });

              // If assignment was cancelled and rolled back to WAITING, re-fetch status to restore queue position and wait time
              if (updatedStatus === "WAITING") {
                if (deviceToken) {
                  fetchStatus(deviceToken);
                }
              }
            } else {
              // Any other entry changed status or joined, refresh our dynamic queue position
              if (deviceToken) {
                fetchStatus(deviceToken);
              }
            }
          }
        )
        // Also listen to shadow queue_entries for backward compatibility
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "queue_entries",
            filter: `id=eq.${activeEntry.id}`,
          },
          (payload: any) => {
            if (payload.new?.status) {
              const st = (payload.new.status || "").toUpperCase();
              const mapped = st === "ASSIGNED" ? "TABLE_ASSIGNED" : st;
              startTransition(() => {
                setActiveEntry((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: mapped,
                        assigned_table_label: payload.new.assigned_table_label ?? (mapped === "WAITING" ? null : prev.assigned_table_label),
                        position: mapped === "TABLE_ASSIGNED" ? 0 : prev.position,
                      }
                    : null
                );
              });
              if (mapped === "WAITING" && deviceToken) {
                fetchStatus(deviceToken);
              }
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Realtime subscription fallback:", err);
    }
  }, [activeEntry?.id, sectionId, deviceToken, fetchStatus]);

  // 3. Client Validation
  const validateForm = () => {
    const errors: {
      guestName?: string;
      phone?: string;
      partySize?: string;
      specialRequest?: string;
    } = {};

    const cleanName = guestName.trim();
    if (!cleanName || cleanName.length < 2) {
      errors.guestName = "Please enter your name (at least 2 letters).";
    } else if (cleanName.length > 100) {
      errors.guestName = "Name cannot exceed 100 characters.";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.phone = "Mobile phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).";
    }

    if (!partySize || partySize < 1 || partySize > 50) {
      errors.partySize = "Party size must be between 1 and 50 guests.";
    }

    if (specialRequest.trim().length > 250) {
      errors.specialRequest = "Special request cannot exceed 250 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 4. Form Submit with Double-Click/Spam Debounce
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors({});

    const cleanPhone = phone.replace(/\D/g, "");
    const token = deviceToken || getOrCreateDeviceToken(sectionId);

    try {
      const response = await fetch("/api/waitlist/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId || branchId,
          branch_id: branchId,
          section_id: sectionId,
          device_token: token,
          guest_name: guestName.trim(),
          phone_number: cleanPhone,
          party_size: partySize,
          special_request: specialRequest.trim() || null,
        }),
      });

      const res = await response.json();

      if (response.status === 201 && res.success && res.entry) {
        setActiveEntry(res.entry);
        try {
          const sectionKey = sectionId ? `bharatqr_device_token_${sectionId}` : STORAGE_KEY;
          localStorage.setItem(sectionKey, token);
        } catch {}
      } else if (response.status === 409 && res.has_active_entry && res.entry) {
        // Already registered, redirect to live active state
        setActiveEntry(res.entry);
      } else {
        setFormErrors({
          general: res.error || "Failed to register. Please check with restaurant staff.",
        });
      }
    } catch (err: any) {
      setFormErrors({
        general: err?.message || "An unexpected network error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Handle Reset (when seated or left)
  const handleResetSession = () => {
    // Generate fresh device token to allow new registration scoped to this section
    try {
      const newToken = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `bqr_dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const sectionKey = sectionId ? `bharatqr_device_token_${sectionId}` : STORAGE_KEY;
      localStorage.setItem(sectionKey, newToken);
      setDeviceToken(newToken);
    } catch {}
    setActiveEntry(null);
    setGuestName("");
    setPhone("");
    setPartySize(2);
    setSpecialRequest("");
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Brand & Outlet Header */}
      <header className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-border shadow-xs mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          <span>{appName} Live Waitlist</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
          {branchName}
        </h1>

        <p className="mt-1 text-xs text-brand-text-muted flex items-center justify-center gap-1.5">
          {branchCity && (
            <>
              <MapPin className="h-3 w-3" />
              <span>{branchCity}</span>
              <span>•</span>
            </>
          )}
          <span className="font-semibold text-brand-text-secondary">{sectionName}</span>
        </p>
      </header>

      {/* Main Content Area */}
      <main className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
          {isLoadingStatus ? (
            /* Loading State */
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-3" />
              <p className="text-xs font-medium text-brand-text-muted">
                Checking waitlist status...
              </p>
            </div>
          ) : activeEntry ? (
            /* ========================================================================= */
            /* 1. Queue Status Live View (Active Registration)                          */
            /* ========================================================================= */
            <div className="text-center animate-in fade-in zoom-in-95 duration-200">
              {activeEntry.status === "TABLE_ASSIGNED" ? (
                /* Table Assigned Celebration View */
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3 shadow-xs">
                    <PartyPopper className="h-7 w-7 animate-bounce" />
                  </div>

                  <h2 className="text-lg font-black text-emerald-700">
                    Your Table is Ready!
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-1">
                    Please proceed to the host desk with your token number.
                  </p>
                </div>
              ) : activeEntry.status === "NO_SHOW" || activeEntry.status === "REMOVED" ? (
                /* Inactive / Cancelled View */
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-3 shadow-xs">
                    <XCircle className="h-7 w-7" />
                  </div>

                  <h2 className="text-base font-bold text-rose-700">
                    {activeEntry.status === "NO_SHOW" ? "Marked as No-Show" : "Queue Entry Closed"}
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-1">
                    Your waiting list token has been closed. You may join the queue again if needed.
                  </p>
                </div>
              ) : (
                /* Waiting in Live Queue View */
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary border border-brand-primary/20 mb-3 shadow-xs">
                    <Ticket className="h-6 w-6" />
                  </div>

                  <h2 className="text-base font-bold text-brand-secondary">
                    You are in the queue!
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-0.5">
                    Live updates sync automatically. Keep this screen open.
                  </p>
                </div>
              )}

              {/* Big Token Number Display */}
              <div className="my-5 rounded-3xl bg-brand-surface-muted/90 border-2 border-brand-primary/30 p-5 sm:p-6 text-center shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                  Your Assigned Token
                </span>
                <div className="mt-1 text-4xl sm:text-5xl font-black tracking-tight text-brand-primary font-mono">
                  {activeEntry.token_number}
                </div>
                <div className="mt-2 text-xs font-semibold text-brand-secondary">
                  Section: {sectionName}
                </div>
              </div>

              {/* Live Position & Estimated Wait Indicator */}
              {activeEntry.status === "WAITING" && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Position Badge */}
                  <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary-light/50 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-brand-primary mb-1">
                      <Radio className="h-3.5 w-3.5 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Queue Position</span>
                    </div>
                    <div className="text-lg font-black text-brand-secondary">
                      #{activeEntry.position} in line
                    </div>
                  </div>

                  {/* Estimated Wait */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-700 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Est. Wait</span>
                    </div>
                    <div className="text-lg font-black text-amber-900">
                      ~{activeEntry.estimated_wait_minutes} mins
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badge / Table Assigned Card */}
              <div className="mb-5">
                {activeEntry.status === "TABLE_ASSIGNED" ? (
                  <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/90 to-emerald-100/50 p-6 text-center shadow-md animate-in zoom-in-95 duration-200">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-xs ring-4 ring-emerald-200/50">
                      <PartyPopper className="h-7 w-7 animate-bounce text-emerald-600" />
                    </div>
                    
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-3 py-0.5 rounded-full mb-1">
                      Seating Ready
                    </span>

                    <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                      Your Table Is Ready!
                    </h2>

                    {/* Directions CTA per Story 15.4 Section 4 */}
                    <div className="mt-3.5 p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                      <p className="text-xs font-semibold text-emerald-800">
                        Please proceed to:
                      </p>
                      <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                        Table {activeEntry.assigned_table_label || "Host Station"}
                      </div>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        or present your token #{activeEntry.token_number} at the reception
                      </p>
                    </div>
                  </div>
                ) : activeEntry.status === "NO_SHOW" ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Entry marked as No-Show by restaurant staff</span>
                  </div>
                ) : activeEntry.status === "REMOVED" ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 p-3 text-xs font-bold text-slate-700">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    <span>Entry cancelled or removed from waitlist</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary-light border border-brand-primary/30 p-3 text-xs font-bold text-brand-primary">
                    <Radio className="h-4 w-4 animate-pulse text-brand-primary" />
                    <span>Active — We will alert you when your table is ready</span>
                  </div>
                )}
              </div>

              {/* Guest Details Summary Card */}
              <div className="rounded-2xl border border-brand-border/80 bg-white p-4 text-left text-xs space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center text-brand-text-secondary">
                  <span className="text-brand-text-muted flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Guest Name:
                  </span>
                  <span className="font-bold text-brand-secondary">{activeEntry.guest_name}</span>
                </div>

                <div className="flex justify-between items-center text-brand-text-secondary">
                  <span className="text-brand-text-muted flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Party Size:
                  </span>
                  <span className="font-bold text-brand-secondary">
                    {activeEntry.party_size} {activeEntry.party_size === 1 ? "Guest" : "Guests"}
                  </span>
                </div>

                {activeEntry.special_request && (
                  <div className="flex justify-between items-start text-brand-text-secondary pt-1 border-t border-brand-border/40">
                    <span className="text-brand-text-muted flex items-center gap-1.5 shrink-0">
                      <MessageSquare className="h-3.5 w-3.5" /> Special Request:
                    </span>
                    <span className="font-medium text-brand-secondary text-right pl-3 italic">
                      &ldquo;{activeEntry.special_request}&rdquo;
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-brand-text-secondary pt-1.5 border-t border-brand-border/40">
                  <span className="text-brand-text-muted flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Registered:
                  </span>
                  <span className="font-mono text-[11px] text-brand-text-muted">
                    {new Date(activeEntry.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {activeEntry.status === "TABLE_ASSIGNED" && activeEntry.assigned_at && (
                  <div className="flex justify-between items-center text-emerald-900 pt-1.5 border-t border-brand-border/40 font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Assigned Time:
                    </span>
                    <span className="font-mono text-[11px] text-emerald-800">
                      {new Date(activeEntry.assigned_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => fetchStatus(deviceToken)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Position</span>
                </button>

                {(activeEntry.status === "TABLE_ASSIGNED" ||
                  activeEntry.status === "NO_SHOW" ||
                  activeEntry.status === "REMOVED") && (
                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-brandCard transition-all"
                  >
                    <span>Join Queue Again</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. Waitlist Registration Form View                                       */
            /* ========================================================================= */
            <div>
              <div className="mb-5 pb-4 border-b border-brand-border/60">
                <h2 className="text-base font-bold text-brand-secondary">
                  Join Waiting Queue
                </h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Enter your details to reserve a {unitLabel.toLowerCase()} in {sectionName}.
                </p>
              </div>

              {formErrors.general && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Guest Name */}
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-muted" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value);
                        if (formErrors.guestName) setFormErrors((p) => ({ ...p, guestName: undefined }));
                      }}
                      placeholder="e.g. Rahul Sharma"
                      maxLength={100}
                      className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2.5 text-xs text-brand-text-primary outline-none transition-all ${
                        formErrors.guestName
                          ? "border-rose-300 ring-2 ring-rose-200"
                          : "border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                      }`}
                    />
                  </div>
                  {formErrors.guestName && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.guestName}</p>
                  )}
                </div>

                {/* Mobile Phone (Indian standard: 10 digits starting with 6-9) */}
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Mobile Phone Number <span className="text-rose-500">*</span>
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
                        if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: undefined }));
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
                      We will announce or call this number when your table is ready.
                    </p>
                  )}
                </div>

                {/* Party Size Quick Pills & Stepper */}
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Party Size (Number of Guests) <span className="text-rose-500">*</span>
                  </label>

                  {/* Preset quick buttons 1..6 */}
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setPartySize(num);
                          if (formErrors.partySize) setFormErrors((p) => ({ ...p, partySize: undefined }));
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

                  {/* Stepper for fine-tuning & larger parties */}
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

                {/* Special Request (Max 250 with Counter) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-brand-secondary">
                      Special Request <span className="text-[10px] font-normal text-brand-text-muted">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-brand-text-muted font-mono">
                      {specialRequest.length}/250
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={250}
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="e.g. Window seat, baby high chair, booth seating..."
                    className="w-full rounded-xl border border-brand-border bg-white p-3 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                  />
                  {formErrors.specialRequest && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.specialRequest}</p>
                  )}
                </div>

                {/* Submit Button with Anti-Spam Debounce Lock */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all disabled:opacity-50 select-none cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Issuing Token...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4" />
                        <span>Get Queue Token</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-brand-text-muted mt-6">
        Powered by {appName} • Real-time restaurant operations
      </footer>
    </div>
  );
}
