import React from "react";
import { getOwnerDashboardData } from "@/app/actions/dashboard-actions";
import OutletsManager from "./outlets-manager";

export const dynamic = "force-dynamic";

export default async function OutletsPage() {
  const data = await getOwnerDashboardData("all");

  const branches = data.branches || [];
  const restaurantName = data.restaurant?.name || "Restaurant Hub";

  return (
    <OutletsManager
      initialBranches={branches}
      restaurantName={restaurantName}
    />
  );
}
