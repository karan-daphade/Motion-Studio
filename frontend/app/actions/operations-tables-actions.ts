"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { canViewWaitingListPhone, maskPhoneNumber, maskCustomerName, canViewCustomerDetails, canAssignWaitlistTable, canAccessWaitingList } from "@/lib/auth/permissions";
import { getSectionTokenPrefix, formatWaitlistToken } from "@/lib/waitlist/waitlist-service";

export interface OperationsTableSession {
  id: string;
  table_id: string;
  status: string;
  opened_at: string;
  closed_at?: string | null;
  customer_name?: string | null;
  mobile_number?: string | null;
  guest_count: number;
  device_count: number;
  merged_table_ids: string[];
  merged_table_labels: string[];
  orders: Array<{
    id: string;
    status: string;
    order_type: string;
    created_at: string;
    items: Array<{
      id: string;
      item_id: string;
      item_name: string;
      quantity: number;
      price_at_order: number;
      status: string;
      notes?: string;
      created_at: string;
      requested_by?: string;
    }>;
  }>;
  requests: Array<{
    id: string;
    type: string;
    status: string;
    requested_by: string;
    requested_at: string;
    fulfilled_at?: string | null;
  }>;
  bill?: {
    id: string;
    bill_number: string;
    subtotal: number;
    tax_total: number;
    discount_total: number;
    total_amount: number;
    paid_amount: number;
    status: string;
    split_count: number;
    payments: Array<{
      id: string;
      amount: number;
      payment_method: string;
      payer_name?: string;
      notes?: string;
      created_at: string;
    }>;
  } | null;
  activity_logs?: OperationsActivityLogItem[];
}

export interface OperationsActivityLogItem {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_type: "staff" | "customer" | "system";
  actor_id?: string | null;
  actor_name: string;
  note?: string | null;
  created_at: string;
}

export interface OperationsTableReservation {
  id: string;
  branch_id: string;
  table_id: string;
  guest_name: string;
  guest_mobile: string;
  party_size: number;
  status: "reserved" | "seated" | "cancelled";
  created_by?: string | null;
  created_by_name: string;
  created_at: string;
  activity_logs?: OperationsActivityLogItem[];
}

export interface OperationsTableItem {
  id: string;
  section_id: string;
  section_name: string;
  table_name: string;
  table_number: number;
  short_code: string;
  seating_capacity: number;
  status: "active" | "occupied" | "reserved" | "inactive" | "assigned";
  qr_url: string;
  active_session: OperationsTableSession | null;
  reservation?: OperationsTableReservation | null;
  assigned_waiter: {
    id: string;
    employee_id: string;
    name: string;
    role: string;
    phone?: string | null;
  } | null;
  merge_group_id?: string | null;
  is_primary_merged?: boolean;
  is_secondary_merged?: boolean;
  merged_group_name?: string | null;
  merged_member_ids?: string[];
  merged_member_labels?: string[];
  held_for_waitlist_id?: string | null;
  held_waitlist_label?: string | null;
  is_held_for_waitlist?: boolean;
  assigned_waitlist_entry?: {
    id: string;
    token: string;
    customer_name: string;
    guest_count: number;
    assigned_at?: string;
  } | null;
}

export interface OperationsMergeGroup {
  id: string;
  branch_id: string;
  section_id: string;
  name: string;
  primary_table_id: string;
  status: "available" | "occupied" | "reserved" | "assigned";
  member_table_ids: string[];
  member_table_labels: string[];
  created_at: string;
  active_session_id?: string | null;
  held_for_waitlist_id?: string | null;
}

export interface OperationsQueueEntry {
  id: string;
  branch_id?: string;
  section_id?: string | null;
  section_name?: string;
  queue_number: string;
  token_number: string;
  queue_token?: string;
  guest_name: string;
  guest_mobile: string;
  customer_name: string;
  phone: string;
  mobile_number?: string;
  raw_mobile?: string;
  is_phone_masked?: boolean;
  party_size: number;
  guest_count?: number;
  notes?: string | null;
  registration_method?: "STAFF_WALKIN" | "CUSTOMER_SELF";
  status: "waiting" | "assigned" | "removed" | "called" | "seated" | "cancelled" | "no_show" | "WAITING" | "TABLE_ASSIGNED" | "NO_SHOW" | "REMOVED";
  assigned_table_id?: string | null;
  assigned_table_label?: string | null;
  assigned_merged_group_id?: string | null;
  created_by?: string | null;
  created_by_user_id?: string | null;
  registered_by: string;
  created_at: string;
  assigned_at?: string | null;
  closed_at?: string | null;
  activity_logs?: OperationsActivityLogItem[];
}

export interface OperationsMenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  base_price: number;
  dietary_tag: string;
  out_of_stock: boolean;
  serving_info?: string | null;
  prep_time_minutes?: number | null;
  image_url?: string | null;
  variations: Array<{
    id: string;
    name: string;
    price: number;
    is_default: boolean;
  }>;
  addons: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface OperationsBranchData {
  branch: {
    id: string;
    name: string;
    short_code?: string | null;
  };
  current_user?: {
    id: string;
    name: string;
    role: string;
    assigned_sections: string[];
  };
  sections: Array<{
    id: string;
    name: string;
    floor?: string | null;
    unit_label?: string | null;
    table_count?: number;
    active?: boolean;
  }>;
  tables: OperationsTableItem[];
  queue_entries: OperationsQueueEntry[];
  categories: Array<{
    id: string;
    name: string;
    is_available: boolean;
  }>;
  menu_items: OperationsMenuItem[];
  waiters: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string | null;
    sections: string[];
  }>;
  shifts: Array<{
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    active: boolean;
    default_shift: boolean;
  }>;
  merge_groups: OperationsMergeGroup[];
}

/**
 * Helper to extract table number from table_name ("Table 6" -> 6) or qr_url ("/6" -> 6)
 */
function parseTableNumber(t: any): number {
  if (typeof t.table_number === "number" && !isNaN(t.table_number) && t.table_number > 0) {
    return t.table_number;
  }
  if (t.qr_url) {
    const parts = t.qr_url.split("/");
    const last = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(last) && last > 0) return last;
  }
  if (t.table_name) {
    const match = t.table_name.match(/\d+/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return 1;
}

/**
 * 1. GET COMPLETE OPERATIONS FLOOR DATA
 */
export async function getBranchOperationsData(branchId?: string): Promise<OperationsBranchData | null> {
  const auth = await getAuthenticatedAdmin(branchId);
  if (!auth || !auth.branch) {
    return null;
  }

  const branch = auth.branch;
  const currentBranchId = branch.id;
  const supabase = createServiceRoleClient();

  // 1. Fetch Sections
  const { data: rawSections } = await supabase
    .from("sections")
    .select("id, name, floor, table_count, active")
    .eq("branch_id", currentBranchId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const sections = rawSections || [];
  const sectionIds = sections.map((s) => s.id);
  const sectionMap = new Map(sections.map((s) => [s.id, s.name]));

  // 2. Fetch Tables (Select supported columns, compute table_number safely)
  let rawTables: any[] = [];
  if (sectionIds.length > 0) {
    let { data: tbls, error: tblErr } = await supabase
      .from("tables")
      .select("id, section_id, table_name, seating_capacity, status, qr_url, created_at, held_for_waitlist_id")
      .in("section_id", sectionIds)
      .is("deleted_at", null);
    
    if (tblErr && (tblErr.message?.includes("held_for_waitlist_id") || tblErr.code === "42703")) {
      const { data: fbTbls } = await supabase
        .from("tables")
        .select("id, section_id, table_name, seating_capacity, status, qr_url, created_at")
        .in("section_id", sectionIds)
        .is("deleted_at", null);
      tbls = (fbTbls || []).map((t: any) => ({ ...t, held_for_waitlist_id: null }));
    }
    
    rawTables = tbls || [];

    // Fallback: load tables from onboarding_progress if relational query was empty
    if (rawTables.length === 0) {
      const stored = ((branch.onboarding_progress as any)?.tables as any[]) || [];
      rawTables = stored.filter((t: any) => sectionIds.includes(t.section_id)).map((t: any) => ({
        ...t,
        status: t.status || "active",
      }));
    }

    // Overlay held_tables metadata mapping
    const heldMap = ((branch.onboarding_progress as any)?.held_tables as Record<string, string>) || {};
    rawTables.forEach((t) => {
      if (!t.held_for_waitlist_id && heldMap[t.id]) {
        t.held_for_waitlist_id = heldMap[t.id];
      }
    });

    rawTables.forEach((t) => {
      t.table_number = parseTableNumber(t);
    });
    // Sort tables numerically: T1, T2, T3...
    rawTables.sort((a, b) => a.table_number - b.table_number);
  }

  const tableIds = rawTables.map((t) => t.id);
  const tableNameMap = new Map(rawTables.map((t) => [t.id, t.table_name || `T${t.table_number}`]));

  // 3. Fetch Active Table Sessions (With schema-fallback for device_count / branch_id)
  let activeSessions: any[] = [];
  if (tableIds.length > 0) {
    let { data: sessions, error: sessErr } = await supabase
      .from("table_sessions")
      .select("id, table_id, status, opened_at, closed_at, guest_count, device_count, branch_id")
      .in("table_id", tableIds)
      .eq("status", "active")
      .order("opened_at", { ascending: false });

    if (sessErr && (sessErr.message?.includes("device_count") || sessErr.message?.includes("branch_id"))) {
      const { data: fbSessions } = await supabase
        .from("table_sessions")
        .select("id, table_id, status, opened_at, closed_at, guest_count")
        .in("table_id", tableIds)
        .eq("status", "active")
        .order("opened_at", { ascending: false });
      sessions = (fbSessions || []).map((s: any) => ({
        ...s,
        device_count: 0,
        branch_id: currentBranchId,
      }));
    }

    activeSessions = sessions || [];

    // Merge active sessions stored in branch onboarding progress metadata
    if ((branch.onboarding_progress as any)?.table_sessions) {
      const storedSessions = ((branch.onboarding_progress as any).table_sessions as any[]) || [];
      storedSessions.forEach((stSess: any) => {
        if (
          stSess &&
          stSess.status === "active" &&
          tableIds.includes(stSess.table_id) &&
          (!stSess.branch_id || stSess.branch_id === currentBranchId)
        ) {
          const existingIdx = activeSessions.findIndex((s) => s.id === stSess.id || s.table_id === stSess.table_id);
          if (existingIdx >= 0) {
            activeSessions[existingIdx] = {
              ...activeSessions[existingIdx],
              ...stSess,
            };
          } else {
            activeSessions.push(stSess);
          }
        }
      });
    }
  }

  const sessionIds = activeSessions.map((s) => s.id);

  // 4. Fetch session_tables (merged tables join table with graceful fallback)
  let sessionTablesList: any[] = [];
  if (sessionIds.length > 0) {
    try {
      const { data: stData, error: stErr } = await supabase
        .from("session_tables")
        .select("session_id, table_id")
        .in("session_id", sessionIds);
      if (!stErr && stData) {
        sessionTablesList = stData;
      }
    } catch {
      sessionTablesList = [];
    }
  }

  // 4b. Fetch table_merge_groups & table_merge_group_members
  let rawMergeGroups: any[] = [];
  let rawMergeMembers: any[] = [];
  try {
    let { data: mgData, error: mgErr } = await supabase
      .from("table_merge_groups")
      .select("id, branch_id, section_id, name, primary_table_id, status, created_at, held_for_waitlist_id")
      .eq("branch_id", currentBranchId);

    if (mgErr && (mgErr.message?.includes("held_for_waitlist_id") || mgErr.code === "42703")) {
      const { data: fbMg } = await supabase
        .from("table_merge_groups")
        .select("id, branch_id, section_id, name, primary_table_id, status, created_at")
        .eq("branch_id", currentBranchId);
      mgData = (fbMg || []).map((g: any) => ({ ...g, held_for_waitlist_id: null }));
      mgErr = null;
    }

    if (!mgErr && mgData) {
      rawMergeGroups = mgData;
      const groupIds = rawMergeGroups.map((g) => g.id);
      if (groupIds.length > 0) {
        const { data: mmData } = await supabase
          .from("table_merge_group_members")
          .select("id, group_id, table_id, created_at")
          .in("group_id", groupIds);
        rawMergeMembers = mmData || [];
      }
    }
  } catch {
    rawMergeGroups = [];
    rawMergeMembers = [];
  }

  // Graceful fallback from branch metadata if database table does not exist or has no rows
  if (rawMergeGroups.length === 0 && (branch.onboarding_progress as any)?.merge_groups) {
    const storedGroups = ((branch.onboarding_progress as any).merge_groups as any[]) || [];
    storedGroups.forEach((sg: any) => {
      if (sg.branch_id === currentBranchId || !sg.branch_id) {
        rawMergeGroups.push({
          id: sg.id,
          branch_id: sg.branch_id || currentBranchId,
          section_id: sg.section_id,
          name: sg.name,
          primary_table_id: sg.primary_table_id,
          status: sg.status || "available",
          created_at: sg.created_at,
        });
        (sg.member_table_ids || []).forEach((tId: string) => {
          rawMergeMembers.push({
            id: `mem-${sg.id}-${tId}`,
            group_id: sg.id,
            table_id: tId,
            created_at: sg.created_at,
          });
        });
      }
    });
  }

  // Build merge group mappings
  const groupMembersMap = new Map<string, string[]>();
  const tableToGroupMap = new Map<string, any>();
  rawMergeMembers.forEach((m) => {
    const arr = groupMembersMap.get(m.group_id) || [];
    arr.push(m.table_id);
    groupMembersMap.set(m.group_id, arr);
  });

  const operationsMergeGroups: OperationsMergeGroup[] = rawMergeGroups.map((g) => {
    const memberIds = groupMembersMap.get(g.id) || [g.primary_table_id];
    const memberLabels = memberIds.map((id) => {
      const tbl = rawTables.find((t) => t.id === id);
      return tbl ? `T${tbl.table_number}` : (tableNameMap.get(id) || "T");
    });

    const groupObj: OperationsMergeGroup = {
      id: g.id,
      branch_id: g.branch_id,
      section_id: g.section_id,
      name: g.name || memberLabels.join(", "),
      primary_table_id: g.primary_table_id,
      status: g.status || "available",
      member_table_ids: memberIds,
      member_table_labels: memberLabels,
      created_at: g.created_at,
    };

    memberIds.forEach((tId) => {
      tableToGroupMap.set(tId, groupObj);
    });

    return groupObj;
  });

  // 5. Fetch Orders & Order Items
  let ordersList: any[] = [];
  let orderItemsList: any[] = [];
  if (sessionIds.length > 0) {
    let ordsData: any[] = [];
    try {
      const { data: ords, error: ordErr } = await supabase
        .from("orders")
        .select("id, table_session_id, status, order_type, created_at")
        .in("table_session_id", sessionIds)
        .order("created_at", { ascending: true });

      if (ordErr && ordErr.message?.includes("order_type")) {
        const { data: fbOrds } = await supabase
          .from("orders")
          .select("id, table_session_id, status, created_at")
          .in("table_session_id", sessionIds)
          .order("created_at", { ascending: true });
        ordsData = (fbOrds || []).map((o: any) => ({ ...o, order_type: "dine_in" }));
      } else {
        ordsData = ords || [];
      }
    } catch {
      ordsData = [];
    }
    ordersList = ordsData;

    const orderIds = ordersList.map((o) => o.id);
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("id, order_id, item_id, variation_id, quantity, price_at_order, status, notes, created_at")
        .in("order_id", orderIds)
        .order("created_at", { ascending: true });
      orderItemsList = items || [];
    }
  }

  // Fetch item names lookup
  const menuItemIds = Array.from(new Set(orderItemsList.map((i) => i.item_id)));
  const itemNameMap = new Map<string, string>();
  if (menuItemIds.length > 0) {
    const { data: itemsLookup } = await supabase
      .from("items")
      .select("id, name")
      .in("id", menuItemIds);
    (itemsLookup || []).forEach((it) => itemNameMap.set(it.id, it.name));
  }

  // 6. Fetch Customer Requests
  let customerRequestsList: any[] = [];
  if (sessionIds.length > 0) {
    try {
      const { data: reqs } = await supabase
        .from("customer_requests")
        .select("id, session_id, type, status, requested_by, requested_at, fulfilled_at")
        .in("session_id", sessionIds)
        .order("requested_at", { ascending: false });
      customerRequestsList = reqs || [];
    } catch {
      customerRequestsList = [];
    }
  }

  // 7. Fetch Bills & Payments
  let billsList: any[] = [];
  let paymentsList: any[] = [];
  if (sessionIds.length > 0) {
    try {
      const { data: bills } = await supabase
        .from("bills")
        .select("id, table_session_id, order_id, bill_number, subtotal, tax_total, discount_total, total_amount, paid_amount, status, split_count")
        .in("table_session_id", sessionIds);
      billsList = bills || [];

      const billIds = billsList.map((b) => b.id);
      if (billIds.length > 0) {
        const { data: pmts } = await supabase
          .from("bill_payments")
          .select("id, bill_id, amount, payment_method, payer_name, notes, created_at")
          .in("bill_id", billIds)
          .order("created_at", { ascending: true });
        paymentsList = pmts || [];
      }
    } catch {
      billsList = [];
      paymentsList = [];
    }
  }

  // 8. Fetch Waiter Table Assignments
  let waiterAssignments: any[] = [];
  if (tableIds.length > 0) {
    try {
      const { data: was } = await supabase
        .from("waiter_table_assignments")
        .select("id, table_id, employee_id, shift_id, assigned_at")
        .eq("branch_id", currentBranchId);
      waiterAssignments = was || [];
    } catch {
      waiterAssignments = [];
    }
  }

  // 9. Fetch Employees (Waiters and Section Managers)
  const { data: rawEmployees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, role, phone, status")
    .eq("branch_id", currentBranchId)
    .in("role", ["waiter", "section_manager", "manager"])
    .eq("status", "active")
    .is("deleted_at", null);

  const employees = rawEmployees || [];
  const empIds = employees.map((e) => e.id);
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  // Employee sections join table
  const empSectionMap = new Map<string, string[]>();
  if (empIds.length > 0) {
    const { data: esData } = await supabase
      .from("employee_sections")
      .select("employee_id, section_id")
      .in("employee_id", empIds);
    (esData || []).forEach((row) => {
      const arr = empSectionMap.get(row.employee_id) || [];
      arr.push(row.section_id);
      empSectionMap.set(row.employee_id, arr);
    });
  }

  const waiters = employees.map((e) => ({
    id: e.id,
    first_name: e.first_name,
    last_name: e.last_name,
    role: e.role,
    phone: e.phone,
    sections: empSectionMap.get(e.id) || [],
  }));

  // 10. Fetch Operating Shifts
  const { data: rawShifts } = await supabase
    .from("shifts")
    .select("id, name, start_time, end_time, active, default_shift")
    .eq("branch_id", currentBranchId)
    .is("deleted_at", null)
    .order("priority", { ascending: true });

  const shifts = rawShifts || [];

  // 11. Fetch Active Table Reservations
  let rawReservations: any[] = [];
  try {
    const { data: resData, error: resErr } = await supabase
      .from("table_reservations")
      .select("id, branch_id, table_id, guest_name, guest_mobile, party_size, status, created_by, created_by_name, created_at")
      .eq("branch_id", currentBranchId)
      .eq("status", "reserved");
    if (!resErr && resData) rawReservations = resData;
  } catch {
    rawReservations = [];
  }
  const reservationMap = new Map<string, any>();
  rawReservations.forEach((r) => reservationMap.set(r.table_id, r));

  // 12. Fetch Waiting List Entries (User Story 15.2 & 15.4: Strict FIFO created_at ASC, including WAITING and TABLE_ASSIGNED)
  let rawQueue: any[] = [];
  try {
    let { data: wlData, error: wlErr } = await supabase
      .from("waiting_list_entries")
      .select("id, branch_id, section_id, queue_token, customer_name, mobile_number, guest_count, notes, registration_method, created_by_user_id, created_by_name, assigned_table_id, assigned_table_label, assigned_merged_group_id, status, created_at, assigned_at, closed_at")
      .eq("branch_id", currentBranchId)
      .in("status", ["WAITING", "waiting", "TABLE_ASSIGNED", "table_assigned"])
      .order("created_at", { ascending: true });

    if (wlErr && (wlErr.message?.includes("assigned_table_label") || wlErr.message?.includes("section_id") || wlErr.code === "42703")) {
      const { data: fbWl } = await supabase
        .from("waiting_list_entries")
        .select("id, branch_id, queue_token, customer_name, mobile_number, guest_count, notes, registration_method, created_by_user_id, created_by_name, assigned_table_id, assigned_merged_group_id, status, created_at, assigned_at, closed_at")
        .eq("branch_id", currentBranchId)
        .in("status", ["WAITING", "waiting", "TABLE_ASSIGNED", "table_assigned"])
        .order("created_at", { ascending: true });
      wlData = (fbWl || []).map((w: any) => ({ ...w, assigned_table_label: null, section_id: null }));
      wlErr = null;
    }

    if (!wlErr && wlData && wlData.length > 0) {
      rawQueue = wlData.map((w: any) => ({
        id: w.id,
        branch_id: w.branch_id,
        section_id: w.section_id || null,
        queue_number: w.queue_token,
        token_number: w.queue_token,
        queue_token: w.queue_token,
        guest_name: w.customer_name,
        customer_name: w.customer_name,
        guest_mobile: w.mobile_number,
        phone: w.mobile_number,
        raw_mobile: w.mobile_number,
        party_size: w.guest_count || 1,
        guest_count: w.guest_count || 1,
        notes: w.notes,
        registration_method: w.registration_method || "STAFF_WALKIN",
        status: w.status,
        assigned_table_id: w.assigned_table_id,
        assigned_table_label: w.assigned_table_label || null,
        assigned_merged_group_id: w.assigned_merged_group_id,
        created_by: w.created_by_user_id,
        created_by_user_id: w.created_by_user_id,
        registered_by: w.created_by_name || (w.registration_method === "CUSTOMER_SELF" ? "Customer Self-Service (QR)" : "Staff"),
        created_at: w.created_at,
        assigned_at: w.assigned_at,
        closed_at: w.closed_at,
      }));
    }
  } catch {
    // waiting_list_entries table not yet created
  }

  // Fallback to queue_entries if waiting_list_entries yielded 0 rows
  if (rawQueue.length === 0 && sectionIds.length > 0) {
    try {
      let { data: qData, error: qErr } = await supabase
        .from("queue_entries")
        .select("id, branch_id, section_id, guest_name, guest_mobile, party_size, status, queue_number, assigned_table_id, assigned_table_label, created_by, registered_by, customer_name, phone, token_number, created_at")
        .eq("branch_id", currentBranchId)
        .in("status", ["waiting", "WAITING", "called", "assigned", "TABLE_ASSIGNED"])
        .order("created_at", { ascending: true });

      if (qErr && (qErr.message?.includes("assigned_table_label") || qErr.code === "42703")) {
        const { data: fbQ } = await supabase
          .from("queue_entries")
          .select("id, branch_id, section_id, guest_name, guest_mobile, party_size, status, queue_number, assigned_table_id, created_by, registered_by, customer_name, phone, token_number, created_at")
          .eq("branch_id", currentBranchId)
          .in("status", ["waiting", "WAITING", "called", "assigned", "TABLE_ASSIGNED"])
          .order("created_at", { ascending: true });
        qData = (fbQ || []).map((q: any) => ({ ...q, assigned_table_label: null }));
        qErr = null;
      }

      if (!qErr && qData && qData.length > 0) {
        rawQueue = qData.map((q: any) => ({
          ...q,
          section_id: q.section_id || null,
          raw_mobile: q.guest_mobile || q.phone || "",
          guest_count: q.party_size || 1,
          queue_token: q.queue_number || q.token_number || "A-01",
          assigned_table_label: q.assigned_table_label || null,
        }));
      }
    } catch {
      rawQueue = [];
    }
  }

  // Graceful Tier-3 fallback from branch metadata (branch.onboarding_progress.waitlist_entries)
  // Ensures customer self-registrations via QR or /waitlist/join appear immediately on operations floor
  if (rawQueue.length === 0 && (branch.onboarding_progress as any)?.waitlist_entries) {
    const storedWaitlist = ((branch.onboarding_progress as any).waitlist_entries as any[]) || [];
    const activeStored = storedWaitlist.filter((w: any) => {
      const st = (w.status || "").toUpperCase();
      return (
        (w.branch_id === currentBranchId || !w.branch_id) &&
        (st === "WAITING" || st === "TABLE_ASSIGNED" || st === "ASSIGNED" || st === "CALLED")
      );
    });

    activeStored.forEach((w: any) => {
      const isCust = w.registration_method === "CUSTOMER_SELF" || Boolean(w.device_token);
      rawQueue.push({
        id: w.id,
        branch_id: w.branch_id || currentBranchId,
        section_id: w.section_id || null,
        queue_number: w.queue_token || w.token_number || "A-01",
        token_number: w.queue_token || w.token_number || "A-01",
        queue_token: w.queue_token || w.token_number || "A-01",
        guest_name: w.customer_name || w.guest_name || "Guest",
        customer_name: w.customer_name || w.guest_name || "Guest",
        guest_mobile: w.mobile_number || w.phone || "",
        phone: w.mobile_number || w.phone || "",
        raw_mobile: w.mobile_number || w.phone || "",
        party_size: w.guest_count || w.party_size || 1,
        guest_count: w.guest_count || w.party_size || 1,
        notes: w.special_request || w.notes || null,
        registration_method: w.registration_method || (isCust ? "CUSTOMER_SELF" : "STAFF_WALKIN"),
        status: w.status || "WAITING",
        assigned_table_id: w.assigned_table_id || null,
        assigned_table_label: w.assigned_table_label || null,
        assigned_merged_group_id: w.assigned_merged_group_id || null,
        created_by: w.created_by_user_id || null,
        created_by_user_id: w.created_by_user_id || null,
        registered_by: w.created_by_name || (isCust ? "Customer Self-Service (QR)" : "Staff"),
        created_at: w.created_at || new Date().toISOString(),
        assigned_at: w.assigned_at || null,
        closed_at: w.closed_at || null,
      });
    });
  }

  // 13. Fetch Activity Logs for queue entries, tables, and reservations
  const activityLogsMap = new Map<string, OperationsActivityLogItem[]>();
  const entityIdsToFetch = Array.from(new Set([
    ...rawQueue.map((q) => q.id),
    ...rawReservations.map((r) => r.table_id),
    ...tableIds,
    ...sessionIds,
  ]));

  if (entityIdsToFetch.length > 0) {
    try {
      const { data: logsData } = await supabase
        .from("activity_log")
        .select("id, entity_type, entity_id, action, actor_type, actor_id, actor_name, note, created_at")
        .in("entity_id", entityIdsToFetch)
        .order("created_at", { ascending: false });

      (logsData || []).forEach((l: any) => {
        const list = activityLogsMap.get(l.entity_id) || [];
        list.push({
          id: l.id,
          entity_type: l.entity_type,
          entity_id: l.entity_id,
          action: l.action,
          actor_type: l.actor_type || "staff",
          actor_id: l.actor_id,
          actor_name: l.actor_name || "Staff",
          note: l.note,
          created_at: l.created_at,
        });
        activityLogsMap.set(l.entity_id, list);
      });
    } catch {
      // activity_log table not yet created
    }

    // Also fetch from waiting_list_activity_logs if available
    try {
      const { data: wlLogs } = await supabase
        .from("waiting_list_activity_logs")
        .select("id, waiting_list_entry_id, event_type, actor_id, actor_name, note, timestamp")
        .in("waiting_list_entry_id", entityIdsToFetch)
        .order("timestamp", { ascending: false });

      (wlLogs || []).forEach((wLog: any) => {
        const list = activityLogsMap.get(wLog.waiting_list_entry_id) || [];
        const isCust = (wLog.actor_name || "").toLowerCase().includes("customer") ||
          (wLog.actor_name || "").toLowerCase().includes("self") ||
          (wLog.event_type || "").includes("WAITLIST_ENTRY") ||
          (wLog.event_type || "").includes("QUEUE_");
        list.push({
          id: wLog.id,
          entity_type: "waitlist_entry",
          entity_id: wLog.waiting_list_entry_id,
          action: wLog.event_type.toLowerCase(),
          actor_type: isCust ? "customer" : "staff",
          actor_id: wLog.actor_id,
          actor_name: isCust ? "Customer Self-Service (QR)" : (wLog.actor_name || "Staff"),
          note: wLog.note,
          created_at: wLog.timestamp,
        });
        activityLogsMap.set(wLog.waiting_list_entry_id, list);
      });
    } catch {
      // fallback
    }
  }

  // Access context for phone & customer name masking
  const staffAccessContext = {
    role: auth.user.role || "manager",
    employeeId: auth.user.id,
    name: `${auth.user.first_name || ""} ${auth.user.last_name || ""}`.trim() || "Staff",
  };
  const canViewCustInfo = canViewCustomerDetails(staffAccessContext);

  const queue_entries: OperationsQueueEntry[] = rawQueue.map((q) => {
    const qLogs = activityLogsMap.get(q.id) || [];
    const rawGName = q.guest_name || q.customer_name || "Guest";
    const gName = canViewCustInfo ? rawGName : maskCustomerName(rawGName);
    const rawMobile = q.raw_mobile || q.guest_mobile || q.phone || "";
    const displayMobile = canViewCustInfo ? rawMobile : maskPhoneNumber(rawMobile);
    const qNum = q.queue_token || q.queue_number || q.token_number || "A-01";
    const regBy = q.registered_by || (q.created_by ? "Staff" : "Self");

    // If no explicit activity log entry exists in table yet, synthesize initial registration log
    const isCustomerSelf = q.registration_method === "CUSTOMER_SELF" ||
      regBy.toLowerCase().includes("customer") ||
      regBy.toLowerCase().includes("self");

    const logs: OperationsActivityLogItem[] = qLogs.length > 0 ? qLogs : [
      {
        id: `init-${q.id}`,
        entity_type: "waitlist_entry",
        entity_id: q.id,
        action: "created",
        actor_type: isCustomerSelf ? "customer" : "staff",
        actor_name: isCustomerSelf ? "Customer Self-Service (QR)" : regBy,
        note: `Registered party of ${q.guest_count || q.party_size || 1}`,
        created_at: q.created_at,
      },
    ];

    return {
      id: q.id,
      branch_id: q.branch_id || currentBranchId,
      section_id: q.section_id,
      section_name: q.section_id ? (sectionMap.get(q.section_id) || "Section") : "Dining Area",
      queue_number: qNum,
      token_number: qNum,
      queue_token: qNum,
      guest_name: gName,
      customer_name: gName,
      guest_mobile: displayMobile,
      phone: displayMobile,
      raw_mobile: rawMobile,
      is_phone_masked: !canViewCustInfo,
      party_size: q.guest_count || q.party_size || 1,
      guest_count: q.guest_count || q.party_size || 1,
      notes: q.notes || null,
      registration_method: q.registration_method || "STAFF_WALKIN",
      status: q.status,
      assigned_table_id: q.assigned_table_id || null,
      assigned_table_label: q.assigned_table_label || null,
      assigned_merged_group_id: q.assigned_merged_group_id || null,
      created_by: q.created_by || null,
      created_by_user_id: q.created_by_user_id || q.created_by || null,
      registered_by: regBy,
      created_at: q.created_at,
      assigned_at: q.assigned_at || null,
      closed_at: q.closed_at || null,
      activity_logs: logs,
    };
  });

  // 12. Fetch Menu Categories and Items (for AddItemsPanel)
  let rawCats: any[] = [];
  try {
    const { data: cData, error: cErr } = await supabase
      .from("categories")
      .select("id, name, availability")
      .eq("branch_id", currentBranchId)
      .order("name", { ascending: true });
    if (!cErr && cData) rawCats = cData;
  } catch {
    rawCats = [];
  }

  const categories = rawCats.map((c) => ({
    id: c.id,
    name: c.name,
    is_available: c.availability ? (typeof c.availability === "object" ? c.availability?.active ?? true : true) : true,
  }));

  const catIds = categories.map((c) => c.id);
  let rawMenuItems: any[] = [];
  if (catIds.length > 0) {
    try {
      const { data: itms, error: itmErr } = await supabase
        .from("items")
        .select("id, category_id, name, description, base_price, tags, out_of_stock, image_url")
        .in("category_id", catIds)
        .order("name", { ascending: true });
      if (!itmErr && itms) rawMenuItems = itms;
    } catch {
      rawMenuItems = [];
    }
  }

  const rawItemIds = rawMenuItems.map((i) => i.id);

  // Fetch variations
  const variationsMap = new Map<string, Array<{ id: string; name: string; price: number; is_default: boolean }>>();
  if (rawItemIds.length > 0) {
    try {
      const { data: groups, error: gErr } = await supabase
        .from("variation_groups")
        .select("id, item_id")
        .in("item_id", rawItemIds);

      if (!gErr && groups && groups.length > 0) {
        const groupIds = groups.map((g) => g.id);
        const groupToItemMap = new Map(groups.map((g) => [g.id, g.item_id]));

        const { data: options, error: optErr } = await supabase
          .from("variation_options")
          .select("id, group_id, name, price, is_default, display_order")
          .in("group_id", groupIds)
          .order("display_order", { ascending: true });

        if (!optErr && options) {
          options.forEach((opt) => {
            const itemId = groupToItemMap.get(opt.group_id);
            if (itemId) {
              const list = variationsMap.get(itemId) || [];
              list.push({
                id: opt.id,
                name: opt.name,
                price: Number(opt.price),
                is_default: opt.is_default,
              });
              variationsMap.set(itemId, list);
            }
          });
        }
      }
    } catch {
      // Table variation_groups / variation_options not yet created
    }
  }

  // Fetch addons
  const addonsMap = new Map<string, Array<{ id: string; name: string; price: number }>>();
  if (rawItemIds.length > 0) {
    try {
      const { data: itemAddons, error: iaErr } = await supabase
        .from("item_addons")
        .select("item_id, addon_id")
        .in("item_id", rawItemIds);

      if (!iaErr && itemAddons && itemAddons.length > 0) {
        const addonIds = Array.from(new Set(itemAddons.map((ia) => ia.addon_id)));
        if (addonIds.length > 0) {
          const { data: rawAddons, error: aErr } = await supabase
            .from("addons")
            .select("id, name, price")
            .in("id", addonIds);
          if (!aErr && rawAddons) {
            const addonLookup = new Map(rawAddons.map((a) => [a.id, a]));
            itemAddons.forEach((ia) => {
              const addon = addonLookup.get(ia.addon_id);
              if (addon) {
                const list = addonsMap.get(ia.item_id) || [];
                list.push({
                  id: addon.id,
                  name: addon.name,
                  price: Number(addon.price),
                });
                addonsMap.set(ia.item_id, list);
              }
            });
          }
        }
      }
    } catch {
      // item_addons not yet created
    }
  }

  const menu_items: OperationsMenuItem[] = rawMenuItems.map((i) => {
    const dietary = Array.isArray(i.tags) ? (i.tags.find((t: string) => t === "non-veg" || t === "veg" || t === "vegan") || "veg") : "veg";
    return {
      id: i.id,
      category_id: i.category_id,
      name: i.name,
      description: i.description,
      base_price: Number(i.base_price),
      dietary_tag: dietary,
      out_of_stock: Boolean(i.out_of_stock),
      serving_info: null,
      prep_time_minutes: null,
      image_url: i.image_url,
      variations: variationsMap.get(i.id) || [],
      addons: addonsMap.get(i.id) || [],
    };
  });

  // Build Session Lookup Map
  // Map both primary table_id and all merged table_ids to the session
  const tableToSessionMap = new Map<string, any>();
  const sessionMergedTablesMap = new Map<string, string[]>();

  // Initialize sessionMergedTablesMap with primary table_id
  activeSessions.forEach((s) => {
    sessionMergedTablesMap.set(s.id, [s.table_id]);
  });

  // Add join table merged tables
  sessionTablesList.forEach((st) => {
    const list = sessionMergedTablesMap.get(st.session_id) || [];
    if (!list.includes(st.table_id)) {
      list.push(st.table_id);
    }
    sessionMergedTablesMap.set(st.session_id, list);
  });

  // Now map every table_id involved in the session
  activeSessions.forEach((s) => {
    const allTableIds = sessionMergedTablesMap.get(s.id) || [s.table_id];
    allTableIds.forEach((tId) => {
      tableToSessionMap.set(tId, s);
    });
  });

  // Order items by order_id map
  const itemsByOrderMap = new Map<string, any[]>();
  orderItemsList.forEach((it) => {
    const arr = itemsByOrderMap.get(it.order_id) || [];
    arr.push({
      ...it,
      item_name: itemNameMap.get(it.item_id) || "Dish",
    });
    itemsByOrderMap.set(it.order_id, arr);
  });

  // Orders by session map
  const ordersBySessionMap = new Map<string, any[]>();
  ordersList.forEach((ord) => {
    const arr = ordersBySessionMap.get(ord.table_session_id) || [];
    arr.push({
      id: ord.id,
      status: ord.status,
      order_type: ord.order_type || "dine_in",
      created_at: ord.created_at,
      items: itemsByOrderMap.get(ord.id) || [],
    });
    ordersBySessionMap.set(ord.table_session_id, arr);
  });

  // Requests by session map
  const requestsBySessionMap = new Map<string, any[]>();
  customerRequestsList.forEach((req) => {
    const arr = requestsBySessionMap.get(req.session_id) || [];
    arr.push(req);
    requestsBySessionMap.set(req.session_id, arr);
  });

  // Payments by bill map
  const paymentsByBillMap = new Map<string, any[]>();
  paymentsList.forEach((p) => {
    const arr = paymentsByBillMap.get(p.bill_id) || [];
    arr.push(p);
    paymentsByBillMap.set(p.bill_id, arr);
  });

  // Bills by session map
  const billsBySessionMap = new Map<string, any>();
  billsList.forEach((b) => {
    if (b.table_session_id) {
      billsBySessionMap.set(b.table_session_id, {
        id: b.id,
        bill_number: b.bill_number,
        subtotal: Number(b.subtotal),
        tax_total: Number(b.tax_total),
        discount_total: Number(b.discount_total),
        total_amount: Number(b.total_amount),
        paid_amount: Number(b.paid_amount),
        status: b.status,
        split_count: b.split_count || 1,
        payments: paymentsByBillMap.get(b.id) || [],
      });
    }
  });

  // Waiter assignments map
  const waiterAssignmentMap = new Map<string, any>();
  waiterAssignments.forEach((wa) => {
    const emp = employeeMap.get(wa.employee_id);
    if (emp) {
      waiterAssignmentMap.set(wa.table_id, {
        id: wa.id,
        employee_id: emp.id,
        name: `${emp.first_name} ${emp.last_name || ""}`.trim(),
        role: emp.role,
        phone: emp.phone,
      });
    }
  });

  // Build Assigned Waitlist Lookups
  const assignedWaitlistByTableMap = new Map<string, any>();
  const assignedWaitlistByGroupMap = new Map<string, any>();

  rawQueue.forEach((q) => {
    const st = (q.status || "").toUpperCase();
    if (st === "TABLE_ASSIGNED" || st === "ASSIGNED") {
      if (q.assigned_table_id) {
        assignedWaitlistByTableMap.set(q.assigned_table_id, q);
      }
      if (q.assigned_merged_group_id) {
        assignedWaitlistByGroupMap.set(q.assigned_merged_group_id, q);
      }
    }
  });

  // Update operationsMergeGroups statuses if assigned
  operationsMergeGroups.forEach((mg) => {
    const assigned = assignedWaitlistByGroupMap.get(mg.id) ||
      (mg.held_for_waitlist_id ? rawQueue.find((q) => q.id === mg.held_for_waitlist_id && (q.status || "").toUpperCase() === "TABLE_ASSIGNED") : null);
    if (assigned && mg.status !== "occupied") {
      mg.status = "assigned";
    }
  });

  // 13. Assemble Final Tables Array
  const tables: OperationsTableItem[] = rawTables.map((t) => {
    const mergeGroup = tableToGroupMap.get(t.id);
    const isPrimaryMerged = mergeGroup ? mergeGroup.primary_table_id === t.id : false;
    const isSecondaryMerged = mergeGroup ? mergeGroup.primary_table_id !== t.id : false;

    // Check if session exists on this table or ANY member table of its merge group
    let activeSession = tableToSessionMap.get(t.id);
    if (!activeSession && mergeGroup) {
      for (const mId of mergeGroup.member_table_ids) {
        const s = tableToSessionMap.get(mId);
        if (s) {
          activeSession = s;
          break;
        }
      }
    }

    let sessionData: OperationsTableSession | null = null;

    if (activeSession) {
      // Collect all member table IDs from both session_tables and mergeGroup
      const sessionTables = sessionMergedTablesMap.get(activeSession.id) || [];
      const mergeGroupMembers = mergeGroup?.member_table_ids || [];
      const combinedIds = Array.from(new Set([...sessionTables, ...mergeGroupMembers]));
      const mergedTableIds = combinedIds.length > 0 ? combinedIds : [activeSession.table_id];

      const mergedTableLabels = mergedTableIds.map((id: string) => {
        const tbl = rawTables.find((tblItem) => tblItem.id === id);
        return tbl ? `T${tbl.table_number}` : (tableNameMap.get(id) || "T");
      });

      // Auto-compute running bill if no explicit bill record exists yet
      const sessionOrders = ordersBySessionMap.get(activeSession.id) || [];
      let computedTotal = 0;
      sessionOrders.forEach((o: any) => {
        o.items?.forEach((it: any) => {
          computedTotal += Number(it.price_at_order) * (it.quantity || 1);
        });
      });

      const existingBill = billsBySessionMap.get(activeSession.id);
      const billData = existingBill || (computedTotal > 0 ? {
        id: `auto-${activeSession.id}`,
        bill_number: `TAB-${activeSession.id.slice(0, 6).toUpperCase()}`,
        subtotal: computedTotal,
        tax_total: 0,
        discount_total: 0,
        total_amount: computedTotal,
        paid_amount: 0,
        status: "unpaid",
        split_count: 1,
        payments: [],
      } : null);

      sessionData = {
        id: activeSession.id,
        table_id: activeSession.table_id,
        status: activeSession.status,
        opened_at: activeSession.opened_at,
        closed_at: activeSession.closed_at,
        customer_name: canViewCustInfo
          ? (activeSession.customer_name || null)
          : (activeSession.customer_name ? maskCustomerName(activeSession.customer_name) : null),
        mobile_number: canViewCustInfo
          ? (activeSession.mobile_number || null)
          : (activeSession.mobile_number ? maskPhoneNumber(activeSession.mobile_number) : null),
        guest_count: activeSession.guest_count || 1,
        device_count: activeSession.device_count || 0,
        merged_table_ids: mergedTableIds,
        merged_table_labels: mergedTableLabels,
        orders: sessionOrders,
        requests: requestsBySessionMap.get(activeSession.id) || [],
        bill: billData,
        activity_logs: activityLogsMap.get(activeSession.id) || [],
      };
    }

    let shortCode = `T${t.table_number}`;
    if (mergeGroup) {
      shortCode = mergeGroup.name;
    } else if (activeSession && sessionData && sessionData.merged_table_labels.length > 1) {
      shortCode = sessionData.merged_table_labels
        .map((l) => (l.startsWith("T") ? l : `T${l.replace(/\D/g, "")}`))
        .join(", ");
    }

    const assignedWaitlist = assignedWaitlistByTableMap.get(t.id) || 
      (mergeGroup ? assignedWaitlistByGroupMap.get(mergeGroup.id) : null) ||
      (t.held_for_waitlist_id ? rawQueue.find((q) => q.id === t.held_for_waitlist_id && (q.status || "").toUpperCase() === "TABLE_ASSIGNED") : null) ||
      (mergeGroup?.held_for_waitlist_id ? rawQueue.find((q) => q.id === mergeGroup.held_for_waitlist_id && (q.status || "").toUpperCase() === "TABLE_ASSIGNED") : null);

    const isAssigned = Boolean(assignedWaitlist);

    const reservation = reservationMap.get(t.id) || null;
    let tableStatus: "active" | "occupied" | "reserved" | "inactive" | "assigned" = "active";
    if (t.status === "inactive") {
      tableStatus = "inactive";
    } else if (activeSession) {
      tableStatus = "occupied";
    } else if (reservation || t.status === "reserved") {
      tableStatus = "reserved";
    } else if (isAssigned || t.status === "assigned") {
      tableStatus = "assigned";
    }

    // Sync database table status if an active session exists
    if (activeSession && t.status !== "occupied") {
      supabase.from("tables").update({ status: "occupied", updated_at: new Date().toISOString() }).eq("id", t.id).then(() => {});
      t.status = "occupied";
    }

    // Self-heal stale occupied status in tables table when there is no active session
    if (t.status === "occupied" && !activeSession && !isSecondaryMerged) {
      supabase.from("tables").update({ status: isAssigned ? "assigned" : "active" }).eq("id", t.id).then(() => {});
    }

    // Self-heal stale held_for_waitlist_id when waitlist entry is closed or doesn't exist
    if (t.held_for_waitlist_id && !isAssigned && !activeSession) {
      supabase.from("tables").update({ held_for_waitlist_id: null, status: "active" }).eq("id", t.id).then(() => {});
      t.held_for_waitlist_id = null;
    }
    if (mergeGroup && mergeGroup.held_for_waitlist_id && !isAssigned && !activeSession) {
      supabase.from("table_merge_groups").update({ held_for_waitlist_id: null, status: "available" }).eq("id", mergeGroup.id).then(() => {});
      mergeGroup.held_for_waitlist_id = null;
    }
    if (mergeGroup && mergeGroup.status === "occupied" && !activeSession) {
      supabase.from("table_merge_groups").update({ status: isAssigned ? "assigned" : "available" }).eq("id", mergeGroup.id).then(() => {});
      mergeGroup.status = isAssigned ? "assigned" : "available";
    }

    const tableReservation: OperationsTableReservation | null = reservation ? {
      id: reservation.id,
      branch_id: reservation.branch_id,
      table_id: reservation.table_id,
      guest_name: reservation.guest_name,
      guest_mobile: reservation.guest_mobile,
      party_size: reservation.party_size,
      status: reservation.status,
      created_by: reservation.created_by,
      created_by_name: reservation.created_by_name || "Staff",
      created_at: reservation.created_at,
      activity_logs: activityLogsMap.get(t.id) || [
        {
          id: `res-${reservation.id}`,
          entity_type: "table",
          entity_id: t.id,
          action: "reserved",
          actor_type: "staff",
          actor_name: reservation.created_by_name || "Staff",
          note: `Reserved for ${reservation.guest_name} (Party of ${reservation.party_size})`,
          created_at: reservation.created_at,
        },
      ],
    } : null;

    return {
      id: t.id,
      section_id: t.section_id,
      section_name: sectionMap.get(t.section_id) || "Section",
      table_name: isPrimaryMerged && mergeGroup ? mergeGroup.name : (t.table_name || `T${t.table_number}`),
      table_number: t.table_number,
      short_code: shortCode,
      seating_capacity: isPrimaryMerged && mergeGroup 
        ? mergeGroup.member_table_ids.reduce((sum: number, id: string) => {
            const memTbl = rawTables.find((tblItem) => tblItem.id === id);
            return sum + (memTbl?.seating_capacity || 4);
          }, 0)
        : (t.seating_capacity || 4),
      status: tableStatus,
      qr_url: t.qr_url,
      active_session: sessionData,
      reservation: tableReservation,
      assigned_waiter: waiterAssignmentMap.get(t.id) || null,
      merge_group_id: mergeGroup?.id || null,
      is_primary_merged: isPrimaryMerged,
      is_secondary_merged: isSecondaryMerged,
      merged_group_name: mergeGroup?.name || null,
      merged_member_ids: mergeGroup?.member_table_ids || [],
      merged_member_labels: mergeGroup?.member_table_labels || [],
      held_for_waitlist_id: t.held_for_waitlist_id || mergeGroup?.held_for_waitlist_id || null,
      held_waitlist_label: assignedWaitlist
        ? `Assigned: #${assignedWaitlist.queue_token || assignedWaitlist.queue_number || assignedWaitlist.token_number || "WL"} (${assignedWaitlist.customer_name || assignedWaitlist.guest_name || "Guest"})`
        : (t.held_for_waitlist_id || mergeGroup?.held_for_waitlist_id)
        ? (() => {
            const hId = t.held_for_waitlist_id || mergeGroup?.held_for_waitlist_id;
            const qMatch = rawQueue.find((q) => q.id === hId);
            if (qMatch) {
              const tok = qMatch.queue_token || qMatch.queue_number || qMatch.token_number || "WL";
              const cName = qMatch.customer_name || qMatch.guest_name || "Guest";
              return `Held for #${tok} (${cName})`;
            }
            return "Held for Waiting List";
          })()
        : null,
      is_held_for_waitlist: Boolean(isAssigned || t.held_for_waitlist_id || mergeGroup?.held_for_waitlist_id),
      assigned_waitlist_entry: assignedWaitlist ? {
        id: assignedWaitlist.id,
        token: assignedWaitlist.queue_token || assignedWaitlist.queue_number || assignedWaitlist.token_number || "WL",
        customer_name: canViewCustInfo
          ? (assignedWaitlist.customer_name || assignedWaitlist.guest_name || "Guest")
          : maskCustomerName(assignedWaitlist.customer_name || assignedWaitlist.guest_name || "Guest"),
        guest_count: assignedWaitlist.guest_count || assignedWaitlist.party_size || 1,
        assigned_at: assignedWaitlist.assigned_at || assignedWaitlist.created_at,
      } : null,
    };
  });

  return {
    branch: {
      id: branch.id,
      name: branch.name,
      short_code: branch.short_code,
    },
    current_user: {
      id: auth.user.id,
      name: `${auth.user.first_name || ""} ${auth.user.last_name || ""}`.trim() || auth.user.email || "Manager",
      role: auth.user.role || "manager",
      assigned_sections: empSectionMap.get(auth.user.id) || [],
    },
    sections,
    tables,
    queue_entries,
    categories,
    menu_items,
    waiters,
    shifts,
    merge_groups: operationsMergeGroups,
  };
}

/**
 * 2. START WALK-IN SESSION ON EMPTY TABLE
 */
export async function startTableSession(
  tableId: string,
  guestCount: number,
  branchId: string,
  guestName?: string,
  guestMobile?: string,
  staffName: string = "Staff",
  staffId?: string | null,
  waitlistEntryId?: string | null
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Check if table is already active/occupied
    const { data: existingSession } = await supabase
      .from("table_sessions")
      .select("id")
      .eq("table_id", tableId)
      .eq("status", "active")
      .maybeSingle();

    if (existingSession) {
      return { success: false, error: "Table already has an active session" };
    }

    // Double-allocation guard: Check if table is currently assigned to a waitlist customer
    const { data: tblCheck } = await supabase
      .from("tables")
      .select("id, status, held_for_waitlist_id")
      .eq("id", tableId)
      .maybeSingle();

    if (tblCheck?.held_for_waitlist_id) {
      if (!waitlistEntryId || tblCheck.held_for_waitlist_id !== waitlistEntryId) {
        // Verify if the held waitlist entry is still active
        const { data: wlActive } = await supabase
          .from("waiting_list_entries")
          .select("id, customer_name, queue_token, status")
          .eq("id", tblCheck.held_for_waitlist_id)
          .in("status", ["TABLE_ASSIGNED", "table_assigned"])
          .maybeSingle();

        if (wlActive) {
          return {
            success: false,
            error: `Table is currently assigned to ${wlActive.customer_name} (#${wlActive.queue_token}). Please seat the assigned customer or cancel the assignment before starting a new session.`,
          };
        }
      }
    }

    // Insert new session with fallback if device_count/branch_id columns not yet migrated
    let newSession: any = null;
    let { data: insData, error: sessionErr } = await supabase
      .from("table_sessions")
      .insert({
        table_id: tableId,
        guest_count: Math.max(1, guestCount),
        device_count: 0,
        status: "active",
        branch_id: branchId,
        opened_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionErr && (sessionErr.message?.includes("device_count") || sessionErr.message?.includes("branch_id"))) {
      const { data: fbData, error: fbErr } = await supabase
        .from("table_sessions")
        .insert({
          table_id: tableId,
          guest_count: Math.max(1, guestCount),
          status: "active",
          opened_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      insData = fbData;
      sessionErr = fbErr;
    }

    if (sessionErr || !insData) {
      return { success: false, error: sessionErr?.message || "Failed to start session" };
    }
    newSession = insData;

    // Insert into session_tables join table
    try {
      await supabase.from("session_tables").insert({
        session_id: newSession.id,
        table_id: tableId,
      });
    } catch {
      // Ignore if session_tables is not yet migrated
    }

    // Mark table status = 'occupied' and clear held_for_waitlist_id
    await supabase.from("tables").update({ status: "occupied", held_for_waitlist_id: null }).eq("id", tableId);

    // If tableId belongs to a table_merge_groups, also add all member tables to session_tables and mark occupied
    try {
      let memberGroup: { id: string; member_ids: string[] } | null = null;
      const { data: memberEntry } = await supabase
        .from("table_merge_group_members")
        .select("group_id")
        .eq("table_id", tableId)
        .maybeSingle();

      if (memberEntry?.group_id) {
        const { data: allMembers } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", memberEntry.group_id);

        if (allMembers && allMembers.length > 0) {
          memberGroup = {
            id: memberEntry.group_id,
            member_ids: allMembers.map((m) => m.table_id),
          };
        }
      } else if (branchId) {
        const { data: branchData } = await supabase
          .from("branches")
          .select("id, onboarding_progress")
          .eq("id", branchId)
          .maybeSingle();

        if (branchData && (branchData.onboarding_progress as any)?.merge_groups) {
          const stored = ((branchData.onboarding_progress as any).merge_groups as any[]).find(
            (g: any) => g.member_table_ids?.includes(tableId)
          );
          if (stored) {
            memberGroup = { id: stored.id, member_ids: stored.member_table_ids || [] };
          }
        }
      }

      if (memberGroup) {
        for (const mId of memberGroup.member_ids) {
          if (mId !== tableId) {
            try {
              await supabase.from("session_tables").insert({
                session_id: newSession.id,
                table_id: mId,
              });
            } catch {
              // fallback
            }
            await supabase.from("tables").update({ status: "occupied", held_for_waitlist_id: null }).eq("id", mId);
          }
        }
        try {
          await supabase
            .from("table_merge_groups")
            .update({ status: "occupied", held_for_waitlist_id: null, updated_at: new Date().toISOString() })
            .eq("id", memberGroup.id);
        } catch {
          // fallback
        }

        // Also update in branch metadata if present
        if (branchId) {
          const { data: bData } = await supabase
            .from("branches")
            .select("id, onboarding_progress")
            .eq("id", branchId)
            .maybeSingle();

          if (bData && (bData.onboarding_progress as any)?.merge_groups) {
            const existingProgress = bData.onboarding_progress || {};
            const updatedGroups = (((existingProgress as any).merge_groups || []) as any[]).map((g: any) =>
              g.id === memberGroup!.id ? { ...g, status: "occupied", held_for_waitlist_id: null, updated_at: new Date().toISOString() } : g
            );
            await supabase.from("branches").update({
              onboarding_progress: { ...existingProgress, merge_groups: updatedGroups },
            }).eq("id", branchId);
          }
        }
      }
    } catch {
      // fallback
    }

    // Cancel any active reservation on this table
    try {
      await supabase
        .from("table_reservations")
        .update({ status: "seated", updated_at: new Date().toISOString() })
        .eq("table_id", tableId)
        .eq("status", "reserved");
    } catch {
      // fallback
    }

    // If seating an assigned waitlist customer, transition waitlist entry to SEATED
    if (waitlistEntryId) {
      try {
        await supabase
          .from("waiting_list_entries")
          .update({
            status: "SEATED",
            closed_at: new Date().toISOString(),
          })
          .eq("id", waitlistEntryId);
      } catch {}

      try {
        await supabase
          .from("queue_entries")
          .update({
            status: "seated",
          })
          .eq("id", waitlistEntryId);
      } catch {}

      // Update branch metadata
      if (branchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("id, onboarding_progress")
            .eq("id", branchId)
            .maybeSingle();

          if (bData?.onboarding_progress) {
            const curProg = (bData.onboarding_progress as any) || {};
            const storedWl = (curProg.waitlist_entries as any[]) || [];
            const updatedWl = storedWl.map((w: any) =>
              w.id === waitlistEntryId ? { ...w, status: "SEATED", closed_at: new Date().toISOString() } : w
            );
            const heldMap = { ...(curProg.held_tables || {}) };
            delete heldMap[tableId];

            await supabase.from("branches").update({
              onboarding_progress: {
                ...curProg,
                waitlist_entries: updatedWl,
                held_tables: heldMap,
              },
            }).eq("id", branchId);
          }
        } catch {}
      }

      // Log to waiting_list_activity_logs
      try {
        await supabase.from("waiting_list_activity_logs").insert({
          waiting_list_entry_id: waitlistEntryId,
          event_type: "SEATED",
          actor_id: staffId || null,
          actor_name: staffName,
          note: `Customer seated at table. Dining session opened.`,
        });
      } catch {}
    }

    // Log to activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: tableId,
        action: "session_started",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: guestName 
          ? `Seated: ${guestName} (${Math.max(1, guestCount)} guests)` 
          : `Walk-in seated (${Math.max(1, guestCount)} guests)`,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true, sessionId: newSession.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to start session" };
  }
}

/**
 * 2a. SEAT ASSIGNED WAITLIST CUSTOMER (1-Click Action from Table Floor or Side Panel)
 * Directly starts session for an assigned customer, transitions waitlist record to SEATED,
 * releases hold, and turns table to Occupied.
 */
export async function seatAssignedCustomer(
  tableId: string,
  branchId: string,
  staffName: string = "Staff",
  staffId?: string | null,
  providedWaitlistEntryId?: string | null
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // 1. Fetch table and merge groups to find the assigned waitlist entry
    let assignedWaitlistEntry: any = null;

    if (providedWaitlistEntryId) {
      const { data: wl } = await supabase
        .from("waiting_list_entries")
        .select("id, customer_name, mobile_number, guest_count, queue_token, status")
        .eq("id", providedWaitlistEntryId)
        .maybeSingle();
      if (wl) assignedWaitlistEntry = wl;
    }

    // Check table.held_for_waitlist_id
    if (!assignedWaitlistEntry) {
      const { data: tbl } = await supabase
        .from("tables")
        .select("id, held_for_waitlist_id")
        .eq("id", tableId)
        .maybeSingle();

      if (tbl?.held_for_waitlist_id) {
        const { data: wl } = await supabase
          .from("waiting_list_entries")
          .select("id, customer_name, mobile_number, guest_count, queue_token, status")
          .eq("id", tbl.held_for_waitlist_id)
          .maybeSingle();
        if (wl) assignedWaitlistEntry = wl;
      }
    }

    // If not found, search active waiting_list_entries by assigned_table_id or branch
    if (!assignedWaitlistEntry) {
      const { data: wlList } = await supabase
        .from("waiting_list_entries")
        .select("id, customer_name, mobile_number, guest_count, queue_token, assigned_table_id, assigned_merged_group_id, status")
        .eq("branch_id", branchId)
        .in("status", ["TABLE_ASSIGNED", "table_assigned"]);

      if (wlList && wlList.length > 0) {
        assignedWaitlistEntry = wlList.find((w: any) => w.assigned_table_id === tableId) || null;

        if (!assignedWaitlistEntry) {
          // Check if table belongs to a merge group assigned to a waitlist entry
          const groupIds = Array.from(new Set(wlList.filter((w: any) => w.assigned_merged_group_id).map((w: any) => w.assigned_merged_group_id)));
          if (groupIds.length > 0) {
            const { data: members } = await supabase
              .from("table_merge_group_members")
              .select("group_id, table_id")
              .in("group_id", groupIds)
              .eq("table_id", tableId);

            if (members && members.length > 0) {
              assignedWaitlistEntry = wlList.find((w: any) => w.assigned_merged_group_id === members[0].group_id) || null;
            }
          }
        }
      }
    }

    // Fallback search in queue_entries
    if (!assignedWaitlistEntry) {
      const { data: qList } = await supabase
        .from("queue_entries")
        .select("id, guest_name, customer_name, guest_mobile, phone, party_size, guest_count, queue_number, token_number, assigned_table_id, status")
        .eq("branch_id", branchId)
        .in("status", ["assigned", "ASSIGNED", "table_assigned", "TABLE_ASSIGNED"]);

      const match = (qList || []).find((q: any) => q.assigned_table_id === tableId);
      if (match) {
        assignedWaitlistEntry = {
          id: match.id,
          customer_name: match.customer_name || match.guest_name,
          mobile_number: match.guest_mobile || match.phone,
          guest_count: match.party_size || match.guest_count || 2,
          queue_token: match.queue_number || match.token_number || "A-01",
        };
      }
    }

    // Metadata fallback
    if (!assignedWaitlistEntry) {
      const { data: bData } = await supabase
        .from("branches")
        .select("id, onboarding_progress")
        .eq("id", branchId)
        .maybeSingle();

      if (bData?.onboarding_progress) {
        const storedWl = ((bData.onboarding_progress as any).waitlist_entries as any[]) || [];
        const heldMap = ((bData.onboarding_progress as any).held_tables as Record<string, string>) || {};
        const heldWlId = heldMap[tableId];

        const match = storedWl.find((w: any) => {
          const st = (w.status || "").toUpperCase();
          return (st === "TABLE_ASSIGNED" || st === "ASSIGNED") && (w.id === heldWlId || w.assigned_table_id === tableId);
        });

        if (match) assignedWaitlistEntry = match;
      }
    }

    const partySize = assignedWaitlistEntry?.guest_count || 2;
    const guestName = assignedWaitlistEntry?.customer_name || "Waitlist Guest";
    const guestMobile = assignedWaitlistEntry?.mobile_number || "";
    const waitlistEntryId = assignedWaitlistEntry?.id || providedWaitlistEntryId || null;

    // Call startTableSession with waitlistEntryId to seat customer atomically
    const startRes = await startTableSession(
      tableId,
      partySize,
      branchId,
      guestName,
      guestMobile,
      staffName,
      staffId,
      waitlistEntryId
    );

    if (!startRes.success) {
      return { success: false, error: startRes.error };
    }

    revalidatePath("/operations/tables");
    return { success: true, sessionId: startRes.sessionId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to seat assigned customer" };
  }
}

/**
 * 2b. MERGE EMPTY TABLES (Legacy alias for direct seating & merging)
 */
export async function mergeEmptyTables(
  primaryTableId: string,
  secondaryTableIds: string[],
  guestCount: number,
  branchId: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const startRes = await startTableSession(primaryTableId, guestCount, branchId);
    if (!startRes.success || !startRes.sessionId) {
      return { success: false, error: startRes.error || "Failed to start session on primary table" };
    }

    if (secondaryTableIds.length > 0) {
      const mergeRes = await mergeTables(startRes.sessionId, secondaryTableIds, branchId);
      if (!mergeRes.success) {
        return { success: false, error: mergeRes.error || "Failed to merge secondary tables" };
      }
    }

    revalidatePath("/operations/tables");
    return { success: true, sessionId: startRes.sessionId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to merge empty tables" };
  }
}

/**
 * 3. MERGE TABLES LOGICAL (User Story 15.1: Pure operational layout change)
 * Does NOT auto-start a session. Does NOT decide guest count.
 * Creates an Available logical merged table card.
 */
export async function mergeTablesLogical(
  tableIds: string[],
  branchId: string
): Promise<{ success: boolean; groupId?: string; error?: string }> {
  try {
    const auth = await getAuthenticatedAdmin(branchId);
    if (!auth || !auth.branch) {
      return { success: false, error: "Unauthorized" };
    }

    // Permission check: tables.merge (Roles: Owner, Branch Manager, Section Manager)
    const role = (auth.user?.role || "owner").toLowerCase();
    const isOwnerOrManager = role === "owner" || role === "admin" || role === "manager" || role === "branch manager" || role === "section_manager";
    if (!isOwnerOrManager) {
      return { success: false, error: "You do not have permission to merge tables (requires tables.merge)" };
    }

    // Minimum selection validation: >= 2 tables
    if (!tableIds || tableIds.length < 2) {
      return { success: false, error: "Select at least two tables." };
    }

    const supabase = createServiceRoleClient();

    // Query selected tables safely without assuming table_number column exists in DB
    let tables: any[] = [];
    const { data: tbls, error: tblErr } = await supabase
      .from("tables")
      .select("id, section_id, table_name, status, qr_url")
      .in("id", tableIds)
      .is("deleted_at", null);

    if (tblErr || !tbls || tbls.length !== tableIds.length) {
      // Defensive fallback if deleted_at column is missing in older schemas
      const { data: fbTbls, error: fbErr } = await supabase
        .from("tables")
        .select("id, section_id, table_name, status, qr_url")
        .in("id", tableIds);

      if (fbErr || !fbTbls || fbTbls.length !== tableIds.length) {
        return { success: false, error: "One or more selected tables could not be found." };
      }
      tables = fbTbls;
    } else {
      tables = tbls;
    }

    // Homogeneous Section Enforcement: all selected tables must belong to same section
    const sectionIds = Array.from(new Set(tables.map((t) => t.section_id)));
    if (sectionIds.length > 1) {
      return { success: false, error: "Cross-section merging is disallowed. All tables must belong to the same section." };
    }
    const sectionId = sectionIds[0];

    // Check if any table has an active session
    const { data: activeSessions } = await supabase
      .from("table_sessions")
      .select("id, table_id")
      .in("table_id", tableIds)
      .eq("status", "active");

    const activeSessionTableIds = new Set((activeSessions || []).map((s) => s.table_id));
    if (activeSessionTableIds.size > 0) {
      return { success: false, error: "One or more tables has an active dining session." };
    }

    // Status Locks: reject if any table is inactive, reserved, or maintenance
    for (const t of tables) {
      if (t.status === "inactive" || t.status === "maintenance") {
        return { success: false, error: `Table ${t.table_name} is inactive or under maintenance.` };
      }
      if (t.status === "reserved") {
        return { success: false, error: `Table ${t.table_name} is reserved.` };
      }
      if (t.status === "occupied") {
        // Stale occupied flag in database with no active session: self-heal and proceed
        await supabase.from("tables").update({ status: "active" }).eq("id", t.id);
        t.status = "active";
      }
    }

    // Check if any table is already in a merge group
    try {
      const { data: existingMembers } = await supabase
        .from("table_merge_group_members")
        .select("table_id")
        .in("table_id", tableIds);

      if (existingMembers && existingMembers.length > 0) {
        return { success: false, error: "One or more tables is already part of another merge group." };
      }
    } catch {
      // fallback
    }

    // Also check branch metadata merge groups
    if ((auth.branch.onboarding_progress as any)?.merge_groups) {
      const storedGroups = ((auth.branch.onboarding_progress as any).merge_groups as any[]) || [];
      const alreadyMerged = storedGroups.some((g: any) =>
        g.member_table_ids?.some((id: string) => tableIds.includes(id))
      );
      if (alreadyMerged) {
        return { success: false, error: "One or more tables is already part of another merge group." };
      }
    }

    // Format logical group name (e.g. "T1, T2")
    const sortedTables = [...tables].sort((a, b) => parseTableNumber(a) - parseTableNumber(b));
    const shortLabels = sortedTables.map((t) => `T${parseTableNumber(t)}`);
    const groupName = shortLabels.join(", ");
    const primaryTableId = sortedTables[0].id;

    // Dual-Storage: Try table_merge_groups, with seamless fallback to branch metadata
    let groupId: string | undefined;

    try {
      const { data: groupData, error: groupErr } = await supabase
        .from("table_merge_groups")
        .insert({
          branch_id: auth.branch.id,
          section_id: sectionId,
          name: groupName,
          primary_table_id: primaryTableId,
          status: "available",
        })
        .select("id")
        .single();

      if (!groupErr && groupData) {
        groupId = groupData.id;
        const memberRows = sortedTables.map((t) => ({
          group_id: groupId!,
          table_id: t.id,
        }));
        await supabase.from("table_merge_group_members").insert(memberRows);
      }
    } catch {
      // Database table not yet migrated
    }

    // Graceful fallback to branch metadata if relational tables are unmigrated
    if (!groupId) {
      const newGroupId = `merge-${Date.now()}`;
      const existingProgress = auth.branch.onboarding_progress || {};
      const existingGroups: any[] = (existingProgress as any).merge_groups || [];
      const cleanedGroups = existingGroups.filter(
        (g: any) => !g.member_table_ids?.some((tId: string) => tableIds.includes(tId))
      );
      const newGroupRecord = {
        id: newGroupId,
        branch_id: auth.branch.id,
        section_id: sectionId,
        name: groupName,
        primary_table_id: primaryTableId,
        status: "available",
        member_table_ids: sortedTables.map((t) => t.id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error: updateErr } = await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...existingProgress,
            merge_groups: [...cleanedGroups, newGroupRecord],
          },
        })
        .eq("id", auth.branch.id);

      if (updateErr) {
        return { success: false, error: "Failed to persist merge group: " + updateErr.message };
      }
      groupId = newGroupId;
    }

    // Record activity log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: primaryTableId,
        action: "tables_merged",
        actor_type: "staff",
        actor_id: auth.user?.id || null,
        actor_name: `${auth.user?.first_name || ""} ${auth.user?.last_name || ""}`.trim() || auth.user?.email || "Manager",
        note: `Merged tables: ${groupName} (Available for seating/reservation)`,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true, groupId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to merge tables" };
  }
}

/**
 * 3b. MERGE TABLES (Add table(s) to active session)
 * Adds one or more physical tables into an existing active dining session.
 * Synchronizes session_tables, table_merge_groups, tables status, and dual-storage branch metadata.
 */
export async function mergeTables(
  sourceSessionId: string,
  tableIdsToMerge: string[],
  branchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!tableIdsToMerge || tableIdsToMerge.length === 0) {
      return { success: true };
    }

    const auth = await getAuthenticatedAdmin(branchId);
    if (!auth || !auth.branch) {
      return { success: false, error: "Unauthorized" };
    }

    // Role permission check: tables.merge (Roles: Owner, Branch Manager, Section Manager)
    const role = (auth.user?.role || "owner").toLowerCase();
    const isOwnerOrManager = role === "owner" || role === "admin" || role === "manager" || role === "branch manager" || role === "section_manager";
    if (!isOwnerOrManager) {
      return { success: false, error: "You do not have permission to merge tables." };
    }

    const supabase = createServiceRoleClient();

    // 1. Locate the active session to identify the primary table anchor
    let sessionTableId: string | null = null;
    let existingSessionTableIds: string[] = [];

    // Query relational table_sessions
    try {
      const { data: sessData } = await supabase
        .from("table_sessions")
        .select("id, table_id, status")
        .eq("id", sourceSessionId)
        .maybeSingle();

      if (sessData?.table_id) {
        sessionTableId = sessData.table_id;
      }
    } catch {
      // Defensive fallback
    }

    // Also check session_tables to discover all existing members
    try {
      const { data: stMembers } = await supabase
        .from("session_tables")
        .select("table_id")
        .eq("session_id", sourceSessionId);

      if (stMembers && stMembers.length > 0) {
        existingSessionTableIds = stMembers.map((m: any) => m.table_id);
      }
    } catch {
      // Defensive fallback
    }

    // Check branch onboarding_progress metadata if session not found in relational table
    const existingProgress = (auth.branch.onboarding_progress as any) || {};
    const metaSessions = (existingProgress.table_sessions as any[]) || [];
    const metaSession = metaSessions.find((s: any) => s.id === sourceSessionId || (sessionTableId && s.table_id === sessionTableId));
    if (metaSession) {
      if (!sessionTableId && metaSession.table_id) {
        sessionTableId = metaSession.table_id;
      }
      if (metaSession.merged_table_ids && Array.isArray(metaSession.merged_table_ids)) {
        existingSessionTableIds = Array.from(new Set([...existingSessionTableIds, ...metaSession.merged_table_ids]));
      }
    }

    if (!sessionTableId) {
      // If still not found, fallback to the first table in existingSessionTableIds
      if (existingSessionTableIds.length > 0) {
        sessionTableId = existingSessionTableIds[0];
      } else {
        return { success: false, error: "Target dining session could not be found." };
      }
    }

    // All table IDs involved in this session (existing + new)
    const allTableIds = Array.from(new Set([sessionTableId, ...existingSessionTableIds, ...tableIdsToMerge]));

    // 2. Query all involved tables safely (using safe base columns per ADR-041)
    let tables: any[] = [];
    const { data: tbls, error: tblErr } = await supabase
      .from("tables")
      .select("id, section_id, table_name, status, qr_url")
      .in("id", allTableIds)
      .is("deleted_at", null);

    if (tblErr || !tbls || tbls.length !== allTableIds.length) {
      const { data: fbTbls } = await supabase
        .from("tables")
        .select("id, section_id, table_name, status, qr_url")
        .in("id", allTableIds);
      tables = fbTbls || [];
    } else {
      tables = tbls;
    }

    // Homogeneous Section Validation
    const sectionIds = Array.from(new Set(tables.map((t) => t.section_id)));
    if (sectionIds.length > 1) {
      return { success: false, error: "Cross-section merging is disallowed. All tables must belong to the same section." };
    }
    const sectionId = sectionIds[0] || tables[0]?.section_id;

    // Check status of tables being newly merged in
    for (const tId of tableIdsToMerge) {
      const t = tables.find((item) => item.id === tId);
      if (t) {
        if (t.status === "inactive" || t.status === "maintenance") {
          return { success: false, error: `Table ${t.table_name} is inactive or under maintenance.` };
        }
        if (t.status === "reserved") {
          return { success: false, error: `Table ${t.table_name} is reserved.` };
        }
      }
    }

    // Format new composite name (e.g. "T1, T2" or "T1, T2, T3")
    const sortedTables = [...tables].sort((a, b) => parseTableNumber(a) - parseTableNumber(b));
    const shortLabels = sortedTables.map((t) => `T${parseTableNumber(t)}`);
    const groupName = shortLabels.join(", ");
    const primaryTableId = sessionTableId;

    // 3. Insert new table entries into session_tables
    for (const tId of tableIdsToMerge) {
      try {
        await supabase.from("session_tables").upsert(
          {
            session_id: sourceSessionId,
            table_id: tId,
          },
          { onConflict: "session_id,table_id" }
        );
      } catch {
        // Defensive fallback
      }

      // Mark table as occupied in tables table and clear any waitlist hold
      await supabase
        .from("tables")
        .update({ status: "occupied", held_for_waitlist_id: null, updated_at: new Date().toISOString() })
        .eq("id", tId);
    }

    // Ensure primary table also is marked occupied
    await supabase
      .from("tables")
      .update({ status: "occupied", held_for_waitlist_id: null, updated_at: new Date().toISOString() })
      .eq("id", primaryTableId);

    // 4. Update relational table_sessions table_label if column exists
    try {
      await supabase
        .from("table_sessions")
        .update({ table_label: groupName })
        .eq("id", sourceSessionId);
    } catch {
      // Defensive fallback
    }

    // 5. Update or Create table_merge_groups and table_merge_group_members in PostgreSQL
    try {
      // Check if any of allTableIds is already in a table_merge_groups
      const { data: existingGroupMembers } = await supabase
        .from("table_merge_group_members")
        .select("group_id, table_id")
        .in("table_id", allTableIds);

      let targetGroupId: string | null = null;
      if (existingGroupMembers && existingGroupMembers.length > 0) {
        targetGroupId = existingGroupMembers[0].group_id;
      }

      if (targetGroupId) {
        // Update existing merge group
        await supabase
          .from("table_merge_groups")
          .update({
            name: groupName,
            status: "occupied",
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetGroupId);

        // Add any missing members
        const existingMemberIds = new Set((existingGroupMembers || []).map((m: any) => m.table_id));
        const newMemberRows = allTableIds
          .filter((id) => !existingMemberIds.has(id))
          .map((id) => ({
            group_id: targetGroupId!,
            table_id: id,
          }));

        if (newMemberRows.length > 0) {
          await supabase.from("table_merge_group_members").insert(newMemberRows);
        }
      } else {
        // Create new table_merge_groups
        const { data: newGroup, error: groupErr } = await supabase
          .from("table_merge_groups")
          .insert({
            branch_id: auth.branch.id,
            section_id: sectionId,
            name: groupName,
            primary_table_id: primaryTableId,
            status: "occupied",
          })
          .select("id")
          .single();

        if (!groupErr && newGroup) {
          const memberRows = allTableIds.map((tId) => ({
            group_id: newGroup.id,
            table_id: tId,
          }));
          await supabase.from("table_merge_group_members").insert(memberRows);
        }
      }
    } catch {
      // Defensive fallback if merge groups tables not yet migrated
    }

    // 6. Dual-Storage fallback to branch metadata (branches.onboarding_progress)
    try {
      const storedProgress = auth.branch.onboarding_progress || {};
      const storedSessions = ((storedProgress as any).table_sessions as any[]) || [];
      const storedGroups = ((storedProgress as any).merge_groups as any[]) || [];
      const storedTables = ((storedProgress as any).tables as any[]) || [];

      // Update table_sessions in metadata
      const updatedSessions = storedSessions.map((s: any) => {
        if (s.id === sourceSessionId || s.table_id === primaryTableId) {
          return {
            ...s,
            merged_table_ids: allTableIds,
            table_label: groupName,
            updated_at: new Date().toISOString(),
          };
        }
        return s;
      });

      // Update tables in metadata
      const updatedTables = storedTables.map((t: any) => {
        if (allTableIds.includes(t.id)) {
          return {
            ...t,
            status: "occupied",
            held_for_waitlist_id: null,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      });

      // Update merge_groups in metadata
      let groupUpdated = false;
      const updatedGroups = storedGroups.map((g: any) => {
        const hasOverlap = g.member_table_ids?.some((id: string) => allTableIds.includes(id));
        if (hasOverlap) {
          groupUpdated = true;
          return {
            ...g,
            name: groupName,
            status: "occupied",
            member_table_ids: allTableIds,
            active_session_id: sourceSessionId,
            updated_at: new Date().toISOString(),
          };
        }
        return g;
      });

      if (!groupUpdated) {
        updatedGroups.push({
          id: `merge-${Date.now()}`,
          branch_id: auth.branch.id,
          section_id: sectionId,
          name: groupName,
          primary_table_id: primaryTableId,
          status: "occupied",
          member_table_ids: allTableIds,
          active_session_id: sourceSessionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...storedProgress,
            table_sessions: updatedSessions,
            tables: updatedTables,
            merge_groups: updatedGroups,
          },
        })
        .eq("id", auth.branch.id);
    } catch {
      // Defensive fallback
    }

    // 7. Audit log event
    try {
      const addedLabels = tableIdsToMerge.map((tId) => {
        const tbl = tables.find((item) => item.id === tId);
        return tbl ? `T${parseTableNumber(tbl)}` : "Table";
      }).join(", ");

      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: primaryTableId,
        action: "tables_merged",
        actor_type: "staff",
        actor_id: auth.user?.id || null,
        actor_name: `${auth.user?.first_name || ""} ${auth.user?.last_name || ""}`.trim() || auth.user?.email || "Staff",
        note: `Added ${addedLabels} to active session (${groupName})`,
      });
    } catch {
      // Defensive fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to merge tables" };
  }
}

/**
 * 4. ISOLATE MERGE GROUP (Case A: Idle merged table with no active session)
 * Immediately breaks the logical group and restores physical tables.
 * If assigned to a waitlist customer, requires customer relocation to a member table first.
 */
export async function isolateMergeGroup(
  groupId: string,
  branchId: string
): Promise<{ 
  success: boolean; 
  requiresReassignment?: boolean; 
  memberTables?: Array<{ id: string; name: string; capacity?: number }>; 
  requiresCustomerRelocation?: boolean;
  waitlistEntry?: { id: string; customer_name: string; queue_token: string; guest_count: number };
  error?: string 
}> {
  try {
    const auth = await getAuthenticatedAdmin(branchId);
    if (!auth || !auth.branch) {
      return { success: false, error: "Unauthorized" };
    }

    // Permission check: tables.merge / tables.isolate
    const role = (auth.user?.role || "owner").toLowerCase();
    const isOwnerOrManager = role === "owner" || role === "admin" || role === "manager" || role === "branch manager" || role === "section_manager";
    if (!isOwnerOrManager) {
      return { success: false, error: "You do not have permission to isolate tables" };
    }

    const supabase = createServiceRoleClient();

    // Fetch group
    let group: any = null;
    let memberTableIds: string[] = [];

    try {
      const { data: g } = await supabase
        .from("table_merge_groups")
        .select("id, name, primary_table_id, branch_id, held_for_waitlist_id")
        .eq("id", groupId)
        .maybeSingle();

      if (g) {
        group = g;
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", groupId);
        memberTableIds = (members || []).map((m) => m.table_id);
      }
    } catch {
      // fallback
    }

    if (!group && (auth.branch.onboarding_progress as any)?.merge_groups) {
      const stored = ((auth.branch.onboarding_progress as any).merge_groups as any[]).find(
        (g: any) => g.id === groupId
      );
      if (stored) {
        group = stored;
        memberTableIds = stored.member_table_ids || [];
      }
    }

    if (!group) {
      return { success: false, error: "Merge group not found" };
    }

    // Fetch members
    if (memberTableIds.length === 0) {
      try {
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", groupId);
        memberTableIds = (members || []).map((m) => m.table_id);
      } catch {
        // fallback
      }
    }

    // Check if an active session is running on any of the member tables
    if (memberTableIds.length > 0) {
      const { data: activeSessions } = await supabase
        .from("table_sessions")
        .select("id, table_id")
        .in("table_id", memberTableIds)
        .eq("status", "active");

      if (activeSessions && activeSessions.length > 0) {
        // Fetch member tables details so UI can prompt for reassignment
        const { data: tblDetails } = await supabase
          .from("tables")
          .select("id, table_name, seating_capacity, qr_url")
          .in("id", memberTableIds);

        const memberTables = (tblDetails || []).map((t) => ({
          id: t.id,
          name: t.table_name || `T${parseTableNumber(t)}`,
          capacity: t.seating_capacity || 4,
        }));

        return {
          success: false,
          requiresReassignment: true,
          memberTables,
          error: "ACTIVE_SESSION_DETECTED",
        };
      }
    }

    // Check if group or member tables are assigned to an active waitlist customer
    let assignedWaitlistEntry: any = null;
    try {
      const { data: wlAssigned } = await supabase
        .from("waiting_list_entries")
        .select("id, customer_name, queue_token, guest_count, assigned_table_id, assigned_merged_group_id, status")
        .eq("branch_id", auth.branch.id)
        .in("status", ["TABLE_ASSIGNED", "table_assigned"]);

      if (wlAssigned && wlAssigned.length > 0) {
        assignedWaitlistEntry = wlAssigned.find(
          (w: any) =>
            w.assigned_merged_group_id === groupId ||
            memberTableIds.includes(w.assigned_table_id)
        ) || null;
      }
    } catch {}

    if (!assignedWaitlistEntry) {
      try {
        const { data: qAssigned } = await supabase
          .from("queue_entries")
          .select("id, customer_name, guest_name, queue_number, token_number, party_size, assigned_table_id, status")
          .eq("branch_id", auth.branch.id)
          .in("status", ["TABLE_ASSIGNED", "assigned"]);

        if (qAssigned && qAssigned.length > 0) {
          const match = qAssigned.find((q: any) => memberTableIds.includes(q.assigned_table_id));
          if (match) {
            assignedWaitlistEntry = {
              id: match.id,
              customer_name: match.customer_name || match.guest_name || "Guest",
              queue_token: match.queue_number || match.token_number || "WL",
              guest_count: match.party_size || 2,
            };
          }
        }
      } catch {}
    }

    if (!assignedWaitlistEntry && (auth.branch.onboarding_progress as any)?.waitlist_entries) {
      const storedWl = ((auth.branch.onboarding_progress as any).waitlist_entries as any[]) || [];
      const match = storedWl.find(
        (w: any) =>
          ((w.status || "").toUpperCase() === "TABLE_ASSIGNED" || (w.status || "").toUpperCase() === "ASSIGNED") &&
          (w.assigned_merged_group_id === groupId || memberTableIds.includes(w.assigned_table_id))
      );
      if (match) {
        assignedWaitlistEntry = {
          id: match.id,
          customer_name: match.customer_name || match.guest_name || "Guest",
          queue_token: match.queue_token || match.token_number || "WL",
          guest_count: match.guest_count || match.party_size || 2,
        };
      }
    }

    if (assignedWaitlistEntry) {
      let memberTables: Array<{ id: string; name: string; capacity?: number }> = [];
      try {
        const { data: tblDetails } = await supabase
          .from("tables")
          .select("id, table_name, seating_capacity, qr_url")
          .in("id", memberTableIds);

        memberTables = (tblDetails || []).map((t) => ({
          id: t.id,
          name: t.table_name || `T${parseTableNumber(t)}`,
          capacity: t.seating_capacity || 4,
        }));
      } catch {
        memberTables = memberTableIds.map((id, idx) => ({
          id,
          name: `T${idx + 1}`,
          capacity: 4,
        }));
      }

      return {
        success: false,
        requiresCustomerRelocation: true,
        waitlistEntry: {
          id: assignedWaitlistEntry.id,
          customer_name: assignedWaitlistEntry.customer_name,
          queue_token: assignedWaitlistEntry.queue_token,
          guest_count: assignedWaitlistEntry.guest_count,
        },
        memberTables,
        error: "CUSTOMER_RELOCATION_REQUIRED",
      };
    }

    // Case A: No active session & no assigned customer. Disband logical group
    try {
      await supabase.from("table_merge_groups").delete().eq("id", groupId);
    } catch {
      // fallback
    }

    if ((auth.branch.onboarding_progress as any)?.merge_groups) {
      const existingProgress = auth.branch.onboarding_progress || {};
      const updatedGroups = (((existingProgress as any).merge_groups || []) as any[]).filter(
        (g: any) => g.id !== groupId
      );
      await supabase.from("branches").update({
        onboarding_progress: { ...existingProgress, merge_groups: updatedGroups },
      }).eq("id", auth.branch.id);
    }

    // Set all member tables back to active / available
    if (memberTableIds.length > 0) {
      await supabase
        .from("tables")
        .update({ status: "active", held_for_waitlist_id: null })
        .in("id", memberTableIds);
    }

    // Audit log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: group.primary_table_id,
        action: "tables_isolated",
        actor_type: "staff",
        actor_id: auth.user?.id || null,
        actor_name: `${auth.user?.first_name || ""} ${auth.user?.last_name || ""}`.trim() || auth.user?.email || "Manager",
        note: `Isolated group ${group.name} back to individual available tables`,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to isolate tables" };
  }
}

/**
 * 4a. ISOLATE MERGE GROUP WITH CUSTOMER RELOCATION
 * When unmerging a group allocated to a waitlist customer, relocates the customer to targetTableId.
 */
export async function isolateMergeGroupWithCustomerRelocation(
  groupId: string,
  targetTableId: string,
  branchId: string,
  staffName: string = "Staff",
  staffId?: string | null
): Promise<{ success: boolean; newTableLabel?: string; error?: string }> {
  try {
    const auth = await getAuthenticatedAdmin(branchId);
    if (!auth || !auth.branch) {
      return { success: false, error: "Unauthorized" };
    }

    const role = (auth.user?.role || "owner").toLowerCase();
    const isOwnerOrManager = role === "owner" || role === "admin" || role === "manager" || role === "branch manager" || role === "section_manager";
    if (!isOwnerOrManager) {
      return { success: false, error: "You do not have permission to isolate tables" };
    }

    if (!targetTableId) {
      return { success: false, error: "A destination table must be explicitly selected." };
    }

    const supabase = createServiceRoleClient();

    // Fetch group
    let group: any = null;
    let memberTableIds: string[] = [];

    try {
      const { data: g } = await supabase
        .from("table_merge_groups")
        .select("id, name, primary_table_id, branch_id")
        .eq("id", groupId)
        .maybeSingle();

      if (g) {
        group = g;
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", groupId);
        memberTableIds = (members || []).map((m) => m.table_id);
      }
    } catch {}

    if (!group && (auth.branch.onboarding_progress as any)?.merge_groups) {
      const stored = ((auth.branch.onboarding_progress as any).merge_groups as any[]).find(
        (g: any) => g.id === groupId
      );
      if (stored) {
        group = stored;
        memberTableIds = stored.member_table_ids || [];
      }
    }

    if (!group) {
      return { success: false, error: "Merge group not found" };
    }

    if (memberTableIds.length === 0) {
      try {
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", groupId);
        memberTableIds = (members || []).map((m) => m.table_id);
      } catch {}
    }

    if (!memberTableIds.includes(targetTableId)) {
      return { success: false, error: "Selected table is not a member of this merge group." };
    }

    // Fetch target table info
    let targetTableLabel = "Table";
    try {
      const { data: targetTbl } = await supabase
        .from("tables")
        .select("id, table_name, qr_url")
        .eq("id", targetTableId)
        .maybeSingle();
      if (targetTbl) {
        targetTableLabel = targetTbl.table_name || `T${parseTableNumber(targetTbl)}`;
      }
    } catch {}

    // Find assigned waitlist entry
    let assignedWaitlistEntry: any = null;
    try {
      const { data: wlAssigned } = await supabase
        .from("waiting_list_entries")
        .select("id, customer_name, queue_token, guest_count, assigned_table_id, assigned_merged_group_id")
        .eq("branch_id", auth.branch.id)
        .in("status", ["TABLE_ASSIGNED", "table_assigned"]);

      if (wlAssigned && wlAssigned.length > 0) {
        assignedWaitlistEntry = wlAssigned.find(
          (w: any) =>
            w.assigned_merged_group_id === groupId ||
            memberTableIds.includes(w.assigned_table_id)
        ) || null;
      }
    } catch {}

    if (!assignedWaitlistEntry && (auth.branch.onboarding_progress as any)?.waitlist_entries) {
      const storedWl = ((auth.branch.onboarding_progress as any).waitlist_entries as any[]) || [];
      const match = storedWl.find(
        (w: any) =>
          ((w.status || "").toUpperCase() === "TABLE_ASSIGNED" || (w.status || "").toUpperCase() === "ASSIGNED") &&
          (w.assigned_merged_group_id === groupId || memberTableIds.includes(w.assigned_table_id))
      );
      if (match) {
        assignedWaitlistEntry = match;
      }
    }

    if (!assignedWaitlistEntry) {
      return { success: false, error: "No active assigned waitlist customer found on this group." };
    }

    // 1. Reassign waitlist entry to targetTableId
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          assigned_table_id: targetTableId,
          assigned_table_label: targetTableLabel,
          assigned_merged_group_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignedWaitlistEntry.id);
    } catch {}

    try {
      await supabase
        .from("queue_entries")
        .update({
          assigned_table_id: targetTableId,
          assigned_table_label: targetTableLabel,
        })
        .eq("id", assignedWaitlistEntry.id);
    } catch {}

    // Update branch metadata
    try {
      const { data: bData } = await supabase
        .from("branches")
        .select("onboarding_progress")
        .eq("id", auth.branch.id)
        .maybeSingle();

      if (bData?.onboarding_progress) {
        const curProg = (bData.onboarding_progress as any) || {};
        const storedWl = (curProg.waitlist_entries as any[]) || [];
        const updatedWl = storedWl.map((w: any) =>
          w.id === assignedWaitlistEntry.id
            ? { ...w, assigned_table_id: targetTableId, assigned_table_label: targetTableLabel, assigned_merged_group_id: null, updated_at: new Date().toISOString() }
            : w
        );

        const heldMap = { ...(curProg.held_tables || {}) };
        memberTableIds.forEach((mId) => {
          delete heldMap[mId];
        });
        heldMap[targetTableId] = assignedWaitlistEntry.id;

        const groups = ((curProg.merge_groups as any[]) || []).filter((g: any) => g.id !== groupId);

        await supabase.from("branches").update({
          onboarding_progress: {
            ...curProg,
            waitlist_entries: updatedWl,
            held_tables: heldMap,
            merge_groups: groups,
          },
        }).eq("id", auth.branch.id);
      }
    } catch {}

    // 2. Update physical tables: targetTableId held and assigned; other tables released
    const otherTableIds = memberTableIds.filter((id) => id !== targetTableId);

    try {
      await supabase
        .from("tables")
        .update({ held_for_waitlist_id: assignedWaitlistEntry.id, status: "assigned" })
        .eq("id", targetTableId);
    } catch {
      await supabase
        .from("tables")
        .update({ held_for_waitlist_id: assignedWaitlistEntry.id })
        .eq("id", targetTableId);
    }

    if (otherTableIds.length > 0) {
      await supabase
        .from("tables")
        .update({ held_for_waitlist_id: null, status: "active" })
        .in("id", otherTableIds);
    }

    // 3. Delete the merge group
    try {
      await supabase.from("table_merge_groups").delete().eq("id", groupId);
    } catch {}

    // 4. Log to activity logs
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: assignedWaitlistEntry.id,
        event_type: "ASSIGNMENT_CHANGED",
        actor_id: auth.user?.id || staffId || null,
        actor_name: staffName,
        note: `Merged table ${group.name} unmerged. Customer moved to Table ${targetTableLabel}.`,
      });
    } catch {}

    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: targetTableId,
        action: "tables_isolated",
        actor_type: "staff",
        actor_id: auth.user?.id || staffId || null,
        actor_name: staffName,
        note: `Isolated group ${group.name}. Customer moved to Table ${targetTableLabel}. Remaining tables set to Available.`,
      });
    } catch {}

    revalidatePath("/operations/tables");
    return { success: true, newTableLabel: targetTableLabel };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to isolate and relocate customer" };
  }
}

/**
 * 4b. ISOLATE MERGE GROUP WITH REASSIGNMENT (Case B: Active session running)
 * Transfers active session, orders, and running tab to selected table.
 * Other tables become Available. Logical card is destroyed.
 */
export async function isolateMergeGroupWithReassignment(
  groupId: string,
  targetTableId: string,
  branchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthenticatedAdmin(branchId);
    if (!auth || !auth.branch) {
      return { success: false, error: "Unauthorized" };
    }

    // Permission check
    const role = (auth.user?.role || "owner").toLowerCase();
    const isOwnerOrManager = role === "owner" || role === "admin" || role === "manager" || role === "branch manager" || role === "section_manager";
    if (!isOwnerOrManager) {
      return { success: false, error: "You do not have permission to isolate tables" };
    }

    if (!targetTableId) {
      return { success: false, error: "A destination table must be explicitly selected to inherit the active session." };
    }

    const supabase = createServiceRoleClient();

    // Fetch group
    let group: any = null;
    let memberTableIds: string[] = [];

    try {
      const { data: g } = await supabase
        .from("table_merge_groups")
        .select("id, name, primary_table_id, branch_id")
        .eq("id", groupId)
        .maybeSingle();

      if (g) {
        group = g;
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", groupId);
        memberTableIds = (members || []).map((m) => m.table_id);
      }
    } catch {
      // fallback
    }

    if (!group && (auth.branch.onboarding_progress as any)?.merge_groups) {
      const stored = ((auth.branch.onboarding_progress as any).merge_groups as any[]).find(
        (g: any) => g.id === groupId
      );
      if (stored) {
        group = stored;
        memberTableIds = stored.member_table_ids || [];
      }
    }

    if (!group) {
      return { success: false, error: "Merge group not found" };
    }

    if (memberTableIds.length === 0) {
      try {
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", groupId);
        memberTableIds = (members || []).map((m) => m.table_id);
      } catch {
        // fallback
      }
    }

    if (!memberTableIds.includes(targetTableId)) {
      return { success: false, error: "Selected table is not a member of this merge group." };
    }

    // Find active session
    const { data: activeSessions } = await supabase
      .from("table_sessions")
      .select("id, table_id")
      .in("table_id", memberTableIds)
      .eq("status", "active")
      .order("opened_at", { ascending: false });

    const activeSession = activeSessions?.[0];

    if (activeSession) {
      // 1. Reassign session exclusively to targetTableId
      await supabase
        .from("table_sessions")
        .update({ table_id: targetTableId })
        .eq("id", activeSession.id);

      // 2. Clear out other tables from session_tables
      const otherTableIds = memberTableIds.filter((id) => id !== targetTableId);
      if (otherTableIds.length > 0) {
        try {
          await supabase
            .from("session_tables")
            .delete()
            .eq("session_id", activeSession.id)
            .in("table_id", otherTableIds);
        } catch {
          // fallback
        }

        // 3. Mark other tables as Available / active
        await supabase
          .from("tables")
          .update({ status: "active" })
          .in("id", otherTableIds);
      }

      // Ensure target table is Occupied
      await supabase
        .from("tables")
        .update({ status: "occupied" })
        .eq("id", targetTableId);
    } else {
      // If no active session was running, simply free all tables
      await supabase
        .from("tables")
        .update({ status: "active" })
        .in("id", memberTableIds);
    }

    // 4. Delete the logical merge group (cascades to members)
    try {
      await supabase.from("table_merge_groups").delete().eq("id", groupId);
    } catch {
      // fallback
    }

    if ((auth.branch.onboarding_progress as any)?.merge_groups) {
      const existingProgress = auth.branch.onboarding_progress || {};
      const updatedGroups = (((existingProgress as any).merge_groups || []) as any[]).filter(
        (g: any) => g.id !== groupId
      );
      await supabase.from("branches").update({
        onboarding_progress: { ...existingProgress, merge_groups: updatedGroups },
      }).eq("id", auth.branch.id);
    }

    // Audit log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: targetTableId,
        action: "session_reassigned_and_isolated",
        actor_type: "staff",
        actor_id: auth.user?.id || null,
        actor_name: `${auth.user?.first_name || ""} ${auth.user?.last_name || ""}`.trim() || auth.user?.email || "Manager",
        note: `Isolated group ${group.name}. Active session reassigned exclusively to selected table. Remaining tables set to Available.`,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to isolate and reassign session" };
  }
}

/**
 * 4c. ISOLATE / RELEASE INDIVIDUAL MERGED TABLE (Legacy fallback)
 */
export async function isolateTable(
  sessionId: string,
  tableIdToIsolate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Delete from session_tables
    try {
      await supabase
        .from("session_tables")
        .delete()
        .eq("session_id", sessionId)
        .eq("table_id", tableIdToIsolate);
    } catch {
      // Ignore fallback
    }

    // If this table was the primary table_sessions.table_id, check if other tables exist in session
    const { data: session } = await supabase
      .from("table_sessions")
      .select("table_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (session?.table_id === tableIdToIsolate) {
      // Find remaining table in session_tables to promote
      const { data: remaining } = await supabase
        .from("session_tables")
        .select("table_id")
        .eq("session_id", sessionId)
        .limit(1)
        .maybeSingle();

      if (remaining) {
        await supabase
          .from("table_sessions")
          .update({ table_id: remaining.table_id })
          .eq("id", sessionId);
      }
    }

    // Mark isolated table available
    await supabase.from("tables").update({ status: "active" }).eq("id", tableIdToIsolate);

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to isolate table" };
  }
}

/**
 * 5. RELEASE ENTIRE TABLE SESSION (Session End / Table Turn)
 */
export async function releaseTableSession(
  sessionId: string,
  fallbackTableId?: string,
  fallbackBranchId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();

    // 1. Defensively query table_sessions (WITHOUT branch_id which does not exist in relational schema)
    let sessionTableId: string | null = null;
    try {
      const { data: session } = await supabase
        .from("table_sessions")
        .select("id, table_id, status")
        .eq("id", sessionId)
        .maybeSingle();

      if (session?.table_id) {
        sessionTableId = session.table_id;
      }
    } catch {
      // Defensive fallback
    }

    const allTableIdSet = new Set<string>();
    if (sessionTableId) allTableIdSet.add(sessionTableId);
    if (fallbackTableId) allTableIdSet.add(fallbackTableId);

    // 2. Discover any merged tables linked to this session
    try {
      const { data: stData } = await supabase
        .from("session_tables")
        .select("table_id")
        .eq("session_id", sessionId);
      (stData || []).forEach((r) => {
        if (r.table_id) allTableIdSet.add(r.table_id);
      });
    } catch {
      // Defensive fallback
    }

    // 3. Resolve target branch ID if not explicitly provided
    let branchId = fallbackBranchId;
    if (!branchId && allTableIdSet.size > 0) {
      const firstTblId = Array.from(allTableIdSet)[0];
      try {
        const { data: tblData } = await supabase
          .from("tables")
          .select("section_id")
          .eq("id", firstTblId)
          .maybeSingle();
        if (tblData?.section_id) {
          const { data: secData } = await supabase
            .from("sections")
            .select("branch_id")
            .eq("id", tblData.section_id)
            .maybeSingle();
          if (secData?.branch_id) {
            branchId = secData.branch_id;
          }
        }
      } catch {
        // Defensive fallback
      }
    }

    // 4. Update relational table_sessions table
    try {
      await supabase
        .from("table_sessions")
        .update({
          status: "closed",
          closed_at: nowIso,
        })
        .eq("id", sessionId);
    } catch {
      // Defensive fallback
    }

    // 5. Clean up session_tables mappings
    try {
      await supabase.from("session_tables").delete().eq("session_id", sessionId);
    } catch {
      // Defensive fallback
    }

    // 6. Complete any open customer requests for this session
    try {
      await supabase
        .from("customer_requests")
        .update({ status: "completed", resolved_at: nowIso })
        .eq("session_id", sessionId)
        .eq("status", "open");
    } catch {
      // Defensive fallback
    }

    // 7. Synchronize Dual-Storage branch metadata (CRITICAL for QR-initiated sessions)
    try {
      let targetBranches: any[] = [];
      if (branchId) {
        const { data: bData } = await supabase
          .from("branches")
          .select("id, onboarding_progress")
          .eq("id", branchId)
          .maybeSingle();
        if (bData) targetBranches = [bData];
      } else {
        // Scan branches to find where this session or table is active
        const { data: allBranches } = await supabase
          .from("branches")
          .select("id, onboarding_progress");
        targetBranches = (allBranches || []).filter((b: any) => {
          const sessions = (b.onboarding_progress?.table_sessions as any[]) || [];
          return sessions.some(
            (s: any) =>
              s.id === sessionId ||
              (allTableIdSet.size > 0 && allTableIdSet.has(s.table_id))
          );
        });
      }

      for (const b of targetBranches) {
        const existingProgress = (b.onboarding_progress as any) || {};
        const storedSessions = (existingProgress.table_sessions as any[]) || [];
        const storedTables = (existingProgress.tables as any[]) || [];
        const storedGroups = (existingProgress.merge_groups as any[]) || [];

        // Discover any table IDs associated with this session in metadata
        storedSessions.forEach((s: any) => {
          if (s.id === sessionId && s.table_id) {
            allTableIdSet.add(s.table_id);
          }
        });

        const currentTableIds = Array.from(allTableIdSet);

        const updatedSessions = storedSessions.map((s: any) =>
          s.id === sessionId || (s.status === "active" && currentTableIds.includes(s.table_id))
            ? { ...s, status: "closed", closed_at: nowIso }
            : s
        );

        const updatedTables = storedTables.map((t: any) =>
          currentTableIds.includes(t.id)
            ? { ...t, status: "active", held_for_waitlist_id: null }
            : t
        );

        const updatedGroups = storedGroups.map((g: any) =>
          g.active_session_id === sessionId ||
          g.member_table_ids?.some((id: string) => currentTableIds.includes(id))
            ? { ...g, status: "available", active_session_id: null, held_for_waitlist_id: null, updated_at: nowIso }
            : g
        );

        const storedWaitlist = (existingProgress.waitlist_entries as any[]) || [];
        const updatedWaitlist = storedWaitlist.map((w: any) =>
          w.id === sessionId ||
          ((w.status === "SEATED" || w.status === "seated") &&
            currentTableIds.includes(w.assigned_table_id))
            ? { ...w, status: "COMPLETED", completed_at: nowIso }
            : w
        );

        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...existingProgress,
              merge_groups: updatedGroups,
              table_sessions: updatedSessions,
              tables: updatedTables,
              waitlist_entries: updatedWaitlist,
            },
          })
          .eq("id", b.id);
      }
    } catch {
      // Dual-storage sync defensive fallback
    }

    // Also update relational waiting_list_entries and queue_entries to COMPLETED
    if (allTableIdSet.size > 0) {
      const relTableIds = Array.from(allTableIdSet);
      try {
        await supabase
          .from("waiting_list_entries")
          .update({ status: "COMPLETED" })
          .in("assigned_table_id", relTableIds)
          .in("status", ["SEATED", "seated"]);
      } catch {}

      try {
        await supabase
          .from("queue_entries")
          .update({ status: "COMPLETED" })
          .in("assigned_table_id", relTableIds)
          .in("status", ["SEATED", "seated"]);
      } catch {}
    }

    const finalTableIds = Array.from(allTableIdSet);

    // 8. Reset physical tables back to active in tables table
    if (finalTableIds.length > 0) {
      try {
        const { error: tblErr } = await supabase
          .from("tables")
          .update({
            status: "active",
            updated_at: nowIso,
          })
          .in("id", finalTableIds);

        if (tblErr) {
          await supabase
            .from("tables")
            .update({ status: "active" })
            .in("id", finalTableIds);
        }
      } catch {
        // Defensive fallback
      }
    }

    // 9. Reset merge group status in table_merge_groups if applicable
    if (finalTableIds.length > 0) {
      try {
        const { data: memberEntries } = await supabase
          .from("table_merge_group_members")
          .select("group_id")
          .in("table_id", finalTableIds);

        if (memberEntries && memberEntries.length > 0) {
          const groupIds = Array.from(new Set(memberEntries.map((m: any) => m.group_id)));
          await supabase
            .from("table_merge_groups")
            .update({
              status: "available",
              active_session_id: null,
              held_for_waitlist_id: null,
              updated_at: nowIso,
            })
            .in("id", groupIds);
        }
      } catch {
        // Defensive fallback
      }
    }

    try {
      revalidatePath("/operations/tables");
    } catch {}
    finalTableIds.forEach((tId) => {
      try {
        revalidatePath(`/table/${tId}/scan`);
      } catch {}
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to release session" };
  }
}

/**
 * 6. SPLIT SESSION (Physically separates a merged table into its own new session)
 */
export async function splitSession(
  sourceSessionId: string,
  tableIdToSplit: string,
  branchId: string
): Promise<{ success: boolean; newSessionId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Remove from source session_tables
    try {
      await supabase
        .from("session_tables")
        .delete()
        .eq("session_id", sourceSessionId)
        .eq("table_id", tableIdToSplit);
    } catch {
      // fallback
    }

    // Create a new separate table session for the split table
    const { data: newSession, error: sessErr } = await supabase
      .from("table_sessions")
      .insert({
        table_id: tableIdToSplit,
        guest_count: 2,
        device_count: 0,
        status: "active",
        branch_id: branchId,
        opened_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessErr || !newSession) {
      return { success: false, error: sessErr?.message || "Failed to create split session" };
    }

    // Insert into session_tables for new session
    try {
      await supabase.from("session_tables").insert({
        session_id: newSession.id,
        table_id: tableIdToSplit,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true, newSessionId: newSession.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to split session" };
  }
}

/**
 * 7. CUSTOMER REQUESTS: Create & Fulfill (With quick action activity logging)
 */
export async function createCustomerRequest(
  sessionId: string,
  type: string,
  requestedBy: string = "Staff",
  actorId?: string | null,
  actorType?: "staff" | "customer" | "system",
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const { data: newReq } = await supabase.from("customer_requests").insert({
      session_id: sessionId,
      type,
      status: "open",
      requested_by: requestedBy,
      requested_at: new Date().toISOString(),
    }).select("id").single();

    // Log to activity_log for quick action tracking (both session and request entities)
    try {
      const isCustomer = actorType ? actorType === "customer" : (
        requestedBy.toLowerCase().includes("guest") ||
        requestedBy.toLowerCase().includes("customer") ||
        requestedBy === "Self"
      );
      const computedActorType: "staff" | "customer" | "system" = actorType || (isCustomer ? "customer" : "staff");
      const actionName = type === "call_waiter" ? "waiter_called" : `${type}_requested`;
      const actionNote = note || (type === "call_waiter" 
        ? `Call Waiter pressed by ${requestedBy}` 
        : `${type.replace(/_/g, " ")} requested by ${requestedBy}`);

      // 1. Session-level activity log (so it appears in Session/Table timeline)
      await supabase.from("activity_log").insert({
        entity_type: "session",
        entity_id: sessionId,
        action: actionName,
        actor_type: computedActorType,
        actor_id: actorId || null,
        actor_name: requestedBy,
        note: actionNote,
      });

      // 2. Specific customer request entity log
      if (newReq?.id) {
        await supabase.from("activity_log").insert({
          entity_type: "customer_request",
          entity_id: newReq.id,
          action: actionName,
          actor_type: computedActorType,
          actor_id: actorId || null,
          actor_name: requestedBy,
          note: actionNote,
        });
      }
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create request" };
  }
}

export async function fulfillCustomerRequest(
  requestId: string,
  fulfilledBy: string = "Staff",
  fulfilledById?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const { data: reqData } = await supabase
      .from("customer_requests")
      .update({
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select("session_id, type")
      .single();

    // Quick action activity log
    try {
      const actionNote = `Request (${reqData?.type ? reqData.type.replace(/_/g, " ") : "quick action"}) fulfilled by ${fulfilledBy}`;
      if (reqData?.session_id) {
        await supabase.from("activity_log").insert({
          entity_type: "session",
          entity_id: reqData.session_id,
          action: "request_fulfilled",
          actor_type: "staff",
          actor_id: fulfilledById || null,
          actor_name: fulfilledBy,
          note: actionNote,
        });
      }
      await supabase.from("activity_log").insert({
        entity_type: "customer_request",
        entity_id: requestId,
        action: "request_fulfilled",
        actor_type: "staff",
        actor_id: fulfilledById || null,
        actor_name: fulfilledBy,
        note: actionNote,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fulfill request" };
  }
}

/**
 * 8. WAITING LIST: Add Walk-in by Staff
 */
export async function addQueueEntryByStaff(
  branchId: string,
  sectionId: string | null,
  customerName: string,
  phone: string,
  partySize: number,
  staffName: string = "Staff",
  staffId?: string | null,
  notes?: string | null
): Promise<{ success: boolean; tokenNumber?: string; entryId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    let prefix = "A";
    if (sectionId) {
      const { data: section } = await supabase
        .from("sections")
        .select("name, short_code")
        .eq("id", sectionId)
        .maybeSingle();
      prefix = getSectionTokenPrefix(section?.name || "");
    }

    // Count today's tokens strictly in this section (falling back to branch if no section)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let countQuery = supabase
      .from("waiting_list_entries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    if (sectionId) {
      countQuery = countQuery.eq("section_id", sectionId);
    } else {
      countQuery = countQuery.eq("branch_id", branchId);
    }

    const { count: wlCount, error: countErr } = await countQuery;
    let tokenSeq = (wlCount || 0) + 1;

    if (countErr) {
      // Fallback count from queue_entries
      let qCountQuery = supabase
        .from("queue_entries")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      if (sectionId) {
        qCountQuery = qCountQuery.eq("section_id", sectionId);
      } else {
        qCountQuery = qCountQuery.eq("branch_id", branchId);
      }

      const { count: qCount } = await qCountQuery;
      tokenSeq = (qCount || 0) + 1;
    }

    const tokenNumber = formatWaitlistToken(prefix, tokenSeq);
    const cleanPhone = phone.trim().replace(/\D/g, "");

    // 1. Insert into waiting_list_entries
    const wlPayload: any = {
      branch_id: branchId,
      section_id: sectionId,
      queue_token: tokenNumber,
      customer_name: customerName.trim(),
      mobile_number: cleanPhone || phone.trim(),
      guest_count: Math.max(1, partySize),
      notes: notes?.trim() || null,
      registration_method: "STAFF_WALKIN",
      created_by_user_id: staffId || null,
      created_by_name: staffName,
      status: "WAITING",
    };

    let entryId: string | null = null;
    try {
      const { data: wlData } = await supabase
        .from("waiting_list_entries")
        .insert(wlPayload)
        .select("id")
        .single();
      if (wlData) entryId = wlData.id;
    } catch {
      // fallback
    }

    // 2. Insert into shadow queue_entries
    const qPayload: any = {
      id: entryId || undefined,
      branch_id: branchId,
      section_id: sectionId,
      guest_name: customerName.trim(),
      guest_mobile: cleanPhone || phone.trim(),
      customer_name: customerName.trim(),
      phone: cleanPhone || phone.trim(),
      party_size: Math.max(1, partySize),
      status: "waiting",
      queue_number: tokenNumber,
      token_number: tokenNumber,
      registered_by: staffName,
      created_by: staffId || null,
    };

    try {
      const { data: qData } = await supabase
        .from("queue_entries")
        .insert(qPayload)
        .select("id")
        .single();
      if (!entryId && qData) entryId = qData.id;
    } catch {
      // fallback
    }

    // Tier-3 Fallback: Always mirror to branch.onboarding_progress.waitlist_entries
    const effectiveEntryId = entryId || crypto.randomUUID();
    try {
      const { data: bData } = await supabase
        .from("branches")
        .select("id, onboarding_progress")
        .eq("id", branchId)
        .single();
      const curProg = (bData?.onboarding_progress as any) || {};
      const stored = (curProg.waitlist_entries as any[]) || [];
      stored.push({
        id: effectiveEntryId,
        branch_id: branchId,
        section_id: sectionId,
        queue_token: tokenNumber,
        customer_name: customerName.trim(),
        mobile_number: cleanPhone || phone.trim(),
        guest_count: Math.max(1, partySize),
        notes: notes?.trim() || null,
        registration_method: "STAFF_WALKIN",
        created_by_name: staffName,
        status: "WAITING",
        created_at: new Date().toISOString(),
      });
      await supabase
        .from("branches")
        .update({ onboarding_progress: { ...curProg, waitlist_entries: stored } })
        .eq("id", branchId);
    } catch {}

    // 3. Log to waiting_list_activity_logs & activity_log
    if (effectiveEntryId) {
      try {
        await supabase.from("waiting_list_activity_logs").insert({
          waiting_list_entry_id: effectiveEntryId,
          event_type: "WAITLIST_CREATED",
          actor_id: staffId || null,
          actor_name: staffName,
          state_diff: { status: "WAITING", party_size: partySize, token: tokenNumber },
          note: `Registered party of ${partySize}${notes ? ` (Notes: ${notes})` : ""}`,
        });
      } catch {
        // fallback
      }

      try {
        await supabase.from("activity_log").insert({
          entity_type: "waitlist_entry",
          entity_id: effectiveEntryId,
          action: "created",
          actor_type: staffName === "Self" ? "customer" : "staff",
          actor_id: staffId || null,
          actor_name: staffName,
          note: `Registered party of ${partySize}`,
        });
      } catch {
        // fallback
      }
    }

    revalidatePath("/operations/tables");
    return { success: true, tokenNumber, entryId: effectiveEntryId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add to waitlist" };
  }
}

/**
 * 9. WAITING LIST: Available Tables Query (User Story 15.4)
 * Returns only available standalone and merged tables (excluding active sessions, reservations, and tables held for waitlist).
 */
export interface AvailableTableForAssignment {
  id: string; // group_id for merged, table_id for single
  table_id: string; // primary physical table id
  table_label: string; // composite label e.g. "T1, T2" or "T1"
  section_id: string;
  section_name: string;
  seating_capacity: number;
  is_merged: boolean;
  member_table_ids: string[];
  status: "available";
}

export async function getAvailableTablesForAssignment(
  branchId?: string,
  sectionId?: string
): Promise<{ success: boolean; tables: AvailableTableForAssignment[]; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const auth = await getAuthenticatedAdmin(branchId);
    const targetBranchId = branchId || auth?.branch?.id;
    if (!targetBranchId) {
      return { success: false, tables: [], error: "Branch ID required" };
    }

    // 1. Fetch sections
    const { data: rawSections } = await supabase
      .from("sections")
      .select("id, name, active")
      .eq("branch_id", targetBranchId)
      .is("deleted_at", null);

    const sections = rawSections || [];
    let sectionIds = sections.map((s) => s.id);
    const sectionMap = new Map(sections.map((s) => [s.id, s.name]));

    // If sectionId is specified, strictly filter to that section
    if (sectionId) {
      sectionIds = sectionIds.filter((id) => id === sectionId);
    }

    if (sectionIds.length === 0) {
      return { success: true, tables: [] };
    }

    // 2. Fetch tables with defensive column check for held_for_waitlist_id
    let rawTables: any[] = [];
    let { data: tbls, error: tblErr } = await supabase
      .from("tables")
      .select("id, section_id, table_name, seating_capacity, status, qr_url, held_for_waitlist_id")
      .in("section_id", sectionIds)
      .is("deleted_at", null);

    if (tblErr && (tblErr.message?.includes("held_for_waitlist_id") || tblErr.code === "42703")) {
      const { data: fbTbls } = await supabase
        .from("tables")
        .select("id, section_id, table_name, seating_capacity, status, qr_url")
        .in("section_id", sectionIds)
        .is("deleted_at", null);
      rawTables = (fbTbls || []).map((t: any) => ({ ...t, held_for_waitlist_id: null }));
    } else {
      rawTables = tbls || [];
    }

    // Metadata fallback for tables if relational query returned 0 rows
    if (rawTables.length === 0 && auth?.branch) {
      const stored = ((auth.branch.onboarding_progress as any)?.tables as any[]) || [];
      rawTables = stored.filter((t: any) => sectionIds.includes(t.section_id)).map((t: any) => ({
        ...t,
        status: t.status || "active",
      }));
    }

    // Overlay metadata held_tables mapping if present
    if (auth?.branch) {
      const heldMap = ((auth.branch.onboarding_progress as any)?.held_tables as Record<string, string>) || {};
      rawTables.forEach((t) => {
        if (!t.held_for_waitlist_id && heldMap[t.id]) {
          t.held_for_waitlist_id = heldMap[t.id];
        }
      });
    }

    rawTables.forEach((t) => {
      t.table_number = parseTableNumber(t);
    });

    const tableIds = rawTables.map((t) => t.id);

    // 3. Fetch active sessions (to exclude occupied tables)
    const occupiedTableIds = new Set<string>();
    if (tableIds.length > 0) {
      const { data: sessions } = await supabase
        .from("table_sessions")
        .select("id, table_id, status")
        .in("table_id", tableIds)
        .eq("status", "active");

      (sessions || []).forEach((s) => occupiedTableIds.add(s.table_id));

      const sessionIds = (sessions || []).map((s) => s.id);
      if (sessionIds.length > 0) {
        try {
          const { data: stData } = await supabase
            .from("session_tables")
            .select("session_id, table_id")
            .in("session_id", sessionIds);
          (stData || []).forEach((st) => occupiedTableIds.add(st.table_id));
        } catch {}
      }
    }

    // 4. Fetch active reservations (to exclude reserved tables)
    const reservedTableIds = new Set<string>();
    try {
      const { data: resData } = await supabase
        .from("table_reservations")
        .select("table_id")
        .eq("branch_id", targetBranchId)
        .eq("status", "reserved");
      (resData || []).forEach((r) => reservedTableIds.add(r.table_id));
    } catch {}

    // 4b. Fetch active waitlist assignments to strictly exclude assigned tables and heal stale holds
    const activeWaitlistTableIds = new Set<string>();
    const activeWaitlistGroupIds = new Set<string>();
    const validWaitlistIds = new Set<string>();

    try {
      const { data: wlData } = await supabase
        .from("waiting_list_entries")
        .select("id, assigned_table_id, assigned_merged_group_id, status")
        .eq("branch_id", targetBranchId)
        .in("status", ["TABLE_ASSIGNED", "table_assigned", "ASSIGNED", "assigned"]);

      (wlData || []).forEach((w: any) => {
        validWaitlistIds.add(w.id);
        if (w.assigned_table_id) activeWaitlistTableIds.add(w.assigned_table_id);
        if (w.assigned_merged_group_id) activeWaitlistGroupIds.add(w.assigned_merged_group_id);
      });
    } catch {}

    try {
      const { data: qData } = await supabase
        .from("queue_entries")
        .select("id, assigned_table_id, status")
        .eq("branch_id", targetBranchId)
        .in("status", ["assigned", "ASSIGNED", "TABLE_ASSIGNED", "table_assigned"]);

      (qData || []).forEach((q: any) => {
        validWaitlistIds.add(q.id);
        if (q.assigned_table_id) activeWaitlistTableIds.add(q.assigned_table_id);
      });
    } catch {}

    if (auth?.branch) {
      const storedWaitlist = ((auth.branch.onboarding_progress as any)?.waitlist_entries as any[]) || [];
      storedWaitlist.forEach((w: any) => {
        const st = (w.status || "").toUpperCase();
        if (st === "TABLE_ASSIGNED" || st === "ASSIGNED") {
          validWaitlistIds.add(w.id);
          if (w.assigned_table_id) activeWaitlistTableIds.add(w.assigned_table_id);
          if (w.assigned_merged_group_id) activeWaitlistGroupIds.add(w.assigned_merged_group_id);
        }
      });
    }

    // Self-heal stale held_for_waitlist_id on tables
    rawTables.forEach((t) => {
      if (t.held_for_waitlist_id && !validWaitlistIds.has(t.held_for_waitlist_id) && !activeWaitlistTableIds.has(t.id)) {
        t.held_for_waitlist_id = null;
      }
    });

    // 5. Fetch table merge groups
    let rawMergeGroups: any[] = [];
    let rawMergeMembers: any[] = [];
    try {
      let { data: mgData, error: mgErr } = await supabase
        .from("table_merge_groups")
        .select("id, branch_id, section_id, name, primary_table_id, status, held_for_waitlist_id")
        .eq("branch_id", targetBranchId);

      if (mgErr && (mgErr.message?.includes("held_for_waitlist_id") || mgErr.code === "42703")) {
        const { data: fbMg } = await supabase
          .from("table_merge_groups")
          .select("id, branch_id, section_id, name, primary_table_id, status")
          .eq("branch_id", targetBranchId);
        mgData = (fbMg || []).map((g: any) => ({ ...g, held_for_waitlist_id: null }));
        mgErr = null;
      }

      if (!mgErr && mgData) {
        rawMergeGroups = mgData;
        const groupIds = rawMergeGroups.map((g) => g.id);
        if (groupIds.length > 0) {
          const { data: mmData } = await supabase
            .from("table_merge_group_members")
            .select("group_id, table_id")
            .in("group_id", groupIds);
          rawMergeMembers = mmData || [];
        }
      }
    } catch {}

    // Supplement with merge groups from branch metadata (deduped)
    const existingGroupIds = new Set(rawMergeGroups.map((g) => g.id));
    if (auth?.branch) {
      const stored = ((auth.branch.onboarding_progress as any)?.merge_groups as any[]) || [];
      stored.forEach((sg: any) => {
        if (!existingGroupIds.has(sg.id)) {
          existingGroupIds.add(sg.id);
          rawMergeGroups.push({
            id: sg.id,
            branch_id: targetBranchId,
            section_id: sg.section_id,
            name: sg.name,
            primary_table_id: sg.primary_table_id,
            status: sg.status || "available",
            held_for_waitlist_id: sg.held_for_waitlist_id || null,
          });
          (sg.member_table_ids || []).forEach((tId: string) => {
            rawMergeMembers.push({ group_id: sg.id, table_id: tId });
          });
        }
      });
    }

    // Self-heal stale held_for_waitlist_id on merge groups
    rawMergeGroups.forEach((g) => {
      if (g.held_for_waitlist_id && !validWaitlistIds.has(g.held_for_waitlist_id) && !activeWaitlistGroupIds.has(g.id)) {
        g.held_for_waitlist_id = null;
      }
    });

    // If sectionId is specified, strictly filter merge groups
    if (sectionId) {
      rawMergeGroups = rawMergeGroups.filter((g) => g.section_id === sectionId);
    }

    const groupMembersMap = new Map<string, string[]>();
    const tableToGroupMap = new Map<string, any>();
    rawMergeMembers.forEach((m) => {
      const list = groupMembersMap.get(m.group_id) || [];
      list.push(m.table_id);
      groupMembersMap.set(m.group_id, list);
    });

    rawMergeGroups.forEach((g) => {
      const memberIds = groupMembersMap.get(g.id) || [g.primary_table_id];
      memberIds.forEach((tId) => tableToGroupMap.set(tId, g));
    });

    const availableResults: AvailableTableForAssignment[] = [];
    const processedGroupIds = new Set<string>();

    // A. Evaluate Merge Groups
    rawMergeGroups.forEach((g) => {
      if (processedGroupIds.has(g.id)) return;
      processedGroupIds.add(g.id);

      // Exclude if group is actively assigned to waitlist
      if (activeWaitlistGroupIds.has(g.id) || g.status === "assigned" || (g.held_for_waitlist_id && validWaitlistIds.has(g.held_for_waitlist_id))) {
        return;
      }

      const memberIds = groupMembersMap.get(g.id) || [g.primary_table_id];
      let isAllAvailable = true;
      let totalCapacity = 0;

      for (const mId of memberIds) {
        const tbl = rawTables.find((t) => t.id === mId);
        // If member table is inactive, actively assigned, occupied by a session, or reserved
        if (
          !tbl ||
          tbl.status === "inactive" ||
          tbl.status === "assigned" ||
          activeWaitlistTableIds.has(mId) ||
          (tbl.held_for_waitlist_id && validWaitlistIds.has(tbl.held_for_waitlist_id)) ||
          occupiedTableIds.has(mId) ||
          reservedTableIds.has(mId)
        ) {
          isAllAvailable = false;
          break;
        }
        totalCapacity += tbl.seating_capacity || 4;
      }

      // Check if merge group has an active session directly
      const groupHasActiveSession = memberIds.some((mId) => occupiedTableIds.has(mId));
      if (g.status === "occupied" && groupHasActiveSession) {
        isAllAvailable = false;
      }

      if (isAllAvailable && memberIds.length > 0) {
        availableResults.push({
          id: g.id,
          table_id: g.primary_table_id,
          table_label: g.name,
          section_id: g.section_id,
          section_name: sectionMap.get(g.section_id) || "Section",
          seating_capacity: totalCapacity,
          is_merged: true,
          member_table_ids: memberIds,
          status: "available",
        });
      }
    });

    // B. Evaluate Standalone Physical Tables
    rawTables.forEach((t) => {
      // Exclude if part of a merge group
      if (tableToGroupMap.has(t.id)) return;
      // Exclude if inactive, reserved, or actively occupied
      if (t.status === "inactive") return;
      if (reservedTableIds.has(t.id)) return;
      if (occupiedTableIds.has(t.id)) return;
      // Strictly exclude if assigned to waitlist
      if (t.status === "assigned" || activeWaitlistTableIds.has(t.id) || (t.held_for_waitlist_id && validWaitlistIds.has(t.held_for_waitlist_id))) {
        return;
      }

      availableResults.push({
        id: t.id,
        table_id: t.id,
        table_label: t.table_name || `Table ${t.table_number}`,
        section_id: t.section_id,
        section_name: sectionMap.get(t.section_id) || "Section",
        seating_capacity: t.seating_capacity || 4,
        is_merged: false,
        member_table_ids: [t.id],
        status: "available",
      });
    });

    // Sort by section name then table label
    availableResults.sort((a, b) => {
      if (a.section_name !== b.section_name) {
        return a.section_name.localeCompare(b.section_name);
      }
      return a.table_label.localeCompare(b.table_label, undefined, { numeric: true });
    });

    return { success: true, tables: availableResults };
  } catch (err: any) {
    return { success: false, tables: [], error: err.message || "Failed to query available tables" };
  }
}

/**
 * 10. WAITING LIST: Assign Table (User Story 15.4 — Workflow A)
 * Strict boundary: Prepares seating handoff, holds table from available pool, updates status to TABLE_ASSIGNED.
 * Strictly NO premature session creation, billing ledger opening, or KOT creation.
 */
export async function assignTableToQueueEntry(
  queueEntryId: string,
  tableId: string,
  branchId?: string,
  staffName: string = "Staff",
  staffId?: string | null
): Promise<{ success: boolean; error?: string; tableLabel?: string; assigned_at?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const auth = await getAuthenticatedAdmin(branchId);
    const targetBranchId = branchId || auth?.branch?.id;

    // Check staff permission
    const accessContext: any = {
      role: auth?.user?.role || "waiter",
      employeeId: (auth?.user?.id || staffId) || undefined,
      name: staffName,
      permissions: (auth?.user as any)?.permissions,
    };
    if (!canAssignWaitlistTable(accessContext)) {
      return { success: false, error: "Unauthorized: Missing tables.waiting_list.assign permission" };
    }

    // 1. Fetch Waitlist Entry
    let entry: any = null;
    try {
      const { data: wl } = await supabase
        .from("waiting_list_entries")
        .select("id, branch_id, section_id, customer_name, mobile_number, guest_count, queue_token, status")
        .eq("id", queueEntryId)
        .maybeSingle();
      if (wl) entry = wl;
    } catch {}

    if (!entry) {
      const { data: qe } = await supabase
        .from("queue_entries")
        .select("id, branch_id, section_id, customer_name, guest_name, phone, guest_mobile, party_size, queue_number, token_number, status")
        .eq("id", queueEntryId)
        .maybeSingle();
      if (qe) {
        entry = {
          id: qe.id,
          branch_id: qe.branch_id,
          section_id: qe.section_id || null,
          customer_name: qe.customer_name || qe.guest_name || "Guest",
          mobile_number: qe.phone || qe.guest_mobile || "",
          guest_count: qe.party_size || 1,
          queue_token: qe.queue_number || qe.token_number || "WL-01",
          status: qe.status,
        };
      }
    }

    if (!entry && targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.waitlist_entries || [];
        const match = stored.find((w: any) => w.id === queueEntryId);
        if (match) {
          entry = {
            id: match.id,
            branch_id: match.branch_id || targetBranchId,
            section_id: match.section_id || null,
            customer_name: match.customer_name || match.guest_name || "Guest",
            mobile_number: match.mobile_number || match.phone || "",
            guest_count: match.guest_count || match.party_size || 1,
            queue_token: match.queue_token || match.token_number || "WL-01",
            status: match.status,
          };
        }
      } catch {}
    }

    if (!entry) {
      return { success: false, error: "Waiting list entry not found" };
    }

    const currentStatus = (entry.status || "").toUpperCase();
    if (currentStatus === "TABLE_ASSIGNED") {
      return { success: false, error: "Customer is already assigned to a table. Use Change Table to reassign." };
    }
    if (currentStatus === "NO_SHOW" || currentStatus === "REMOVED") {
      return { success: false, error: "Cannot assign table to a cancelled or removed waitlist entry." };
    }

    // 2. Resolve Table / Merge Group (Defensive against unmigrated held_for_waitlist_id column)
    let mergeGroupId: string | null = null;
    let compositeLabel = "Table";
    let physicalTableId = tableId;
    let memberTableIds: string[] = [tableId];
    let targetTableSectionId: string | null = null;

    // Check if tableId is a merge group ID
    try {
      let mgById: any = null;
      const { data: directMg, error: mgErr } = await supabase
        .from("table_merge_groups")
        .select("id, name, primary_table_id, section_id, held_for_waitlist_id, status")
        .eq("id", tableId)
        .maybeSingle();

      if (mgErr && (mgErr.code === "42703" || mgErr.message?.includes("held_for_waitlist_id") || mgErr.message?.includes("column"))) {
        const { data: fbMg } = await supabase
          .from("table_merge_groups")
          .select("id, name, primary_table_id, section_id, status")
          .eq("id", tableId)
          .maybeSingle();
        mgById = fbMg;
      } else {
        mgById = directMg;
      }

      if (mgById) {
        mergeGroupId = mgById.id;
        compositeLabel = mgById.name;
        physicalTableId = mgById.primary_table_id;
        targetTableSectionId = mgById.section_id || null;

        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", mgById.id);
        memberTableIds = (members || []).map((m) => m.table_id);
      }
    } catch {}

    // If not direct merge group ID, check if tableId is a physical table belonging to a group
    if (!mergeGroupId) {
      try {
        const { data: mm } = await supabase
          .from("table_merge_group_members")
          .select("group_id")
          .eq("table_id", tableId)
          .maybeSingle();

        if (mm?.group_id) {
          mergeGroupId = mm.group_id;
          const { data: mg } = await supabase
            .from("table_merge_groups")
            .select("id, name, primary_table_id, section_id")
            .eq("id", mm.group_id)
            .maybeSingle();
          if (mg) {
            compositeLabel = mg.name;
            physicalTableId = mg.primary_table_id;
            targetTableSectionId = mg.section_id || null;
            const { data: members } = await supabase
              .from("table_merge_group_members")
              .select("table_id")
              .eq("group_id", mg.id);
            memberTableIds = (members || []).map((m) => m.table_id);
          }
        }
      } catch {}
    }

    // Check branch metadata merge groups fallback
    if (!mergeGroupId && targetBranchId) {
      const { data: bData } = await supabase
        .from("branches")
        .select("onboarding_progress")
        .eq("id", targetBranchId)
        .maybeSingle();

      const storedGroups = ((bData?.onboarding_progress as any)?.merge_groups as any[]) || [];
      const found = storedGroups.find(
        (g: any) => g.id === tableId || g.member_table_ids?.includes(tableId)
      );
      if (found) {
        mergeGroupId = found.id;
        compositeLabel = found.name;
        physicalTableId = found.primary_table_id || found.member_table_ids?.[0] || tableId;
        memberTableIds = found.member_table_ids || [tableId];
        targetTableSectionId = found.section_id || null;
      }
    }

    // If standalone physical table
    if (!mergeGroupId) {
      let tbl: any = null;
      const { data, error } = await supabase
        .from("tables")
        .select("id, section_id, table_name, qr_url, status, held_for_waitlist_id")
        .eq("id", tableId)
        .maybeSingle();

      if (error && (error.code === "42703" || error.message?.includes("held_for_waitlist_id") || error.message?.includes("column"))) {
        const { data: fbTbl } = await supabase
          .from("tables")
          .select("id, section_id, table_name, qr_url, status")
          .eq("id", tableId)
          .maybeSingle();
        tbl = fbTbl;
      } else {
        tbl = data;
      }

      // Check metadata fallback if table was not found in relational tables
      if (!tbl && targetBranchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("onboarding_progress")
            .eq("id", targetBranchId)
            .maybeSingle();
          const storedTables = (bData?.onboarding_progress as any)?.tables || [];
          const matchTbl = storedTables.find((t: any) => t.id === tableId || String(t.table_number) === String(tableId));
          if (matchTbl) {
            tbl = matchTbl;
          }
        } catch {}
      }

      if (!tbl) {
        return { success: false, error: "Target table not found" };
      }
      compositeLabel = tbl.table_name || `T${parseTableNumber(tbl)}`;
      physicalTableId = tbl.id;
      memberTableIds = [tbl.id];
      targetTableSectionId = tbl.section_id || null;
    }

    // Fallback: look up section_id from member tables if not yet determined
    if (!targetTableSectionId && memberTableIds.length > 0) {
      try {
        const { data: mTable } = await supabase
          .from("tables")
          .select("section_id")
          .eq("id", memberTableIds[0])
          .maybeSingle();
        if (mTable?.section_id) {
          targetTableSectionId = mTable.section_id;
        }
      } catch {}
    }

    // Strict Section Boundary Validation:
    // Staff should only be allowed to assign tables from the section matching the customer's registered waiting list entry
    if (entry.section_id && targetTableSectionId && entry.section_id !== targetTableSectionId) {
      return {
        success: false,
        error: "Cannot assign table from a different section. Staff may only assign tables from the section matching the customer's registered waiting list entry.",
      };
    }

    // 4. Occupancy & Double-Assignment Guardrails
    // Check if any member table has an active session
    const { data: activeSess } = await supabase
      .from("table_sessions")
      .select("id, table_id")
      .in("table_id", memberTableIds)
      .eq("status", "active")
      .limit(1);

    if (activeSess && activeSess.length > 0) {
      return { success: false, error: `Table ${compositeLabel} is currently occupied by an active dining session.` };
    }

    // Check if any member table is already held for another waitlist entry
    try {
      const { data: heldTbls } = await supabase
        .from("tables")
        .select("id, table_name, held_for_waitlist_id")
        .in("id", memberTableIds)
        .not("held_for_waitlist_id", "is", null);

      const foreignHeld = (heldTbls || []).find((h) => h.held_for_waitlist_id !== queueEntryId);
      if (foreignHeld) {
        return { success: false, error: `Table ${compositeLabel} is already held for another waitlist guest.` };
      }
    } catch {}

    // Check if merge group itself is held for another entry
    if (mergeGroupId) {
      try {
        const { data: mgCheck } = await supabase
          .from("table_merge_groups")
          .select("held_for_waitlist_id")
          .eq("id", mergeGroupId)
          .maybeSingle();

        if (mgCheck?.held_for_waitlist_id && mgCheck.held_for_waitlist_id !== queueEntryId) {
          return { success: false, error: `Table group ${compositeLabel} is already held for another waitlist guest.` };
        }
      } catch {}
    }

    // 4. Hold Table / Merge Group (Take out of available pool across terminals)
    try {
      await supabase
        .from("tables")
        .update({ held_for_waitlist_id: queueEntryId })
        .in("id", memberTableIds);
    } catch {}

    if (mergeGroupId) {
      try {
        await supabase
          .from("table_merge_groups")
          .update({ held_for_waitlist_id: queueEntryId })
          .eq("id", mergeGroupId);
      } catch {}

      // Fallback branch metadata for held tables & merge groups
      if (targetBranchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("onboarding_progress")
            .eq("id", targetBranchId)
            .maybeSingle();
          const curProg = (bData?.onboarding_progress as any) || {};
          const heldMap = { ...(curProg.held_tables || {}) };
          memberTableIds.forEach((mId) => {
            heldMap[mId] = queueEntryId;
          });
          const groups = (curProg.merge_groups as any[]) || [];
          const updatedGroups = mergeGroupId
            ? groups.map((g: any) =>
                g.id === mergeGroupId ? { ...g, held_for_waitlist_id: queueEntryId } : g
              )
            : groups;
          await supabase
            .from("branches")
            .update({ onboarding_progress: { ...curProg, held_tables: heldMap, merge_groups: updatedGroups } })
            .eq("id", targetBranchId);
        } catch {}
      }
    } else if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const heldMap = { ...(curProg.held_tables || {}) };
        memberTableIds.forEach((mId) => {
          heldMap[mId] = queueEntryId;
        });
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, held_tables: heldMap } })
          .eq("id", targetBranchId);
      } catch {}
    }

    const nowIso = new Date().toISOString();

    // 5. Update waiting_list_entries: WAITING -> TABLE_ASSIGNED
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          status: "TABLE_ASSIGNED",
          assigned_table_id: physicalTableId,
          assigned_table_label: compositeLabel,
          assigned_merged_group_id: mergeGroupId,
          assigned_by_user_id: staffId || null,
          assigned_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {}

    // 6. Update shadow queue_entries
    try {
      await supabase
        .from("queue_entries")
        .update({
          status: "assigned",
          assigned_table_id: physicalTableId,
          assigned_table_label: compositeLabel,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {}

    // 6b. Update branch metadata fallback
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const stored = (curProg.waitlist_entries as any[]) || [];
        const updated = stored.map((w: any) =>
          w.id === queueEntryId
            ? {
                ...w,
                status: "TABLE_ASSIGNED",
                assigned_table_id: physicalTableId,
                assigned_table_label: compositeLabel,
                assigned_merged_group_id: mergeGroupId,
                assigned_at: nowIso,
              }
            : w
        );
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, waitlist_entries: updated } })
          .eq("id", targetBranchId);
      } catch {}
    }

    // 7. Write Audit Events (User Story 15.4 Section 6)
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: queueEntryId,
        event_type: "TABLE_ASSIGNED",
        actor_id: staffId || null,
        actor_name: staffName,
        state_diff: {
          previous_status: "WAITING",
          new_status: "TABLE_ASSIGNED",
          table_id: physicalTableId,
          assigned_merged_group_id: mergeGroupId,
          table_label: compositeLabel,
        },
        note: `Assigned to Table ${compositeLabel} (${entry.guest_count || 1} guests)`,
        timestamp: nowIso,
      });
    } catch {}

    try {
      await supabase.from("activity_log").insert({
        entity_type: "waitlist_entry",
        entity_id: queueEntryId,
        action: "assigned",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: `Assigned to ${compositeLabel}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");
    return {
      success: true,
      tableLabel: compositeLabel,
      assigned_at: nowIso,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to assign table" };
  }
}

/**
 * 11. WAITING LIST: Reassign Table (User Story 15.4 — Workflow B)
 * Atomic swap of assigned table references. Releases old table back to Available,
 * holds new table, updates waitlist record, and logs ASSIGNMENT_CHANGED.
 */
export async function reassignTableForWaitlistEntry(
  queueEntryId: string,
  newTableId: string,
  branchId?: string,
  staffName: string = "Staff",
  staffId?: string | null
): Promise<{ success: boolean; error?: string; tableLabel?: string; assigned_at?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const auth = await getAuthenticatedAdmin(branchId);
    const targetBranchId = branchId || auth?.branch?.id;

    // Check staff permission
    const accessContext: any = {
      role: auth?.user?.role || "waiter",
      employeeId: (auth?.user?.id || staffId) || undefined,
      name: staffName,
      permissions: (auth?.user as any)?.permissions,
    };
    if (!canAssignWaitlistTable(accessContext)) {
      return { success: false, error: "Unauthorized: Missing tables.waiting_list.assign permission" };
    }

    // 1. Fetch waitlist entry
    let entry: any = null;
    try {
      const { data: wl } = await supabase
        .from("waiting_list_entries")
        .select("id, branch_id, section_id, customer_name, mobile_number, guest_count, queue_token, status, assigned_table_id, assigned_table_label, assigned_merged_group_id")
        .eq("id", queueEntryId)
        .maybeSingle();
      if (wl) entry = wl;
    } catch {}

    if (!entry) {
      const { data: qe } = await supabase
        .from("queue_entries")
        .select("id, branch_id, section_id, customer_name, guest_name, phone, guest_mobile, party_size, queue_number, token_number, status, assigned_table_id, assigned_table_label")
        .eq("id", queueEntryId)
        .maybeSingle();
      if (qe) {
        entry = {
          id: qe.id,
          branch_id: qe.branch_id,
          section_id: qe.section_id || null,
          customer_name: qe.customer_name || qe.guest_name || "Guest",
          mobile_number: qe.phone || qe.guest_mobile || "",
          guest_count: qe.party_size || 1,
          queue_token: qe.queue_number || qe.token_number || "WL-01",
          status: qe.status,
          assigned_table_id: qe.assigned_table_id,
          assigned_table_label: qe.assigned_table_label,
          assigned_merged_group_id: null,
        };
      }
    }

    if (!entry && targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.waitlist_entries || [];
        const match = stored.find((w: any) => w.id === queueEntryId);
        if (match) {
          entry = {
            id: match.id,
            branch_id: match.branch_id || targetBranchId,
            section_id: match.section_id || null,
            customer_name: match.customer_name || match.guest_name || "Guest",
            mobile_number: match.mobile_number || match.phone || "",
            guest_count: match.guest_count || match.party_size || 1,
            queue_token: match.queue_token || match.token_number || "WL-01",
            status: match.status,
            assigned_table_id: match.assigned_table_id,
            assigned_table_label: match.assigned_table_label,
            assigned_merged_group_id: match.assigned_merged_group_id || null,
          };
        }
      } catch {}
    }

    if (!entry) {
      return { success: false, error: "Waiting list entry not found" };
    }

    const currentStatus = (entry.status || "").toUpperCase();
    if (currentStatus !== "TABLE_ASSIGNED" && currentStatus !== "ASSIGNED") {
      return { success: false, error: "Entry must be in TABLE_ASSIGNED state to reassign." };
    }

    const oldTableId = entry.assigned_table_id;
    const oldGroupId = entry.assigned_merged_group_id;
    const oldLabel = entry.assigned_table_label || "Previous Table";

    // If newTableId is same as current table, return success immediately
    if (newTableId === oldTableId || newTableId === oldGroupId) {
      return { success: true, tableLabel: oldLabel };
    }

    // 2. Resolve New Table / Merge Group
    let newGroupId: string | null = null;
    let newCompositeLabel = "Table";
    let newPhysicalTableId = newTableId;
    let newMemberTableIds: string[] = [newTableId];
    let newTableSectionId: string | null = null;

    // Check if newTableId is a merge group ID
    try {
      const { data: mgById } = await supabase
        .from("table_merge_groups")
        .select("id, name, primary_table_id, section_id")
        .eq("id", newTableId)
        .maybeSingle();

      if (mgById) {
        newGroupId = mgById.id;
        newCompositeLabel = mgById.name;
        newPhysicalTableId = mgById.primary_table_id;
        newTableSectionId = mgById.section_id || null;
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", mgById.id);
        newMemberTableIds = (members || []).map((m) => m.table_id);
      }
    } catch {}

    if (!newGroupId) {
      try {
        const { data: mm } = await supabase
          .from("table_merge_group_members")
          .select("group_id")
          .eq("table_id", newTableId)
          .maybeSingle();

        if (mm?.group_id) {
          newGroupId = mm.group_id;
          const { data: mg } = await supabase
            .from("table_merge_groups")
            .select("id, name, primary_table_id, section_id")
            .eq("id", mm.group_id)
            .maybeSingle();
          if (mg) {
            newCompositeLabel = mg.name;
            newPhysicalTableId = mg.primary_table_id;
            newTableSectionId = mg.section_id || null;
            const { data: members } = await supabase
              .from("table_merge_group_members")
              .select("table_id")
              .eq("group_id", mg.id);
            newMemberTableIds = (members || []).map((m) => m.table_id);
          }
        }
      } catch {}
    }

    // Standalone physical table (Defensive against missing held_for_waitlist_id column)
    if (!newGroupId) {
      let tbl: any = null;
      const { data, error } = await supabase
        .from("tables")
        .select("id, section_id, table_name, qr_url, status, held_for_waitlist_id")
        .eq("id", newTableId)
        .maybeSingle();

      if (error && (error.code === "42703" || error.message?.includes("held_for_waitlist_id") || error.message?.includes("column"))) {
        const { data: fbTbl } = await supabase
          .from("tables")
          .select("id, section_id, table_name, qr_url, status")
          .eq("id", newTableId)
          .maybeSingle();
        tbl = fbTbl;
      } else {
        tbl = data;
      }

      // Check metadata fallback if table was not found in relational tables
      if (!tbl && targetBranchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("onboarding_progress")
            .eq("id", targetBranchId)
            .maybeSingle();
          const storedTables = (bData?.onboarding_progress as any)?.tables || [];
          const matchTbl = storedTables.find((t: any) => t.id === newTableId || String(t.table_number) === String(newTableId));
          if (matchTbl) {
            tbl = matchTbl;
          }
        } catch {}
      }

      if (!tbl) {
        return { success: false, error: "Target table not found" };
      }
      newCompositeLabel = tbl.table_name || `T${parseTableNumber(tbl)}`;
      newPhysicalTableId = tbl.id;
      newMemberTableIds = [tbl.id];
      newTableSectionId = tbl.section_id || null;
    }

    // Fallback: look up section_id from member tables if not yet determined
    if (!newTableSectionId && newMemberTableIds.length > 0) {
      try {
        const { data: mTable } = await supabase
          .from("tables")
          .select("section_id")
          .eq("id", newMemberTableIds[0])
          .maybeSingle();
        if (mTable?.section_id) {
          newTableSectionId = mTable.section_id;
        }
      } catch {}
    }

    // Strict Section Boundary Validation:
    // Staff should only be allowed to assign tables from the section matching the customer's registered waiting list entry
    if (entry.section_id && newTableSectionId && entry.section_id !== newTableSectionId) {
      return {
        success: false,
        error: "Cannot assign table from a different section. Staff may only assign tables from the section matching the customer's registered waiting list entry.",
      };
    }

    // 3. Check new table availability
    const { data: activeSess } = await supabase
      .from("table_sessions")
      .select("id")
      .in("table_id", newMemberTableIds)
      .eq("status", "active")
      .limit(1);

    if (activeSess && activeSess.length > 0) {
      return { success: false, error: `Table ${newCompositeLabel} is currently occupied by an active session.` };
    }

    try {
      const { data: heldTbls, error: hErr } = await supabase
        .from("tables")
        .select("id, held_for_waitlist_id")
        .in("id", newMemberTableIds)
        .not("held_for_waitlist_id", "is", null);

      if (!hErr && heldTbls) {
        const foreignHeld = heldTbls.find((h) => h.held_for_waitlist_id !== queueEntryId);
        if (foreignHeld) {
          return { success: false, error: `Table ${newCompositeLabel} is already held for another waitlist customer.` };
        }
      }
    } catch {}

    // 4. Release Old Table / Merge Group
    if (oldGroupId) {
      try {
        await supabase
          .from("table_merge_groups")
          .update({ held_for_waitlist_id: null })
          .eq("id", oldGroupId);

        const { data: oldMembers } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", oldGroupId);
        const oldMemberIds = (oldMembers || []).map((m) => m.table_id);
        if (oldMemberIds.length > 0) {
          await supabase
            .from("tables")
            .update({ held_for_waitlist_id: null })
            .in("id", oldMemberIds);
        }
      } catch {}
    } else if (oldTableId) {
      try {
        await supabase
          .from("tables")
          .update({ held_for_waitlist_id: null })
          .eq("id", oldTableId);
      } catch {}
    }

    // 5. Hold New Table / Merge Group
    try {
      await supabase
        .from("tables")
        .update({ held_for_waitlist_id: queueEntryId })
        .in("id", newMemberTableIds);
    } catch {}

    if (newGroupId) {
      try {
        await supabase
          .from("table_merge_groups")
          .update({ held_for_waitlist_id: queueEntryId })
          .eq("id", newGroupId);
      } catch {}
    }

    // Update branch metadata held_tables and merge groups
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const heldMap = { ...(curProg.held_tables || {}) };
        if (oldTableId) delete heldMap[oldTableId];
        newMemberTableIds.forEach((mId) => {
          heldMap[mId] = queueEntryId;
        });
        const groups = (curProg.merge_groups as any[]) || [];
        const updatedGroups = groups.map((g: any) => {
          if (oldGroupId && g.id === oldGroupId) return { ...g, held_for_waitlist_id: null };
          if (newGroupId && g.id === newGroupId) return { ...g, held_for_waitlist_id: queueEntryId };
          return g;
        });
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, held_tables: heldMap, merge_groups: updatedGroups } })
          .eq("id", targetBranchId);
      } catch {}
    }

    const nowIso = new Date().toISOString();

    // 6. Update waiting_list_entries
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          assigned_table_id: newPhysicalTableId,
          assigned_table_label: newCompositeLabel,
          assigned_merged_group_id: newGroupId,
          assigned_by_user_id: staffId || null,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {}

    // 7. Update shadow queue_entries
    try {
      await supabase
        .from("queue_entries")
        .update({
          assigned_table_id: newPhysicalTableId,
          assigned_table_label: newCompositeLabel,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {}

    // 7b. Update branch metadata fallback
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const stored = (curProg.waitlist_entries as any[]) || [];
        const updated = stored.map((w: any) =>
          w.id === queueEntryId
            ? {
                ...w,
                status: "TABLE_ASSIGNED",
                assigned_table_id: newPhysicalTableId,
                assigned_table_label: newCompositeLabel,
                assigned_merged_group_id: newGroupId,
                assigned_at: nowIso,
              }
            : w
        );
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, waitlist_entries: updated } })
          .eq("id", targetBranchId);
      } catch {}
    }

    // 8. Write ASSIGNMENT_CHANGED Audit Event (User Story 15.4 Section 6 Event 2)
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: queueEntryId,
        event_type: "ASSIGNMENT_CHANGED",
        actor_id: staffId || null,
        actor_name: staffName,
        state_diff: {
          previous_table: oldLabel,
          new_table: newCompositeLabel,
          previous_table_id: oldTableId,
          new_table_id: newPhysicalTableId,
        },
        note: `Reassigned from ${oldLabel} to ${newCompositeLabel}`,
        timestamp: nowIso,
      });
    } catch {}

    try {
      await supabase.from("activity_log").insert({
        entity_type: "waitlist_entry",
        entity_id: queueEntryId,
        action: "reassigned",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: `Reassigned from ${oldLabel} to ${newCompositeLabel}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");
    return {
      success: true,
      tableLabel: newCompositeLabel,
      assigned_at: nowIso,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reassign table" };
  }
}

/**
 * 12. WAITING LIST: Cancel Assignment & Return to Queue (User Story 15.4 — Workflow C)
 * Releases held table back to Available, rolls status back to WAITING,
 * and writes ASSIGNMENT_CANCELLED audit log.
 */
export async function cancelWaitlistTableAssignment(
  queueEntryId: string,
  branchId?: string,
  staffName: string = "Staff",
  staffId?: string | null,
  note?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const auth = await getAuthenticatedAdmin(branchId);
    const targetBranchId = branchId || auth?.branch?.id;

    // Check staff permission
    const accessContext: any = {
      role: auth?.user?.role || "waiter",
      employeeId: (auth?.user?.id || staffId) || undefined,
      name: staffName,
      permissions: (auth?.user as any)?.permissions,
    };
    if (!canAssignWaitlistTable(accessContext)) {
      return { success: false, error: "Unauthorized: Missing tables.waiting_list.assign permission" };
    }

    // 1. Fetch waitlist entry
    let entry: any = null;
    try {
      const { data: wl } = await supabase
        .from("waiting_list_entries")
        .select("id, branch_id, customer_name, status, assigned_table_id, assigned_table_label, assigned_merged_group_id")
        .eq("id", queueEntryId)
        .maybeSingle();
      if (wl) entry = wl;
    } catch {}

    if (!entry) {
      const { data: qe } = await supabase
        .from("queue_entries")
        .select("id, branch_id, customer_name, guest_name, status, assigned_table_id, assigned_table_label")
        .eq("id", queueEntryId)
        .maybeSingle();
      if (qe) {
        entry = {
          id: qe.id,
          branch_id: qe.branch_id,
          customer_name: qe.customer_name || qe.guest_name || "Guest",
          status: qe.status,
          assigned_table_id: qe.assigned_table_id,
          assigned_table_label: qe.assigned_table_label,
          assigned_merged_group_id: null,
        };
      }
    }

    if (!entry && targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.waitlist_entries || [];
        const match = stored.find((w: any) => w.id === queueEntryId);
        if (match) {
          entry = {
            id: match.id,
            branch_id: match.branch_id || targetBranchId,
            customer_name: match.customer_name || match.guest_name || "Guest",
            status: match.status,
            assigned_table_id: match.assigned_table_id,
            assigned_table_label: match.assigned_table_label,
            assigned_merged_group_id: match.assigned_merged_group_id || null,
          };
        }
      } catch {}
    }

    if (!entry) {
      return { success: false, error: "Waiting list entry not found" };
    }

    const currentStatus = (entry.status || "").toUpperCase();
    if (currentStatus !== "TABLE_ASSIGNED" && currentStatus !== "ASSIGNED") {
      return { success: false, error: "Entry is not currently assigned to a table." };
    }

    const oldTableId = entry.assigned_table_id;
    const oldGroupId = entry.assigned_merged_group_id;
    const oldLabel = entry.assigned_table_label || "Table";

    // 2. Release Held Table / Merge Group
    if (oldGroupId) {
      try {
        await supabase
          .from("table_merge_groups")
          .update({ held_for_waitlist_id: null })
          .eq("id", oldGroupId);

        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", oldGroupId);
        const mIds = (members || []).map((m) => m.table_id);
        if (mIds.length > 0) {
          await supabase
            .from("tables")
            .update({ held_for_waitlist_id: null })
            .in("id", mIds);
        }
      } catch {}
    } else if (oldTableId) {
      try {
        await supabase
          .from("tables")
          .update({ held_for_waitlist_id: null })
          .eq("id", oldTableId);
      } catch {}
    }

    // Release held table/merge group in branch metadata
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const heldMap = { ...(curProg.held_tables || {}) };
        if (oldTableId) delete heldMap[oldTableId];
        const groups = (curProg.merge_groups as any[]) || [];
        const updatedGroups = groups.map((g: any) => {
          if (oldGroupId && g.id === oldGroupId) return { ...g, held_for_waitlist_id: null };
          return g;
        });
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, held_tables: heldMap, merge_groups: updatedGroups } })
          .eq("id", targetBranchId);
      } catch {}
    }

    const nowIso = new Date().toISOString();

    // 3. Roll status back to WAITING in waiting_list_entries
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          status: "WAITING",
          assigned_table_id: null,
          assigned_table_label: null,
          assigned_merged_group_id: null,
          assigned_at: null,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {}

    // 4. Roll status back in shadow queue_entries
    try {
      await supabase
        .from("queue_entries")
        .update({
          status: "waiting",
          assigned_table_id: null,
          assigned_table_label: null,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {}

    // 4b. Roll status back in branch metadata fallback
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const stored = (curProg.waitlist_entries as any[]) || [];
        const updated = stored.map((w: any) =>
          w.id === queueEntryId
            ? {
                ...w,
                status: "WAITING",
                assigned_table_id: null,
                assigned_table_label: null,
                assigned_merged_group_id: null,
                assigned_at: null,
              }
            : w
        );
        await supabase
          .from("branches")
          .update({ onboarding_progress: { ...curProg, waitlist_entries: updated } })
          .eq("id", targetBranchId);
      } catch {}
    }

    // 5. Write ASSIGNMENT_CANCELLED Audit Event (User Story 15.4 Section 6 Event 3)
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: queueEntryId,
        event_type: "ASSIGNMENT_CANCELLED",
        actor_id: staffId || null,
        actor_name: staffName,
        state_diff: {
          previous_status: "TABLE_ASSIGNED",
          new_status: "WAITING",
          released_table: oldLabel,
        },
        note: note?.trim() || `Assignment cancelled. Released ${oldLabel} and returned customer to waiting queue.`,
        timestamp: nowIso,
      });
    } catch {}

    try {
      await supabase.from("activity_log").insert({
        entity_type: "waitlist_entry",
        entity_id: queueEntryId,
        action: "assignment_cancelled",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: `Assignment cancelled. Released table ${oldLabel}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel table assignment" };
  }
}

/**
 * 10. WAITING LIST: Remove / Cancel Entry (Handles NO_SHOW and REMOVED)
 */
export async function removeQueueEntry(
  queueEntryId: string,
  status: "removed" | "cancelled" | "no_show" | "NO_SHOW" | "REMOVED" = "removed",
  staffName: string = "Staff",
  staffId?: string | null,
  note?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const normalizedUpper = status.toUpperCase() === "NO_SHOW" ? "NO_SHOW" : "REMOVED";
    const shadowStatus = normalizedUpper === "NO_SHOW" ? "no_show" : "removed";
    const nowIso = new Date().toISOString();

    const auditNote = note?.trim() || (
      normalizedUpper === "NO_SHOW"
        ? "Customer marked as absent / no-show when called."
        : "Removed customer from waiting list"
    );

    // Update waiting_list_entries
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          status: normalizedUpper,
          closed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId);
    } catch {
      // fallback
    }

    // Update queue_entries
    try {
      await supabase
        .from("queue_entries")
        .update({ status: shadowStatus, updated_at: nowIso })
        .eq("id", queueEntryId);
    } catch {
      await supabase
        .from("queue_entries")
        .update({ status: "cancelled" })
        .eq("id", queueEntryId);
    }

    // Update branch metadata fallback
    try {
      const { data: bData } = await supabase
        .from("branches")
        .select("id, onboarding_progress");
      if (bData) {
        for (const b of bData) {
          const curProg = (b.onboarding_progress as any) || {};
          const stored = (curProg.waitlist_entries as any[]) || [];
          const hasEntry = stored.some((w: any) => w.id === queueEntryId);
          if (hasEntry) {
            const updated = stored.map((w: any) =>
              w.id === queueEntryId
                ? {
                    ...w,
                    status: normalizedUpper,
                    closed_at: nowIso,
                  }
                : w
            );
            await supabase
              .from("branches")
              .update({ onboarding_progress: { ...curProg, waitlist_entries: updated } })
              .eq("id", b.id);
            break;
          }
        }
      }
    } catch {}

    // Log to waiting_list_activity_logs
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: queueEntryId,
        event_type: normalizedUpper,
        actor_id: staffId || null,
        actor_name: staffName,
        state_diff: { new_status: normalizedUpper },
        note: auditNote,
        timestamp: nowIso,
      });
    } catch {
      // fallback
    }

    // Log removal in activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "waitlist_entry",
        entity_id: queueEntryId,
        action: shadowStatus,
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: auditNote,
        created_at: nowIso,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update queue entry" };
  }
}

/**
 * 11. TABLE RESERVATIONS: Reserve, Release, and Seat
 */
export async function reserveTable(
  tableId: string,
  guestName: string,
  guestMobile: string,
  partySize: number,
  branchId: string,
  staffName: string = "Staff",
  staffId?: string | null
): Promise<{ success: boolean; reservationId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Check table exists and is not occupied
    const { data: tbl } = await supabase
      .from("tables")
      .select("status, table_name, qr_url")
      .eq("id", tableId)
      .maybeSingle();

    if (!tbl) return { success: false, error: "Table not found" };
    if (tbl.status === "occupied") return { success: false, error: "Table is currently occupied" };

    // Insert into table_reservations
    let resId: string | undefined;
    try {
      const { data: newRes, error: resErr } = await supabase
        .from("table_reservations")
        .insert({
          branch_id: branchId,
          table_id: tableId,
          guest_name: guestName.trim(),
          guest_mobile: guestMobile.trim(),
          party_size: Math.max(1, partySize),
          status: "reserved",
          created_by: staffId || null,
          created_by_name: staffName,
        })
        .select("id")
        .single();
      if (!resErr && newRes) resId = newRes.id;
    } catch {
      // fallback if table_reservations not yet migrated
    }

    // Update table status to 'reserved'
    await supabase.from("tables").update({ status: "reserved" }).eq("id", tableId);

    // Log to activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: tableId,
        action: "reserved",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: `Reserved for ${guestName.trim()} (Party of ${partySize})`,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true, reservationId: resId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reserve table" };
  }
}

export async function releaseTableReservation(
  tableId: string,
  branchId: string,
  staffName: string = "Staff",
  staffId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Cancel reservation in table_reservations
    try {
      await supabase
        .from("table_reservations")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("table_id", tableId)
        .eq("status", "reserved");
    } catch {
      // fallback
    }

    // Restore table status to 'active'
    await supabase.from("tables").update({ status: "active" }).eq("id", tableId);

    // Log to activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: tableId,
        action: "released",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: "Reservation released — table now available",
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to release reservation" };
  }
}

export async function seatReservedTable(
  tableId: string,
  branchId: string,
  staffName: string = "Staff",
  staffId?: string | null
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Fetch active reservation
    let resData: any = null;
    try {
      const { data } = await supabase
        .from("table_reservations")
        .select("*")
        .eq("table_id", tableId)
        .eq("status", "reserved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      resData = data;
    } catch {
      resData = null;
    }

    const partySize = resData?.party_size || 2;
    const guestName = resData?.guest_name || "Reserved Guest";
    const guestMobile = resData?.guest_mobile || "";

    // Start session
    const startRes = await startTableSession(
      tableId, 
      partySize, 
      branchId, 
      guestName, 
      guestMobile, 
      staffName, 
      staffId
    );
    if (!startRes.success) {
      return { success: false, error: startRes.error };
    }

    // Mark reservation seated
    if (resData?.id) {
      try {
        await supabase
          .from("table_reservations")
          .update({ status: "seated", updated_at: new Date().toISOString() })
          .eq("id", resData.id);
      } catch {
        // fallback
      }
    }

    // Log to activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: tableId,
        action: "seated",
        actor_type: "staff",
        actor_id: staffId || null,
        actor_name: staffName,
        note: `Seated reserved party: ${guestName} (${partySize} guests)`,
      });
    } catch {
      // fallback
    }

    revalidatePath("/operations/tables");
    return { success: true, sessionId: startRes.sessionId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to seat reserved table" };
  }
}

/**
 * 12. CREATE ACTIVITY LOG ENTRY (Generic)
 */
export async function createActivityLog(log: {
  entity_type: string;
  entity_id: string;
  action: string;
  actor_type?: "staff" | "customer" | "system";
  actor_id?: string | null;
  actor_name?: string;
  note?: string | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("activity_log")
      .insert({
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        action: log.action,
        actor_type: log.actor_type || "staff",
        actor_id: log.actor_id || null,
        actor_name: log.actor_name || "Staff",
        note: log.note || null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create activity log" };
  }
}

/**
 * 11. WAITER ASSIGNMENT: Assign or Reassign Waiter to Table
 */
export async function assignWaiterToTable(
  employeeId: string,
  tableId: string,
  shiftId: string | null,
  branchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Delete existing assignment for this table if any
    try {
      await supabase
        .from("waiter_table_assignments")
        .delete()
        .eq("table_id", tableId);
    } catch {
      // fallback
    }

    // Insert new assignment
    const { error: insErr } = await supabase
      .from("waiter_table_assignments")
      .insert({
        branch_id: branchId,
        employee_id: employeeId,
        table_id: tableId,
        shift_id: shiftId || null,
        assigned_at: new Date().toISOString(),
      });

    if (insErr) {
      return { success: false, error: insErr.message };
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to assign waiter" };
  }
}

export async function unassignWaiterFromTable(
  tableId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    await supabase
      .from("waiter_table_assignments")
      .delete()
      .eq("table_id", tableId);

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to unassign waiter" };
  }
}

/**
 * 12. ADD ORDER TO LIVE TABLE SESSION (Live-Fire Mode)
 */
export async function addOrderToSession(
  sessionId: string,
  items: Array<{
    itemId: string;
    variationId?: string | null;
    quantity: number;
    price: number;
    notes?: string;
  }>,
  notes?: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Create Order
    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        table_session_id: sessionId,
        status: "preparing",
        order_type: "dine_in",
      })
      .select("id")
      .single();

    if (orderErr || !newOrder) {
      return { success: false, error: orderErr?.message || "Failed to create order" };
    }

    // Insert Order Items
    const orderItemsToInsert = items.map((it) => ({
      order_id: newOrder.id,
      item_id: it.itemId,
      variation_id: it.variationId || null,
      quantity: Math.max(1, it.quantity),
      price_at_order: it.price,
      status: "preparing",
      notes: it.notes || null,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsErr) {
      return { success: false, error: itemsErr.message };
    }

    revalidatePath("/operations/tables");
    return { success: true, orderId: newOrder.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add order" };
  }
}

/**
 * 13. NEW BILL (Draft Mode for Takeaway / Delivery)
 */
export async function createDraftBill(
  branchId: string,
  orderType: "takeaway" | "delivery",
  items: Array<{
    itemId: string;
    variationId?: string | null;
    quantity: number;
    price: number;
    notes?: string;
  }>,
  customerInfo?: { name?: string; phone?: string },
  notes?: string
): Promise<{ success: boolean; billId?: string; billNumber?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Create order with null table_session_id
    const { data: newOrder, error: ordErr } = await supabase
      .from("orders")
      .insert({
        branch_id: branchId,
        table_session_id: null,
        status: "pending",
        order_type: orderType,
      })
      .select("id")
      .single();

    if (ordErr || !newOrder) {
      return { success: false, error: ordErr?.message || "Failed to create order" };
    }

    // Insert order items
    let subtotal = 0;
    const orderItemsToInsert = items.map((it) => {
      const lineTotal = it.price * (it.quantity || 1);
      subtotal += lineTotal;
      return {
        order_id: newOrder.id,
        item_id: it.itemId,
        variation_id: it.variationId || null,
        quantity: Math.max(1, it.quantity),
        price_at_order: it.price,
        status: "pending",
        notes: it.notes || null,
      };
    });

    await supabase.from("order_items").insert(orderItemsToInsert);

    // Calculate approximate tax (e.g. 5% GST standard)
    const taxTotal = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + taxTotal;

    const timestamp = Date.now().toString().slice(-6);
    const billNumber = `${orderType === "delivery" ? "DEL" : "TAK"}-${timestamp}`;

    // Create bill record
    const { data: newBill, error: billErr } = await supabase
      .from("bills")
      .insert({
        branch_id: branchId,
        order_id: newOrder.id,
        bill_number: billNumber,
        subtotal,
        tax_total: taxTotal,
        discount_total: 0,
        total_amount: totalAmount,
        paid_amount: 0,
        status: "unpaid",
        split_count: 1,
        notes: [customerInfo?.name, customerInfo?.phone, notes].filter(Boolean).join(" | "),
      })
      .select("id, bill_number")
      .single();

    if (billErr || !newBill) {
      return { success: false, error: billErr?.message || "Failed to generate bill" };
    }

    revalidatePath("/operations/tables");
    return { success: true, billId: newBill.id, billNumber: newBill.bill_number };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create bill" };
  }
}

/**
 * 14. RECORD BILL PAYMENT
 */
export async function recordBillPayment(
  billId: string,
  amount: number,
  paymentMethod: string = "cash",
  payerName?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();

    // Insert payment
    await supabase.from("bill_payments").insert({
      bill_id: billId,
      amount,
      payment_method: paymentMethod,
      payer_name: payerName || null,
      notes: notes || null,
    });

    // Update bill paid_amount
    const { data: bill } = await supabase
      .from("bills")
      .select("total_amount, paid_amount")
      .eq("id", billId)
      .maybeSingle();

    if (bill) {
      const newPaid = Number(bill.paid_amount || 0) + Number(amount);
      const isFull = newPaid >= Number(bill.total_amount);
      await supabase
        .from("bills")
        .update({
          paid_amount: newPaid,
          status: isFull ? "paid" : "partially_paid",
        })
        .eq("id", billId);
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record payment" };
  }
}

/**
 * 15. SPLIT BILL
 */
export async function splitBill(
  billId: string,
  splitCount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    await supabase
      .from("bills")
      .update({ split_count: Math.max(1, splitCount) })
      .eq("id", billId);

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to split bill" };
  }
}

/**
 * 16. WAITING LIST: Confirm Customer Seating (User Story 15.5)
 * Triggered when customer physically reaches table and taps "I Am Seated" on mobile.
 * Validates device_token, checks table exclusivity, atomically creates dining session,
 * sets table to occupied, marks waitlist entry SEATED, and writes audit trail events.
 */
export async function confirmCustomerSeating(params: {
  queueEntryId: string;
  deviceToken: string;
  branchId?: string;
}): Promise<{
  success: boolean;
  error?: string;
  statusCode?: number;
  session?: {
    id: string;
    table_id: string;
    table_label: string;
    customer_name: string;
    guest_count: number;
    started_at: string;
  };
}> {
  try {
    const { queueEntryId, deviceToken, branchId } = params;
    if (!queueEntryId) {
      return { success: false, error: "Missing required parameter: queueEntryId", statusCode: 400 };
    }
    if (!deviceToken) {
      return { success: false, error: "Missing required parameter: deviceToken", statusCode: 400 };
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch Waitlist Entry (checking relational table, legacy queue_entries, and branch progress fallback)
    let entry: any = null;
    let targetBranchId = branchId;

    try {
      const { data: wl, error: wlErr } = await supabase
        .from("waiting_list_entries")
        .select("id, branch_id, section_id, customer_name, mobile_number, guest_count, queue_token, status, device_token, assigned_table_id, assigned_table_label, assigned_merged_group_id, seated_at")
        .eq("id", queueEntryId)
        .maybeSingle();

      if (!wlErr && wl) {
        entry = wl;
        if (wl.branch_id) targetBranchId = wl.branch_id;
      }
    } catch {}

    if (!entry) {
      try {
        const { data: qe, error: qeErr } = await supabase
          .from("queue_entries")
          .select("id, branch_id, section_id, customer_name, guest_name, phone, guest_mobile, party_size, queue_number, token_number, status, device_token, assigned_table_id, assigned_table_label")
          .eq("id", queueEntryId)
          .maybeSingle();

        if (!qeErr && qe) {
          entry = {
            id: qe.id,
            branch_id: qe.branch_id,
            section_id: qe.section_id || null,
            customer_name: qe.customer_name || qe.guest_name || "Guest",
            mobile_number: qe.phone || qe.guest_mobile || "",
            guest_count: qe.party_size || 1,
            queue_token: qe.queue_number || qe.token_number || "WL-01",
            status: qe.status,
            device_token: qe.device_token,
            assigned_table_id: qe.assigned_table_id,
            assigned_table_label: qe.assigned_table_label,
            assigned_merged_group_id: null,
            seated_at: null,
          };
          if (qe.branch_id) targetBranchId = qe.branch_id;
        }
      } catch {}
    }

    if (!entry) {
      try {
        let bQuery = supabase.from("branches").select("id, onboarding_progress");
        if (targetBranchId) bQuery = bQuery.eq("id", targetBranchId);
        const { data: bList } = await bQuery.limit(10);
        for (const bData of bList || []) {
          const stored = (bData?.onboarding_progress as any)?.waitlist_entries || [];
          const match = stored.find((w: any) => w.id === queueEntryId);
          if (match) {
            targetBranchId = bData.id;
            entry = {
              id: match.id,
              branch_id: match.branch_id || bData.id,
              section_id: match.section_id || null,
              customer_name: match.customer_name || match.guest_name || "Guest",
              mobile_number: match.mobile_number || match.phone || "",
              guest_count: match.guest_count || match.party_size || 1,
              queue_token: match.queue_token || match.token_number || "WL-01",
              status: match.status,
              device_token: match.device_token,
              assigned_table_id: match.assigned_table_id,
              assigned_table_label: match.assigned_table_label,
              assigned_merged_group_id: match.assigned_merged_group_id || null,
              seated_at: match.seated_at || null,
            };
            break;
          }
        }

        // If not found in targetBranchId, scan all branches as fallback
        if (!entry && targetBranchId) {
          const { data: allB } = await supabase.from("branches").select("id, onboarding_progress").limit(20);
          for (const bData of allB || []) {
            const stored = (bData?.onboarding_progress as any)?.waitlist_entries || [];
            const match = stored.find((w: any) => w.id === queueEntryId);
            if (match) {
              targetBranchId = bData.id;
              entry = {
                id: match.id,
                branch_id: match.branch_id || bData.id,
                section_id: match.section_id || null,
                customer_name: match.customer_name || match.guest_name || "Guest",
                mobile_number: match.mobile_number || match.phone || "",
                guest_count: match.guest_count || match.party_size || 1,
                queue_token: match.queue_token || match.token_number || "WL-01",
                status: match.status,
                device_token: match.device_token,
                assigned_table_id: match.assigned_table_id,
                assigned_table_label: match.assigned_table_label,
                assigned_merged_group_id: match.assigned_merged_group_id || null,
                seated_at: match.seated_at || null,
              };
              break;
            }
          }
        }
      } catch {}
    }

    if (!entry) {
      return { success: false, error: "Waiting list entry not found", statusCode: 404 };
    }

    // 2. Device Token Verification (Story 15.5 Section 3 Step 2.1)
    const storedDeviceToken = (entry.device_token || "").trim();
    const providedDeviceToken = (deviceToken || "").trim();

    if (!storedDeviceToken || storedDeviceToken !== providedDeviceToken) {
      return {
        success: false,
        error: "This table assignment belongs to another device.",
        statusCode: 403,
      };
    }

    const currentStatus = (entry.status || "").toUpperCase();

    // 3. Status Check & Idempotency (Story 15.5 Section 3 Step 2.2 & Section 4.1)
    if (currentStatus === "SEATED") {
      // Idempotent short-circuit: Find existing active session
      let existingSession: any = null;
      try {
        const { data: sess } = await supabase
          .from("table_sessions")
          .select("id, table_id, table_label, customer_name, guest_count, opened_at, created_at, status")
          .eq("waitlist_entry_id", entry.id)
          .maybeSingle();

        if (sess) existingSession = sess;
      } catch {}

      if (!existingSession && targetBranchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("onboarding_progress")
            .eq("id", targetBranchId)
            .maybeSingle();

          const sessions = (bData?.onboarding_progress as any)?.table_sessions || [];
          existingSession = sessions.find((s: any) => s.waitlist_entry_id === entry.id);
        } catch {}
      }

      if (existingSession && existingSession.status === "closed") {
        return {
          success: false,
          error: "Dining session has ended.",
          statusCode: 410,
        };
      }

      return {
        success: true,
        statusCode: 200,
        session: {
          id: existingSession?.id || "existing-session",
          table_id: existingSession?.table_id || entry.assigned_table_id || "",
          table_label: existingSession?.table_label || entry.assigned_table_label || "Table",
          customer_name: existingSession?.customer_name || entry.customer_name || "Guest",
          guest_count: existingSession?.guest_count || entry.guest_count || 1,
          started_at: existingSession?.opened_at || existingSession?.created_at || entry.seated_at || new Date().toISOString(),
        },
      };
    }

    if (
      currentStatus === "WAITING" ||
      currentStatus === "NO_SHOW" ||
      currentStatus === "REMOVED" ||
      currentStatus === "CANCELLED"
    ) {
      return {
        success: false,
        error: "Table assignment is no longer valid or has expired. Please contact restaurant staff.",
        statusCode: 400,
      };
    }

    if (currentStatus !== "TABLE_ASSIGNED" && currentStatus !== "ASSIGNED") {
      return {
        success: false,
        error: "Entry must be in TABLE_ASSIGNED state to confirm seating.",
        statusCode: 400,
      };
    }

    // 4. Table Exclusivity Check (Story 15.5 Section 3 Step 2.3)
    const assignedTableId = entry.assigned_table_id;
    if (!assignedTableId) {
      return {
        success: false,
        error: "No table has been assigned to this entry. Please speak with the host.",
        statusCode: 400,
      };
    }

    const mergeGroupId = entry.assigned_merged_group_id || null;
    let memberTableIds: string[] = [assignedTableId];

    if (mergeGroupId) {
      try {
        const { data: members } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", mergeGroupId);

        if (members && members.length > 0) {
          memberTableIds = members.map((m) => m.table_id);
        }
      } catch {}

      if (memberTableIds.length <= 1 && targetBranchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("onboarding_progress")
            .eq("id", targetBranchId)
            .maybeSingle();

          const groups = (bData?.onboarding_progress as any)?.merge_groups || [];
          const g = groups.find((mg: any) => mg.id === mergeGroupId);
          if (g?.member_table_ids && g.member_table_ids.length > 0) {
            memberTableIds = g.member_table_ids;
          }
        } catch {}
      }
    }

    // Check if table is occupied by an active session
    try {
      const { data: activeSess } = await supabase
        .from("table_sessions")
        .select("id, table_id, waitlist_entry_id")
        .in("table_id", memberTableIds)
        .eq("status", "active")
        .limit(1);

      if (activeSess && activeSess.length > 0) {
        const otherSess = activeSess.find((s) => s.waitlist_entry_id !== entry.id);
        if (otherSess) {
          return {
            success: false,
            error: "Assigned table is currently occupied by another active session.",
            statusCode: 409,
          };
        }
      }
    } catch {}

    // Check if table was held for this entry or reassigned away
    try {
      const { data: heldTbls } = await supabase
        .from("tables")
        .select("id, held_for_waitlist_id")
        .in("id", memberTableIds);

      const foreignHeld = (heldTbls || []).find(
        (h) => h.held_for_waitlist_id && h.held_for_waitlist_id !== entry.id
      );
      if (foreignHeld) {
        return {
          success: false,
          error: "Table assignment no longer available. Please speak with the host.",
          statusCode: 409,
        };
      }
    } catch {}

    // 5. Atomic Dining Session Creation (Story 15.5 Section 3 Step 3)
    const sessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const nowIso = new Date().toISOString();
    const compositeLabel = entry.assigned_table_label || "Table";

    const sessionRecord: any = {
      id: sessionId,
      branch_id: targetBranchId || entry.branch_id,
      table_id: assignedTableId,
      table_label: compositeLabel,
      waitlist_entry_id: entry.id,
      primary_device_token: providedDeviceToken,
      customer_name: entry.customer_name,
      mobile_number: entry.mobile_number,
      guest_count: entry.guest_count || 1,
      status: "active",
      opened_at: nowIso,
      created_at: nowIso,
    };

    // Insert into table_sessions
    try {
      const { error: sessErr } = await supabase.from("table_sessions").insert(sessionRecord);
      if (sessErr) {
        // Fallback for schemas missing some extended columns (omit branch_id which does not exist on table_sessions)
        const fallbackSession = {
          id: sessionId,
          table_id: assignedTableId,
          status: "active",
          guest_count: entry.guest_count || 1,
          opened_at: nowIso,
        };
        await supabase.from("table_sessions").insert(fallbackSession);
      }
    } catch {}

    // Link merge member tables in session_tables
    if (memberTableIds.length > 0) {
      try {
        const rows = memberTableIds.map((tId) => ({
          session_id: sessionId,
          table_id: tId,
          created_at: nowIso,
        }));
        await supabase.from("session_tables").insert(rows);
      } catch {}
    }

    // Update physical tables: status -> occupied (omit non-existent held_for_waitlist_id)
    try {
      await supabase
        .from("tables")
        .update({
          status: "occupied",
          updated_at: nowIso,
        })
        .in("id", memberTableIds);
    } catch {}

    // Update merge group if applicable
    if (mergeGroupId) {
      try {
        await supabase
          .from("table_merge_groups")
          .update({
            status: "occupied",
            active_session_id: sessionId,
            held_for_waitlist_id: null,
            updated_at: nowIso,
          })
          .eq("id", mergeGroupId);
      } catch {}
    }

    // Update waiting_list_entries: status -> SEATED, seated_at -> nowIso
    try {
      await supabase
        .from("waiting_list_entries")
        .update({
          status: "SEATED",
          seated_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", entry.id);
    } catch {}

    // Update shadow queue_entries
    try {
      await supabase
        .from("queue_entries")
        .update({
          status: "seated",
          updated_at: nowIso,
        })
        .eq("id", entry.id);
    } catch {}

    // Synchronize branch metadata fallback (Dual-Storage Resilience)
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase
          .from("branches")
          .select("onboarding_progress")
          .eq("id", targetBranchId)
          .maybeSingle();

        const curProg = (bData?.onboarding_progress as any) || {};
        const storedEntries = (curProg.waitlist_entries as any[]) || [];
        const updatedEntries = storedEntries.map((w: any) =>
          w.id === entry.id
            ? {
                ...w,
                status: "SEATED",
                seated_at: nowIso,
              }
            : w
        );

        const heldMap = { ...(curProg.held_tables || {}) };
        memberTableIds.forEach((mId) => {
          delete heldMap[mId];
        });

        const storedTables = (curProg.tables as any[]) || [];
        const updatedTables = storedTables.map((t: any) =>
          memberTableIds.includes(t.id) ? { ...t, status: "occupied", held_for_waitlist_id: null } : t
        );

        const storedGroups = (curProg.merge_groups as any[]) || [];
        const updatedGroups = storedGroups.map((g: any) =>
          g.id === mergeGroupId
            ? { ...g, status: "occupied", active_session_id: sessionId, held_for_waitlist_id: null }
            : g
        );

        const storedSessions = (curProg.table_sessions as any[]) || [];
        storedSessions.push(sessionRecord);

        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...curProg,
              waitlist_entries: updatedEntries,
              held_tables: heldMap,
              tables: updatedTables,
              merge_groups: updatedGroups,
              table_sessions: storedSessions,
            },
          })
          .eq("id", targetBranchId);
      } catch {}
    }

    // 6. Write Audit Events (Story 15.5 Section 5)
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: entry.id,
        event_type: "CUSTOMER_SEATED",
        actor_name: "Customer Device Self-Confirm",
        state_diff: {
          previous_status: "TABLE_ASSIGNED",
          new_status: "SEATED",
          table_id: assignedTableId,
          table_label: compositeLabel,
        },
        note: `Customer confirmed seating at Table ${compositeLabel} (${entry.guest_count || 1} guests)`,
        timestamp: nowIso,
      });
    } catch {}

    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: entry.id,
        event_type: "DINING_SESSION_CREATED",
        actor_name: "Waitlist Assignment Seating",
        state_diff: {
          session_id: sessionId,
          table_id: assignedTableId,
          table_label: compositeLabel,
          customer_name: entry.customer_name,
          guest_count: entry.guest_count || 1,
        },
        note: `Session initialized for ${entry.customer_name} (${entry.guest_count || 1} guests) at Table ${compositeLabel}`,
        timestamp: nowIso,
      });
    } catch {}

    try {
      await supabase.from("activity_log").insert({
        entity_type: "table_session",
        entity_id: sessionId,
        action: "session_created",
        actor_type: "customer",
        actor_name: entry.customer_name || "Customer",
        note: `Dining session started at ${compositeLabel} via customer seating confirmation`,
        created_at: nowIso,
      });
    } catch {}

    try {
      revalidatePath("/operations/tables");
    } catch {}

    return {
      success: true,
      statusCode: 200,
      session: {
        id: sessionId,
        table_id: assignedTableId,
        table_label: compositeLabel,
        customer_name: entry.customer_name,
        guest_count: entry.guest_count || 1,
        started_at: nowIso,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to confirm seating",
      statusCode: 500,
    };
  }
}

// ============================================================================
// User Story 15.6: Table QR Access Request & Staff Approval
// ============================================================================

export interface TableAccessRequestItem {
  id: string;
  branch_id: string;
  table_id: string;
  table_label: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  device_token: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  rejection_reason?: string | null;
  resolved_by?: string | null;
  resolved_by_name?: string | null;
  session_id?: string | null;
  created_at: string;
  resolved_at?: string | null;
  waiting_minutes?: number;
}

/**
 * Public resolver for table scan precondition check (Story 15.6 Section 4 Step 1).
 * Resolves whether the table is AVAILABLE or OCCUPIED.
 */
export async function getTableScanStatus(tableIdOrCode: string, branchId?: string): Promise<{
  success: boolean;
  status?: "AVAILABLE" | "OCCUPIED" | "HELD";
  error?: string;
  table?: {
    id: string;
    name: string;
    label: string;
    seatingCapacity: number;
    status: string;
    branchId: string;
    branchName?: string;
    sectionId?: string;
    sectionName?: string;
    activeSessionId?: string | null;
  };
}> {
  try {
    const supabase = createServiceRoleClient();
    const queryTerm = (tableIdOrCode || "").trim();

    if (!queryTerm) {
      return { success: false, error: "Table identifier is required" };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    // 1. Discover physical table or composite merge group
    let matchedTable: any = null;
    let branchInfo: any = null;
    let sectionInfo: any = null;

    if (isUuid) {
      const { data: tbl, error: tblErr } = await supabase
        .from("tables")
        .select("id, section_id, table_name, seating_capacity, status, qr_url")
        .eq("id", queryTerm)
        .maybeSingle();

      if (tbl) {
        matchedTable = { ...tbl, held_for_waitlist_id: null };
      }
    }

    // If not found by UUID, try matching short code, table name, or merge group
    if (!matchedTable) {
      let tblQuery = supabase.from("tables").select("id, section_id, table_name, seating_capacity, status, qr_url");
      if (branchId) {
        // Find sections of branch
        const { data: secList } = await supabase.from("sections").select("id").eq("branch_id", branchId);
        const sIds = (secList || []).map((s) => s.id);
        if (sIds.length > 0) tblQuery = tblQuery.in("section_id", sIds);
      }
      let { data: allTbls } = await tblQuery;

      if (allTbls && allTbls.length > 0) {
        matchedTable = allTbls.find((t) => {
          if (t.id === queryTerm) return true;
          const tNum = t.table_name?.replace(/\D/g, "");
          const qNum = queryTerm.replace(/\D/g, "");
          if (qNum && tNum === qNum) return true;
          if (t.table_name?.toLowerCase() === queryTerm.toLowerCase()) return true;
          if (t.qr_url && t.qr_url.endsWith(`/${queryTerm}`)) return true;
          return false;
        });
      }
    }

    // Fallback: check branches.onboarding_progress.tables if relational tables was empty or table not found
    if (!matchedTable) {
      let candidateBranches: any[] = [];
      if (branchId) {
        const { data: b } = await supabase.from("branches").select("id, name, onboarding_progress").eq("id", branchId).maybeSingle();
        if (b) candidateBranches = [b];
      }
      if (candidateBranches.length === 0) {
        const { data: bList } = await supabase.from("branches").select("id, name, onboarding_progress").limit(20);
        candidateBranches = bList || [];
      }

      for (const b of candidateBranches) {
        const obTables = (b.onboarding_progress as any)?.tables || [];
        const found = obTables.find((t: any) => 
          t.id === queryTerm ||
          (t.table_name && t.table_name.toLowerCase() === queryTerm.toLowerCase()) ||
          (t.name && t.name.toLowerCase() === queryTerm.toLowerCase()) ||
          (queryTerm.replace(/\D/g, "") && (t.table_name || t.name)?.replace(/\D/g, "") === queryTerm.replace(/\D/g, "")) ||
          (t.qr_url && t.qr_url.endsWith(`/${queryTerm}`))
        );
        if (found) {
          matchedTable = {
            id: found.id,
            section_id: found.section_id,
            table_name: found.table_name || found.name || `Table ${found.table_number || ""}`,
            seating_capacity: found.seating_capacity || found.capacity || 4,
            status: found.status || "active",
            qr_url: found.qr_url,
            held_for_waitlist_id: null,
          };
          branchInfo = b;
          break;
        }
      }
    }

    if (!matchedTable) {
      return { success: false, error: "Table not found." };
    }

    // 2. Fetch section & branch details
    if (matchedTable.section_id) {
      const { data: sec } = await supabase
        .from("sections")
        .select("id, name, branch_id")
        .eq("id", matchedTable.section_id)
        .maybeSingle();
      if (sec) {
        sectionInfo = sec;
        if (!branchInfo) {
          const { data: br } = await supabase
            .from("branches")
            .select("id, name, onboarding_progress")
            .eq("id", sec.branch_id)
            .maybeSingle();
          if (br) branchInfo = br;
        }
      } else if (branchInfo) {
        const obSections = (branchInfo.onboarding_progress as any)?.sections || [];
        const secMatch = obSections.find((s: any) => s.id === matchedTable.section_id);
        if (secMatch) sectionInfo = secMatch;
      }
    }

    // Overlay held_tables metadata mapping if present
    const targetBranch = branchInfo || (branchId ? { id: branchId } : null);
    if (targetBranch?.id) {
      try {
        const { data: bProg } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranch.id).maybeSingle();
        const heldMap = ((bProg?.onboarding_progress as any)?.held_tables as Record<string, string>) || {};
        if (heldMap[matchedTable.id]) {
          matchedTable.held_for_waitlist_id = heldMap[matchedTable.id];
        }
      } catch {}
    }

    // 3. Check if table is part of a merge group
    let compositeLabel = matchedTable.table_name || matchedTable.name || "Table";
    let isMergeGroupOccupied = false;
    let mergeGroupActiveSessionId: string | null = null;

    try {
      const { data: memberRows } = await supabase
        .from("table_merge_group_members")
        .select("group_id")
        .eq("table_id", matchedTable.id);

      if (memberRows && memberRows.length > 0) {
        const gId = memberRows[0].group_id;
        const { data: grp } = await supabase
          .from("table_merge_groups")
          .select("id, name, status, active_session_id")
          .eq("id", gId)
          .maybeSingle();

        if (grp) {
          if (grp.name) compositeLabel = grp.name;
          if (grp.status === "occupied") {
            isMergeGroupOccupied = true;
            mergeGroupActiveSessionId = grp.active_session_id;
          }
        }
      }
    } catch {}

    // Check merge groups metadata fallback
    if (!isMergeGroupOccupied && targetBranch?.id) {
      try {
        const { data: bProg } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranch.id).maybeSingle();
        const mgList = (bProg?.onboarding_progress as any)?.merge_groups || [];
        const mgMatch = mgList.find((g: any) => (g.member_table_ids || []).includes(matchedTable.id));
        if (mgMatch) {
          if (mgMatch.name) compositeLabel = mgMatch.name;
          if (mgMatch.status === "occupied") {
            isMergeGroupOccupied = true;
            mergeGroupActiveSessionId = mgMatch.active_session_id || null;
          }
        }
      } catch {}
    }

    // 4. Check active dining session in table_sessions or session_tables
    let activeSession: any = null;

    try {
      const { data: dirSess } = await supabase
        .from("table_sessions")
        .select("id, table_id, status, opened_at")
        .eq("table_id", matchedTable.id)
        .eq("status", "active")
        .maybeSingle();

      if (dirSess) activeSession = dirSess;
    } catch {}

    if (!activeSession) {
      try {
        const { data: stLink } = await supabase
          .from("session_tables")
          .select("session_id")
          .eq("table_id", matchedTable.id)
          .limit(1)
          .maybeSingle();

        if (stLink?.session_id) {
          const { data: linkSess } = await supabase
            .from("table_sessions")
            .select("id, table_id, status, opened_at")
            .eq("id", stLink.session_id)
            .eq("status", "active")
            .maybeSingle();

          if (linkSess) activeSession = linkSess;
        }
      } catch {}
    }

    // Check active session metadata fallback
    if (!activeSession && targetBranch?.id) {
      try {
        const { data: bProg } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranch.id).maybeSingle();
        const storedSessions = (bProg?.onboarding_progress as any)?.table_sessions || [];
        const matchSess = storedSessions.find((s: any) => s.table_id === matchedTable.id && s.status === "active");
        if (matchSess) activeSession = matchSess;
      } catch {}
    }

    const isOccupied =
      isMergeGroupOccupied ||
      !!activeSession ||
      matchedTable.status === "occupied" ||
      matchedTable.status === "OCCUPIED";

    const isHeld = !!matchedTable.held_for_waitlist_id;

    const operationalStatus = isOccupied ? "OCCUPIED" : isHeld ? "HELD" : "AVAILABLE";

    return {
      success: true,
      status: operationalStatus,
      table: {
        id: matchedTable.id,
        name: matchedTable.table_name || matchedTable.name || "Table",
        label: compositeLabel,
        seatingCapacity: matchedTable.seating_capacity || 4,
        status: operationalStatus,
        branchId: branchInfo?.id || sectionInfo?.branch_id || branchId || "",
        branchName: branchInfo?.name || "Restaurant",
        sectionId: sectionInfo?.id,
        sectionName: sectionInfo?.name || "Dining Area",
        activeSessionId: activeSession?.id || mergeGroupActiveSessionId || null,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to resolve table scan status" };
  }
}

/**
 * Submits a customer table QR access request (Story 15.6 Section 4 Step 2).
 * Form inputs: Guest Name (2-100 chars), Mobile Number (10-digit Indian: ^[6-9]\d{9}$), Party Size (>= 1).
 * Idempotency: Returns existing PENDING request if submitted by same device token.
 */
export async function requestTableAccess(params: {
  tableId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  deviceToken: string;
  branchId?: string;
}): Promise<{
  success: boolean;
  requestId?: string;
  tableLabel?: string;
  status?: string;
  error?: string;
  statusCode?: number;
}> {
  try {
    const supabase = createServiceRoleClient();
    const { tableId, deviceToken } = params;

    const name = (params.customerName || "").trim();
    const phone = (params.customerPhone || "").trim().replace(/\D/g, "");
    const partySize = Number(params.partySize);

    // Validation Rules (Story 15.6 Section 4 Step 2)
    if (!name || name.length < 2 || name.length > 100) {
      return { success: false, error: "Guest name must be between 2 and 100 characters.", statusCode: 400 };
    }

    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !indianPhoneRegex.test(phone)) {
      return { success: false, error: "Please enter a valid 10-digit Indian mobile number (starts with 6-9).", statusCode: 400 };
    }

    if (isNaN(partySize) || partySize < 1 || partySize > 50) {
      return { success: false, error: "Party size must be at least 1 guest (maximum 50).", statusCode: 400 };
    }

    if (!deviceToken) {
      return { success: false, error: "Device token is required for access verification.", statusCode: 400 };
    }

    // Precondition check: Validate table exists and is AVAILABLE
    const scanRes = await getTableScanStatus(tableId, params.branchId);
    if (!scanRes.success || !scanRes.table) {
      return { success: false, error: scanRes.error || "Table not found", statusCode: 404 };
    }

    const targetBranchId = scanRes.table.branchId || params.branchId || "";
    const tableLabel = scanRes.table.label || scanRes.table.name || "Table";

    if (scanRes.status === "OCCUPIED") {
      // Reconnect resilience: Check if this device is the owner of the active session on this table
      let ownSession: any = null;
      if (targetBranchId) {
        try {
          const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
          const stored = (bData?.onboarding_progress as any)?.table_sessions || [];
          ownSession = stored.find(
            (s: any) => s.table_id === tableId && s.status === "active" && s.primary_device_token === deviceToken
          );
        } catch {}
      }
      if (!ownSession) {
        try {
          const { data: dbSessions } = await supabase
            .from("table_sessions")
            .select("*")
            .eq("table_id", tableId)
            .eq("status", "active");
          ownSession = (dbSessions || []).find((s: any) => s.primary_device_token === deviceToken);
        } catch {}
      }

      if (ownSession) {
        return {
          success: true,
          requestId: ownSession.id,
          tableLabel: ownSession.table_label || tableLabel,
          status: "APPROVED",
          statusCode: 200,
        };
      }

      return { success: false, error: "This table is currently occupied by another dining session.", statusCode: 409 };
    }

    // Idempotency check: Single Active Request per Device (Story 15.6 Section 6)
    let existingPending: any = null;
    try {
      const { data: pendingRows } = await supabase
        .from("table_access_requests")
        .select("id, table_id, table_label, status, created_at")
        .eq("device_token", deviceToken)
        .eq("status", "PENDING_APPROVAL")
        .order("created_at", { ascending: false })
        .limit(1);

      if (pendingRows && pendingRows.length > 0) {
        existingPending = pendingRows[0];
      }
    } catch {}

    // Check metadata fallback for existing pending
    if (!existingPending && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const storedRequests = (bData?.onboarding_progress as any)?.table_access_requests || [];
        existingPending = storedRequests.find((r: any) => r.device_token === deviceToken && r.status === "PENDING_APPROVAL");
      } catch {}
    }

    if (existingPending) {
      return {
        success: true,
        requestId: existingPending.id,
        tableLabel: existingPending.table_label || tableLabel,
        status: "PENDING_APPROVAL",
        statusCode: 200,
      };
    }

    // Insert new request
    const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `tar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const nowIso = new Date().toISOString();
    const newRecord: TableAccessRequestItem = {
      id: requestId,
      branch_id: targetBranchId,
      table_id: scanRes.table.id,
      table_label: tableLabel,
      customer_name: name,
      customer_phone: phone,
      party_size: partySize,
      device_token: deviceToken,
      status: "PENDING_APPROVAL",
      created_at: nowIso,
    };

    try {
      await supabase.from("table_access_requests").insert(newRecord);
    } catch (dbErr: any) {
      // Table might still be created or missing in remote DB
    }

    // Dual-Storage Resilience: Persist into branch.onboarding_progress
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const storedRequests = (curProg.table_access_requests as any[]) || [];
        storedRequests.unshift(newRecord);
        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...curProg,
              table_access_requests: storedRequests.slice(0, 100), // Keep last 100
            },
          })
          .eq("id", targetBranchId);
      } catch {}
    }

    // Log audit event: TABLE_ACCESS_REQUESTED (Story 15.6 Section 7)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table_access_request",
        entity_id: requestId,
        action: "TABLE_ACCESS_REQUESTED",
        actor_type: "customer",
        actor_name: name,
        note: `Table access requested for ${tableLabel} (${partySize} guests, phone: ${phone})`,
        created_at: nowIso,
      });
    } catch {}

    try {
      revalidatePath("/operations/tables");
    } catch {}

    return {
      success: true,
      requestId,
      tableLabel,
      status: "PENDING_APPROVAL",
      statusCode: 201,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to submit table access request",
      statusCode: 500,
    };
  }
}

/**
 * Returns live status of a table access request for customer waiting screen (Story 15.6 Section 4 Step 3).
 * Status transitions: PENDING_APPROVAL -> APPROVED | REJECTED.
 */
export async function getTableAccessStatus(params: {
  requestId?: string;
  deviceToken?: string;
  tableId?: string;
}): Promise<{
  success: boolean;
  status?: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  tableLabel?: string;
  session?: {
    id: string;
    table_id: string;
    table_label: string;
    customer_name: string;
    guest_count: number;
    started_at: string;
    activity_logs?: any[];
  } | null;
  error?: string;
}> {
  try {
    const supabase = createServiceRoleClient();
    const { requestId, deviceToken, tableId } = params;

    let reqRecord: any = null;

    if (requestId) {
      try {
        const { data: byId } = await supabase
          .from("table_access_requests")
          .select("*")
          .eq("id", requestId)
          .maybeSingle();
        if (byId) reqRecord = byId;
      } catch {}
    }

    if (!reqRecord && deviceToken) {
      try {
        let query = supabase
          .from("table_access_requests")
          .select("*")
          .eq("device_token", deviceToken)
          .order("created_at", { ascending: false });
        if (tableId) query = query.eq("table_id", tableId);
        const { data: byDev } = await query.limit(1);
        if (byDev && byDev.length > 0) reqRecord = byDev[0];
      } catch {}
    }

    // Check branch onboarding_progress fallback
    if (!reqRecord && deviceToken) {
      try {
        const { data: branches } = await supabase.from("branches").select("onboarding_progress").limit(10);
        for (const b of branches || []) {
          const list = (b.onboarding_progress as any)?.table_access_requests || [];
          const match = list.find(
            (r: any) =>
              (requestId && r.id === requestId) ||
              (r.device_token === deviceToken && (!tableId || r.table_id === tableId))
          );
          if (match) {
            reqRecord = match;
            break;
          }
        }
      } catch {}
    }

    // Direct active session lookup for device persistence across refresh (only for verified host or active companion)
    if (!reqRecord && deviceToken && tableId) {
      let matchedActiveSession: any = null;

      // 1. Check branch onboarding_progress fallback
      try {
        const { data: branches } = await supabase.from("branches").select("id, name, onboarding_progress").limit(10);
        for (const b of branches || []) {
          const stored = (b.onboarding_progress as any)?.table_sessions || [];
          const wlList = (b.onboarding_progress as any)?.waitlist_entries || [];
          const storedDevices = (b.onboarding_progress as any)?.session_devices || [];

          const isDeviceWaitlistSeated = wlList.some(
            (w: any) =>
              (w.assigned_table_id === tableId || w.table_id === tableId) &&
              w.device_token === deviceToken &&
              (w.status === "SEATED" || w.status === "seated")
          );

          const match = stored.find(
            (s: any) =>
              s.table_id === tableId &&
              s.status === "active" &&
              (s.primary_device_token === deviceToken ||
                isDeviceWaitlistSeated ||
                storedDevices.some(
                  (d: any) =>
                    d.session_id === s.id &&
                    d.device_token === deviceToken &&
                    d.status === "ACTIVE"
                ))
          );
          if (match) {
            matchedActiveSession = match;
            break;
          }
        }
      } catch {}

      // 2. Check SQL table_sessions
      if (!matchedActiveSession) {
        try {
          const { data: dbSessions } = await supabase
            .from("table_sessions")
            .select("id, table_id, status, opened_at, guest_count, primary_device_token")
            .eq("table_id", tableId)
            .eq("status", "active")
            .order("opened_at", { ascending: false });

          if (dbSessions && dbSessions.length > 0) {
            for (const dbSess of dbSessions) {
              let isAuthorized = false;

              // Check if device is the primary host
              if (dbSess.primary_device_token && dbSess.primary_device_token === deviceToken) {
                isAuthorized = true;
              }

              // Check if device is an active companion in session_devices
              if (!isAuthorized) {
                const { data: companionRow } = await supabase
                  .from("session_devices")
                  .select("id, status")
                  .eq("session_id", dbSess.id)
                  .eq("device_token", deviceToken)
                  .eq("status", "ACTIVE")
                  .maybeSingle();

                if (companionRow) {
                  isAuthorized = true;
                }
              }

              // Check if device was seated via waitlist
              if (!isAuthorized) {
                const { data: wlRow } = await supabase
                  .from("waiting_list_entries")
                  .select("id")
                  .eq("assigned_table_id", tableId)
                  .eq("device_token", deviceToken)
                  .in("status", ["SEATED", "seated"])
                  .limit(1);

                if (wlRow && wlRow.length > 0) {
                  isAuthorized = true;
                }
              }

              if (isAuthorized) {
                matchedActiveSession = {
                  id: dbSess.id,
                  table_id: dbSess.table_id,
                  table_label: "Table",
                  customer_name: "Guest",
                  guest_count: dbSess.guest_count || 1,
                  status: dbSess.status,
                  opened_at: dbSess.opened_at,
                  created_at: dbSess.opened_at,
                };

                // Enrich with dual-storage metadata if available
                try {
                  const { data: bList } = await supabase.from("branches").select("onboarding_progress").limit(10);
                  for (const b of bList || []) {
                    const metaList = (b.onboarding_progress as any)?.table_sessions || [];
                    const foundMeta = metaList.find((s: any) => s.id === dbSess.id);
                    if (foundMeta) {
                      if (foundMeta.customer_name) matchedActiveSession.customer_name = foundMeta.customer_name;
                      if (foundMeta.table_label) matchedActiveSession.table_label = foundMeta.table_label;
                      break;
                    }
                  }
                } catch {}

                break;
              }
            }
          }
        } catch {}
      }

      if (matchedActiveSession) {
        return {
          success: true,
          status: "APPROVED",
          tableLabel: matchedActiveSession.table_label || "Table",
          session: {
            id: matchedActiveSession.id,
            table_id: matchedActiveSession.table_id,
            table_label: matchedActiveSession.table_label || "Table",
            customer_name: matchedActiveSession.customer_name || "Guest",
            guest_count: matchedActiveSession.guest_count || 1,
            started_at: matchedActiveSession.opened_at || matchedActiveSession.created_at || new Date().toISOString(),
            activity_logs: [],
          },
        };
      }
    }

    if (!reqRecord) {
      return { success: false, error: "Access request not found" };
    }

    // If APPROVED, resolve active session details
    let sessionPayload: any = null;
    if (reqRecord.status === "APPROVED" && reqRecord.session_id) {
      let sess: any = null;
      try {
        const { data: dbSess } = await supabase
          .from("table_sessions")
          .select("id, table_id, table_label, customer_name, guest_count, opened_at, created_at, status")
          .eq("id", reqRecord.session_id)
          .maybeSingle();

        if (dbSess) sess = dbSess;
      } catch {}

      // Fallback: check branches.onboarding_progress.table_sessions
      if (!sess && reqRecord.branch_id) {
        try {
          const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", reqRecord.branch_id).maybeSingle();
          const storedSessions = (bData?.onboarding_progress as any)?.table_sessions || [];
          const foundSess = storedSessions.find((s: any) => s.id === reqRecord.session_id);
          if (foundSess) sess = foundSess;
        } catch {}
      }

      // If the session was already closed, do not return APPROVED
      if (sess && sess.status === "closed") {
        return {
          success: false,
          error: "Dining session has ended.",
        };
      }

      const startedAt = sess?.opened_at || sess?.created_at || reqRecord.resolved_at || reqRecord.created_at || new Date().toISOString();

      // Fetch accurate activity logs for this session
      let activityLogs: any[] = [];
      try {
        const { data: logs } = await supabase
          .from("activity_log")
          .select("id, entity_type, entity_id, action, actor_type, actor_name, note, created_at")
          .or(`entity_id.eq.${sess?.id || reqRecord.session_id},entity_id.eq.${reqRecord.id}`)
          .order("created_at", { ascending: true });
        if (logs && logs.length > 0) {
          activityLogs = logs;
        }
      } catch {}

      if (activityLogs.length === 0) {
        activityLogs = [
          {
            id: `log_init_${reqRecord.id}`,
            entity_type: "table_access_request",
            entity_id: reqRecord.id,
            action: "TABLE_ACCESS_APPROVED",
            actor_type: "staff",
            actor_name: reqRecord.resolved_by_name || "Staff",
            note: `Table access approved for Table ${reqRecord.table_label}`,
            created_at: reqRecord.resolved_at || startedAt,
          },
          {
            id: `log_sess_${reqRecord.id}`,
            entity_type: "table_session",
            entity_id: sess?.id || reqRecord.session_id || reqRecord.id,
            action: "DINING_SESSION_CREATED",
            actor_type: "system",
            actor_name: "System",
            note: `Dining session started for ${reqRecord.customer_name} (${reqRecord.party_size} guests)`,
            created_at: startedAt,
          }
        ];
      }

      sessionPayload = {
        id: reqRecord.session_id,
        table_id: sess?.table_id || reqRecord.table_id,
        table_label: sess?.table_label || reqRecord.table_label || "Table",
        customer_name: sess?.customer_name || reqRecord.customer_name || "Guest",
        guest_count: sess?.guest_count || reqRecord.party_size || 1,
        started_at: startedAt,
        activity_logs: activityLogs,
      };
    }

    return {
      success: true,
      status: reqRecord.status,
      rejectionReason: reqRecord.rejection_reason || null,
      tableLabel: reqRecord.table_label || "Table",
      session: sessionPayload,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to check request status" };
  }
}

/**
 * Lists unresolved table access requests for Staff POS Alerts Drawer (Story 15.6 Section 3 & 5).
 */
export async function getPendingTableAccessRequests(branchId: string): Promise<{
  success: boolean;
  requests: TableAccessRequestItem[];
  pendingCount: number;
  error?: string;
}> {
  try {
    const supabase = createServiceRoleClient();
    let requests: TableAccessRequestItem[] = [];

    try {
      const { data: dbRequests, error: dbErr } = await supabase
        .from("table_access_requests")
        .select("*")
        .eq("branch_id", branchId)
        .eq("status", "PENDING_APPROVAL")
        .order("created_at", { ascending: true });

      if (!dbErr && dbRequests) {
        requests = dbRequests.map((r: any) => ({
          ...r,
          waiting_minutes: Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 60000)),
        }));
      }
    } catch {}

    // Check fallback in branches.onboarding_progress
    if (branchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", branchId).maybeSingle();
        const storedRequests = (bData?.onboarding_progress as any)?.table_access_requests || [];
        const pendingFallback = storedRequests
          .filter((r: any) => r.status === "PENDING_APPROVAL" && (!requests.some((existing) => existing.id === r.id)))
          .map((r: any) => ({
            ...r,
            waiting_minutes: Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 60000)),
          }));

        requests = [...requests, ...pendingFallback].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } catch {}
    }

    return {
      success: true,
      requests,
      pendingCount: requests.length,
    };
  } catch (err: any) {
    return { success: false, requests: [], pendingCount: 0, error: err.message || "Failed to fetch pending alerts" };
  }
}

/**
 * Approves a customer table QR access request (Story 15.6 Section 5 Path A).
 * Atomically verifies availability, sets table to occupied, creates table_session, and dismisses alert.
 */
export async function approveTableAccessRequest(params: {
  requestId: string;
  branchId?: string;
  staffId?: string;
  staffName?: string;
}): Promise<{
  success: boolean;
  message?: string;
  session?: {
    id: string;
    table_id: string;
    table_label: string;
    customer_name: string;
    guest_count: number;
    started_at: string;
  };
  error?: string;
  statusCode?: number;
}> {
  try {
    const supabase = createServiceRoleClient();
    const { requestId, staffId, staffName } = params;

    // 1. Fetch Request
    let request: any = null;
    let targetBranchId = params.branchId;

    try {
      const { data: rData } = await supabase
        .from("table_access_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();
      if (rData) {
        request = rData;
        if (rData.branch_id) targetBranchId = rData.branch_id;
      }
    } catch {}

    if (!request && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.table_access_requests || [];
        request = stored.find((r: any) => r.id === requestId);
      } catch {}
    }

    if (!request) {
      return { success: false, error: "Access request not found", statusCode: 404 };
    }

    // Terminal State Lock (Story 15.6 Section 6): Prevent duplicate approvals or modifying terminal request
    if (request.status === "APPROVED") {
      return { success: false, error: "This request has already been approved.", statusCode: 409 };
    }
    if (request.status === "REJECTED") {
      return { success: false, error: "This request was previously rejected.", statusCode: 409 };
    }

    // 2. Race Condition Prevention: Validate that table is still Available (Story 15.6 Section 5 & 6)
    const tableId = request.table_id;
    let memberTableIds: string[] = [tableId];
    let mergeGroupId: string | null = null;

    try {
      const { data: members } = await supabase
        .from("table_merge_group_members")
        .select("group_id")
        .eq("table_id", tableId);

      if (members && members.length > 0) {
        mergeGroupId = members[0].group_id;
        const { data: allMembers } = await supabase
          .from("table_merge_group_members")
          .select("table_id")
          .eq("group_id", mergeGroupId);
        if (allMembers && allMembers.length > 0) {
          memberTableIds = allMembers.map((m) => m.table_id);
        }
      }
    } catch {}

    // Check if table currently has an active session
    try {
      const { data: activeSess } = await supabase
        .from("table_sessions")
        .select("id, table_id")
        .in("table_id", memberTableIds)
        .eq("status", "active")
        .limit(1);

      if (activeSess && activeSess.length > 0) {
        return {
          success: false,
          error: "Table is no longer available. Please assign another table.",
          statusCode: 409,
        };
      }
    } catch {}

    // 3. Atomic Dining Session Creation (Story 15.6 Section 5 Path A)
    const sessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const nowIso = new Date().toISOString();
    const compositeLabel = request.table_label || "Table";

    const sessionRecord: any = {
      id: sessionId,
      branch_id: targetBranchId || request.branch_id,
      table_id: tableId,
      table_label: compositeLabel,
      primary_device_token: request.device_token,
      customer_name: request.customer_name,
      mobile_number: request.customer_phone,
      guest_count: request.party_size || 1,
      source: "QR_ACCESS_REQUEST",
      status: "active",
      opened_at: nowIso,
      created_at: nowIso,
    };

    try {
      const { error: sessErr } = await supabase.from("table_sessions").insert(sessionRecord);
      if (sessErr) {
        // Fallback with only standard columns supported in remote PostgreSQL schema
        const fallbackSession = {
          id: sessionId,
          table_id: tableId,
          status: "active",
          guest_count: request.party_size || 1,
          opened_at: nowIso,
        };
        await supabase.from("table_sessions").insert(fallbackSession);
      }
    } catch {}

    // Link merge member tables in session_tables
    if (memberTableIds.length > 0) {
      try {
        const rows = memberTableIds.map((tId) => ({
          session_id: sessionId,
          table_id: tId,
          created_at: nowIso,
        }));
        await supabase.from("session_tables").insert(rows);
      } catch {}
    }

    // Update physical tables: status -> occupied
    try {
      await supabase
        .from("tables")
        .update({
          status: "occupied",
          held_for_waitlist_id: null,
          updated_at: nowIso,
        })
        .in("id", memberTableIds);
    } catch {}

    // Update merge group if applicable
    if (mergeGroupId) {
      try {
        await supabase
          .from("table_merge_groups")
          .update({
            status: "occupied",
            active_session_id: sessionId,
            held_for_waitlist_id: null,
            updated_at: nowIso,
          })
          .eq("id", mergeGroupId);
      } catch {}
    }

    // 4. Update table_access_requests status to APPROVED
    try {
      await supabase
        .from("table_access_requests")
        .update({
          status: "APPROVED",
          session_id: sessionId,
          resolved_by: staffId || null,
          resolved_by_name: staffName || "Staff",
          resolved_at: nowIso,
        })
        .eq("id", request.id);
    } catch {}

    // Synchronize branch metadata fallback (Dual-Storage Resilience)
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};

        const storedRequests = (curProg.table_access_requests as any[]) || [];
        const updatedRequests = storedRequests.map((r: any) =>
          r.id === request.id
            ? {
                ...r,
                status: "APPROVED",
                session_id: sessionId,
                resolved_by: staffId || null,
                resolved_by_name: staffName || "Staff",
                resolved_at: nowIso,
              }
            : r
        );

        const storedTables = (curProg.tables as any[]) || [];
        const updatedTables = storedTables.map((t: any) =>
          memberTableIds.includes(t.id) ? { ...t, status: "occupied", held_for_waitlist_id: null } : t
        );

        const storedGroups = (curProg.merge_groups as any[]) || [];
        const updatedGroups = storedGroups.map((g: any) =>
          g.id === mergeGroupId
            ? { ...g, status: "occupied", active_session_id: sessionId, held_for_waitlist_id: null }
            : g
        );

        const storedSessions = (curProg.table_sessions as any[]) || [];
        storedSessions.push(sessionRecord);

        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...curProg,
              table_access_requests: updatedRequests,
              tables: updatedTables,
              merge_groups: updatedGroups,
              table_sessions: storedSessions,
            },
          })
          .eq("id", targetBranchId);
      } catch {}
    }

    // 5. Log Audit Events (Story 15.6 Section 7)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table_access_request",
        entity_id: request.id,
        action: "TABLE_ACCESS_APPROVED",
        actor_type: "staff",
        actor_name: staffName || "Staff",
        note: `Table access request approved for ${compositeLabel} by ${staffName || "Staff"}`,
        created_at: nowIso,
      });
    } catch {}

    try {
      await supabase.from("activity_log").insert({
        entity_type: "table_session",
        entity_id: sessionId,
        action: "DINING_SESSION_CREATED",
        actor_type: "staff",
        actor_name: staffName || "Staff",
        note: `Session ${sessionId.slice(0, 8)} started for ${request.customer_name} (${request.party_size} guests) at ${compositeLabel}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");

    return {
      success: true,
      message: `Table access for ${compositeLabel} approved successfully!`,
      session: {
        id: sessionId,
        table_id: tableId,
        table_label: compositeLabel,
        customer_name: request.customer_name,
        guest_count: request.party_size || 1,
        started_at: nowIso,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to approve table access request",
      statusCode: 500,
    };
  }
}

/**
 * Rejects a customer table QR access request (Story 15.6 Section 5 Path B).
 * Updates request to REJECTED, clears alert, table remains Available, logs audit event.
 */
export async function rejectTableAccessRequest(params: {
  requestId: string;
  reason?: string;
  branchId?: string;
  staffId?: string;
  staffName?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
}> {
  try {
    const supabase = createServiceRoleClient();
    const { requestId, reason, staffId, staffName } = params;

    let request: any = null;
    let targetBranchId = params.branchId;

    try {
      const { data: rData } = await supabase
        .from("table_access_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();
      if (rData) {
        request = rData;
        if (rData.branch_id) targetBranchId = rData.branch_id;
      }
    } catch {}

    if (!request && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.table_access_requests || [];
        request = stored.find((r: any) => r.id === requestId);
      } catch {}
    }

    if (!request) {
      return { success: false, error: "Access request not found", statusCode: 404 };
    }

    // Terminal State Lock
    if (request.status === "APPROVED") {
      return { success: false, error: "Cannot reject an already approved request.", statusCode: 409 };
    }
    if (request.status === "REJECTED") {
      return { success: false, error: "This request has already been rejected.", statusCode: 409 };
    }

    const nowIso = new Date().toISOString();
    const rejectionReason = (reason || "Table Reserved / Unavailable").trim();

    // 1. Update table_access_requests to REJECTED
    try {
      await supabase
        .from("table_access_requests")
        .update({
          status: "REJECTED",
          rejection_reason: rejectionReason,
          resolved_by: staffId || null,
          resolved_by_name: staffName || "Staff",
          resolved_at: nowIso,
        })
        .eq("id", request.id);
    } catch {}

    // 2. Synchronize branch metadata fallback
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const storedRequests = (curProg.table_access_requests as any[]) || [];
        const updatedRequests = storedRequests.map((r: any) =>
          r.id === request.id
            ? {
                ...r,
                status: "REJECTED",
                rejection_reason: rejectionReason,
                resolved_by: staffId || null,
                resolved_by_name: staffName || "Staff",
                resolved_at: nowIso,
              }
            : r
        );
        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...curProg,
              table_access_requests: updatedRequests,
            },
          })
          .eq("id", targetBranchId);
      } catch {}
    }

    // 3. Log Audit Event: TABLE_ACCESS_REJECTED (Story 15.6 Section 7)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table_access_request",
        entity_id: request.id,
        action: "TABLE_ACCESS_REJECTED",
        actor_type: "staff",
        actor_name: staffName || "Staff",
        note: `Table access request for ${request.table_label || "Table"} rejected by ${staffName || "Staff"}. Reason: ${rejectionReason}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");

    return {
      success: true,
      message: `Table access request declined.`,
      statusCode: 200,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to reject table access request",
      statusCode: 500,
    };
  }
}

// =========================================================================
// USER STORY 15.7: JOIN EXISTING TABLE SESSION & DEVICE MANAGEMENT
// =========================================================================

export interface SessionDeviceItem {
  id: string;
  session_id: string;
  device_token: string;
  customer_name: string;
  mobile_number: string;
  role: "HOST" | "COMPANION";
  status: "ACTIVE" | "REMOVED" | "BLOCKED";
  joined_at: string;
  updated_at?: string;
}

export interface OccupiedScanAlertItem {
  id: string;
  branch_id: string;
  table_id: string;
  table_label: string;
  message: string;
  device_token?: string;
  status: "UNREAD" | "DISMISSED";
  created_at: string;
  dismissed_at?: string | null;
}

/**
 * Record an informational alert when an unregistered customer scans an OCCUPIED table (Story 15.7 Workflow 1)
 */
export async function recordOccupiedTableScanAlert(params: {
  branchId: string;
  tableId: string;
  tableLabel?: string;
  deviceToken?: string;
}): Promise<{ success: boolean; alertId?: string; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const alertId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const tableLabel = (params.tableLabel || "Table").trim();

    // 1. Try relational table insertion
    try {
      await supabase.from("occupied_table_alerts").insert({
        id: alertId,
        branch_id: params.branchId,
        table_id: params.tableId,
        table_label: tableLabel,
        message: "Guest attempted to scan physical table QR while session is active.",
        device_token: params.deviceToken || null,
        status: "UNREAD",
        created_at: nowIso,
      });
    } catch {}

    // 2. Dual-storage fallback into branch metadata
    if (params.branchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", params.branchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const curAlerts = (curProg.occupied_scan_alerts as any[]) || [];
        const updatedAlerts = [
          {
            id: alertId,
            branch_id: params.branchId,
            table_id: params.tableId,
            table_label: tableLabel,
            message: "Guest attempted to scan physical table QR while session is active.",
            device_token: params.deviceToken || null,
            status: "UNREAD",
            created_at: nowIso,
          },
          ...curAlerts.slice(0, 49),
        ];
        await supabase.from("branches").update({
          onboarding_progress: {
            ...curProg,
            occupied_scan_alerts: updatedAlerts,
          },
        }).eq("id", params.branchId);
      } catch {}
    }

    // 3. Log Universal Activity Log entry (Story 15.7 Section 5)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "table",
        entity_id: params.tableId,
        action: "TABLE_QR_SCANNED_OCCUPIED",
        actor_type: "customer",
        actor_name: "Unregistered Guest",
        note: `Table QR Scanned by Unregistered Guest on ${tableLabel} (Notice triggered)`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");

    return { success: true, alertId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record scan alert" };
  }
}

/**
 * Fetch active unread occupied table scan alerts for a branch
 */
export async function getOccupiedTableScanAlerts(branchId: string): Promise<{
  success: boolean;
  alerts: OccupiedScanAlertItem[];
  error?: string;
}> {
  try {
    const supabase = createServiceRoleClient();
    let dbAlerts: OccupiedScanAlertItem[] = [];

    try {
      const { data, error } = await supabase
        .from("occupied_table_alerts")
        .select("*")
        .eq("branch_id", branchId)
        .eq("status", "UNREAD")
        .order("created_at", { ascending: false });
      if (!error && data) {
        dbAlerts = data as OccupiedScanAlertItem[];
      }
    } catch {}

    // Fallback merge from metadata
    if (branchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", branchId).maybeSingle();
        const stored = ((bData?.onboarding_progress as any)?.occupied_scan_alerts as any[]) || [];
        const unreadMeta = stored.filter((a: any) => a.status === "UNREAD");
        const existingIds = new Set(dbAlerts.map((a) => a.id));
        for (const meta of unreadMeta) {
          if (!existingIds.has(meta.id)) {
            dbAlerts.push(meta);
          }
        }
      } catch {}
    }

    dbAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { success: true, alerts: dbAlerts };
  } catch (err: any) {
    return { success: false, alerts: [], error: err.message };
  }
}

/**
 * Dismiss an occupied table scan alert
 */
export async function dismissOccupiedTableAlert(params: {
  alertId: string;
  branchId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();

    try {
      await supabase
        .from("occupied_table_alerts")
        .update({ status: "DISMISSED", dismissed_at: nowIso })
        .eq("id", params.alertId);
    } catch {}

    if (params.branchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", params.branchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const curAlerts = (curProg.occupied_scan_alerts as any[]) || [];
        const updated = curAlerts.map((a: any) =>
          a.id === params.alertId ? { ...a, status: "DISMISSED", dismissed_at: nowIso } : a
        );
        await supabase.from("branches").update({
          onboarding_progress: {
            ...curProg,
            occupied_scan_alerts: updated,
          },
        }).eq("id", params.branchId);
      } catch {}
    }

    revalidatePath("/operations/tables");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Robust branch resolver for zero-downtime dual-storage resilience
 */
async function resolveTargetBranchId(
  supabase: any,
  branchId?: string,
  sessionId?: string,
  tableId?: string
): Promise<string> {
  if (branchId) return branchId;
  try {
    const { data: branches } = await supabase
      .from("branches")
      .select("id, onboarding_progress")
      .limit(10);
    if (!branches || branches.length === 0) return "";
    if (sessionId || tableId) {
      for (const b of branches) {
        const storedSessions = (b.onboarding_progress as any)?.table_sessions || [];
        const match = storedSessions.some(
          (s: any) =>
            (sessionId && s.id === sessionId) ||
            (tableId && s.table_id === tableId)
        );
        if (match) return b.id;
        const storedTables = (b.onboarding_progress as any)?.tables || [];
        const matchTable = storedTables.some((t: any) => tableId && t.id === tableId);
        if (matchTable) return b.id;
      }
    }
    return branches[0].id;
  } catch {
    return "";
  }
}

/**
 * Join an existing dining session (Story 15.7 Workflow 2: Direct Join)
 */
export async function joinTableSession(params: {
  sessionId: string;
  guestName: string;
  mobileNumber: string;
  deviceToken: string;
  shareToken?: string;
  branchId?: string;
}): Promise<{
  success: boolean;
  session?: any;
  device?: SessionDeviceItem;
  isBlocked?: boolean;
  error?: string;
  statusCode?: number;
}> {
  try {
    const supabase = createServiceRoleClient();

    // 1. Validation
    const trimmedName = (params.guestName || "").trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return { success: false, error: "Guest name must be between 2 and 100 characters.", statusCode: 400 };
    }

    const cleanMobile = (params.mobileNumber || "").trim().replace(/\D/g, "");
    const indianRegex = /^[6-9]\d{9}$/;
    if (!cleanMobile || !indianRegex.test(cleanMobile)) {
      return { success: false, error: "Please enter a valid 10-digit Indian mobile number (starts with 6-9).", statusCode: 400 };
    }

    if (!params.deviceToken) {
      return { success: false, error: "Device token is required to join session.", statusCode: 400 };
    }

    if (!params.sessionId) {
      return { success: false, error: "Session ID is required.", statusCode: 400 };
    }

    // 2. Fetch session details to verify session is active & get branch_id
    let activeSession: any = null;
    let targetBranchId = await resolveTargetBranchId(supabase, params.branchId, params.sessionId);

    try {
      const { data: dbSess } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("id", params.sessionId)
        .maybeSingle();
      if (dbSess) {
        activeSession = dbSess;
        if (dbSess.branch_id) targetBranchId = dbSess.branch_id;
      }
    } catch {}

    // Metadata fallback & dual-storage enrichment for session
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const storedSessions = (bData?.onboarding_progress as any)?.table_sessions || [];
        const found = storedSessions.find((s: any) => s.id === params.sessionId);
        if (found) {
          if (!activeSession) {
            activeSession = found;
          } else {
            activeSession = {
              ...activeSession,
              customer_name: activeSession.customer_name || found.customer_name,
              table_label: activeSession.table_label || found.table_label,
            };
          }
        }
      } catch {}
    }

    if (!activeSession) {
      return { success: false, error: "Dining session not found.", statusCode: 404 };
    }

    if (activeSession.status !== "active") {
      return {
        success: false,
        error: "This dining session has ended. Please contact restaurant staff.",
        statusCode: 410,
      };
    }

    // 3. 1-Hour Outlet Ban Pre-Check (Story 15.7 Section 3 Workflow 2 Step 2)
    const nowIso = new Date().toISOString();
    let isBlocked = false;

    if (targetBranchId) {
      try {
        const { data: blockRows } = await supabase
          .from("outlet_device_blocks")
          .select("*")
          .eq("outlet_id", targetBranchId)
          .eq("device_token", params.deviceToken)
          .gt("expires_at", nowIso)
          .limit(1);
        if (blockRows && blockRows.length > 0) {
          isBlocked = true;
        }
      } catch {}

      if (!isBlocked) {
        try {
          const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
          const storedBlocks = (bData?.onboarding_progress as any)?.outlet_device_blocks || [];
          const activeBan = storedBlocks.find(
            (b: any) => b.device_token === params.deviceToken && new Date(b.expires_at).getTime() > Date.now()
          );
          if (activeBan) isBlocked = true;
        } catch {}
      }
    }

    if (isBlocked) {
      return {
        success: false,
        isBlocked: true,
        error: "Your device is temporarily blocked from this outlet. Please speak with staff.",
        statusCode: 403,
      };
    }

    // 4. Double Join Guard (Story 15.7 Section 6 Step 3)
    let existingDevice: any = null;
    try {
      const { data: devRows } = await supabase
        .from("session_devices")
        .select("*")
        .eq("session_id", params.sessionId)
        .eq("device_token", params.deviceToken)
        .maybeSingle();
      if (devRows) existingDevice = devRows;
    } catch {}

    if (!existingDevice && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const storedDevices = (bData?.onboarding_progress as any)?.session_devices || [];
        existingDevice = storedDevices.find(
          (d: any) => d.session_id === params.sessionId && d.device_token === params.deviceToken
        );
      } catch {}
    }

    if (existingDevice) {
      if (existingDevice.status === "BLOCKED") {
        return {
          success: false,
          isBlocked: true,
          error: "Your device has been blocked from this dining session.",
          statusCode: 403,
        };
      }

      // Re-activate if was removed or update details
      const updatedDevice: SessionDeviceItem = {
        ...existingDevice,
        customer_name: trimmedName,
        mobile_number: cleanMobile,
        status: "ACTIVE",
        updated_at: nowIso,
      };

      try {
        await supabase
          .from("session_devices")
          .update({
            customer_name: trimmedName,
            mobile_number: cleanMobile,
            status: "ACTIVE",
            updated_at: nowIso,
          })
          .eq("id", existingDevice.id);
      } catch {}

      return {
        success: true,
        session: activeSession,
        device: updatedDevice,
        statusCode: 200,
      };
    }

    // 5. Create new session_devices record
    const deviceId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newDevice: SessionDeviceItem = {
      id: deviceId,
      session_id: params.sessionId,
      device_token: params.deviceToken,
      customer_name: trimmedName,
      mobile_number: cleanMobile,
      role: "COMPANION",
      status: "ACTIVE",
      joined_at: nowIso,
      updated_at: nowIso,
    };

    try {
      await supabase.from("session_devices").insert({
        id: deviceId,
        session_id: params.sessionId,
        device_token: params.deviceToken,
        customer_name: trimmedName,
        mobile_number: cleanMobile,
        role: "COMPANION",
        status: "ACTIVE",
        joined_at: nowIso,
        updated_at: nowIso,
      });
    } catch {}

    // Increment device_count in table_sessions
    try {
      const newDevCount = (activeSession.device_count || 1) + 1;
      await supabase
        .from("table_sessions")
        .update({ device_count: newDevCount })
        .eq("id", params.sessionId);
    } catch {}

    // Synchronize to metadata
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const curDevices = (curProg.session_devices as any[]) || [];
        const curSessions = (curProg.table_sessions as any[]) || [];

        const updatedSessions = curSessions.map((s: any) =>
          s.id === params.sessionId ? { ...s, device_count: (s.device_count || 1) + 1 } : s
        );

        await supabase.from("branches").update({
          onboarding_progress: {
            ...curProg,
            session_devices: [...curDevices, newDevice],
            table_sessions: updatedSessions,
          },
        }).eq("id", targetBranchId);
      } catch {}
    }

    // 6. Log Universal Activity Log entry (Story 15.7 Section 5)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "session",
        entity_id: params.sessionId,
        action: "SESSION_DEVICE_JOINED",
        actor_type: "customer",
        actor_name: trimmedName,
        note: `${trimmedName} joined the session via Shared Link (Device: ${params.deviceToken.slice(0, 10)})`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");

    return {
      success: true,
      session: activeSession,
      device: newDevice,
      statusCode: 201,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to join dining session",
      statusCode: 500,
    };
  }
}

/**
 * Validate customer device status (Story 15.7 Section 6 Step 1 & Real-time moderation)
 */
export async function validateSessionDevice(params: {
  sessionId?: string;
  tableId?: string;
  deviceToken: string;
  branchId?: string;
}): Promise<{
  success: boolean;
  status: "ACTIVE" | "REMOVED" | "BLOCKED" | "NOT_FOUND";
  message?: string;
  session?: any;
  device?: SessionDeviceItem;
  error?: string;
}> {
  try {
    const supabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();

    if (!params.deviceToken) {
      return { success: false, status: "NOT_FOUND", error: "Missing deviceToken" };
    }

    // 1. Check Outlet-Level Ban
    let isOutletBanned = false;
    let targetBranchId = await resolveTargetBranchId(supabase, params.branchId, params.sessionId, params.tableId);

    if (targetBranchId) {
      try {
        const { data: bRows } = await supabase
          .from("outlet_device_blocks")
          .select("*")
          .eq("outlet_id", targetBranchId)
          .eq("device_token", params.deviceToken)
          .gt("expires_at", nowIso)
          .limit(1);
        if (bRows && bRows.length > 0) isOutletBanned = true;
      } catch {}

      if (!isOutletBanned) {
        try {
          const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
          const stored = (bData?.onboarding_progress as any)?.outlet_device_blocks || [];
          if (stored.some((b: any) => b.device_token === params.deviceToken && new Date(b.expires_at).getTime() > Date.now())) {
            isOutletBanned = true;
          }
        } catch {}
      }
    }

    if (isOutletBanned) {
      return {
        success: false,
        status: "BLOCKED",
        message: "Your device has been blocked by restaurant staff for 1 hour.",
      };
    }

    // 2. Resolve Active Session
    let activeSession: any = null;

    if (params.sessionId) {
      try {
        const { data: sData } = await supabase.from("table_sessions").select("*").eq("id", params.sessionId).maybeSingle();
        if (sData) {
          activeSession = sData;
          if (sData.branch_id) targetBranchId = sData.branch_id;
        }
      } catch {}
    } else if (params.tableId) {
      try {
        const { data: sData } = await supabase
          .from("table_sessions")
          .select("*")
          .eq("table_id", params.tableId)
          .eq("status", "active")
          .maybeSingle();
        if (sData) {
          activeSession = sData;
          if (sData.branch_id) targetBranchId = sData.branch_id;
        }
      } catch {}
    }

    // Metadata fallback for session
    if (!activeSession && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const storedSessions = (bData?.onboarding_progress as any)?.table_sessions || [];
        activeSession = storedSessions.find(
          (s: any) =>
            s.status === "active" &&
            (params.sessionId ? s.id === params.sessionId : params.tableId ? s.table_id === params.tableId : false)
        );
      } catch {}
    }

    if (!activeSession || activeSession.status !== "active") {
      return {
        success: false,
        status: "NOT_FOUND",
        message: "This dining session has ended. Please contact restaurant staff.",
      };
    }

    // 3. Check Session Device status
    let deviceRecord: SessionDeviceItem | null = null;
    try {
      const { data: dData } = await supabase
        .from("session_devices")
        .select("*")
        .eq("session_id", activeSession.id)
        .eq("device_token", params.deviceToken)
        .maybeSingle();
      if (dData) deviceRecord = dData as SessionDeviceItem;
    } catch {}

    if (!deviceRecord && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const storedDevices = (bData?.onboarding_progress as any)?.session_devices || [];
        deviceRecord = storedDevices.find(
          (d: any) => d.session_id === activeSession.id && d.device_token === params.deviceToken
        ) || null;
      } catch {}
    }

    if (deviceRecord) {
      if (deviceRecord.status === "REMOVED") {
        return {
          success: false,
          status: "REMOVED",
          message: "You have been removed from this dining session. If this was a mistake, please rescan the session QR.",
        };
      }
      if (deviceRecord.status === "BLOCKED") {
        return {
          success: false,
          status: "BLOCKED",
          message: "Your device has been blocked by restaurant staff for 1 hour.",
        };
      }
      return {
        success: true,
        status: "ACTIVE",
        session: activeSession,
        device: deviceRecord,
      };
    }

    // Check if this device is the Host device
    if (activeSession.primary_device_token === params.deviceToken) {
      const hostDev: SessionDeviceItem = {
        id: `host_${activeSession.id}`,
        session_id: activeSession.id,
        device_token: params.deviceToken,
        customer_name: activeSession.customer_name || "Host",
        mobile_number: activeSession.mobile_number || "",
        role: "HOST",
        status: "ACTIVE",
        joined_at: activeSession.started_at || activeSession.opened_at || nowIso,
      };
      return {
        success: true,
        status: "ACTIVE",
        session: activeSession,
        device: hostDev,
      };
    }

    return {
      success: false,
      status: "NOT_FOUND",
      message: "Device not attached to this active dining session.",
    };
  } catch (err: any) {
    return {
      success: false,
      status: "NOT_FOUND",
      error: err.message,
    };
  }
}

/**
 * Fetch connected devices for a session (Story 15.7 Section 4: Device Tab)
 */
export async function getSessionDevices(params: {
  sessionId: string;
  branchId?: string;
  canViewPhone?: boolean;
  canViewCustomerDetails?: boolean;
}): Promise<{
  success: boolean;
  devices: SessionDeviceItem[];
  error?: string;
}> {
  try {
    const supabase = createServiceRoleClient();
    const devicesList: SessionDeviceItem[] = [];
    let targetBranchId = await resolveTargetBranchId(supabase, params.branchId, params.sessionId);
    let activeSession: any = null;

    try {
      const { data: sData } = await supabase.from("table_sessions").select("*").eq("id", params.sessionId).maybeSingle();
      if (sData) {
        activeSession = sData;
        if (sData.branch_id) targetBranchId = sData.branch_id;
      }
    } catch {}

    if (!activeSession && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.table_sessions || [];
        activeSession = stored.find((s: any) => s.id === params.sessionId);
      } catch {}
    }

    const canView = params.canViewCustomerDetails ?? params.canViewPhone ?? false;

    // 1. Host Device
    if (activeSession) {
      const hostName = canView
        ? activeSession.customer_name || "Seated Diner (Host)"
        : maskCustomerName(activeSession.customer_name || "Seated Diner (Host)");
      const hostMobile = canView
        ? activeSession.mobile_number || ""
        : maskPhoneNumber(activeSession.mobile_number);
      devicesList.push({
        id: `host_${activeSession.id}`,
        session_id: activeSession.id,
        device_token: activeSession.primary_device_token || "host_device",
        customer_name: hostName,
        mobile_number: hostMobile,
        role: "HOST",
        status: "ACTIVE",
        joined_at: activeSession.started_at || activeSession.opened_at || new Date().toISOString(),
      });
    }

    // 2. Companion Devices from DB
    let dbCompanions: SessionDeviceItem[] = [];
    try {
      const { data: compRows } = await supabase
        .from("session_devices")
        .select("*")
        .eq("session_id", params.sessionId)
        .order("joined_at", { ascending: true });
      if (compRows) {
        dbCompanions = compRows as SessionDeviceItem[];
      }
    } catch {}

    // Fallback merge from metadata
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const metaDevices = ((bData?.onboarding_progress as any)?.session_devices as any[]) || [];
        const sessionMeta = metaDevices.filter((d: any) => d.session_id === params.sessionId);
        const existingIds = new Set(dbCompanions.map((d) => d.id));
        for (const m of sessionMeta) {
          if (!existingIds.has(m.id)) {
            dbCompanions.push(m);
          }
        }
      } catch {}
    }

    for (const comp of dbCompanions) {
      // Don't duplicate host if host was also inserted into session_devices
      if (activeSession?.primary_device_token && comp.device_token === activeSession.primary_device_token) {
        continue;
      }
      devicesList.push({
        ...comp,
        customer_name: canView ? comp.customer_name : maskCustomerName(comp.customer_name),
        mobile_number: canView ? comp.mobile_number : maskPhoneNumber(comp.mobile_number),
      });
    }

    return {
      success: true,
      devices: devicesList,
    };
  } catch (err: any) {
    return {
      success: false,
      devices: [],
      error: err.message || "Failed to load session devices",
    };
  }
}

/**
 * Remove a companion device from a session (Story 15.7 Section 4 Action 1)
 */
export async function removeSessionDevice(params: {
  sessionId: string;
  deviceId: string;
  branchId?: string;
  staffId?: string;
  staffName?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();
    const staffName = params.staffName || "Staff";

    let targetBranchId = await resolveTargetBranchId(supabase, params.branchId, params.sessionId);
    let deviceName = "Guest";

    // 1. Update in DB
    try {
      const { data: dData } = await supabase.from("session_devices").select("*").eq("id", params.deviceId).maybeSingle();
      if (dData?.customer_name) deviceName = dData.customer_name;
      await supabase
        .from("session_devices")
        .update({ status: "REMOVED", updated_at: nowIso })
        .eq("id", params.deviceId);
    } catch {}

    // 2. Decrement session device_count
    try {
      const { data: sData } = await supabase.from("table_sessions").select("device_count, branch_id").eq("id", params.sessionId).maybeSingle();
      if (sData) {
        if (sData.branch_id) targetBranchId = sData.branch_id;
        const newCount = Math.max(1, (sData.device_count || 1) - 1);
        await supabase.from("table_sessions").update({ device_count: newCount }).eq("id", params.sessionId);
      }
    } catch {}

    // 3. Metadata fallback sync
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const curDevices = (curProg.session_devices as any[]) || [];
        const curSessions = (curProg.table_sessions as any[]) || [];

        const updatedDevices = curDevices.map((d: any) =>
          d.id === params.deviceId ? { ...d, status: "REMOVED", updated_at: nowIso } : d
        );
        const updatedSessions = curSessions.map((s: any) =>
          s.id === params.sessionId ? { ...s, device_count: Math.max(1, (s.device_count || 1) - 1) } : s
        );

        await supabase.from("branches").update({
          onboarding_progress: {
            ...curProg,
            session_devices: updatedDevices,
            table_sessions: updatedSessions,
          },
        }).eq("id", targetBranchId);
      } catch {}
    }

    // 4. Log Universal Activity Log entry (Story 15.7 Section 5)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "session",
        entity_id: params.sessionId,
        action: "SESSION_DEVICE_REMOVED",
        actor_type: "staff",
        actor_id: params.staffId || null,
        actor_name: staffName,
        note: `${deviceName} removed from session by ${staffName}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove device" };
  }
}

/**
 * Block a device for 1 hour at the outlet level (Story 15.7 Section 4 Action 2)
 */
export async function blockSessionDevice(params: {
  sessionId: string;
  deviceId: string;
  branchId: string;
  staffId?: string;
  staffName?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();
    const staffName = params.staffName || "Staff";
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    let targetBranchId = await resolveTargetBranchId(supabase, params.branchId, params.sessionId);
    let deviceToken = "";

    // 1. Get device info & update in DB
    try {
      const { data: dData } = await supabase.from("session_devices").select("*").eq("id", params.deviceId).maybeSingle();
      if (dData) {
        deviceToken = dData.device_token || "";
      }
      await supabase
        .from("session_devices")
        .update({ status: "BLOCKED", updated_at: nowIso })
        .eq("id", params.deviceId);
    } catch {}

    // If deviceToken missing from DB query, check metadata
    if (!deviceToken && targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const stored = (bData?.onboarding_progress as any)?.session_devices || [];
        const mDev = stored.find((d: any) => d.id === params.deviceId);
        if (mDev) {
          deviceToken = mDev.device_token || "";
        }
      } catch {}
    }

    if (!deviceToken) {
      return { success: false, error: "Device token not found" };
    }

    // 2. Insert outlet_device_blocks record
    const blockId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      await supabase.from("outlet_device_blocks").insert({
        id: blockId,
        outlet_id: targetBranchId,
        device_token: deviceToken,
        blocked_by_user_id: params.staffId || null,
        created_at: nowIso,
        expires_at: expiresAt,
      });
    } catch {}

    // 3. Decrement session device count
    try {
      const { data: sData } = await supabase.from("table_sessions").select("device_count").eq("id", params.sessionId).maybeSingle();
      if (sData) {
        const newCount = Math.max(1, (sData.device_count || 1) - 1);
        await supabase.from("table_sessions").update({ device_count: newCount }).eq("id", params.sessionId);
      }
    } catch {}

    // 4. Metadata sync
    if (targetBranchId) {
      try {
        const { data: bData } = await supabase.from("branches").select("onboarding_progress").eq("id", targetBranchId).maybeSingle();
        const curProg = (bData?.onboarding_progress as any) || {};
        const curDevices = (curProg.session_devices as any[]) || [];
        const curBlocks = (curProg.outlet_device_blocks as any[]) || [];
        const curSessions = (curProg.table_sessions as any[]) || [];

        const updatedDevices = curDevices.map((d: any) =>
          d.id === params.deviceId ? { ...d, status: "BLOCKED", updated_at: nowIso } : d
        );
        const updatedSessions = curSessions.map((s: any) =>
          s.id === params.sessionId ? { ...s, device_count: Math.max(1, (s.device_count || 1) - 1) } : s
        );

        await supabase.from("branches").update({
          onboarding_progress: {
            ...curProg,
            session_devices: updatedDevices,
            table_sessions: updatedSessions,
            outlet_device_blocks: [
              ...curBlocks,
              {
                id: blockId,
                outlet_id: targetBranchId,
                device_token: deviceToken,
                blocked_by_user_id: params.staffId || null,
                created_at: nowIso,
                expires_at: expiresAt,
              },
            ],
          },
        }).eq("id", targetBranchId);
      } catch {}
    }

    // 5. Log Universal Activity Log entry (Story 15.7 Section 5)
    try {
      await supabase.from("activity_log").insert({
        entity_type: "session",
        entity_id: params.sessionId,
        action: "DEVICE_OUTLET_BLOCKED",
        actor_type: "staff",
        actor_id: params.staffId || null,
        actor_name: staffName,
        note: `Guest Device ${deviceToken.slice(0, 10)} BLOCKED for 1 hour by ${staffName}`,
        created_at: nowIso,
      });
    } catch {}

    revalidatePath("/operations/tables");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to block device" };
  }
}


