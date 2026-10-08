"use client";

import React, { useState } from "react";
import StepShift from "@/components/onboarding/step-shift";
import { createShift, updateShift, deleteShift } from "@/app/actions/onboarding-actions";
import type { ShiftInput } from "@/lib/onboarding/schemas";

interface ShiftsClientProps {
  branchId: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  initialShifts: any[];
}

export default function ShiftsClient({
  branchId,
  branchName,
  branches,
  initialShifts,
}: ShiftsClientProps) {
  const [shifts, setShifts] = useState(initialShifts);

  const handleAddShift = async (data: ShiftInput) => {
    const res = await createShift(branchId, data);
    if (res.success && res.shift) {
      setShifts((prev) => {
        let updated = prev;
        if (data.default_shift) {
          updated = prev.map((s) => ({ ...s, default_shift: false }));
        }
        return [...updated, res.shift];
      });
    }
    return res;
  };

  const handleUpdateShift = async (id: string, data: ShiftInput) => {
    const res = await updateShift(id, data);
    if (res.success && res.shift) {
      setShifts((prev) =>
        prev.map((s) => {
          if (s.id === id) return res.shift;
          if (data.default_shift) return { ...s, default_shift: false };
          return s;
        })
      );
    }
    return res;
  };

  const handleDeleteShift = async (id: string) => {
    const res = await deleteShift(id);
    if (res.success) {
      setShifts((prev) => prev.filter((s) => s.id !== id));
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Operating Shifts & Hours
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branchName}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Configure shift slots, overnight schedules, and default opening/closing operational boundaries.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branchId}
              onChange={(e) => {
                window.location.href = `/admin/settings/shifts?branchId=${e.target.value}`;
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

      <StepShift
        branchId={branchId}
        initialShifts={shifts}
        onAddShift={handleAddShift}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={handleDeleteShift}
        isSettingsMode={true}
      />
    </div>
  );
}
