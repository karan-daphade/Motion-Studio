"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

export interface BranchSummary {
  id: string;
  name: string;
  status: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  onboarding_progress?: any;
  created_at: string;
  table_count?: number;
  employee_count?: number;
  kitchen_count?: number;
}

export interface DashboardMetrics {
  totalRevenueToday: number;
  activeOrdersCount: number;
  todayOrdersCount: number;
  occupiedTablesCount: number;
  totalTablesCount: number;
  activeKitchensCount: number;
  activeEmployeesCount: number;
  totalCategoriesCount: number;
  totalItemsCount: number;
}

export async function getOwnerDashboardData(selectedBranchId?: string) {
  const authContext = await getAuthenticatedAdmin(selectedBranchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const { user, restaurant } = authContext;
  if (!restaurant) {
    return { success: false, error: "No restaurant profile associated with this account." };
  }

  const supabase = createServiceRoleClient();

  // 1. Fetch all branches belonging to this restaurant tenant
  const { data: allBranches, error: branchErr } = await supabase
    .from("branches")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: true });

  if (branchErr || !allBranches || allBranches.length === 0) {
    return { 
      success: true, 
      user, 
      restaurant, 
      branches: [], 
      selectedBranch: null,
      isAggregateView: false,
      metrics: {
        totalRevenueToday: 0,
        activeOrdersCount: 0,
        todayOrdersCount: 0,
        occupiedTablesCount: 0,
        totalTablesCount: 0,
        activeKitchensCount: 0,
        activeEmployeesCount: 0,
        totalCategoriesCount: 0,
        totalItemsCount: 0,
      } 
    };
  }

  const isAggregate = selectedBranchId === "all";
  let activeBranch = null;

  if (isAggregate) {
    activeBranch = null;
  } else if (selectedBranchId) {
    activeBranch = allBranches.find((b) => b.id === selectedBranchId) || allBranches[0];
  } else {
    activeBranch = authContext.branch || allBranches[0];
  }

  const targetBranchIds = isAggregate 
    ? allBranches.map((b) => b.id) 
    : (activeBranch ? [activeBranch.id] : []);

  const allBranchIds = allBranches.map((b) => b.id);

  // Fetch sections for all branches to map tables -> sections -> branches
  const { data: allSections } = await supabase
    .from("sections")
    .select("id, branch_id")
    .in("branch_id", allBranchIds)
    .is("deleted_at", null);

  const sectionBranchMap = new Map((allSections || []).map((s) => [s.id, s.branch_id]));
  const allSectionIds = (allSections || []).map((s) => s.id);

  // 2. Fetch counts concurrently
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [
    allTablesRes,
    kitchensRes,
    employeesRes,
    categoriesRes,
    itemsRes,
    ordersTodayRes,
    activeOrdersRes,
    tableSessionsRes
  ] = await Promise.all([
    allSectionIds.length > 0
      ? supabase
          .from("tables")
          .select("id, section_id, status")
          .in("section_id", allSectionIds)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as any[], error: null }),
    supabase
      .from("kitchens")
      .select("id, branch_id")
      .in("branch_id", allBranchIds)
      .eq("active", true)
      .is("deleted_at", null),
    supabase
      .from("employees")
      .select("id, branch_id")
      .in("branch_id", allBranchIds)
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("categories")
      .select("id, branch_id")
      .in("branch_id", targetBranchIds)
      .is("deleted_at", null),
    supabase
      .from("items")
      .select("id, branch_id")
      .in("branch_id", targetBranchIds)
      .is("deleted_at", null),
    supabase
      .from("orders")
      .select("id, total_amount, status")
      .in("branch_id", targetBranchIds)
      .gte("created_at", todayIso),
    supabase
      .from("orders")
      .select("id")
      .in("branch_id", targetBranchIds)
      .in("status", ["pending", "preparing", "ready", "served"]),
    supabase
      .from("table_sessions")
      .select("id, table_id")
      .eq("status", "active")
  ]);

  const rawTables = allTablesRes.data || [];
  const allTablesWithBranch = rawTables.map((t) => ({
    ...t,
    branch_id: sectionBranchMap.get(t.section_id) || null,
  }));

  const tables = allTablesWithBranch.filter(
    (t) => t.branch_id && targetBranchIds.includes(t.branch_id) && t.status !== "inactive"
  );
  
  // Occupied table calculation: strictly cross-reference active dining sessions to prevent stale DB flags
  const activeSessionTableIds = new Set((tableSessionsRes.data || []).map((s: any) => s.table_id));
  const occupiedTables = tables.filter((t) => activeSessionTableIds.has(t.id));

  // Self-heal stale occupied flags in DB if table has status === 'occupied' but no active dining session
  const staleOccupied = tables.filter((t) => (t.status === "occupied" || t.status === "seated") && !activeSessionTableIds.has(t.id));
  if (staleOccupied.length > 0) {
    const staleIds = staleOccupied.map((t) => t.id);
    supabase.from("tables").update({ status: "active" }).in("id", staleIds).then(() => {});
  }
  const kitchens = (kitchensRes.data || []).filter((k) => targetBranchIds.includes(k.branch_id));
  const employees = (employeesRes.data || []).filter((e) => targetBranchIds.includes(e.branch_id));
  const categories = categoriesRes.data || [];
  const items = itemsRes.data || [];
  const ordersToday = ordersTodayRes.data || [];
  const activeOrders = activeOrdersRes.data || [];

  const totalRevenueToday = ordersToday
    .filter((o) => o.status === "billed" || o.status === "served")
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Compute branch-specific quick stats for the outlet list
  const branchesWithStats: BranchSummary[] = allBranches.map((b) => {
    const bTables = allTablesWithBranch.filter(
      (t) => t.branch_id === b.id && t.status !== "inactive"
    ).length;
    const bEmps = (employeesRes.data || []).filter((e) => e.branch_id === b.id).length;
    const bKits = (kitchensRes.data || []).filter((k) => k.branch_id === b.id).length;
    return {
      id: b.id,
      name: b.name,
      status: b.status,
      address: b.address,
      city: b.city,
      state: b.state,
      phone: b.phone,
      onboarding_progress: b.onboarding_progress,
      created_at: b.created_at,
      table_count: bTables,
      employee_count: bEmps,
      kitchen_count: bKits,
    };
  });

  const metrics: DashboardMetrics = {
    totalRevenueToday,
    activeOrdersCount: activeOrders.length,
    todayOrdersCount: ordersToday.length,
    occupiedTablesCount: occupiedTables.length,
    totalTablesCount: tables.length,
    activeKitchensCount: kitchens.length,
    activeEmployeesCount: employees.length,
    totalCategoriesCount: categories.length,
    totalItemsCount: items.length,
  };

  return {
    success: true,
    user,
    restaurant,
    branches: branchesWithStats,
    selectedBranch: activeBranch,
    isAggregateView: isAggregate,
    metrics,
  };
}

export async function createAdditionalOutlet(name: string, city: string = "Mumbai") {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext?.restaurant || !authContext?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createServiceRoleClient();
  const { data: newBranch, error } = await supabase
    .from("branches")
    .insert({
      restaurant_id: authContext.restaurant.id,
      name: name.trim(),
      city: city.trim(),
      status: "draft",
      onboarding_progress: {
        current_step: 1,
        completed_steps: [],
        branch_meta: { city: city.trim() },
      },
      created_by: authContext.user.id,
    })
    .select("id")
    .single();

  if (error || !newBranch) {
    return { success: false, error: error?.message || "Failed to create outlet." };
  }

  revalidatePath("/admin/outlets");
  revalidatePath("/admin");
  return { success: true, branchId: newBranch.id };
}
