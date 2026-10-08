import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import AppShell from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthenticatedAdmin();

  if (!authContext?.user) {
    redirect("/admin/login");
  }

  const { user, restaurant, branch } = authContext;

  if (!restaurant) {
    redirect("/admin/login");
  }

  const supabase = createServiceRoleClient();

  // Fetch all branches for the restaurant tenant
  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, status, onboarding_progress")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: true });

  const allBranches = branches || [];

  // Verify that at least one branch has completed onboarding or is active.
  // If not, redirect to /admin/onboarding
  const hasAnyCompletedBranch = allBranches.some((b) => {
    if (b.status === "active") return true;
    const completed = b.onboarding_progress?.completed_steps;
    return Array.isArray(completed) && [1, 2, 3, 4, 5, 6, 7].every((s) => completed.includes(s));
  });

  if (!hasAnyCompletedBranch) {
    redirect("/admin/onboarding");
  }

  // Determine current/default branch
  const activeBranch = branch || allBranches.find((b) => b.status === "active") || allBranches[0];

  const branchOptions = allBranches.map((b) => ({
    id: b.id,
    name: b.name,
    status: b.status,
  }));

  return (
    <AppShell
      user={user}
      branches={branchOptions}
      currentBranch={
        activeBranch
          ? { id: activeBranch.id, name: activeBranch.name, status: activeBranch.status }
          : null
      }
      roleName="Admin"
    >
      {children}
    </AppShell>
  );
}
