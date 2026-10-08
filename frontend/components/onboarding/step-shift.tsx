"use client";

import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Moon, 
  Sun, 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Loader2, 
  Sparkles 
} from "lucide-react";
import { branding } from "@/config/branding";
import { ShiftSchema, type ShiftInput } from "@/lib/onboarding/schemas";
import { 
  formatTime12h, 
  findShiftConflicts, 
  autoDetectCrossMidnight 
} from "@/lib/onboarding/shift-utils";

interface ShiftRecord {
  id: string;
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
  cross_midnight: boolean;
  active: boolean;
  default_shift: boolean;
  priority: number;
  notes?: string | null;
}

interface StepShiftProps {
  branchId: string;
  initialShifts: ShiftRecord[];
  onAddShift: (data: ShiftInput) => Promise<{ success: boolean; shift?: any; error?: string }>;
  onUpdateShift: (id: string, data: ShiftInput) => Promise<{ success: boolean; shift?: any; error?: string }>;
  onDeleteShift: (id: string) => Promise<{ success: boolean; error?: string }>;
  onCompletePhase?: () => void;
  onBackToKitchens?: () => void;
  isSettingsMode?: boolean;
}

export default function StepShift({
  branchId,
  initialShifts,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onCompletePhase,
  onBackToKitchens,
  isSettingsMode = false,
}: StepShiftProps) {
  const [shifts, setShifts] = useState<ShiftRecord[]>(initialShifts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState<ShiftInput>({
    name: "",
    start_time: "09:00",
    end_time: "17:00",
    cross_midnight: false,
    active: true,
    default_shift: false,
    priority: 0,
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [gatingMessage, setGatingMessage] = useState<string | null>(null);

  // Keep state in sync with prop updates
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShifts(initialShifts);
  }, [initialShifts]);

  const activeShiftCount = shifts.filter((s) => s.active).length;

  // Auto-detect cross midnight whenever start_time or end_time changes
  const handleTimeChange = (field: "start_time" | "end_time", value: string) => {
    const nextStart = field === "start_time" ? value : formData.start_time;
    const nextEnd = field === "end_time" ? value : formData.end_time;
    const crosses = autoDetectCrossMidnight(nextStart, nextEnd);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      cross_midnight: crosses ? true : prev.cross_midnight,
    }));
  };

  // Real-time overlap detection
  const currentConflicts = useMemo(() => {
    if (!formData.start_time || !formData.end_time) return [];
    return findShiftConflicts(
      {
        id: editingShift?.id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        cross_midnight: formData.cross_midnight,
      },
      shifts
    );
  }, [formData.start_time, formData.end_time, formData.cross_midnight, editingShift, shifts]);

  const openAddModal = () => {
    setEditingShift(null);
    setFormData({
      name: "",
      start_time: "09:00",
      end_time: "17:00",
      cross_midnight: false,
      active: true,
      default_shift: shifts.length === 0, // First shift defaults to true
      priority: shifts.length,
      notes: "",
    });
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (shift: ShiftRecord) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: shift.start_time?.slice(0, 5) || "09:00",
      end_time: shift.end_time?.slice(0, 5) || "17:00",
      cross_midnight: shift.cross_midnight,
      active: shift.active,
      default_shift: shift.default_shift,
      priority: shift.priority ?? 0,
      notes: shift.notes || "",
    });
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
    setFormErrors({});
    setActionError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const parseResult = ShiftSchema.safeParse(formData);
    if (!parseResult.success) {
      const errMap: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !errMap[path]) {
          errMap[path] = issue.message;
        }
      });
      setFormErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShift) {
        const res = await onUpdateShift(editingShift.id, formData);
        setIsSubmitting(false);
        if (!res.success) {
          setActionError(res.error || "Failed to update shift.");
          return;
        }

        setShifts((prev) =>
          prev.map((s) => {
            if (s.id === editingShift.id) {
              return { ...s, ...formData };
            }
            if (formData.default_shift) {
              return { ...s, default_shift: false };
            }
            return s;
          })
        );
        closeModal();
      } else {
        const res = await onAddShift(formData);
        setIsSubmitting(false);
        if (!res.success) {
          setActionError(res.error || "Failed to create shift.");
          return;
        }

        const newShift = res.shift;
        if (newShift) {
          setShifts((prev) => {
            let updated = prev;
            if (formData.default_shift) {
              updated = prev.map((s) => ({ ...s, default_shift: false }));
            }
            return [...updated, newShift];
          });
        }
        closeModal();
      }
      setGatingMessage(null);
    } catch (err: any) {
      setIsSubmitting(false);
      setActionError(err?.message || "Unexpected error.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete shift "${name}"?`)) {
      return;
    }

    try {
      const res = await onDeleteShift(id);
      if (res.success) {
        setShifts((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(res.error || "Unable to delete shift.");
      }
    } catch (err: any) {
      alert(err?.message || "Network error while deleting shift.");
    }
  };

  // Forward gating check to complete prompt scope
  const handleProceed = () => {
    if (activeShiftCount === 0) {
      setGatingMessage(
        "Please add at least 1 active operating shift to complete this step. Staff rosters and operational hours require defined shifts."
      );
      return;
    }
    setGatingMessage(null);
    onCompletePhase?.();
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* Step Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                {isSettingsMode ? "Operating Shifts & Schedules" : "Step 3: Operating Shifts & Schedules"}
              </h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Define the service time slots (Morning, Evening, Cross-midnight service) for staff scheduling and kitchen operation windows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-muted px-3 py-1 text-xs font-bold text-brand-secondary border border-brand-border">
            <span>{shifts.length} Shifts Configured</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Gating Error Banner */}
      {gatingMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl p-4 border border-rose-200 bg-rose-50 text-rose-900 text-xs sm:text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{gatingMessage}</span>
        </div>
      )}

      {/* Shifts List / Grid */}
      {shifts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brand-border p-12 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary mb-4">
            <Clock className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-brand-secondary">
            No Operating Shifts Configured Yet
          </h3>
          <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto leading-relaxed">
            Every branch requires at least 1 active operating shift (e.g. "Morning Shift" 08:00–16:00, "Dinner Service" 16:00–00:00) so staff and tables can be assigned.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Shift</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {shifts.map((shift) => {
            const startFormatted = formatTime12h(shift.start_time);
            const endFormatted = formatTime12h(shift.end_time);

            return (
              <div
                key={shift.id}
                className={`group rounded-2xl border p-5 transition-all relative ${
                  shift.active
                    ? "bg-white border-brand-border hover:border-brand-primary/40 hover:shadow-brandCard"
                    : "bg-brand-surface-muted/60 border-brand-border/60 opacity-60"
                }`}
              >
                {/* Shift Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                      {shift.cross_midnight ? (
                        <Moon className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-brand-secondary truncate">
                        {shift.name}
                      </h4>
                      <p className="text-xs font-bold text-brand-primary font-mono mt-0.5">
                        {startFormatted} – {endFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(shift)}
                      title="Edit Shift"
                      className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-primary transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(shift.id, shift.name)}
                      title="Delete Shift"
                      className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 my-3 text-[11px]">
                  {shift.default_shift && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 font-bold border border-amber-300">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Default Shift
                    </span>
                  )}
                  {shift.cross_midnight && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 font-semibold border border-indigo-200">
                      <Moon className="h-3 w-3 text-indigo-600" />
                      Crosses Midnight
                    </span>
                  )}
                  {shift.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 font-semibold border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 font-medium">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Priority & Notes */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-text-secondary">
                  <span>Priority Rank: P{shift.priority}</span>
                  {shift.notes && (
                    <span className="text-brand-text-muted truncate max-w-[150px]">
                      {shift.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      {!isSettingsMode && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-brand-border/60">
          <button
            type="button"
            onClick={onBackToKitchens}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface-muted px-6 py-3 text-sm font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Kitchen Management</span>
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <span>Save & Continue to Sections</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-brandModal border border-brand-border max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-secondary">
                    {editingShift ? "Edit Operating Shift" : "Add Operating Shift"}
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Configure operational hours, cross-midnight flags and priorities
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-surface-muted hover:text-brand-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl p-3 border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Shift Overlap Warning Banner (Soft Warning) */}
            {currentConflicts.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-900">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Schedule Overlap Notice:</span>
                    <p className="mt-0.5 leading-relaxed">
                      This shift overlaps with existing active shift(s):{" "}
                      <strong>
                        {currentConflicts.map((c) => `"${c.name}" (${c.timeRange})`).join(", ")}
                      </strong>
                      . You can proceed if an overlapping handover window is intended.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Shift Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Morning Shift, Dinner Service, Late Night Lounge"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                      : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleTimeChange("start_time", e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm font-mono focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                  {formErrors.start_time && <p className="mt-1 text-xs text-rose-600">{formErrors.start_time}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleTimeChange("end_time", e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm font-mono focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                  {formErrors.end_time && <p className="mt-1 text-xs text-rose-600">{formErrors.end_time}</p>}
                </div>
              </div>

              {/* Cross Midnight Confirmation Banner */}
              {formData.cross_midnight && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Crosses midnight into the following calendar day</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                    +1 Day
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Display Priority
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })}
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                  <p className="mt-1 text-[10px] text-brand-text-muted">Chronological sorting rank</p>
                </div>

                <div className="flex flex-col justify-end space-y-2 pb-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-brand-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.default_shift}
                      onChange={(e) => setFormData({ ...formData, default_shift: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary focus:ring-brand-primary h-4 w-4"
                    />
                    <span>Default Shift for Branch</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-brand-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary focus:ring-brand-primary h-4 w-4"
                    />
                    <span>Active Shift</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Operational Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Includes setup time and handover buffer."
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text-secondary hover:bg-brand-surface-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{editingShift ? "Update Shift" : "Create Shift"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
