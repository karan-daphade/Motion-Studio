"use client";

import BrandHeader from "@/components/brand/brand-header";
import { appName } from "@/config/branding";
import { 
  Users, 
  Utensils, 
  Clock, 
  ChefHat, 
  Receipt, 
  UserCheck, 
  Lock, 
  Radio, 
  CircleDot,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-brand-background">
      <BrandHeader 
        roleName="Staff / Operations" 
        currentBranch="Connaught Place, New Delhi" 
        userEmail="rahul.manager@spicegarden.internal" 
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Role Boundary Notice */}
        <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                Protected Route: Staff Operations & POS Terminal (`/staff`)
              </h2>
              <p className="mt-0.5 text-xs text-emerald-800 leading-relaxed">
                Role Claim Guard: Enforces <code className="font-mono font-semibold bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">app_metadata.role == 'staff'</code> with sub-roles (Manager, Waiter, Kitchen, Biller, Cashier). Connected to Supabase Realtime subscriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Live Operational Bar */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
                Live Floor Operations
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                <Radio className="h-3 w-3 text-status-ready animate-pulse" />
                <span>Shift: Dinner Service (19:00 - 23:30)</span>
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-1">
              Real-time synchronization for table sessions, order routing, and bill closing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand-secondary border border-brand-border shadow-sm">
              Assigned Section: AC Main Hall
            </span>
          </div>
        </div>

        {/* Status Pills Demonstration */}
        <div className="rounded-2xl bg-white p-5 shadow-brandCard border border-brand-border mb-8">
          <h3 className="text-xs font-bold text-brand-text-secondary mb-3 uppercase tracking-wider">
            Realtime Order Lifecycle Status Tokens
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Pending Fired", status: "pending", bg: "bg-status-pending/10 text-amber-700 border-status-pending/30" },
              { label: "Preparing in KDS", status: "preparing", bg: "bg-status-preparing/10 text-blue-700 border-status-preparing/30" },
              { label: "Ready for Pickup", status: "ready", bg: "bg-status-ready/10 text-emerald-700 border-status-ready/30" },
              { label: "Served to Table", status: "served", bg: "bg-status-served/10 text-purple-700 border-status-served/30" },
              { label: "Billed / Closing", status: "billed", bg: "bg-status-billed/10 text-slate-700 border-status-billed/30" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold border ${item.bg}`}>
                <CircleDot className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Modules Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-brandCard border border-brand-border">
            <div className="flex items-center gap-3 mb-3 text-brand-secondary">
              <Utensils className="h-5 w-5 text-brand-primary" />
              <h4 className="font-bold text-sm">Table Sessions</h4>
            </div>
            <p className="text-xs text-brand-text-secondary leading-relaxed mb-4">
              Real-time table occupancy, active sessions, and direct waiter order additions.
            </p>
            <div className="rounded-xl bg-brand-surface-muted p-3 text-center text-xs font-medium text-brand-text-muted">
              Listening on Supabase table: <code className="font-mono text-brand-secondary font-bold">tables</code>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-brandCard border border-brand-border">
            <div className="flex items-center gap-3 mb-3 text-brand-secondary">
              <ChefHat className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-sm">Kitchen Display (KDS)</h4>
            </div>
            <p className="text-xs text-brand-text-secondary leading-relaxed mb-4">
              Station-filtered ticket feeds for Main Kitchen, Bar, Bakery, and Beverage counters.
            </p>
            <div className="rounded-xl bg-brand-surface-muted p-3 text-center text-xs font-medium text-brand-text-muted">
              Listening on Supabase table: <code className="font-mono text-brand-secondary font-bold">orders, order_items</code>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-brandCard border border-brand-border">
            <div className="flex items-center gap-3 mb-3 text-brand-secondary">
              <Receipt className="h-5 w-5 text-purple-600" />
              <h4 className="font-bold text-sm">Section Billing Desk</h4>
            </div>
            <p className="text-xs text-brand-text-secondary leading-relaxed mb-4">
              Section-wise invoice compilation, GST calculations, split payments, and session settlement.
            </p>
            <div className="rounded-xl bg-brand-surface-muted p-3 text-center text-xs font-medium text-brand-text-muted">
              Session closes only upon full payment settlement.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
