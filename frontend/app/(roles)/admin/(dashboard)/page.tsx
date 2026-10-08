import React from "react";
import { getOwnerDashboardData } from "@/app/actions/dashboard-actions";
import { AlertCircle } from "lucide-react";
import AdminDashboardLiveClient from "./admin-dashboard-live-client";

export const dynamic = "force-dynamic";

interface AdminDashboardProps {
  searchParams?: Promise<{ branchId?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const branchIdParam = resolvedParams.branchId;

  const dashboardData = await getOwnerDashboardData(branchIdParam);

  if (!dashboardData.success || !dashboardData.metrics) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-base font-bold text-rose-900">Dashboard Unavailable</h2>
        <p className="text-xs text-rose-700 mt-1">{dashboardData.error || "Failed to load dashboard data."}</p>
      </div>
    );
  }

  return (
    <AdminDashboardLiveClient 
      initialData={dashboardData} 
      branchIdParam={branchIdParam} 
    />
  );
}
