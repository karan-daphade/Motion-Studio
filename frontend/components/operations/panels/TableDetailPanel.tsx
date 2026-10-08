"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Flame, 
  Receipt, 
  Users, 
  History, 
  Clock, 
  Plus, 
  CheckCircle2, 
  GitMerge, 
  Unlink, 
  Split, 
  CreditCard, 
  Smartphone, 
  Coffee, 
  Sparkles,
  AlertCircle,
  Check,
  DollarSign,
  QrCode,
  ShieldAlert,
  UserX,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { 
  OperationsTableItem, 
  fulfillCustomerRequest, 
  createCustomerRequest,
  releaseTableSession,
  splitSession,
  mergeTables,
  recordBillPayment,
  splitBill,
  getSessionDevices,
  removeSessionDevice,
  blockSessionDevice,
  SessionDeviceItem
} from "@/app/actions/operations-tables-actions";
import { canModerateDevices, maskPhoneNumber, maskCustomerName, canViewCustomerDetails } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/client";
import ActivityLogList from "@/components/operations/ActivityLogList";
import ShareSessionQRModal from "@/components/operations/ShareSessionQRModal";

interface TableDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  table: OperationsTableItem | null;
  branchId: string;
  allTables: OperationsTableItem[];
  currentUser?: { id: string; name: string; role: string; permissions?: any } | null;
  onOpenAddOrder: () => void;
  onRefresh: () => void;
}

export default function TableDetailPanel({
  isOpen,
  onClose,
  table,
  branchId,
  allTables,
  currentUser,
  onOpenAddOrder,
  onRefresh,
}: TableDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"live" | "bill" | "devices" | "activity">("live");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Device Management State (Story 15.7 Workflow 3)
  const [devices, setDevices] = useState<SessionDeviceItem[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [deviceActionError, setDeviceActionError] = useState<string | null>(null);
  const [confirmActionDevice, setConfirmActionDevice] = useState<{
    device: SessionDeviceItem;
    action: "REMOVE" | "BLOCK";
  } | null>(null);
  const [isProcessingDeviceAction, setIsProcessingDeviceAction] = useState(false);

  // Modals inside panel
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("cash");
  const [payerName, setPayerName] = useState<string>("");

  const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(2);

  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [selectedTableToMerge, setSelectedTableToMerge] = useState<string>("");
  const [addTableError, setAddTableError] = useState<string | null>(null);

  const [isSplitSessionModalOpen, setIsSplitSessionModalOpen] = useState(false);
  const [selectedTableToSplit, setSelectedTableToSplit] = useState<string>("");

  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState<string>("call_waiter");

  const [isShareQRModalOpen, setIsShareQRModalOpen] = useState(false);

  const sessionId = table?.active_session?.id;

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmActionDevice) {
          setConfirmActionDevice(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, confirmActionDevice]);

  // Fetch connected devices for active session (Story 15.7 Workflow 3)
  const canViewCustomerInfo = canViewCustomerDetails(currentUser || undefined);

  const fetchDevices = useCallback(async () => {
    if (!sessionId) return;
    setIsLoadingDevices(true);
    try {
      const res = await getSessionDevices({
        sessionId,
        branchId,
        canViewPhone: canViewCustomerInfo,
        canViewCustomerDetails: canViewCustomerInfo,
      });
      if (res.success) {
        setDevices(res.devices);
      }
    } catch (err) {
      console.error("Error fetching session devices:", err);
    } finally {
      setIsLoadingDevices(false);
    }
  }, [sessionId, branchId, canViewCustomerInfo]);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchDevices();

      const supabase = createClient();
      const channel = supabase
        .channel(`session_devices_${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "session_devices",
            filter: `session_id=eq.${sessionId}`,
          },
          () => {
            fetchDevices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, sessionId, fetchDevices]);

  // Handle Remove Companion Device (Story 15.7 Section 4 Action 1)
  const handleRemoveDevice = async (device: SessionDeviceItem) => {
    if (!sessionId) return;
    setIsProcessingDeviceAction(true);
    setDeviceActionError(null);
    try {
      const res = await removeSessionDevice({
        sessionId,
        deviceId: device.id,
        branchId,
        staffId: currentUser?.id,
        staffName: currentUser?.name,
      });
      if (res.success) {
        setConfirmActionDevice(null);
        fetchDevices();
        onRefresh();
      } else {
        setDeviceActionError(res.error || "Failed to remove device");
      }
    } catch {
      setDeviceActionError("Network error while removing device");
    } finally {
      setIsProcessingDeviceAction(false);
    }
  };

  // Handle Block Companion Device 1-Hour Ban (Story 15.7 Section 4 Action 2)
  const handleBlockDevice = async (device: SessionDeviceItem) => {
    if (!sessionId) return;
    setIsProcessingDeviceAction(true);
    setDeviceActionError(null);
    try {
      const res = await blockSessionDevice({
        sessionId,
        deviceId: device.id,
        branchId,
        staffId: currentUser?.id,
        staffName: currentUser?.name,
      });
      if (res.success) {
        setConfirmActionDevice(null);
        fetchDevices();
        onRefresh();
      } else {
        setDeviceActionError(res.error || "Failed to block device");
      }
    } catch {
      setDeviceActionError("Network error while blocking device");
    } finally {
      setIsProcessingDeviceAction(false);
    }
  };

  if (!isOpen || !table || !table.active_session) return null;

  const session = table.active_session;
  const mergedLabels = (() => {
    if (session.merged_table_labels && session.merged_table_labels.length > 1) {
      return session.merged_table_labels
        .map((l) => (l.startsWith("T") ? l : `T${l.replace(/\D/g, "")}`))
        .join(", ");
    }
    if (table.short_code && table.short_code.includes(",")) {
      return table.short_code;
    }
    return table.short_code || table.table_name;
  })();

  // Session start time formatting
  const startTime = new Date(session.opened_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate unserved order items (pending, preparing, ready)
  const unservedItems: Array<{
    id: string;
    itemName: string;
    quantity: number;
    price: number;
    status: string;
    notes?: string;
    time: string;
    requestedBy: string;
  }> = [];

  session.orders.forEach((o) => {
    o.items.forEach((it) => {
      if (it.status !== "served") {
        unservedItems.push({
          id: it.id,
          itemName: it.item_name,
          quantity: it.quantity,
          price: it.price_at_order,
          status: it.status,
          notes: it.notes,
          time: new Date(it.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          requestedBy: it.requested_by || "Staff",
        });
      }
    });
  });

  // Open customer requests
  const openRequests = session.requests.filter((r) => r.status === "open");

  // Bill metrics
  const bill = session.bill;
  const totalAmount = bill ? bill.total_amount : 0;
  const paidAmount = bill ? bill.paid_amount : 0;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  // Available tables in same section that can be merged in
  const availableToMerge = allTables.filter(
    (t) =>
      t.section_id === table.section_id &&
      t.id !== table.id &&
      !session.merged_table_ids.includes(t.id) &&
      t.status === "active" &&
      !t.active_session &&
      !t.is_secondary_merged &&
      !t.held_for_waitlist_id &&
      !t.is_held_for_waitlist &&
      !t.reservation
  );

  // Handlers
  const handleFulfillRequest = async (requestId: string) => {
    setIsSubmitting(true);
    const staffName = currentUser?.name || "Staff";
    await fulfillCustomerRequest(requestId, staffName, currentUser?.id);
    setIsSubmitting(false);
    onRefresh();
  };

  const handleCreateRequest = async () => {
    setIsSubmitting(true);
    const staffName = currentUser?.name || "Staff";
    await createCustomerRequest(
      session.id, 
      requestType, 
      staffName, 
      currentUser?.id, 
      "staff", 
      `Quick action: ${requestType.replace(/_/g, " ")} placed by ${staffName}`
    );
    setIsSubmitting(false);
    setIsNewRequestOpen(false);
    onRefresh();
  };

  const handleReleaseTable = async () => {
    if (!confirm(`Release table ${mergedLabels} and close this session?`)) return;
    setIsSubmitting(true);
    const res = await releaseTableSession(session.id, session.table_id || table.id, branchId);
    setIsSubmitting(false);
    if (res.success) {
      onRefresh();
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to release table");
    }
  };

  const handleAddTableMerge = async () => {
    if (!selectedTableToMerge) return;
    setIsSubmitting(true);
    setAddTableError(null);
    setErrorMsg(null);
    const res = await mergeTables(session.id, [selectedTableToMerge], branchId);
    setIsSubmitting(false);
    if (res.success) {
      setIsAddTableModalOpen(false);
      setSelectedTableToMerge("");
      onRefresh();
    } else {
      setAddTableError(res.error || "Failed to merge table");
    }
  };

  const handleSplitSession = async () => {
    if (!selectedTableToSplit) return;
    setIsSubmitting(true);
    const res = await splitSession(session.id, selectedTableToSplit, branchId);
    setIsSubmitting(false);
    if (res.success) {
      setIsSplitSessionModalOpen(false);
      setSelectedTableToSplit("");
      onRefresh();
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to split session");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || payAmount <= 0) return;
    setIsSubmitting(true);
    await recordBillPayment(bill.id, payAmount, payMethod, payerName.trim() || undefined);
    setIsSubmitting(false);
    setIsPaymentModalOpen(false);
    setPayAmount(0);
    onRefresh();
  };

  const handleConfirmSplitBill = async () => {
    if (!bill) return;
    setIsSubmitting(true);
    await splitBill(bill.id, splitCount);
    setIsSubmitting(false);
    setIsSplitBillModalOpen(false);
    onRefresh();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full md:w-[480px] lg:w-[560px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/70 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-brand-secondary tracking-tight">
                {mergedLabels}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-primary-light text-brand-primary font-bold text-xs border border-brand-primary/20">
                {table.section_name}
              </span>
            </div>

            {/* Sub-header info row: start time, guest count, device count */}
            <div className="flex items-center gap-3 text-xs text-brand-text-muted mt-1 font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand-primary" />
                <span>Started {startTime}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-brand-secondary font-bold" title="Party Size">
                <Users className="h-3.5 w-3.5 text-brand-primary" />
                <span>{session.guest_count}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-brand-secondary font-bold">
                <Smartphone className="h-3.5 w-3.5 text-brand-text-muted" />
                <span>{Math.max(1, session.device_count || 1)}</span>
              </span>
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

        {errorMsg && (
          <div className="m-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 4 TABS: Live / Bill / Guests / Activity */}
        <div className="px-4 border-b border-brand-border bg-white flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "live"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-text-muted hover:text-brand-secondary"
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Live</span>
            {(unservedItems.length > 0 || openRequests.length > 0) && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-brand-primary text-white text-[10px]">
                {unservedItems.length + openRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bill")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "bill"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-text-muted hover:text-brand-secondary"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Bill</span>
            {dueAmount > 0 && (
              <span className="ml-1 text-[11px] font-black text-rose-600">
                ₹{dueAmount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("devices")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "devices"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-text-muted hover:text-brand-secondary"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Companions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-brand-primary-light text-brand-primary text-[10px] font-black">
              {devices.length || Math.max(1, session.device_count || 1)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "activity"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-text-muted hover:text-brand-secondary"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Activity</span>
          </button>
        </div>

        {/* TAB 1: LIVE */}
        {activeTab === "live" && (
          <div className="flex-1 flex flex-col min-h-0 bg-brand-background">
            
            {/* CONTEXTUAL ACTION BAR */}
            <div className="p-3 bg-white border-b border-brand-border flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0">
              <button
                type="button"
                onClick={onOpenAddOrder}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>+ Add Order</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewRequestOpen(true)}
                className="px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>+ Request</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareQRModalOpen(true)}
                className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 flex items-center gap-1.5 whitespace-nowrap"
              >
                <QrCode className="h-3.5 w-3.5 text-purple-600" />
                <span>Session QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAddTableError(null);
                  setSelectedTableToMerge("");
                  setIsAddTableModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted flex items-center gap-1.5 whitespace-nowrap"
              >
                <GitMerge className="h-3.5 w-3.5 text-purple-600" />
                <span>Add Table</span>
              </button>

              {session.merged_table_ids.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsSplitSessionModalOpen(true)}
                  className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Split className="h-3.5 w-3.5" />
                  <span>Split Session</span>
                </button>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReleaseTable}
                className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 flex items-center gap-1.5 whitespace-nowrap ml-auto"
              >
                <Unlink className="h-3.5 w-3.5" />
                <span>Release Table</span>
              </button>
            </div>

            {/* LIVE CONTENT: UNSERVED ITEMS & OPEN REQUESTS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* OPEN CUSTOMER REQUESTS */}
              {openRequests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Customer Requests</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                      {openRequests.length}
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {openRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-2xl border border-amber-200 bg-amber-50/70 shadow-2xs relative overflow-hidden flex items-center justify-between"
                      >
                        <div className="pr-4">
                          <span className="text-xs font-black text-amber-950 uppercase tracking-wide block">
                            {req.type.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-amber-700 block mt-0.5">
                            Requested by {req.requested_by} at{" "}
                            {new Date(req.requested_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFulfillRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-2xs transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Fulfill</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UNSERVED ITEMS LIST */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <span>Kitchen / Unserved Items</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-brand-surface-muted text-brand-secondary text-[10px]">
                    {unservedItems.length}
                  </span>
                </h3>

                {unservedItems.length === 0 ? (
                  <div className="p-6 text-center text-brand-text-muted bg-white rounded-2xl border border-brand-border">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-500 opacity-60" />
                    <p className="text-xs font-semibold text-brand-secondary">All items served</p>
                    <p className="text-[11px] text-brand-text-muted mt-0.5">
                      Tap "+ Add Order" above to fire new dishes to the kitchen.
                    </p>
                  </div>
                ) : (
                  unservedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white border border-brand-border shadow-2xs relative overflow-hidden"
                    >
                      {/* Corner label: "Requested by [staff/customer name] at [time]" */}
                      <div className="absolute top-0 right-0 bg-brand-surface-muted text-brand-text-muted text-[10px] font-semibold px-2 py-0.5 rounded-bl-xl border-l border-b border-brand-border">
                        Requested by {canViewCustomerInfo || item.requestedBy === "Staff" ? item.requestedBy : maskCustomerName(item.requestedBy)} at {item.time}
                      </div>

                      <div className="pr-36">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-secondary">
                            {item.quantity}x {item.itemName}
                          </span>
                        </div>
                        {item.notes && (
                          <span className="text-[10px] text-orange-600 block mt-0.5 italic">
                            {item.notes}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-brand-border/60 text-xs">
                        <span className="font-black text-brand-secondary">₹{item.price * item.quantity}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === "ready"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {item.status === "ready" ? "Ready to Serve" : "Preparing"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BILL */}
        {activeTab === "bill" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-background">
            {/* BILL SUMMARY CARD */}
            <div className="p-4 rounded-3xl bg-white border border-brand-border shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-brand-text-muted font-bold uppercase tracking-wider">
                    Running Total
                  </span>
                  <div className="text-2xl font-black text-brand-secondary mt-0.5">
                    ₹{totalAmount}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-brand-text-muted font-bold uppercase tracking-wider">
                    Due Amount
                  </span>
                  <div className="text-xl font-black text-rose-600 mt-0.5">
                    ₹{dueAmount}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-text-muted">
                <span>Paid So Far: ₹{paidAmount}</span>
                {bill?.split_count && bill.split_count > 1 && (
                  <span className="text-indigo-600 font-bold">
                    Split into {bill.split_count} shares (₹{Math.round(totalAmount / bill.split_count)}/share)
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount(dueAmount);
                    setIsPaymentModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Record Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSplitBillModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted flex items-center gap-1.5 transition-colors"
                >
                  <Split className="h-4 w-4" />
                  <span>Split Bill</span>
                </button>
              </div>
            </div>

            {/* BILL ACTIVITY LOG / PAYMENTS */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                Payment History
              </h3>

              {!bill?.payments || bill.payments.length === 0 ? (
                <p className="text-xs text-brand-text-muted italic p-3 bg-white rounded-xl border border-brand-border">
                  No payments recorded yet for this session tab.
                </p>
              ) : (
                bill.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-white border border-brand-border shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-brand-secondary block">
                        ₹{p.amount} via {p.payment_method.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-brand-text-muted block">
                        {p.payer_name ? `Paid by ${canViewCustomerInfo ? p.payer_name : maskCustomerName(p.payer_name)} • ` : ""}
                        {new Date(p.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Success
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICES & MODERATION (Story 15.7 Workflow 3) */}
        {activeTab === "devices" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-background">
            
            {/* Action Bar: Invite Companion & Refresh */}
            <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-50 via-purple-100/50 to-indigo-50 border border-purple-200/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-950">
                    Session Devices ({devices.length || Math.max(1, session.device_count || 1)})
                  </h4>
                  <p className="text-[10px] text-purple-800 leading-tight">
                    Manage connected diner devices on Table {mergedLabels}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsShareQRModalOpen(true)}
                  className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Session QR</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {deviceActionError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1">{deviceActionError}</span>
                <button
                  type="button"
                  onClick={() => setDeviceActionError(null)}
                  className="text-rose-500 hover:text-rose-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* DEVICES LIST */}
            <div className="space-y-3">
              {isLoadingDevices && devices.length === 0 ? (
                <div className="py-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
                  <span className="text-xs">Loading session devices...</span>
                </div>
              ) : (
                <>
                  {/* 1. Host Device Card (Primary / Seated) */}
                  <div className="p-4 rounded-3xl bg-white border-2 border-emerald-300/80 shadow-brandCard space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                        <ShieldCheck className="h-3 w-3 text-emerald-700" />
                        <span>Host • Primary / Seated</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Session Owner
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-brand-secondary">
                          {canViewCustomerInfo
                            ? (session.customer_name || "Primary Seated Guest")
                            : maskCustomerName(session.customer_name || "Primary Seated Guest")}
                        </h4>
                        <p className="text-xs text-brand-text-muted font-mono mt-0.5">
                          +91 {canViewCustomerInfo ? session.mobile_number : maskPhoneNumber(session.mobile_number)}
                        </p>
                      </div>
                      <div className="text-right text-[10px] text-brand-text-muted">
                        <span className="font-semibold text-brand-secondary">Started:</span> {startTime}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-text-muted">
                      <span>Device Token: {session.id.slice(0, 8)}...</span>
                      <span className="text-[10px] italic text-emerald-800 font-medium">Non-removable Host</span>
                    </div>
                  </div>

                  {/* 2. Companion Devices */}
                  {devices.filter((d) => d.role !== "HOST").length === 0 ? (
                    <div className="p-6 rounded-3xl bg-white border border-dashed border-brand-border text-center space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-2xl bg-brand-surface-muted text-brand-text-muted flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <h5 className="text-xs font-bold text-brand-secondary">No Companion Devices</h5>
                      <p className="text-[11px] text-brand-text-muted max-w-xs mx-auto">
                        Table companions can scan the Session QR code or join link to view the menu and order together.
                      </p>
                    </div>
                  ) : (
                    devices
                      .filter((d) => d.role !== "HOST")
                      .map((dev) => {
                        const canModerate = canModerateDevices(currentUser || undefined);
                        const isBlocked = dev.status === "BLOCKED";
                        const isRemoved = dev.status === "REMOVED";
                        const isActive = dev.status === "ACTIVE";

                        return (
                          <div
                            key={dev.id}
                            className={`p-4 rounded-3xl bg-white border transition-all space-y-3 ${
                              isBlocked
                                ? "border-red-300 bg-red-50/20"
                                : isRemoved
                                ? "border-amber-200 bg-amber-50/20"
                                : "border-brand-border shadow-2xs hover:border-brand-primary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black border border-purple-200">
                                <Users className="h-3 w-3 text-purple-700" />
                                <span>Companion</span>
                              </div>

                              <div>
                                {isActive && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Connected</span>
                                  </span>
                                )}
                                {isRemoved && (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                                    Removed
                                  </span>
                                )}
                                {isBlocked && (
                                  <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                                    1-Hr Ban
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-black text-brand-secondary">
                                  {canViewCustomerInfo ? dev.customer_name : maskCustomerName(dev.customer_name)}
                                </h4>
                                <p className="text-xs text-brand-text-muted font-mono mt-0.5">
                                  +91 {canViewCustomerInfo ? dev.mobile_number : maskPhoneNumber(dev.mobile_number)}
                                </p>
                              </div>
                              <div className="text-right text-[10px] text-brand-text-muted">
                                <span className="font-semibold text-brand-secondary">Joined:</span>{" "}
                                {new Date(dev.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>

                            {/* Moderation Controls (Story 15.7 Section 4: Requires block.customer / supervisor) */}
                            {isActive && canModerate && (
                              <div className="pt-2.5 border-t border-brand-border/60 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setConfirmActionDevice({ device: dev, action: "REMOVE" })}
                                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1 transition-all"
                                >
                                  <UserX className="h-3.5 w-3.5 text-amber-700" />
                                  <span>Remove</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setConfirmActionDevice({ device: dev, action: "BLOCK" })}
                                  className="px-3 py-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-900 text-xs font-bold inline-flex items-center gap-1 transition-all"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5 text-red-700" />
                                  <span>Block (1-Hr Ban)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* CONFIRMATION MODAL: REMOVE OR BLOCK DEVICE (Story 15.7 Workflow 3) */}
        {confirmActionDevice && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                    confirmActionDevice.action === "BLOCK"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {confirmActionDevice.action === "BLOCK" ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <UserX className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-secondary">
                      {confirmActionDevice.action === "BLOCK"
                        ? "Block Customer (1-Hour Ban)"
                        : "Remove from Session"}
                    </h4>
                    <p className="text-[11px] text-brand-text-muted">
                      {canViewCustomerInfo ? confirmActionDevice.device.customer_name : maskCustomerName(confirmActionDevice.device.customer_name)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessingDeviceAction}
                  onClick={() => setConfirmActionDevice(null)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-brand-text-secondary leading-relaxed">
                {confirmActionDevice.action === "BLOCK"
                  ? `Are you sure you want to block "${canViewCustomerInfo ? confirmActionDevice.device.customer_name : maskCustomerName(confirmActionDevice.device.customer_name)}" across the entire outlet for 1 hour? Their device will be banned from joining or starting any table sessions for 60 minutes.`
                  : `Are you sure you want to remove "${canViewCustomerInfo ? confirmActionDevice.device.customer_name : maskCustomerName(confirmActionDevice.device.customer_name)}" from Table ${mergedLabels}? Their device will be disconnected immediately without page refresh.`}
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessingDeviceAction}
                  onClick={() => setConfirmActionDevice(null)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border bg-white text-brand-secondary text-xs font-bold hover:bg-brand-surface-muted transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isProcessingDeviceAction}
                  onClick={() => {
                    if (confirmActionDevice.action === "BLOCK") {
                      handleBlockDevice(confirmActionDevice.device);
                    } else {
                      handleRemoveDevice(confirmActionDevice.device);
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                    confirmActionDevice.action === "BLOCK"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isProcessingDeviceAction ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {confirmActionDevice.action === "BLOCK"
                        ? "Confirm 1-Hour Ban"
                        : "Remove Device"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVITY (Audit History & Quick Actions) */}
        {activeTab === "activity" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-background">
            {session.activity_logs && session.activity_logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                  Activity Log & Quick Actions
                </h3>
                <div className="p-3.5 rounded-3xl bg-white border border-brand-border shadow-2xs max-h-72 overflow-y-auto">
                  <ActivityLogList 
                    entries={session.activity_logs} 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                Orders & Timeline
              </h3>
              <div className="space-y-2.5">
                {/* Session started event */}
                <div className="p-3 rounded-2xl bg-white border border-brand-border text-xs space-y-1">
                  <div className="flex items-center justify-between text-brand-secondary font-bold">
                    <span>Session Started</span>
                    <span className="text-brand-text-muted font-normal text-[10px]">{startTime}</span>
                  </div>
                  <p className="text-[11px] text-brand-text-muted">
                    Seated with {session.guest_count} guests on {mergedLabels}.
                  </p>
                </div>

                {/* Orders events */}
                {session.orders.map((o, idx) => (
                  <div key={o.id} className="p-3 rounded-2xl bg-white border border-brand-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-brand-secondary font-bold">
                      <span>Order #{idx + 1} Fired</span>
                      <span className="text-brand-text-muted font-normal text-[10px]">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-text-muted">
                      {o.items.length} items ordered ({o.items.map((i) => `${i.quantity}x ${i.item_name}`).join(", ")})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RECORD PAYMENT */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <form
              onSubmit={handleRecordPayment}
              className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">Record Payment</h4>
                  <p className="text-xs text-brand-text-muted">Outstanding Due: ₹{dueAmount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary block">Amount (₹):</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={dueAmount || undefined}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-secondary focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary block">Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  {["cash", "upi", "card"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`p-2 rounded-xl text-xs font-bold uppercase border transition-all ${
                        payMethod === m
                          ? "border-brand-primary bg-brand-primary text-white"
                          : "border-brand-border text-brand-text-secondary hover:bg-brand-surface-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary block">Payer Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || payAmount <= 0}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Recording..." : `Confirm Payment of ₹${payAmount}`}
              </button>
            </form>
          </div>
        )}

        {/* MODAL: SPLIT BILL */}
        {isSplitBillModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">Split Bill</h4>
                  <p className="text-xs text-brand-text-muted">
                    Divide total amount among payers (does not split session)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSplitBillModalOpen(false)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-brand-surface-muted space-y-1">
                <span className="text-xs text-brand-text-muted">Total Bill: ₹{totalAmount}</span>
                <div className="text-sm font-black text-brand-secondary">
                  ₹{Math.round(totalAmount / splitCount)} per person ({splitCount} shares)
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary block">Number of Payers:</label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSplitCount(count)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        splitCount === count
                          ? "border-brand-primary bg-brand-primary text-white"
                          : "border-brand-border text-brand-text-secondary hover:bg-brand-surface-muted"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSplitBill}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors"
              >
                Apply Split
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD TABLE (Merge another table in) */}
        {isAddTableModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">Add Table to Session</h4>
                  <p className="text-xs text-brand-text-muted">
                    Merge another table from {table.section_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTableModalOpen(false)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {addTableError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{addTableError}</span>
                </div>
              )}

              {availableToMerge.length === 0 ? (
                <p className="text-xs text-brand-text-muted italic p-3 bg-brand-surface-muted rounded-xl">
                  No other available tables in this section.
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1">
                      Select Available Table
                    </label>
                    <select
                      value={selectedTableToMerge}
                      onChange={(e) => {
                        setSelectedTableToMerge(e.target.value);
                        setAddTableError(null);
                      }}
                      className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary font-medium"
                    >
                      <option value="">-- Choose an Available Table --</option>
                      {availableToMerge.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.short_code || t.table_name} (Seats {t.seating_capacity || 4})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedTableToMerge || isSubmitting}
                    onClick={handleAddTableMerge}
                    className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Merging Table...</span>
                      </>
                    ) : (
                      <span>Confirm Merge</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: SPLIT SESSION (Unmerge table physically) */}
        {isSplitSessionModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">Split Session</h4>
                  <p className="text-xs text-brand-text-muted">
                    Detaches chosen table into an independent session for future orders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSplitSessionModalOpen(false)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-secondary block">
                  Select Table to Detach:
                </span>
                <select
                  value={selectedTableToSplit}
                  onChange={(e) => setSelectedTableToSplit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                >
                  <option value="">-- Choose Table --</option>
                  {session.merged_table_ids.map((id, index) => (
                    <option key={id} value={id}>
                      {session.merged_table_labels[index] || "Table"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={!selectedTableToSplit || isSubmitting}
                onClick={handleSplitSession}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-50"
              >
                Confirm Session Split
              </button>
            </div>
          </div>
        )}

        {/* MODAL: CREATE CUSTOMER REQUEST */}
        {isNewRequestOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">New Service Request</h4>
                  <p className="text-xs text-brand-text-muted">Table {mergedLabels}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRequestOpen(false)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary block">Request Type:</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                >
                  <option value="call_waiter">Call Waiter</option>
                  <option value="tissue">Request Tissue</option>
                  <option value="water">Request Water</option>
                  <option value="cleaning">Request Cleaning</option>
                  <option value="cutlery">Request Cutlery</option>
                  <option value="other">Other Request</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateRequest}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* SHAREABLE SESSION QR MODAL (Story 15.6 Section 2.C) */}
        <ShareSessionQRModal
          isOpen={isShareQRModalOpen}
          onClose={() => setIsShareQRModalOpen(false)}
          sessionId={session.id}
          tableLabel={mergedLabels}
        />
      </div>
    </div>
  );
}
