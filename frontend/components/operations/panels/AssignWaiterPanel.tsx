"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  UserCheck, 
  AlertTriangle, 
  Check, 
  UserX, 
  Clock, 
  Search,
  Plus,
  Shield,
  Layers,
  Sparkles,
  Lock
} from "lucide-react";
import { 
  OperationsTableItem, 
  assignWaiterToTable, 
  unassignWaiterFromTable 
} from "@/app/actions/operations-tables-actions";
import { 
  canAssignTables, 
  hasMultipleSectionAccess, 
  getAccessibleSections,
  hasAccessToSection
} from "@/lib/auth/permissions";

interface AssignWaiterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  tables: OperationsTableItem[];
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
    default_shift?: boolean;
  }>;
  sections?: Array<{ id: string; name: string }>;
  currentUser?: {
    id: string;
    name: string;
    role: string;
    assigned_sections: string[];
  };
  onRefresh: () => void;
}

export default function AssignWaiterPanel({
  isOpen,
  onClose,
  branchId,
  tables,
  waiters,
  shifts,
  sections = [],
  currentUser,
  onRefresh,
}: AssignWaiterPanelProps) {
  // Permission & section scoping
  const accessContext = {
    role: currentUser?.role,
    assignedSections: currentUser?.assigned_sections,
  };
  const hasAssignPermission = canAssignTables(accessContext);
  const isMultiSection = hasMultipleSectionAccess(accessContext, sections);
  const accessibleSections = getAccessibleSections(accessContext, sections);

  const [filterSection, setFilterSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeShiftId, setActiveShiftId] = useState<string>(shifts[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active waiter editor modal/sheet
  const [editingWaiterId, setEditingWaiterId] = useState<string | null>(null);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingWaiterId) {
          setEditingWaiterId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, editingWaiterId, onClose]);

  if (!isOpen) return null;

  // Unassigned tables count (only among active tables in accessible sections)
  const accessibleTables = tables.filter(
    (t) => t.status !== "inactive" && hasAccessToSection(t.section_id, accessContext)
  );
  const unassignedCount = accessibleTables.filter((t) => !t.assigned_waiter).length;

  // Filter waiters by search and selected section
  const filteredWaiters = waiters.filter((w) => {
    // If a section is filtered, waiter must be assigned to that section or all sections
    if (filterSection !== "all") {
      if (w.sections.length > 0 && !w.sections.includes(filterSection)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fullName = `${w.first_name} ${w.last_name || ""}`.toLowerCase();
      if (!fullName.includes(q) && !w.role.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const editingWaiter = waiters.find((w) => w.id === editingWaiterId) || null;

  // Candidate tables for the waiter in the editor:
  // ONLY lists tables from sections the waiter has access to AND current staff has access to
  const waiterCandidateTables = editingWaiter
    ? tables.filter((t) => {
        if (t.status === "inactive") return false;
        // Staff access check
        if (!hasAccessToSection(t.section_id, accessContext)) return false;
        // Waiter section allocation check: if waiter has empty sections array, they can cover any section
        if (editingWaiter.sections.length > 0 && !editingWaiter.sections.includes(t.section_id)) {
          return false;
        }
        return true;
      })
    : [];

  const handleToggleTableForWaiter = async (tableId: string, currentAssignedWaiterId?: string) => {
    if (!editingWaiterId || !hasAssignPermission) return;
    setIsSubmitting(true);

    if (currentAssignedWaiterId === editingWaiterId) {
      // Unassign table
      await unassignWaiterFromTable(tableId);
    } else {
      // Assign or reassign to this waiter
      await assignWaiterToTable(editingWaiterId, tableId, activeShiftId || null, branchId);
    }

    setIsSubmitting(false);
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
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-brand-secondary">Waiter Roster</h2>
                {unassignedCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-300 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{unassignedCount} unassigned</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    All Covered
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-text-muted">
                Floor coverage & staff table allocations for current shift
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors"
            title="Close roster"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTROLS BAR */}
        <div className="p-3 sm:p-4 bg-brand-background border-b border-brand-border space-y-2.5">
          {/* Shift Selector: VISIBLE ONLY TO STAFF WITH table.assign PERMISSION */}
          {hasAssignPermission ? (
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-brand-border shadow-2xs">
              <Clock className="h-4 w-4 text-brand-primary shrink-0" />
              <span className="text-xs font-bold text-brand-secondary shrink-0">Shift:</span>
              <select
                value={activeShiftId}
                onChange={(e) => setActiveShiftId(e.target.value)}
                className="flex-1 bg-transparent text-xs font-bold text-brand-secondary focus:outline-none"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.start_time} - {s.end_time})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Read-only view • Shift editing requires table.assign authority</span>
            </div>
          )}

          {/* Section Selector: ONLY RENDERED IF STAFF HAS MULTI-SECTION ACCESS */}
          {isMultiSection && (
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
              <span className="text-xs font-semibold text-brand-text-muted shrink-0">Section:</span>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-secondary focus:outline-none focus:border-brand-primary"
              >
                <option value="all">All Accessible Sections</option>
                {accessibleSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Search waiter by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* WAITER-WISE CARDS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredWaiters.length === 0 ? (
            <div className="p-8 text-center text-brand-text-muted">
              <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold text-brand-secondary">No staff members found</p>
              <p className="text-[11px] text-brand-text-muted mt-1">
                Add waiters or managers in Employee settings.
              </p>
            </div>
          ) : (
            filteredWaiters.map((waiter) => {
              const fullName = `${waiter.first_name} ${waiter.last_name || ""}`.trim();
              
              // Get assigned tables for this waiter
              const assignedTables = tables.filter(
                (t) => t.assigned_waiter?.employee_id === waiter.id && t.status !== "inactive"
              );

              return (
                <div
                  key={waiter.id}
                  onClick={() => {
                    if (hasAssignPermission) {
                      setEditingWaiterId(waiter.id);
                    }
                  }}
                  className={`p-4 rounded-3xl border transition-all space-y-2.5 bg-white border-brand-border shadow-2xs ${
                    hasAssignPermission
                      ? "hover:border-brand-primary hover:shadow-md cursor-pointer active:scale-[0.99]"
                      : "cursor-default"
                  }`}
                >
                  {/* Waiter Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-brand-secondary">
                          {fullName}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {waiter.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-text-muted mt-0.5">
                        {waiter.sections.length === 0 ? (
                          <span>All Sections</span>
                        ) : (
                          <span>
                            {waiter.sections
                              .map((secId) => sections.find((s) => s.id === secId)?.name || "Section")
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {assignedTables.length} {assignedTables.length === 1 ? "table" : "tables"}
                      </span>
                      {hasAssignPermission && (
                        <span className="text-[10px] text-brand-primary font-bold ml-1">
                          Edit →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Tables Shown as Rounded Chips (T1, T2, …) */}
                  <div className="pt-1 border-t border-brand-border/60">
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                      Assigned Tables:
                    </span>

                    {assignedTables.length === 0 ? (
                      <span className="text-xs text-brand-text-muted italic">
                        No tables currently assigned to this waiter.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedTables.map((t) => (
                          <span
                            key={t.id}
                            className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-black border border-indigo-200 flex items-center gap-1 shadow-2xs"
                          >
                            <span>{t.short_code}</span>
                            <span className="text-[10px] font-medium text-indigo-500">
                              ({t.section_name})
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* INTERACTIVE TABLE PICKER EDITOR (Opened by tapping a waiter card) */}
        {editingWaiter && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              
              <div className="flex items-start justify-between shrink-0 pb-2 border-b border-brand-border">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">
                    Assign Tables: {editingWaiter.first_name} {editingWaiter.last_name || ""}
                  </h4>
                  <p className="text-xs text-brand-text-muted">
                    Tap any table to assign or unassign for this shift
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingWaiterId(null)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Table Picker Grid (Restricted to sections the waiter has access to) */}
              <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
                {waiterCandidateTables.length === 0 ? (
                  <p className="text-xs text-brand-text-muted text-center py-4">
                    No tables available in this waiter&apos;s assigned sections.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {waiterCandidateTables.map((t) => {
                      const isAssignedToThisWaiter = t.assigned_waiter?.employee_id === editingWaiter.id;
                      const isAssignedToOther = t.assigned_waiter && !isAssignedToThisWaiter;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleToggleTableForWaiter(t.id, t.assigned_waiter?.employee_id)}
                          className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-[72px] ${
                            isAssignedToThisWaiter
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                              : isAssignedToOther
                              ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                              : "bg-white border-brand-border text-brand-secondary hover:border-brand-primary"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black tracking-tight">
                              {t.short_code}
                            </span>
                            {isAssignedToThisWaiter && (
                              <Check className="h-4 w-4 shrink-0 text-white" />
                            )}
                          </div>

                          <div className="text-[10px] truncate leading-tight">
                            {isAssignedToThisWaiter ? (
                              <span className="opacity-90 font-semibold">Assigned</span>
                            ) : isAssignedToOther ? (
                              <span className="text-amber-700 font-semibold">
                                {t.assigned_waiter?.name.split(" ")[0]}
                              </span>
                            ) : (
                              <span className="text-brand-text-muted">Unassigned</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-brand-border shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingWaiterId(null)}
                  className="w-full py-2.5 rounded-xl bg-brand-secondary text-white font-bold text-xs hover:bg-brand-secondary-hover shadow-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
