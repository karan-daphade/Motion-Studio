"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  GitMerge, 
  Users, 
  UserCheck, 
  Receipt, 
  Bell, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  OperationsBranchData, 
  OperationsTableItem,
  getBranchOperationsData,
  getPendingTableAccessRequests,
  getOccupiedTableScanAlerts
} from "@/app/actions/operations-tables-actions";
import { canMergeTables } from "@/lib/auth/permissions";
import TableCard from "@/components/operations/TableCard";
import AddItemsPanel from "@/components/operations/AddItemsPanel";
import MergeIsolatePanel from "@/components/operations/panels/MergeIsolatePanel";
import WaitingListPanel from "@/components/operations/panels/WaitingListPanel";
import AssignWaiterPanel from "@/components/operations/panels/AssignWaiterPanel";
import AlertsDrawer from "@/components/operations/panels/AlertsDrawer";
import TableDetailPanel from "@/components/operations/panels/TableDetailPanel";
import TableActionSidePanel from "@/components/operations/panels/TableActionSidePanel";

interface TablesFloorClientProps {
  initialData: OperationsBranchData;
  branchId: string;
}

export default function TablesFloorClient({
  initialData,
  branchId,
}: TablesFloorClientProps) {
  const router = useRouter();
  const [data, setData] = useState<OperationsBranchData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Section filter: "all" or specific section_id
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");

  // Active side panel state
  const [activePanel, setActivePanel] = useState<
    "merge" | "waitlist" | "assign_waiter" | "new_bill" | "notifications" | "table_detail" | null
  >(null);

  // Detail panel selected table (for occupied tables)
  const [detailTableId, setDetailTableId] = useState<string | null>(null);

  // Table action side panel selected table (for empty or reserved tables)
  const [actionTableId, setActionTableId] = useState<string | null>(null);

  // Add Order mode (fires from TableDetail)
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Role simulation state (for easy testing of permissions like table.assign & section restrictions)
  const [simulatedRole, setSimulatedRole] = useState<string | null>(null);

  // Success toast/banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pending table QR access requests count (Story 15.6) & Occupied scan alerts count (Story 15.7)
  const [pendingQRRequestsCount, setPendingQRRequestsCount] = useState<number>(0);
  const [occupiedAlertsCount, setOccupiedAlertsCount] = useState<number>(0);

  // Re-fetch branch operations data
  const refreshFloorData = useCallback(async () => {
    setIsRefreshing(true);
    const [freshData, qrReqs, scanAlerts] = await Promise.all([
      getBranchOperationsData(branchId),
      getPendingTableAccessRequests(branchId),
      getOccupiedTableScanAlerts(branchId),
    ]);
    if (freshData) {
      setData(freshData);
    }
    if (qrReqs?.success) {
      setPendingQRRequestsCount(qrReqs.pendingCount);
    }
    if (scanAlerts?.success) {
      setOccupiedAlertsCount((scanAlerts.alerts || []).length);
    }
    setIsRefreshing(false);
  }, [branchId]);

  // Realtime subscription setup with tenant-scoped filters and surgical state updates
  useEffect(() => {
    if (!branchId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`operations-tables-${branchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tables" }, (payload: any) => {
        if (payload.new && payload.new.id) {
          setData((prev) => {
            const tableExists = prev.tables.some((t) => t.id === payload.new.id);
            if (!tableExists) {
              refreshFloorData();
              return prev;
            }
            return {
              ...prev,
              tables: prev.tables.map((t) =>
                t.id === payload.new.id
                  ? {
                      ...t,
                      status: payload.new.status || t.status,
                      held_for_waitlist_id: payload.new.held_for_waitlist_id ?? t.held_for_waitlist_id,
                      table_name: payload.new.table_name || t.table_name,
                      seating_capacity: payload.new.seating_capacity || t.seating_capacity,
                    }
                  : t
              ),
            };
          });
        } else {
          refreshFloorData();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "table_sessions" }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "session_tables" }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "table_merge_groups", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "table_merge_group_members" }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "waiting_list_entries", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "waiting_list_activity_logs", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_requests" }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "waiter_table_assignments", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "table_reservations", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_log", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "bills", filter: `branch_id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "bill_payments" }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "branches", filter: `id=eq.${branchId}` }, () => refreshFloorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "table_access_requests", filter: `branch_id=eq.${branchId}` }, (payload: any) => {
        getPendingTableAccessRequests(branchId).then((qrReqs) => {
          if (qrReqs?.success) setPendingQRRequestsCount(qrReqs.pendingCount);
        });
        refreshFloorData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "occupied_table_alerts", filter: `branch_id=eq.${branchId}` }, () => {
        getOccupiedTableScanAlerts(branchId).then((scanAlerts) => {
          if (scanAlerts?.success) setOccupiedAlertsCount((scanAlerts.alerts || []).length);
        });
        refreshFloorData();
      })
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          refreshFloorData();
        }
      });

    // Revalidate on network reconnect
    const handleOnline = () => refreshFloorData();
    window.addEventListener("online", handleOnline);

    // Passive safety sync every 60s (reduced from 10s aggressive poll)
    const passiveInterval = setInterval(() => {
      refreshFloorData();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", handleOnline);
      clearInterval(passiveInterval);
    };
  }, [branchId, refreshFloorData]);

  // Compute effective user with simulated role if active
  const effectiveUser: {
    id: string;
    name: string;
    role: string;
    assigned_sections: string[];
  } = React.useMemo(() => {
    const defaultUser = {
      id: "staff-current",
      name: "Floor Staff",
      role: "manager",
      assigned_sections: [] as string[],
    };
    const baseUser = data.current_user || defaultUser;
    if (!simulatedRole) return baseUser;
    return {
      ...baseUser,
      role: simulatedRole,
      assigned_sections: simulatedRole === "waiter"
        ? (data.sections.length > 0 ? [data.sections[0].id] : [])
        : baseUser.assigned_sections,
    };
  }, [simulatedRole, data.current_user, data.sections]);

  // Find currently selected detail table
  const selectedDetailTable = detailTableId
    ? data.tables.find((t) => t.id === detailTableId) || null
    : null;

  // Find currently selected action table
  const selectedActionTable = actionTableId
    ? data.tables.find((t) => t.id === actionTableId) || null
    : null;

  // Helper: Detect if a table is secondary in a merged group (whether idle or active)
  // Secondary tables are hidden from main grid, visible only in Merge/Isolate panel
  const isSecondaryMergedTable = (t: OperationsTableItem) => {
    if (t.is_secondary_merged) return true;
    return !!(t.active_session && t.id !== t.active_session.table_id);
  };

  // Permission to merge/isolate tables (Owner, Branch Manager, Section Manager)
  const canMerge = canMergeTables({
    role: effectiveUser.role,
    assignedSections: effectiveUser.assigned_sections,
  });

  const mergedCount = (data.merge_groups || []).length;

  // Counts for toolbar action badges
  const waitingCount = data.queue_entries.length;
  const unassignedWaitersCount = data.tables.filter(
    (t) => !t.assigned_waiter && t.status !== "inactive" && !isSecondaryMergedTable(t)
  ).length;

  // Open customer requests count & urgent QR access requests count
  const openRequestsCount = data.tables.reduce((acc, t) => {
    return acc + (t.active_session?.requests.filter((r) => r.status === "open").length || 0);
  }, 0);
  const totalAlertsCount = openRequestsCount + pendingQRRequestsCount + occupiedAlertsCount;

  // Table click dispatcher:
  // If occupied -> open TableDetailPanel
  // If empty or reserved -> open TableActionSidePanel
  const handleTableClick = (table: OperationsTableItem) => {
    if (table.active_session) {
      setDetailTableId(table.id);
      setActionTableId(null);
      setActivePanel("table_detail");
    } else {
      setActionTableId(table.id);
      setDetailTableId(null);
      setActivePanel(null);
    }
  };

  // Group tables by section when "All" is selected
  const activeSections = data.sections.filter((s) => s.active !== false);

  return (
    <div className="space-y-6 pb-20">
      
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-brand-secondary text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="h-4 w-4 text-brand-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOOLBAR (Always visible & reachable) */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-2.5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-brand-background/95 backdrop-blur-md border-b border-brand-border/60">
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none pb-0.5">
          
          <div className="flex items-center gap-2">
            {/* 1. MERGE / ISOLATE (Gated by tables.merge permission) */}
            {canMerge && (
              <button
                type="button"
                onClick={() => setActivePanel("merge")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                  activePanel === "merge"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
                }`}
              >
                <GitMerge className="h-4 w-4 text-purple-500" />
                <span>Merge / Isolate</span>
                {mergedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black border border-purple-300">
                    {mergedCount}
                  </span>
                )}
              </button>
            )}

            {/* 2. WAITING LIST */}
            <button
              type="button"
              onClick={() => setActivePanel("waitlist")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                activePanel === "waitlist"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              <Users className="h-4 w-4 text-amber-500" />
              <span>Waiting List</span>
              {waitingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                  {waitingCount}
                </span>
              )}
            </button>

            {/* 3. ASSIGN TABLE (Waiter Roster) */}
            <button
              type="button"
              onClick={() => setActivePanel("assign_waiter")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                activePanel === "assign_waiter"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              <UserCheck className="h-4 w-4 text-indigo-500" />
              <span>Assign Table</span>
              {unassignedWaitersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-300">
                  {unassignedWaitersCount}
                </span>
              )}
            </button>

            {/* 4. NEW BILL (Takeaway / Delivery) */}
            <button
              type="button"
              onClick={() => setActivePanel("new_bill")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                activePanel === "new_bill"
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              <Receipt className="h-4 w-4 text-brand-primary" />
              <span>New Bill (Takeaway)</span>
            </button>

            {/* 5. ALERTS (Urgent Table QR Requests & Customer Calls) */}
            <button
              type="button"
              onClick={() => setActivePanel("notifications")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                activePanel === "notifications"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              <Bell className="h-4 w-4 text-blue-500" />
              <span>Alerts</span>
              {totalAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {totalAlertsCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Role Simulator (Allows live verification of permissions & multi-section rules) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-brand-border rounded-xl px-2.5 py-1 text-xs shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-[10px] uppercase font-bold text-brand-text-muted">Simulate Role:</span>
              <select
                value={simulatedRole || effectiveUser.role}
                onChange={(e) => setSimulatedRole(e.target.value)}
                className="text-xs font-bold bg-transparent text-brand-secondary focus:outline-none cursor-pointer"
              >
                <option value="owner">Owner (Full Access)</option>
                <option value="manager">Manager</option>
                <option value="section_manager">Section Manager</option>
                <option value="waiter">Waiter (No Table Assign)</option>
              </select>
            </div>

            {/* Quick Manual Refresh */}
            <button
              type="button"
              disabled={isRefreshing}
              onClick={refreshFloorData}
              className="p-2 rounded-xl border border-brand-border bg-white text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors shrink-0"
              title="Refresh floor data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-brand-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedSectionFilter("all")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            selectedSectionFilter === "all"
              ? "bg-brand-secondary text-white shadow-brandCard"
              : "bg-white text-brand-text-secondary border border-brand-border hover:bg-brand-surface-muted"
          }`}
        >
          All Sections ({data.tables.filter((t) => t.status !== "inactive" && !isSecondaryMergedTable(t)).length} tables)
        </button>

        {activeSections.map((sec) => {
          const count = data.tables.filter(
            (t) => t.section_id === sec.id && t.status !== "inactive" && !isSecondaryMergedTable(t)
          ).length;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSectionFilter(sec.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSectionFilter === sec.id
                  ? "bg-brand-secondary text-white shadow-brandCard"
                  : "bg-white text-brand-text-secondary border border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              {sec.name} ({count})
            </button>
          );
        })}
      </div>

      {/* TABLE GRID LAYOUT */}
      {selectedSectionFilter === "all" ? (
        /* GROUPED UNDER SECTION HEADERS */
        <div className="space-y-8">
          {activeSections.map((sec) => {
            const secTables = data.tables.filter(
              (t) => t.section_id === sec.id && t.status !== "inactive" && !isSecondaryMergedTable(t)
            );

            if (secTables.length === 0) return null;

            return (
              <div key={sec.id} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-brand-border/60">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-brand-secondary tracking-tight">
                      {sec.name}
                    </h2>
                    <span className="text-[11px] font-semibold text-brand-text-muted">
                      • {sec.floor ? `${sec.floor} • ` : ""}{secTables.length} {secTables.length === 1 ? "table" : "tables"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                  {secTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      onClickOccupied={handleTableClick}
                      onPromptWalkIn={handleTableClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* FILTERED SINGLE SECTION GRID */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {data.tables
            .filter((t) => t.section_id === selectedSectionFilter && t.status !== "inactive" && !isSecondaryMergedTable(t))
            .map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onClickOccupied={handleTableClick}
                onPromptWalkIn={handleTableClick}
              />
            ))}
        </div>
      )}

      {/* 1. MERGE / ISOLATE PANEL (Shows all tables including secondary merged tables) */}
      <MergeIsolatePanel
        isOpen={activePanel === "merge"}
        onClose={() => setActivePanel(null)}
        branchId={branchId}
        tables={data.tables}
        sections={data.sections}
        mergeGroups={data.merge_groups}
        currentUser={effectiveUser}
        onRefresh={refreshFloorData}
      />

      {/* 2. WAITING LIST PANEL */}
      <WaitingListPanel
        isOpen={activePanel === "waitlist"}
        onClose={() => setActivePanel(null)}
        branchId={branchId}
        queueEntries={data.queue_entries}
        tables={data.tables}
        sections={data.sections}
        currentUser={effectiveUser}
        onRefresh={refreshFloorData}
      />

      {/* 3. ASSIGN TABLE (Waiter Roster) PANEL */}
      <AssignWaiterPanel
        isOpen={activePanel === "assign_waiter"}
        onClose={() => setActivePanel(null)}
        branchId={branchId}
        tables={data.tables}
        waiters={data.waiters}
        shifts={data.shifts}
        sections={data.sections}
        currentUser={effectiveUser}
        onRefresh={refreshFloorData}
      />

      {/* 4. NEW BILL (Draft Mode) PANEL */}
      <AddItemsPanel
        isOpen={activePanel === "new_bill"}
        onClose={() => setActivePanel(null)}
        mode="draft"
        categories={data.categories}
        menuItems={data.menu_items}
        branchId={branchId}
        onDraftBillCreated={(billNumber) => {
          showToast(`Takeaway Bill #${billNumber} finalized`);
          refreshFloorData();
        }}
      />

      {/* 5. ALERTS DRAWER (Table QR Access Requests & Live Operations Stream) */}
      <AlertsDrawer
        isOpen={activePanel === "notifications"}
        onClose={() => setActivePanel(null)}
        branchId={branchId}
        tables={data.tables}
        queueEntries={data.queue_entries}
        currentUser={effectiveUser}
        onRefresh={refreshFloorData}
        onRequestHandled={() => {
          showToast("Table request processed successfully");
          refreshFloorData();
        }}
      />

      {/* 6. TABLE DETAIL SIDE PANEL (Occupied Table Sessions) */}
      <TableDetailPanel
        isOpen={activePanel === "table_detail"}
        onClose={() => {
          setActivePanel(null);
          setDetailTableId(null);
        }}
        table={selectedDetailTable}
        branchId={branchId}
        allTables={data.tables}
        currentUser={effectiveUser}
        onOpenAddOrder={() => setIsAddOrderOpen(true)}
        onRefresh={refreshFloorData}
      />

      {/* 7. TABLE ACTION SIDE PANEL (Empty / Reserved Tables) */}
      <TableActionSidePanel
        isOpen={!!selectedActionTable}
        onClose={() => setActionTableId(null)}
        table={selectedActionTable}
        branchId={branchId}
        currentUser={effectiveUser}
        onSuccess={(msg) => {
          showToast(msg);
          refreshFloorData();
        }}
        onRefresh={refreshFloorData}
      />

      {/* SHARED ADD-ITEMS PANEL IN LIVE-FIRE MODE (Triggered from Table Detail) */}
      {selectedDetailTable && selectedDetailTable.active_session && (
        <AddItemsPanel
          isOpen={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          mode="live_fire"
          categories={data.categories}
          menuItems={data.menu_items}
          branchId={branchId}
          tableSessionId={selectedDetailTable.active_session.id}
          tableLabels={selectedDetailTable.active_session.merged_table_labels}
          onOrderFired={() => {
            showToast(`Order fired to kitchen for ${selectedDetailTable.table_name}`);
            refreshFloorData();
          }}
        />
      )}
    </div>
  );
}
