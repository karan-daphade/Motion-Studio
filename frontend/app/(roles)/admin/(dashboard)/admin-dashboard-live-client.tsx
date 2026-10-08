"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { 
  IndianRupee, 
  ShoppingBag, 
  Receipt, 
  LayoutGrid, 
  ChefHat, 
  Users, 
  UtensilsCrossed, 
  Store, 
  ArrowRight, 
  ArrowUpRight, 
  Plus, 
  Building2, 
  Calculator,
  Radio
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOwnerDashboardData } from "@/app/actions/dashboard-actions";

interface AdminDashboardLiveClientProps {
  initialData: any;
  branchIdParam?: string;
}

export default function AdminDashboardLiveClient({
  initialData,
  branchIdParam,
}: AdminDashboardLiveClientProps) {
  const [data, setData] = useState(initialData);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [, startTransition] = useTransition();

  const refreshData = useCallback(async () => {
    try {
      const fresh = await getOwnerDashboardData(branchIdParam);
      if (fresh && fresh.success && fresh.metrics) {
        startTransition(() => {
          setData(fresh);
        });
      }
    } catch (err) {
      console.warn("Failed to refresh admin dashboard in real-time:", err);
    }
  }, [branchIdParam]);

  // Real-time WebSocket subscriptions scoped to branch/restaurant
  useEffect(() => {
    const targetBranchId = branchIdParam || data.selectedBranch?.id;
    const targetRestId = data.restaurant?.id;
    const channelIdentifier = targetBranchId ? `branch_${targetBranchId}` : (targetRestId ? `rest_${targetRestId}` : null);

    if (!channelIdentifier) return;

    const supabase = createClient();
    let channelBuilder = supabase.channel(`admin_dashboard_live_${channelIdentifier}`);

    // High-impact lifecycle events with tenant filters
    if (targetBranchId) {
      channelBuilder = channelBuilder
        .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `branch_id=eq.${targetBranchId}` }, () => refreshData())
        .on("postgres_changes", { event: "*", schema: "public", table: "table_sessions" }, () => refreshData())
        .on("postgres_changes", { event: "*", schema: "public", table: "bills", filter: `branch_id=eq.${targetBranchId}` }, () => refreshData())
        .on("postgres_changes", { event: "*", schema: "public", table: "waiting_list_entries", filter: `branch_id=eq.${targetBranchId}` }, () => refreshData());
    } else {
      channelBuilder = channelBuilder
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => refreshData())
        .on("postgres_changes", { event: "*", schema: "public", table: "table_sessions" }, () => refreshData())
        .on("postgres_changes", { event: "*", schema: "public", table: "bills" }, () => refreshData());
    }

    const channel = channelBuilder.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        setIsLiveActive(true);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setIsLiveActive(false);
      }
    });

    // Revalidate on network reconnect
    const handleOnline = () => refreshData();
    window.addEventListener("online", handleOnline);

    // Passive safety heartbeat every 60 seconds (reduced from aggressive 12s poll)
    const intervalId = setInterval(() => {
      refreshData();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", handleOnline);
      clearInterval(intervalId);
    };
  }, [branchIdParam, data.selectedBranch?.id, data.restaurant?.id, refreshData]);

  const {
    restaurant,
    branches = [],
    selectedBranch,
    isAggregateView,
    metrics,
  } = data;

  const activeBranchName = isAggregateView 
    ? "All Outlets (Consolidated)" 
    : (selectedBranch?.name || "Active Outlet");

  const occupancyRate = metrics.totalTablesCount > 0 
    ? Math.round((metrics.occupiedTablesCount / metrics.totalTablesCount) * 100) 
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner & Quick Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              {restaurant?.name || "Restaurant Hub"}
            </h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
              isAggregateView 
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <span className={`h-2 w-2 rounded-full ${isAggregateView ? "bg-purple-500" : "bg-emerald-500 animate-pulse"}`} />
              {activeBranchName}
            </span>

            {/* Live Real-time Status Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
              <Radio className={`h-3 w-3 ${isLiveActive ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
              <span>{isLiveActive ? "WebSocket Live" : "Connecting..."}</span>
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Real-time management dashboard and live operational performance metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/operations/tables"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Open Live POS</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/admin/outlets?action=new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all shadow-xs"
          >
            <Plus className="h-4 w-4 text-brand-primary" />
            <span>Add Outlet</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Synchronized via WebSockets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue Today */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-brandCard hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text-secondary">Today&apos;s Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-brand-secondary tracking-tight">
              ₹{metrics.totalRevenueToday.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-brand-text-muted mt-1">
              From settled bills today
            </p>
          </div>
        </div>

        {/* Metric 2: Live Active Orders */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-brandCard hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text-secondary">Active Live Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-brand-secondary tracking-tight">
                {metrics.activeOrdersCount}
              </p>
              {metrics.activeOrdersCount > 0 && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-brand-text-muted mt-1">
              {metrics.todayOrdersCount} total orders today
            </p>
          </div>
        </div>

        {/* Metric 3: Physical Table Occupancy */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-brandCard hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text-secondary">Table Occupancy</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <LayoutGrid className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-brand-secondary tracking-tight">
              {metrics.occupiedTablesCount} <span className="text-sm font-medium text-brand-text-muted">/ {metrics.totalTablesCount}</span>
            </p>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(occupancyRate, 100)}%` }} 
              />
            </div>
            <p className="text-[11px] text-brand-text-muted mt-1">
              {occupancyRate}% current dining floor capacity
            </p>
          </div>
        </div>

        {/* Metric 4: Kitchen Stations & Active Staff */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-brandCard hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text-secondary">Kitchens & Staff</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary border border-brand-primary/20">
              <ChefHat className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-brand-secondary tracking-tight">
                {metrics.activeKitchensCount}
              </p>
              <span className="text-xs font-medium text-brand-text-muted">KDS stations</span>
            </div>
            <p className="text-[11px] text-brand-text-muted mt-1">
              {metrics.activeEmployeesCount} active employees • {metrics.totalItemsCount} menu items
            </p>
          </div>
        </div>
      </div>

      {/* 3. Live Operations Launchpad */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-brand-secondary uppercase tracking-wider">
              Live Operations Control Deck
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Direct access to live restaurant floor, orders, kitchen displays, and billing terminals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Link
            href="/operations/tables"
            className="group rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-primary hover:shadow-brandCard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-brand-secondary mt-3 group-hover:text-brand-primary transition-colors">
              Floor & Tables
            </h3>
            <p className="text-[11px] text-brand-text-muted mt-0.5">
              Live table status, seating & guest bills
            </p>
          </Link>

          <Link
            href="/operations/orders"
            className="group rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-primary hover:shadow-brandCard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-brand-secondary mt-3 group-hover:text-brand-primary transition-colors">
              Live Orders
            </h3>
            <p className="text-[11px] text-brand-text-muted mt-0.5">
              Incoming, pending & active KOTs
            </p>
          </Link>

          <Link
            href="/operations/kds"
            className="group rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-primary hover:shadow-brandCard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
              <ChefHat className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-brand-secondary mt-3 group-hover:text-brand-primary transition-colors">
              Kitchen Display (KDS)
            </h3>
            <p className="text-[11px] text-brand-text-muted mt-0.5">
              Station ticket view & item readiness
            </p>
          </Link>

          <Link
            href="/operations/billing"
            className="group rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-primary hover:shadow-brandCard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-brand-secondary mt-3 group-hover:text-brand-primary transition-colors">
              Billing & Cashier
            </h3>
            <p className="text-[11px] text-brand-text-muted mt-0.5">
              Generate receipts, settle cash & UPI
            </p>
          </Link>

          <Link
            href="/operations/menu"
            className="group rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-primary hover:shadow-brandCard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary border border-brand-primary/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-brand-secondary mt-3 group-hover:text-brand-primary transition-colors">
              Quick Menu Stock
            </h3>
            <p className="text-[11px] text-brand-text-muted mt-0.5">
              86 / toggle item availability instantly
            </p>
          </Link>
        </div>
      </section>

      {/* 4. Outlets Directory Snapshot */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-brand-secondary uppercase tracking-wider">
              Outlets & Branches ({branches.length})
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Review multi-branch locations or resume onboarding for draft outlets.
            </p>
          </div>
          <Link
            href="/admin/outlets"
            className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
          >
            <span>View All Outlets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b: any) => {
            const isActive = b.status === "active";
            const completedCount = Array.isArray(b.onboarding_progress?.completed_steps) 
              ? b.onboarding_progress.completed_steps.length 
              : 0;

            return (
              <div 
                key={b.id}
                className={`rounded-2xl border bg-white p-5 shadow-brandCard transition-all ${
                  selectedBranch?.id === b.id && !isAggregateView
                    ? "border-brand-primary ring-1 ring-brand-primary/20"
                    : "border-brand-border hover:border-brand-border/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-secondary">{b.name}</h3>
                    <p className="text-[11px] text-brand-text-muted mt-0.5">
                      {b.city || "Mumbai"} {b.state ? `• ${b.state}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {isActive ? "Active" : `Setup ${completedCount}/7`}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-brand-border/60 pt-3 text-center">
                  <div>
                    <p className="text-xs font-black text-brand-secondary">{b.table_count || 0}</p>
                    <p className="text-[10px] text-brand-text-muted">Tables</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-secondary">{b.kitchen_count || 0}</p>
                    <p className="text-[10px] text-brand-text-muted">Kitchens</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-secondary">{b.employee_count || 0}</p>
                    <p className="text-[10px] text-brand-text-muted">Staff</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2">
                  {isActive ? (
                    <Link
                      href={`/admin?branchId=${b.id}`}
                      className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Select Dashboard</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/onboarding?branchId=${b.id}`}
                      className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
                    >
                      Resume Setup
                    </Link>
                  )}
                  <Link
                    href={`/admin/settings/branch?branchId=${b.id}`}
                    className="text-xs font-medium text-brand-text-secondary hover:text-brand-secondary"
                  >
                    Configure
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Fast Navigation Hub: Settings & Governance */}
      <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
          <div>
            <h3 className="text-sm font-bold text-brand-secondary">Settings & Business Configuration</h3>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Configure outlet profiles, shifts, menu engineering, taxes, and security controls.
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
          >
            <span>All Settings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <Link
            href="/admin/settings/branch"
            className="rounded-xl border border-brand-border/70 p-3 hover:bg-brand-surface-muted transition-colors"
          >
            <Building2 className="h-4 w-4 text-brand-primary mb-1.5" />
            <p className="text-xs font-bold text-brand-secondary">Branch Profile</p>
            <p className="text-[10px] text-brand-text-muted">GSTIN, address, contacts</p>
          </Link>

          <Link
            href="/admin/settings/menu"
            className="rounded-xl border border-brand-border/70 p-3 hover:bg-brand-surface-muted transition-colors"
          >
            <UtensilsCrossed className="h-4 w-4 text-brand-primary mb-1.5" />
            <p className="text-xs font-bold text-brand-secondary">Menu Catalog</p>
            <p className="text-[10px] text-brand-text-muted">Categories, items, pricing</p>
          </Link>

          <Link
            href="/admin/settings/taxes"
            className="rounded-xl border border-brand-border/70 p-3 hover:bg-brand-surface-muted transition-colors"
          >
            <Receipt className="h-4 w-4 text-brand-primary mb-1.5" />
            <p className="text-xs font-bold text-brand-secondary">Taxes & Charges</p>
            <p className="text-[10px] text-brand-text-muted">CGST, SGST, packaging</p>
          </Link>

          <Link
            href="/admin/employees"
            className="rounded-xl border border-brand-border/70 p-3 hover:bg-brand-surface-muted transition-colors"
          >
            <Users className="h-4 w-4 text-brand-primary mb-1.5" />
            <p className="text-xs font-bold text-brand-secondary">Staff Management</p>
            <p className="text-[10px] text-brand-text-muted">Managers, captains, chefs</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
