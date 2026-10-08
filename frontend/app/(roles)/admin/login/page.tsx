"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { loginAdmin } from "@/app/actions/auth-actions";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { branding } from "@/config/branding";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupSuccess = searchParams.get("setup") === "success";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginAdmin({
        identifier,
        password,
        rememberDevice,
      });

      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else {
        setError(result.error || "Invalid login credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
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
            Restaurant Admin Sign In
          </h1>
          <p className="mt-2 text-xs text-brand-text-secondary">
            Enter your owner username or registered business email to access your operations dashboard.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
          {setupSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>Password configured successfully! Please sign in below.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-brand-text-primary mb-1">
                Username or Business Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. karan_spice or owner@restaurant.com"
                  className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                <User className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold text-brand-text-primary">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-10 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-brand-text-muted hover:text-brand-text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary/20"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* New Account Link */}
          <div className="mt-8 text-center border-t border-brand-border/60 pt-6">
            <p className="text-xs text-brand-text-secondary">
              Don't have an owner account yet?{" "}
              <Link href="/admin/signup" className="font-bold text-brand-primary hover:underline">
                Register Your Restaurant
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-brand-text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-status-ready" />
          <span>Protected by 30-min brute force lockout & constant-time auth</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
