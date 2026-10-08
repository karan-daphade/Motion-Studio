import { NextRequest, NextResponse } from "next/server";
import { joinTableSession } from "@/app/actions/operations-tables-actions";

/**
 * POST /api/v1/public/session/join
 * User Story 15.7 Workflow 2: Joining via Shared Session Link / Session QR (Direct Join)
 * Creates session_devices record linked to session_id without staff approval.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, guest_name, mobile_number, device_token, share_token, branch_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: session_id" },
        { status: 400 }
      );
    }

    if (!guest_name || guest_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Guest Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    const cleanMobile = (mobile_number || "").trim().replace(/\D/g, "");
    const indianRegex = /^[6-9]\d{9}$/;
    if (!cleanMobile || !indianRegex.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const token = device_token || req.headers.get("x-device-token");
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing device token." },
        { status: 400 }
      );
    }

    const res = await joinTableSession({
      sessionId: session_id,
      guestName: guest_name.trim(),
      mobileNumber: cleanMobile,
      deviceToken: token,
      shareToken: share_token,
      branchId: branch_id,
    });

    if (!res.success) {
      return NextResponse.json(
        {
          success: false,
          error: res.error || "Failed to join dining session",
          isBlocked: res.isBlocked,
        },
        { status: res.statusCode || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        session: res.session,
        device: res.device,
      },
      { status: res.statusCode || 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
