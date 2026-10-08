import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canApproveSessionAccess } from "@/lib/auth/permissions";
import { approveTableAccessRequest } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/operations/table-access-requests/:id/approve
 * User Story 15.6 – Section 5 Path A: Staff Approves Table QR Access Request
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const branchId = body.branch_id || body.branchId;
    const auth = await getAuthenticatedAdmin(branchId);

    const accessContext: any = {
      role: auth?.user?.role || "waiter",
      employeeId: auth?.user?.id,
      name: `${auth?.user?.first_name || ""} ${auth?.user?.last_name || ""}`.trim() || "Staff",
      permissions: (auth?.user as any)?.permissions,
    };

    if (!canApproveSessionAccess(accessContext)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing tables.approve_session_access permission" },
        { status: 403 }
      );
    }

    const staffName = body.staff_name || body.staffName || accessContext.name;
    const staffId = body.staff_id || body.staffId || accessContext.employeeId || null;

    const res = await approveTableAccessRequest({
      requestId: id,
      branchId: branchId || auth?.branch?.id,
      staffId,
      staffName,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to approve access request" },
        { status: res.statusCode || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: res.message || "Table access approved successfully.",
        session: res.session,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to approve table access request" },
      { status: 500 }
    );
  }
}
