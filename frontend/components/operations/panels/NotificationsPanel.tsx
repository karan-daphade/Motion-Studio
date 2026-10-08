"use client";

import React from "react";
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Users, 
  Flame, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { OperationsTableItem, OperationsQueueEntry } from "@/app/actions/operations-tables-actions";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tables: OperationsTableItem[];
  queueEntries: OperationsQueueEntry[];
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  tables,
  queueEntries,
}: NotificationsPanelProps) {
  // Keyboard shortcut: Escape to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build live notification feed items from tables orders & queue entries
  const feedItems: Array<{
    id: string;
    type: "order" | "request" | "queue";
    title: string;
    subtitle: string;
    time: string;
    timestamp: number;
    badge: string;
    badgeColor: string;
  }> = [];

  // Recent order item updates
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

        feedItems.push({
          id: `item-${it.id}`,
          type: "order",
          title: `${it.item_name} (x${it.quantity})`,
          subtitle: `For ${t.table_name} (${t.section_name}) • Order #${o.id.slice(0, 5)}`,
          time: new Date(it.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: itemCreated,
          badge,
          badgeColor,
        });
      });
    });

    // Customer requests
    t.active_session?.requests.forEach((req) => {
      const reqTime = new Date(req.requested_at).getTime();
      feedItems.push({
        id: `req-${req.id}`,
        type: "request",
        title: `Customer Request: ${req.type.replace("_", " ").toUpperCase()}`,
        subtitle: `Table ${t.table_name} • Requested by ${req.requested_by}`,
        time: new Date(req.requested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: reqTime,
        badge: req.status === "open" ? "Open Request" : "Fulfilled",
        badgeColor: req.status === "open" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-700 border-gray-200",
      });
    });
  });

  // Recent waitlist entries
  queueEntries.forEach((q) => {
    const qTime = new Date(q.created_at).getTime();
    feedItems.push({
      id: `queue-${q.id}`,
      type: "queue",
      title: `Waitlist Token #${q.token_number}`,
      subtitle: `${q.customer_name} (${q.party_size} guests) waiting for ${q.section_name}`,
      time: new Date(q.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: qTime,
      badge: "Waiting",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    });
  });

  // Sort descending by timestamp
  feedItems.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full md:w-[480px] lg:w-[540px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-brand-secondary">Live Notifications</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {feedItems.length}
                </span>
              </div>
              <p className="text-xs text-brand-text-muted">
                Live stream of order progress and waitlist additions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FEED LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {feedItems.length === 0 ? (
            <div className="p-8 text-center text-brand-text-muted">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold text-brand-secondary">No live alerts yet</p>
              <p className="text-[11px] text-brand-text-muted mt-1">
                Order status changes and walk-in arrivals will appear here automatically.
              </p>
            </div>
          ) : (
            feedItems.map((item) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
