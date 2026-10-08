import React from "react";
import Link from "next/link";
import { appName } from "@/config/branding";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getTableScanStatus, recordOccupiedTableScanAlert } from "@/app/actions/operations-tables-actions";
import TableQRScanClient from "@/components/waitlist/table-qr-scan-client";

interface TableScanPageProps {
  params: Promise<{
    tableId: string;
  }>;
  searchParams?: Promise<{
    branch_id?: string;
  }>;
}

export default async function TableScanPage({ params, searchParams }: TableScanPageProps) {
  const { tableId } = await params;
  const sParams = searchParams ? await searchParams : {};
  const branchId = sParams.branch_id;

  const res = await getTableScanStatus(tableId, branchId);

  if (res.success && res.status === "OCCUPIED" && res.table?.branchId) {
    try {
      await recordOccupiedTableScanAlert({
        branchId: res.table.branchId,
        tableId,
        tableLabel: res.table.label || res.table.name,
      });
    } catch {}
  }

  if (!res.success || !res.table) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-8 text-center shadow-brandCard space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="text-lg font-bold text-brand-secondary">
            Table Not Found
          </h1>

          <p className="text-xs text-brand-text-secondary leading-relaxed">
            {res.error || "The scanned table QR code could not be verified in the restaurant system."}
          </p>

          <div className="pt-4 border-t border-brand-border/60">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to {appName}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TableQRScanClient
      initialStatus={res.status || "AVAILABLE"}
      table={res.table}
    />
  );
}
