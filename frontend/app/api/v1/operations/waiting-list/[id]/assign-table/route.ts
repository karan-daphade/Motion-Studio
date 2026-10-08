import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canAssignWaitlistTable } from "@/lib/auth/permissions";
import { assignTableToQueueEntry } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/operations/waiting-list/:id/assign-table
 * Body: { tableId, branchId }
 * User Story 15.4: Assigns available single/merged table to waitlist entry.
 * Strictly holds the table and transitions status to TABLE_ASSIGNED with ZERO premature sessions.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { tableId, branchId } = body;

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: "tableId is required" },
        { status: 400 }
      );
    }

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

    const res = await assignTableToQueueEntry(
      id,
      tableId,
      branchId || auth?.branch?.id,
      staffName,
      staffId
    );

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to assign table" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Table ${res.tableLabel || "assigned"} held successfully for customer`,
      tableLabel: res.tableLabel,
      assigned_at: res.assigned_at,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to assign table" },
      { status: 500 }
    );
  }
}
