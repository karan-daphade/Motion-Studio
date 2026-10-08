import { NextRequest } from "next/server";
import { GET as getStatus } from "@/app/api/v1/public/waitlist/status/route";

/**
 * GET /api/waitlist/status
 * Backward-compatible endpoint aliasing to GET /api/v1/public/waitlist/status.
 */
export async function GET(req: NextRequest) {
  return getStatus(req);
}
