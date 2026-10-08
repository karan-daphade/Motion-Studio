"use client";

import React, { useState } from "react";
import StepBranch from "@/components/onboarding/step-branch";
import { saveBranchSetup } from "@/app/actions/onboarding-actions";
import { Building2, CheckCircle2 } from "lucide-react";
import type { BranchSetupInput } from "@/lib/onboarding/schemas";

interface BranchSettingsClientProps {
  initialBranch: any;
  branches: Array<{ id: string; name: string }>;
}

export default function BranchSettingsClient({
  initialBranch,
  branches,
}: BranchSettingsClientProps) {
  const [branch, setBranch] = useState(initialBranch);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveAction = async (data: BranchSetupInput) => {
    const res = await saveBranchSetup(branch.id, data);
    if (res.success && res.branch) {
      setBranch(res.branch);
      setSaveMessage("Branch details updated successfully.");
      setTimeout(() => setSaveMessage(null), 4000);
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Branch Profile & Legal Settings
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branch.name}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Configure legal trading name, GSTIN, FSSAI licenses, contact numbers, and physical location.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branch.id}
              onChange={(e) => {
                window.location.href = `/admin/settings/branch?branchId=${e.target.value}`;
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

      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Embedded StepBranch in settings mode */}
      <StepBranch
        initialBranch={branch}
        onSaveSuccess={(saved) => {
          setBranch(saved);
          setSaveMessage("Branch profile updated.");
        }}
        onSaveAction={handleSaveAction}
        isSettingsMode={true}
      />
    </div>
  );
}
