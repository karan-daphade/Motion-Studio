import React from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Download, 
  Store,
  Layers
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function SubscriptionPage() {
  const planFeatures = [
    "Unlimited Outlets & Multi-Branch Architecture",
    "Unlimited Kitchen Display (KDS) Stations",
    "Full Table Layout & Section Management",
    "Live Orders & Dynamic KOT Dispatching",
    "Unlimited Staff Accounts & Role-Based PIN Access",
    "Multi-Tax GST Engine & Promotional Coupons",
    "Offline-Capable PWA Sync Engine",
    "Priority 24/7 Phone & WhatsApp Support",
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Subscription & Billing
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
              Active Tier
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Manage restaurant licensing, active tier features, invoices, and billing contact details.
          </p>
        </div>
      </div>

      {/* Plan Card */}
      <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-brand-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-brand-primary-light p-2 text-brand-primary">
                <Zap className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black text-brand-secondary">
                Pro Multi-Outlet Enterprise
              </h2>
            </div>
            <p className="text-xs text-brand-text-secondary mt-1.5 max-w-xl leading-relaxed">
              Complete restaurant operating system with multi-outlet oversight, cloud live synchronization, and unlimited POS terminals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <div className="text-3xl font-black text-brand-secondary tracking-tight">
              ₹2,499
              <span className="text-xs font-semibold text-brand-text-muted"> / month / outlet</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="py-6">
          <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-4">
            Included in your current plan:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {planFeatures.map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-xs text-brand-secondary">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-border/60">
          <div className="text-xs text-brand-text-muted flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Next billing cycle: 1st of next month (Automatic debit)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
            >
              Update Payment Method
            </button>
            <button
              type="button"
              className="rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
            >
              Manage Add-ons
            </button>
          </div>
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard">
        <h3 className="text-sm font-bold text-brand-secondary mb-1">Billing & Invoice History</h3>
        <p className="text-xs text-brand-text-secondary mb-4">Download past GST-compliant tax invoices.</p>

        <div className="divide-y divide-brand-border/60">
          <div className="flex items-center justify-between py-3 text-xs">
            <div>
              <p className="font-bold text-brand-secondary">INV-2026-09-001</p>
              <p className="text-[11px] text-brand-text-muted">Paid on 01 Sep 2026 • Pro Multi-Outlet</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black text-brand-secondary">₹2,948.82 (incl. GST)</span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                Paid
              </span>
              <button
                type="button"
                className="p-1 text-brand-text-muted hover:text-brand-secondary"
                title="Download Receipt"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
