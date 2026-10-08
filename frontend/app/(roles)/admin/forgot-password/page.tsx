"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { initiateForgotPassword } from "@/app/actions/auth-actions";
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { branding } from "@/config/branding";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await initiateForgotPassword(email);
      if (result.success) {
        setSuccessMessage(result.message || "A verification code has been dispatched.");
        setTimeout(() => {
          router.push(`/admin/verify-otp?email=${encodeURIComponent(email)}&context=forgot_password`);
        }, 1500);
      } else {
        setError(result.error || "Unable to process request.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-brand-secondary">
            Reset Admin Password
          </h1>
          <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
            Enter your registered business email. We will send you a 6-digit OTP to verify identity and issue a password reset link.
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

          {successMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Code Sent</p>
                <p className="text-[11px] mt-0.5">{successMessage} Redirecting to OTP screen...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-brand-text-primary mb-1">
                Registered Business Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                  placeholder="owner@restaurant.com"
                  className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching Reset Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-brand-border/60 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
