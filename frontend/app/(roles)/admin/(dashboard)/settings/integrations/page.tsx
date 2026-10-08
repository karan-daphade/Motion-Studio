import React from "react";
import { 
  Sparkles, 
  MessageSquare, 
  Printer, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Lock,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Swiggy Restaurant Partner",
      category: "Food Aggregator",
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600 border-orange-200",
      description: "Direct order ingestion, live catalog price sync, and instant 86 item availability toggling.",
      status: "Upcoming Phase 2",
    },
    {
      name: "Zomato Partner Hub",
      category: "Food Aggregator",
      icon: ShoppingBag,
      color: "bg-red-50 text-red-600 border-red-200",
      description: "Two-way integration for online order punch-in directly into your kitchen KDS stations.",
      status: "Upcoming Phase 2",
    },
    {
      name: "WhatsApp Cloud Business API",
      category: "Customer Communication",
      icon: MessageSquare,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      description: "Send instant digital receipts, e-bills with GST breakdowns, and loyalty coupons to guest WhatsApp numbers.",
      status: "Ready for Beta",
    },
    {
      name: "Thermal Receipt Printers (ESC/POS)",
      category: "Hardware",
      icon: Printer,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      description: "Connect USB, Bluetooth, and Ethernet ESC/POS thermal receipt printers for automated KOT dispatch.",
      status: "Configured via Local Agent",
    },
    {
      name: "PineLabs & Paytm EDC Terminal",
      category: "Payments",
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      description: "Push bill amounts straight to smart Android EDC swipe card machines without manual entry errors.",
      status: "Upcoming Phase 2",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Hardware & Cloud Integrations
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 border border-purple-300">
              Ecosystem Hub
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Connect third-party aggregators, payment POS terminals, receipt printers, and WhatsApp messaging.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 border border-slate-200">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-brand-secondary">{item.name}</h3>
                <span className="text-[10px] font-semibold text-brand-text-muted">{item.category}</span>
                <p className="text-xs text-brand-text-secondary mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-brand-text-muted">Direct API Hook</span>
                <button
                  type="button"
                  className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                >
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
