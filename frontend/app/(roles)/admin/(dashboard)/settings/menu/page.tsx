import React from "react";
import { getOnboardingData } from "@/app/actions/onboarding-actions";
import { getOwnerDashboardData } from "@/app/actions/dashboard-actions";
import MenuClient from "./menu-client";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface MenuSettingsPageProps {
  searchParams?: Promise<{ branchId?: string }>;
}

export default async function MenuSettingsPage({ searchParams }: MenuSettingsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const branchId = resolvedParams.branchId;

  const [onboardingRes, dashboardRes] = await Promise.all([
    getOnboardingData(branchId),
    getOwnerDashboardData("all"),
  ]);

  if (!onboardingRes.success || !onboardingRes.branch) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-base font-bold text-rose-900">Branch Not Found</h2>
        <p className="text-xs text-rose-700 mt-1">
          {onboardingRes.error || "Please select an active branch to configure menu catalog."}
        </p>
      </div>
    );
  }

  const branches = (dashboardRes.branches || []).map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <MenuClient
      branchId={onboardingRes.branch.id}
      branchName={onboardingRes.branch.name}
      branches={branches}
      initialCategories={onboardingRes.categories || []}
      initialItems={onboardingRes.items || []}
      initialAddons={onboardingRes.addons || []}
      kitchens={onboardingRes.kitchens || []}
    />
  );
}
