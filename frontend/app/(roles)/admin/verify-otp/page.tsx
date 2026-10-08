"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { verifyOtp, resendOtp } from "@/app/actions/auth-actions";
import { 
  KeyRound, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Mail
} from "lucide-react";
import { branding } from "@/config/branding";

function OtpVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const context = (searchParams.get("context") || "signup") as "signup" | "forgot_password";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // 5-minute session countdown (300 seconds)
  const [sessionSeconds, setSessionSeconds] = useState(300);
  // 120-second resend cooldown
  const [cooldownSeconds, setCooldownSeconds] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle digit inputs
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d{1,6}$/.test(pastedData)) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || "";
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const fullOtp = digits.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await verifyOtp({
        email,
        otp: fullOtp,
        context,
      });

      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        setError(result.error || "Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "A network error occurred while verifying.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending) return;

    setError(null);
    setResendSuccess(null);
    setResending(true);

    try {
      const res = await resendOtp(email, context);
      if (res.success) {
        setResendSuccess("A new 6-digit code has been dispatched to your email.");
        setCooldownSeconds(120);
        setSessionSeconds(300);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.error || "Failed to resend code.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-brand-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-brand-secondary">
            Verify Business Email
          </h1>
          <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
            Enter the 6-digit passcode dispatched to:
            <br />
            <strong className="text-brand-text-primary font-mono text-sm">{email || "your email"}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{resendSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 Input Boxes */}
            <div>
              <label className="block text-xs font-bold text-brand-text-secondary text-center mb-3">
                Enter 6-Digit One-Time Passcode
              </label>
              <div className="flex justify-between gap-2 sm:gap-3">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoFocus={idx === 0}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="h-13 w-11 sm:h-14 sm:w-12 rounded-xl border-2 border-brand-border bg-brand-surface text-center font-mono text-xl font-bold text-brand-secondary focus:border-brand-primary focus:bg-brand-primary-light/30 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Session Countdown & Expiry Warning */}
            <div className="flex items-center justify-between text-xs text-brand-text-muted px-1">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand-text-secondary" />
                <span>Code expires in:</span>
                <span className={`font-mono font-bold ${sessionSeconds < 60 ? "text-red-500" : "text-brand-secondary"}`}>
                  {formatTime(sessionSeconds)}
                </span>
              </div>
              <span className="text-[11px]">Max 5 attempts</span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || fullOtp.length !== 6 || sessionSeconds === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Cooldown Section */}
          <div className="mt-6 pt-6 border-t border-brand-border/60 text-center">
            <p className="text-xs text-brand-text-secondary mb-3">
              Did not receive your code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldownSeconds > 0 || resending}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover disabled:text-brand-text-muted disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>
                {cooldownSeconds > 0
                  ? `Resend available in ${cooldownSeconds}s`
                  : resending
                  ? "Dispatching new code..."
                  : "Resend 6-Digit Code"}
              </span>
            </button>
          </div>

          <div className="mt-6 text-center border-t border-brand-border/40 pt-4">
            <Link
              href="/admin/signup"
              className="text-xs text-brand-text-muted hover:text-brand-text-primary transition-colors"
            >
              Change Email Address / Start Over
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      }
    >
      <OtpVerificationContent />
    </Suspense>
  );
}
