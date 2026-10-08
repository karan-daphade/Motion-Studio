import { NextRequest } from "next/server";
import { POST as joinWaitlist } from "@/app/api/v1/public/waitlist/join/route";

/**
 * POST /api/waitlist/register
 * Backward-compatible endpoint aliasing to POST /api/v1/public/waitlist/join.
 */
export async function POST(req: NextRequest) {
  return joinWaitlist(req);
}
