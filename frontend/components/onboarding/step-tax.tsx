"use client";

import React, { useState, useMemo } from "react";
import { 
  Receipt, 
  Tag, 
  Percent, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Loader2, 
  Layers, 
  Search, 
  ShieldCheck, 
  Check, 
  Calendar, 
  ShoppingBag, 
  Sparkles,
  Info,
  DollarSign
} from "lucide-react";
import { branding } from "@/config/branding";
import SelectionButtons, { 
  MultiSelectionButtons, 
  type SelectionOption 
} from "@/components/ui/selection-buttons";
import { 
  TaxRuleInputSchema, 
  PromoCodeInputSchema, 
  BranchChargeSettingsInputSchema,
  type TaxRuleInput, 
  type PromoCodeInput, 
  type BranchChargeSettingsInput,
  type PriceDisplayMode,
  type GstClassification,
  type TaxRuleType,
  type TaxCalculationType,
  type OrderChannel,
  type PromoDiscountType,
  type RevenueClassification
} from "@/lib/onboarding/schemas";

export interface TaxRuleRecord {
  id: string;
  branch_id: string;
  name: string;
  type?: string;
  gst_classification: GstClassification;
  calculation_type: TaxCalculationType;
  tax_type: TaxRuleType;
  rate: number;
  applies_to: string[]; // Category IDs or ["all"]
  order_channels: OrderChannel[];
  revenue_classification?: RevenueClassification;
  is_discretionary?: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromoCodeRecord {
  id: string;
  branch_id: string;
  title: string;
  code: string;
  discount_type: PromoDiscountType;
  discount_value: number;
  max_discount_cap?: number | null;
  min_bill_amount?: number | null;
  applicable_order_types: OrderChannel[];
  start_date?: string | null;
  end_date?: string | null;
  no_expiry: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchChargeSettingsRecord {
  id?: string;
  branch_id: string;
  service_charge_enabled: boolean;
  service_charge_type: TaxCalculationType;
  service_charge_rate: number;
  service_charge_bill_note: string;
  packaging_charge_enabled: boolean;
  packaging_charge_type: "order" | "item";
  packaging_charge_order_amount: number;
}

interface StepTaxProps {
  branchId: string;
  initialPriceDisplayMode?: PriceDisplayMode;
  initialTaxRules: TaxRuleRecord[];
  initialPromoCodes: PromoCodeRecord[];
  initialChargeSettings?: BranchChargeSettingsRecord | null;
  categories: Array<{ id: string; name: string }>;
  onUpdatePriceDisplayMode?: (mode: PriceDisplayMode) => Promise<{ success: boolean; error?: string }>;
  onAddTaxRule: (data: TaxRuleInput) => Promise<{ success: boolean; taxRule?: any; error?: string }>;
  onUpdateTaxRule: (id: string, data: Partial<TaxRuleInput>) => Promise<{ success: boolean; taxRule?: any; error?: string }>;
  onToggleTaxRuleStatus: (id: string, active: boolean) => Promise<{ success: boolean; taxRule?: any; error?: string }>;
  onDeleteTaxRule: (id: string) => Promise<{ success: boolean; error?: string }>;
  onAddPromoCode: (data: PromoCodeInput) => Promise<{ success: boolean; promoCode?: any; error?: string }>;
  onUpdatePromoCode: (id: string, data: Partial<PromoCodeInput>) => Promise<{ success: boolean; promoCode?: any; error?: string }>;
  onTogglePromoCodeStatus: (id: string, active: boolean) => Promise<{ success: boolean; promoCode?: any; error?: string }>;
  onDeletePromoCode: (id: string) => Promise<{ success: boolean; error?: string }>;
  onSaveChargeSettings?: (data: BranchChargeSettingsInput) => Promise<{ success: boolean; chargeSettings?: any; error?: string }>;
  onCompleteOnboarding?: () => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  onBackToMenu?: () => void;
  isSettingsMode?: boolean;
}

export default function StepTax({
  branchId,
  initialPriceDisplayMode = "exclusive",
  initialTaxRules = [],
  initialPromoCodes = [],
  initialChargeSettings,
  categories = [],
  onUpdatePriceDisplayMode,
  onAddTaxRule,
  onUpdateTaxRule,
  onToggleTaxRuleStatus,
  onDeleteTaxRule,
  onAddPromoCode,
  onUpdatePromoCode,
  onTogglePromoCodeStatus,
  onDeletePromoCode,
  onSaveChargeSettings,
  onCompleteOnboarding,
  onBackToMenu,
  isSettingsMode = false,
}: StepTaxProps) {
  // State: Tax Rules & Promo Codes
  const [taxRules, setTaxRules] = useState<TaxRuleRecord[]>(initialTaxRules);
  const [promoCodes, setPromoCodes] = useState<PromoCodeRecord[]>(initialPromoCodes);

  // Table Search & Filter
  const [tableFilter, setTableFilter] = useState<"all" | "tax" | "other_charges" | "discount">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  // Global action error & notification
  const [actionError, setActionError] = useState<string | null>(null);
  const [gatingMessage, setGatingMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // ==========================================
  // MODAL 1: ADD / EDIT TAX RULE & OTHER CHARGES STATE
  // ==========================================
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingTaxRule, setEditingTaxRule] = useState<TaxRuleRecord | null>(null);
  const [taxRevenueClassification, setTaxRevenueClassification] = useState<RevenueClassification>("government_tax");
  const [taxIsDiscretionary, setTaxIsDiscretionary] = useState(false);
  const [taxClassification, setTaxClassification] = useState<GstClassification>("services");
  const [taxName, setTaxName] = useState("");
  const [taxType, setTaxType] = useState<TaxRuleType>("exclusive");
  const [taxCalcType, setTaxCalcType] = useState<TaxCalculationType>("percentage");
  const [taxValue, setTaxValue] = useState<string>("5");
  const [taxAppliesTo, setTaxAppliesTo] = useState<string[]>(["all"]);
  const [taxChannels, setTaxChannels] = useState<OrderChannel[]>([]);
  const [isTaxSubmitting, setIsTaxSubmitting] = useState(false);
  const [taxFormErrors, setTaxFormErrors] = useState<Record<string, string>>({});

  // ==========================================
  // MODAL 2: ADD / EDIT PROMO CODE STATE
  // ==========================================
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCodeRecord | null>(null);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscountType, setPromoDiscountType] = useState<PromoDiscountType>("percentage");
  const [promoDiscountValue, setPromoDiscountValue] = useState<string>("10");
  const [promoMaxCap, setPromoMaxCap] = useState<string>("");
  const [promoMinBill, setPromoMinBill] = useState<string>("");
  const [promoOrderTypes, setPromoOrderTypes] = useState<OrderChannel[]>([]);
  const [promoNoExpiry, setPromoNoExpiry] = useState(true);
  const [promoStartDate, setPromoStartDate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");
  const [isPromoSubmitting, setIsPromoSubmitting] = useState(false);
  const [promoFormErrors, setPromoFormErrors] = useState<Record<string, string>>({});


  // ==========================================
  // DELETE CONFIRMATION STATE
  // ==========================================
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "tax" | "promo";
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived unified table items
  interface UnifiedRow {
    id: string;
    kind: "tax" | "other_charges" | "discount";
    name: string;
    subCode?: string;
    details: string;
    appliesToSummary: string;
    channelsSummary: string;
    active: boolean;
    raw: TaxRuleRecord | PromoCodeRecord;
  }

  const unifiedRows: UnifiedRow[] = useMemo(() => {
    const rows: UnifiedRow[] = [];

    // Tax Rules & Other Charges
    taxRules.forEach((tr) => {
      const isOtherCharge = tr.revenue_classification === "outlet_revenue";
      const kind = isOtherCharge ? "other_charges" : "tax";

      let calcLabel = "Percentage";
      let rateDisplay = `${tr.rate}%`;
      if (tr.calculation_type === "fixed_per_item") {
        calcLabel = "Fixed (Per Item)";
        rateDisplay = `₹${tr.rate} / item`;
      } else if (tr.calculation_type === "one_time_per_bill") {
        calcLabel = "Full Bill / One-Time";
        rateDisplay = `₹${tr.rate} flat / bill`;
      }

      const modeText = tr.tax_type === "inclusive" ? "Inclusive" : "Exclusive";
      const discText = tr.is_discretionary ? " • Discretionary" : "";
      const details = `${rateDisplay} (${modeText}) — ${calcLabel}${discText}`;

      let appliesTo = "All Items";
      if (!tr.applies_to.includes("all")) {
        const matched = categories.filter((c) => tr.applies_to.includes(c.id)).map((c) => c.name);
        appliesTo = matched.length > 0 ? matched.join(", ") : `${tr.applies_to.length} Categories`;
      }

      const channelLabels = tr.order_channels.map((ch) => {
        if (ch === "dine_in") return "Dine-In";
        if (ch === "takeaway") return "Takeaway";
        return "Online";
      });

      rows.push({
        id: `tax_${tr.id}`,
        kind,
        name: tr.name,
        details,
        appliesToSummary: appliesTo,
        channelsSummary: channelLabels.length > 0 ? channelLabels.join(", ") : "No Channels Selected",
        active: tr.active,
        raw: tr,
      });
    });

    // Promo Codes
    promoCodes.forEach((pr) => {
      const isPercentage = pr.discount_type === "percentage";
      const capText = pr.max_discount_cap ? `, Max ₹${pr.max_discount_cap}` : "";
      const minText = pr.min_bill_amount ? `, Min ₹${pr.min_bill_amount}` : "";
      const expiryText = pr.no_expiry ? "No Expiry" : `Valid till ${pr.end_date || "N/A"}`;
      const details = `${pr.code} — ${pr.discount_value}${isPercentage ? "%" : "₹"} off${capText}${minText}, ${expiryText}`;

      const channelLabels = pr.applicable_order_types.map((ch) => {
        if (ch === "dine_in") return "Dine-In";
        if (ch === "takeaway") return "Takeaway";
        return "Online";
      });

      rows.push({
        id: `promo_${pr.id}`,
        kind: "discount",
        name: pr.title,
        subCode: pr.code,
        details,
        appliesToSummary: "Order Total",
        channelsSummary: channelLabels.length > 0 ? channelLabels.join(", ") : "No Channels Selected",
        active: pr.active,
        raw: pr,
      });
    });

    // Filter by single-select chip
    return rows.filter((r) => {
      if (tableFilter === "tax" && r.kind !== "tax") return false;
      if (tableFilter === "other_charges" && r.kind !== "other_charges") return false;
      if (tableFilter === "discount" && r.kind !== "discount") return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCode = (r.subCode || "").toLowerCase().includes(q);
        const matchesDetails = r.details.toLowerCase().includes(q);
        const matchesChannels = r.channelsSummary.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDetails && !matchesChannels) {
          return false;
        }
      }

      return true;
    });
  }, [taxRules, promoCodes, tableFilter, searchQuery, categories]);


  // Tax Modal: Open Handlers
  const handleOpenTaxModal = (rule?: TaxRuleRecord, forceClassification?: RevenueClassification) => {
    setActionError(null);
    setTaxFormErrors({});
    if (rule) {
      setEditingTaxRule(rule);
      setTaxRevenueClassification(rule.revenue_classification || forceClassification || "government_tax");
      setTaxIsDiscretionary(rule.is_discretionary || false);
      setTaxClassification(rule.gst_classification || "services");
      setTaxName(rule.name);
      setTaxType(rule.tax_type || "exclusive");
      setTaxCalcType(rule.calculation_type || "percentage");
      setTaxValue(String(rule.rate));
      setTaxAppliesTo(rule.applies_to || ["all"]);
      setTaxChannels(rule.order_channels || []);
    } else {
      setEditingTaxRule(null);
      setTaxRevenueClassification(forceClassification || "government_tax");
      setTaxIsDiscretionary(false);
      setTaxClassification("services");
      setTaxName("");
      setTaxType("exclusive");
      setTaxCalcType("percentage");
      setTaxValue("5");
      setTaxAppliesTo(["all"]);
      setTaxChannels([]); // Mandatory: empty by default
    }
    setIsTaxModalOpen(true);
  };

  // Tax Modal: Save Handler
  const handleSaveTaxRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxFormErrors({});
    setActionError(null);

    const isOtherCharge = taxRevenueClassification === "outlet_revenue";
    const valNum = parseFloat(taxValue);
    if (isNaN(valNum) || valNum < 0) {
      setTaxFormErrors({ rate: `Please enter a valid ${isOtherCharge ? "charge" : "tax"} value (0 or greater).` });
      return;
    }
    if (!taxName.trim()) {
      setTaxFormErrors({ name: `${isOtherCharge ? "Charge" : "Tax rule"} name is required.` });
      return;
    }
    if (taxChannels.length === 0) {
      setTaxFormErrors({ channels: "Please select at least one order channel." });
      return;
    }
    if (taxAppliesTo.length === 0) {
      setTaxFormErrors({ applies_to: "Please select applicable categories or All Items." });
      return;
    }

    const payload: TaxRuleInput = {
      name: taxName.trim(),
      gst_classification: isOtherCharge ? "services" : taxClassification,
      tax_type: taxType,
      calculation_type: taxCalcType,
      rate: valNum,
      applies_to: taxAppliesTo,
      order_channels: taxChannels,
      revenue_classification: taxRevenueClassification,
      is_discretionary: isOtherCharge ? taxIsDiscretionary : false,
      active: editingTaxRule ? editingTaxRule.active : true,
    };

    setIsTaxSubmitting(true);
    try {
      if (editingTaxRule) {
        const res = await onUpdateTaxRule(editingTaxRule.id, payload);
        if (res.success && res.taxRule) {
          setTaxRules((prev) =>
            prev.map((r) => (r.id === editingTaxRule.id ? res.taxRule : r))
          );
          setIsTaxModalOpen(false);
        } else {
          setActionError(res.error || "Failed to update tax rule.");
        }
      } else {
        const res = await onAddTaxRule(payload);
        if (res.success && res.taxRule) {
          setTaxRules((prev) => [...prev, res.taxRule]);
          setIsTaxModalOpen(false);
        } else {
          setActionError(res.error || "Failed to create tax rule.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "Unexpected error saving tax rule.");
    } finally {
      setIsTaxSubmitting(false);
    }
  };

  // Promo Modal: Open Handlers
  const handleOpenPromoModal = (promo?: PromoCodeRecord) => {
    setActionError(null);
    setPromoFormErrors({});
    if (promo) {
      setEditingPromo(promo);
      setPromoTitle(promo.title);
      setPromoCode(promo.code);
      setPromoDiscountType(promo.discount_type || "percentage");
      setPromoDiscountValue(String(promo.discount_value));
      setPromoMaxCap(promo.max_discount_cap ? String(promo.max_discount_cap) : "");
      setPromoMinBill(promo.min_bill_amount ? String(promo.min_bill_amount) : "");
      setPromoOrderTypes(promo.applicable_order_types || []);
      setPromoNoExpiry(promo.no_expiry !== false);
      setPromoStartDate(promo.start_date || "");
      setPromoEndDate(promo.end_date || "");
    } else {
      setEditingPromo(null);
      setPromoTitle("");
      setPromoCode("");
      setPromoDiscountType("percentage");
      setPromoDiscountValue("10");
      setPromoMaxCap("");
      setPromoMinBill("");
      setPromoOrderTypes([]); // Mandatory: empty by default
      setPromoNoExpiry(true);
      setPromoStartDate("");
      setPromoEndDate("");
    }
    setIsPromoModalOpen(true);
  };

  // Promo Modal: Save Handler
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoFormErrors({});
    setActionError(null);

    const normCode = promoCode.toUpperCase().replace(/\s+/g, "");
    if (!promoTitle.trim()) {
      setPromoFormErrors({ title: "Offer title is required." });
      return;
    }
    if (!normCode) {
      setPromoFormErrors({ code: "Coupon code is required." });
      return;
    }
    const valNum = parseFloat(promoDiscountValue);
    if (isNaN(valNum) || valNum <= 0) {
      setPromoFormErrors({ discount_value: "Discount value must be greater than 0." });
      return;
    }
    if (promoOrderTypes.length === 0) {
      setPromoFormErrors({ order_types: "Select at least one order type." });
      return;
    }

    const payload: PromoCodeInput = {
      title: promoTitle.trim(),
      code: normCode,
      discount_type: promoDiscountType,
      discount_value: valNum,
      max_discount_cap: promoMaxCap ? parseFloat(promoMaxCap) : null,
      min_bill_amount: promoMinBill ? parseFloat(promoMinBill) : null,
      applicable_order_types: promoOrderTypes,
      no_expiry: promoNoExpiry,
      start_date: promoNoExpiry ? null : (promoStartDate || null),
      end_date: promoNoExpiry ? null : (promoEndDate || null),
      active: editingPromo ? editingPromo.active : true,
    };

    setIsPromoSubmitting(true);
    try {
      if (editingPromo) {
        const res = await onUpdatePromoCode(editingPromo.id, payload);
        if (res.success && res.promoCode) {
          setPromoCodes((prev) =>
            prev.map((p) => (p.id === editingPromo.id ? res.promoCode : p))
          );
          setIsPromoModalOpen(false);
        } else {
          setActionError(res.error || "Failed to update promo code.");
        }
      } else {
        const res = await onAddPromoCode(payload);
        if (res.success && res.promoCode) {
          setPromoCodes((prev) => [...prev, res.promoCode]);
          setIsPromoModalOpen(false);
        } else {
          setActionError(res.error || "Failed to create promo code.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "Unexpected error saving promo code.");
    } finally {
      setIsPromoSubmitting(false);
    }
  };

  // Toggle inline status in table
  const handleToggleStatus = async (row: UnifiedRow) => {
    setStatusTogglingId(row.id);
    setActionError(null);
    try {
      if (row.kind === "tax") {
        const taxItem = row.raw as TaxRuleRecord;
        const newActive = !taxItem.active;
        const res = await onToggleTaxRuleStatus(taxItem.id, newActive);
        if (res.success) {
          setTaxRules((prev) =>
            prev.map((r) => (r.id === taxItem.id ? { ...r, active: newActive } : r))
          );
        } else {
          setActionError(res.error || "Failed to update tax rule status.");
        }
      } else {
        const promoItem = row.raw as PromoCodeRecord;
        const newActive = !promoItem.active;
        const res = await onTogglePromoCodeStatus(promoItem.id, newActive);
        if (res.success) {
          setPromoCodes((prev) =>
            prev.map((p) => (p.id === promoItem.id ? { ...p, active: newActive } : p))
          );
        } else {
          setActionError(res.error || "Failed to update promo code status.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to toggle status.");
    } finally {
      setStatusTogglingId(null);
    }
  };

  // Delete Action Confirm
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      if (deleteTarget.type === "tax") {
        const res = await onDeleteTaxRule(deleteTarget.id);
        if (res.success) {
          setTaxRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
          setDeleteTarget(null);
        } else {
          setActionError(res.error || "Failed to delete tax rule.");
        }
      } else {
        const res = await onDeletePromoCode(deleteTarget.id);
        if (res.success) {
          setPromoCodes((prev) => prev.filter((p) => p.id !== deleteTarget.id));
          setDeleteTarget(null);
        } else {
          setActionError(res.error || "Failed to delete promo code.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "Error deleting item.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Wizard Completion Gate Handler
  const handleFinalCompletion = async () => {
    // 1. Check mandatory requirement: At least 1 active Tax Rule
    const hasTaxRule = taxRules.filter((t) => t.active).length > 0;
    if (!hasTaxRule) {
      setGatingMessage(
        "You must add at least one active Tax Rule (e.g. CGST / SGST) before activating this branch."
      );
      return;
    }

    setGatingMessage(null);
    setIsCompleting(true);

    try {
      if (!onCompleteOnboarding) return;
      const res = await onCompleteOnboarding();
      if (res.success) {
        // Redirection handled by caller or window navigation to /admin
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else {
          window.location.href = "/admin";
        }
      } else {
        setActionError(res.error || "Failed to complete onboarding. Please try again.");
        setIsCompleting(false);
      }
    } catch (err: any) {
      setActionError(err?.message || "Unexpected error completing onboarding.");
      setIsCompleting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* 0. Persistent Legal Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-800 shrink-0 border border-amber-200">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950">
            Legal & Tax Compliance Disclaimer
          </h4>
          <p className="text-xs text-amber-850 mt-1 leading-relaxed">
            Tax compliance is the responsibility of the restaurant owner. Please ensure tax rates comply with your local state regulations and GST registration type.
          </p>
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Gating message banner */}
      {gatingMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-purple-50 border border-purple-200 p-4 text-xs sm:text-sm text-purple-900 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="font-semibold">{gatingMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setGatingMessage(null)}
            className="text-purple-500 hover:text-purple-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ==========================================
          TAX RULES, OTHER CHARGES & PROMO CODES TABLE
      ========================================== */}
      <section className="mb-6">
        {/* Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-secondary">
                Tax Rules, Other Charges & Promo Codes
              </h3>
              <span className="rounded-full bg-brand-surface-muted border border-brand-border px-2.5 py-0.5 text-xs font-bold text-brand-text-secondary">
                {taxRules.length + promoCodes.length} active
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Unified directory combining branch tax calculation rules and promotional discount campaigns.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenTaxModal(undefined, "government_tax")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover px-4 py-2 text-xs font-bold text-white shadow-brandCard transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Tax Rule</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenTaxModal(undefined, "outlet_revenue")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover px-4 py-2 text-xs font-bold text-white shadow-brandCard transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ Other Charges</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenPromoModal()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface-muted px-4 py-2 text-xs font-bold text-brand-secondary shadow-sm transition-all"
            >
              <Tag className="h-4 w-4 text-brand-text-muted" />
              <span>Create Promo Campaign</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Search Box Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Filter Chips: All / Tax Rules / Other Charges / Discount Rules */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              type="button"
              onClick={() => setTableFilter("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
                tableFilter === "all"
                  ? "bg-brand-secondary text-white border-brand-secondary shadow-sm"
                  : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              All ({taxRules.length + promoCodes.length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter("tax")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
                tableFilter === "tax"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-blue-900 border-brand-border hover:bg-blue-50"
              }`}
            >
              Tax Rules ({taxRules.filter((r) => r.revenue_classification !== "outlet_revenue").length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter("other_charges")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
                tableFilter === "other_charges"
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white text-amber-900 border-brand-border hover:bg-amber-50"
              }`}
            >
              Other Charges ({taxRules.filter((r) => r.revenue_classification === "outlet_revenue").length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter("discount")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
                tableFilter === "discount"
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white text-purple-900 border-brand-border hover:bg-purple-50"
              }`}
            >
              Discount Rules ({promoCodes.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, title, code..."
              className="w-full rounded-xl border border-brand-border bg-white pl-8 pr-7 py-1.5 text-xs text-brand-text-primary placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-brand-text-muted hover:text-brand-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Spreadsheet Data Table */}
        {taxRules.length === 0 && promoCodes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-brand-border p-10 text-center bg-white">
            <div className="h-12 w-12 rounded-2xl bg-brand-primary-light text-brand-primary flex items-center justify-center mx-auto mb-3">
              <Receipt className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-brand-secondary">
              No Tax Rules or Promos Configured Yet
            </h4>
            <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto">
              At least one tax rule is required to complete branch onboarding. Promo codes are optional.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenTaxModal(undefined, "government_tax")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Tax Rule</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenTaxModal(undefined, "outlet_revenue")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ Other Charges</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 z-10 bg-brand-surface-muted/95 backdrop-blur-sm border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                  <tr>
                    <th scope="col" className="py-3 px-4 w-[130px]">
                      Type
                    </th>
                    <th scope="col" className="py-3 px-4 w-[220px]">
                      Name / Title
                    </th>
                    <th scope="col" className="py-3 px-4 min-w-[200px]">
                      Details
                    </th>
                    <th scope="col" className="py-3 px-4 w-[220px]">
                      Applies To / Channels
                    </th>
                    <th scope="col" className="py-3 px-4 w-[110px] text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 w-[110px] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60 text-xs">
                  {unifiedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-brand-text-muted">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-6 w-6 text-brand-text-muted/50" />
                          <p className="font-bold text-brand-secondary">No rules match your search or filter</p>
                          <button
                            type="button"
                            onClick={() => {
                              setTableFilter("all");
                              setSearchQuery("");
                            }}
                            className="mt-1 text-xs font-bold text-brand-primary hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    unifiedRows.map((row) => {
                      const isToggling = statusTogglingId === row.id;

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors hover:bg-brand-surface-muted/40 ${
                            !row.active ? "bg-gray-50/70 opacity-75" : ""
                          }`}
                        >
                          {/* 1. Type Badge */}
                          <td className="py-3 px-4 align-middle">
                            {row.kind === "tax" && (
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                                <Receipt className="h-3 w-3 shrink-0" />
                                <span>Government Tax</span>
                              </span>
                            )}
                            {row.kind === "other_charges" && (
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-200">
                                <DollarSign className="h-3 w-3 shrink-0" />
                                <span>Other Charges</span>
                              </span>
                            )}
                            {row.kind === "discount" && (
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-purple-50 text-purple-700 border-purple-200">
                                <Tag className="h-3 w-3 shrink-0" />
                                <span>Discount</span>
                              </span>
                            )}
                          </td>

                          {/* 2. Name / Title */}
                          <td className="py-3 px-4 align-middle">
                            <div>
                              <div className="font-bold text-brand-secondary">
                                {row.name}
                              </div>
                              {row.subCode && (
                                <span className="inline-block mt-0.5 font-mono text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-1.5 py-0.2 rounded">
                                  {row.subCode}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Details */}
                          <td className="py-3 px-4 align-middle font-medium text-brand-text-secondary">
                            {row.details}
                          </td>

                          {/* 4. Applies To / Order Channels */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex flex-col gap-1 text-[11px]">
                              <div className="font-semibold text-brand-secondary truncate max-w-[200px]" title={row.appliesToSummary}>
                                {row.appliesToSummary}
                              </div>
                              <div className="text-[10px] text-brand-text-muted flex items-center gap-1">
                                <span>Channels:</span>
                                <span className="text-brand-text-secondary">{row.channelsSummary}</span>
                              </div>
                            </div>
                          </td>

                          {/* 5. Status Toggle */}
                          <td className="py-3 px-4 align-middle text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(row)}
                                disabled={isToggling}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  row.active ? "bg-emerald-500" : "bg-gray-300"
                                }`}
                                title={row.active ? "Click to deactivate" : "Click to activate"}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    row.active ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span className={`text-[10px] font-bold ${row.active ? "text-emerald-700" : "text-gray-500"}`}>
                                {row.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td className="py-3 px-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (row.kind === "tax" || row.kind === "other_charges") {
                                    handleOpenTaxModal(row.raw as TaxRuleRecord);
                                  } else {
                                    handleOpenPromoModal(row.raw as PromoCodeRecord);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-brand-border text-brand-secondary hover:bg-brand-surface-muted transition-all"
                                title="Edit"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget({
                                    id: (row.raw as any).id,
                                    type: (row.kind === "tax" || row.kind === "other_charges") ? "tax" : "promo",
                                    title: row.name,
                                  });
                                }}
                                className="p-1.5 rounded-lg border border-brand-border text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 bg-brand-surface-muted/60 border-t border-brand-border flex items-center justify-between text-xs text-brand-text-secondary">
              <span>
                Showing {unifiedRows.length} of {taxRules.length + promoCodes.length} total rules
              </span>
              <span className="text-[11px] text-brand-text-muted hidden sm:inline">
                Scroll vertically to inspect up to 10+ configured rules
              </span>
            </div>
          </div>
        )}
      </section>



      {/* ==========================================
          NAVIGATION FOOTER & ONBOARDING COMPLETION
      ========================================== */}
      {!isSettingsMode && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border pt-6">
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-5 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Menu Engineering</span>
          </button>

          <button
            type="button"
            disabled={isCompleting}
            onClick={handleFinalCompletion}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-7 py-3 text-xs font-bold text-white shadow-brandCard transition-all w-full sm:w-auto justify-center disabled:opacity-50"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Activating Branch...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Onboarding & Activate Branch</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ==========================================
          MODAL 1: ADD / EDIT TAX RULE & OTHER CHARGES
      ========================================== */}
      {isTaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-brandModal border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                    taxRevenueClassification === "outlet_revenue"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {taxRevenueClassification === "outlet_revenue" ? (
                    <DollarSign className="h-5 w-5" />
                  ) : (
                    <Receipt className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary">
                    {taxRevenueClassification === "outlet_revenue"
                      ? editingTaxRule
                        ? "Edit Other Charge"
                        : "Add Other Charge"
                      : editingTaxRule
                      ? "Edit Tax Rule"
                      : "Add New Tax Rule"}
                  </h3>
                  <p className="text-[11px] text-brand-text-muted">
                    {taxRevenueClassification === "outlet_revenue"
                      ? "Configure custom outlet fees, delivery/packaging charges, or tips"
                      : "Configure GST rate, calculation mode, and category mapping"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTaxModalOpen(false)}
                className="rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxRule} className="mt-5 space-y-4 text-xs">
              {/* 1. Goods & Services Classification (Tax Rule only) */}
              {taxRevenueClassification !== "outlet_revenue" && (
                <div>
                  <label className="block text-xs font-bold text-brand-text-primary mb-1">
                    1. Goods & Services Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={taxClassification}
                    onChange={(e) => setTaxClassification(e.target.value as GstClassification)}
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-bold text-brand-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  >
                    <option value="goods">Goods</option>
                    <option value="services">Services</option>
                  </select>
                  <p className="text-[10px] text-brand-text-muted mt-1">
                    Tax category classification for compliance reporting under GST.
                  </p>
                </div>
              )}

              {/* Name field: 2 for tax rule, 1 for other charges */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  {taxRevenueClassification === "outlet_revenue" ? "1. Charge Name" : "2. Tax Name"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder={
                    taxRevenueClassification === "outlet_revenue"
                      ? "e.g. Delivery Fee, Service Charge, Night Surcharge"
                      : "e.g. CGST, SGST, Alcohol VAT"
                  }
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                {taxFormErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{taxFormErrors.name}</p>
                )}
              </div>

              {/* Calculation Type Mode: Exclusive / Inclusive */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  {taxRevenueClassification === "outlet_revenue"
                    ? "2. Calculation Type Mode"
                    : "3. Calculation Type Mode"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <SelectionButtons<TaxRuleType>
                  options={[
                    { value: "exclusive", label: "Exclusive", subLabel: "Added on top of price" },
                    { value: "inclusive", label: "Inclusive", subLabel: "Included within price" },
                  ]}
                  value={taxType}
                  onChange={(val) => setTaxType(val)}
                  name="taxType"
                  columns={2}
                />
              </div>

              {/* Calculation Value Type: Percentage / Fixed per item / Full Bill One-Time */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  {taxRevenueClassification === "outlet_revenue"
                    ? "3. Calculation Value Type"
                    : "4. Calculation Value Type"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <SelectionButtons<TaxCalculationType>
                  options={[
                    {
                      value: "percentage",
                      label: "Percentage (%)",
                      subLabel: "% of taxable amount",
                    },
                    {
                      value: "fixed_per_item",
                      label: "Fixed Amount (Per Item) (₹)",
                      subLabel: "Multiplied by item qty",
                    },
                    {
                      value: "one_time_per_bill",
                      label: "Full Bill / One-Time (₹)",
                      subLabel: "Flat fee once per bill",
                    },
                  ]}
                  value={taxCalcType}
                  onChange={(val) => setTaxCalcType(val)}
                  name="taxCalcType"
                  columns={3}
                />
              </div>

              {/* Value input */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  {taxRevenueClassification === "outlet_revenue"
                    ? `4. Charge Value (${taxCalcType === "percentage" ? "%" : "₹"})`
                    : `5. Tax Value (${taxCalcType === "percentage" ? "%" : "₹"})`}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={taxValue}
                  onChange={(e) => setTaxValue(e.target.value)}
                  placeholder={taxCalcType === "percentage" ? "e.g. 2.5 or 5" : "e.g. 10 or 50"}
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                {taxFormErrors.rate && (
                  <p className="text-[11px] text-rose-600 mt-1">{taxFormErrors.rate}</p>
                )}
              </div>

              {/* Applies To Category */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-brand-text-primary">
                    {taxRevenueClassification === "outlet_revenue"
                      ? "5. Applies To Categories"
                      : "6. Applies To Categories"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (taxAppliesTo.includes("all")) {
                        setTaxAppliesTo([]);
                      } else {
                        setTaxAppliesTo(["all"]);
                      }
                    }}
                    className="text-[11px] font-bold text-brand-primary hover:underline"
                  >
                    {taxAppliesTo.includes("all") ? "Select specific categories" : "Select All Items"}
                  </button>
                </div>

                {taxAppliesTo.includes("all") ? (
                  <div className="rounded-xl border border-brand-primary/30 bg-brand-primary-light/40 p-3 text-xs flex items-center gap-2 text-brand-primary font-bold">
                    <Check className="h-4 w-4" />
                    <span>Applies across all menu items and categories</span>
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl border border-brand-border bg-brand-surface-muted/30 scrollbar-thin">
                    {categories.length === 0 ? (
                      <p className="text-[11px] text-brand-text-muted p-2 italic">
                        No categories found. Will apply to All Items.
                      </p>
                    ) : (
                      categories.map((cat) => {
                        const isSelected = taxAppliesTo.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? "bg-brand-primary-light border-brand-primary/40 text-brand-primary font-bold"
                                : "bg-white border-brand-border/60 text-brand-text-secondary hover:bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setTaxAppliesTo(taxAppliesTo.filter((id) => id !== cat.id));
                                } else {
                                  setTaxAppliesTo([...taxAppliesTo, cat.id]);
                                }
                              }}
                              className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                            />
                            <span>{cat.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
                {taxFormErrors.applies_to && (
                  <p className="text-[11px] text-rose-600 mt-1">{taxFormErrors.applies_to}</p>
                )}
              </div>

              {/* Order Channels */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  {taxRevenueClassification === "outlet_revenue"
                    ? "6. Order Channels"
                    : "7. Order Channels"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <MultiSelectionButtons<OrderChannel>
                  options={[
                    { value: "dine_in", label: "Dine-In" },
                    { value: "takeaway", label: "Takeaway" },
                    { value: "online", label: "Online Direct" },
                  ]}
                  values={taxChannels}
                  onChange={(vals) => setTaxChannels(vals)}
                  columns={3}
                />
                <p className="text-[10px] text-brand-text-muted mt-1">
                  Must select at least one channel. &quot;Online Direct&quot; applies to this platform&apos;s direct ordering.
                </p>
                {taxFormErrors.channels && (
                  <p className="text-[11px] text-rose-600 mt-1">{taxFormErrors.channels}</p>
                )}
              </div>

              {/* 7. Discretionary / Voluntary toggle (Other Charges only) */}
              {taxRevenueClassification === "outlet_revenue" && (
                <div className="rounded-xl border border-brand-border bg-brand-surface-muted/40 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label htmlFor="tax-discretionary-toggle" className="block text-xs font-bold text-brand-secondary cursor-pointer">
                        7. Discretionary / Voluntary Charge
                      </label>
                      <p className="text-[11px] text-brand-text-muted mt-0.5 leading-relaxed">
                        If enabled, this charge is marked as voluntary on customer bills. Customers may request to remove it at checkout.
                      </p>
                    </div>
                    <input
                      id="tax-discretionary-toggle"
                      type="checkbox"
                      checked={taxIsDiscretionary}
                      onChange={(e) => setTaxIsDiscretionary(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsTaxModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-text-secondary hover:bg-brand-surface-muted rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTaxSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all disabled:opacity-50"
                >
                  {isTaxSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>
                    {taxRevenueClassification === "outlet_revenue"
                      ? editingTaxRule
                        ? "Update Other Charge"
                        : "Save Other Charge"
                      : editingTaxRule
                      ? "Update Tax Rule"
                      : "Save Tax Rule"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: ADD / EDIT PROMO CODE
      ========================================== */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-brandModal border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary">
                    {editingPromo ? "Edit Promo Campaign" : "Create Promo Campaign"}
                  </h3>
                  <p className="text-[11px] text-brand-text-muted">
                    Set up coupon discount percentage or flat reduction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="mt-5 space-y-4 text-xs">
              {/* 1. Offer Title */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  1. Offer Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. Monsoon Festival ₹50 Off, Welcome 10%"
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                {promoFormErrors.title && (
                  <p className="text-[11px] text-rose-600 mt-1">{promoFormErrors.title}</p>
                )}
              </div>

              {/* 2. Coupon Code (auto-uppercased) */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  2. Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. FLAT50, MONSOON10"
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-brand-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                <p className="text-[10px] text-brand-text-muted mt-1">
                  Auto-uppercased. Must be unique for this branch.
                </p>
                {promoFormErrors.code && (
                  <p className="text-[11px] text-rose-600 mt-1">{promoFormErrors.code}</p>
                )}
              </div>

              {/* 3. Discount Type: Percentage vs Flat */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  3. Discount Type <span className="text-rose-500">*</span>
                </label>
                <SelectionButtons<PromoDiscountType>
                  options={[
                    { value: "percentage", label: "Percentage (%)", subLabel: "% off order subtotal" },
                    { value: "flat", label: "Flat ₹ Off", subLabel: "Fixed rupee deduction" },
                  ]}
                  value={promoDiscountType}
                  onChange={(val) => setPromoDiscountType(val)}
                  name="promoDiscountType"
                  columns={2}
                />
              </div>

              {/* 4. Discount Value & Caps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text-primary mb-1">
                    4. Discount Value ({promoDiscountType === "percentage" ? "%" : "₹"}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={promoDiscountValue}
                    onChange={(e) => setPromoDiscountValue(e.target.value)}
                    placeholder={promoDiscountType === "percentage" ? "10" : "50"}
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  {promoFormErrors.discount_value && (
                    <p className="text-[11px] text-rose-600 mt-1">{promoFormErrors.discount_value}</p>
                  )}
                </div>

                {promoDiscountType === "percentage" ? (
                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={promoMaxCap}
                      onChange={(e) => setPromoMaxCap(e.target.value)}
                      placeholder="e.g. 100 (Optional)"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Minimum Bill Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={promoMinBill}
                      onChange={(e) => setPromoMinBill(e.target.value)}
                      placeholder="e.g. 300 (Optional)"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {promoDiscountType === "percentage" && (
                <div>
                  <label className="block text-xs font-bold text-brand-text-primary mb-1">
                    Minimum Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={promoMinBill}
                    onChange={(e) => setPromoMinBill(e.target.value)}
                    placeholder="e.g. 500 (Optional)"
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>
              )}

              {/* 5. Applicable Order Channels */}
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  5. Applicable Order Channels <span className="text-rose-500">*</span>
                </label>
                <MultiSelectionButtons<OrderChannel>
                  options={[
                    { value: "dine_in", label: "Dine-In" },
                    { value: "takeaway", label: "Takeaway" },
                    { value: "online", label: "Online Orders" },
                  ]}
                  values={promoOrderTypes}
                  onChange={(vals) => setPromoOrderTypes(vals)}
                  columns={3}
                />
                {promoFormErrors.order_types && (
                  <p className="text-[11px] text-rose-600 mt-1">{promoFormErrors.order_types}</p>
                )}
              </div>

              {/* 6. Active Period / No Expiry Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-brand-text-primary">
                    6. Active Validity Period
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-brand-secondary">
                    <input
                      type="checkbox"
                      checked={promoNoExpiry}
                      onChange={(e) => setPromoNoExpiry(e.target.checked)}
                      className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                    />
                    <span>No Expiry</span>
                  </label>
                </div>

                {!promoNoExpiry && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Start Date</span>
                      <input
                        type="date"
                        value={promoStartDate}
                        onChange={(e) => setPromoStartDate(e.target.value)}
                        className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">End Date</span>
                      <input
                        type="date"
                        value={promoEndDate}
                        onChange={(e) => setPromoEndDate(e.target.value)}
                        className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-text-secondary hover:bg-brand-surface-muted rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all disabled:opacity-50"
                >
                  {isPromoSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingPromo ? "Update Promo" : "Save Promo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION MODAL
      ========================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-brandModal border border-brand-border text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-brand-secondary">
              Delete {deleteTarget.type === "tax" ? "Tax Rule" : "Promo Code"}?
            </h4>
            <p className="mt-1 text-xs text-brand-text-secondary">
              Are you sure you want to remove &quot;{deleteTarget.title}&quot;? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-brand-text-secondary hover:bg-brand-surface-muted rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
