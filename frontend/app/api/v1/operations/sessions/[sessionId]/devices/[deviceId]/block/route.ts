import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { blockSessionDevice } from "@/app/actions/operations-tables-actions";
import { canModerateDevices } from "@/lib/auth/permissions";

/**
 * POST /api/v1/operations/sessions/:sessionId/devices/:deviceId/block
 * User Story 15.7 Section 4 Action 2: Block customer (1-Hour outlet ban)
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
        { success: false, error: "Unauthorized: Insufficient permissions to block devices." },
        { status: 403 }
      );
    }

    const branchId = body.branch_id || auth?.branch?.id || "";
    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: branch_id" },
        { status: 400 }
      );
    }

    const staffId = auth?.user?.id;
    const staffName = auth?.user ? `${auth.user.first_name || ""} ${auth.user.last_name || ""}`.trim() || auth.user.email : "Staff";

    const res = await blockSessionDevice({
      sessionId,
      deviceId,
      branchId,
      staffId,
      staffName,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to block device" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer device blocked for 1 hour successfully.",
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
