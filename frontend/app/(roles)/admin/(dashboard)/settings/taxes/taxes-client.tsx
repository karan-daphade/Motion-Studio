"use client";

import React, { useState } from "react";
import StepTax from "@/components/onboarding/step-tax";
import { 
  createTaxRule, 
  updateTaxRule, 
  toggleTaxRuleStatus, 
  deleteTaxRule,
  createPromoCode,
  updatePromoCode,
  togglePromoCodeStatus,
  deletePromoCode,
  saveBranchChargeSettings,
  updatePriceDisplayMode
} from "@/app/actions/onboarding-actions";
import type { 
  TaxRuleInput, 
  PromoCodeInput, 
  BranchChargeSettingsInput,
  PriceDisplayMode 
} from "@/lib/onboarding/schemas";

interface TaxesClientProps {
  branchId: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  initialTaxRules: any[];
  initialPromoCodes: any[];
  initialChargeSettings: any;
  categories: Array<{ id: string; name: string }>;
  priceDisplayMode?: PriceDisplayMode;
}

export default function TaxesClient({
  branchId,
  branchName,
  branches,
  initialTaxRules,
  initialPromoCodes,
  initialChargeSettings,
  categories,
  priceDisplayMode = "exclusive",
}: TaxesClientProps) {
  const [taxRules, setTaxRules] = useState(initialTaxRules);
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes);

  // Tax Rule Handlers
  const handleAddTaxRule = async (data: TaxRuleInput) => {
    const res = await createTaxRule(branchId, data);
    if (res.success && res.taxRule) {
      setTaxRules((prev) => [...prev, res.taxRule]);
    }
    return res;
  };

  const handleUpdateTaxRule = async (id: string, data: Partial<TaxRuleInput>) => {
    const res = await updateTaxRule(id, data);
    if (res.success && res.taxRule) {
      setTaxRules((prev) => prev.map((t) => (t.id === id ? res.taxRule : t)));
    }
    return res;
  };

  const handleToggleTaxRuleStatus = async (id: string, active: boolean) => {
    const res = await toggleTaxRuleStatus(id, active);
    if (res.success) {
      setTaxRules((prev) => prev.map((t) => (t.id === id ? { ...t, active } : t)));
    }
    return res;
  };

  const handleDeleteTaxRule = async (id: string) => {
    const res = await deleteTaxRule(id);
    if (res.success) {
      setTaxRules((prev) => prev.filter((t) => t.id !== id));
    }
    return res;
  };

  // Promo Code Handlers
  const handleAddPromoCode = async (data: PromoCodeInput) => {
    const res = await createPromoCode(branchId, data);
    if (res.success && res.promoCode) {
      setPromoCodes((prev) => [...prev, res.promoCode]);
    }
    return res;
  };

  const handleUpdatePromoCode = async (id: string, data: Partial<PromoCodeInput>) => {
    const res = await updatePromoCode(id, data);
    if (res.success && res.promoCode) {
      setPromoCodes((prev) => prev.map((p) => (p.id === id ? res.promoCode : p)));
    }
    return res;
  };

  const handleTogglePromoCodeStatus = async (id: string, active: boolean) => {
    const res = await togglePromoCodeStatus(id, active);
    if (res.success) {
      setPromoCodes((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    }
    return res;
  };

  const handleDeletePromoCode = async (id: string) => {
    const res = await deletePromoCode(id);
    if (res.success) {
      setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    }
    return res;
  };

  const handleSaveChargeSettings = async (data: BranchChargeSettingsInput) => {
    return await saveBranchChargeSettings(branchId, data);
  };

  const handleUpdatePriceDisplayMode = async (mode: PriceDisplayMode) => {
    return await updatePriceDisplayMode(branchId, mode);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Taxes, Charges & Discount Rules
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branchName}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Configure GST compliance rates (CGST, SGST), service charges, packaging fees, and promotional coupons.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branchId}
              onChange={(e) => {
                window.location.href = `/admin/settings/taxes?branchId=${e.target.value}`;
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

      <StepTax
        branchId={branchId}
        initialPriceDisplayMode={priceDisplayMode}
        initialTaxRules={taxRules}
        initialPromoCodes={promoCodes}
        initialChargeSettings={initialChargeSettings}
        categories={categories}
        onUpdatePriceDisplayMode={handleUpdatePriceDisplayMode}
        onAddTaxRule={handleAddTaxRule}
        onUpdateTaxRule={handleUpdateTaxRule}
        onToggleTaxRuleStatus={handleToggleTaxRuleStatus}
        onDeleteTaxRule={handleDeleteTaxRule}
        onAddPromoCode={handleAddPromoCode}
        onUpdatePromoCode={handleUpdatePromoCode}
        onTogglePromoCodeStatus={handleTogglePromoCodeStatus}
        onDeletePromoCode={handleDeletePromoCode}
        onSaveChargeSettings={handleSaveChargeSettings}
        isSettingsMode={true}
      />
    </div>
  );
}
