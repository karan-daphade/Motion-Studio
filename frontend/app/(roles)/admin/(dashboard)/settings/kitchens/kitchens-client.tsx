"use client";

import React, { useState } from "react";
import StepKitchen from "@/components/onboarding/step-kitchen";
import { createKitchen, updateKitchen, deleteKitchen } from "@/app/actions/onboarding-actions";
import type { KitchenInput } from "@/lib/onboarding/schemas";

interface KitchensClientProps {
  branchId: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  initialKitchens: any[];
}

export default function KitchensClient({
  branchId,
  branchName,
  branches,
  initialKitchens,
}: KitchensClientProps) {
  const [kitchens, setKitchens] = useState(initialKitchens);

  const handleAddKitchen = async (data: KitchenInput) => {
    const res = await createKitchen(branchId, data);
    if (res.success && res.kitchen) {
      setKitchens((prev) => {
        let updated = prev;
        if (data.default_kitchen) {
          updated = prev.map((k) => ({ ...k, default_kitchen: false }));
        }
        return [...updated, res.kitchen];
      });
    }
    return res;
  };

  const handleUpdateKitchen = async (id: string, data: KitchenInput) => {
    const res = await updateKitchen(id, data);
    if (res.success && res.kitchen) {
      setKitchens((prev) =>
        prev.map((k) => {
          if (k.id === id) return res.kitchen;
          if (data.default_kitchen) return { ...k, default_kitchen: false };
          return k;
        })
      );
    }
    return res;
  };

  const handleDeleteKitchen = async (id: string) => {
    const res = await deleteKitchen(id);
    if (res.success) {
      setKitchens((prev) => prev.filter((k) => k.id !== id));
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Kitchens & Bar Stations
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branchName}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Configure food preparation stations, bar counters, dessert stations, and default KDS routing.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branchId}
              onChange={(e) => {
                window.location.href = `/admin/settings/kitchens?branchId=${e.target.value}`;
              }}
              className="rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-brand-secondary outline-none focus:border-brand-primary"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <StepKitchen
        branchId={branchId}
        initialKitchens={kitchens}
        onAddKitchen={handleAddKitchen}
        onUpdateKitchen={handleUpdateKitchen}
        onDeleteKitchen={handleDeleteKitchen}
        isSettingsMode={true}
      />
    </div>
  );
}
