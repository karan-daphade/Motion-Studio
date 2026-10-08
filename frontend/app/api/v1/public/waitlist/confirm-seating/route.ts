import { NextRequest, NextResponse } from "next/server";
import { confirmCustomerSeating } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/public/waitlist/confirm-seating
 * User Story 15.5 – Customer Seating Confirmation & Dining Session Creation
 *
 * Request Body or Headers:
 * - device_token: string (required, header 'x-device-token' or JSON body 'device_token')
 * - waitlist_entry_id / queueEntryId / entry_id: string (required)
 * - branch_id: string (optional)
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Extract device_token from body or headers
    const headerToken = req.headers.get("x-device-token") || req.headers.get("device_token");
    const deviceToken = (body.device_token || body.deviceToken || headerToken || "").trim();

    // Extract entry ID
    const entryId = (
      body.waitlist_entry_id ||
      body.waitlistEntryId ||
      body.queueEntryId ||
      body.entry_id ||
      body.id ||
      ""
    ).trim();

    const branchId = body.branch_id || body.branchId;

    if (!entryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: waitlist_entry_id",
        },
        { status: 400 }
      );
    }

    if (!deviceToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: device_token",
        },
        { status: 400 }
      );
    }

    // Execute Seating Confirmation Pipeline
    const result = await confirmCustomerSeating({
      queueEntryId: entryId,
      deviceToken,
      branchId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to confirm seating",
        },
        { status: result.statusCode || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Seating confirmed successfully. Welcome to your dining session!",
        session_id: result.session?.id,
        session: result.session,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error while confirming seating",
      },
      { status: 500 }
    );
  }
}
