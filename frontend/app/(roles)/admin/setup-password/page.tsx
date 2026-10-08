"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { completePasswordSetup } from "@/app/actions/auth-actions";
import { 
  Lock, 
  User, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { branding } from "@/config/branding";

function PasswordSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const isReset = searchParams.get("reset") === "true";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Real-time strength checks
  const checks = useMemo(() => {
    return {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      match: password.length > 0 && password === confirmPassword,
      usernameValid: isReset ? true : /^[a-zA-Z0-9_.-]{3,50}$/.test(username),
    };
  }, [password, confirmPassword, username, isReset]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (checks.length) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;
    return score;
  }, [checks]);

  const strengthColor = useMemo(() => {
    if (strengthScore <= 40) return "bg-red-500";
    if (strengthScore <= 80) return "bg-amber-500";
    return "bg-emerald-500";
  }, [strengthScore]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 40) return "Weak";
    if (strengthScore <= 80) return "Moderate";
    return "Strong (Meets Security Standard)";
  }, [strengthScore]);

  const allValid = 
    checks.length && 
    checks.uppercase && 
    checks.lowercase && 
    checks.number && 
    checks.special && 
    checks.match && 
    checks.usernameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing security token. Please use the link provided in your email.");
      return;
    }
    if (!allValid) {
      setError("Please ensure your username and password meet all requirements below.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await completePasswordSetup({
        token,
        username: username || "admin",
        password,
        confirmPassword,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/login?setup=success");
        }, 2000);
      } else {
        setError(result.error || "Setup failed. The security link may have expired.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-brand-border bg-white p-8 text-center shadow-brandCard">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-secondary">Invalid or Missing Security Token</h2>
          <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
            This setup link requires a valid, single-use 30-minute token. Please check your verification email or request a new link.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/signup"
              className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
            >
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-brand-border bg-white p-8 text-center shadow-brandCard animate-in zoom-in-95 duration-200">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-brand-secondary">
            {isReset ? "Password Reset Successfully!" : "Account Activated!"}
          </h2>
          <p className="mt-2 text-xs text-brand-text-secondary">
            Your credentials have been securely encrypted and your account is now ready. Redirecting to login...
          </p>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-brand-secondary">
            {isReset ? "Reset Your Admin Password" : "Set Up Your Owner Account"}
          </h1>
          <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
            {isReset
              ? "Create a new compliant password to regain access to your dashboard."
              : "Choose a memorable username and a strong password to secure your restaurant operations."}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input (if signup) */}
            {!isReset && (
              <div>
                <label htmlFor="username" className="block text-xs font-bold text-brand-text-primary mb-1">
                  Choose an Admin Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. karan_spice"
                    className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                </div>
                <span className="text-[11px] text-brand-text-muted mt-1 block">
                  Used alongside your email to sign in to the Admin Portal.
                </span>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-brand-text-primary mb-1">
                Password (12+ characters) <span className="text-red-500">*</span>
              </label>
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

              {/* Real-time Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-text-muted">Strength:</span>
                    <span className="font-bold text-brand-secondary">{strengthLabel}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-brand-surface-muted overflow-hidden">
                    <div
                      className={`h-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-brand-text-primary mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
              </div>
            </div>

            {/* Live Requirements Checklist */}
            <div className="rounded-xl bg-brand-surface-muted p-3.5 space-y-2 text-xs">
              <span className="font-bold text-brand-secondary block mb-1 text-[11px] uppercase tracking-wider">
                Security Policy Checklist:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {checks.length ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                  )}
                  <span className={checks.length ? "text-emerald-700 font-medium" : "text-brand-text-muted"}>
                    12+ characters
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {checks.uppercase ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                  )}
                  <span className={checks.uppercase ? "text-emerald-700 font-medium" : "text-brand-text-muted"}>
                    Uppercase letter
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {checks.lowercase ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                  )}
                  <span className={checks.lowercase ? "text-emerald-700 font-medium" : "text-brand-text-muted"}>
                    Lowercase letter
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {checks.number ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                  )}
                  <span className={checks.number ? "text-emerald-700 font-medium" : "text-brand-text-muted"}>
                    Numeric digit (0-9)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {checks.special ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                  )}
                  <span className={checks.special ? "text-emerald-700 font-medium" : "text-brand-text-muted"}>
                    Special symbol (@, #, $)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {checks.match ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                  )}
                  <span className={checks.match ? "text-emerald-700 font-medium" : "text-brand-text-muted"}>
                    Passwords match
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !allValid}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Encrypting Credentials...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Activate Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      }
    >
      <PasswordSetupContent />
    </Suspense>
  );
}
