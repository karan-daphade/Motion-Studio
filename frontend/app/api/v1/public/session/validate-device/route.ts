import { NextRequest, NextResponse } from "next/server";
import { validateSessionDevice } from "@/app/actions/operations-tables-actions";

/**
 * GET /api/v1/public/session/validate-device
 * User Story 15.7 Section 6 Step 1: Rehydrates session for returning/refreshing devices
 * and enforces real-time moderation status (ACTIVE, REMOVED, BLOCKED).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id") || undefined;
    const tableId = url.searchParams.get("table_id") || undefined;
    const branchId = url.searchParams.get("branch_id") || undefined;
    const deviceToken = url.searchParams.get("device_token") || req.headers.get("x-device-token") || "";

    if (!deviceToken) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: device_token" },
        { status: 400 }
      );
    }

    const res = await validateSessionDevice({
      sessionId,
      tableId,
      deviceToken,
      branchId,
    });

    if (!res.success) {
      if (res.status === "BLOCKED" || res.status === "REMOVED") {
        return NextResponse.json(
          {
            success: false,
            status: res.status,
            message: res.message || res.error || "Device access restricted",
          },
          { status: 403 }
        );
      }

      // Unregistered device visiting join portal or scanning table (normal pre-check state)
      return NextResponse.json(
        {
          success: true,
          status: "NOT_FOUND",
          message: res.message || res.error || "Device not attached to an active session",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: res.status,
        session: res.session,
        device: res.device,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to validate session device" },
      { status: 500 }
    );
  }
}
