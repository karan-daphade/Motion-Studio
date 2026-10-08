"use client";

import React, { useState } from "react";
import StepSection from "@/components/onboarding/step-section";
import { createSection, updateSection, deleteSection } from "@/app/actions/onboarding-actions";
import type { SectionInput } from "@/lib/onboarding/schemas";

interface SectionsClientProps {
  branchId: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  initialSections: any[];
}

export default function SectionsClient({
  branchId,
  branchName,
  branches,
  initialSections,
}: SectionsClientProps) {
  const [sections, setSections] = useState(initialSections);

  const handleAddSection = async (data: SectionInput) => {
    const res = await createSection(branchId, data);
    if (res.success && res.section) {
      setSections((prev) => [...prev, res.section]);
    }
    return res;
  };

  const handleUpdateSection = async (id: string, data: SectionInput) => {
    const res = await updateSection(id, data);
    if (res.success && res.section) {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.section } : s))
      );
    }
    return res;
  };

  const handleDeleteSection = async (id: string) => {
    const res = await deleteSection(id);
    if (res.success) {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Dining Sections & Tables
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branchName}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Configure dining halls, outdoor patio, AC rooms, table counts, and guest capacities.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branchId}
              onChange={(e) => {
                window.location.href = `/admin/settings/sections?branchId=${e.target.value}`;
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

      <StepSection
        branchId={branchId}
        initialSections={sections}
        onAddSection={handleAddSection}
        onUpdateSection={handleUpdateSection}
        onDeleteSection={handleDeleteSection}
        isSettingsMode={true}
      />
    </div>
  );
}
