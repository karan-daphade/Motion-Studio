"use client";

import React, { useState, useEffect, useRef } from "react";
import BrandHeader from "@/components/brand/brand-header";
import OnboardingStepper from "./onboarding-stepper";
import StepBranch, { StepBranchRef } from "./step-branch";
import StepKitchen from "./step-kitchen";
import StepShift from "./step-shift";
import StepSection from "./step-section";
import StepEmployee from "./step-employee";
import StepMenu from "./step-menu";
import StepTax from "./step-tax";
import { 
  getOnboardingData, 
  saveBranchSetup, 
  createKitchen, 
  updateKitchen, 
  deleteKitchen, 
  createShift, 
  updateShift, 
  deleteShift, 
  createSection,
  updateSection,
  deleteSection,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  createAddon,
  updatePriceDisplayMode,
  createTaxRule,
  updateTaxRule,
  toggleTaxRuleStatus,
  deleteTaxRule,
  createPromoCode,
  updatePromoCode,
  togglePromoCodeStatus,
  deletePromoCode,
  saveBranchChargeSettings,
  completeBranchOnboarding,
  updateOnboardingProgress 
} from "@/app/actions/onboarding-actions";
import { 
  type BranchSetupInput, 
  type KitchenInput, 
  type ShiftInput, 
  type SectionInput,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type CategoryInput,
  type ItemInput,
  type AddonInput,
  type TaxRuleInput,
  type PromoCodeInput,
  type BranchChargeSettingsInput,
  type PriceDisplayMode
} from "@/lib/onboarding/schemas";
import { Loader2, AlertCircle } from "lucide-react";

export default function OnboardingWizard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Authenticated state
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [priceDisplayMode, setPriceDisplayMode] = useState<PriceDisplayMode>("exclusive");
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [chargeSettings, setChargeSettings] = useState<any>(null);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Reference to Step 1 for autosave triggers
  const stepBranchRef = useRef<StepBranchRef>(null);

  // Load initial data on mount
  const loadData = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const res = await getOnboardingData();
      if (!res.success) {
        setErrorBanner(res.error || "Unable to load onboarding session.");
        setIsLoading(false);
        return;
      }

      setUser(res.user);
      setRestaurant(res.restaurant);
      setBranch(res.branch);
      setKitchens(res.kitchens || []);
      setShifts(res.shifts || []);
      setSections(res.sections || []);
      setEmployees(res.employees || []);
      setCategories(res.categories || []);
      setItems(res.items || []);
      setAddons(res.addons || []);
      setPriceDisplayMode(res.price_display_mode || "exclusive");
      setTaxRules(res.tax_rules || []);
      setPromoCodes(res.promo_codes || []);
      setChargeSettings(res.charge_settings || null);

      if (res.branch) {
        const rawProgress = res.branch.onboarding_progress || {};
        const step = typeof rawProgress.current_step === "number" ? rawProgress.current_step : 1;
        const finished = Array.isArray(rawProgress.completed_steps) ? rawProgress.completed_steps : [];

        // Dynamic checks for active items
        const hasKitchens = (res.kitchens || []).filter((k: any) => k.active).length > 0;
        const hasShifts = (res.shifts || []).filter((s: any) => s.active).length > 0;
        const hasSections = (res.sections || []).filter((sec: any) => sec.active).length > 0;
        const hasBranchManager = (res.employees || []).filter((e: any) => e.role === "manager" && e.status === "active").length > 0;
        const hasCategories = (res.categories || []).length > 0;
        const hasItems = (res.items || []).length > 0;
        const hasValidMenu = hasCategories && hasItems;
        const hasTaxRules = (res.tax_rules || []).filter((t: any) => t.active).length > 0;

        let mergedCompleted = [...finished];
        if (hasKitchens && !mergedCompleted.includes(2)) mergedCompleted.push(2);
        if (hasShifts && !mergedCompleted.includes(3)) mergedCompleted.push(3);
        if (hasSections && !mergedCompleted.includes(4)) mergedCompleted.push(4);
        if (hasBranchManager && !mergedCompleted.includes(5)) mergedCompleted.push(5);
        if (hasValidMenu && !mergedCompleted.includes(6)) mergedCompleted.push(6);
        if ((res.branch.status === "active" || hasTaxRules) && finished.includes(7)) {
          if (!mergedCompleted.includes(7)) mergedCompleted.push(7);
        }

        setCompletedSteps(mergedCompleted);
        setCurrentStep(step);
      } else {
        setCurrentStep(1);
        setCompletedSteps([]);
      }
      setIsLoading(false);
    } catch (err: any) {
      setErrorBanner(err?.message || "Network error loading onboarding.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save current step progress in background
  const persistProgress = async (newStep: number, newCompleted: number[]) => {
    if (!branch?.id) return;
    try {
      setIsSaving(true);
      await updateOnboardingProgress(branch.id, newStep, newCompleted);
      setIsSaving(false);
    } catch (e) {
      setIsSaving(false);
    }
  };

  // Step 1 Save Action Handler
  const handleSaveBranch = async (data: BranchSetupInput) => {
    setIsSaving(true);
    const res = await saveBranchSetup(branch?.id || null, data);
    setIsSaving(false);

    if (res.success && res.branch) {
      setBranch(res.branch);
      const nextCompleted = Array.from(new Set([...completedSteps, 1]));
      setCompletedSteps(nextCompleted);
      setCurrentStep(2);
      await persistProgress(2, nextCompleted);
    }
    return res;
  };

  // Step 2 Kitchen Actions
  const handleAddKitchen = async (data: KitchenInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createKitchen(branch.id, data);
    setIsSaving(false);

    if (res.success && res.kitchen) {
      setKitchens((prev) => {
        let updated = prev;
        if (data.default_kitchen) {
          updated = prev.map((k) => ({ ...k, default_kitchen: false }));
        }
        return [...updated, res.kitchen];
      });

      if (data.active && !completedSteps.includes(2)) {
        const nextCompleted = [...completedSteps, 2];
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleUpdateKitchen = async (id: string, data: KitchenInput) => {
    setIsSaving(true);
    const res = await updateKitchen(id, data);
    setIsSaving(false);

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
    setIsSaving(true);
    const res = await deleteKitchen(id);
    setIsSaving(false);

    if (res.success) {
      const remaining = kitchens.filter((k) => k.id !== id);
      setKitchens(remaining);
      const remainingActive = remaining.filter((k) => k.active).length;
      if (remainingActive === 0) {
        const nextCompleted = completedSteps.filter((s) => s !== 2);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  // Step 3 Shift Actions
  const handleAddShift = async (data: ShiftInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createShift(branch.id, data);
    setIsSaving(false);

    if (res.success && res.shift) {
      setShifts((prev) => {
        let updated = prev;
        if (data.default_shift) {
          updated = prev.map((s) => ({ ...s, default_shift: false }));
        }
        return [...updated, res.shift];
      });

      if (data.active && !completedSteps.includes(3)) {
        const nextCompleted = [...completedSteps, 3];
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleUpdateShift = async (id: string, data: ShiftInput) => {
    setIsSaving(true);
    const res = await updateShift(id, data);
    setIsSaving(false);

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
    setIsSaving(true);
    const res = await deleteShift(id);
    setIsSaving(false);

    if (res.success) {
      const remaining = shifts.filter((s) => s.id !== id);
      setShifts(remaining);
      const remainingActive = remaining.filter((s) => s.active).length;
      if (remainingActive === 0) {
        const nextCompleted = completedSteps.filter((s) => s !== 3);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  // Step 4 Section Actions
  const handleAddSection = async (data: SectionInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createSection(branch.id, data);
    setIsSaving(false);

    if (res.success && res.section) {
      setSections((prev) => [...prev, res.section]);

      if (!completedSteps.includes(4)) {
        const nextCompleted = [...completedSteps, 4];
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleUpdateSection = async (id: string, data: SectionInput) => {
    setIsSaving(true);
    const res = await updateSection(id, data);
    setIsSaving(false);

    if (res.success && res.section) {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.section } : s))
      );
    }
    return res;
  };

  const handleDeleteSection = async (id: string) => {
    setIsSaving(true);
    const res = await deleteSection(id);
    setIsSaving(false);

    if (res.success) {
      const remaining = sections.filter((s) => s.id !== id);
      setSections(remaining);
      const remainingActive = remaining.filter((s) => s.active).length;
      if (remainingActive === 0) {
        const nextCompleted = completedSteps.filter((s) => s !== 4);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  // Step 5 Employee Actions
  const handleAddEmployee = async (data: CreateEmployeeInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createEmployee(branch.id, data);
    setIsSaving(false);

    if (res.success && res.employee) {
      setEmployees((prev) => [...prev, res.employee]);
      if (data.role === "manager" && data.status === "active" && !completedSteps.includes(5)) {
        const nextCompleted = Array.from(new Set([...completedSteps, 5]));
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleUpdateEmployee = async (id: string, data: UpdateEmployeeInput) => {
    setIsSaving(true);
    const res = await updateEmployee(id, data);
    setIsSaving(false);

    if (res.success && res.employee) {
      setEmployees((prev) => prev.map((e) => (e.id === id ? res.employee : e)));
      const updatedList = employees.map((e) => (e.id === id ? res.employee : e));
      const hasMgr = updatedList.some((e) => e.role === "manager" && e.status === "active");
      if (!hasMgr && completedSteps.includes(5)) {
        const nextCompleted = completedSteps.filter((s) => s !== 5);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      } else if (hasMgr && !completedSteps.includes(5)) {
        const nextCompleted = Array.from(new Set([...completedSteps, 5]));
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleToggleEmployeeStatus = async (id: string, active: boolean) => {
    setIsSaving(true);
    const res = await toggleEmployeeStatus(id, active);
    setIsSaving(false);

    if (res.success) {
      const updatedList = employees.map((e) =>
        e.id === id ? { ...e, status: active ? "active" : "inactive" } : e
      );
      setEmployees(updatedList);
      const hasMgr = updatedList.some((e) => e.role === "manager" && e.status === "active");
      if (!hasMgr && completedSteps.includes(5)) {
        const nextCompleted = completedSteps.filter((s) => s !== 5);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      } else if (hasMgr && !completedSteps.includes(5)) {
        const nextCompleted = Array.from(new Set([...completedSteps, 5]));
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleDeleteEmployee = async (id: string) => {
    setIsSaving(true);
    const res = await deleteEmployee(id);
    setIsSaving(false);

    if (res.success) {
      const remaining = employees.filter((e) => e.id !== id);
      setEmployees(remaining);
      const hasMgr = remaining.some((e) => e.role === "manager" && e.status === "active");
      if (!hasMgr && completedSteps.includes(5)) {
        const nextCompleted = completedSteps.filter((s) => s !== 5);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleProceedToMenu = async () => {
    const hasMgr = employees.some((e) => e.role === "manager" && e.status === "active");
    if (!hasMgr) {
      setErrorBanner("You must have at least 1 active Branch Manager before proceeding to Menu Engineering.");
      return;
    }

    const nextCompleted = Array.from(new Set([...completedSteps, 5]));
    setCompletedSteps(nextCompleted);
    setCurrentStep(6);
    await persistProgress(6, nextCompleted);
  };

  // Step 6 Menu Actions
  const handleCreateCategory = async (data: CategoryInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createCategory(branch.id, data);
    setIsSaving(false);

    if (res.success && res.category) {
      setCategories((prev) => [...prev, res.category]);
      if (items.length > 0 && !completedSteps.includes(6)) {
        const nextCompleted = Array.from(new Set([...completedSteps, 6]));
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleUpdateCategory = async (id: string, data: Partial<CategoryInput>) => {
    setIsSaving(true);
    const res = await updateCategory(id, data);
    setIsSaving(false);

    if (res.success && res.category) {
      setCategories((prev) => prev.map((c) => (c.id === id ? res.category : c)));
    }
    return res;
  };

  const handleDeleteCategory = async (id: string) => {
    setIsSaving(true);
    const res = await deleteCategory(id);
    setIsSaving(false);

    if (res.success) {
      const remainingCategories = categories.filter((c) => c.id !== id);
      const remainingItems = items.filter((i) => i.category_id !== id);
      setCategories(remainingCategories);
      setItems(remainingItems);

      const isValid = remainingCategories.length > 0 && remainingItems.length > 0;
      if (!isValid && completedSteps.includes(6)) {
        const nextCompleted = completedSteps.filter((s) => s !== 6);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleCreateItem = async (data: ItemInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createItem(branch.id, data);
    setIsSaving(false);

    if (res.success && res.item) {
      setItems((prev) => [...prev, res.item]);
      if (categories.length > 0 && !completedSteps.includes(6)) {
        const nextCompleted = Array.from(new Set([...completedSteps, 6]));
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleUpdateItem = async (id: string, data: Partial<ItemInput>) => {
    setIsSaving(true);
    const res = await updateItem(id, data);
    setIsSaving(false);

    if (res.success && res.item) {
      setItems((prev) => prev.map((i) => (i.id === id ? res.item : i)));
    }
    return res;
  };

  const handleDeleteItem = async (id: string) => {
    setIsSaving(true);
    const res = await deleteItem(id);
    setIsSaving(false);

    if (res.success) {
      const remainingItems = items.filter((i) => i.id !== id);
      setItems(remainingItems);

      const isValid = categories.length > 0 && remainingItems.length > 0;
      if (!isValid && completedSteps.includes(6)) {
        const nextCompleted = completedSteps.filter((s) => s !== 6);
        setCompletedSteps(nextCompleted);
        await persistProgress(currentStep, nextCompleted);
      }
    }
    return res;
  };

  const handleCreateAddon = async (data: AddonInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createAddon(branch.id, data);
    setIsSaving(false);

    if (res.success && res.addon) {
      setAddons((prev) => [...prev, res.addon]);
    }
    return res;
  };

  const handleProceedToTax = async () => {
    if (categories.length === 0 || items.length === 0) {
      setErrorBanner("You must add at least 1 category with at least 1 item before proceeding to Tax & Compliance.");
      return;
    }

    const nextCompleted = Array.from(new Set([...completedSteps, 6]));
    setCompletedSteps(nextCompleted);
    setCurrentStep(7);
    await persistProgress(7, nextCompleted);
  };

  // Step 7 Action Handlers
  const handleUpdatePriceDisplayMode = async (mode: PriceDisplayMode) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    const res = await updatePriceDisplayMode(branch.id, mode);
    if (res.success) {
      setPriceDisplayMode(mode);
    }
    return res;
  };

  const handleAddTaxRule = async (data: TaxRuleInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createTaxRule(branch.id, data);
    setIsSaving(false);
    if (res.success && res.taxRule) {
      setTaxRules((prev) => [...prev, res.taxRule]);
    }
    return res;
  };

  const handleUpdateTaxRule = async (id: string, data: Partial<TaxRuleInput>) => {
    setIsSaving(true);
    const res = await updateTaxRule(id, data);
    setIsSaving(false);
    if (res.success && res.taxRule) {
      setTaxRules((prev) => prev.map((r) => (r.id === id ? res.taxRule : r)));
    }
    return res;
  };

  const handleToggleTaxRuleStatus = async (id: string, active: boolean) => {
    const res = await toggleTaxRuleStatus(id, active);
    if (res.success) {
      setTaxRules((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
    }
    return res;
  };

  const handleDeleteTaxRule = async (id: string) => {
    setIsSaving(true);
    const res = await deleteTaxRule(id);
    setIsSaving(false);
    if (res.success) {
      setTaxRules((prev) => prev.filter((r) => r.id !== id));
    }
    return res;
  };

  const handleAddPromoCode = async (data: PromoCodeInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await createPromoCode(branch.id, data);
    setIsSaving(false);
    if (res.success && res.promoCode) {
      setPromoCodes((prev) => [...prev, res.promoCode]);
    }
    return res;
  };

  const handleUpdatePromoCode = async (id: string, data: Partial<PromoCodeInput>) => {
    setIsSaving(true);
    const res = await updatePromoCode(id, data);
    setIsSaving(false);
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
    setIsSaving(true);
    const res = await deletePromoCode(id);
    setIsSaving(false);
    if (res.success) {
      setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    }
    return res;
  };

  const handleSaveChargeSettings = async (data: BranchChargeSettingsInput) => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await saveBranchChargeSettings(branch.id, data);
    setIsSaving(false);
    if (res.success && res.chargeSettings) {
      setChargeSettings(res.chargeSettings);
    }
    return res;
  };

  const handleCompleteOnboarding = async () => {
    if (!branch?.id) return { success: false, error: "Branch not initialized." };
    setIsSaving(true);
    const res = await completeBranchOnboarding(branch.id);
    setIsSaving(false);
    if (res.success) {
      const allDone = [1, 2, 3, 4, 5, 6, 7];
      setCompletedSteps(allDone);
      if (res.branch) {
        setBranch(res.branch);
      }
    }
    return res;
  };

  // Navigation handlers with Autosave on transition
  const handleSelectStep = async (targetStep: number) => {
    if (targetStep === currentStep) return;

    // Autosave current step if leaving Step 1
    if (currentStep === 1 && stepBranchRef.current) {
      await stepBranchRef.current.triggerAutosave();
    }

    setCurrentStep(targetStep);
    await persistProgress(targetStep, completedSteps);
  };

  const handleProceedToKitchens = async () => {
    setCurrentStep(2);
    await persistProgress(2, completedSteps);
  };

  const handleProceedToShifts = async () => {
    const activeKitchens = kitchens.filter((k) => k.active).length;
    if (activeKitchens === 0) {
      setErrorBanner("You must have at least 1 active kitchen station before moving to shifts.");
      return;
    }

    const nextCompleted = Array.from(new Set([...completedSteps, 2]));
    setCompletedSteps(nextCompleted);
    setCurrentStep(3);
    await persistProgress(3, nextCompleted);
  };

  const handleProceedToSections = async () => {
    const activeShifts = shifts.filter((s) => s.active).length;
    if (activeShifts === 0) {
      setErrorBanner("You must have at least 1 active operating shift before moving to sections.");
      return;
    }

    const nextCompleted = Array.from(new Set([...completedSteps, 3]));
    setCompletedSteps(nextCompleted);
    setCurrentStep(4);
    await persistProgress(4, nextCompleted);
  };

  const handleProceedToEmployees = async () => {
    const activeSections = sections.filter((s) => s.active).length;
    if (activeSections === 0) {
      setErrorBanner("You must add at least 1 dining section (with at least 1 table/room) to proceed.");
      return;
    }

    const nextCompleted = Array.from(new Set([...completedSteps, 4]));
    setCompletedSteps(nextCompleted);
    // Move to step 5 milestone screen
    setCurrentStep(5);
    await persistProgress(5, nextCompleted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col">
        <BrandHeader roleName="Branch Setup" showBackToHub={true} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="text-sm font-semibold text-brand-text-secondary">
              Initializing Onboarding Engine...
            </p>
          </div>
        </main>
      </div>
    );
  }

  const activeSectionsCount = sections.filter((s) => s.active).length;
  const totalUnitsCount = sections
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (s.table_count || 0), 0);

  return (
    <div className="min-h-screen bg-brand-background pb-16">
      <BrandHeader 
        roleName="Owner Setup" 
        showBackToHub={true}
        currentBranch={branch?.name || "New Branch Setup"}
        userEmail={user?.email || "owner@bharatqr.internal"}
        userName={[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
        hasActiveBranch={branch?.status === "active" || (Array.isArray(completedSteps) && [1, 2, 3, 4, 5, 6, 7].every((s: number) => completedSteps.includes(s)))}
      />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error notification banner */}
        {errorBanner && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-medium text-rose-900 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 7-Step Visual Stepper */}
        <OnboardingStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onSelectStep={handleSelectStep}
          isSaving={isSaving}
        />

        {/* Step Views */}
        {currentStep === 1 && (
          <StepBranch
            ref={stepBranchRef}
            initialBranch={branch}
            onSaveSuccess={(savedBranch) => {
              setBranch(savedBranch);
              handleProceedToKitchens();
            }}
            onSaveAction={handleSaveBranch}
            isFirstBranch={!branch}
          />
        )}

        {currentStep === 2 && (
          <StepKitchen
            branchId={branch?.id || ""}
            initialKitchens={kitchens}
            onAddKitchen={handleAddKitchen}
            onUpdateKitchen={handleUpdateKitchen}
            onDeleteKitchen={handleDeleteKitchen}
            onProceedToShifts={handleProceedToShifts}
            onBackToBranch={() => handleSelectStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepShift
            branchId={branch?.id || ""}
            initialShifts={shifts}
            onAddShift={handleAddShift}
            onUpdateShift={handleUpdateShift}
            onDeleteShift={handleDeleteShift}
            onCompletePhase={handleProceedToSections}
            onBackToKitchens={() => handleSelectStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepSection
            branchId={branch?.id || ""}
            initialSections={sections}
            onAddSection={handleAddSection}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onProceedToEmployees={handleProceedToEmployees}
            onBackToShifts={() => handleSelectStep(3)}
          />
        )}

        {currentStep === 5 && (
          <StepEmployee
            branchId={branch?.id || ""}
            initialEmployees={employees}
            sections={sections}
            shifts={shifts}
            kitchens={kitchens}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onToggleStatus={handleToggleEmployeeStatus}
            onDeleteEmployee={handleDeleteEmployee}
            onProceedToMenu={handleProceedToMenu}
            onBackToSections={() => handleSelectStep(4)}
          />
        )}

        {currentStep === 6 && (
          <StepMenu
            branchId={branch?.id || ""}
            initialCategories={categories}
            initialItems={items}
            initialAddons={addons}
            kitchens={kitchens}
            onAddCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddItem={handleCreateItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onCreateAddon={handleCreateAddon}
            onProceedToTax={handleProceedToTax}
            onBackToEmployees={() => handleSelectStep(5)}
          />
        )}

        {currentStep === 7 && (
          <StepTax
            branchId={branch?.id || ""}
            initialPriceDisplayMode={priceDisplayMode}
            initialTaxRules={taxRules}
            initialPromoCodes={promoCodes}
            initialChargeSettings={chargeSettings}
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
            onCompleteOnboarding={handleCompleteOnboarding}
            onBackToMenu={() => handleSelectStep(6)}
          />
        )}
      </main>
    </div>
  );
}
