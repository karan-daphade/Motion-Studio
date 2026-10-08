import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { getPendingTableAccessRequests } from "@/app/actions/operations-tables-actions";

/**
 * GET /api/v1/operations/alerts/table-access-requests
 * User Story 15.6 – Section 3: Staff POS Alerts Feed
 * Lists unresolved table QR access requests for the Alerts drawer
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

    const res = await getPendingTableAccessRequests(branchId);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to fetch alerts" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requests: res.requests,
        pending_count: res.pendingCount,
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
