import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { getOccupiedTableScanAlerts } from "@/app/actions/operations-tables-actions";

/**
 * GET /api/v1/operations/alerts/occupied-scans
 * User Story 15.7 Workflow 1: Informational alerts for direct physical QR scans on occupied tables
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let branchId = url.searchParams.get("branch_id") || "";

    if (!branchId) {
      const auth = await getAuthenticatedAdmin();
      branchId = auth?.branch?.id || "";
    }

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: branch_id" },
        { status: 400 }
      );
    }

    const res = await getOccupiedTableScanAlerts(branchId);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to fetch scan alerts" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        alerts: res.alerts,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
