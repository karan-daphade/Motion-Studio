import { NextRequest, NextResponse } from "next/server";
import { requestTableAccess } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/public/table-access/request
 * User Story 15.6 – Step 2: Customer Table QR Access Request Submission
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const headerToken = req.headers.get("x-device-token") || req.headers.get("device_token");
    const deviceToken = (body.device_token || body.deviceToken || headerToken || "").trim();

    const tableId = (body.table_id || body.tableId || "").trim();
    const customerName = (body.customer_name || body.customerName || body.name || "").trim();
    const customerPhone = (body.customer_phone || body.customerPhone || body.phone || "").trim();
    const partySize = Number(body.party_size || body.partySize || 1);
    const branchId = (body.branch_id || body.branchId || "").trim() || undefined;

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: table_id" },
        { status: 400 }
      );
    }

    if (!deviceToken) {
      return NextResponse.json(
        { success: false, error: "Missing required header/field: device_token" },
        { status: 400 }
      );
    }

    const result = await requestTableAccess({
      tableId,
      customerName,
      customerPhone,
      partySize,
      deviceToken,
      branchId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to submit table access request" },
        { status: result.statusCode || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Table access request submitted. Please wait for staff approval.",
        request_id: result.requestId,
        table_label: result.tableLabel,
        status: result.status,
      },
      { status: result.statusCode || 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
