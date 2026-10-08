import React from "react";
import { 
  Receipt, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Filter,
  Search,
  Bell,
  Printer
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function OperationsOrdersPage() {
  const sampleOrders = [
    {
      id: "ORD-101",
      table: "Table T3",
      time: "4 mins ago",
      status: "waiting_accept",
      token: "KOT #42",
      total: 620,
      items: [
        { name: "Paneer Butter Masala", qty: 1, tag: "veg" },
        { name: "Butter Naan", qty: 3, tag: "veg" },
        { name: "Jeera Rice", qty: 1, tag: "veg" },
      ],
      notes: "Make it spicy, extra butter",
    },
    {
      id: "ORD-102",
      table: "Table T1",
      time: "18 mins ago",
      status: "preparing",
      token: "KOT #41",
      total: 840,
      items: [
        { name: "Chicken Tikka Kebab", qty: 1, tag: "non-veg" },
        { name: "Garlic Naan", qty: 2, tag: "veg" },
        { name: "Fresh Lime Soda", qty: 2, tag: "veg" },
      ],
    },
    {
      id: "ORD-103",
      table: "Bar B1",
      time: "12 mins ago",
      status: "ready",
      token: "BOT #12",
      total: 1100,
      items: [
        { name: "Signature Cocktail", qty: 2, tag: "veg" },
        { name: "Loaded Nachos", qty: 1, tag: "veg" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Boundary Notification Banner */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-purple-600 p-2 text-white shrink-0 shadow-sm">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-purple-950">
                Live Operations: Order Dispatch & KOT Tracking
              </h2>
              <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 border border-purple-300">
                Phase 2 Core Screen
              </span>
            </div>
            <p className="text-xs text-purple-800 mt-1 leading-relaxed">
              Shared operational interface for Captains, Cashiers, and Managers. Full live WebSocket order synchronization, digital KOT printing, and customer bill dispatching will be wired in <strong>Prompt 15</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Live Orders & KOTs
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {sampleOrders.length} Active
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Real-time incoming orders, kitchen ticket status, items in preparation, and ready notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
          >
            <Printer className="h-4 w-4 text-brand-text-muted" />
            <span>Reprint KOT</span>
          </button>
          <Link
            href="/operations/tables"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <span>+ Punch New Order</span>
          </Link>
        </div>
      </div>

      {/* Sub-view Order Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          className="rounded-xl bg-brand-secondary text-white px-3.5 py-1.5 text-xs font-bold shadow-sm"
        >
          All Orders ({sampleOrders.length})
        </button>
        <button
          type="button"
          className="rounded-xl bg-white border border-brand-border text-rose-700 px-3.5 py-1.5 text-xs font-bold hover:bg-rose-50"
        >
          Waiting Accept (1)
        </button>
        <button
          type="button"
          className="rounded-xl bg-white border border-brand-border text-amber-700 px-3.5 py-1.5 text-xs font-bold hover:bg-amber-50"
        >
          Preparing in Kitchen (1)
        </button>
        <button
          type="button"
          className="rounded-xl bg-white border border-brand-border text-emerald-700 px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-50"
        >
          Ready to Serve (1)
        </button>
        <button
          type="button"
          className="rounded-xl bg-white border border-brand-border text-slate-700 px-3.5 py-1.5 text-xs font-bold hover:bg-slate-50"
        >
          Completed Today (14)
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sampleOrders.map((order) => {
          let badgeCol = "bg-rose-100 text-rose-800 border-rose-300";
          let badgeText = "Pending Accept";

          if (order.status === "preparing") {
            badgeCol = "bg-amber-100 text-amber-800 border-amber-300";
            badgeText = "Cooking in KDS";
          } else if (order.status === "ready") {
            badgeCol = "bg-emerald-100 text-emerald-800 border-emerald-300";
            badgeText = "Food Ready to Serve";
          }

          return (
            <div
              key={order.id}
              className="rounded-3xl border border-brand-border bg-white p-5 shadow-brandCard hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-brand-border/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-brand-secondary">{order.table}</span>
                      <span className="text-xs font-bold text-brand-text-muted">• {order.token}</span>
                    </div>
                    <span className="text-[11px] text-brand-text-muted flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{order.time}</span>
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badgeCol}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Items List */}
                <div className="py-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-secondary">{item.qty}x</span>
                        <span className="text-brand-text-primary">{item.name}</span>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${item.tag === "veg" ? "bg-emerald-500" : "bg-rose-500"}`} />
                    </div>
                  ))}
                  {order.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 font-medium">
                      Note: {order.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-brand-text-muted">Total Bill</span>
                  <p className="text-sm font-black text-brand-secondary">₹{order.total}</p>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "waiting_accept" && (
                    <button
                      type="button"
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-colors"
                    >
                      Accept & Fire
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      type="button"
                      className="rounded-xl bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      type="button"
                      className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      Mark Served
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
