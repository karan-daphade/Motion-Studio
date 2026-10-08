"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Flame, 
  Receipt, 
  Users, 
  History, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  Bell, 
  ArrowRight, 
  UtensilsCrossed, 
  Loader2,
  X,
  GlassWater,
  FileText,
  Utensils,
  HelpCircle,
  ShieldCheck,
  Phone,
  Clock
} from "lucide-react";
import { appName } from "@/config/branding";
import ShareSessionQRModal from "@/components/operations/ShareSessionQRModal";
import { 
  createCustomerRequest,
  getSessionDevices,
  SessionDeviceItem
} from "@/app/actions/operations-tables-actions";
import { createClient } from "@/lib/supabase/client";
import ActivityLogList, { ActivityLogItem } from "@/components/operations/ActivityLogList";

export interface DiningSessionData {
  id: string;
  table_id: string;
  table_label: string;
  customer_name?: string;
  guest_count: number;
  started_at: string;
  branch_id?: string;
  branch_name?: string;
  section_name?: string;
  device_count?: number;
  mobile_number?: string;
  activity_logs?: ActivityLogItem[];
  orders?: Array<{
    id: string;
    items: Array<{
      id: string;
      item_name: string;
      quantity: number;
      price_at_order: number;
      status: string;
      created_at: string;
    }>;
  }>;
  requests?: Array<{
    id: string;
    type: string;
    status: string;
    requested_at: string;
    requested_by: string;
  }>;
  bill?: {
    total_amount: number;
    paid_amount: number;
    status: string;
  };
}

interface UnifiedDiningSessionPanelProps {
  session: DiningSessionData;
  isCustomerView?: boolean;
  branchName?: string;
  onRefresh?: () => void;
  onClose?: () => void;
}

function formatTableLabel(lbl?: string): string {
  if (!lbl) return "Table";
  const trimmed = lbl.trim();
  const stripped = trimmed.replace(/^(table\s*)+/i, "").trim();
  return stripped ? `Table ${stripped}` : "Table";
}

function extractShortTableToken(lbl?: string): string {
  if (!lbl) return "T";
  const trimmed = lbl.trim();
  const match = trimmed.match(/\d+/);
  if (match) return match[0];
  const stripped = trimmed.replace(/^(table\s*)+/i, "").trim();
  return stripped ? stripped.slice(0, 3).toUpperCase() : "T";
}

export default function UnifiedDiningSessionPanel({
  session,
  isCustomerView = true,
  branchName,
  onRefresh,
  onClose,
}: UnifiedDiningSessionPanelProps) {
  const [activeTab, setActiveTab] = useState<"live" | "bill" | "guests" | "activity">("live");
  const [isShareQRModalOpen, setIsShareQRModalOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState<string>("call_waiter");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  // Connected companions state
  const [devices, setDevices] = useState<SessionDeviceItem[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const sessionId = session?.id;
  const branchId = session?.branch_id;

  const fetchDevices = useCallback(async () => {
    if (!sessionId) return;
    setIsLoadingDevices(true);
    try {
      const res = await getSessionDevices({
        sessionId,
        branchId,
        canViewPhone: true, // Display full numbers to dining companions per user preference
        canViewCustomerDetails: true,
      });
      if (res.success) {
        setDevices(res.devices);
      }
    } catch (err) {
      console.error("Error fetching companion devices:", err);
    } finally {
      setIsLoadingDevices(false);
    }
  }, [sessionId, branchId]);

  useEffect(() => {
    if (!sessionId) return;
    fetchDevices();

    const supabase = createClient();
    const channel = supabase
      .channel(`cust_session_devices_${sessionId}`)
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
  }, [sessionId, fetchDevices]);

  const startTime = session.started_at
    ? new Date(session.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  const orders = session.orders || [];
  const requests = session.requests || [];
  const bill = session.bill || { total_amount: 0, paid_amount: 0, status: "pending" };

  // Calculate unserved items
  const unservedItems: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    status: string;
    time: string;
  }> = [];

  orders.forEach((o) => {
    (o.items || []).forEach((it) => {
      unservedItems.push({
        id: it.id,
        name: it.item_name,
        quantity: it.quantity,
        price: it.price_at_order,
        status: it.status,
        time: new Date(it.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    });
  });

  const openRequests = requests.filter((r) => r.status === "open");
  const tableShortToken = extractShortTableToken(session.table_label);

  // Handle service request submission
  const handleSendServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);
    setRequestSuccessMsg(null);

    try {
      const requester = session.customer_name || "Customer";
      const res = await createCustomerRequest(session.id, requestType, requester);
      if (res.success) {
        setRequestSuccessMsg(`Staff alerted for ${requestType.replace("_", " ")}!`);
        setTimeout(() => {
          setIsNewRequestOpen(false);
          setRequestSuccessMsg(null);
        }, 1500);
        if (onRefresh) onRefresh();
      }
    } catch {
      // Ignored
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-brand-border/80 shadow-brandCard overflow-hidden flex flex-col text-left transition-all">
      {/* 1. HERO SECTION */}
      <div className="p-4 sm:p-5 border-b border-brand-border/70 bg-gradient-to-br from-emerald-50/70 via-white to-brand-primary-light/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-xs shrink-0 select-none">
              {tableShortToken}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-brand-secondary tracking-tight">
                  {formatTableLabel(session.table_label)}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
              <p className="text-xs text-brand-text-muted mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                {session.customer_name ? (
                  <span>Guest: <strong className="text-brand-secondary font-semibold">{session.customer_name}</strong></span>
                ) : (
                  <span>Dine-In Guest</span>
                )}
                <span>•</span>
                <span>{session.guest_count} {session.guest_count === 1 ? "Guest" : "Guests"}</span>
                <span>•</span>
                <span>Since {startTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Shareable QR Companion Button */}
            <button
              type="button"
              onClick={() => setIsShareQRModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Share Table QR with Companions"
            >
              <QrCode className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold">Share QR</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PRIMARY QUICK ACTIONS BAR */}
      <div className="p-3.5 sm:p-4 bg-brand-surface border-b border-brand-border/60">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/customer"
            className="flex-1 py-3 px-4 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs sm:text-sm flex items-center justify-between gap-2 shadow-brandCard hover:shadow-brandHover transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white/20">
                <UtensilsCrossed className="h-4 w-4 text-white" />
              </div>
              <span>Browse Menu & Order</span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={() => setIsNewRequestOpen(true)}
            className="py-3 px-3.5 sm:px-4 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Bell className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Call Waiter</span>
          </button>
        </div>
      </div>

      {/* 3. MODERN SEGMENTED TABS */}
      <div className="px-3 sm:px-4 pt-3 pb-1 bg-white">
        <div className="p-1 rounded-2xl bg-brand-surface-muted/80 flex items-center gap-1">
          {[
            { key: "live", label: "Live Orders", icon: Flame, badge: unservedItems.length + openRequests.length },
            { key: "bill", label: "Bill", icon: Receipt, sublabel: bill.total_amount > 0 ? `₹${bill.total_amount.toFixed(0)}` : undefined },
            { key: "guests", label: "Companions", icon: Users, badge: devices.filter((d) => d.role !== "HOST" && d.status === "ACTIVE").length || undefined },
            { key: "activity", label: "Timeline", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 sm:py-2.5 px-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-brand-secondary shadow-xs font-black"
                    : "text-brand-text-muted hover:text-brand-secondary hover:bg-white/50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-brand-primary" : "text-brand-text-muted"}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0">
                    {tab.badge}
                  </span>
                )}
                {tab.sublabel && (
                  <span className="hidden sm:inline text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md font-bold shrink-0">
                    {tab.sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="p-3.5 sm:p-5 flex-1 bg-white">
        {/* ================================================================= */}
        {/* TAB 1: LIVE (Orders & Requests)                                  */}
        {/* ================================================================= */}
        {activeTab === "live" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Open Service Requests Alert */}
            {openRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Bell className="h-3 w-3 text-amber-600" />
                  <span>Pending Service Requests</span>
                </h4>
                {openRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold">
                        {req.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-[11px] text-brand-text-muted">
                        Requested {new Date(req.requested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold animate-pulse">
                      Staff Alerted
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Unserved Items Pipeline */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-brand-text-muted flex items-center justify-between">
                <span>Active Table Orders</span>
                <span className="font-mono text-brand-secondary font-bold">({unservedItems.length})</span>
              </h4>

              {unservedItems.length === 0 ? (
                <div className="py-10 px-4 rounded-3xl bg-gradient-to-b from-brand-background/60 to-white border border-brand-border/70 text-center space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-3xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-xs">
                    <UtensilsCrossed className="h-8 w-8 text-brand-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-brand-secondary">Your table is ready to order!</h4>
                    <p className="text-xs text-brand-text-muted max-w-sm mx-auto leading-relaxed">
                      Browse chef specials, beverages, and mains. Dishes will appear here with live preparation updates.
                    </p>
                  </div>
                  <div className="pt-1">
                    <Link
                      href="/customer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs shadow-brandCard transition-all active:scale-95"
                    >
                      <UtensilsCrossed className="h-3.5 w-3.5" />
                      <span>Explore Digital Menu</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {unservedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-brand-border/80 bg-white shadow-2xs flex items-center justify-between hover:border-brand-primary/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-brand-secondary">
                            {item.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-brand-surface-muted text-brand-secondary font-mono text-[10px] font-bold">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-brand-text-muted">
                          Ordered {item.time} • ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === "ready"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : item.status === "preparing"
                            ? "bg-blue-100 text-blue-800 border-blue-200 animate-pulse"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: BILL SUMMARY                                               */}
        {/* ================================================================= */}
        {activeTab === "bill" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-brand-border shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-brand-secondary uppercase tracking-wider">Running Tab</h4>
                <span className="text-[11px] font-mono text-brand-text-muted">#{session.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-brand-border/60">
                <span className="text-xs text-brand-text-secondary">Subtotal Orders</span>
                <span className="text-base font-black text-brand-secondary font-mono">
                  ₹{bill.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-brand-text-muted">
                <span>Paid So Far</span>
                <span className="font-mono font-bold text-emerald-600">
                  ₹{bill.paid_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm font-black pt-3 border-t border-brand-border text-brand-primary">
                <span>Balance Due</span>
                <span className="font-mono text-xl sm:text-2xl font-black">
                  ₹{Math.max(0, bill.total_amount - bill.paid_amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
              <Receipt className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Bill settlements and cash/UPI payments are processed by waitstaff upon checkout.</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: COMPANIONS & DINING PARTNERS                               */}
        {/* ================================================================= */}
        {activeTab === "guests" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Invite Companions Action Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-50 via-purple-100/40 to-indigo-50 border border-purple-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-purple-950">
                      Invite Companions to Table
                    </h4>
                    <p className="text-[11px] text-purple-800 font-medium">
                      Share table access with friends or family seated with you
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsShareQRModalOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Show Table QR</span>
                </button>
              </div>

              <p className="text-[11px] sm:text-xs text-purple-900/90 leading-relaxed bg-white/70 p-2.5 rounded-2xl border border-purple-200/60">
                Anyone seated at {formatTableLabel(session.table_label)} can scan this QR code to join this session, add items to the cart, and follow orders in real time.
              </p>
            </div>

            {/* 1. Host Device Card (Primary Seated Guest) */}
            <div className="p-4 rounded-3xl bg-white border-2 border-emerald-300/80 shadow-2xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Host • Primary Diner</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Session</span>
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">
                    {session.customer_name || "Primary Seated Guest"}
                  </h4>
                  {session.mobile_number && (
                    <p className="text-xs text-brand-text-muted font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-brand-text-muted" />
                      <span>+91 {session.mobile_number}</span>
                    </p>
                  )}
                </div>
                <div className="text-right text-[10px] text-brand-text-muted">
                  <span className="font-semibold text-brand-secondary">Started:</span> {startTime}
                </div>
              </div>

              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-text-muted">
                <span>Party Size: <strong className="text-brand-secondary font-bold">{session.guest_count} {session.guest_count === 1 ? "Guest" : "Guests"}</strong></span>
                <span className="text-[10px] font-mono text-brand-text-secondary">Token #{session.id.slice(0, 8)}</span>
              </div>
            </div>

            {/* 2. Companion Devices Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Joined Companions ({devices.filter((d) => d.role !== "HOST" && d.status === "ACTIVE").length})</span>
                </h4>
                {isLoadingDevices && (
                  <span className="text-[10px] text-brand-text-muted flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin text-brand-primary" />
                    <span>Updating...</span>
                  </span>
                )}
              </div>

              {isLoadingDevices && devices.length === 0 ? (
                <div className="py-8 text-center text-brand-text-muted flex flex-col items-center gap-2 bg-white rounded-3xl border border-brand-border">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="text-xs">Checking table companions...</span>
                </div>
              ) : devices.filter((d) => d.role !== "HOST").length === 0 ? (
                <div className="p-6 rounded-3xl bg-white border border-dashed border-brand-border text-center space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <h5 className="text-xs font-bold text-brand-secondary">No Companions Joined Yet</h5>
                  <p className="text-[11px] text-brand-text-muted max-w-xs mx-auto">
                    Your dining partners can scan the table QR code to join this session and order dishes together.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {devices
                    .filter((d) => d.role !== "HOST")
                    .map((dev) => {
                      const isActive = dev.status === "ACTIVE";
                      const isRemoved = dev.status === "REMOVED";
                      const isBlocked = dev.status === "BLOCKED";

                      return (
                        <div
                          key={dev.id}
                          className={`p-3.5 rounded-3xl bg-white border transition-all space-y-2.5 ${
                            isBlocked
                              ? "border-red-200 bg-red-50/20 opacity-70"
                              : isRemoved
                              ? "border-amber-200 bg-amber-50/20 opacity-70"
                              : "border-brand-border shadow-2xs hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-200">
                              <Users className="h-3 w-3 text-purple-700" />
                              <span>Companion Diner</span>
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
                                  Disconnected
                                </span>
                              )}
                              {isBlocked && (
                                <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-black text-brand-secondary">
                                {dev.customer_name || "Companion Diner"}
                              </h4>
                              {dev.mobile_number && (
                                <p className="text-xs text-brand-text-muted font-mono mt-0.5 flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-brand-text-muted" />
                                  <span>+91 {dev.mobile_number}</span>
                                </p>
                              )}
                            </div>
                            <div className="text-right text-[10px] text-brand-text-muted">
                              <span className="font-semibold text-brand-secondary">Joined:</span>{" "}
                              {new Date(dev.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ACTIVITY LOG & TIMELINE                                    */}
        {/* ================================================================= */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Real Activity Logs if available */}
            {session.activity_logs && session.activity_logs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-brand-text-muted">
                  Recent Activities
                </h4>
                <div className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-2xs max-h-72 overflow-y-auto">
                  <ActivityLogList entries={session.activity_logs} />
                </div>
              </div>
            )}

            {/* Orders & Requests Live Timeline */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-brand-text-muted">
                Session Timeline
              </h4>
              <div className="space-y-2">
                {/* Session Started Milestone */}
                <div className="p-3 rounded-2xl bg-white border border-brand-border text-xs space-y-1">
                  <div className="flex items-center justify-between text-brand-secondary font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Session Started</span>
                    </span>
                    <span className="text-brand-text-muted font-normal text-[10px]">{startTime}</span>
                  </div>
                  <p className="text-[11px] text-brand-text-muted pl-5.5">
                    Seated with {session.guest_count} at {formatTableLabel(session.table_label)}.
                  </p>
                </div>

                {/* Orders Placed Milestones */}
                {orders.map((o, idx) => (
                  <div key={o.id} className="p-3 rounded-2xl bg-white border border-brand-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-brand-secondary font-bold">
                      <span className="flex items-center gap-1.5">
                        <UtensilsCrossed className="h-4 w-4 text-brand-primary shrink-0" />
                        <span>Order #{idx + 1} Placed</span>
                      </span>
                      <span className="text-brand-text-muted font-normal text-[10px]">
                        {new Date(o.items?.[0]?.created_at || session.started_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-text-muted pl-5.5">
                      {o.items.length} items ordered ({o.items.map((i) => `${i.quantity}x ${i.item_name}`).join(", ")})
                    </p>
                  </div>
                ))}

                {/* Service Request Milestones */}
                {requests.map((r) => (
                  <div key={r.id} className="p-3 rounded-2xl bg-white border border-brand-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-brand-secondary font-bold">
                      <span className="flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Service Request: {r.type.replace(/_/g, " ").toUpperCase()}</span>
                      </span>
                      <span className="text-brand-text-muted font-normal text-[10px]">
                        {new Date(r.requested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-text-muted pl-5.5">
                      Status: {r.status === "open" ? "Pending staff response" : "Fulfilled"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL: CALL WAITER / SERVICE REQUEST */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-brand-border space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-secondary">Call Waiter / Staff</h3>
                  <p className="text-[11px] text-brand-text-muted">{formatTableLabel(session.table_label)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRequestOpen(false)}
                className="p-1 rounded-lg text-brand-text-muted hover:text-brand-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {requestSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">{requestSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendServiceRequest} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "call_waiter", label: "Call Waiter", icon: Bell, color: "text-amber-600" },
                    { id: "water", label: "Water", icon: GlassWater, color: "text-blue-500" },
                    { id: "tissue", label: "Tissues", icon: FileText, color: "text-slate-600" },
                    { id: "cutlery", label: "Cutlery", icon: Utensils, color: "text-emerald-600" },
                    { id: "cleaning", label: "Clean Table", icon: Sparkles, color: "text-purple-600" },
                    { id: "other", label: "Assistance", icon: HelpCircle, color: "text-orange-500" },
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRequestType(item.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          requestType === item.id
                            ? "bg-amber-50 border-amber-500 text-amber-950 shadow-xs"
                            : "bg-white border-brand-border text-brand-secondary hover:bg-brand-surface-muted"
                        }`}
                      >
                        <IconComp className={`h-4 w-4 shrink-0 ${item.color}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-brand-border/60">
                  <button
                    type="button"
                    onClick={() => setIsNewRequestOpen(false)}
                    className="flex-1 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="flex-1 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingRequest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Alert Waitstaff</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL: SHARE SESSION QR */}
      <ShareSessionQRModal
        isOpen={isShareQRModalOpen}
        onClose={() => setIsShareQRModalOpen(false)}
        sessionId={session.id}
        tableLabel={session.table_label}
        branchName={branchName || session.branch_name}
      />
    </div>
  );
}
