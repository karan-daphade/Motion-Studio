import { NextRequest, NextResponse } from "next/server";
import { getAvailableTablesForAssignment } from "@/app/actions/operations-tables-actions";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canAccessWaitingList } from "@/lib/auth/permissions";

/**
 * GET /api/v1/operations/tables/available-for-assignment
 * Query Params: ?branchId=<id>
 * Returns available standalone and merged tables eligible for waitlist assignment.
 * User Story 15.4.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || undefined;
    const sectionId = searchParams.get("sectionId") || undefined;

    const auth = await getAuthenticatedAdmin(branchId);
    const accessContext: any = {
      role: auth?.user?.role || "waiter",
      employeeId: auth?.user?.id,
      name: `${auth?.user?.first_name || ""} ${auth?.user?.last_name || ""}`.trim() || "Staff",
      permissions: (auth?.user as any)?.permissions,
    };

    if (!canAccessWaitingList(accessContext)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing tables.waiting_list permission" },
        { status: 403 }
      );
    }

    const res = await getAvailableTablesForAssignment(branchId || auth?.branch?.id, sectionId);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Failed to fetch available tables" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tables: res.tables,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
