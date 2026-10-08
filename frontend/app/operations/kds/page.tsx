import React from "react";
import { 
  ChefHat, 
  Clock, 
  Check, 
  AlertTriangle, 
  Flame, 
  Wine, 
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function OperationsKdsPage() {
  const kdsTickets = [
    {
      id: "TICKET-1",
      token: "KOT #42",
      table: "Table T3",
      station: "Main Kitchen",
      server: "Ramesh (Captain)",
      elapsed: "04:15",
      urgent: false,
      items: [
        { name: "Paneer Butter Masala", qty: 1, notes: "Spicy", completed: false },
        { name: "Butter Naan", qty: 3, notes: "Extra crispy", completed: false },
        { name: "Jeera Rice", qty: 1, notes: "", completed: true },
      ],
    },
    {
      id: "TICKET-2",
      token: "KOT #41",
      table: "Table T1",
      station: "Main Kitchen",
      server: "Vikram (Waiter)",
      elapsed: "14:40",
      urgent: true,
      items: [
        { name: "Chicken Tikka Kebab", qty: 1, notes: "Well done", completed: false },
        { name: "Garlic Naan", qty: 2, notes: "", completed: false },
      ],
    },
    {
      id: "TICKET-3",
      token: "BOT #12",
      table: "Bar B1",
      station: "Bar & Lounge",
      server: "Sunil (Bartender)",
      elapsed: "02:20",
      urgent: false,
      items: [
        { name: "Signature Cocktail", qty: 2, notes: "Less ice", completed: false },
        { name: "Loaded Nachos", qty: 1, notes: "Extra cheese dip", completed: true },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Boundary Notification Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-600 p-2 text-white shrink-0 shadow-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-amber-950">
                Live Operations: Kitchen Display Screen (KDS)
              </h2>
              <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-300">
                Phase 2 Core Screen
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Touchscreen-optimized KDS terminal for Head Chefs and line cooks. Audio chimes, real-time ticket bumping, item-level prep timers, and multi-station routing will be wired in <strong>Prompt 16</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Kitchen Display (KDS)
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 border border-emerald-300 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Active
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Order tickets categorized by prep station, elapsed timers, and dish readiness flags.
          </p>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            className="rounded-xl bg-brand-secondary text-white px-3.5 py-1.5 text-xs font-bold shadow-sm"
          >
            All Stations (3)
          </button>
          <button
            type="button"
            className="rounded-xl bg-white border border-brand-border text-brand-secondary px-3.5 py-1.5 text-xs font-bold hover:bg-brand-surface-muted"
          >
            Main Kitchen (2)
          </button>
          <button
            type="button"
            className="rounded-xl bg-white border border-brand-border text-brand-secondary px-3.5 py-1.5 text-xs font-bold hover:bg-brand-surface-muted"
          >
            Bar (1)
          </button>
        </div>
      </div>

      {/* KDS Prep Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kdsTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`rounded-3xl border-2 p-5 shadow-sm transition-all flex flex-col justify-between bg-white ${
              ticket.urgent
                ? "border-rose-400 bg-rose-50/20 shadow-rose-100"
                : "border-brand-border hover:border-brand-border/80"
            }`}
          >
            <div>
              {/* Header with Token & Timer */}
              <div className="flex items-start justify-between pb-3 border-b border-brand-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-brand-secondary">{ticket.table}</span>
                    <span className="text-xs font-bold text-brand-text-muted">{ticket.token}</span>
                  </div>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">
                    {ticket.station} • {ticket.server}
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border ${
                  ticket.urgent
                    ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{ticket.elapsed}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 space-y-2.5">
                {ticket.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between p-2 rounded-xl transition-all ${
                      item.completed 
                        ? "bg-slate-100/80 line-through text-brand-text-muted" 
                        : "bg-brand-surface-muted/60 text-brand-secondary font-semibold"
                    }`}
                  >
                    <div className="flex items-start gap-2 text-xs">
                      <span className="font-black text-brand-primary">{item.qty}x</span>
                      <div>
                        <span>{item.name}</span>
                        {item.notes && (
                          <p className="text-[10px] text-amber-700 not-italic font-bold">
                            ★ {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                        item.completed
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white border-brand-border text-transparent hover:border-brand-primary"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bump Action Button */}
            <div className="pt-3 border-t border-brand-border/60">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover py-2.5 text-xs font-bold text-white shadow-brandCard transition-all"
              >
                <Check className="h-4 w-4" />
                <span>Bump Ticket (Mark All Ready)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
