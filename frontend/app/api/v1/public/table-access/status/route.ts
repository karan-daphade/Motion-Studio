import { NextRequest, NextResponse } from "next/server";
import { getTableAccessStatus } from "@/app/actions/operations-tables-actions";

/**
 * GET /api/v1/public/table-access/status
 * User Story 15.6 – Step 3: Customer Waiting Screen Live Status Polling
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const requestId = url.searchParams.get("request_id") || undefined;
    const tableId = url.searchParams.get("table_id") || undefined;

    const headerToken = req.headers.get("x-device-token") || req.headers.get("device_token");
    const queryToken = url.searchParams.get("device_token");
    const deviceToken = (headerToken || queryToken || "").trim() || undefined;

    if (!requestId && !deviceToken) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: request_id or device_token" },
        { status: 400 }
      );
    }

    const res = await getTableAccessStatus({
      requestId,
      deviceToken,
      tableId,
    });

    if (!res.success) {
      return NextResponse.json(
        {
          success: true,
          status: "IDLE",
          message: res.error || "No active request found",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: res.status,
        table_label: res.tableLabel,
        rejection_reason: res.rejectionReason,
        session: res.session,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
