"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Phone, 
  UtensilsCrossed, 
  ShieldAlert, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { appName } from "@/config/branding";

const STORAGE_DEVICE_TOKEN_KEY = "bharatqr_device_token";
const STORAGE_ACTIVE_SESSION_KEY = "bharatqr_active_table_session";

function formatTableLabel(lbl?: string): string {
  if (!lbl) return "Table";
  const trimmed = lbl.trim();
  const stripped = trimmed.replace(/^(table\s*)+/i, "").trim();
  return stripped ? `Table ${stripped}` : "Table";
}

export default function JoinSessionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id") || "";
  const shareToken = searchParams.get("token") || "";
  const tableParam = searchParams.get("table") || "";
  const branchParam = searchParams.get("branch") || "";

  const [deviceToken, setDeviceToken] = useState<string>("");
  const [isPreChecking, setIsPreChecking] = useState<boolean>(true);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockMessage, setBlockMessage] = useState<string>("");
  const [sessionEnded, setSessionEnded] = useState<boolean>(false);

  // Form State
  const [guestName, setGuestName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Device Pre-Check & Token Initialization (Story 15.7 Workflow 2 Step 2)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let token = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
    if (!token) {
      token = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? `dev_${crypto.randomUUID()}`
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_DEVICE_TOKEN_KEY, token);
    }
    setDeviceToken(token);

    if (!sessionId) {
      setIsPreChecking(false);
      return;
    }

    // Pre-check with backend validate-device endpoint
    const checkDevice = async () => {
      try {
        const q = new URLSearchParams({
          session_id: sessionId,
          device_token: token!,
        });
        if (branchParam) q.set("branch_id", branchParam);

        const res = await fetch(`/api/v1/public/session/validate-device?${q.toString()}`, {
          headers: { "x-device-token": token! },
        });
        const data = await res.json();

        if (res.status === 403 && (data.status === "BLOCKED" || data.isBlocked)) {
          setIsBlocked(true);
          setBlockMessage(data.message || "Your device is temporarily blocked from this outlet. Please speak with staff.");
          setIsPreChecking(false);
          return;
        }

        if (res.status === 410 || (data.status === "NOT_FOUND" && data.message?.includes("ended"))) {
          setSessionEnded(true);
          setIsPreChecking(false);
          return;
        }

        // If this device is already attached and active, bypass form
        if (res.ok && data.success && data.status === "ACTIVE" && data.session) {
          const tableId = data.session.table_id;
          if (tableId) {
            localStorage.setItem(`${STORAGE_ACTIVE_SESSION_KEY}_${tableId}`, JSON.stringify(data.session));
            window.location.replace(`/table/${tableId}/scan`);
            return;
          }
        }
      } catch (err) {
        console.error("Device pre-check error:", err);
      } finally {
        setIsPreChecking(false);
      }
    };

    checkDevice();
  }, [sessionId, branchParam]);

  // Handle Form Submit (Story 15.7 Workflow 2 Step 3 & 4: Instant Join)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors: { [key: string]: string } = {};
    const trimmedName = guestName.trim();
    const cleanPhone = mobileNumber.trim().replace(/\D/g, "");

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = "Please enter your name (at least 2 letters).";
    }

    const indianRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !indianRegex.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number (starts with 6-9).";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/public/session/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-token": deviceToken,
        },
        body: JSON.stringify({
          session_id: sessionId,
          guest_name: trimmedName,
          mobile_number: cleanPhone,
          device_token: deviceToken,
          share_token: shareToken,
          branch_id: branchParam || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.session) {
        const tableId = data.session.table_id;
        if (typeof window !== "undefined") {
          localStorage.setItem(`${STORAGE_ACTIVE_SESSION_KEY}_${tableId}`, JSON.stringify(data.session));
        }
        // Redirect immediately to Dining Session Home (Hard navigation for pristine state)
        window.location.replace(`/table/${tableId}/scan`);
      } else {
        if (data.isBlocked || res.status === 403) {
          setIsBlocked(true);
          setBlockMessage(data.error || "Your device is temporarily blocked from this outlet. Please speak with staff.");
        } else {
          setSubmitError(data.error || "Failed to join dining session. Please ask staff.");
        }
      }
    } catch {
      setSubmitError("Connection issue. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // State: Loading Pre-Check
  if (isPreChecking) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-white border border-brand-border text-center shadow-brandCard space-y-4 max-w-sm w-full animate-in fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto" />
          <p className="text-xs font-bold text-brand-secondary">Verifying session link...</p>
        </div>
      </div>
    );
  }

  // State: Outlet Banned (1-Hour Outlet Ban)
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-white border-2 border-rose-300 text-center shadow-brandCard space-y-4 max-w-sm w-full animate-in zoom-in-95">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-brand-secondary">Access Blocked</h2>
          <p className="text-xs text-rose-700 leading-relaxed font-semibold">
            {blockMessage || "Your device is temporarily blocked from this outlet. Please speak with staff."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State: Session Ended
  if (sessionEnded || !sessionId) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-white border border-brand-border text-center shadow-brandCard space-y-4 max-w-sm w-full animate-in zoom-in-95">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-brand-secondary">Dining Session Ended</h2>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            This dining session has ended. Please contact restaurant staff.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* 1. Header */}
      <div className="mx-auto w-full max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary-light border border-brand-primary/20 text-brand-primary text-xs font-black">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{appName} Dining</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
          Join Dining Session
        </h1>
        <p className="text-xs text-brand-text-secondary">
          Join your table party instantly to share live orders and bill.
        </p>
      </div>

      {/* 2. Join Form Card */}
      <div className="mx-auto w-full max-w-md my-6">
        <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard space-y-5 animate-in zoom-in-95 duration-200">
          {/* Table Badge */}
          <div className="p-3.5 rounded-2xl bg-brand-surface-muted border border-brand-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <span className="font-black text-brand-secondary block">
                  {formatTableLabel(tableParam)}
                </span>
                <span className="text-[10px] text-brand-text-muted">Active Table Session</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
              Direct Join
            </span>
          </div>

          {submitError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Guest Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-secondary flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-brand-primary" />
                <span>Your Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Rahul Sharma"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-xs font-semibold text-brand-secondary placeholder:text-brand-text-muted focus:outline-none transition-all ${
                  formErrors.name
                    ? "border-rose-400 focus:border-rose-500 bg-rose-50/30"
                    : "border-brand-border focus:border-brand-primary bg-white"
                }`}
              />
              {formErrors.name && (
                <p className="text-[10px] text-rose-600 font-medium pl-1">{formErrors.name}</p>
              )}
            </div>

            {/* Field 2: Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-secondary flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-brand-primary" />
                <span>Mobile Number (No OTP required)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-text-muted">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    setMobileNumber(clean);
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  className={`w-full rounded-2xl border pl-12 pr-4 py-3 text-xs font-semibold text-brand-secondary placeholder:text-brand-text-muted focus:outline-none transition-all ${
                    formErrors.phone
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/30"
                      : "border-brand-border focus:border-brand-primary bg-white"
                  }`}
                />
              </div>
              {formErrors.phone && (
                <p className="text-[10px] text-rose-600 font-medium pl-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black flex items-center justify-center gap-2 shadow-brandCard transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Joining Session...</span>
                </>
              ) : (
                <>
                  <span>Join Dining Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Instant Join Notice */}
          <div className="pt-2 text-center border-t border-brand-border/60">
            <p className="text-[10px] text-brand-text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Instant companion join • No staff approval required</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Footer */}
      <div className="text-center text-[11px] text-brand-text-muted">
        Powered by <span className="font-bold text-brand-secondary">{appName}</span>
      </div>
    </div>
  );
}
