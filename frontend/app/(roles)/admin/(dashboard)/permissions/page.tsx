import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Users, 
  Key, 
  Check, 
  X, 
  AlertCircle,
  Building2,
  Utensils,
  Receipt,
  ChefHat,
  CreditCard
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function PermissionsPage() {
  const roles = [
    {
      role: "Branch Manager",
      icon: ShieldCheck,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description: "Full operational authority over shift supervision, menu updates, refunds, and void bills.",
      permissions: ["Live Orders", "KDS", "Billing & Cashier", "Table Management", "Staff Supervision", "Shift Closing"],
    },
    {
      role: "Section Manager",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Oversees designated dining areas, floor plan arrangement, and waiter assignments.",
      permissions: ["Live Orders", "Table Management", "Assign Waitstaff", "Section Queue"],
    },
    {
      role: "Waiter / Captain",
      icon: Utensils,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Order punch-in, running KOTs to kitchen stations, and guest bill requests.",
      permissions: ["Live Orders (Create/Fire)", "Table Service", "KOT Generation"],
    },
    {
      role: "Kitchen Staff",
      icon: ChefHat,
      color: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Receives prep tickets on Kitchen Display Screen, item readiness marks.",
      permissions: ["KDS View", "Ticket Readiness", "Station Queue"],
    },
    {
      role: "Cashier & Biller",
      icon: CreditCard,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description: "Generates tax invoices, applies validated promo discounts, settles cash/UPI drawer.",
      permissions: ["Billing Desk", "Cash Drawer", "Invoice Generation", "Promo Validation"],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Role & Permissions Engine
            </h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
              Phase 2: Granular RBAC Matrix
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Centralized role-based access control architecture enforcing operational boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3.5 py-2 text-xs font-bold text-purple-800">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Custom Role Designer Coming Soon</span>
          </span>
        </div>
      </div>

      {/* Architecture Notice Banner */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-brandCard">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-brand-primary-light p-2.5 text-brand-primary border border-brand-primary/20 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-secondary">
              Centralized Authorization Enforcer
            </h3>
            <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
              All routes in <code className="font-mono bg-brand-surface-muted px-1 py-0.5 rounded text-brand-primary font-bold">/admin/*</code> are restricted strictly to restaurant owners. 
              The live screens in <code className="font-mono bg-brand-surface-muted px-1 py-0.5 rounded text-brand-primary font-bold">/operations/*</code> are governed by the centralized <code className="font-mono bg-brand-surface-muted px-1 py-0.5 rounded text-brand-primary font-bold">hasAccess(permission, context)</code> helper. In Phase 2, you will be able to customize per-employee permission toggles directly from this matrix.
            </p>
          </div>
        </div>
      </div>

      {/* Role Definitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.role}
              className="rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${r.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-secondary">{r.role}</h4>
                    <span className="text-[10px] font-semibold text-brand-text-muted">Standard POS Role</span>
                  </div>
                </div>

                <p className="text-xs text-brand-text-secondary leading-relaxed mb-4">
                  {r.description}
                </p>

                <div className="border-t border-brand-border/60 pt-3">
                  <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                    Default Capabilities
                  </p>
                  <div className="space-y-1.5">
                    {r.permissions.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-xs text-brand-secondary">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                <span className="text-[11px] text-brand-text-muted">Status: Active in schema</span>
                <span className="text-xs font-bold text-brand-primary">Built-in</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
