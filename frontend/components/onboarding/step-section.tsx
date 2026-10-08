"use client";

import React, { useState } from "react";
import { 
  LayoutGrid, 
  Wine, 
  BedDouble, 
  DoorClosed, 
  Home, 
  Presentation, 
  Trees, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Loader2, 
  CheckCircle2,
  QrCode,
  Users2,
  Building,
  Layers
} from "lucide-react";
import { branding } from "@/config/branding";
import { SectionSchema, type SectionInput } from "@/lib/onboarding/schemas";

export interface SectionRecord {
  id: string;
  branch_id: string;
  name: string;
  type: "hall" | "bar" | "room" | "private_room" | "cabin" | "conference_hall" | "outdoor";
  floor?: string | null;
  table_count: number;
  unit_label?: string | null;
  short_code?: string | null;
  queue_url?: string | null;
  active: boolean;
  notes?: string | null;
}

interface StepSectionProps {
  branchId: string;
  initialSections: SectionRecord[];
  onAddSection: (data: SectionInput) => Promise<{ success: boolean; section?: any; error?: string }>;
  onUpdateSection: (id: string, data: SectionInput) => Promise<{ success: boolean; section?: any; error?: string }>;
  onDeleteSection: (id: string) => Promise<{ success: boolean; error?: string }>;
  onProceedToEmployees?: () => void;
  onBackToShifts?: () => void;
  isSettingsMode?: boolean;
}

export const SECTION_TYPES = [
  { value: "hall", label: "Dining Hall", icon: LayoutGrid, desc: "Main floor seating with multiple tables" },
  { value: "bar", label: "Bar / Lounge", icon: Wine, desc: "Bar stools, high-tops & cocktail tables" },
  { value: "room", label: "Room (Hotel)", icon: BedDouble, desc: "Hotel rooms & suites (in-room QR ordering, no walk-in queue)" },
  { value: "private_room", label: "Private Dining Room", icon: DoorClosed, desc: "Exclusive VIP or family dining areas" },
  { value: "cabin", label: "Cabin / Booth", icon: Home, desc: "Intimate private booths & partitioned cabins" },
  { value: "conference_hall", label: "Conference / Banquet Hall", icon: Presentation, desc: "Large event spaces & banquet halls" },
  { value: "outdoor", label: "Outdoor / Rooftop / Garden", icon: Trees, desc: "Open-air patio, garden or terrace seating" },
];

function getSectionTypeMeta(typeStr: string) {
  return SECTION_TYPES.find((s) => s.value === typeStr) || SECTION_TYPES[0];
}

export default function StepSection({
  branchId,
  initialSections,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onProceedToEmployees,
  onBackToShifts,
  isSettingsMode = false,
}: StepSectionProps) {
  const [sections, setSections] = useState<SectionRecord[]>(initialSections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState<SectionInput>({
    name: "",
    type: "hall",
    floor: "",
    unit_label: "Table",
    table_count: 10,
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [gatingMessage, setGatingMessage] = useState<string | null>(null);

  // Downscale Confirmation Modal state
  const [downscaleWarning, setDownscaleWarning] = useState<{
    show: boolean;
    pendingData: SectionInput | null;
    deactivatedRange: string;
  }>({
    show: false,
    pendingData: null,
    deactivatedRange: "",
  });

  // Sync state if prop changes
  React.useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const activeSectionCount = sections.filter((s) => s.active).length;
  const totalUnits = sections
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (s.table_count || 0), 0);

  const openAddModal = () => {
    setEditingSection(null);
    setFormData({
      name: "",
      type: "hall",
      floor: "",
      unit_label: "Table",
      table_count: 10,
      notes: "",
    });
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sec: SectionRecord) => {
    setEditingSection(sec);
    setFormData({
      name: sec.name,
      type: sec.type,
      floor: sec.floor || "",
      unit_label: sec.unit_label || (sec.type === "room" ? "Room" : "Table"),
      table_count: sec.table_count,
      notes: sec.notes || "",
    });
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setFormErrors({});
    setActionError(null);
  };

  // When section type changes, dynamically default unit_label if untouched
  const handleTypeChange = (newType: any) => {
    const isRoom = newType === "room";
    setFormData((prev) => ({
      ...prev,
      type: newType,
      unit_label: isRoom
        ? prev.unit_label === "Table" ? "Room" : prev.unit_label
        : prev.unit_label === "Room" ? "Table" : prev.unit_label,
    }));
  };

  // Form submission with Downscale Check
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const parseResult = SectionSchema.safeParse(formData);
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

    // Check for downscaling if editing an existing section
    if (editingSection && formData.table_count < editingSection.table_count) {
      const label = editingSection.unit_label || (editingSection.type === "room" ? "Room" : "Table");
      const startDeact = formData.table_count + 1;
      const endDeact = editingSection.table_count;
      const rangeText = startDeact === endDeact
        ? `${label} ${startDeact}`
        : `${label} ${startDeact} through ${label} ${endDeact}`;

      setDownscaleWarning({
        show: true,
        pendingData: formData,
        deactivatedRange: rangeText,
      });
      return;
    }

    await commitSave(formData);
  };

  const commitSave = async (dataToSave: SectionInput) => {
    setIsSubmitting(true);
    try {
      if (editingSection) {
        const res = await onUpdateSection(editingSection.id, dataToSave);
        setIsSubmitting(false);
        if (!res.success) {
          setActionError(res.error || "Failed to update section.");
          return;
        }

        setSections((prev) =>
          prev.map((s) => (s.id === editingSection.id ? { ...s, ...dataToSave } : s))
        );
        closeModal();
      } else {
        const res = await onAddSection(dataToSave);
        setIsSubmitting(false);
        if (!res.success) {
          setActionError(res.error || "Failed to create section.");
          return;
        }

        const newSec = res.section;
        if (newSec) {
          setSections((prev) => [...prev, newSec]);
        }
        closeModal();
      }
      setGatingMessage(null);
    } catch (err: any) {
      setIsSubmitting(false);
      setActionError(err?.message || "An unexpected error occurred.");
    }
  };

  const handleConfirmDownscale = async () => {
    if (downscaleWarning.pendingData) {
      setDownscaleWarning({ show: false, pendingData: null, deactivatedRange: "" });
      await commitSave(downscaleWarning.pendingData);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove section "${name}" and deactivate all its units?`)) {
      return;
    }

    try {
      const res = await onDeleteSection(id);
      if (res.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(res.error || "Unable to delete section.");
      }
    } catch (err: any) {
      alert(err?.message || "Network error deleting section.");
    }
  };

  // Forward gating check
  const handleProceed = () => {
    if (activeSectionCount === 0) {
      setGatingMessage(
        "Please add at least 1 section (with at least 1 table or room) to proceed to Employee setup. Tables are required to generate ordering endpoints."
      );
      return;
    }
    setGatingMessage(null);
    onProceedToEmployees?.();
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* Step Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary font-bold">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                {isSettingsMode ? "Sections & Tables Layout" : "Step 4: Sections & Tables Layout"}
              </h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Define the physical floor zones, dining areas, or hotel wings. Deterministic QR ordering URLs and walk-in queue links are generated automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-muted px-3 py-1 text-xs font-bold text-brand-secondary border border-brand-border">
            <span>{sections.length} Sections ({totalUnits} Units)</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Section</span>
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

      {/* Sections List / Grid */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brand-border p-12 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary mb-4">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-brand-secondary">
            No Dining Sections or Wings Configured Yet
          </h3>
          <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto leading-relaxed">
            Every branch requires at least 1 section (e.g. "Main Dining Hall" or "Rooftop Lounge") with tables or rooms so customers can scan and order.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Section</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {sections.map((sec) => {
            const typeMeta = getSectionTypeMeta(sec.type);
            const Icon = typeMeta.icon;
            const unitLabel = sec.unit_label || (sec.type === "room" ? "Room" : "Table");
            const isRoom = sec.type === "room";

            return (
              <div
                key={sec.id}
                className={`group rounded-2xl border p-5 transition-all relative ${
                  sec.active
                    ? "bg-white border-brand-border hover:border-brand-primary/40 hover:shadow-brandCard"
                    : "bg-brand-surface-muted/60 border-brand-border/60 opacity-60"
                }`}
              >
                {/* Section Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-brand-secondary truncate">
                        {sec.name}
                      </h4>
                      <p className="text-[11px] text-brand-text-muted flex items-center gap-1.5">
                        <span>{typeMeta.label}</span>
                        {sec.floor && (
                          <>
                            <span>•</span>
                            <span className="truncate">{sec.floor}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(sec)}
                      title="Edit Section"
                      className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-primary transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sec.id, sec.name)}
                      title="Delete Section"
                      className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Units & QR Range Display */}
                <div className="my-3 rounded-xl bg-brand-surface-muted/60 p-3 border border-brand-border/60">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-1">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-brand-primary" />
                      <span>{sec.table_count} {unitLabel}s</span>
                    </span>
                    <span className="font-mono text-[11px] text-brand-primary font-semibold">
                      {unitLabel} 1 to {sec.table_count}
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-text-muted flex items-center gap-1">
                    <QrCode className="h-3 w-3 text-brand-text-muted" />
                    <span>Deterministic QR target URLs active</span>
                  </p>
                </div>

                {/* Queue Status & Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                  {isRoom ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 font-medium border border-slate-200">
                      <span>Hotel Room — Queue Disabled</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5 font-semibold border border-emerald-200">
                      <Users2 className="h-3 w-3 text-emerald-600" />
                      <span>Walk-in Queue Active</span>
                    </span>
                  )}
                  {sec.short_code && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-light text-brand-primary px-2 py-0.5 font-mono font-bold text-[10px]">
                      {sec.short_code}
                    </span>
                  )}
                </div>

                {/* Footer Notes */}
                {sec.notes && (
                  <p className="pt-2 border-t border-brand-border/50 text-[10px] text-brand-text-muted truncate">
                    Notes: {sec.notes}
                  </p>
                )}
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
            onClick={onBackToShifts}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface-muted px-6 py-3 text-sm font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shift Management</span>
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <span>Save & Continue to Staff Setup</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-brandModal border border-brand-border max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-secondary">
                    {editingSection ? "Edit Section Layout" : "Add New Dining Section"}
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Configure physical zone name, floor, and table/room capacity
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

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Section Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Dining Hall, Rooftop Terrace, Deluxe Wing"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                      : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Section Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Floor Level (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.floor || ""}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g. Ground Floor, 2nd Floor"
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Unit Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit_label}
                    onChange={(e) => setFormData({ ...formData, unit_label: e.target.value })}
                    placeholder="e.g. Table, Room, Booth, Cabin"
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      formErrors.unit_label
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                        : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                    }`}
                  />
                  <p className="mt-1 text-[10px] text-brand-text-muted">
                    Seen by diners & staff (e.g. "{formData.unit_label} 1")
                  </p>
                  {formErrors.unit_label && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.unit_label}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Number of {formData.unit_label || "Unit"}s <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={formData.table_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        table_count: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      formErrors.table_count
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                        : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                    }`}
                  />
                  <p className="mt-1 text-[10px] text-brand-text-muted">
                    Generates 1 to {formData.table_count || 1}
                  </p>
                  {formErrors.table_count && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.table_count}</p>
                  )}
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
                  placeholder="e.g. Near the main entrance; high customer footfall."
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              {/* Informative Target URL Notice */}
              <div className="rounded-xl border border-brand-border bg-brand-surface-muted/60 p-3 text-xs text-brand-text-secondary">
                <div className="flex items-center gap-1.5 font-bold text-brand-secondary mb-1">
                  <QrCode className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Deterministic QR URL preview:</span>
                </div>
                <p className="font-mono text-[11px] text-brand-primary">
                  /o/&#123;branch&#125;/&#123;section&#125;/1 through /o/&#123;branch&#125;/&#123;section&#125;/{formData.table_count}
                </p>
                {formData.type !== "room" && (
                  <p className="font-mono text-[11px] text-emerald-700 mt-1">
                    Queue: /q/&#123;branch&#125;/&#123;section&#125;
                  </p>
                )}
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
                  <span>{editingSection ? "Save Changes" : "Save Section"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Downscale Confirmation Dialog */}
      {downscaleWarning.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-brandModal border border-amber-300">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-secondary">
                  Confirm Table Deactivation
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                  You are reducing the unit count for this section.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 mb-5 leading-relaxed">
              <p className="font-bold mb-1">Warning:</p>
              <p>
                This will deactivate <strong>{downscaleWarning.deactivatedRange}</strong> — their QR codes will stop working immediately for customers and staff.
              </p>
              <p className="mt-2 text-[11px] text-amber-800">
                Existing order history and table rows are safely preserved in inactive status.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDownscaleWarning({ show: false, pendingData: null, deactivatedRange: "" })
                }
                className="rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text-secondary hover:bg-brand-surface-muted"
              >
                Keep Existing Count
              </button>

              <button
                type="button"
                onClick={handleConfirmDownscale}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                <span>Confirm & Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
