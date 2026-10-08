import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { removeSessionDevice } from "@/app/actions/operations-tables-actions";
import { canModerateDevices } from "@/lib/auth/permissions";

/**
 * POST /api/v1/operations/sessions/:sessionId/devices/:deviceId/remove
 * User Story 15.7 Section 4 Action 1: Remove companion device from session
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string; deviceId: string }> }
) {
  try {
    const { sessionId, deviceId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const auth = await getAuthenticatedAdmin();

    const role = auth?.user?.role || "manager";
    const hasPermission = canModerateDevices({ role, isSuperAdmin: auth?.user?.role === "super_admin" });

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Insufficient permissions to remove devices." },
        { status: 403 }
      );
    }

    const branchId = body.branch_id || auth?.branch?.id || "";
    const staffId = auth?.user?.id;
    const staffName = auth?.user ? `${auth.user.first_name || ""} ${auth.user.last_name || ""}`.trim() || auth.user.email : "Staff";

    const res = await removeSessionDevice({
      sessionId,
      deviceId,
      branchId,
      staffId,
      staffName,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to remove device" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Device removed from session successfully.",
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
