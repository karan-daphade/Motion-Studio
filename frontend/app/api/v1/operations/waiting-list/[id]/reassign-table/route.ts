import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canAssignWaitlistTable } from "@/lib/auth/permissions";
import { reassignTableForWaitlistEntry } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/operations/waiting-list/:id/reassign-table
 * Body: { newTableId, branchId }
 * User Story 15.4 — Workflow B: Atomic swap of assigned table references.
 * Releases previous table back to Available, holds new table, logs ASSIGNMENT_CHANGED.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { newTableId, tableId, branchId } = body;

    const targetNewTableId = newTableId || tableId;
    if (!targetNewTableId) {
      return NextResponse.json(
        { success: false, error: "newTableId is required" },
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

    const res = await reassignTableForWaitlistEntry(
      id,
      targetNewTableId,
      branchId || auth?.branch?.id,
      staffName,
      staffId
    );

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to reassign table" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Table reassigned successfully to ${res.tableLabel}`,
      tableLabel: res.tableLabel,
      assigned_at: res.assigned_at,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reassign table" },
      { status: 500 }
    );
  }
}
