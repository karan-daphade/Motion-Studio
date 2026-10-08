import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { hasAccess } from "@/lib/auth/permissions";
import AppShell from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthenticatedAdmin();

  // Guard: if unauthenticated, redirect to login
  if (!authContext?.user) {
    redirect("/admin/login");
  }

  const { user, restaurant, branch } = authContext;

  if (!restaurant) {
    redirect("/admin/login");
  }

  // Centralized authorization check
  const authorized = hasAccess("order.view", { role: "admin" });
  if (!authorized) {
    redirect("/admin");
  }

  const supabase = createServiceRoleClient();

  // Fetch branches for branch switcher in operations
  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, status")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: true });

  const allBranches = branches || [];
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
      roleName="Operations"
    >
      {children}
    </AppShell>
  );
}
