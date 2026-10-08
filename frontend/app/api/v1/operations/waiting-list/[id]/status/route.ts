import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canAccessWaitingList } from "@/lib/auth/permissions";

/**
 * PATCH /api/v1/operations/waiting-list/:id/status
 * Handles NO_SHOW and REMOVED state transitions with precise closed_at timestamps and audit logging.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, note, branchId } = body;

    const normalizedStatus = (status || "").toUpperCase();
    if (normalizedStatus !== "NO_SHOW" && normalizedStatus !== "REMOVED") {
      return NextResponse.json(
        { success: false, error: "Status must be either 'NO_SHOW' or 'REMOVED'" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch waitlist entry
    let entry: any = null;
    try {
      const { data: wlData } = await supabase
        .from("waiting_list_entries")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (wlData) entry = wlData;
    } catch {
      // fallback
    }

    if (!entry) {
      const { data: qData } = await supabase
        .from("queue_entries")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (qData) {
        entry = {
          id: qData.id,
          branch_id: qData.branch_id,
          status: qData.status,
          customer_name: qData.guest_name || qData.customer_name || "Guest",
        };
      }
    }

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Waiting list entry not found" },
        { status: 404 }
      );
    }

    const targetBranchId = branchId || entry.branch_id;
    const auth = await getAuthenticatedAdmin(targetBranchId);
    const accessContext = {
      role: auth?.user?.role || "waiter",
      employeeId: auth?.user?.id,
      name: `${auth?.user?.first_name || ""} ${auth?.user?.last_name || ""}`.trim() || "Staff",
    };

    if (!canAccessWaitingList(accessContext)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing tables.waiting_list permission" },
        { status: 403 }
      );
    }

    const staffName = accessContext.name;
    const staffId = accessContext.employeeId || null;
    const nowIso = new Date().toISOString();

    const auditNote = note?.trim() || (
      normalizedStatus === "NO_SHOW" 
        ? "Customer marked as absent / no-show when called." 
        : "Customer manually cancelled/removed by staff."
    );

    // 2. Update waiting_list_entries
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          status: normalizedStatus,
          closed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", id);
    } catch {
      // fallback
    }

    // 3. Update shadow queue_entries
    const shadowStatus = normalizedStatus === "NO_SHOW" ? "no_show" : "removed";
    try {
      await supabase
        .from("queue_entries")
        .update({
          status: shadowStatus,
          updated_at: nowIso,
        })
        .eq("id", id);
    } catch {
      // fallback
    }

    // 4. Log to waiting_list_activity_logs
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: id,
        event_type: normalizedStatus,
        actor_id: staffId,
        actor_name: staffName,
        state_diff: {
          previous_status: entry.status || "WAITING",
          new_status: normalizedStatus,
        },
        note: auditNote,
        timestamp: nowIso,
      });
    } catch {
      // fallback
    }

    // 5. Also log to universal activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "waitlist_entry",
        entity_id: id,
        action: shadowStatus,
        actor_type: "staff",
        actor_id: staffId,
        actor_name: staffName,
        note: auditNote,
        created_at: nowIso,
      });
    } catch {
      // fallback
    }

    return NextResponse.json({
      success: true,
      message: `Entry marked as ${normalizedStatus}`,
      status: normalizedStatus,
      closed_at: nowIso,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update waiting list entry status" },
      { status: 500 }
    );
  }
}
