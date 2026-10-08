"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  GitMerge, 
  Unlink, 
  AlertCircle, 
  Check, 
  Clock, 
  ShieldAlert, 
  Info,
  CheckCircle2,
  Layers,
  UserCheck
} from "lucide-react";
import { 
  OperationsTableItem, 
  OperationsMergeGroup,
  mergeTablesLogical, 
  isolateMergeGroup,
  isolateMergeGroupWithReassignment,
  isolateMergeGroupWithCustomerRelocation
} from "@/app/actions/operations-tables-actions";
import { canMergeTables } from "@/lib/auth/permissions";

interface MergeIsolatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  tables: OperationsTableItem[];
  sections: Array<{ id: string; name: string }>;
  mergeGroups?: OperationsMergeGroup[];
  currentUser?: {
    id: string;
    name: string;
    role: string;
    assigned_sections: string[];
  };
  onRefresh: () => void;
}

export default function MergeIsolatePanel({
  isOpen,
  onClose,
  branchId,
  tables,
  sections,
  mergeGroups = [],
  currentUser,
  onRefresh,
}: MergeIsolatePanelProps) {
  // Permission evaluation (Owner, Branch Manager, Section Manager)
  const isAuthorized = canMergeTables({
    role: currentUser?.role,
    assignedSections: currentUser?.assigned_sections,
  });

  // Filter sections by staff assignment if restricted
  const accessibleSections = useMemo(() => {
    if (!currentUser?.assigned_sections || currentUser.assigned_sections.length === 0) {
      return sections;
    }
    const filtered = sections.filter((s) => currentUser.assigned_sections.includes(s.id));
    return filtered.length > 0 ? filtered : sections;
  }, [sections, currentUser]);

  // Active top tab: "merge" (create new merge) or "list" (manage existing merged groups)
  const [activeTab, setActiveTab] = useState<"merge" | "list">("merge");

  // Section Selector: "all" or specific section_id
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    accessibleSections[0]?.id || "all"
  );

  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Session Reassignment Modal State
  const [reassignModalGroup, setReassignModalGroup] = useState<{
    id: string;
    name: string;
    memberTables: Array<{ id: string; name: string }>;
  } | null>(null);
  const [selectedTargetTableId, setSelectedTargetTableId] = useState<string>("");

  // Customer Relocation Modal State (when unmerging table assigned to a waitlist customer)
  const [relocateModalData, setRelocateModalData] = useState<{
    groupId: string;
    groupName: string;
    waitlistEntry: {
      id: string;
      customer_name: string;
      queue_token: string;
      guest_count: number;
    };
    memberTables: Array<{ id: string; name: string; capacity?: number }>;
  } | null>(null);
  const [selectedRelocateTableId, setSelectedRelocateTableId] = useState<string>("");

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (relocateModalData) {
          setRelocateModalData(null);
        } else if (reassignModalGroup) {
          setReassignModalGroup(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, reassignModalGroup, relocateModalData]);

  // Reset local state when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTableIds([]);
      setErrorMsg(null);
      setSuccessMsg(null);
      setReassignModalGroup(null);
      setSelectedTargetTableId("");
      setRelocateModalData(null);
      setSelectedRelocateTableId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build merged groups list (combining explicit table_merge_groups and runtime session_tables)
  const mergedGroupsList: Array<{
    id: string;
    name: string;
    section_id: string;
    section_name: string;
    primary_table_id: string;
    member_table_ids: string[];
    member_table_labels: string[];
    has_active_session: boolean;
    active_session_opened_at?: string;
  }> = [];

  // 1. From database table_merge_groups
  mergeGroups.forEach((mg) => {
    const memberTables = tables.filter((t) => mg.member_table_ids.includes(t.id));
    const sec = sections.find((s) => s.id === mg.section_id);
    const hasActiveSession = memberTables.some((t) => Boolean(t.active_session));
    const activeSess = memberTables.find((t) => t.active_session)?.active_session;

    mergedGroupsList.push({
      id: mg.id,
      name: mg.name,
      section_id: mg.section_id,
      section_name: sec?.name || "Section",
      primary_table_id: mg.primary_table_id,
      member_table_ids: mg.member_table_ids,
      member_table_labels: mg.member_table_labels,
      has_active_session: hasActiveSession,
      active_session_opened_at: activeSess?.opened_at,
    });
  });

  // 2. Fallback: discover any legacy active sessions with merged tables not yet in table_merge_groups
  const existingGroupIds = new Set(mergeGroups.map((g) => g.id));
  const legacySessionGroups = new Map<string, OperationsTableItem[]>();
  tables.forEach((t) => {
    if (t.active_session && t.active_session.merged_table_ids.length > 1) {
      if (!t.merge_group_id || !existingGroupIds.has(t.merge_group_id)) {
        const list = legacySessionGroups.get(t.active_session.id) || [];
        if (!list.some((item) => item.id === t.id)) {
          list.push(t);
        }
        legacySessionGroups.set(t.active_session.id, list);
      }
    }
  });

  legacySessionGroups.forEach((groupTables, sessionId) => {
    const sorted = [...groupTables].sort((a, b) => a.table_number - b.table_number);
    const labels = sorted.map((t) => t.short_code || `T${t.table_number}`);
    const sec = sections.find((s) => s.id === sorted[0].section_id);
    mergedGroupsList.push({
      id: `legacy-${sessionId}`,
      name: labels.join(", "),
      section_id: sorted[0].section_id,
      section_name: sec?.name || "Section",
      primary_table_id: sorted[0].id,
      member_table_ids: sorted.map((t) => t.id),
      member_table_labels: labels,
      has_active_session: true,
      active_session_opened_at: sorted[0].active_session?.opened_at,
    });
  });

  // Filter existing merged groups by accessible sections
  const filteredMergedGroups = mergedGroupsList.filter((g) => {
    if (selectedSectionId !== "all" && g.section_id !== selectedSectionId) {
      return false;
    }
    return accessibleSections.some((s) => s.id === g.section_id);
  });

  // Determine section to display tables for in Merge view
  const currentSectionIdForTables = selectedSectionId === "all"
    ? accessibleSections[0]?.id || ""
    : selectedSectionId;

  // Filter candidate tables for current section
  const sectionTables = tables.filter(
    (t) => t.section_id === currentSectionIdForTables && t.status !== "inactive"
  );

  // Helper: check table eligibility per User Story 15.1
  // A table is eligible to merge only if:
  // 1. Status is Available (no active session).
  // 2. Not already part of another merge group.
  // 3. Status is NOT Inactive or Maintenance.
  // 4. Belongs to the selected section.
  const isTableEligible = (table: OperationsTableItem): { eligible: boolean; reason?: string } => {
    if (table.active_session) {
      return { eligible: false, reason: "Occupied" };
    }
    if (table.status === "reserved" || table.reservation) {
      return { eligible: false, reason: "Reserved" };
    }
    if (table.status === "inactive") {
      return { eligible: false, reason: "Inactive" };
    }
    if (table.merge_group_id || table.is_primary_merged || table.is_secondary_merged) {
      return { eligible: false, reason: "Already Merged" };
    }
    return { eligible: true };
  };

  // Toggle selection with Homogeneous Section Enforcement
  const toggleTableSelection = (table: OperationsTableItem) => {
    const { eligible, reason } = isTableEligible(table);
    if (!eligible) {
      setErrorMsg(`Table ${table.short_code} cannot be merged: ${reason}`);
      return;
    }

    setErrorMsg(null);
    setSelectedTableIds((prev) => {
      if (prev.includes(table.id)) {
        return prev.filter((id) => id !== table.id);
      }

      // Check section homogeneity if another table is already selected
      if (prev.length > 0) {
        const firstSelected = tables.find((t) => t.id === prev[0]);
        if (firstSelected && firstSelected.section_id !== table.section_id) {
          setErrorMsg("Cross-section merging is disallowed. All selected tables must be in the same section.");
          return prev;
        }
      }

      return [...prev, table.id];
    });
  };

  // Live preview short label string (e.g., "T1 + T2")
  const selectedTables = tables.filter((t) => selectedTableIds.includes(t.id));
  const sortedSelected = [...selectedTables].sort((a, b) => a.table_number - b.table_number);
  const livePreviewLabel = sortedSelected.map((t) => t.short_code || `T${t.table_number}`).join(" + ");

  // Handle Create Logical Merge
  const handleMergeSubmit = async () => {
    if (selectedTableIds.length < 2) {
      setErrorMsg("Select at least two tables.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await mergeTablesLogical(selectedTableIds, branchId);
    setIsSubmitting(false);

    if (res.success) {
      setSelectedTableIds([]);
      setSuccessMsg(`Merged Table ${livePreviewLabel} created successfully! Individual tables hidden; logical card active.`);
      onRefresh();
      // Auto-switch to list tab to see the new group
      setTimeout(() => {
        setActiveTab("list");
      }, 700);
    } else {
      setErrorMsg(res.error || "Failed to merge selected tables.");
    }
  };

  // Handle Isolate Click
  const handleIsolateClick = async (group: typeof mergedGroupsList[0]) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // If it's a legacy session without table_merge_groups row
    if (group.id.startsWith("legacy-")) {
      // Prompt reassignment modal
      const memberTbls = tables
        .filter((t) => group.member_table_ids.includes(t.id))
        .map((t) => ({ id: t.id, name: t.short_code || `T${t.table_number}` }));

      setReassignModalGroup({
        id: group.id,
        name: group.name,
        memberTables: memberTbls,
      });
      setSelectedTargetTableId(memberTbls[0]?.id || "");
      setIsSubmitting(false);
      return;
    }

    // Attempt Case A: Idle isolate
    const res = await isolateMergeGroup(group.id, branchId);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Group ${group.name} isolated back into independent Available tables.`);
      onRefresh();
    } else if (res.requiresCustomerRelocation && res.waitlistEntry && res.memberTables) {
      // Case C: Waitlist customer assigned to merged group! Open customer relocation modal
      setRelocateModalData({
        groupId: group.id,
        groupName: group.name,
        waitlistEntry: res.waitlistEntry,
        memberTables: res.memberTables,
      });
      setSelectedRelocateTableId(res.memberTables[0]?.id || "");
    } else if (res.requiresReassignment || res.error === "ACTIVE_SESSION_DETECTED") {
      // Case B: Active session detected! Open reassignment modal
      const memberTbls = res.memberTables && res.memberTables.length > 0
        ? res.memberTables
        : tables
            .filter((t) => group.member_table_ids.includes(t.id))
            .map((t) => ({ id: t.id, name: t.short_code || `T${t.table_number}` }));

      setReassignModalGroup({
        id: group.id,
        name: group.name,
        memberTables: memberTbls,
      });
      setSelectedTargetTableId(memberTbls[0]?.id || "");
    } else {
      setErrorMsg(res.error || "Failed to isolate table group.");
    }
  };

  // Handle Reassignment Confirmation (Case B)
  const handleConfirmReassignment = async () => {
    if (!reassignModalGroup || !selectedTargetTableId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await isolateMergeGroupWithReassignment(
      reassignModalGroup.id,
      selectedTargetTableId,
      branchId
    );
    setIsSubmitting(false);

    if (res.success) {
      const targetTable = tables.find((t) => t.id === selectedTargetTableId);
      const targetLabel = targetTable?.short_code || "selected table";
      setSuccessMsg(`Active session reassigned exclusively to ${targetLabel}. Remaining tables are now Available.`);
      setReassignModalGroup(null);
      setSelectedTargetTableId("");
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to reassign session and isolate tables.");
    }
  };

  // Handle Customer Relocation Confirmation (Case C: Waitlist customer allocated to unmerged table)
  const handleConfirmRelocation = async () => {
    if (!relocateModalData || !selectedRelocateTableId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await isolateMergeGroupWithCustomerRelocation(
      relocateModalData.groupId,
      selectedRelocateTableId,
      branchId,
      currentUser?.name || "Staff",
      currentUser?.id || null
    );
    setIsSubmitting(false);

    if (res.success) {
      const targetTable = relocateModalData.memberTables.find((t) => t.id === selectedRelocateTableId);
      const targetLabel = targetTable?.name || res.newTableLabel || "selected table";
      setSuccessMsg(`Merged table unmerged. Customer moved to Table ${targetLabel}. Remaining tables are now Available.`);
      setRelocateModalData(null);
      setSelectedRelocateTableId("");
      onRefresh();
    } else {
      setErrorMsg(res.error || "Failed to unmerge and relocate customer.");
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && !reassignModalGroup) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      {/* 
        Responsive Drawer Container:
        - Desktop / Tablet (md+): Right-side slide-over panel (480px / 540px width).
        - Mobile (<md): Full-screen bottom-sheet / drawer (w-full h-full).
        Strictly adheres to BharatQR responsive panel pattern.
      */}
      <div className="w-full md:w-[480px] lg:w-[540px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* PANEL HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shadow-2xs">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-brand-secondary tracking-tight">
                  Merge / Isolate Tables
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  Operations
                </span>
              </div>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Manage operational table layout without altering physical QR entities
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors"
            title="Close Panel (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PERMISSION GUARD */}
        {!isAuthorized ? (
          <div className="p-6 m-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold">Permission Required</h3>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Table merging and isolation requires the <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono font-bold">tables.merge</code> permission (Roles: Owner, Branch Manager, Section Manager). Your current role does not have authorization to modify floor table groupings.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
            >
              Return to Floor
            </button>
          </div>
        ) : (
          <>
            {/* TAB SELECTOR: [Merge Tables] vs [Merged Tables (Count)] */}
            <div className="flex items-center border-b border-brand-border bg-white px-4 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("merge");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === "merge"
                    ? "border-brand-primary text-brand-primary font-black"
                    : "border-transparent text-brand-text-muted hover:text-brand-secondary"
                }`}
              >
                <GitMerge className="h-4 w-4" />
                <span>Merge Tables</span>
                {selectedTableIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-brand-primary text-white text-[10px] font-black">
                    {selectedTableIds.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("list");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === "list"
                    ? "border-brand-primary text-brand-primary font-black"
                    : "border-transparent text-brand-text-muted hover:text-brand-secondary"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Merged Tables</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black border border-purple-300">
                  {mergedGroupsList.length}
                </span>
              </button>
            </div>

            {/* ERROR OR SUCCESS NOTIFICATIONS */}
            {errorMsg && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span className="flex-1 font-medium">{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {successMsg && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="flex-1 font-medium">{successMsg}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMsg(null)}
                  className="p-1 text-emerald-500 hover:text-emerald-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* SCROLLABLE BODY CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* ============================================================== */}
              {/* TAB 1: MERGE TABLES WORKFLOW                                  */}
              {/* ============================================================== */}
              {activeTab === "merge" && (
                <div className="space-y-4">
                  {/* Step 1: Section Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                        1. Select Section
                      </label>
                      <span className="text-[11px] text-brand-text-muted">
                        Homogeneous section required
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {accessibleSections.map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setSelectedSectionId(sec.id);
                            setSelectedTableIds([]);
                            setErrorMsg(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                            currentSectionIdForTables === sec.id
                              ? "bg-brand-secondary text-white border-brand-secondary shadow-xs"
                              : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
                          }`}
                        >
                          {sec.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Display Eligible Tables */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                        2. Select 2+ Eligible Tables
                      </label>
                      <span className="text-[11px] font-semibold text-brand-text-muted">
                        {sectionTables.length} total units in section
                      </span>
                    </div>

                    <p className="text-[11px] text-brand-text-muted leading-relaxed">
                      Only <strong>Available</strong> tables without active sessions or prior merges are eligible. Merging creates an Available logical card without starting a session.
                    </p>

                    {sectionTables.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-brand-background border border-dashed border-brand-border space-y-1">
                        <p className="text-xs font-bold text-brand-secondary">No tables found</p>
                        <p className="text-[11px] text-brand-text-muted">
                          This dining section does not have active tables.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {sectionTables.map((table) => {
                          const isSelected = selectedTableIds.includes(table.id);
                          const { eligible, reason } = isTableEligible(table);
                          const shortLabel = table.short_code || `T${table.table_number}`;

                          return (
                            <button
                              key={table.id}
                              type="button"
                              disabled={!eligible}
                              onClick={() => toggleTableSelection(table)}
                              className={`p-3 rounded-2xl border text-left transition-all relative select-none flex flex-col justify-between h-[84px] ${
                                !eligible
                                  ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                                  : isSelected
                                  ? "border-brand-primary bg-brand-primary-light/60 shadow-xs ring-2 ring-brand-primary/20"
                                  : "border-brand-border bg-white hover:border-brand-primary/50 hover:bg-brand-surface-muted/40 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                {/* Compact short label: [T1], NOT Table 1 */}
                                <span className={`text-sm font-black tracking-tight ${
                                  isSelected ? "text-brand-primary" : "text-brand-secondary"
                                }`}>
                                  {shortLabel}
                                </span>

                                {isSelected ? (
                                  <div className="h-4 w-4 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0">
                                    <Check className="h-2.5 w-2.5" />
                                  </div>
                                ) : (
                                  <span 
                                    className={`h-2 w-2 rounded-full shrink-0 ${
                                      eligible ? "bg-emerald-500" : "bg-gray-300"
                                    }`}
                                  />
                                )}
                              </div>

                              <div className="mt-1">
                                <span className="text-[10px] font-bold block truncate">
                                  {eligible ? (
                                    <span className="text-emerald-700">Available</span>
                                  ) : (
                                    <span className="text-gray-500">{reason}</span>
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Live Preview & Submission */}
                  {selectedTableIds.length >= 2 && (
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900">Merge Preview:</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {selectedTableIds.length} tables
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between">
                        <span className="text-xs font-black text-purple-950">
                          Merged Table: {livePreviewLabel}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Available
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px] text-purple-900/80 pt-1">
                        <Info className="h-3.5 w-3.5 shrink-0 text-purple-700 mt-0.5" />
                        <span>
                          No session will be started. The card will appear as <strong>{livePreviewLabel}</strong> with "Tap to seat or reserve". Individual physical cards are removed from the grid.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Primary CTA Button */}
                  <button
                    type="button"
                    disabled={selectedTableIds.length < 2 || isSubmitting}
                    onClick={handleMergeSubmit}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-brandCard hover:bg-brand-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GitMerge className="h-4 w-4" />
                    <span>
                      {isSubmitting
                        ? "Merging Tables..."
                        : selectedTableIds.length < 2
                        ? "Select at least 2 tables to merge"
                        : `Merge Selected Tables (${livePreviewLabel})`}
                    </span>
                  </button>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: EXISTING MERGED TABLES REGISTRY & ISOLATE FLOW          */}
              {/* ============================================================== */}
              {activeTab === "list" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                        Existing Merged Tables
                      </h3>
                      <p className="text-[11px] text-brand-text-muted mt-0.5">
                        Active logical table groups on the floor
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-200">
                      {filteredMergedGroups.length}
                    </span>
                  </div>

                  {filteredMergedGroups.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-brand-background border border-dashed border-brand-border space-y-2">
                      <GitMerge className="h-8 w-8 text-brand-text-muted mx-auto stroke-1" />
                      <p className="text-xs font-bold text-brand-secondary">
                        No merged tables currently active
                      </p>
                      <p className="text-[11px] text-brand-text-muted max-w-xs mx-auto">
                        Use the "Merge Tables" tab to combine 2 or more physical tables into a single logical table.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("merge")}
                        className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors inline-flex items-center gap-1.5"
                      >
                        <GitMerge className="h-3.5 w-3.5" />
                        <span>Create First Merge</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMergedGroups.map((group) => {
                        return (
                          <div
                            key={group.id}
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              group.has_active_session
                                ? "border-blue-200 bg-blue-50/40"
                                : "border-emerald-200 bg-emerald-50/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${
                                  group.has_active_session ? "bg-blue-500 ring-2 ring-blue-100" : "bg-emerald-500 ring-2 ring-emerald-100"
                                }`} />
                                <h4 className="text-sm font-black text-brand-secondary">
                                  {group.name}
                                </h4>
                                <span className="text-[10px] font-bold text-brand-text-muted bg-white px-2 py-0.5 rounded-md border border-brand-border">
                                  {group.section_name}
                                </span>
                              </div>

                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                group.has_active_session
                                  ? "bg-blue-100 text-blue-900 border-blue-200"
                                  : "bg-emerald-100 text-emerald-900 border-emerald-200"
                              }`}>
                                {group.has_active_session ? "Active Session" : "Available"}
                              </span>
                            </div>

                            {/* Member Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] text-brand-text-muted font-semibold">
                                Members:
                              </span>
                              {group.member_table_labels.map((lbl, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg bg-white border border-brand-border text-xs font-bold text-brand-secondary shadow-2xs"
                                >
                                  {lbl}
                                </span>
                              ))}
                            </div>

                            {/* Action Row */}
                            <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                              <div className="text-[11px] text-brand-text-muted">
                                {group.has_active_session ? (
                                  <span className="flex items-center gap-1 text-blue-800 font-semibold">
                                    <Clock className="h-3 w-3" />
                                    <span>Running tab active</span>
                                  </span>
                                ) : (
                                  <span className="text-emerald-800 font-semibold">
                                    Idle • Ready to seat or isolate
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleIsolateClick(group)}
                                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                              >
                                <Unlink className="h-3.5 w-3.5" />
                                <span>Isolate</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* =================================================================== */}
      {/* CASE B: ACTIVE SESSION DETECTED REASSIGNMENT MODAL                  */}
      {/* =================================================================== */}
      {reassignModalGroup && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setReassignModalGroup(null);
          }}
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 border border-brand-border">
            
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-brand-secondary tracking-tight">
                  Active Session Detected
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Merged Table: <strong className="text-brand-secondary">{reassignModalGroup.name}</strong>
                </p>
              </div>
            </div>

            {/* Explanatory Body */}
            <p className="text-xs text-brand-text-secondary leading-relaxed bg-brand-surface-muted/70 p-3 rounded-2xl border border-brand-border">
              Select which physical table will inherit the ongoing session, fired kitchen orders, and running tab. The remaining tables will immediately return to <strong>Available</strong> status.
            </p>

            {/* Member Radio Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider block">
                Destination Table for Active Session:
              </label>

              <div className="space-y-2">
                {reassignModalGroup.memberTables.map((tbl) => {
                  const isChecked = selectedTargetTableId === tbl.id;
                  return (
                    <label
                      key={tbl.id}
                      onClick={() => setSelectedTargetTableId(tbl.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                        isChecked
                          ? "border-brand-primary bg-brand-primary-light/50 ring-2 ring-brand-primary/20 shadow-xs"
                          : "border-brand-border bg-white hover:bg-brand-surface-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="destinationTable"
                          value={tbl.id}
                          checked={isChecked}
                          onChange={() => setSelectedTargetTableId(tbl.id)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-border"
                        />
                        <div>
                          <span className="text-sm font-black text-brand-secondary block">
                            {tbl.name}
                          </span>
                          <span className="text-[11px] text-brand-text-muted block">
                            Inherits active session, orders, and bill
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-primary text-white">
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setReassignModalGroup(null)}
                className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedTargetTableId || isSubmitting}
                onClick={handleConfirmReassignment}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover shadow-brandCard transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Unlink className="h-4 w-4" />
                <span>{isSubmitting ? "Reassigning..." : "Confirm & Isolate"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMER RELOCATION MODAL (Case C: Waitlist customer assigned to merged group) */}
      {/* ========================================================================= */}
      {relocateModalData && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setRelocateModalData(null);
          }}
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 border border-brand-border">
            
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-800 shrink-0">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-brand-secondary tracking-tight">
                  Relocate Assigned Customer
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Merged Table: <strong className="text-brand-secondary">{relocateModalData.groupName}</strong>
                </p>
              </div>
            </div>

            {/* Explanatory Body */}
            <div className="text-xs text-brand-text-secondary leading-relaxed bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200 space-y-1.5">
              <p className="font-bold text-indigo-950">
                Waitlist Customer: {relocateModalData.waitlistEntry.customer_name} (#{relocateModalData.waitlistEntry.queue_token}, {relocateModalData.waitlistEntry.guest_count} Guests)
              </p>
              <p className="text-indigo-900/80">
                Select which physical table this customer should be moved to upon unmerging. That table will remain <strong>Assigned</strong>, and all other member tables will return to <strong>Available</strong>.
              </p>
            </div>

            {/* Member Radio Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider block">
                Destination Table for Customer:
              </label>

              <div className="space-y-2">
                {relocateModalData.memberTables.map((tbl) => {
                  const isChecked = selectedRelocateTableId === tbl.id;
                  return (
                    <label
                      key={tbl.id}
                      onClick={() => setSelectedRelocateTableId(tbl.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                        isChecked
                          ? "border-brand-primary bg-brand-primary-light/50 ring-2 ring-brand-primary/20 shadow-xs"
                          : "border-brand-border bg-white hover:bg-brand-surface-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="relocateDestinationTable"
                          value={tbl.id}
                          checked={isChecked}
                          onChange={() => setSelectedRelocateTableId(tbl.id)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-border"
                        />
                        <div>
                          <span className="text-sm font-black text-brand-secondary block">
                            {tbl.name}
                          </span>
                          <span className="text-[11px] text-brand-text-muted block">
                            {tbl.capacity ? `${tbl.capacity} Seater • ` : ""}Holds waitlist assignment
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-primary text-white">
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRelocateModalData(null)}
                className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedRelocateTableId || isSubmitting}
                onClick={handleConfirmRelocation}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover shadow-brandCard transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                <span>{isSubmitting ? "Relocating..." : "Confirm & Move Customer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
