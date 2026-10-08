import { NextRequest, NextResponse } from "next/server";
import { getTableScanStatus, recordOccupiedTableScanAlert } from "@/app/actions/operations-tables-actions";

/**
 * GET /api/v1/public/table/:tableId/scan
 * User Story 15.6 – Step 1: Precondition Check on Scan
 * Resolves table operational status (AVAILABLE vs OCCUPIED)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await context.params;
    const url = new URL(req.url);
    const branchId = url.searchParams.get("branch_id") || undefined;

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: tableId" },
        { status: 400 }
      );
    }

    const res = await getTableScanStatus(tableId, branchId);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Table not found" },
        { status: 404 }
      );
    }

    if (res.status === "OCCUPIED" && res.table?.branchId) {
      const deviceToken = req.headers.get("x-device-token") || url.searchParams.get("device_token") || undefined;
      await recordOccupiedTableScanAlert({
        branchId: res.table.branchId,
        tableId,
        tableLabel: res.table.label || res.table.name,
        deviceToken,
      });
    }

    return NextResponse.json(
      {
        success: true,
        status: res.status,
        table: res.table,
        notice: res.status === "OCCUPIED" ? {
          title: "This table currently has an active dining session.",
          message: "Please ask the seated party (Person A) or restaurant staff to share their Session QR code or join link.",
        } : undefined,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resolve table status" },
      { status: 500 }
    );
  }
}
