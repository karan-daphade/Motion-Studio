"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Users, 
  Phone, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle,
  PhoneCall,
  UserCheck,
  Eye,
  UserX,
  FileText,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  ArrowRightLeft,
  Undo2,
  Search,
  Check,
  Layers,
  Sparkles,
  MapPin,
  QrCode,
  Smartphone,
  Radio
} from "lucide-react";
import { formatOrdinalNumber } from "@/lib/waitlist/waitlist-service";
import { 
  OperationsQueueEntry, 
  OperationsTableItem,
  AvailableTableForAssignment,
  addQueueEntryByStaff,
  assignTableToQueueEntry,
  reassignTableForWaitlistEntry,
  cancelWaitlistTableAssignment,
  getAvailableTablesForAssignment,
  removeQueueEntry
} from "@/app/actions/operations-tables-actions";
import ActivityLogList from "@/components/operations/ActivityLogList";
import { 
  hasMultipleSectionAccess, 
  getAccessibleSections, 
  hasAccessToSection,
  canAccessWaitingList,
  canViewWaitingListPhone,
  canAssignWaitlistTable,
  maskPhoneNumber,
  maskCustomerName,
  canViewCustomerDetails
} from "@/lib/auth/permissions";

interface WaitingListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  queueEntries: OperationsQueueEntry[];
  tables: OperationsTableItem[];
  sections: Array<{ id: string; name: string }>;
  currentUser?: {
    id: string;
    name: string;
    role: string;
    assigned_sections: string[];
    permissions?: Record<string, any>;
  };
  onRefresh: () => void;
}

export default function WaitingListPanel({
  isOpen,
  onClose,
  branchId,
  queueEntries,
  tables,
  sections,
  currentUser,
  onRefresh,
}: WaitingListPanelProps) {
  const staffName = currentUser?.name || "Staff";
  const staffId = currentUser?.id || null;

  // Access context & permissions evaluation
  const accessContext = {
    role: currentUser?.role,
    employeeId: currentUser?.id,
    name: currentUser?.name,
    assignedSections: currentUser?.assigned_sections,
    permissions: currentUser?.permissions,
  };

  const isAllowedToAccess = canAccessWaitingList(accessContext);
  const canAssign = canAssignWaitlistTable(accessContext);
  const canViewCustInfo = canViewCustomerDetails(accessContext);
  const canViewPhone = canViewCustInfo;
  const isMultiSection = hasMultipleSectionAccess(accessContext, sections);
  const accessibleSections = getAccessibleSections(accessContext, sections);

  // Status Filter Tab: ALL | WAITING | ASSIGNED
  const [activeFilter, setActiveFilter] = useState<"ALL" | "WAITING" | "ASSIGNED">("ALL");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");

  // Add Walk-in state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState("");
  const [sectionId, setSectionId] = useState(accessibleSections[0]?.id || sections[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Table Selection Drawer state (Workflow A & B)
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState<OperationsQueueEntry | null>(null);
  const [drawerMode, setDrawerMode] = useState<"assign" | "reassign">("assign");
  const [candidateTables, setCandidateTables] = useState<AvailableTableForAssignment[]>([]);
  const [isLoadingCandidateTables, setIsLoadingCandidateTables] = useState(false);
  const [selectedCandidateTableId, setSelectedCandidateTableId] = useState<string>("");
  const [candidateSectionFilter, setCandidateSectionFilter] = useState<string>("ALL");
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>("");

  // Concise Confirmation Prompt for Table Assignment / Reassignment
  const [confirmAssignmentData, setConfirmAssignmentData] = useState<{
    entry: OperationsQueueEntry;
    table: AvailableTableForAssignment;
    mode: "assign" | "reassign";
  } | null>(null);

  // Concise Confirmation Dialog for Cancel Assignment (Workflow C)
  const [cancelAssignConfirmEntry, setCancelAssignConfirmEntry] = useState<OperationsQueueEntry | null>(null);

  // Confirmation dialogs for No-Show & Remove
  const [noShowConfirmEntry, setNoShowConfirmEntry] = useState<OperationsQueueEntry | null>(null);
  const [removeConfirmEntry, setRemoveConfirmEntry] = useState<OperationsQueueEntry | null>(null);

  // View Details Slide-over modal
  const [viewDetailsEntry, setViewDetailsEntry] = useState<OperationsQueueEntry | null>(null);

  // Dynamic live elapsed wait counter (updates every 15 seconds)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Sync default section
  useEffect(() => {
    if (accessibleSections.length > 0 && !sectionId) {
      setSectionId(accessibleSections[0].id);
    }
  }, [accessibleSections, sectionId]);

  // Keyboard shortcut: Escape to close top-most overlay
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmAssignmentData) setConfirmAssignmentData(null);
        else if (cancelAssignConfirmEntry) setCancelAssignConfirmEntry(null);
        else if (tableDrawerOpen) setTableDrawerOpen(false);
        else if (viewDetailsEntry) setViewDetailsEntry(null);
        else if (noShowConfirmEntry) setNoShowConfirmEntry(null);
        else if (removeConfirmEntry) setRemoveConfirmEntry(null);
        else if (isAddOpen) setIsAddOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    onClose,
    confirmAssignmentData,
    cancelAssignConfirmEntry,
    tableDrawerOpen,
    viewDetailsEntry,
    noShowConfirmEntry,
    removeConfirmEntry,
    isAddOpen,
  ]);

  if (!isOpen) return null;

  // Filter available target tables from props as fallback
  const availableTargetTables = tables.filter((t) => {
    if (t.status !== "active" || t.active_session || t.held_for_waitlist_id) return false;
    if (!hasAccessToSection(t.section_id, accessContext)) return false;
    if (t.is_secondary_merged) return false;
    return true;
  });

  // Calculate elapsed time strictly
  const calculateWaitDuration = (createdAtStr: string) => {
    const created = new Date(createdAtStr).getTime();
    const diffMin = Math.max(0, Math.floor((now - created) / 60000));
    if (diffMin < 60) return `${diffMin} min`;
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hrs}h ${mins}m`;
  };

  const isAssigned = (e: OperationsQueueEntry) => {
    const s = (e.status || "").toUpperCase();
    return s === "TABLE_ASSIGNED" || s === "ASSIGNED";
  };

  const isWaiting = (e: OperationsQueueEntry) => {
    const s = (e.status || "").toUpperCase();
    return s === "WAITING" || s === "CALLED";
  };

  // Strict FIFO queue sorting: oldest active entries first
  const activeEntries = [...queueEntries]
    .filter((e) => isWaiting(e) || isAssigned(e))
    .filter((e) => {
      // Permission boundary: Staff only see entries for sections they are permitted to view
      if (e.section_id && !hasAccessToSection(e.section_id, accessContext)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const waitingCount = activeEntries.filter(isWaiting).length;
  const assignedCount = activeEntries.filter(isAssigned).length;
  const allCount = activeEntries.length;

  const displayedEntries = activeEntries.filter((e) => {
    // Status filter
    if (activeFilter === "WAITING" && !isWaiting(e)) return false;
    if (activeFilter === "ASSIGNED" && !isAssigned(e)) return false;

    // Section filter
    if (selectedSectionFilter !== "ALL" && e.section_id !== selectedSectionFilter) {
      return false;
    }

    return true;
  });

  // Handle Add Walk-In Guest
  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg("Customer Name is required");
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }

    if (partySize < 1) {
      setErrorMsg("Guest count must be at least 1");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const targetSectionId = isMultiSection ? sectionId : (accessibleSections[0]?.id || sectionId);

    const res = await addQueueEntryByStaff(
      branchId,
      targetSectionId || null,
      customerName.trim(),
      cleanDigits,
      partySize,
      staffName,
      staffId,
      notes.trim() || null
    );

    setIsSubmitting(false);
    if (res.success) {
      setCustomerName("");
      setPhone("");
      setPartySize(2);
      setNotes("");
      setIsAddOpen(false);
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to register customer");
    }
  };

  // Open Table Selection Drawer (Workflow A & B)
  const openTableDrawer = async (entry: OperationsQueueEntry, mode: "assign" | "reassign") => {
    setDrawerEntry(entry);
    setDrawerMode(mode);
    setSelectedCandidateTableId("");
    setCandidateSearchQuery("");

    // Identify customer's registered section
    const registeredSectionId = entry.section_id || sections.find((s) => s.name === entry.section_name)?.id || "";
    setCandidateSectionFilter(registeredSectionId || "ALL");
    setTableDrawerOpen(true);
    setIsLoadingCandidateTables(true);

    try {
      // Query candidate tables strictly for the registered section
      const res = await getAvailableTablesForAssignment(branchId, registeredSectionId || undefined);
      if (res.success && res.tables) {
        // Strictly filter to the customer's registered section, and verify staff section access
        const sectionTables = res.tables.filter((t) => {
          if (registeredSectionId && t.section_id !== registeredSectionId) return false;
          return hasAccessToSection(t.section_id, accessContext);
        });
        setCandidateTables(sectionTables);
        if (sectionTables.length > 0) {
          setSelectedCandidateTableId(sectionTables[0].id);
        }
      } else {
        // Fallback to props availableTargetTables strictly filtered to registered section
        const fallback: AvailableTableForAssignment[] = availableTargetTables
          .filter((t) => !registeredSectionId || t.section_id === registeredSectionId)
          .map((t) => ({
            id: t.id,
            table_id: t.id,
            table_label: t.short_code,
            section_id: t.section_id,
            section_name: t.section_name,
            seating_capacity: t.seating_capacity || 4,
            is_merged: Boolean(t.is_primary_merged || t.short_code.includes(",")),
            member_table_ids: [t.id],
            status: "available",
          }));
        setCandidateTables(fallback);
        if (fallback.length > 0) {
          setSelectedCandidateTableId(fallback[0].id);
        }
      }
    } catch {
      // Fallback
      const fallback: AvailableTableForAssignment[] = availableTargetTables
        .filter((t) => !registeredSectionId || t.section_id === registeredSectionId)
        .map((t) => ({
          id: t.id,
          table_id: t.id,
          table_label: t.short_code,
          section_id: t.section_id,
          section_name: t.section_name,
          seating_capacity: t.seating_capacity || 4,
          is_merged: Boolean(t.is_primary_merged || t.short_code.includes(",")),
          member_table_ids: [t.id],
          status: "available",
        }));
      setCandidateTables(fallback);
      if (fallback.length > 0) {
        setSelectedCandidateTableId(fallback[0].id);
      }
    } finally {
      setIsLoadingCandidateTables(false);
    }
  };

  // Trigger Confirmation Prompt from Drawer
  const handleProceedToConfirmFromDrawer = () => {
    if (!drawerEntry || !selectedCandidateTableId) return;
    const selectedTable = candidateTables.find((t) => t.id === selectedCandidateTableId);
    if (!selectedTable) return;

    setConfirmAssignmentData({
      entry: drawerEntry,
      table: selectedTable,
      mode: drawerMode,
    });
  };

  // Execute Confirmed Table Assignment (Workflow A) or Reassignment (Workflow B)
  const handleExecuteConfirmedAssignment = async () => {
    if (!confirmAssignmentData) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const { entry, table, mode } = confirmAssignmentData;

    if (mode === "assign") {
      const res = await assignTableToQueueEntry(
        entry.id,
        table.id,
        branchId,
        staffName,
        staffId
      );
      setIsSubmitting(false);
      if (res.success) {
        setConfirmAssignmentData(null);
        setTableDrawerOpen(false);
        setDrawerEntry(null);
        setSelectedCandidateTableId("");
        onRefresh();
      } else {
        setErrorMsg(res.error || "Failed to assign table");
      }
    } else {
      // Reassign
      const res = await reassignTableForWaitlistEntry(
        entry.id,
        table.id,
        branchId,
        staffName,
        staffId
      );
      setIsSubmitting(false);
      if (res.success) {
        setConfirmAssignmentData(null);
        setTableDrawerOpen(false);
        setDrawerEntry(null);
        setSelectedCandidateTableId("");
        onRefresh();
      } else {
        setErrorMsg(res.error || "Failed to reassign table");
      }
    }
  };

  // Execute Cancel Table Assignment (Workflow C)
  const handleConfirmCancelAssignment = async () => {
    if (!cancelAssignConfirmEntry) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await cancelWaitlistTableAssignment(
      cancelAssignConfirmEntry.id,
      branchId,
      staffName,
      staffId,
      "Customer table assignment removed. Returned to waiting queue."
    );
    setIsSubmitting(false);
    setCancelAssignConfirmEntry(null);

    if (res.success) {
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to cancel table assignment");
    }
  };

  // Handle Mark No-Show
  const handleConfirmNoShow = async () => {
    if (!noShowConfirmEntry) return;
    setIsSubmitting(true);
    const res = await removeQueueEntry(
      noShowConfirmEntry.id, 
      "NO_SHOW", 
      staffName, 
      staffId, 
      "Customer did not arrive. Marked as No Show."
    );
    setIsSubmitting(false);
    setNoShowConfirmEntry(null);
    if (res.success) {
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to mark as No Show");
    }
  };

  // Handle Remove Customer
  const handleConfirmRemove = async () => {
    if (!removeConfirmEntry) return;
    setIsSubmitting(true);
    const res = await removeQueueEntry(
      removeConfirmEntry.id, 
      "REMOVED", 
      staffName, 
      staffId, 
      "Manually removed from waiting list by staff."
    );
    setIsSubmitting(false);
    setRemoveConfirmEntry(null);
    if (res.success) {
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to remove customer");
    }
  };

  // Filter candidate tables inside drawer
  const filteredCandidateTables = candidateTables.filter((t) => {
    // Strictly restrict to drawerEntry registered section if set
    const entrySectionId = drawerEntry?.section_id || sections.find((s) => s.name === drawerEntry?.section_name)?.id;
    if (entrySectionId && t.section_id !== entrySectionId) {
      return false;
    }
    if (candidateSectionFilter !== "ALL" && t.section_id !== candidateSectionFilter) {
      return false;
    }
    if (candidateSearchQuery.trim()) {
      const q = candidateSearchQuery.toLowerCase();
      const matchLabel = t.table_label.toLowerCase().includes(q);
      const matchSection = (t.section_name || "").toLowerCase().includes(q);
      return matchLabel || matchSection;
    }
    return true;
  });

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full md:w-[500px] lg:w-[560px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-brand-secondary">Waiting List</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                  {allCount} active
                </span>
              </div>
              <p className="text-xs text-brand-text-muted">
                Staff-facing live walk-in queue & seating management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted"
            title="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ACCESS RESTRICTION BANNER IF UNAUTHORIZED */}
        {!isAllowedToAccess ? (
          <div className="m-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <span>Access Restricted</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your role (<strong>{currentUser?.role || "Staff"}</strong>) does not have the required <code>tables.waiting_list</code> permission. Please contact your Branch Manager or Owner.
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="m-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-red-500 hover:text-red-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* STATUS FILTER PILLS & ACTION BAR */}
            <div className="px-4 py-3 bg-brand-background border-b border-brand-border flex items-center justify-between gap-2 flex-wrap">
              {/* Filter Pills & Section Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 p-1 bg-brand-surface-muted rounded-xl border border-brand-border text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      activeFilter === "ALL"
                        ? "bg-white text-brand-secondary shadow-xs"
                        : "text-brand-text-muted hover:text-brand-secondary"
                    }`}
                  >
                    All ({allCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("WAITING")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      activeFilter === "WAITING"
                        ? "bg-amber-100 text-amber-900 shadow-xs"
                        : "text-brand-text-muted hover:text-brand-secondary"
                    }`}
                  >
                    Waiting ({waitingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("ASSIGNED")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      activeFilter === "ASSIGNED"
                        ? "bg-emerald-100 text-emerald-900 shadow-xs"
                        : "text-brand-text-muted hover:text-brand-secondary"
                    }`}
                  >
                    Table Assigned ({assignedCount})
                  </button>
                </div>

                {/* Section Filter Dropdown (When staff has multiple accessible sections) */}
                {accessibleSections.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-brand-surface-muted px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                    <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                    <select
                      value={selectedSectionFilter}
                      onChange={(e) => setSelectedSectionFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-brand-secondary focus:outline-none cursor-pointer"
                      title="Filter queue by dining section"
                    >
                      <option value="ALL">All Sections ({activeEntries.length})</option>
                      {accessibleSections.map((sec) => {
                        const secCount = activeEntries.filter((e) => e.section_id === sec.id).length;
                        return (
                          <option key={sec.id} value={sec.id}>
                            {sec.name} ({secCount})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {!isAddOpen && (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Walk-In</span>
                </button>
              )}
            </div>

            {/* ADD WALK-IN FORM */}
            {isAddOpen && (
              <form
                onSubmit={handleAddWalkIn}
                className="p-4 bg-brand-surface-muted/90 border-b border-brand-border space-y-3 animate-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                    Register Walk-In Customer
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="p-1 rounded-lg text-brand-text-muted hover:text-brand-secondary hover:bg-white transition-colors"
                    title="Close form"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-brand-secondary block mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-brand-secondary block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      required
                      maxLength={12}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className={`grid ${isMultiSection ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                  <div>
                    <label className="text-[11px] font-semibold text-brand-secondary block mb-1">
                      Guest Count *
                    </label>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-brand-border">
                      <Users className="h-3.5 w-3.5 text-brand-text-muted shrink-0" />
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={partySize}
                        onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))}
                        className="w-full text-xs font-bold text-brand-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  {isMultiSection && (
                    <div>
                      <label className="text-[11px] font-semibold text-brand-secondary block mb-1">
                        Preferred Section
                      </label>
                      <select
                        value={sectionId}
                        onChange={(e) => setSectionId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                      >
                        {accessibleSections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-brand-secondary block mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High chair needed, anniversary dinner"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-brand-text-muted">
                    Registering as: <strong className="text-brand-secondary">{staffName}</strong> (Staff)
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Adding..." : "Add to List"}
                  </button>
                </div>
              </form>
            )}

            {/* WAITING LIST CARDS VIEW (Strict FIFO Order) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {displayedEntries.length === 0 ? (
                <div className="p-8 text-center text-brand-text-muted">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold text-brand-secondary">
                    {activeFilter === "WAITING"
                      ? "No guests currently waiting"
                      : activeFilter === "ASSIGNED"
                      ? "No tables currently assigned"
                      : "No active waitlist entries"}
                  </p>
                  <p className="text-[11px] text-brand-text-muted mt-1">
                    {activeFilter === "ASSIGNED"
                      ? "Assign available tables to waiting guests using the 'Assign Table' button."
                      : "Click 'Add Walk-In' to register guests when tables are full."}
                  </p>
                </div>
              ) : (
                displayedEntries.map((entry) => {
                  const waitDuration = calculateWaitDuration(entry.created_at);
                  const rawDisplayName = entry.customer_name || entry.guest_name || "Guest";
                  const displayName = canViewCustInfo ? rawDisplayName : maskCustomerName(rawDisplayName);
                  const displayToken = entry.queue_token || entry.queue_number || entry.token_number || "A-01";
                  const assignedTableLabel = entry.assigned_table_label || null;
                  const hasTableAssigned = isAssigned(entry);

                  // Mobile number masking check
                  const rawMobile = entry.raw_mobile || entry.mobile_number || entry.phone || "";
                  const displayMobile = canViewCustInfo 
                    ? rawMobile 
                    : maskPhoneNumber(rawMobile);

                  const guestCount = entry.guest_count || entry.party_size || 1;
                  const isCustomerReg = entry.registration_method === "CUSTOMER_SELF" ||
                    (entry.registered_by || "").toLowerCase().includes("customer") ||
                    (entry.registered_by || "").toLowerCase().includes("self");
                  const regAttribution = isCustomerReg
                    ? "Registered By: Customer Self-Service (QR)"
                    : `Registered By: ${entry.registered_by || "Staff"} (Staff)`;

                  // Derive queue position among active waiting entries in this dining section
                  const waitingEntriesInSection = queueEntries.filter(
                    (e) => isWaiting(e) && (entry.section_id ? e.section_id === entry.section_id : true)
                  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                  const queuePositionIndex = waitingEntriesInSection.findIndex((e) => e.id === entry.id);
                  const queuePosition = queuePositionIndex >= 0 ? queuePositionIndex + 1 : 0;

                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-3xl border bg-white shadow-2xs space-y-2.5 relative overflow-hidden transition-all ${
                        hasTableAssigned
                          ? "border-emerald-300 ring-1 ring-emerald-200/60 bg-emerald-50/20"
                          : "border-brand-border hover:border-brand-primary/40"
                      }`}
                    >
                      {/* Top Row: Token Badge + Customer Name + Live Duration / Assigned Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-brand-primary bg-brand-primary-light/70 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                              #{displayToken}
                            </span>
                            {!hasTableAssigned && queuePosition > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-300">
                                <Radio className="h-2.5 w-2.5 text-amber-600 animate-pulse" />
                                <span>{formatOrdinalNumber(queuePosition)} in queue</span>
                              </span>
                            )}
                            <span className="text-sm font-bold text-brand-secondary">
                              {displayName}
                            </span>

                            {/* Section Badge */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-secondary bg-brand-surface-muted px-2 py-0.5 rounded-lg border border-brand-border">
                              <MapPin className="h-3 w-3 text-brand-primary shrink-0" />
                              <span>{entry.section_name || sections.find((s) => s.id === entry.section_id)?.name || "General Queue"}</span>
                            </span>

                            {/* Assigned Table Badge */}
                            {hasTableAssigned && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>Table {assignedTableLabel || "Assigned"}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-brand-text-muted mt-1">
                            <span className="flex items-center gap-1 font-semibold text-brand-secondary">
                              <Users className="h-3 w-3 text-brand-primary" />
                              <span>{guestCount} {guestCount === 1 ? "Guest" : "Guests"}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium">
                              <Phone className="h-3 w-3 text-brand-text-muted" />
                              <span className={canViewPhone ? "text-brand-secondary" : "tracking-wider text-brand-text-muted"}>
                                {displayMobile || "N/A"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Live Ticking Wait Timer */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 ${
                          hasTableAssigned
                            ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                            : "text-amber-800 bg-amber-50 border border-amber-200"
                        }`}>
                          <Clock className={`h-3.5 w-3.5 ${hasTableAssigned ? "text-emerald-600" : "text-amber-600"}`} />
                          <span>{hasTableAssigned ? "Assigned" : `Waiting ${waitDuration}`}</span>
                        </div>
                      </div>

                      {/* Optional Notes snippet */}
                      {entry.notes && (
                        <div className="text-[11px] bg-brand-surface-muted/60 px-2.5 py-1 rounded-lg text-brand-text-secondary italic">
                          &ldquo;{entry.notes}&rdquo;
                        </div>
                      )}

                      {/* Registration Attribution */}
                      <div className="flex items-center gap-2 text-[10px] text-brand-text-muted pt-0.5">
                        {entry.registration_method === "CUSTOMER_SELF" ? (
                          <span className="inline-flex items-center gap-1 font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            <QrCode className="h-3 w-3 text-sky-600 shrink-0" />
                            <span>Customer Self-Scan (QR)</span>
                          </span>
                        ) : (
                          <span>{regAttribution}</span>
                        )}
                      </div>

                      {/* ACTIONS ROW */}
                      <div className="flex items-center gap-2 pt-2 border-t border-brand-border/60">
                        {hasTableAssigned ? (
                          /* Workflow B & C for TABLE_ASSIGNED: Change Table + Cancel Assignment */
                          <>
                            {/* 1. Change Table (Workflow B) */}
                            <button
                              type="button"
                              disabled={!canAssign || isSubmitting}
                              onClick={() => openTableDrawer(entry, "reassign")}
                              className="flex-1 py-2 px-2.5 rounded-xl bg-brand-surface-muted hover:bg-brand-border border border-brand-border text-brand-secondary font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                              title="Reassign to another available table"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5 text-brand-primary" />
                              <span>Change Table</span>
                            </button>

                            {/* 2. Cancel Assignment (Workflow C) */}
                            <button
                              type="button"
                              disabled={!canAssign || isSubmitting}
                              onClick={() => setCancelAssignConfirmEntry(entry)}
                              className="py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                              title="Release held table and return customer to waiting queue"
                            >
                              <Undo2 className="h-3.5 w-3.5 text-amber-700" />
                              <span>Cancel Assignment</span>
                            </button>
                          </>
                        ) : (
                          /* Workflow A for WAITING: Primary Assign Table */
                          <button
                            type="button"
                            disabled={!canAssign || isSubmitting}
                            onClick={() => openTableDrawer(entry, "assign")}
                            className="flex-1 py-2 px-3 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Assign Table</span>
                          </button>
                        )}

                        {/* Call Customer (Available if unmasked) */}
                        {canViewPhone && rawMobile ? (
                          <a
                            href={`tel:${rawMobile}`}
                            className="p-2 rounded-xl border border-brand-border text-brand-secondary hover:bg-brand-surface-muted transition-colors shrink-0"
                            title={`Call ${displayName} (${rawMobile})`}
                          >
                            <PhoneCall className="h-4 w-4 text-emerald-600" />
                          </a>
                        ) : null}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setViewDetailsEntry(entry)}
                          className="p-2 rounded-xl border border-brand-border text-brand-secondary hover:bg-brand-surface-muted transition-colors shrink-0"
                          title="View Details & Audit Timeline"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Mark No Show */}
                        <button
                          type="button"
                          onClick={() => setNoShowConfirmEntry(entry)}
                          className="p-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors shrink-0"
                          title="Mark Customer as No-Show"
                        >
                          <UserX className="h-4 w-4" />
                        </button>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => setRemoveConfirmEntry(entry)}
                          className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Remove from Waiting List"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ========================================================================= */}
            {/* RESPONSIVE CANDIDATE TABLE SELECTION DRAWER (Workflow A & B)             */}
            {/* Desktop / Tablet: Right slide-over. Mobile: Bottom Sheet Drawer           */}
            {/* ========================================================================= */}
            {tableDrawerOpen && drawerEntry && (
              <div 
                onClick={(e) => {
                  if (e.target === e.currentTarget) setTableDrawerOpen(false);
                }}
                className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex md:justify-end justify-center items-end md:items-stretch"
              >
                <div className="w-full md:w-[480px] bg-white rounded-t-3xl md:rounded-t-none md:rounded-l-3xl max-h-[90vh] md:max-h-full h-full shadow-2xl flex flex-col animate-in md:slide-in-from-right slide-in-from-bottom duration-200">
                  
                  {/* Drawer Header */}
                  <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-brand-primary bg-brand-primary-light/70 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                          #{drawerEntry.queue_token || drawerEntry.queue_number || drawerEntry.token_number}
                        </span>
                        <h3 className="text-sm font-black text-brand-secondary">
                          {drawerMode === "reassign" ? "Change Table Assignment" : "Assign Table"}
                        </h3>
                      </div>
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        {drawerEntry.customer_name || drawerEntry.guest_name} • {drawerEntry.guest_count || drawerEntry.party_size} Guests
                        {(drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name) && (
                          <span className="text-brand-secondary font-medium ml-1">
                            • {drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name}
                          </span>
                        )}
                        {drawerMode === "reassign" && drawerEntry.assigned_table_label && (
                          <span className="text-emerald-700 font-semibold ml-1">
                            (Current: Table {drawerEntry.assigned_table_label})
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTableDrawerOpen(false)}
                      className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer Filters: Section Scope Banner & Search */}
                  <div className="p-3 bg-brand-background border-b border-brand-border space-y-2 shrink-0">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-muted" />
                      <input
                        type="text"
                        placeholder={
                          drawerEntry && (drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name)
                            ? `Search table in ${drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name}...`
                            : "Search table..."
                        }
                        value={candidateSearchQuery}
                        onChange={(e) => setCandidateSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs text-brand-secondary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    {/* Section Scope Banner (Replaces cross-section filter pills for registered entries) */}
                    {drawerEntry && (drawerEntry.section_id || drawerEntry.section_name) ? (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-brand-border text-xs shadow-2xs">
                        <div className="flex items-center gap-1.5 text-brand-secondary">
                          <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                          <span className="text-[11px] text-brand-text-muted">Section:</span>
                          <span className="font-bold text-xs">
                            {drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name || "Assigned Section"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary-light/70 px-2 py-0.5 rounded-md border border-brand-primary/20">
                          Registered Section
                        </span>
                      </div>
                    ) : accessibleSections.length > 1 ? (
                      /* Fallback only if entry has no registered section */
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setCandidateSectionFilter("ALL")}
                          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                            candidateSectionFilter === "ALL"
                              ? "bg-brand-primary text-white shadow-2xs"
                              : "bg-white border border-brand-border text-brand-text-muted hover:text-brand-secondary"
                          }`}
                        >
                          All Sections
                        </button>
                        {accessibleSections.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setCandidateSectionFilter(s.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                              candidateSectionFilter === s.id
                                ? "bg-brand-primary text-white shadow-2xs"
                                : "bg-white border border-brand-border text-brand-text-muted hover:text-brand-secondary"
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Candidate Tables List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {isLoadingCandidateTables ? (
                      <div className="py-12 text-center text-brand-text-muted">
                        <div className="h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs font-semibold">Checking available dining tables...</p>
                      </div>
                    ) : filteredCandidateTables.length === 0 ? (
                      <div className="py-12 text-center text-brand-text-muted space-y-1">
                        <Layers className="h-8 w-8 mx-auto opacity-30 mb-2" />
                        <p className="text-xs font-bold text-brand-secondary">No matching tables available</p>
                        <p className="text-[11px] text-brand-text-muted max-w-xs mx-auto">
                          {drawerEntry && (drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name)
                            ? `All tables in ${drawerEntry.section_name || sections.find((s) => s.id === drawerEntry.section_id)?.name} are currently occupied by active dining sessions or held for other waitlist parties.`
                            : "All tables in this section may be occupied by active dining sessions or held for other waitlist parties."}
                        </p>
                      </div>
                    ) : (
                      filteredCandidateTables.map((t) => {
                        const isSelected = selectedCandidateTableId === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedCandidateTableId(t.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-brand-primary bg-brand-primary-light/50 ring-2 ring-brand-primary/20 shadow-xs"
                                : "border-brand-border bg-white hover:border-brand-primary/40 hover:bg-brand-surface-muted/30"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-brand-secondary">
                                  {t.table_label.toLowerCase().startsWith("table") ? t.table_label : `Table ${t.table_label}`}
                                </span>
                                {t.is_merged && (
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                    Merged Group
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-brand-text-muted">
                                <span className="font-semibold text-brand-text-secondary">{t.section_name}</span>
                                <span>•</span>
                                <span>{t.seating_capacity} Seater Capacity</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                Available
                              </span>
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-brand-primary bg-brand-primary text-white"
                                  : "border-brand-border bg-white"
                              }`}>
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="p-4 border-t border-brand-border bg-brand-background flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTableDrawerOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!selectedCandidateTableId || isSubmitting}
                      onClick={handleProceedToConfirmFromDrawer}
                      className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {drawerMode === "reassign" ? "Review Reassignment" : "Review Assignment"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CONCISE CONFIRMATION PROMPT: ASSIGN / REASSIGN (User Story 15.4)         */}
            {/* ========================================================================= */}
            {confirmAssignmentData && (
              <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      confirmAssignmentData.mode === "reassign" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {confirmAssignmentData.mode === "reassign" ? (
                        <ArrowRightLeft className="h-5 w-5" />
                      ) : (
                        <UserCheck className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-secondary">
                        {confirmAssignmentData.mode === "reassign"
                          ? "Confirm Table Reassignment"
                          : "Confirm Table Assignment"}
                      </h4>
                      <p className="text-xs text-brand-text-muted">
                        Token #{confirmAssignmentData.entry.queue_token || confirmAssignmentData.entry.queue_number || confirmAssignmentData.entry.token_number}
                      </p>
                    </div>
                  </div>

                  {/* Concise Prompt per Story 15.4 Section 3 */}
                  <div className="p-3.5 rounded-2xl bg-brand-background border border-brand-border text-xs leading-relaxed text-brand-secondary">
                    {confirmAssignmentData.mode === "reassign" ? (
                      <>
                        Reassign Table from{" "}
                        <strong className="text-amber-800">
                          {confirmAssignmentData.entry.assigned_table_label?.toLowerCase().startsWith("table")
                            ? confirmAssignmentData.entry.assigned_table_label
                            : `Table ${confirmAssignmentData.entry.assigned_table_label || "Current Table"}`}
                        </strong>{" "}
                        to{" "}
                        <strong className="text-emerald-800">
                          {confirmAssignmentData.table.table_label.toLowerCase().startsWith("table")
                            ? confirmAssignmentData.table.table_label
                            : `Table ${confirmAssignmentData.table.table_label}`}
                        </strong>{" "}
                        for{" "}
                        <strong>
                          {confirmAssignmentData.entry.customer_name || confirmAssignmentData.entry.guest_name}
                        </strong>
                        ?
                      </>
                    ) : (
                      <>
                        Assign{" "}
                        <strong className="text-brand-primary">
                          {confirmAssignmentData.table.table_label.toLowerCase().startsWith("table")
                            ? confirmAssignmentData.table.table_label
                            : `Table ${confirmAssignmentData.table.table_label}`}
                        </strong>{" "}
                        to{" "}
                        <strong>
                          {confirmAssignmentData.entry.customer_name || confirmAssignmentData.entry.guest_name}
                        </strong>{" "}
                        ({confirmAssignmentData.entry.guest_count || confirmAssignmentData.entry.party_size} Guests)?
                      </>
                    )}
                  </div>

                  <p className="text-[11px] text-brand-text-muted italic">
                    Strict boundary: Only prepares physical seating. Zero premature session creation, billing ledger opening, or KOT creation.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmAssignmentData(null)}
                      className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleExecuteConfirmedAssignment}
                      className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : confirmAssignmentData.mode === "reassign"
                        ? "Confirm Reassignment"
                        : "Confirm Assignment"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CONCISE CONFIRMATION PROMPT: CANCEL ASSIGNMENT (User Story 15.4 Workflow C) */}
            {/* ========================================================================= */}
            {cancelAssignConfirmEntry && (
              <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
                      <Undo2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-secondary">
                        Cancel Table Assignment?
                      </h4>
                      <p className="text-xs text-brand-text-muted">
                        Token #{cancelAssignConfirmEntry.queue_token || cancelAssignConfirmEntry.queue_number || cancelAssignConfirmEntry.token_number} • {canViewCustInfo ? (cancelAssignConfirmEntry.customer_name || cancelAssignConfirmEntry.guest_name) : maskCustomerName(cancelAssignConfirmEntry.customer_name || cancelAssignConfirmEntry.guest_name)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Remove table assignment and return customer to waiting queue? Table{" "}
                    <strong className="text-brand-secondary">
                      {cancelAssignConfirmEntry.assigned_table_label || "Assigned"}
                    </strong>{" "}
                    will be immediately released back to Available in the table grid, and the customer&apos;s live mobile screen will transition back to the queue tracker.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCancelAssignConfirmEntry(null)}
                      className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted"
                    >
                      Keep Assignment
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmCancelAssignment}
                      className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {isSubmitting ? "Releasing..." : "Confirm Cancellation"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMATION DIALOG: MARK NO SHOW */}
            {noShowConfirmEntry && (
              <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
                      <UserX className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-secondary">
                        Mark as No Show?
                      </h4>
                      <p className="text-xs text-brand-text-muted">
                        Token #{noShowConfirmEntry.queue_token || noShowConfirmEntry.queue_number} • {canViewCustInfo ? (noShowConfirmEntry.customer_name || noShowConfirmEntry.guest_name) : maskCustomerName(noShowConfirmEntry.customer_name || noShowConfirmEntry.guest_name)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Customer did not arrive when called. This will mark their status as <strong>NO_SHOW</strong> and remove them from the active queue UI. Historical records will remain saved for analytics.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setNoShowConfirmEntry(null)}
                      className="flex-1 py-2 rounded-xl border border-brand-border text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmNoShow}
                      className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-2xs"
                    >
                      {isSubmitting ? "Updating..." : "Confirm No Show"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMATION DIALOG: REMOVE CUSTOMER */}
            {removeConfirmEntry && (
              <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-secondary">
                        Remove from Waiting List?
                      </h4>
                      <p className="text-xs text-brand-text-muted">
                        Token #{removeConfirmEntry.queue_token || removeConfirmEntry.queue_number} • {canViewCustInfo ? (removeConfirmEntry.customer_name || removeConfirmEntry.guest_name) : maskCustomerName(removeConfirmEntry.customer_name || removeConfirmEntry.guest_name)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Remove customer from waiting list? This sets their status to <strong>REMOVED</strong>. The record will remain archived for reporting and audit history.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRemoveConfirmEntry(null)}
                      className="flex-1 py-2 rounded-xl border border-brand-border text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmRemove}
                      className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-2xs"
                    >
                      {isSubmitting ? "Removing..." : "Confirm Remove"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE-OVER SUMMARY: VIEW DETAILS */}
            {viewDetailsEntry && (
              <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex justify-end">
                <div className="w-full md:w-[420px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                  <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface-muted/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-brand-primary bg-brand-primary-light/70 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                        #{viewDetailsEntry.queue_token || viewDetailsEntry.queue_number}
                      </span>
                      <h3 className="text-sm font-black text-brand-secondary">
                        Waitlist Details
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewDetailsEntry(null)}
                      className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(() => {
                      const detailsWaitingEntries = queueEntries.filter(
                        (e) => isWaiting(e) && (viewDetailsEntry.section_id ? e.section_id === viewDetailsEntry.section_id : true)
                      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                      const detailsPosIdx = detailsWaitingEntries.findIndex((e) => e.id === viewDetailsEntry.id);
                      const detailsPosition = detailsPosIdx >= 0 ? detailsPosIdx + 1 : 0;
                      const detailsPartiesAhead = Math.max(0, detailsPosition - 1);
                      const isDetailsCustomerReg = viewDetailsEntry.registration_method === "CUSTOMER_SELF" ||
                        (viewDetailsEntry.registered_by || "").toLowerCase().includes("customer") ||
                        (viewDetailsEntry.registered_by || "").toLowerCase().includes("self");

                      return (
                        <div className="p-4 rounded-2xl border border-brand-border bg-brand-background space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Customer Name:</span>
                            <span className="text-xs font-bold text-brand-secondary">
                              {canViewCustInfo
                                ? (viewDetailsEntry.customer_name || viewDetailsEntry.guest_name)
                                : maskCustomerName(viewDetailsEntry.customer_name || viewDetailsEntry.guest_name)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Mobile Number:</span>
                            <span className="text-xs font-bold text-brand-secondary">
                              {canViewPhone 
                                ? (viewDetailsEntry.raw_mobile || viewDetailsEntry.mobile_number || viewDetailsEntry.phone)
                                : maskPhoneNumber(viewDetailsEntry.raw_mobile || viewDetailsEntry.mobile_number || viewDetailsEntry.phone)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Party Size:</span>
                            <span className="text-xs font-bold text-brand-secondary">
                              {viewDetailsEntry.guest_count || viewDetailsEntry.party_size} Guests
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Status:</span>
                            <span className="text-xs font-bold text-brand-secondary">
                              {viewDetailsEntry.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Dining Section:</span>
                            <span className="text-xs font-bold text-brand-secondary flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-brand-primary" />
                              <span>{viewDetailsEntry.section_name || sections.find((s) => s.id === viewDetailsEntry.section_id)?.name || "General Queue"}</span>
                            </span>
                          </div>
                          {isWaiting(viewDetailsEntry) && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-brand-text-muted">Queue Position:</span>
                              <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1">
                                <Radio className="h-2.5 w-2.5 text-amber-600 animate-pulse" />
                                <span>{detailsPosition > 0 ? `${formatOrdinalNumber(detailsPosition)} in queue (${detailsPartiesAhead} ahead)` : "Waiting in queue"}</span>
                              </span>
                            </div>
                          )}
                          {viewDetailsEntry.assigned_table_label && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-brand-text-muted">Assigned Table:</span>
                              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Table {viewDetailsEntry.assigned_table_label}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Registration Method:</span>
                            <span className="text-xs font-bold text-brand-secondary">
                              {viewDetailsEntry.registration_method || "STAFF_WALKIN"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Current Wait Duration:</span>
                            <span className="text-xs font-bold text-amber-700">
                              {calculateWaitDuration(viewDetailsEntry.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Registered At:</span>
                            <span className="text-[11px] font-semibold text-brand-text-secondary">
                              {new Date(viewDetailsEntry.created_at).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-text-muted">Registered By:</span>
                            <span className="text-xs font-bold text-brand-secondary">
                              {isDetailsCustomerReg ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  <Smartphone className="h-3 w-3 text-emerald-600" />
                                  Customer Self-Service (QR)
                                </span>
                              ) : (
                                <span>{viewDetailsEntry.registered_by || "Staff"} (Staff)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Notes Box */}
                    <div className="p-3.5 rounded-2xl border border-brand-border bg-white space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
                        Customer Notes
                      </span>
                      <p className="text-xs text-brand-secondary italic">
                        {viewDetailsEntry.notes || "No special instructions provided."}
                      </p>
                    </div>

                    {/* Activity Timeline */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-brand-secondary block">
                        Activity & Event Timeline
                      </span>
                      <ActivityLogList entries={viewDetailsEntry.activity_logs || []} compact={false} />
                    </div>
                  </div>

                  <div className="p-4 border-t border-brand-border">
                    <button
                      type="button"
                      onClick={() => setViewDetailsEntry(null)}
                      className="w-full py-2.5 rounded-xl border border-brand-border text-brand-secondary font-bold text-xs hover:bg-brand-surface-muted"
                    >
                      Close Summary
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
