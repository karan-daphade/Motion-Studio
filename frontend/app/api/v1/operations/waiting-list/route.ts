import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { 
  hasAccess, 
  canAccessWaitingList, 
  canViewWaitingListPhone, 
  maskPhoneNumber 
} from "@/lib/auth/permissions";

/**
 * GET /api/v1/operations/waiting-list
 * Filtered to active status WAITING, strict FIFO order, phone masked based on RBAC.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(req.url);
    let branchId = searchParams.get("branchId");

    const auth = await getAuthenticatedAdmin(branchId || undefined);
    if (!branchId && auth?.branch?.id) {
      branchId = auth.branch.id;
    }

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "Missing branchId parameter" },
        { status: 400 }
      );
    }

    // Evaluate Access Context
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

    const canViewPhone = canViewWaitingListPhone(accessContext);

    // 1. Query waiting_list_entries (Strict FIFO: created_at ASC)
    let entries: any[] = [];
    try {
      const { data, error } = await supabase
        .from("waiting_list_entries")
        .select(`
          id,
          branch_id,
          queue_token,
          customer_name,
          mobile_number,
          guest_count,
          notes,
          registration_method,
          created_by_user_id,
          created_by_name,
          assigned_table_id,
          assigned_merged_group_id,
          status,
          created_at,
          assigned_at,
          closed_at
        `)
        .eq("branch_id", branchId)
        .in("status", ["WAITING", "waiting"])
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        entries = data.map((e) => ({
          id: e.id,
          branch_id: e.branch_id,
          queue_token: e.queue_token,
          queue_number: e.queue_token,
          customer_name: e.customer_name,
          guest_name: e.customer_name,
          mobile_number: canViewPhone ? e.mobile_number : maskPhoneNumber(e.mobile_number),
          phone: canViewPhone ? e.mobile_number : maskPhoneNumber(e.mobile_number),
          is_phone_masked: !canViewPhone,
          guest_count: e.guest_count,
          party_size: e.guest_count,
          notes: e.notes,
          registration_method: e.registration_method,
          created_by_user_id: e.created_by_user_id,
          created_by_name: e.created_by_name || "Staff",
          registered_by: e.created_by_name || "Staff",
          assigned_table_id: e.assigned_table_id,
          assigned_merged_group_id: e.assigned_merged_group_id,
          status: "WAITING",
          created_at: e.created_at,
          assigned_at: e.assigned_at,
          closed_at: e.closed_at,
        }));
      }
    } catch {
      // Fallback if table not created
    }

    // 2. Fallback to queue_entries if waiting_list_entries yielded 0 rows
    if (entries.length === 0) {
      try {
        const { data: qData, error: qErr } = await supabase
          .from("queue_entries")
          .select("id, branch_id, section_id, guest_name, customer_name, guest_mobile, phone, party_size, status, queue_number, token_number, assigned_table_id, created_by, registered_by, created_at")
          .eq("branch_id", branchId)
          .in("status", ["waiting", "WAITING", "called"])
          .order("created_at", { ascending: true });

        if (!qErr && qData) {
          entries = qData.map((q) => {
            const rawPhone = q.guest_mobile || q.phone || "";
            return {
              id: q.id,
              branch_id: q.branch_id,
              queue_token: q.queue_number || q.token_number || "A-01",
              queue_number: q.queue_number || q.token_number || "A-01",
              customer_name: q.guest_name || q.customer_name || "Guest",
              guest_name: q.guest_name || q.customer_name || "Guest",
              mobile_number: canViewPhone ? rawPhone : maskPhoneNumber(rawPhone),
              phone: canViewPhone ? rawPhone : maskPhoneNumber(rawPhone),
              is_phone_masked: !canViewPhone,
              guest_count: q.party_size || 1,
              party_size: q.party_size || 1,
              notes: null,
              registration_method: "STAFF_WALKIN",
              created_by_user_id: q.created_by,
              created_by_name: q.registered_by || "Staff",
              registered_by: q.registered_by || "Staff",
              assigned_table_id: q.assigned_table_id,
              assigned_merged_group_id: null,
              status: "WAITING",
              created_at: q.created_at,
              assigned_at: null,
              closed_at: null,
            };
          });
        }
      } catch {
        // queue_entries error fallback
      }
    }

    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch waiting list" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/operations/waiting-list
 * Creates walk-in entry, auto-generates sequential daily token per branch.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const body = await req.json();

    const { branchId, customer_name, mobile_number, guest_count, notes } = body;

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "branchId is required" },
        { status: 400 }
      );
    }

    // Validation: customer_name
    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, error: "Customer Name is required" },
        { status: 400 }
      );
    }

    // Validation: mobile_number
    if (!mobile_number || typeof mobile_number !== "string" || !mobile_number.trim()) {
      return NextResponse.json(
        { success: false, error: "Mobile Number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = mobile_number.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    // Validation: guest_count
    const countNum = Number(guest_count);
    if (isNaN(countNum) || countNum < 1) {
      return NextResponse.json(
        { success: false, error: "Guest Count must be at least 1" },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedAdmin(branchId);
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

    // Issue next daily token (e.g. A-01, A-02) per branch
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: dailyCount } = await supabase
      .from("waiting_list_entries")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("created_at", todayStart.toISOString());

    const nextSeq = (dailyCount || 0) + 1;
    const token = `A-${nextSeq < 10 ? `0${nextSeq}` : nextSeq}`;

    // 1. Insert into waiting_list_entries
    const insertPayload = {
      branch_id: branchId,
      queue_token: token,
      customer_name: customer_name.trim(),
      mobile_number: cleanPhone,
      guest_count: countNum,
      notes: notes?.trim() || null,
      registration_method: "STAFF_WALKIN",
      created_by_user_id: staffId,
      created_by_name: staffName,
      status: "WAITING",
    };

    let newEntry: any = null;
    let insertError: any = null;

    try {
      const { data, error } = await supabase
        .from("waiting_list_entries")
        .insert(insertPayload)
        .select()
        .single();
      newEntry = data;
      insertError = error;
    } catch (e: any) {
      insertError = e;
    }

    // 2. Also insert or sync into queue_entries
    try {
      await supabase.from("queue_entries").insert({
        id: newEntry?.id,
        branch_id: branchId,
        guest_name: customer_name.trim(),
        customer_name: customer_name.trim(),
        guest_mobile: cleanPhone,
        phone: cleanPhone,
        party_size: countNum,
        status: "waiting",
        queue_number: token,
        token_number: token,
        registered_by: staffName,
        created_by: staffId,
      });
    } catch {
      // ignore compatibility sync error
    }

    if (insertError && !newEntry) {
      return NextResponse.json(
        { success: false, error: insertError.message || "Failed to create waiting list entry" },
        { status: 500 }
      );
    }

    // 3. Log to waiting_list_activity_logs & activity_log
    const entryId = newEntry?.id;
    if (entryId) {
      try {
        await supabase.from("waiting_list_activity_logs").insert({
          waiting_list_entry_id: entryId,
          event_type: "WAITLIST_CREATED",
          actor_id: staffId,
          actor_name: staffName,
          state_diff: { status: "WAITING", guest_count: countNum, token },
          note: `Walk-in registered for ${countNum} ${countNum === 1 ? "guest" : "guests"}${notes ? ` (Notes: ${notes})` : ""}`,
        });
      } catch {
        // fallback
      }

      try {
        await supabase.from("activity_log").insert({
          entity_type: "waitlist_entry",
          entity_id: entryId,
          action: "created",
          actor_type: "staff",
          actor_id: staffId,
          actor_name: staffName,
          note: `Registered party of ${countNum} (Token #${token})`,
        });
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      success: true,
      data: newEntry,
      token,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process waiting list registration" },
      { status: 500 }
    );
  }
}
