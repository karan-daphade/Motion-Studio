"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Phone, 
  QrCode, 
  AlertTriangle, 
  AlertCircle,
  Loader2, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame
} from "lucide-react";
import { 
  TableAccessRequestItem, 
  OperationsTableItem, 
  OperationsQueueEntry,
  approveTableAccessRequest,
  rejectTableAccessRequest,
  getPendingTableAccessRequests,
  getOccupiedTableScanAlerts,
  dismissOccupiedTableAlert,
  OccupiedScanAlertItem
} from "@/app/actions/operations-tables-actions";
import { maskPhoneNumber, maskCustomerName, canViewCustomerDetails } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/client";

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  tables: OperationsTableItem[];
  queueEntries: OperationsQueueEntry[];
  currentUser?: { id: string; name: string; role: string; permissions?: any } | null;
  onRefresh: () => void;
  onRequestHandled?: () => void;
}

export default function AlertsDrawer({
  isOpen,
  onClose,
  branchId,
  tables,
  queueEntries,
  currentUser,
  onRefresh,
  onRequestHandled,
}: AlertsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"urgent" | "activity">("urgent");
  const [pendingRequests, setPendingRequests] = useState<TableAccessRequestItem[]>([]);
  const [occupiedScanAlerts, setOccupiedScanAlerts] = useState<OccupiedScanAlertItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Quick Reject Modal State
  const [rejectingRequest, setRejectingRequest] = useState<TableAccessRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("Table Reserved");
  const [customReason, setCustomReason] = useState<string>("");

  const staffName = currentUser?.name || "Staff";
  const staffId = currentUser?.id || undefined;
  const canViewCustomer = canViewCustomerDetails(currentUser || undefined);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (rejectingRequest) {
          setRejectingRequest(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, rejectingRequest, onClose]);

  // Fetch pending access requests & occupied scan alerts on open and periodically
  const fetchRequests = async () => {
    if (!branchId) return;
    setIsLoading(true);
    try {
      const [res, scanAlertsRes] = await Promise.all([
        getPendingTableAccessRequests(branchId),
        getOccupiedTableScanAlerts(branchId),
      ]);
      if (res.success) {
        setPendingRequests(res.requests);
      }
      if (scanAlertsRes.success) {
        // Auto-clear when table becomes available (Story 15.7 Workflow 1)
        const occupiedTableIds = new Set(
          tables
            .filter((t) => t.status === "occupied" || !!t.active_session)
            .map((t) => t.id)
        );
        const activeAlerts = (scanAlertsRes.alerts || []).filter((a) =>
          occupiedTableIds.size === 0 || occupiedTableIds.has(a.table_id)
        );
        setOccupiedScanAlerts(activeAlerts);
      }
    } catch (err) {
      console.error("Error fetching access requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 5000);

      // Realtime subscription for occupied table alerts
      const supabase = createClient();
      const channel = supabase
        .channel(`occupied_scan_alerts_${branchId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "occupied_table_alerts",
            filter: `branch_id=eq.${branchId}`,
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, branchId, tables]);

  // Handle Dismiss Occupied Table Scan Alert (Story 15.7 Workflow 1)
  const handleDismissOccupiedAlert = async (alertId: string) => {
    try {
      setOccupiedScanAlerts((prev) => prev.filter((a) => a.id !== alertId));
      await dismissOccupiedTableAlert({ alertId, branchId });
      onRefresh();
    } catch (err) {
      console.error("Error dismissing alert:", err);
    }
  };

  // Handle Approve
  const handleApprove = async (request: TableAccessRequestItem) => {
    setActionInProgressId(request.id);
    setActionError(null);

    try {
      const res = await approveTableAccessRequest({
        requestId: request.id,
        branchId,
        staffId,
        staffName,
      });

      if (res.success) {
        // Auto-dismiss immediately from local list
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
        onRefresh();
        if (onRequestHandled) onRequestHandled();
      } else {
        setActionError(res.error || "Failed to approve access request");
      }
    } catch {
      setActionError("Network error while approving request. Please retry.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Reject Submit
  const handleConfirmReject = async () => {
    if (!rejectingRequest) return;
    setActionInProgressId(rejectingRequest.id);
    setActionError(null);

    const finalReason = rejectReason === "Other" && customReason.trim()
      ? customReason.trim()
      : rejectReason;

    try {
      const res = await rejectTableAccessRequest({
        requestId: rejectingRequest.id,
        reason: finalReason,
        branchId,
        staffId,
        staffName,
      });

      if (res.success) {
        // Auto-dismiss immediately
        setPendingRequests((prev) => prev.filter((r) => r.id !== rejectingRequest.id));
        setRejectingRequest(null);
        setCustomReason("");
        onRefresh();
        if (onRequestHandled) onRequestHandled();
      } else {
        setActionError(res.error || "Failed to decline request");
      }
    } catch {
      setActionError("Network error while declining request.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Build secondary activity feed items from orders & customer requests
  const activityItems: Array<{
    id: string;
    title: string;
    subtitle: string;
    time: string;
    timestamp: number;
    badge: string;
    badgeColor: string;
  }> = [];

  tables.forEach((t) => {
    t.active_session?.orders.forEach((o) => {
      o.items.forEach((it) => {
        const itemCreated = new Date(it.created_at).getTime();
        let badge = "Preparing";
        let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";

        if (it.status === "ready") {
          badge = "Ready to Serve";
          badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
        }

        activityItems.push({
          id: `item-${it.id}`,
          title: `${it.item_name} (x${it.quantity})`,
          subtitle: `For ${t.table_name} (${t.section_name}) • Order #${o.id.slice(0, 5)}`,
          time: new Date(it.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: itemCreated,
          badge,
          badgeColor,
        });
      });
    });

    t.active_session?.requests.forEach((req) => {
      activityItems.push({
        id: `req-${req.id}`,
        title: `Customer Request: ${req.type.replace("_", " ").toUpperCase()}`,
        subtitle: `Table ${t.table_name} • Requested by ${req.requested_by}`,
        time: new Date(req.requested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date(req.requested_at).getTime(),
        badge: req.status === "open" ? "Open Request" : "Fulfilled",
        badgeColor: req.status === "open" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-700 border-gray-200",
      });
    });
  });

  activityItems.sort((a, b) => b.timestamp - a.timestamp);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full md:w-[500px] lg:w-[540px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* DRAWER HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-brand-secondary">
                  Operations Alerts
                </h2>
                {(pendingRequests.length > 0 || occupiedScanAlerts.length > 0) && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    {pendingRequests.length + occupiedScanAlerts.length} Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-text-muted">
                Table QR requests & live operational alerts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="px-4 pt-3 pb-2 border-b border-brand-border bg-white flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("urgent")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "urgent"
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-brand-surface-muted text-brand-secondary hover:bg-brand-surface-muted/80"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Table QR Access</span>
            {(pendingRequests.length > 0 || occupiedScanAlerts.length > 0) && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === "urgent" ? "bg-white text-brand-primary" : "bg-rose-500 text-white"
              }`}>
                {pendingRequests.length + occupiedScanAlerts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "activity"
                ? "bg-brand-secondary text-white shadow-xs"
                : "bg-brand-surface-muted text-brand-secondary hover:bg-brand-surface-muted/80"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Floor Activity</span>
            <span className="text-[10px] opacity-70 font-mono">({activityItems.length})</span>
          </button>
        </div>

        {/* ERROR BANNER */}
        {actionError && (
          <div className="m-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "urgent" ? (
            /* ================================================================= */
            /* TAB 1: URGENT TABLE ACCESS REQUESTS & OCCUPIED SCAN NOTICES       */
            /* ================================================================= */
            pendingRequests.length === 0 && occupiedScanAlerts.length === 0 ? (
              <div className="py-16 text-center text-brand-text-muted">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <p className="text-xs font-bold text-brand-secondary">No Pending QR Requests</p>
                <p className="text-[11px] text-brand-text-muted mt-1 max-w-xs mx-auto">
                  When walk-in guests scan an available table QR code or occupied table, alerts will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* OCCUPIED TABLE SCAN ALERTS (Story 15.7 Workflow 1) */}
                {occupiedScanAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-3xl border-2 border-amber-300/80 bg-gradient-to-br from-white via-amber-50/40 to-amber-100/20 shadow-brandCard space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                        <span>Table {alert.table_label}</span>
                      </div>

                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Scan Alert
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-brand-secondary">
                        Direct Table QR Scan on Occupied Table
                      </h4>
                      <p className="text-xs text-brand-text-secondary leading-relaxed">
                        An unregistered customer scanned the physical QR on Table {alert.table_label} while a session is active. Guided notice card was shown to guest.
                      </p>
                      <p className="text-[10px] text-brand-text-muted">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-end border-t border-amber-200/60">
                      <button
                        type="button"
                        onClick={() => handleDismissOccupiedAlert(alert.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
                {pendingRequests.map((req) => {
                  const isOperating = actionInProgressId === req.id;
                const elapsedMins = req.waiting_minutes !== undefined ? req.waiting_minutes : 0;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-3xl border-2 border-brand-primary/30 bg-gradient-to-br from-white via-white to-amber-50/30 shadow-brandCard space-y-3 hover:border-brand-primary transition-all"
                  >
                    {/* Top Row: Table Label & Waiting Time */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-light text-brand-primary text-xs font-black border border-brand-primary/20">
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Table {req.table_label}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock className="h-3 w-3" />
                        <span>Waiting {elapsedMins}m</span>
                      </div>
                    </div>

                    {/* Customer & Party Details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-brand-secondary">
                          {canViewCustomer ? req.customer_name : maskCustomerName(req.customer_name)}
                        </h4>
                        <span className="text-xs font-bold text-brand-secondary flex items-center gap-1 bg-brand-surface-muted px-2 py-0.5 rounded-lg border border-brand-border">
                          <Users className="h-3 w-3 text-brand-primary" />
                          <span>{req.party_size} {req.party_size === 1 ? "Guest" : "Guests"}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary font-mono">
                        <Phone className="h-3 w-3 text-brand-text-muted" />
                        <span>+91 {canViewCustomer ? req.customer_phone : maskPhoneNumber(req.customer_phone)}</span>
                      </div>
                    </div>

                    {/* Actions: Approve (Green) | Reject (Red outline) */}
                    <div className="pt-2 flex items-center gap-2 border-t border-brand-border/60">
                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => handleApprove(req)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isOperating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Approve & Seat</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => {
                          setRejectingRequest(req);
                          setRejectReason("Table Reserved");
                          setCustomReason("");
                        }}
                        className="py-2.5 px-3.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )
        ) : (
            /* ================================================================= */
            /* TAB 2: FLOOR ACTIVITY STREAM                                      */
            /* ================================================================= */
            activityItems.length === 0 ? (
              <div className="py-16 text-center text-brand-text-muted">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold text-brand-secondary">No activity logs yet</p>
                <p className="text-[11px] text-brand-text-muted mt-1">
                  Active orders and kitchen tickets will show up here.
                </p>
              </div>
            ) : (
              activityItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-brand-border bg-white shadow-2xs space-y-1.5 hover:border-brand-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-brand-secondary">{item.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted">{item.subtitle}</p>
                  <div className="flex items-center gap-1 text-[10px] text-brand-text-muted pt-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* QUICK REJECT CONFIRMATION MODAL */}
        {rejectingRequest && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-brand-border space-y-4 animate-in zoom-in-95 duration-200 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-secondary">
                      Decline QR Table Access
                    </h3>
                    <p className="text-[11px] text-brand-text-muted">
                      Table {rejectingRequest.table_label} • {canViewCustomer ? rejectingRequest.customer_name : maskCustomerName(rejectingRequest.customer_name)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="p-1 rounded-lg text-brand-text-muted hover:text-brand-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary block">
                  Select Reason (optional):
                </label>
                <div className="space-y-1.5">
                  {[
                    "Table Reserved",
                    "Party Shifted",
                    "Incorrect Table",
                    "Closing Soon",
                    "Other",
                  ].map((r) => (
                    <label
                      key={r}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        rejectReason === r
                          ? "border-rose-500 bg-rose-50 text-rose-950 font-bold"
                          : "border-brand-border bg-white text-brand-secondary hover:bg-brand-surface-muted"
                      }`}
                    >
                      <span>{r}</span>
                      <input
                        type="radio"
                        name="rejectReason"
                        checked={rejectReason === r}
                        onChange={() => setRejectReason(r)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                  ))}
                </div>

                {rejectReason === "Other" && (
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full mt-2 p-2.5 text-xs rounded-xl border border-brand-border focus:border-rose-500 outline-none"
                  />
                )}
              </div>

              <p className="text-[11px] text-brand-text-muted">
                The customer screen will display: &ldquo;Request Declined. Please contact restaurant staff for assistance.&rdquo;
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="flex-1 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionInProgressId === rejectingRequest.id}
                  onClick={handleConfirmReject}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                >
                  {actionInProgressId === rejectingRequest.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Confirm Decline</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
