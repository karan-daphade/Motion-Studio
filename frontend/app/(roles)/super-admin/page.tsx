"use client";

import BrandHeader from "@/components/brand/brand-header";
import { appName } from "@/config/branding";
import { ShieldAlert, Building2, CreditCard, Activity, ArrowUpRight, Lock, Key } from "lucide-react";

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-brand-background">
      <BrandHeader roleName="Super Admin" userEmail="superadmin@bharatqr.internal" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Role Boundary Notice */}
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50/80 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-blue-900">
                Protected Route: Super Admin Portal (`/super-admin`)
              </h2>
              <p className="mt-0.5 text-xs text-blue-700 leading-relaxed">
                Role Claim Guard: Enforces <code className="font-mono font-semibold bg-blue-100 px-1 py-0.5 rounded text-blue-800">app_metadata.role == 'super_admin'</code> via Supabase Auth JWT. Only SaaS platform owners have access to this tier.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Platform Tenants & Subscriptions
            </h1>
            <p className="text-xs text-brand-text-secondary">
              High-level telemetry across all restaurant organizations hosted on {appName}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <Activity className="h-3.5 w-3.5" />
              <span>Platform Health: 100% Normal</span>
            </span>
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Active Restaurant Tenants", value: "48", change: "+12% this month", icon: Building2 },
            { label: "Live Operating Branches", value: "114", change: "+8 new this week", icon: Activity },
            { label: "MRR (Subscriptions)", value: "₹4,28,000", change: "+18.4% MoM", icon: CreditCard },
            { label: "Security & Auth Events", value: "0 Violations", change: "Audit logging active", icon: Key },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="rounded-2xl bg-white p-5 shadow-brandCard border border-brand-border">
                <div className="flex items-center justify-between text-brand-text-muted mb-3">
                  <span className="text-xs font-medium text-brand-text-secondary">{stat.label}</span>
                  <div className="rounded-lg bg-brand-surface-muted p-2 text-brand-secondary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-brand-secondary tracking-tight">{stat.value}</div>
                <div className="mt-2 text-[11px] font-medium text-status-ready">{stat.change}</div>
              </div>
            );
          })}
        </div>

        {/* Tenants Table Placeholder */}
        <div className="rounded-2xl bg-white shadow-brandCard border border-brand-border overflow-hidden">
          <div className="border-b border-brand-border px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-secondary">Managed Restaurant Tenants</h3>
            <span className="text-xs text-brand-text-muted font-mono">Phase 1 Route Skeleton</span>
          </div>
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface-muted text-brand-text-muted mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-brand-secondary">Super Admin Control Surface Ready</h4>
            <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto">
              Tenant onboarding, global subscription management, and cross-organization audit trails will connect here in future phases.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
