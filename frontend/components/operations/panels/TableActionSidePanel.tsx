"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Users, 
  Phone, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Bookmark, 
  PhoneCall, 
  AlertCircle,
  UserCheck,
  User
} from "lucide-react";
import { 
  OperationsTableItem,
  startTableSession,
  reserveTable,
  releaseTableReservation,
  seatReservedTable,
  seatAssignedCustomer,
  cancelWaitlistTableAssignment
} from "@/app/actions/operations-tables-actions";
import ActivityLogList from "@/components/operations/ActivityLogList";

interface TableActionSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  table: OperationsTableItem | null;
  branchId: string;
  currentUser?: {
    id: string;
    name: string;
    role: string;
    assigned_sections?: string[];
  };
  onSuccess?: (message: string) => void;
  onRefresh: () => void;
}

export default function TableActionSidePanel({
  isOpen,
  onClose,
  table,
  branchId,
  currentUser,
  onSuccess,
  onRefresh,
}: TableActionSidePanelProps) {
  const staffName = currentUser?.name || "Staff";
  const staffId = currentUser?.id || null;

  const [activeTab, setActiveTab] = useState<"start_session" | "reserve">("start_session");

  // Start Session fields
  const [guestCount, setGuestCount] = useState<number>(2);
  const [walkInName, setWalkInName] = useState<string>("");
  const [walkInMobile, setWalkInMobile] = useState<string>("");

  // Reserve Table fields
  const [reserveName, setReserveName] = useState<string>("");
  const [reserveMobile, setReserveMobile] = useState<string>("");
  const [reservePartySize, setReservePartySize] = useState<number>(2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentTableId = table?.id;
  const prevTableIdRef = React.useRef<string | null>(null);
  const prevIsOpenRef = React.useRef<boolean>(false);

  // Reset form only when freshly opened or switched to a different table
  // Prevents wiping out form inputs while staff is typing due to background polling / realtime floor updates
  useEffect(() => {
    if (isOpen && currentTableId) {
      if (!prevIsOpenRef.current || prevTableIdRef.current !== currentTableId) {
        setGuestCount(table?.seating_capacity ? Math.min(2, table.seating_capacity) : 2);
        setWalkInName("");
        setWalkInMobile("");
        setReserveName("");
        setReserveMobile("");
        setReservePartySize(2);
        setErrorMsg(null);
        setActiveTab("start_session");
      }
    }
    prevTableIdRef.current = currentTableId || null;
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentTableId, table?.seating_capacity]);

  if (!isOpen || !table) return null;

  const isAssigned = table.status === "assigned" || Boolean(table.assigned_waitlist_entry);
  const isReserved = table.status === "reserved" && !isAssigned;
  const reservation = table.reservation;
  const assignedEntry = table.assigned_waitlist_entry;

  // 1. Submit Walk-in Start Session
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = walkInName.trim();
    const cleanPhone = walkInMobile.trim().replace(/\D/g, "");

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter guest name (at least 2 letters).");
      return;
    }

    const indianRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !indianRegex.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      return;
    }

    if (!guestCount || guestCount < 1) {
      setErrorMsg("Party size must be at least 1 guest.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await startTableSession(
      table.id,
      guestCount,
      branchId,
      cleanName,
      cleanPhone,
      staffName,
      staffId
    );

    setIsSubmitting(false);
    if (res.success) {
      onSuccess?.(`Session started on ${table.short_code} (${guestCount} guests)`);
      onClose();
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to start session");
    }
  };

  // 2. Submit Reservation
  const handleReserveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = reserveName.trim();
    const cleanPhone = reserveMobile.trim().replace(/\D/g, "");

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter guest name (at least 2 letters).");
      return;
    }

    const indianRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !indianRegex.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      return;
    }

    if (!reservePartySize || reservePartySize < 1) {
      setErrorMsg("Party size must be at least 1 guest.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await reserveTable(
      table.id,
      cleanName,
      cleanPhone,
      reservePartySize,
      branchId,
      staffName,
      staffId
    );

    setIsSubmitting(false);
    if (res.success) {
      onSuccess?.(`Table ${table.short_code} reserved for ${cleanName}`);
      onClose();
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to reserve table");
    }
  };

  // 3. Seat Reserved Table
  const handleSeatReserved = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await seatReservedTable(table.id, branchId, staffName, staffId);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess?.(`Reserved guest seated on ${table.short_code}`);
      onClose();
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to seat reserved guest");
    }
  };

  // 4. Release Reservation
  const handleReleaseReservation = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await releaseTableReservation(table.id, branchId, staffName, staffId);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess?.(`Reservation on ${table.short_code} released`);
      onClose();
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to release reservation");
    }
  };

  // 5. Seat Assigned Waitlist Customer (1-Click Action)
  const handleSeatAssigned = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await seatAssignedCustomer(table.id, branchId, staffName, staffId);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess?.(`Waitlist customer seated on ${table.short_code}`);
      onClose();
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to seat customer");
    }
  };

  // 6. Cancel Waitlist Assignment
  const handleCancelAssignment = async () => {
    if (!assignedEntry?.id) {
      setErrorMsg("Cannot locate waitlist entry for this assigned table.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await cancelWaitlistTableAssignment(
      assignedEntry.id,
      branchId,
      staffName,
      staffId
    );
    setIsSubmitting(false);

    if (res.success) {
      onSuccess?.(`Assignment for ${table.short_code} cancelled`);
      onClose();
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to cancel assignment");
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full md:w-[460px] lg:w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* PANEL HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-3 w-3 rounded-full shrink-0 ring-4 ${
                isAssigned
                  ? "bg-indigo-600 ring-indigo-100 animate-pulse"
                  : isReserved
                  ? "bg-amber-500 ring-amber-100"
                  : "bg-emerald-500 ring-emerald-100"
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-brand-secondary tracking-tight">
                  {table.short_code}
                </h2>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                    isAssigned
                      ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                      : isReserved
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}
                >
                  {isAssigned ? "Assigned" : isReserved ? "Reserved" : "Available"}
                </span>
              </div>
              <p className="text-xs text-brand-text-muted mt-0.5">
                {table.section_name} • Deterministic QR Active
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="m-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* CASE 0: TABLE IS ASSIGNED TO WAITLIST CUSTOMER                     */}
        {/* =================================================================== */}
        {isAssigned ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Assigned Customer Card Details */}
            <div className="p-4 rounded-3xl bg-indigo-50/70 border border-indigo-200 space-y-3 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                      Waitlist Allocation
                    </span>
                    {assignedEntry?.token && (
                      <span className="text-xs font-black text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-lg border border-indigo-200">
                        #{assignedEntry.token}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-brand-secondary">
                    {assignedEntry?.customer_name || "Assigned Customer"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-brand-text-muted mt-1">
                    <span className="font-semibold text-brand-secondary">
                      {assignedEntry?.guest_count || 2} Guests
                    </span>
                    <span>•</span>
                    <span className="text-indigo-800 font-medium">Awaiting Arrival & Seating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Notice:</strong> This table is allocated exclusively for waitlist customer #{assignedEntry?.token || ""}. Starting an unassigned walk-in session on this table is restricted to prevent double-assignment.
            </div>

            {/* Actions for Assigned Table */}
            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSeatAssigned}
                className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary-hover shadow-brandCard transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                <span>Seat Customer & Start Session</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelAssignment}
                className="w-full py-3 rounded-2xl bg-white border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel Assignment (Make Table Available)
              </button>
            </div>
          </div>
        ) : isReserved ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Reservation Card Details */}
            <div className="p-4 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-3 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Active Reservation
                  </span>
                  <h3 className="text-base font-black text-brand-secondary">
                    {reservation?.guest_name || "Reserved Guest"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-brand-text-muted mt-1">
                    <span className="font-semibold text-brand-secondary">
                      {reservation?.party_size || 2} guests
                    </span>
                    <span>•</span>
                    <span>Reserved by {reservation?.created_by_name || "Staff"}</span>
                  </div>
                </div>

                {reservation?.guest_mobile && (
                  <a
                    href={`tel:${reservation.guest_mobile}`}
                    className="p-2.5 rounded-2xl bg-white border border-amber-200 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors shadow-2xs flex items-center gap-1.5"
                    title="Call guest"
                  >
                    <PhoneCall className="h-4 w-4 text-amber-700" />
                    <span>{reservation.guest_mobile}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Activity History for Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                Reservation Activity Log
              </h4>
              <div className="p-3.5 rounded-3xl bg-white border border-brand-border shadow-2xs">
                <ActivityLogList 
                  entries={reservation?.activity_logs || []} 
                  emptyMessage="Reservation logged by staff."
                />
              </div>
            </div>

            {/* Actions for Reserved Table */}
            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSeatReserved}
                className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary-hover shadow-brandCard transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                <span>Seat Guest & Start Session</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReleaseReservation}
                className="w-full py-3 rounded-2xl bg-white border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Release Reservation (Make Available)
              </button>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* CASE B: TABLE IS AVAILABLE (Choose Start Session or Reserve)        */
          /* =================================================================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TAB SELECTOR: Start Session vs Reserve Table */}
            <div className="p-3 bg-brand-background border-b border-brand-border">
              <div className="grid grid-cols-2 gap-1 p-1 bg-brand-surface-muted rounded-2xl border border-brand-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("start_session")}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "start_session"
                      ? "bg-white text-brand-secondary shadow-2xs border border-brand-border/60"
                      : "text-brand-text-muted hover:text-brand-secondary"
                  }`}
                >
                  <Play className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Start Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("reserve")}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "reserve"
                      ? "bg-white text-brand-secondary shadow-2xs border border-brand-border/60"
                      : "text-brand-text-muted hover:text-brand-secondary"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5 text-amber-600" />
                  <span>Reserve Table</span>
                </button>
              </div>
            </div>

            {/* TAB 1: START WALK-IN SESSION */}
            {activeTab === "start_session" && (
              <form onSubmit={handleStartSession} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs font-medium flex items-center gap-2">
                  <Play className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Starts an immediate dining session on Table {table.short_code}.</span>
                </div>

                {/* 1. Guest Name (Mandatory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-secondary block">
                    Guest Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 flex items-center text-brand-text-muted pointer-events-none">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-medium text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. Mobile Number (Mandatory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-secondary block">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 flex items-center gap-1 text-xs font-bold text-brand-text-muted pointer-events-none">
                      <Phone className="h-3.5 w-3.5" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={walkInMobile}
                      onChange={(e) => setWalkInMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-mono font-medium text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Party Size (Mandatory) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-secondary">
                    <span>Party Size <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] font-normal text-brand-text-muted">Capacity: {table.seating_capacity || 4}</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          guestCount === num
                            ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                            : "border-brand-border bg-brand-surface-muted/60 text-brand-secondary hover:bg-brand-surface-muted"
                        }`}
                      >
                        {num === 6 ? "6+" : num}
                      </button>
                    ))}
                  </div>

                  {/* Stepper + Input */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestCount((p) => Math.max(1, p - 1))}
                      className="h-9 w-9 rounded-xl border border-brand-border bg-white text-base font-bold text-brand-secondary hover:bg-brand-surface-muted flex items-center justify-center transition-all select-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="flex-1 rounded-xl border border-brand-border bg-white py-2 px-3 text-center text-xs font-bold text-brand-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setGuestCount((p) => Math.min(50, p + 1))}
                      className="h-9 w-9 rounded-xl border border-brand-border bg-white text-base font-bold text-brand-secondary hover:bg-brand-surface-muted flex items-center justify-center transition-all select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary-hover shadow-brandCard transition-all flex items-center justify-center gap-2 disabled:opacity-50 select-none cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    <span>{isSubmitting ? "Starting..." : `Start Session (${guestCount} Guests)`}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: RESERVE TABLE */}
            {activeTab === "reserve" && (
              <form onSubmit={handleReserveTable} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs font-medium flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Reserves Table {table.short_code} and blocks walk-in seating until seated.</span>
                </div>

                {/* 1. Guest Name (Mandatory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-secondary block">
                    Guest Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 flex items-center text-brand-text-muted pointer-events-none">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={reserveName}
                      onChange={(e) => setReserveName(e.target.value)}
                      placeholder="e.g. Ramesh Gupta"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-medium text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. Mobile Number (Mandatory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-secondary block">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 flex items-center gap-1 text-xs font-bold text-brand-text-muted pointer-events-none">
                      <Phone className="h-3.5 w-3.5" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={reserveMobile}
                      onChange={(e) => setReserveMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-mono font-medium text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Party Size (Mandatory) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-secondary">
                    <span>Party Size <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] font-normal text-brand-text-muted">Capacity: {table.seating_capacity || 4}</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReservePartySize(num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          reservePartySize === num
                            ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                            : "border-brand-border bg-brand-surface-muted/60 text-brand-secondary hover:bg-brand-surface-muted"
                        }`}
                      >
                        {num === 6 ? "6+" : num}
                      </button>
                    ))}
                  </div>

                  {/* Stepper + Input */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReservePartySize((p) => Math.max(1, p - 1))}
                      className="h-9 w-9 rounded-xl border border-brand-border bg-white text-base font-bold text-brand-secondary hover:bg-brand-surface-muted flex items-center justify-center transition-all select-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={reservePartySize}
                      onChange={(e) => setReservePartySize(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="flex-1 rounded-xl border border-brand-border bg-white py-2 px-3 text-center text-xs font-bold text-brand-secondary focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setReservePartySize((p) => Math.min(50, p + 1))}
                      className="h-9 w-9 rounded-xl border border-brand-border bg-white text-base font-bold text-brand-secondary hover:bg-brand-surface-muted flex items-center justify-center transition-all select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 shadow-brandCard transition-all flex items-center justify-center gap-2 disabled:opacity-50 select-none cursor-pointer"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>{isSubmitting ? "Reserving..." : `Confirm Reservation (${reservePartySize} Guests)`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
