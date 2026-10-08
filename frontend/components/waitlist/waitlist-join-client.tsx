"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Phone,
  ArrowRight,
  Check,
  UtensilsCrossed,
  HelpCircle,
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatOrdinalNumber } from "@/lib/waitlist/waitlist-service";
import UnifiedDiningSessionPanel, { DiningSessionData } from "@/components/operations/panels/UnifiedDiningSessionPanel";

interface WaitlistJoinClientProps {
  branchId: string;
  restaurantId?: string;
  sectionId: string;
  branchName: string;
  branchCity?: string | null;
  sectionName: string;
  unitLabel?: string;
}

interface ActiveQueueEntry {
  id: string;
  token_number: string;
  guest_name: string;
  phone_number?: string;
  party_size: number;
  special_request?: string | null;
  position: number;
  parties_ahead?: number;
  estimated_wait_minutes: number;
  status: string; // 'WAITING' | 'TABLE_ASSIGNED' | 'SEATED' | 'NO_SHOW' | 'REMOVED'
  assigned_table_id?: string | null;
  assigned_table_label?: string | null;
  assigned_at?: string | null;
  seated_at?: string | null;
  created_at: string;
}

const BASE_STORAGE_KEY = "bharatqr_device_token";
const BASE_ENTRY_ID_KEY = "bharatqr_active_waitlist_id";

/**
 * Returns section-scoped localStorage key so customers can visit different sections independently.
 */
function getSectionStorageKey(sectionId?: string, baseKey: string = BASE_STORAGE_KEY): string {
  if (!sectionId) return baseKey;
  return `${baseKey}_${sectionId}`;
}

/**
 * Returns or generates a persistent device token from localStorage, scoped per dining section.
 */
function getOrCreateDeviceToken(sectionId?: string): string {
  if (typeof window === "undefined") return "";
  try {
    const key = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
    let token = localStorage.getItem(key);
    if (!token) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        token = crypto.randomUUID();
      } else {
        token = `bqr_dev_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      }
      localStorage.setItem(key, token);
    }
    return token;
  } catch {
    return `bqr_dev_fallback_${Date.now()}`;
  }
}

/**
 * Clears the local waitlist device persistence for a specific dining section.
 */
function clearDevicePersistence(sectionId?: string) {
  if (typeof window === "undefined") return;
  try {
    const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
    const entryIdKey = getSectionStorageKey(sectionId, BASE_ENTRY_ID_KEY);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(entryIdKey);
    // Also remove legacy global keys to prevent stale token resurrection
    localStorage.removeItem(BASE_STORAGE_KEY);
    localStorage.removeItem(BASE_ENTRY_ID_KEY);
  } catch {}
}

export default function WaitlistJoinClient({
  branchId,
  restaurantId,
  sectionId,
  branchName,
  branchCity,
  sectionName,
  unitLabel = "Table",
}: WaitlistJoinClientProps) {
  const router = useRouter();

  // Device & Status state
  const [deviceToken, setDeviceToken] = useState<string>("");
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [activeEntry, setActiveEntry] = useState<ActiveQueueEntry | null>(null);
  const [diningSession, setDiningSession] = useState<DiningSessionData | null>(null);
  const [isSeatingConfirming, setIsSeatingConfirming] = useState<boolean>(false);
  const [seatingError, setSeatingError] = useState<string | null>(null);
  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState<boolean>(false);
  const [terminalBanner, setTerminalBanner] = useState<{
    type: "NO_SHOW" | "REMOVED";
    message: string;
  } | null>(null);

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

  // 1. Status Checker Function (Scoped by sectionId)
  const fetchStatus = useCallback(async (tokenParam?: string) => {
    const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
    const entryIdKey = getSectionStorageKey(sectionId, BASE_ENTRY_ID_KEY);
    const token = tokenParam || deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
    const savedEntryId = typeof window !== "undefined" ? localStorage.getItem(entryIdKey) : "";
    if (!token && !savedEntryId) return;

    try {
      const url = new URL("/api/v1/public/waitlist/status", window.location.origin);
      if (token) url.searchParams.set("device_token", token);
      if (savedEntryId) url.searchParams.set("entry_id", savedEntryId);
      if (sectionId) url.searchParams.set("section_id", sectionId);
      if (branchId) url.searchParams.set("branch_id", branchId);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.has_active_entry && json.entry) {
          // Verify that this entry belongs to the current section
          if (!sectionId || !json.entry.section_id || json.entry.section_id === sectionId) {
            // If already seated, seamlessly redirect to the canonical Table QR Session URL
            if (json.entry.status === "SEATED") {
              const targetTableId = json.session?.table_id || json.entry.assigned_table_id;
              if (targetTableId) {
                if (typeof window !== "undefined") {
                  try {
                    clearDevicePersistence(sectionId);
                    localStorage.setItem(`bharatqr_active_table_session_${targetTableId}`, JSON.stringify(json.session || {
                      id: json.session?.id || json.entry.id,
                      table_id: targetTableId,
                      table_label: json.entry.assigned_table_label || "Table",
                      customer_name: json.entry.guest_name,
                      guest_count: json.entry.party_size || 1,
                      started_at: json.entry.seated_at || new Date().toISOString(),
                      branch_name: branchName,
                      section_name: sectionName,
                    }));
                    if (token) localStorage.setItem("bharatqr_device_token", token);
                  } catch {}
                  window.location.replace(`/table/${targetTableId}/scan`);
                  return;
                }
                router.replace(`/table/${targetTableId}/scan`);
                return;
              } else {
                clearDevicePersistence(sectionId);
                setActiveEntry(null);
                return;
              }
            }

            setActiveEntry(json.entry);
            if (json.session) {
              setDiningSession(json.session);
            }
            setTerminalBanner(null);
            try {
              localStorage.setItem(entryIdKey, json.entry.id);
            } catch {}
          } else {
            // Customer belongs to another section; render this section's join form fresh
            setActiveEntry(null);
          }
        } else {
          // If status is terminal or inactive (NO_SHOW, REMOVED, COMPLETED)
          if (json.terminal_status === "NO_SHOW") {
            setTerminalBanner({
              type: "NO_SHOW",
              message: "Your entry was marked as No-Show. Please speak with the host.",
            });
            clearDevicePersistence(sectionId);
          } else if (json.terminal_status === "REMOVED") {
            setTerminalBanner({
              type: "REMOVED",
              message: "Your queue entry has been cancelled.",
            });
            clearDevicePersistence(sectionId);
          } else {
            clearDevicePersistence(sectionId);
          }
          setActiveEntry(null);
        }
      }
    } catch (err) {
      console.warn("Failed to check waitlist status:", err);
    }
  }, [sectionId, branchId, deviceToken]);

  // Initial mount: check localStorage for section-scoped token and restore active session if present
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const token = getOrCreateDeviceToken(sectionId);
      if (isMounted) setDeviceToken(token);
      const entryIdKey = getSectionStorageKey(sectionId, BASE_ENTRY_ID_KEY);
      const savedEntryId = typeof window !== "undefined" ? localStorage.getItem(entryIdKey) : "";

      try {
        const url = new URL("/api/v1/public/waitlist/status", window.location.origin);
        if (token) url.searchParams.set("device_token", token);
        if (savedEntryId) url.searchParams.set("entry_id", savedEntryId);
        if (sectionId) url.searchParams.set("section_id", sectionId);
        if (branchId) url.searchParams.set("branch_id", branchId);

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.has_active_entry && json.entry) {
            if (!sectionId || !json.entry.section_id || json.entry.section_id === sectionId) {
              // If already seated, seamlessly redirect to the canonical Table QR Session URL
              if (json.entry.status === "SEATED") {
                const targetTableId = json.session?.table_id || json.entry.assigned_table_id;
                if (targetTableId) {
                  if (typeof window !== "undefined") {
                    try {
                      clearDevicePersistence(sectionId);
                      localStorage.setItem(`bharatqr_active_table_session_${targetTableId}`, JSON.stringify(json.session || {
                        id: json.session?.id || json.entry.id,
                        table_id: targetTableId,
                        table_label: json.entry.assigned_table_label || "Table",
                        customer_name: json.entry.guest_name,
                        guest_count: json.entry.party_size || 1,
                        started_at: json.entry.seated_at || new Date().toISOString(),
                        branch_name: branchName,
                        section_name: sectionName,
                      }));
                      localStorage.setItem("bharatqr_device_token", token);
                    } catch {}
                    window.location.replace(`/table/${targetTableId}/scan`);
                    return;
                  }
                  router.replace(`/table/${targetTableId}/scan`);
                  return;
                } else {
                  clearDevicePersistence(sectionId);
                  setActiveEntry(null);
                  return;
                }
              }

              setActiveEntry(json.entry);
              if (json.session) {
                setDiningSession(json.session);
              }
              try {
                localStorage.setItem(entryIdKey, json.entry.id);
              } catch {}
            } else {
              setActiveEntry(null);
            }
          } else {
            // If previous status was terminal or inactive (NO_SHOW, REMOVED, COMPLETED)
            if (json.terminal_status === "NO_SHOW") {
              setTerminalBanner({
                type: "NO_SHOW",
                message: "Your entry was marked as No-Show. Please speak with the host.",
              });
              clearDevicePersistence(sectionId);
            } else if (json.terminal_status === "REMOVED") {
              setTerminalBanner({
                type: "REMOVED",
                message: "Your queue entry has been cancelled.",
              });
              clearDevicePersistence(sectionId);
            } else {
              clearDevicePersistence(sectionId);
            }
            setActiveEntry(null);
          }
        }
      } catch (err) {
        console.warn("Failed to initialize waitlist session:", err);
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    }

    void initializeSession();

    return () => {
      isMounted = false;
    };
  }, [sectionId, branchId]);

  // 2. Real-Time Sync via Supabase Realtime & Periodic Server Polling Fallback
  useEffect(() => {
    if (!sectionId) return;

    let supabase: any = null;
    let intervalId: NodeJS.Timeout | null = null;

    try {
      supabase = createClient();
      const channel = supabase
        .channel(`waitlist_live_section_${sectionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "waiting_list_entries",
            filter: `section_id=eq.${sectionId}`,
          },
          (payload: any) => {
            const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
            const currentToken = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");

            // If our own entry was updated
            if (payload.new && (payload.new.id === activeEntry?.id || (currentToken && payload.new.device_token === currentToken))) {
              const updatedStatus = (payload.new.status || "").toUpperCase();

              if (updatedStatus === "NO_SHOW") {
                setTerminalBanner({
                  type: "NO_SHOW",
                  message: "Your entry was marked as No-Show. Please speak with the host.",
                });
                clearDevicePersistence(sectionId);
                setActiveEntry(null);
                return;
              }

              if (updatedStatus === "REMOVED") {
                setTerminalBanner({
                  type: "REMOVED",
                  message: "Your queue entry has been cancelled.",
                });
                clearDevicePersistence(sectionId);
                setActiveEntry(null);
                return;
              }

              startTransition(() => {
                setActiveEntry((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: updatedStatus,
                        assigned_table_id: payload.new.assigned_table_id ?? prev.assigned_table_id,
                        assigned_table_label: payload.new.assigned_table_label ?? (updatedStatus === "WAITING" ? null : prev.assigned_table_label),
                        assigned_at: payload.new.assigned_at ?? (updatedStatus === "WAITING" ? null : prev.assigned_at),
                        seated_at: payload.new.seated_at ?? (updatedStatus === "SEATED" ? (prev.seated_at || new Date().toISOString()) : null),
                        position: (updatedStatus === "TABLE_ASSIGNED" || updatedStatus === "SEATED") ? 0 : prev.position,
                        estimated_wait_minutes: (updatedStatus === "TABLE_ASSIGNED" || updatedStatus === "SEATED") ? 0 : prev.estimated_wait_minutes,
                      }
                    : null
                );
              });

              if (updatedStatus === "WAITING" && activeEntry?.status === "TABLE_ASSIGNED") {
                setSeatingError("Table assignment was changed or cancelled by staff. You are back in queue.");
              }

              // If assignment was changed/cancelled or updated, re-fetch status to ensure all live fields are synchronized
              if (currentToken) {
                fetchStatus(currentToken);
              }
            } else if (payload.new?.section_id === sectionId || payload.old?.section_id === sectionId) {
              // Preceding queue entry in this section updated or seated: dynamically recalculate position (#4 -> #3 -> #2 -> #1)
              if (currentToken) {
                fetchStatus(currentToken);
              }
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "queue_entries",
            filter: `section_id=eq.${sectionId}`,
          },
          (payload: any) => {
            const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
            const currentToken = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
            if (currentToken) {
              fetchStatus(currentToken);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tables",
            filter: `section_id=eq.${sectionId}`,
          },
          () => {
            const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
            const currentToken = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
            if (currentToken) {
              fetchStatus(currentToken);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
            const token = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
            if (token) fetchStatus(token);
          }
        });

      // Network reconnect listener
      const handleOnline = () => {
        const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
        const token = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
        if (token) fetchStatus(token);
      };
      window.addEventListener("online", handleOnline);

      // Passive safety fallback every 45s (reduced from 5s continuous poll)
      intervalId = setInterval(() => {
        const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
        const token = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
        if (token) fetchStatus(token);
      }, 45000);

      return () => {
        if (supabase) supabase.removeChannel(channel);
        if (intervalId) clearInterval(intervalId);
        window.removeEventListener("online", handleOnline);
      };
    } catch (err) {
      console.warn("Realtime sync fallback:", err);
      intervalId = setInterval(() => {
        const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
        const token = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");
        if (token) fetchStatus(token);
      }, 45000);
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [activeEntry?.id, sectionId, deviceToken, fetchStatus]);

  // 2b. Auto-redirect to canonical Table QR URL when entry transitions to SEATED
  useEffect(() => {
    if (activeEntry?.status === "SEATED") {
      const targetTableId = diningSession?.table_id || activeEntry.assigned_table_id;
      if (targetTableId && typeof window !== "undefined") {
        try {
          clearDevicePersistence(sectionId);
          const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
          const token = deviceToken || localStorage.getItem(tokenKey);
          if (token) localStorage.setItem("bharatqr_device_token", token);
          window.location.replace(`/table/${targetTableId}/scan`);
        } catch {
          window.location.href = `/table/${targetTableId}/scan`;
        }
      }
    }
  }, [activeEntry?.status, activeEntry?.assigned_table_id, diningSession?.table_id, sectionId, deviceToken]);

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

  // 4. Form Submit with Debounce & Idempotent Token Issuance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors({});

    const cleanPhone = phone.replace(/\D/g, "");
    const token = deviceToken || getOrCreateDeviceToken(sectionId);

    try {
      const response = await fetch("/api/v1/public/waitlist/join", {
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
        setTerminalBanner(null);
        try {
          const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
          const entryIdKey = getSectionStorageKey(sectionId, BASE_ENTRY_ID_KEY);
          localStorage.setItem(tokenKey, token);
          localStorage.setItem(entryIdKey, res.entry.id);
        } catch {}
      } else if (response.status === 409 && res.has_active_entry && res.entry) {
        // Active entry already exists for this device in this section, render live status screen
        if (!sectionId || !res.entry.section_id || res.entry.section_id === sectionId) {
          setActiveEntry(res.entry);
          setTerminalBanner(null);
          try {
            const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
            const entryIdKey = getSectionStorageKey(sectionId, BASE_ENTRY_ID_KEY);
            localStorage.setItem(tokenKey, token);
            localStorage.setItem(entryIdKey, res.entry.id);
          } catch {}
        }
      } else if (response.status === 429) {
        setFormErrors({
          general: res.error || "Too many attempts. Please wait a moment and try again.",
        });
      } else {
        setFormErrors({
          general: res.error || "Failed to register queue entry. Please speak with the host.",
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

  // 5. Handle Seating Confirmation (User Story 15.5)
  const handleConfirmSeating = async () => {
    if (!activeEntry || isSeatingConfirming) return;
    setIsSeatingConfirming(true);
    setSeatingError(null);

    try {
      const tokenKey = getSectionStorageKey(sectionId, BASE_STORAGE_KEY);
      const token = deviceToken || (typeof window !== "undefined" ? localStorage.getItem(tokenKey) : "");

      const res = await fetch("/api/v1/public/waitlist/confirm-seating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-token": token || "",
        },
        body: JSON.stringify({
          waitlist_entry_id: activeEntry.id,
          device_token: token,
          branch_id: branchId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const targetTableId = data.session?.table_id || activeEntry.assigned_table_id;

        if (targetTableId) {
          if (typeof window !== "undefined") {
            const sessObj = {
              id: data.session?.id || activeEntry.id,
              table_id: targetTableId,
              table_label: data.session?.table_label || activeEntry.assigned_table_label || "Table",
              customer_name: data.session?.customer_name || activeEntry.guest_name,
              guest_count: data.session?.guest_count || activeEntry.party_size || 1,
              started_at: data.session?.started_at || new Date().toISOString(),
              branch_name: branchName,
              section_name: sectionName,
            };
            try {
              // 1. Seed table active session cache for the canonical Table QR page
              localStorage.setItem(`bharatqr_active_table_session_${targetTableId}`, JSON.stringify(sessObj));
              // 2. Ensure device token is synced
              if (token) localStorage.setItem("bharatqr_device_token", token);
              // 3. Clear waitlist persistence for this section so user isn't stuck in queue
              clearDevicePersistence(sectionId);
            } catch {}

            // Immediate hard browser navigation away from waitlist to table session
            window.location.replace(`/table/${targetTableId}/scan`);
            return;
          }
          // Fallback router navigation
          router.replace(`/table/${targetTableId}/scan`);
          return;
        }

        if (data.session) {
          setDiningSession(data.session);
        }
        setActiveEntry((prev) =>
          prev
            ? {
                ...prev,
                status: "SEATED",
                seated_at: data.session?.started_at || new Date().toISOString(),
              }
            : null
        );
      } else {
        setSeatingError(data.error || "Failed to confirm seating. Please speak with the host.");
        if (token) {
          fetchStatus(token);
        }
      }
    } catch {
      setSeatingError("Connection issue while confirming seating. Please try again or ask staff.");
    } finally {
      setIsSeatingConfirming(false);
    }
  };

  // 6. Handle Register Again (e.g. after terminal state or when completed)
  const handleResetSession = () => {
    clearDevicePersistence();
    const newToken = getOrCreateDeviceToken();
    setDeviceToken(newToken);
    setActiveEntry(null);
    setDiningSession(null);
    setTerminalBanner(null);
    setSeatingError(null);
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
      <main className={`mt-5 mx-auto w-full transition-all duration-300 ${
        activeEntry?.status === "SEATED" 
          ? "max-w-2xl px-2 sm:px-4" 
          : "max-w-md px-3 sm:px-0"
      }`}>
        {/* Terminal Notice Banner (NO_SHOW / REMOVED) */}
        {terminalBanner && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-brandCard text-center animate-in fade-in slide-in-from-top-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-2">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-rose-900 leading-snug">
              {terminalBanner.message}
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              Your device token has been cleared. You may join the waiting list again below.
            </p>
          </div>
        )}

        {isLoadingStatus ? (
          /* Loading State */
          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-3" />
            <p className="text-xs font-medium text-brand-text-muted">
              Checking waitlist status...
            </p>
          </div>
        ) : activeEntry?.status === "SEATED" ? (
          /* ========================================================================= */
          /* A. Seated State — Automatic Transition to Table QR Screen                */
          /* ========================================================================= */
          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard py-10 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-xs ring-4 ring-emerald-100">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <span className="inline-block text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full mb-2">
              Seating Confirmed
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight mb-1">
              Transitioning to Table {activeEntry.assigned_table_label || "..."}
            </h2>
            <p className="text-xs text-brand-text-muted mb-6 max-w-xs mx-auto">
              Please wait while we redirect you to your digital dining portal...
            </p>
            {activeEntry.assigned_table_id ? (
              <a
                href={`/table/${activeEntry.assigned_table_id}/scan`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold shadow-md hover:bg-brand-primary-hover transition-all"
              >
                Open Dining Session Now
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <button
                onClick={() => {
                  clearDevicePersistence(sectionId);
                  setActiveEntry(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-text-muted hover:bg-gray-50 transition-all"
              >
                Start New Request
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
            {activeEntry ? (() => {
              const partiesAhead = activeEntry.parties_ahead !== undefined
                ? activeEntry.parties_ahead
                : Math.max(0, (activeEntry.position || 1) - 1);

              return (
                /* ========================================================================= */
                /* 1. Live Queue Status Screen (Customer View: WAITING or TABLE_ASSIGNED)    */
                /* ========================================================================= */
                <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                {activeEntry.status === "TABLE_ASSIGNED" ? (
                  /* ========================================================================= */
                  /* B. Table Assigned & Seating Confirmation View (Story 15.5 Section 2)      */
                  /* ========================================================================= */
                  <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/90 to-emerald-100/50 p-6 mb-5 text-center shadow-md animate-in zoom-in-95 duration-200">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-xs ring-4 ring-emerald-200/50">
                    <PartyPopper className="h-7 w-7 animate-bounce text-emerald-600" />
                  </div>
                  
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-3 py-0.5 rounded-full mb-1">
                    Table Allocated
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                    Your Table Is Ready!
                  </h2>
                  <p className="text-xs text-emerald-800/80 mt-0.5 font-medium">
                    Please proceed to your table.
                  </p>

                  {/* Prominent Assigned Table Badge (Story 15.5 Section 2) */}
                  <div className="mt-3.5 p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">
                      Your Assigned Table
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                      Table {activeEntry.assigned_table_label || "Assigned"}
                    </div>
                    <div className="pt-2 border-t border-emerald-100/80 grid grid-cols-3 gap-1 text-[11px] text-emerald-900 font-medium">
                      <div>
                        <span className="text-[9px] text-brand-text-muted block uppercase">Token</span>
                        <span className="font-bold text-emerald-800 font-mono">{activeEntry.token_number}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-text-muted block uppercase">Party</span>
                        <span className="font-bold text-emerald-800">{activeEntry.party_size} Guests</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-text-muted block uppercase">Assigned</span>
                        <span className="font-bold text-emerald-800 font-mono">
                          {activeEntry.assigned_at
                            ? new Date(activeEntry.assigned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seating Error Notice Banner */}
                  {seatingError && (
                    <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-left text-xs text-rose-800 animate-in fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold">Notice</p>
                        <p className="text-[11px] mt-0.5">{seatingError}</p>
                      </div>
                    </div>
                  )}

                  {/* Primary CTA: "I Am Seated" & Secondary Action: "Need Help" (Story 15.5 Section 2) */}
                  <div className="mt-5 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleConfirmSeating}
                      disabled={isSeatingConfirming}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] touch-manipulation min-h-[48px]"
                    >
                      {isSeatingConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Confirming Seating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>I Am Seated</span>
                        </>
                      )}
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsNeedHelpOpen(true)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-all"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Need Help</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fetchStatus(deviceToken)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* C. Waiting in Live Queue View                                             */
                /* ========================================================================= */
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary border border-brand-primary/20 mb-2 shadow-xs">
                    <Ticket className="h-6 w-6" />
                  </div>

                  {activeEntry.position === 1 ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                        <span>Next in line</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                        You&apos;re Next in Line!
                      </h2>
                      <p className="text-xs text-brand-text-secondary">
                        0 parties ahead of you — please stay near the host station at <span className="font-bold text-brand-secondary">{sectionName}</span>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        <Radio className="h-3 w-3 text-amber-600 animate-pulse" />
                        <span>Live Queue Tracking</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                        You are {formatOrdinalNumber(activeEntry.position)} in the queue!
                      </h2>
                      <p className="text-xs text-brand-text-secondary">
                        {partiesAhead} {partiesAhead === 1 ? "party is" : "parties are"} currently ahead of you in <span className="font-bold text-brand-secondary">{sectionName}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Prominent Queue Token Badge */}
              <div className="my-5 rounded-3xl bg-brand-surface-muted/90 border-2 border-brand-primary/30 p-5 sm:p-6 text-center shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                  Your Queue Token
                </span>
                <div className="mt-1 text-4xl sm:text-5xl font-black tracking-tight text-brand-primary font-mono">
                  {activeEntry.token_number}
                </div>
                <div className="mt-2 text-xs font-semibold text-brand-secondary flex items-center justify-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Section: {sectionName}</span>
                </div>
              </div>

              {/* Queue Progress Stepper */}
              {activeEntry.status === "WAITING" && (
                <div className="rounded-2xl border border-brand-border/80 bg-white p-3.5 mb-5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-brand-text-muted mb-3 px-1">
                    <span>Queue Journey</span>
                    <span className="text-[10px] text-brand-primary font-semibold flex items-center gap-1">
                      <Radio className="h-2.5 w-2.5 animate-pulse" /> Live Updating
                    </span>
                  </div>
                  <div className="flex items-center justify-between relative px-2">
                    <div className="absolute left-6 right-6 top-3 h-0.5 bg-brand-border z-0" />
                    
                    {/* Step 1: Registered */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs ring-4 ring-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 mt-1">Joined</span>
                    </div>

                    {/* Step 2: Waiting in Queue */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-black shadow-xs ring-4 ring-brand-primary-light animate-pulse">
                        {activeEntry.position}
                      </div>
                      <span className="text-[10px] font-black text-brand-primary mt-1">
                        {formatOrdinalNumber(activeEntry.position)} in Queue
                      </span>
                    </div>

                    {/* Step 3: Table Ready */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-brand-surface-muted text-brand-text-muted flex items-center justify-center text-[10px] font-bold ring-4 ring-white">
                        3
                      </div>
                      <span className="text-[10px] font-medium text-brand-text-muted mt-1">Table Ready</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Queue Position, Parties Ahead & Estimated Wait Indicators */}
              {activeEntry.status === "WAITING" && (
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {/* Position Badge */}
                  <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary-light/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-brand-primary mb-1">
                      <Radio className="h-3 w-3 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Position</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-brand-secondary leading-tight">
                      {formatOrdinalNumber(activeEntry.position)}
                    </div>
                    <span className="text-[10px] text-brand-text-muted font-medium">in queue</span>
                  </div>

                  {/* Parties Ahead */}
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-indigo-700 mb-1">
                      <Users className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Ahead</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-indigo-950 leading-tight">
                      {partiesAhead}
                    </div>
                    <span className="text-[10px] text-indigo-700 font-medium">{partiesAhead === 1 ? "party" : "parties"}</span>
                  </div>

                  {/* Estimated Wait Time */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-700 mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Est. Wait</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-900 leading-tight">
                      ~{activeEntry.estimated_wait_minutes}m
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium">approx</span>
                  </div>
                </div>
              )}

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
                    <Clock className="h-3.5 w-3.5" /> Registration Time:
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
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Assigned Time:
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
                  <span>Refresh Status</span>
                </button>

                {activeEntry.status === "TABLE_ASSIGNED" && (
                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-brandCard transition-all"
                  >
                    <span>Leave Queue / Register New</span>
                  </button>
                )}
              </div>
            </div>
          );
        })() : (
            /* ========================================================================= */
            /* 2. Waitlist Registration Form View (Join Queue)                           */
            /* ========================================================================= */
            <div>
              <div className="mb-5 pb-4 border-b border-brand-border/60">
                <h2 className="text-base font-bold text-brand-secondary">
                  Join Waiting List
                </h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Enter your details to join the queue for a {unitLabel.toLowerCase()} in {sectionName}.
                </p>
              </div>

              {formErrors.general && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Guest Name (Required: 2-100 chars) */}
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Guest Name <span className="text-rose-500">*</span>
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

                {/* Mobile Number (Required: 10-digit Indian standard /^[6-9]\d{9}$/) */}
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
                      No OTP required. We will announce or call this number when ready.
                    </p>
                  )}
                </div>

                {/* Party Size (Required: 1 to 50) */}
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Party Size <span className="text-rose-500">*</span>
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

                  {/* Stepper for custom party sizes up to 50 */}
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

                {/* Special Request / Notes (Optional: Max 250 with Counter) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-brand-secondary">
                      Special Request / Notes <span className="text-[10px] font-normal text-brand-text-muted">(Optional)</span>
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
                    placeholder="e.g. Baby high chair, window seat, booth seating..."
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
                        <span>Joining Queue...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Queue</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      </main>

      {/* Need Help Modal (User Story 15.5 Section 2) */}
      {isNeedHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-brand-border text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <HelpCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-brand-secondary">
                Need Help With Seating?
              </h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Please visit the host desk at <span className="font-bold text-brand-secondary">{sectionName}</span> or ask any floor captain for assistance.
              </p>
            </div>

            {activeEntry && (
              <div className="rounded-2xl bg-brand-surface-muted p-3.5 text-xs text-left space-y-1.5 border border-brand-border/60">
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Queue Token:</span>
                  <span className="font-bold text-brand-primary font-mono">{activeEntry.token_number}</span>
                </div>
                {activeEntry.assigned_table_label && (
                  <div className="flex justify-between">
                    <span className="text-brand-text-muted">Assigned Table:</span>
                    <span className="font-bold text-emerald-700">Table {activeEntry.assigned_table_label}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Guest Name:</span>
                  <span className="font-bold text-brand-secondary">{activeEntry.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Party Size:</span>
                  <span className="font-bold text-brand-secondary">{activeEntry.party_size} Guests</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsNeedHelpOpen(false)}
              className="w-full inline-flex items-center justify-center rounded-xl bg-brand-secondary px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-secondary/90 transition-all"
            >
              <span>Understood / Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-[11px] text-brand-text-muted mt-6">
        Powered by {appName} • Live Queue Operations
      </footer>
    </div>
  );
}
