"use client";

import React, { useState } from "react";
import { 
  ChefHat, 
  Wine, 
  Cookie, 
  IceCream, 
  Coffee, 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Printer, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  X,
  Loader2,
  Gauge
} from "lucide-react";
import { branding } from "@/config/branding";
import { KitchenSchema, type KitchenInput } from "@/lib/onboarding/schemas";

interface KitchenStation {
  id: string;
  branch_id: string;
  name: string;
  type: "kitchen" | "bar" | "bakery" | "dessert_station" | "beverage_station" | "other";
  printer_station_id?: string | null;
  priority: number;
  capacity?: number | null;
  default_kitchen: boolean;
  active: boolean;
  notes?: string | null;
}

interface StepKitchenProps {
  branchId: string;
  initialKitchens: KitchenStation[];
  onAddKitchen: (data: KitchenInput) => Promise<{ success: boolean; kitchen?: any; error?: string }>;
  onUpdateKitchen: (id: string, data: KitchenInput) => Promise<{ success: boolean; kitchen?: any; error?: string }>;
  onDeleteKitchen: (id: string) => Promise<{ success: boolean; error?: string }>;
  onProceedToShifts?: () => void;
  onBackToBranch?: () => void;
  isSettingsMode?: boolean;
}

const KITCHEN_TYPES = [
  { value: "kitchen", label: "Main Kitchen", icon: ChefHat, desc: "Hot food, tandoor & entrees" },
  { value: "bar", label: "Bar / Lounge", icon: Wine, desc: "Cocktails, liquor & beers" },
  { value: "bakery", label: "Bakery / Oven", icon: Cookie, desc: "Breads, pastries & pizzas" },
  { value: "dessert_station", label: "Dessert Station", icon: IceCream, desc: "Sweets, ice creams & platters" },
  { value: "beverage_station", label: "Beverage Station", icon: Coffee, desc: "Coffee, tea, fresh juices & mocktails" },
  { value: "other", label: "Other Prep Area", icon: Layers, desc: "Custom prep station or live grill" },
];

function getKitchenTypeMeta(typeStr: string) {
  return KITCHEN_TYPES.find((k) => k.value === typeStr) || KITCHEN_TYPES[0];
}

export default function StepKitchen({
  branchId,
  initialKitchens,
  onAddKitchen,
  onUpdateKitchen,
  onDeleteKitchen,
  onProceedToShifts,
  onBackToBranch,
  isSettingsMode = false,
}: StepKitchenProps) {
  const [kitchens, setKitchens] = useState<KitchenStation[]>(initialKitchens);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<KitchenStation | null>(null);

  // Form state
  const [formData, setFormData] = useState<KitchenInput>({
    name: "",
    type: "kitchen",
    printer_station_id: "",
    priority: 0,
    capacity: 50,
    default_kitchen: false,
    active: true,
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [gatingMessage, setGatingMessage] = useState<string | null>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setKitchens(initialKitchens);
  }, [initialKitchens]);

  const activeKitchenCount = kitchens.filter((k) => k.active).length;

  const openAddModal = () => {
    setEditingKitchen(null);
    setFormData({
      name: "",
      type: "kitchen",
      printer_station_id: "",
      priority: kitchens.length,
      capacity: 50,
      default_kitchen: kitchens.length === 0, // Make first kitchen default
      active: true,
      notes: "",
    });
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (station: KitchenStation) => {
    setEditingKitchen(station);
    setFormData({
      name: station.name,
      type: station.type,
      printer_station_id: station.printer_station_id || "",
      priority: station.priority ?? 0,
      capacity: station.capacity ?? 50,
      default_kitchen: station.default_kitchen,
      active: station.active,
      notes: station.notes || "",
    });
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKitchen(null);
    setFormErrors({});
    setActionError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const parseResult = KitchenSchema.safeParse(formData);
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
      if (editingKitchen) {
        // Edit station
        const res = await onUpdateKitchen(editingKitchen.id, formData);
        setIsSubmitting(false);
        if (!res.success) {
          setActionError(res.error || "Failed to update kitchen station.");
          return;
        }

        // Optimistically update list
        setKitchens((prev) =>
          prev.map((k) => {
            if (k.id === editingKitchen.id) {
              return { ...k, ...formData };
            }
            // If this one is set to default, others become non-default
            if (formData.default_kitchen) {
              return { ...k, default_kitchen: false };
            }
            return k;
          })
        );
        closeModal();
      } else {
        // Create station
        const res = await onAddKitchen(formData);
        setIsSubmitting(false);
        if (!res.success) {
          setActionError(res.error || "Failed to create kitchen station.");
          return;
        }

        const newStation = res.kitchen;
        if (newStation) {
          setKitchens((prev) => {
            let updated = prev;
            if (formData.default_kitchen) {
              updated = prev.map((k) => ({ ...k, default_kitchen: false }));
            }
            return [...updated, newStation];
          });
        }
        closeModal();
      }
      // Clear gating message if any
      setGatingMessage(null);
    } catch (err: any) {
      setIsSubmitting(false);
      setActionError(err?.message || "Unexpected error occurred.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove kitchen station "${name}"?`)) {
      return;
    }

    try {
      const res = await onDeleteKitchen(id);
      if (res.success) {
        setKitchens((prev) => prev.filter((k) => k.id !== id));
      } else {
        alert(res.error || "Unable to delete kitchen.");
      }
    } catch (err: any) {
      alert(err?.message || "Network error while deleting kitchen.");
    }
  };

  // Forward gating check
  const handleProceed = () => {
    if (activeKitchenCount === 0) {
      setGatingMessage(
        "Please add at least 1 active kitchen station to proceed to Shift Management. Orders and KDS displays require at least one target station."
      );
      return;
    }
    setGatingMessage(null);
    onProceedToShifts?.();
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* Step Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary font-bold">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                {isSettingsMode ? "Kitchen & Bar Stations" : "Step 2: Kitchen & Bar Stations"}
              </h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Define the food prep stations, bars, bakery lines, and thermal printers for automated order ticket routing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-muted px-3 py-1 text-xs font-bold text-brand-secondary border border-brand-border">
            <span>{kitchens.length} Stations Configured</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Station</span>
          </button>
        </div>
      </div>

      {/* Forward Gating Warning */}
      {gatingMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl p-4 border border-rose-200 bg-rose-50 text-rose-900 text-xs sm:text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{gatingMessage}</span>
        </div>
      )}

      {/* Stations List / Grid */}
      {kitchens.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brand-border p-12 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary mb-4">
            <ChefHat className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-brand-secondary">
            No Kitchen Stations Configured Yet
          </h3>
          <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto leading-relaxed">
            Every branch requires at least 1 active prep station (e.g. "Main Kitchen" or "Cocktail Bar") so food and drink items can route to the correct staff.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Kitchen Station</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {kitchens.map((station) => {
            const typeMeta = getKitchenTypeMeta(station.type);
            const Icon = typeMeta.icon;

            return (
              <div
                key={station.id}
                className={`group rounded-2xl border p-5 transition-all relative ${
                  station.active
                    ? "bg-white border-brand-border hover:border-brand-primary/40 hover:shadow-brandCard"
                    : "bg-brand-surface-muted/60 border-brand-border/60 opacity-60"
                }`}
              >
                {/* Station Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-brand-secondary truncate">
                        {station.name}
                      </h4>
                      <p className="text-[11px] text-brand-text-muted">
                        {typeMeta.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(station)}
                      title="Edit Station"
                      className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-primary transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(station.id, station.name)}
                      title="Delete Station"
                      className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-1.5 my-3 text-[11px]">
                  {station.default_kitchen && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 font-bold border border-amber-300">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Default Station
                    </span>
                  )}
                  {station.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 font-semibold border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 font-medium">
                      Inactive
                    </span>
                  )}
                  {station.printer_station_id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface-muted text-brand-text-secondary px-2 py-0.5 font-mono">
                      <Printer className="h-3 w-3 text-brand-text-muted" />
                      {station.printer_station_id}
                    </span>
                  )}
                </div>

                {/* Capacity & Notes */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-brand-text-muted" />
                    Capacity: <strong>{station.capacity || 50} orders/hr</strong>
                  </span>
                  <span className="font-mono text-brand-text-muted">
                    P{station.priority}
                  </span>
                </div>

                {station.notes && (
                  <p className="mt-2 text-[10px] text-brand-text-muted truncate">
                    Notes: {station.notes}
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
            onClick={onBackToBranch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface-muted px-6 py-3 text-sm font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Branch Setup</span>
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
          >
            <span>Save & Continue to Shifts</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Kitchen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-brandModal border border-brand-border max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-secondary">
                    {editingKitchen ? "Edit Kitchen Station" : "Add New Station"}
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Configure KDS display routing and printing settings
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
                  Station Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Kitchen, Tandoor Counter, Cocktail Bar"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                      : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Station Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  {KITCHEN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Printer Station ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.printer_station_id || ""}
                    onChange={(e) => setFormData({ ...formData, printer_station_id: e.target.value })}
                    placeholder="e.g. PRN-01"
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm font-mono focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Hourly Capacity (Orders)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={formData.capacity ?? 50}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 50 })}
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

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
                  <p className="mt-1 text-[10px] text-brand-text-muted">Lower numbers appear first</p>
                </div>

                <div className="flex flex-col justify-end space-y-2 pb-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-brand-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.default_kitchen}
                      onChange={(e) => setFormData({ ...formData, default_kitchen: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary focus:ring-brand-primary h-4 w-4"
                    />
                    <span>Default Station for Branch</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-brand-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary focus:ring-brand-primary h-4 w-4"
                    />
                    <span>Active Station</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1">
                  Notes / Operational Guidance (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Handles all tandoori starters and breads."
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
                  <span>{editingKitchen ? "Update Station" : "Create Station"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
