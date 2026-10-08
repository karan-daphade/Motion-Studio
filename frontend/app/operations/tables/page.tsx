import React from "react";
import { redirect } from "next/navigation";
import { getBranchOperationsData } from "@/app/actions/operations-tables-actions";
import TablesFloorClient from "./tables-floor-client";

export const dynamic = "force-dynamic";

interface OperationsTablesProps {
  searchParams?: Promise<{ branchId?: string }>;
}

export default async function OperationsTablesPage({ searchParams }: OperationsTablesProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const branchId = resolvedParams.branchId;

  const floorData = await getBranchOperationsData(branchId);

  if (!floorData) {
    redirect("/admin");
  }

  return (
    <TablesFloorClient
      initialData={floorData}
      branchId={floorData.branch.id}
    />
  );
}
