import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { dismissOccupiedTableAlert } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/operations/alerts/occupied-scans/:alertId/dismiss
 * User Story 15.7 Workflow 1: Dismiss informational alert
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ alertId: string }> }
) {
  try {
    const { alertId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const auth = await getAuthenticatedAdmin();

    const branchId = body.branch_id || auth?.branch?.id || "";
    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: branch_id" },
        { status: 400 }
      );
    }

    const res = await dismissOccupiedTableAlert({
      alertId,
      branchId,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to dismiss alert" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Alert dismissed successfully",
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
