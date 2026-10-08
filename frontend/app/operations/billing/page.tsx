import React from "react";
import { 
  Calculator, 
  Receipt, 
  CreditCard, 
  QrCode, 
  IndianRupee, 
  Tag, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  Percent
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function OperationsBillingPage() {
  const activeBills = [
    { table: "Table T4", amount: 1620, time: "55m", party: "Party of 4", items: 6 },
    { table: "Table T1", amount: 840, time: "24m", party: "Party of 2", items: 4 },
    { table: "Table T3", amount: 2450, time: "42m", party: "Party of 5", items: 8 },
    { table: "Bar B1", amount: 1100, time: "18m", party: "Party of 2", items: 3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Boundary Notification Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0 shadow-sm">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-emerald-950">
                Live Operations: Billing & Cashier Desk
              </h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                Phase 2 Core Screen
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Shared cashier desk interface for settling bills, generating GST tax invoices, splitting payments, and triggering ESC/POS receipt printers. The end-to-end payment settlement engine will be wired in <strong>Prompt 17</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Cashier & Billing Desk
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {activeBills.length} Bills Pending
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Compile customer invoices, apply verified discount coupons, split tabs, and tender cash or UPI payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
          >
            <Printer className="h-4 w-4 text-brand-text-muted" />
            <span>Reprint Last Invoice</span>
          </button>
        </div>
      </div>

      {/* Two-Column Billing Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Tables Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
            Unsettled Tables ({activeBills.length})
          </h3>

          <div className="space-y-2.5">
            {activeBills.map((bill, idx) => (
              <button
                key={bill.table}
                type="button"
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  idx === 0
                    ? "border-brand-primary bg-brand-primary-light/30 shadow-brandCard ring-1 ring-brand-primary/20"
                    : "border-brand-border bg-white hover:border-brand-border/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-brand-secondary">{bill.table}</h4>
                    <p className="text-[11px] text-brand-text-muted mt-0.5">
                      {bill.party} • {bill.items} items
                    </p>
                  </div>
                  <span className="text-base font-black text-brand-secondary">
                    ₹{bill.amount}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-brand-text-muted border-t border-brand-border/40 pt-2">
                  <span>Elapsed: {bill.time}</span>
                  <span className="font-bold text-brand-primary">Selected</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Invoice Preview & Payment Tender (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard">
          <div className="flex items-start justify-between pb-4 border-b border-brand-border/60">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-brand-secondary">Table T4 — Tax Invoice</h3>
                <span className="rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                  Ready to Settle
                </span>
              </div>
              <p className="text-[11px] text-brand-text-muted mt-0.5">
                Captain: Rajesh • Order #ORD-089 • GSTIN: 27ABCDE1234F1Z5
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Proforma</span>
            </button>
          </div>

          {/* Itemized Lines */}
          <div className="py-4 space-y-2.5 divide-y divide-brand-border/40">
            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="font-bold text-brand-secondary">2x Paneer Butter Masala</p>
                <p className="text-[10px] text-brand-text-muted">₹320 each</p>
              </div>
              <span className="font-bold text-brand-secondary">₹640.00</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="font-bold text-brand-secondary">4x Garlic Butter Naan</p>
                <p className="text-[10px] text-brand-text-muted">₹80 each</p>
              </div>
              <span className="font-bold text-brand-secondary">₹320.00</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="font-bold text-brand-secondary">2x Chicken Tikka Kebab</p>
                <p className="text-[10px] text-brand-text-muted">₹280 each</p>
              </div>
              <span className="font-bold text-brand-secondary">₹560.00</span>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="border-t border-brand-border/60 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-brand-text-secondary">
              <span>Item Subtotal</span>
              <span className="font-semibold text-brand-secondary">₹1,520.00</span>
            </div>
            <div className="flex justify-between text-brand-text-secondary">
              <span>CGST (2.5%)</span>
              <span className="font-semibold text-brand-secondary">₹38.00</span>
            </div>
            <div className="flex justify-between text-brand-text-secondary">
              <span>SGST (2.5%)</span>
              <span className="font-semibold text-brand-secondary">₹38.00</span>
            </div>
            <div className="flex justify-between text-brand-text-secondary">
              <span>Service Charge (Discretionary 1.5%)</span>
              <span className="font-semibold text-brand-secondary">₹24.00</span>
            </div>

            <div className="flex justify-between text-sm font-black text-brand-secondary pt-3 border-t border-brand-border/60">
              <span>Net Payable Amount</span>
              <span className="text-xl font-black text-brand-primary">₹1,620.00</span>
            </div>
          </div>

          {/* Payment Settlement Methods */}
          <div className="mt-6 pt-5 border-t border-brand-border/60 space-y-3">
            <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
              Tender Payment:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                className="rounded-2xl border border-brand-border p-3.5 flex flex-col items-center justify-center gap-1.5 hover:border-brand-primary hover:bg-brand-surface-muted transition-all"
              >
                <QrCode className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-bold text-brand-secondary">Dynamic UPI QR</span>
              </button>

              <button
                type="button"
                className="rounded-2xl border border-brand-border p-3.5 flex flex-col items-center justify-center gap-1.5 hover:border-brand-primary hover:bg-brand-surface-muted transition-all"
              >
                <IndianRupee className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold text-brand-secondary">Cash Tender</span>
              </button>

              <button
                type="button"
                className="rounded-2xl border border-brand-border p-3.5 flex flex-col items-center justify-center gap-1.5 hover:border-brand-primary hover:bg-brand-surface-muted transition-all"
              >
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-bold text-brand-secondary">Card (EDC)</span>
              </button>

              <button
                type="button"
                className="rounded-2xl border border-brand-border p-3.5 flex flex-col items-center justify-center gap-1.5 hover:border-brand-primary hover:bg-brand-surface-muted transition-all"
              >
                <Share2 className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-bold text-brand-secondary">Split Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
