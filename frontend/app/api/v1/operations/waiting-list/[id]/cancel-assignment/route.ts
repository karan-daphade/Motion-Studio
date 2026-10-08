import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canAssignWaitlistTable } from "@/lib/auth/permissions";
import { cancelWaitlistTableAssignment } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/operations/waiting-list/:id/cancel-assignment
 * Body: { branchId, note? }
 * User Story 15.4 — Workflow C: Releases held table back to Available,
 * rolls waitlist record status back to WAITING, and logs ASSIGNMENT_CANCELLED.
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
    } catch {}
    const { branchId, note } = body;

    const auth = await getAuthenticatedAdmin(branchId);
    const accessContext: any = {
      role: auth?.user?.role || "waiter",
      employeeId: auth?.user?.id,
      name: `${auth?.user?.first_name || ""} ${auth?.user?.last_name || ""}`.trim() || "Staff",
      permissions: (auth?.user as any)?.permissions,
    };

    if (!canAssignWaitlistTable(accessContext)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing tables.waiting_list.assign permission" },
        { status: 403 }
      );
    }

    const staffName = accessContext.name;
    const staffId = accessContext.employeeId || null;

    const res = await cancelWaitlistTableAssignment(
      id,
      branchId || auth?.branch?.id,
      staffName,
      staffId,
      note
    );

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to cancel table assignment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Table assignment cancelled and customer returned to waiting queue",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel table assignment" },
      { status: 500 }
    );
  }
}
