import React from "react";
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ShieldCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Security & Access Credentials
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
              Encrypted
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Manage owner authentication credentials, password requirements, and supervisor security overrides.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Update Card */}
        <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-7 shadow-brandCard">
          <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border/60 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-secondary">
                Change Master Password
              </h3>
              <p className="text-[11px] text-brand-text-muted">
                Update credentials used to log into the owner management portal.
              </p>
            </div>
          </div>

          <form className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
              >
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Operational Security & PIN Overrides */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-7 shadow-brandCard">
            <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border/60 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">
                  Cashier & Supervisor PIN Gates
                </h3>
                <p className="text-[11px] text-brand-text-muted">
                  Require manager 4-digit PIN verification for sensitive live POS operations.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-border/40">
                <div>
                  <p className="font-bold text-brand-secondary">Void or Cancel Order Items</p>
                  <p className="text-[11px] text-brand-text-muted">Requires Branch Manager PIN confirmation</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-border/40">
                <div>
                  <p className="font-bold text-brand-secondary">Custom Manual Discount Override</p>
                  <p className="text-[11px] text-brand-text-muted">Discounts above 10% require supervisor PIN</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-border/40">
                <div>
                  <p className="font-bold text-brand-secondary">No-Sale Cash Drawer Pop</p>
                  <p className="text-[11px] text-brand-text-muted">Logs event with cashier timestamp in audit trail</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Enforced
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-950">Active Owner Session</h4>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  Signed in via Supabase Auth JWT session. Session refresh tokens are automatically rotated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
