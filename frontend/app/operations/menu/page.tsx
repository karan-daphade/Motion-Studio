import React from "react";
import { 
  UtensilsCrossed, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Flame,
  Check
} from "lucide-react";
import { getOnboardingData } from "@/app/actions/onboarding-actions";

export const dynamic = "force-dynamic";

interface OperationsMenuProps {
  searchParams?: Promise<{ branchId?: string }>;
}

export default async function OperationsMenuPage({ searchParams }: OperationsMenuProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const branchId = resolvedParams.branchId;

  const onboardingData = await getOnboardingData(branchId);
  const categories = onboardingData.categories || [];
  const items = onboardingData.items || [];
  const branch = onboardingData.branch;

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Boundary Notification Banner */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-rose-600 p-2 text-white shrink-0 shadow-sm">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-rose-950">
                Live Operations: Quick Menu Stock & 86'ing
              </h2>
              <span className="rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 border border-rose-300">
                Phase 2 Core Screen
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Shared operational interface for Head Chefs, Captains, and Managers to immediately mark dishes as Sold Out (86&apos;d) or back in stock during live service rush hours. Direct item availability synchronization will be wired in <strong>Prompt 18</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Quick Menu Stock & 86&apos;ing
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branch?.name || "Active Outlet"}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Toggle real-time item availability on digital QR menus and POS terminals instantly.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          className="rounded-xl bg-brand-secondary text-white px-3.5 py-1.5 text-xs font-bold shadow-sm"
        >
          All Categories ({items.length})
        </button>
        {categories.map((c: any) => (
          <button
            key={c.id}
            type="button"
            className="rounded-xl bg-white border border-brand-border text-brand-secondary px-3.5 py-1.5 text-xs font-bold hover:bg-brand-surface-muted shrink-0"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Items Stock Toggling Grid */}
      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-brand-border bg-white p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-brand-primary-light text-brand-primary flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-brand-secondary">No Menu Items Found</h3>
          <p className="text-xs text-brand-text-secondary mt-1">
            Configure items in Settings &gt; Menu Catalog to enable live stock toggling.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any) => {
            const isOutOfStock = item.out_of_stock || false;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 shadow-xs transition-all flex items-center justify-between ${
                  isOutOfStock
                    ? "bg-slate-50 border-slate-200 opacity-75"
                    : "bg-white border-brand-border hover:border-brand-primary/40"
                }`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      item.dietary_tag === "veg" ? "bg-emerald-500" : "bg-rose-500"
                    }`} />
                    <h4 className="text-xs font-bold text-brand-secondary truncate">{item.name}</h4>
                  </div>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">
                    ₹{item.base_price} • {isOutOfStock ? "Sold Out (86'd)" : "Available for ordering"}
                  </p>
                </div>

                <button
                  type="button"
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    isOutOfStock
                      ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  {isOutOfStock ? "86'd" : "In Stock"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
