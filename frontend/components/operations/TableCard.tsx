"use client";

import React, { useState, useEffect } from "react";
import { Clock, Smartphone, Users } from "lucide-react";
import { OperationsTableItem } from "@/app/actions/operations-tables-actions";

interface TableCardProps {
  table: OperationsTableItem;
  onClick?: (table: OperationsTableItem) => void;
  onClickOccupied?: (table: OperationsTableItem) => void;
  onPromptWalkIn?: (table: OperationsTableItem) => void;
}

export default function TableCard({
  table,
  onClick,
  onClickOccupied,
  onPromptWalkIn,
}: TableCardProps) {
  const session = table.active_session;
  const isOccupied = Boolean(session);
  const isReserved = table.status === "reserved" && !isOccupied;
  const isAssigned = (table.status === "assigned" || Boolean(table.assigned_waitlist_entry)) && !isOccupied;

  // Live ticking session duration timer
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isOccupied) return;
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, [isOccupied]);

  // Compute live duration string (e.g. "38m", "1h 12m")
  const durationText = (() => {
    if (!session?.opened_at) return "0m";
    const start = new Date(session.opened_at).getTime();
    const totalMinutes = Math.max(0, Math.floor((now - start) / 60000));
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  })();

  // Top-left table label(s): e.g. "T1, T2" if merged, or "T1"
  const tableLabel = (() => {
    if (session && session.merged_table_labels && session.merged_table_labels.length > 1) {
      // Format as "T1, T2"
      return session.merged_table_labels
        .map((l) => (l.startsWith("T") ? l : `T${l.replace(/\D/g, "")}`))
        .join(", ");
    }
    if (table.short_code && table.short_code.includes(",")) {
      return table.short_code;
    }
    return table.short_code || `T${table.table_number}`;
  })();

  // Item status summary: counts of items currently preparing / ready
  const { preparingCount, readyCount } = (() => {
    let prep = 0;
    let rdy = 0;
    if (session?.orders) {
      session.orders.forEach((o) => {
        o.items?.forEach((it) => {
          if (it.status === "preparing" || it.status === "pending") prep += it.quantity || 1;
          if (it.status === "ready") rdy += it.quantity || 1;
        });
      });
    }
    return { preparingCount: prep, readyCount: rdy };
  })();

  // Total bill and Due amount (total minus paid)
  const totalBill = session?.bill ? session.bill.total_amount : 0;
  const amountPaid = session?.bill ? session.bill.paid_amount : 0;
  const dueAmount = Math.max(0, totalBill - amountPaid);

  // Device count: 0 for now per Section 2
  const deviceCount = session?.device_count ?? 0;

  const handleClick = () => {
    if (onClick) {
      onClick(table);
    } else if (isOccupied && onClickOccupied) {
      onClickOccupied(table);
    } else if (onPromptWalkIn) {
      onPromptWalkIn(table);
    }
  };

  // =========================================================================
  // 1. ASSIGNED TABLE STATE (Indigo pulse + border, customer token, tap to seat)
  // =========================================================================
  if (isAssigned) {
    const assignedGuest = table.assigned_waitlist_entry?.customer_name || "Assigned Customer";
    const assignedToken = table.assigned_waitlist_entry?.token || "";
    const assignedParty = table.assigned_waitlist_entry?.guest_count ? `${table.assigned_waitlist_entry.guest_count} guests` : "Party";

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className="group relative rounded-2xl border-2 border-indigo-300 bg-indigo-50/40 p-3.5 hover:border-indigo-600 hover:bg-indigo-50/70 transition-all cursor-pointer flex flex-col justify-between h-[132px] select-none shadow-2xs hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <span 
              className="h-2.5 w-2.5 rounded-full bg-indigo-600 ring-2 ring-indigo-200 animate-pulse shrink-0" 
              title="Assigned to Waiting Customer"
            />
            <span className="text-base font-black text-indigo-950 tracking-tight truncate">
              {table.short_code}
            </span>
          </div>
          {assignedToken && (
            <span className="text-xs font-black text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-lg border border-indigo-200 shrink-0">
              #{assignedToken}
            </span>
          )}
        </div>

        <div className="py-0.5">
          <p className="text-xs font-bold text-indigo-950 truncate">
            {assignedGuest}
          </p>
          <p className="text-[11px] text-indigo-800/80 font-medium truncate">
            {assignedParty} • Awaiting Seating
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-indigo-800/80 font-medium pt-1 border-t border-indigo-200/60">
          <span className="truncate">{table.section_name}</span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            Tap to seat
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AVAILABLE / EMPTY TABLE STATE (Green dot + green border, no fake seats)
  // =========================================================================
  if (!isOccupied && !isReserved) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className="group relative rounded-2xl border-2 border-emerald-200/90 bg-white p-3.5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col justify-between h-[132px] select-none shadow-2xs hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-brand-secondary group-hover:text-emerald-700 tracking-tight">
            {table.short_code}
          </span>
          {/* Small status dot: green = empty */}
          <span 
            className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" 
            title="Available"
          />
        </div>

        <div className="text-center py-0.5">
          <span className="text-xs font-semibold text-emerald-700/80 group-hover:text-emerald-800 transition-colors">
            Tap to seat or reserve
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-brand-text-muted font-medium pt-1 border-t border-emerald-100">
          <span className="truncate">{table.section_name}</span>
          {table.assigned_waiter && (
            <span className="text-[10px] text-brand-secondary font-semibold shrink-0">
              {table.assigned_waiter.name.split(" ")[0]}
            </span>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. RESERVED TABLE STATE (Amber dot + amber border)
  // =========================================================================
  if (isReserved) {
    const resGuest = table.reservation?.guest_name || "Reserved";
    const resParty = table.reservation?.party_size ? `${table.reservation.party_size} guests` : "Reserved";

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className="group relative rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-3.5 hover:border-amber-500 hover:bg-amber-50/70 transition-all cursor-pointer flex flex-col justify-between h-[132px] select-none shadow-2xs hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-amber-950 tracking-tight">
            {table.short_code}
          </span>
          {/* Small status dot: amber = reserved */}
          <span 
            className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" 
            title="Reserved"
          />
        </div>

        <div className="py-0.5">
          <p className="text-xs font-bold text-amber-900 truncate">
            {resGuest}
          </p>
          <p className="text-[11px] text-amber-800/80 font-medium">
            {resParty}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-amber-800/80 font-medium pt-1 border-t border-amber-200/60">
          <span className="truncate">{table.section_name}</span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-md">
            Reserved
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. OCCUPIED TABLE CARD (Blue dot + blue border, exact 4 lines)
  // ┌─────────────────────────┐
  // │ T1, T2              38m │
  // │ 6 guests  • [Icon] 0   │
  // │ ₹2,450         Due ₹950 │
  // │ 2 preparing • 1 ready   │
  // └─────────────────────────┘
  // =========================================================================
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className="relative rounded-2xl border-2 border-blue-200/90 bg-white p-3.5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[132px] select-none shadow-2xs active:scale-[0.99]"
    >
      {/* LINE 1: Top-left label(s) + Blue status dot & Top-right duration ticking */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate pr-2">
          <span 
            className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100 shrink-0" 
            title="Active / Occupied"
          />
          <span className="text-base font-black text-brand-secondary tracking-tight truncate">
            {tableLabel}
          </span>
        </div>

        <span className="text-xs font-black text-brand-primary bg-brand-primary-light/60 px-2 py-0.5 rounded-lg border border-brand-primary/20 flex items-center gap-1 shrink-0">
          <Clock className="h-3 w-3" />
          <span>{durationText}</span>
        </span>
      </div>

      {/* LINE 2: Guest count • Device count */}
      <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary font-bold">
        <span className="flex items-center gap-1 text-brand-secondary" title="Party Size">
          <Users className="h-3.5 w-3.5 text-brand-primary" />
          <span>{session?.guest_count ?? 1}</span>
        </span>
        <span className="text-brand-text-muted">•</span>
        <span className="flex items-center gap-1 text-brand-text-muted" title="Connected Devices">
          <Smartphone className="h-3.5 w-3.5 text-brand-text-muted/80" />
          <span>{deviceCount}</span>
        </span>
      </div>

      {/* LINE 3: Total bill so far and Due amount */}
      <div className="flex items-center justify-between text-xs font-black">
        <span className="text-brand-secondary">
          ₹{totalBill.toLocaleString("en-IN")}
        </span>
        <span className="text-rose-600">
          Due ₹{dueAmount.toLocaleString("en-IN")}
        </span>
      </div>

      {/* LINE 4: Item status summary (preparing / ready) */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-brand-border/60">
        <span className="text-brand-text-muted font-medium truncate">
          {preparingCount > 0 || readyCount > 0 ? (
            <span className="flex items-center gap-1.5">
              {preparingCount > 0 && (
                <span className="text-blue-600 font-bold">
                  {preparingCount} preparing
                </span>
              )}
              {preparingCount > 0 && readyCount > 0 && <span>•</span>}
              {readyCount > 0 && (
                <span className="text-emerald-600 font-bold">
                  {readyCount} ready
                </span>
              )}
            </span>
          ) : (
            <span className="text-brand-text-muted">All items served</span>
          )}
        </span>

        {table.assigned_waiter && (
          <span className="text-[10px] text-brand-text-muted font-semibold shrink-0">
            {table.assigned_waiter.name.split(" ")[0]}
          </span>
        )}
      </div>
    </div>
  );
}
