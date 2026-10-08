import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { getSessionDevices } from "@/app/actions/operations-tables-actions";
import { canViewWaitingListPhone } from "@/lib/auth/permissions";

/**
 * GET /api/v1/operations/sessions/:sessionId/devices
 * User Story 15.7 Section 4: Staff Session Panel - Device Tab
 * Fetches all connected devices for the active table session.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const url = new URL(req.url);
    let branchId = url.searchParams.get("branch_id") || "";

    const auth = await getAuthenticatedAdmin();
    if (!branchId && auth?.branch?.id) {
      branchId = auth.branch.id;
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: sessionId" },
        { status: 400 }
      );
    }

    const canViewPhone = auth ? canViewWaitingListPhone({ role: auth.user.role }) : false;

    const res = await getSessionDevices({
      sessionId,
      branchId,
      canViewPhone,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to load session devices" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        devices: res.devices,
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
