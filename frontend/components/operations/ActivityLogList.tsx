"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  UserCheck, 
  Smartphone, 
  Bot, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  Calendar,
  Sparkles
} from "lucide-react";

export interface ActivityLogItem {
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

interface ActivityLogListProps {
  entries: ActivityLogItem[];
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Format relative time (e.g. "Just now", "3m ago", "2h ago")
 */
function formatRelativeTime(dateStr: string, now: number): string {
  const time = new Date(dateStr).getTime();
  const diffSec = Math.max(0, Math.floor((now - time) / 1000));

  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Shared <ActivityLogList> component
 * Chat-style timestamped entries built generically for Waiting List, Reservations,
 * Table Sessions, Orders, and KDS.
 */
export default function ActivityLogList({
  entries,
  emptyMessage = "No activity logged yet.",
  compact = false,
  className = "",
}: ActivityLogListProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  if (!entries || entries.length === 0) {
    if (compact) return null;
    return (
      <div className={`p-4 text-center text-xs text-brand-text-muted ${className}`}>
        <Clock className="h-4 w-4 mx-auto mb-1.5 opacity-40" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Sort descending or ascending (chronological chat order for full view, newest first for compact)
  const displayEntries = compact 
    ? [...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2)
    : [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // COMPACT VIEW: Embedded inside cards (e.g. Waiting List card)
  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {displayEntries.map((log) => {
          const relTime = formatRelativeTime(log.created_at, now);
          const isCustomer = log.actor_type === "customer";
          const isStaff = log.actor_type === "staff";

          return (
            <div
              key={log.id}
              className="flex items-center gap-1.5 text-[11px] text-brand-text-muted bg-brand-surface-muted/80 px-2.5 py-1 rounded-xl border border-brand-border/60"
            >
              <span className="shrink-0">
                {isCustomer ? (
                  <Smartphone className="h-3 w-3 text-emerald-600" />
                ) : isStaff ? (
                  <UserCheck className="h-3 w-3 text-brand-primary" />
                ) : (
                  <Sparkles className="h-3 w-3 text-purple-600" />
                )}
              </span>

              <span className="font-semibold text-brand-secondary truncate">
                {log.action === "created" 
                  ? `Registered by ${log.actor_name}`
                  : `${log.actor_name}: ${log.note || log.action}`}
              </span>

              <span className="ml-auto text-[10px] text-brand-text-muted font-medium shrink-0">
                {relTime}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // FULL CHAT-STYLE TIMESTAMPTZ VIEW
  return (
    <div className={`space-y-3 ${className}`}>
      {displayEntries.map((log) => {
        const timeFormatted = new Date(log.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const relTime = formatRelativeTime(log.created_at, now);
        const isCustomer = log.actor_type === "customer";
        const isStaff = log.actor_type === "staff";
        const isSystem = log.actor_type === "system";

        return (
          <div
            key={log.id}
            className={`flex items-start gap-2.5 ${
              isCustomer ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* AVATAR BADGE */}
            <div
              className={`p-1.5 rounded-full shrink-0 shadow-2xs ${
                isCustomer
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : isStaff
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              {isCustomer ? (
                <Smartphone className="h-3.5 w-3.5" />
              ) : isStaff ? (
                <UserCheck className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </div>

            {/* CHAT BUBBLE */}
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs border ${
                isCustomer
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 rounded-tr-xs"
                  : isStaff
                  ? "bg-white border-brand-border text-brand-secondary rounded-tl-xs"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              {/* Header with Actor & Time */}
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-black text-[11px] flex items-center gap-1">
                  <span>{log.actor_name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isCustomer
                        ? "bg-emerald-200 text-emerald-900"
                        : isStaff
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {log.actor_type}
                  </span>
                </span>

                <span className="text-[10px] text-brand-text-muted shrink-0 font-medium">
                  {timeFormatted} ({relTime})
                </span>
              </div>

              {/* Message Note or Action */}
              <p className="font-medium text-xs leading-relaxed text-brand-text-secondary">
                {log.note || log.action}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
