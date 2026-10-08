"use client";

import React, { useState, useMemo } from "react";
import { 
  UtensilsCrossed, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  X, 
  Loader2, 
  Clock, 
  Layers, 
  ChefHat, 
  Tag, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  DollarSign,
  PlusCircle,
  HelpCircle,
  FolderPlus,
  Search,
  Power,
  Filter,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { branding } from "@/config/branding";
import UniversalImageCropper from "./universal-image-cropper";
import { 
  type CategoryInput, 
  type ItemInput, 
  type DietaryTag, 
  type UnitType, 
  type PricingType,
  type TimeSlot,
  type AddonInput,
  DIETARY_TAG_CONFIGS,
  UnitTypeEnum
} from "@/lib/onboarding/schemas";

export interface CategoryRecord {
  id: string;
  branch_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_available?: boolean;
  availability?: {
    all_day: boolean;
    days?: string[];
    slots?: TimeSlot[];
    is_available?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ItemRecord {
  id: string;
  category_id: string;
  name: string;
  dietary_tag: DietaryTag;
  description?: string | null;
  assigned_kitchen_id: string;
  image_url?: string | null;
  pricing_type: PricingType;
  base_price: number;
  unit_value?: number | null;
  unit_type?: UnitType | null;
  serving_info?: string | null;
  prep_time_minutes?: number | null;
  packaging_charge?: number;
  out_of_stock?: boolean;
  availability?: {
    all_day: boolean;
    days?: string[];
    slots?: TimeSlot[];
  };
  variations?: {
    id?: string;
    group_name: string;
    options: Array<{
      id?: string;
      label: string;
      unit_value?: number | null;
      unit_type?: UnitType | null;
      serving_info?: string | null;
      price: number;
    }>;
  } | null;
  addon_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AddonRecord {
  id: string;
  branch_id: string;
  name: string;
  price: number;
}

interface StepMenuProps {
  branchId: string;
  initialCategories: CategoryRecord[];
  initialItems: ItemRecord[];
  initialAddons: AddonRecord[];
  kitchens: Array<{ id: string; name: string; type?: string; active?: boolean }>;
  onAddCategory: (data: CategoryInput) => Promise<{ success: boolean; category?: any; error?: string }>;
  onUpdateCategory: (id: string, data: Partial<CategoryInput>) => Promise<{ success: boolean; category?: any; error?: string }>;
  onDeleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  onAddItem: (data: ItemInput) => Promise<{ success: boolean; item?: any; error?: string }>;
  onUpdateItem: (id: string, data: Partial<ItemInput>) => Promise<{ success: boolean; item?: any; error?: string }>;
  onDeleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  onCreateAddon: (data: AddonInput) => Promise<{ success: boolean; addon?: any; error?: string }>;
  onProceedToTax?: () => void;
  onBackToEmployees?: () => void;
  isSettingsMode?: boolean;
}

const DAYS_OF_WEEK = [
  { key: "mon", label: "M", full: "Monday" },
  { key: "tue", label: "T", full: "Tuesday" },
  { key: "wed", label: "W", full: "Wednesday" },
  { key: "thu", label: "T", full: "Thursday" },
  { key: "fri", label: "F", full: "Friday" },
  { key: "sat", label: "S", full: "Saturday" },
  { key: "sun", label: "S", full: "Sunday" },
];

export default function StepMenu({
  branchId,
  initialCategories = [],
  initialItems = [],
  initialAddons = [],
  kitchens = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onCreateAddon,
  onProceedToTax,
  onBackToEmployees,
  isSettingsMode = false,
}: StepMenuProps) {
  // Local entity collections
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);
  const [items, setItems] = useState<ItemRecord[]>(initialItems);
  const [addons, setAddons] = useState<AddonRecord[]>(initialAddons);

  // Active category filter tab (or "all")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategories[0]?.id || "all"
  );

  // Search & Filter state for horizontal spreadsheet directory
  const [viewMode, setViewMode] = useState<"all" | "categories" | "items">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "available" | "oos">("all");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | DietaryTag>("all");
  const [stockTogglingId, setStockTogglingId] = useState<string | null>(null);
  const [categoryTogglingId, setCategoryTogglingId] = useState<string | null>(null);

  // Global action error & gating notification
  const [actionError, setActionError] = useState<string | null>(null);
  const [gatingMessage, setGatingMessage] = useState<string | null>(null);

  // ==========================================
  // CATEGORY DRAWER STATE & HANDLERS
  // ==========================================
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImage, setCatImage] = useState<string | null>(null);
  const [catIsAvailable, setCatIsAvailable] = useState(true);
  const [catAllDay, setCatAllDay] = useState(true);
  const [catDays, setCatDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  const [catSlots, setCatSlots] = useState<TimeSlot[]>([{ start: "11:00", end: "23:00" }]);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const handleOpenCategoryDrawer = (cat?: CategoryRecord) => {
    setActionError(null);
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || "");
      setCatImage(cat.image_url || null);
      setCatIsAvailable(cat.is_available ?? cat.availability?.is_available ?? true);
      setCatAllDay(cat.availability?.all_day ?? true);
      setCatDays(cat.availability?.days || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
      setCatSlots(cat.availability?.slots?.length ? cat.availability.slots : [{ start: "11:00", end: "23:00" }]);
    } else {
      setEditingCategory(null);
      setCatName("");
      setCatDesc("");
      setCatImage(null);
      setCatIsAvailable(true);
      setCatAllDay(true);
      setCatDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
      setCatSlots([{ start: "11:00", end: "23:00" }]);
    }
    setIsCategoryDrawerOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setActionError("Category name is required.");
      return;
    }

    setIsCategorySubmitting(true);
    setActionError(null);

    const payload: CategoryInput = {
      name: catName.trim(),
      description: catDesc.trim() || undefined,
      image_url: catImage || undefined,
      is_available: catIsAvailable,
      availability: {
        all_day: catAllDay,
        days: catAllDay ? ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] : catDays,
        slots: catAllDay ? [] : catSlots,
      },
    };

    try {
      if (editingCategory) {
        const res = await onUpdateCategory(editingCategory.id, payload);
        if (res.success && res.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? res.category : c))
          );
          setIsCategoryDrawerOpen(false);
        } else {
          setActionError(res.error || "Failed to update category.");
        }
      } else {
        const res = await onAddCategory(payload);
        if (res.success && res.category) {
          setCategories((prev) => [...prev, res.category]);
          setSelectedCategoryId(res.category.id);
          setIsCategoryDrawerOpen(false);
          setGatingMessage(null);
        } else {
          setActionError(res.error || "Failed to create category.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleToggleCategoryAvailability = async (cat: CategoryRecord) => {
    const newStatus = !(cat.is_available ?? cat.availability?.is_available ?? true);
    setCategoryTogglingId(cat.id);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === cat.id
          ? {
              ...c,
              is_available: newStatus,
              availability: { ...(c.availability || { all_day: true }), is_available: newStatus },
            }
          : c
      )
    );
    try {
      const res = await onUpdateCategory(cat.id, {
        is_available: newStatus,
      });
      if (!res.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id
              ? {
                  ...c,
                  is_available: !newStatus,
                  availability: { ...(c.availability || { all_day: true }), is_available: !newStatus },
                }
              : c
          )
        );
        setActionError(res.error || "Failed to update category status.");
      }
    } catch (err: any) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === cat.id
            ? {
                ...c,
                is_available: !newStatus,
                availability: { ...(c.availability || { all_day: true }), is_available: !newStatus },
              }
            : c
        )
      );
      setActionError(err?.message || "Failed to update category status.");
    } finally {
      setCategoryTogglingId(null);
    }
  };

  const handleDeleteCategory = async (cat: CategoryRecord) => {
    const confirmed = window.confirm(
      `Delete category "${cat.name}"? This will also archive all items belonging to it.`
    );
    if (!confirmed) return;

    try {
      const res = await onDeleteCategory(cat.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setItems((prev) => prev.filter((it) => it.category_id !== cat.id));
        if (selectedCategoryId === cat.id) {
          setSelectedCategoryId("all");
        }
      } else {
        setActionError(res.error || "Failed to delete category.");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete category.");
    }
  };

  // ==========================================
  // ITEM MODAL STATE & HANDLERS
  // ==========================================
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);

  // Part 1: The Basics
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemDietary, setItemDietary] = useState<DietaryTag>("veg");
  const [itemDesc, setItemDesc] = useState("");
  const [itemKitchen, setItemKitchen] = useState("");
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [itemOutOfStock, setItemOutOfStock] = useState(false);
  const [servingInfo, setServingInfo] = useState("");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | "">(15);

  // Part 2: Pricing & Variations
  const [pricingType, setPricingType] = useState<PricingType>("single");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [unitValue, setUnitValue] = useState<number | "">("");
  const [unitType, setUnitType] = useState<UnitType | "">("");

  // Multiple variations
  const [variationGroupName, setVariationGroupName] = useState("Choose Size");
  const [variationOptions, setVariationOptions] = useState<Array<{
    id?: string;
    label: string;
    unit_value?: number | "";
    unit_type?: UnitType | "";
    serving_info?: string;
    price: number | "";
  }>>([
    { label: "Regular", price: "", serving_info: "" },
    { label: "Large", price: "", serving_info: "" },
  ]);

  // Part 3: Advanced Settings (Accordion)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [packagingCharge, setPackagingCharge] = useState<number | "">("");
  const [overrideAvailability, setOverrideAvailability] = useState(false);
  const [itemDays, setItemDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  const [itemSlots, setItemSlots] = useState<TimeSlot[]>([{ start: "11:00", end: "23:00" }]);

  // Inline quick create add-on state
  const [isCreatingAddon, setIsCreatingAddon] = useState(false);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState<number | "">("");
  const [isItemSubmitting, setIsItemSubmitting] = useState(false);

  const handleOpenItemModal = (item?: ItemRecord, preselectedCatId?: string) => {
    setActionError(null);
    if (categories.length === 0) {
      setActionError("Please create at least one category before adding menu items.");
      setIsCategoryDrawerOpen(true);
      return;
    }

    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCategory(item.category_id);
      setItemDietary(item.dietary_tag);
      setItemDesc(item.description || "");
      setItemKitchen(item.assigned_kitchen_id || kitchens[0]?.id || "");
      setItemImage(item.image_url || null);
      setItemOutOfStock(Boolean(item.out_of_stock));
      setServingInfo(item.serving_info || "");
      setPrepTimeMinutes(item.prep_time_minutes !== undefined && item.prep_time_minutes !== null ? item.prep_time_minutes : 15);

      setPricingType(item.pricing_type || "single");
      setBasePrice(item.base_price ?? "");
      setUnitValue(item.unit_value ?? "");
      setUnitType(item.unit_type ?? "");

      if (item.variations && item.variations.options.length >= 2) {
        setVariationGroupName(item.variations.group_name || "Choose Size");
        setVariationOptions(
          item.variations.options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            unit_value: opt.unit_value ?? "",
            unit_type: opt.unit_type ?? "",
            serving_info: opt.serving_info || "",
            price: opt.price,
          }))
        );
      } else {
        setVariationGroupName("Choose Size");
        setVariationOptions([
          { label: "Regular", price: item.base_price || "", serving_info: item.serving_info || "" },
          { label: "Large", price: "", serving_info: "" },
        ]);
      }

      setSelectedAddonIds(item.addon_ids || []);
      setPackagingCharge(item.packaging_charge ?? "");
      setOverrideAvailability(Boolean(item.availability && !item.availability.all_day));
      setItemDays(item.availability?.days || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
      setItemSlots(item.availability?.slots?.length ? item.availability.slots : [{ start: "11:00", end: "23:00" }]);
    } else {
      setEditingItem(null);
      setItemName("");
      const initialCat = preselectedCatId && preselectedCatId !== "all" 
        ? preselectedCatId 
        : categories[0]?.id || "";
      setItemCategory(initialCat);
      setItemDietary("veg");
      setItemDesc("");
      setItemKitchen(kitchens[0]?.id || "");
      setItemImage(null);
      setItemOutOfStock(false); // Default: Available
      setServingInfo("");
      setPrepTimeMinutes(15);

      setPricingType("single");
      setBasePrice("");
      setUnitValue("");
      setUnitType("");

      setVariationGroupName("Choose Size");
      setVariationOptions([
        { label: "Regular", price: "", serving_info: "" },
        { label: "Large", price: "", serving_info: "" },
      ]);

      setSelectedAddonIds([]);
      setPackagingCharge("");
      setOverrideAvailability(false);
      setItemDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
      setItemSlots([{ start: "11:00", end: "23:00" }]);
      setIsAdvancedOpen(false);
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setActionError("Item name is required.");
      return;
    }
    if (!itemCategory) {
      setActionError("Please select a category for this item.");
      return;
    }
    if (!itemKitchen) {
      setActionError("Please select an assigned kitchen prep station.");
      return;
    }

    if (pricingType === "single" && (basePrice === "" || Number(basePrice) < 0)) {
      setActionError("Please enter a valid price for this item.");
      return;
    }

    if (pricingType === "variable") {
      if (!variationGroupName.trim()) {
        setActionError("Please enter a variation group name (e.g. 'Choose Size').");
        return;
      }
      if (variationOptions.length < 2) {
        setActionError("At least 2 variation options are required for multiple sizes.");
        return;
      }
      for (const opt of variationOptions) {
        if (!opt.label.trim()) {
          setActionError("Each variation option must have a label (e.g. 'Medium').");
          return;
        }
        if (opt.price === "" || Number(opt.price) < 0) {
          setActionError(`Please enter a valid price for option "${opt.label}".`);
          return;
        }
      }
    }

    setIsItemSubmitting(true);
    setActionError(null);

    const payload: ItemInput = {
      name: itemName.trim(),
      category_id: itemCategory,
      dietary_tag: itemDietary,
      description: itemDesc.trim() || undefined,
      assigned_kitchen_id: itemKitchen,
      image_url: itemImage || undefined,
      pricing_type: pricingType,
      base_price: pricingType === "single" ? Number(basePrice) : Number(variationOptions[0]?.price || 0),
      unit_value: unitValue !== "" ? Number(unitValue) : undefined,
      unit_type: unitType ? (unitType as UnitType) : undefined,
      serving_info: servingInfo.trim() || undefined,
      prep_time_minutes: prepTimeMinutes !== "" ? Number(prepTimeMinutes) : 15,
      packaging_charge: packagingCharge !== "" ? Number(packagingCharge) : 0,
      addon_ids: selectedAddonIds,
      override_availability: overrideAvailability,
      out_of_stock: itemOutOfStock,
      availability: overrideAvailability ? {
        all_day: false,
        days: itemDays,
        slots: itemSlots,
      } : undefined,
      variations: pricingType === "variable" ? {
        group_name: variationGroupName.trim(),
        options: variationOptions.map((opt) => ({
          id: opt.id,
          label: opt.label.trim(),
          unit_value: opt.unit_value !== "" ? Number(opt.unit_value) : undefined,
          unit_type: opt.unit_type ? (opt.unit_type as UnitType) : undefined,
          serving_info: opt.serving_info?.trim() || undefined,
          price: Number(opt.price),
        })),
      } : undefined,
    };

    try {
      if (editingItem) {
        const res = await onUpdateItem(editingItem.id, payload);
        if (res.success && res.item) {
          setItems((prev) =>
            prev.map((it) => (it.id === editingItem.id ? res.item : it))
          );
          setIsItemModalOpen(false);
        } else {
          setActionError(res.error || "Failed to update menu item.");
        }
      } else {
        const res = await onAddItem(payload);
        if (res.success && res.item) {
          setItems((prev) => [...prev, res.item]);
          setIsItemModalOpen(false);
          setGatingMessage(null);
        } else {
          setActionError(res.error || "Failed to create menu item.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleToggleItemStock = async (item: ItemRecord) => {
    const newOos = !item.out_of_stock;
    setStockTogglingId(item.id);
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, out_of_stock: newOos } : it))
    );
    try {
      const res = await onUpdateItem(item.id, {
        out_of_stock: newOos,
      });
      if (!res.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, out_of_stock: !newOos } : it))
        );
        setActionError(res.error || "Failed to update item stock status.");
      }
    } catch (err: any) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, out_of_stock: !newOos } : it))
      );
      setActionError(err?.message || "Failed to update item stock status.");
    } finally {
      setStockTogglingId(null);
    }
  };

  const handleDeleteItem = async (item: ItemRecord) => {
    const confirmed = window.confirm(`Archive "${item.name}" from your menu?`);
    if (!confirmed) return;

    try {
      const res = await onDeleteItem(item.id);
      if (res.success) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
      } else {
        setActionError(res.error || "Failed to delete item.");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete item.");
    }
  };

  // Create new addon inline
  const handleCreateNewAddon = async () => {
    if (!newAddonName.trim()) return;
    if (newAddonPrice === "" || Number(newAddonPrice) < 0) return;

    try {
      const res = await onCreateAddon({
        name: newAddonName.trim(),
        price: Number(newAddonPrice),
      });

      if (res.success && res.addon) {
        setAddons((prev) => [...prev, res.addon]);
        setSelectedAddonIds((prev) => [...prev, res.addon.id]);
        setNewAddonName("");
        setNewAddonPrice("");
        setIsCreatingAddon(false);
      }
    } catch (err) {
      console.error("Failed to create addon inline:", err);
    }
  };

  // Toggle Day Selection
  const toggleDaySelection = (days: string[], setDays: React.Dispatch<React.SetStateAction<string[]>>, dayKey: string) => {
    if (days.includes(dayKey)) {
      if (days.length > 1) {
        setDays(days.filter((d) => d !== dayKey));
      }
    } else {
      setDays([...days, dayKey]);
    }
  };

  // Filtered categories based on Search Query and Stock Filter
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const isAvail = cat.is_available ?? cat.availability?.is_available ?? true;
      if (stockFilter === "available" && !isAvail) return false;
      if (stockFilter === "oos" && isAvail) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = cat.name.toLowerCase().includes(q);
        const descMatch = cat.description ? cat.description.toLowerCase().includes(q) : false;
        if (!nameMatch && !descMatch) return false;
      }
      return true;
    });
  }, [categories, searchQuery, stockFilter]);

  // Filtered items based on Category, Search Query, Stock Filter, and Dietary Filter
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // 1. Category tab filter
      if (selectedCategoryId !== "all" && it.category_id !== selectedCategoryId) {
        return false;
      }
      // 2. Stock filter
      if (stockFilter === "available" && it.out_of_stock) {
        return false;
      }
      if (stockFilter === "oos" && !it.out_of_stock) {
        return false;
      }
      // 3. Dietary tag filter
      if (dietaryFilter !== "all" && it.dietary_tag !== dietaryFilter) {
        return false;
      }
      // 4. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cat = categories.find((c) => c.id === it.category_id);
        const nameMatch = it.name.toLowerCase().includes(q);
        const descMatch = it.description ? it.description.toLowerCase().includes(q) : false;
        const catMatch = cat ? cat.name.toLowerCase().includes(q) : false;
        const dietaryMatch = it.dietary_tag.toLowerCase().includes(q);
        const servMatch = it.serving_info ? it.serving_info.toLowerCase().includes(q) : false;
        if (!nameMatch && !descMatch && !catMatch && !dietaryMatch && !servMatch) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategoryId, stockFilter, dietaryFilter, searchQuery, categories]);

  // Forward Gating Check: At least 1 category with >= 1 item
  const hasValidMenu = useMemo(() => {
    if (categories.length === 0 || items.length === 0) return false;
    const catIds = new Set(categories.map((c) => c.id));
    return items.some((it) => catIds.has(it.category_id));
  }, [categories, items]);

  const handleForwardAdvance = () => {
    if (!hasValidMenu) {
      setGatingMessage(
        "At least one category with at least one menu item is required before proceeding to Tax & Compliance."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setGatingMessage(null);
    onProceedToTax?.();
  };

  return (
    <div className="w-full">
      {/* Top Step Banner */}
      <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                {isSettingsMode ? "Menu Catalog & Pricing" : "Step 6: Digital Menu Engineering"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
              Categories, Items, Variations & Pricing
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-brand-text-secondary max-w-2xl">
              Configure your food & beverage catalog. Add categories with custom availability schedules, create items with dietary badges, define multi-portion pricing, and upload square-cropped imagery.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/50 px-4 py-2.5 text-center min-w-[90px]">
              <span className="block text-lg font-black text-brand-secondary">
                {categories.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-wider">
                Categories
              </span>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/50 px-4 py-2.5 text-center min-w-[90px]">
              <span className="block text-lg font-black text-brand-secondary">
                {items.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-wider">
                Menu Items
              </span>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/50 px-4 py-2.5 text-center min-w-[90px]">
              <span className="block text-lg font-black text-brand-secondary">
                {addons.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-wider">
                Add-ons
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gating Error Notice */}
      {gatingMessage && (
        <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-900">Menu Required to Proceed</div>
            <div className="mt-0.5 text-rose-700">{gatingMessage}</div>
          </div>
          <button
            type="button"
            onClick={() => setGatingMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span className="flex-1">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Menu Management Toolbar */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("all")}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${
              selectedCategoryId === "all"
                ? "bg-brand-secondary text-white border-brand-secondary shadow-sm"
                : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Items ({items.length})</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const catItemCount = items.filter((it) => it.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                    : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-brand-surface-muted text-brand-text-muted"
                }`}>
                  {catItemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleOpenCategoryDrawer()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface-muted px-4 py-2 text-xs font-bold text-brand-secondary shadow-sm transition-all"
          >
            <FolderPlus className="h-4 w-4 text-brand-text-muted" />
            <span>Add Category</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenItemModal(undefined, selectedCategoryId)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover px-4 py-2 text-xs font-bold text-white shadow-brandCard transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Active Category Header Card (if a single category is selected) */}
      {selectedCategoryId !== "all" && (
        (() => {
          const cat = categories.find((c) => c.id === selectedCategoryId);
          if (!cat) return null;
          const isCatAvailable = cat.is_available ?? cat.availability?.is_available ?? true;
          const isCatToggling = categoryTogglingId === cat.id;

          return (
            <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {cat.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-12 w-12 rounded-xl object-cover border border-brand-border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-base border border-brand-primary/20">
                    {cat.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-brand-secondary">
                      {cat.name}
                    </h3>

                    {/* Category Stock / Availability Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        isCatAvailable
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isCatAvailable ? "bg-emerald-600" : "bg-amber-500"}`} />
                      <span>{isCatAvailable ? "Available" : "OOS"}</span>
                    </span>

                    {cat.availability?.all_day ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Clock className="h-2.5 w-2.5" />
                        All Day
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                        <Clock className="h-2.5 w-2.5" />
                        Custom Hours ({cat.availability?.slots?.length || 0} slots)
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-brand-text-secondary mt-0.5 max-w-xl line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Category Availability Quick Toggle */}
                <button
                  type="button"
                  disabled={isCatToggling}
                  onClick={() => handleToggleCategoryAvailability(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
                    isCatAvailable
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  } ${isCatToggling ? "opacity-50" : ""}`}
                  title={isCatAvailable ? "Click to set OOS" : "Click to set Available"}
                >
                  {isCatToggling ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Power className="h-3 w-3" />
                  )}
                  <span>{isCatAvailable ? "Available" : "OOS"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCategoryDrawer(cat)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Category</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                  title="Archive category"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })()
      )}

      {/* Directory Section: Search, View Switcher & Horizontal Spreadsheet Tables */}
      <div className="mt-8">
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-secondary">
                Menu Directory & Engineering
              </h3>
              <span className="rounded-full bg-brand-surface-muted border border-brand-border px-2.5 py-0.5 text-xs font-bold text-brand-text-secondary">
                {viewMode === "categories"
                  ? `${filteredCategories.length} categories`
                  : viewMode === "items"
                  ? `${filteredItems.length} dishes`
                  : `${filteredCategories.length} categories · ${filteredItems.length} dishes`}
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Horizontal spreadsheet view of your categories, dishes, capacity, prep times, and instant stock controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* View Mode Switcher: All / Categories / Items */}
            <div className="inline-flex p-1 rounded-xl bg-brand-surface-muted border border-brand-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "all"
                    ? "bg-brand-secondary text-white shadow-xs"
                    : "text-brand-text-secondary hover:text-brand-secondary hover:bg-white/60"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>All ({categories.length + items.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("categories")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "categories"
                    ? "bg-brand-secondary text-white shadow-xs"
                    : "text-brand-text-secondary hover:text-brand-secondary hover:bg-white/60"
                }`}
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Categories ({categories.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("items")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "items"
                    ? "bg-brand-secondary text-white shadow-xs"
                    : "text-brand-text-secondary hover:text-brand-secondary hover:bg-white/60"
                }`}
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>Items ({items.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish, category, capacity, tag..."
                className="w-full rounded-xl border border-brand-border bg-white pl-8 pr-7 py-1.5 text-xs text-brand-text-primary placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
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
        </div>

        {/* Mobile Filter Controls (Dropdowns on small screens) */}
        <div className="flex sm:hidden items-center gap-2 mb-4 p-2.5 rounded-2xl bg-brand-surface-muted/50 border border-brand-border/70 text-xs">
          {/* Stock Filter Mobile Dropdown */}
          <div className="relative flex-1">
            <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">
              Stock
            </label>
            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as "all" | "available" | "oos")}
                aria-label="Filter by Stock Status"
                className={`w-full appearance-none rounded-xl border pl-3 pr-8 py-2 text-xs font-semibold outline-none transition-all shadow-sm ${
                  stockFilter !== "all"
                    ? stockFilter === "available"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30 font-bold"
                      : "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/30 font-bold"
                    : "bg-white text-brand-text-primary border-brand-border focus:border-brand-primary"
                }`}
              >
                <option value="all">
                  All ({viewMode === "categories" ? categories.length : items.length})
                </option>
                <option value="available">
                  Available ({viewMode === "categories"
                    ? categories.filter((c) => (c.is_available ?? c.availability?.is_available ?? true)).length
                    : items.filter((i) => !i.out_of_stock).length})
                </option>
                <option value="oos">
                  OOS ({viewMode === "categories"
                    ? categories.filter((c) => !(c.is_available ?? c.availability?.is_available ?? true)).length
                    : items.filter((i) => i.out_of_stock).length})
                </option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* Diet Filter Mobile Dropdown (when dishes displayed) */}
          {viewMode !== "categories" && (
            <div className="relative flex-1">
              <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                Diet
              </label>
              <div className="relative">
                <select
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value as "all" | DietaryTag)}
                  aria-label="Filter by Dietary Tag"
                  className={`w-full appearance-none rounded-xl border pl-3 pr-8 py-2 text-xs font-semibold outline-none transition-all shadow-sm ${
                    dietaryFilter !== "all"
                      ? "bg-brand-primary-light text-brand-primary border-brand-primary/40 ring-1 ring-brand-primary/30 font-bold"
                      : "bg-white text-brand-text-primary border-brand-border focus:border-brand-primary"
                  }`}
                >
                  <option value="all">All Diets</option>
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non-Veg</option>
                  <option value="egg">Contains Egg</option>
                  <option value="vegan">Vegan</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted">
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Filter Chips Bar (Standard buttons on larger screens) */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-2.5 mb-4 p-2.5 rounded-2xl bg-brand-surface-muted/50 border border-brand-border/70 text-xs">
          {/* Stock Filter Pills (strictly Available / OOS) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mr-1">
              Stock:
            </span>
            <button
              type="button"
              onClick={() => setStockFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                stockFilter === "all"
                  ? "bg-brand-secondary text-white border-brand-secondary"
                  : "bg-white text-brand-text-secondary border-brand-border hover:bg-white"
              }`}
            >
              All ({viewMode === "categories" ? categories.length : items.length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("available")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                stockFilter === "available"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-800 border-brand-border hover:bg-emerald-50"
              }`}
            >
              Available ({viewMode === "categories"
                ? categories.filter((c) => (c.is_available ?? c.availability?.is_available ?? true)).length
                : items.filter((i) => !i.out_of_stock).length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("oos")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                stockFilter === "oos"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-amber-800 border-brand-border hover:bg-amber-50"
              }`}
            >
              OOS ({viewMode === "categories"
                ? categories.filter((c) => !(c.is_available ?? c.availability?.is_available ?? true)).length
                : items.filter((i) => i.out_of_stock).length})
            </button>
          </div>

          {/* Dietary Filter Pills (only when dishes are displayed) */}
          {viewMode !== "categories" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mr-1">
                Diet:
              </span>
              <button
                type="button"
                onClick={() => setDietaryFilter("all")}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border transition-all ${
                  dietaryFilter === "all"
                    ? "bg-brand-secondary text-white border-brand-secondary"
                    : "bg-white text-brand-text-secondary border-brand-border hover:bg-white"
                }`}
              >
                All
              </button>
              {(["veg", "non_veg", "egg", "vegan"] as DietaryTag[]).map((tag) => {
                const cfg = DIETARY_TAG_CONFIGS[tag];
                const isSel = dietaryFilter === tag;
                const label = tag === "egg" ? "Contains Egg" : cfg.label;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDietaryFilter(tag)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold border transition-all ${
                      isSel
                        ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.borderColor} ring-2 ring-brand-primary/20`
                        : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Empty State: No Categories Created Yet */}
        {categories.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-brand-border p-12 text-center bg-white">
            <div className="h-16 w-16 rounded-2xl bg-brand-primary-light text-brand-primary flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-brand-secondary">
              No Categories Created Yet
            </h3>
            <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto">
              Menus start with categories like Starters, Main Course, Drinks, or Desserts. Create your first category to begin adding dishes.
            </p>
            <button
              type="button"
              onClick={() => handleOpenCategoryDrawer()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Category</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. HORIZONTAL CATEGORIES SPREADSHEET TABLE */}
            {(viewMode === "all" || viewMode === "categories") && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary flex items-center gap-1.5">
                      <FolderPlus className="h-3.5 w-3.5 text-brand-primary" />
                      <span>Categories ({filteredCategories.length})</span>
                    </h4>
                    {searchQuery && (
                      <span className="text-[11px] text-brand-text-muted">
                        matching &ldquo;{searchQuery}&rdquo;
                      </span>
                    )}
                  </div>
                  {viewMode === "categories" && (
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryDrawer()}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[11px] font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New Category</span>
                    </button>
                  )}
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-brand-border p-6 text-center bg-white">
                    <p className="text-xs text-brand-text-muted">
                      {searchQuery
                        ? `No categories match "${searchQuery}".`
                        : "No categories match the active filter."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-brand-border bg-white shadow-xs overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto max-h-[380px]">
                      <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead className="sticky top-0 z-10 bg-brand-surface-muted/95 backdrop-blur-sm border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                          <tr>
                            <th scope="col" className="py-2.5 px-4 w-[280px]">
                              Category
                            </th>
                            <th scope="col" className="py-2.5 px-4 w-[120px] text-center">
                              Dishes
                            </th>
                            <th scope="col" className="py-2.5 px-4 w-[180px]">
                              Service Hours
                            </th>
                            <th scope="col" className="py-2.5 px-4 w-[130px] text-center">
                              Status
                            </th>
                            <th scope="col" className="py-2.5 px-4 w-[100px] text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60 text-xs">
                          {filteredCategories.map((cat) => {
                            const isCatAvailable = cat.is_available ?? cat.availability?.is_available ?? true;
                            const isCatToggling = categoryTogglingId === cat.id;
                            const catItemCount = items.filter((it) => it.category_id === cat.id).length;
                            const hasTiming = cat.availability && !cat.availability.all_day && (cat.availability.slots?.length || 0) > 0;

                            return (
                              <tr
                                key={cat.id}
                                className={`transition-colors hover:bg-brand-surface-muted/40 ${
                                  !isCatAvailable ? "bg-amber-50/20 opacity-80" : ""
                                }`}
                              >
                                {/* Category Name & Cover */}
                                <td className="py-2.5 px-4 align-middle">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-9 w-9 shrink-0 rounded-xl overflow-hidden border border-brand-border bg-brand-surface-muted flex items-center justify-center">
                                      {cat.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={cat.image_url}
                                          alt={cat.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <FolderPlus className="h-4 w-4 text-brand-text-muted" />
                                      )}
                                    </div>
                                    <div className="min-w-0 max-w-[220px]">
                                      <div className="font-bold text-brand-secondary truncate text-xs">
                                        {cat.name}
                                      </div>
                                      {cat.description ? (
                                        <div className="text-[10px] text-brand-text-muted line-clamp-1 mt-0.5">
                                          {cat.description}
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-brand-text-muted italic mt-0.5">
                                          No description
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Dish Count */}
                                <td className="py-2.5 px-4 align-middle text-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface-muted px-2.5 py-0.5 text-[11px] font-bold text-brand-secondary border border-brand-border">
                                    {catItemCount} {catItemCount === 1 ? "dish" : "dishes"}
                                  </span>
                                </td>

                                {/* Service Hours */}
                                <td className="py-2.5 px-4 align-middle">
                                  {hasTiming ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200" title="Custom Hours">
                                      <Clock className="h-2.5 w-2.5" />
                                      <span>Timed ({cat.availability?.slots?.length || 0} slots)</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                      <Clock className="h-2.5 w-2.5" />
                                      <span>All Day</span>
                                    </span>
                                  )}
                                </td>

                                {/* Status Quick Toggle (strictly Available / OOS) */}
                                <td className="py-2.5 px-4 align-middle text-center">
                                  <button
                                    type="button"
                                    disabled={isCatToggling}
                                    onClick={() => handleToggleCategoryAvailability(cat)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all border shadow-xs ${
                                      isCatAvailable
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                        : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                                    } ${isCatToggling ? "opacity-50 cursor-wait" : ""}`}
                                    title={isCatAvailable ? "Click to mark OOS" : "Click to mark Available"}
                                  >
                                    {isCatToggling ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <span className={`h-2 w-2 rounded-full ${isCatAvailable ? "bg-emerald-600" : "bg-amber-500"}`} />
                                    )}
                                    <span>{isCatAvailable ? "Available" : "OOS"}</span>
                                  </button>
                                </td>

                                {/* Actions */}
                                <td className="py-2.5 px-4 align-middle text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCategoryDrawer(cat)}
                                      className="p-1.5 rounded-lg border border-brand-border text-brand-secondary hover:bg-brand-surface-muted transition-all"
                                      title="Edit category"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(cat)}
                                      className="p-1.5 rounded-lg border border-brand-border text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                      title="Delete category"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. HORIZONTAL ITEMS SPREADSHEET TABLE */}
            {(viewMode === "all" || viewMode === "items") && (
              <div className="space-y-2.5">
                {viewMode === "all" && (
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary flex items-center gap-1.5">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-brand-primary" />
                      <span>Dishes & Items ({filteredItems.length})</span>
                    </h4>
                  </div>
                )}

                {items.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-brand-border p-10 text-center bg-white">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
                      <UtensilsCrossed className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-secondary">
                      No Dishes or Items Added Yet
                    </h3>
                    <p className="mt-1 text-xs text-brand-text-secondary max-w-sm mx-auto">
                      Add your first dish with pricing, dietary badges, prep kitchen routing, prep time, and serving capacity.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal(undefined, selectedCategoryId)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add First Dish</span>
                    </button>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-brand-border p-10 text-center bg-white">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-secondary">
                      No Dishes Match Your Search or Filters
                    </h3>
                    <p className="mt-1 text-xs text-brand-text-secondary max-w-sm mx-auto">
                      We couldn&apos;t find any dish matching your search query or filter selection.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setStockFilter("all");
                        setDietaryFilter("all");
                        setSelectedCategoryId("all");
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-1.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                    >
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                ) : (
                  /* Spreadsheet / Table Container (~10 rows visible, sticky header, scrollable) */
                  <div className="rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                      <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="sticky top-0 z-10 bg-brand-surface-muted/95 backdrop-blur-sm border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                          <tr>
                            <th scope="col" className="py-3 px-4 w-[240px]">
                              Dish / Item
                            </th>
                            <th scope="col" className="py-3 px-4 w-[130px]">
                              Category
                            </th>
                            <th scope="col" className="py-3 px-4 w-[100px]">
                              Dietary
                            </th>
                            <th scope="col" className="py-3 px-4 w-[130px]">
                              Prep Station
                            </th>
                            <th scope="col" className="py-3 px-4 w-[130px]">
                              Capacity
                            </th>
                            <th scope="col" className="py-3 px-4 w-[100px]">
                              Prep Time
                            </th>
                            <th scope="col" className="py-3 px-4 w-[140px]">
                              Pricing
                            </th>
                            <th scope="col" className="py-3 px-4 w-[130px]">
                              Schedule
                            </th>
                            <th scope="col" className="py-3 px-4 w-[120px] text-center">
                              Status
                            </th>
                            <th scope="col" className="py-3 px-4 w-[90px] text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60 text-xs">
                          {filteredItems.map((item) => {
                            const dietaryConfig = DIETARY_TAG_CONFIGS[item.dietary_tag] || DIETARY_TAG_CONFIGS.veg;
                            const itemCat = categories.find((c) => c.id === item.category_id);
                            const kitchen = kitchens.find((k) => k.id === item.assigned_kitchen_id);
                            const isOos = Boolean(item.out_of_stock);
                            const isToggling = stockTogglingId === item.id;

                            const hasCustomTiming = item.availability && !item.availability.all_day && (item.availability.slots?.length || 0) > 0;
                            const catHasCustomTiming = itemCat?.availability && !itemCat.availability.all_day && (itemCat.availability.slots?.length || 0) > 0;

                            return (
                              <tr
                                key={item.id}
                                className={`transition-colors hover:bg-brand-surface-muted/40 ${
                                  isOos ? "bg-amber-50/20 opacity-80" : ""
                                }`}
                              >
                                {/* 1. Item / Photo */}
                                <td className="py-3 px-4 align-middle">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-brand-border bg-brand-surface-muted flex items-center justify-center">
                                      {item.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={item.image_url}
                                          alt={item.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <UtensilsCrossed className="h-5 w-5 text-brand-text-muted" />
                                      )}
                                    </div>
                                    <div className="min-w-0 max-w-[180px]">
                                      <div className="font-bold text-brand-secondary truncate text-xs">
                                        {item.name}
                                      </div>
                                      {item.description ? (
                                        <div className="text-[10px] text-brand-text-muted line-clamp-1 mt-0.5">
                                          {item.description}
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-brand-text-muted italic mt-0.5">
                                          No description
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* 2. Category */}
                                <td className="py-3 px-4 align-middle">
                                  {itemCat ? (
                                    <div className="flex flex-col items-start gap-0.5">
                                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-surface-muted px-2 py-0.5 text-[11px] font-semibold text-brand-secondary border border-brand-border">
                                        {itemCat.name}
                                      </span>
                                      {(itemCat.is_available === false || itemCat.availability?.is_available === false) && (
                                        <span className="text-[9px] font-bold text-amber-700">
                                          (Category OOS)
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-brand-text-muted italic">Unassigned</span>
                                  )}
                                </td>

                                {/* 3. Dietary */}
                                <td className="py-3 px-4 align-middle">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${dietaryConfig.badgeBg} ${dietaryConfig.badgeText} ${dietaryConfig.borderColor}`}
                                  >
                                    <span className={`h-1.5 w-1.5 rounded-full ${dietaryConfig.dotColor}`} />
                                    <span>{dietaryConfig.label}</span>
                                  </span>
                                </td>

                                {/* 4. Prep Station */}
                                <td className="py-3 px-4 align-middle">
                                  {kitchen ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-800 border border-orange-200/60">
                                      <ChefHat className="h-3 w-3 text-orange-600" />
                                      <span className="truncate max-w-[100px]">{kitchen.name}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-brand-text-muted">-</span>
                                  )}
                                </td>

                                {/* 5. Serving Capacity */}
                                <td className="py-3 px-4 align-middle">
                                  {item.serving_info ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200/60">
                                      <Users className="h-3 w-3 text-blue-600" />
                                      <span className="truncate max-w-[105px]" title={item.serving_info}>
                                        {item.serving_info}
                                      </span>
                                    </span>
                                  ) : item.pricing_type === "variable" && item.variations?.options.some((o) => o.serving_info) ? (
                                    <span
                                      className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200/60"
                                      title={item.variations.options.map((o) => `${o.label}: ${o.serving_info || "-"}`).join(", ")}
                                    >
                                      <Users className="h-3 w-3 text-blue-600" />
                                      <span>Multi-size</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-brand-text-muted">-</span>
                                  )}
                                </td>

                                {/* 6. Prep Time */}
                                <td className="py-3 px-4 align-middle">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-800 border border-purple-200/60">
                                    <Clock className="h-3 w-3 text-purple-600" />
                                    <span>{item.prep_time_minutes || 15}m</span>
                                  </span>
                                </td>

                                {/* 7. Pricing & Variations */}
                                <td className="py-3 px-4 align-middle">
                                  {item.pricing_type === "variable" && item.variations ? (
                                    <div>
                                      <div className="text-xs font-bold text-brand-primary">
                                        ₹{Math.min(...item.variations.options.map((o) => o.price))} – ₹{Math.max(...item.variations.options.map((o) => o.price))}
                                      </div>
                                      <div className="text-[10px] text-brand-text-muted">
                                        {item.variations.options.length} sizes ({item.variations.group_name || "Size"})
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-xs font-bold text-brand-primary">
                                        ₹{item.base_price}
                                        {item.unit_value && item.unit_type && (
                                          <span className="text-[10px] font-normal text-brand-text-muted ml-1">
                                            / {item.unit_value} {item.unit_type}
                                          </span>
                                        )}
                                      </div>
                                      {Number(item.packaging_charge || 0) > 0 && (
                                        <div className="text-[10px] text-blue-700">
                                          +₹{item.packaging_charge} pkg
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* 8. Serving Schedule */}
                                <td className="py-3 px-4 align-middle">
                                  {hasCustomTiming ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200" title="Custom Item Exception">
                                      <Clock className="h-2.5 w-2.5" />
                                      <span>Item Override ({item.availability?.slots?.length || 0})</span>
                                    </span>
                                  ) : catHasCustomTiming ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200" title="Follows Category Hours">
                                      <Clock className="h-2.5 w-2.5" />
                                      <span>Cat Hours ({itemCat?.availability?.slots?.length || 0})</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                      <Clock className="h-2.5 w-2.5" />
                                      <span>All Day</span>
                                    </span>
                                  )}
                                </td>

                                {/* 9. Status (Quick Row Toggle strictly Available / OOS) */}
                                <td className="py-3 px-4 align-middle text-center">
                                  <button
                                    type="button"
                                    disabled={isToggling}
                                    onClick={() => handleToggleItemStock(item)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all border shadow-xs ${
                                      !isOos
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                        : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                                    } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
                                    title={!isOos ? "Click to set OOS" : "Click to set Available"}
                                  >
                                    {isToggling ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <span className={`h-2 w-2 rounded-full ${!isOos ? "bg-emerald-600" : "bg-amber-500"}`} />
                                    )}
                                    <span>{!isOos ? "Available" : "OOS"}</span>
                                  </button>
                                </td>

                                {/* 10. Actions */}
                                <td className="py-3 px-4 align-middle text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenItemModal(item)}
                                      className="p-1.5 rounded-lg border border-brand-border text-brand-secondary hover:bg-brand-surface-muted transition-all"
                                      title="Edit dish"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item)}
                                      className="p-1.5 rounded-lg border border-brand-border text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                      title="Archive dish"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {!isSettingsMode && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border pt-6">
          <button
            type="button"
            onClick={onBackToEmployees}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-5 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Staff & Roles</span>
          </button>

          <button
            type="button"
            onClick={handleForwardAdvance}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-brandCard transition-all w-full sm:w-auto justify-center ${
              hasValidMenu
                ? "bg-brand-primary hover:bg-brand-primary-hover"
                : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            <span>Save & Continue to Tax & Compliance</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. CATEGORY SETUP DRAWER UX (SLIDE-IN)     */}
      {/* ========================================== */}
      <AnimatePresence>
        {isCategoryDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface-muted/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-secondary">
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </h3>
                    <p className="text-xs text-brand-text-secondary">
                      Group dishes for easy customer menu navigation.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="rounded-xl p-1.5 text-brand-text-muted hover:bg-brand-surface-muted hover:text-brand-secondary transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-bold text-brand-text-primary mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Starters, Main Course, Mocktails"
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Category Description */}
                <div>
                  <label className="block text-xs font-bold text-brand-text-primary mb-1">
                    Description <span className="text-brand-text-muted font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="e.g. Freshly cooked appetisers and sizzling tandoori starters."
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* Category Image using UniversalImageCropper */}
                <div>
                  <UniversalImageCropper
                    value={catImage}
                    onChange={(url) => setCatImage(url)}
                    onRemove={() => setCatImage(null)}
                    label="Category Banner Image"
                    description="Upload a high-quality photo for this category. Auto-compressed to 150KB - 250KB."
                  />
                </div>

                {/* Availability Section */}
                <div className="border-t border-brand-border/60 pt-5 space-y-4">
                  {/* Category Status Toggle (strictly Available / OOS) */}
                  <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-brand-secondary flex items-center gap-2">
                        <span>Category Status</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            catIsAvailable ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              catIsAvailable ? "bg-emerald-600" : "bg-amber-600"
                            }`}
                          />
                          {catIsAvailable ? "Available" : "OOS"}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-text-muted mt-0.5">
                        {catIsAvailable
                          ? "Category is visible to customers on the digital menu (during its active schedule)."
                          : "Category marked OOS. Hidden from customer menu until toggled back on."}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCatIsAvailable(!catIsAvailable)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        catIsAvailable ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                      title={catIsAvailable ? "Click to set OOS" : "Click to set Available"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          catIsAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Category Schedule (All Day vs Custom) */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-xs font-bold text-brand-text-primary">
                        Available All Day & Every Day
                      </div>
                      <div className="text-[11px] text-brand-text-muted">
                        Customers can order items in this category at any hour.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCatAllDay(!catAllDay)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        catAllDay ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          catAllDay ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Custom Schedule controls when OFF */}
                  {!catAllDay && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border border-brand-border bg-brand-surface-muted/50 p-4 space-y-4"
                    >
                      {/* Day selector pills */}
                      <div>
                        <label className="block text-[11px] font-bold text-brand-text-secondary mb-1.5">
                          Active Days of the Week
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {DAYS_OF_WEEK.map((d) => {
                            const isSelected = catDays.includes(d.key);
                            return (
                              <button
                                key={d.key}
                                type="button"
                                onClick={() => toggleDaySelection(catDays, setCatDays, d.key)}
                                className={`h-8 w-8 rounded-lg text-xs font-bold border transition-all ${
                                  isSelected
                                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                                    : "bg-white text-brand-text-secondary border-brand-border hover:bg-gray-100"
                                }`}
                                title={d.full}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slots (Split hours support) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-brand-text-secondary">
                            Service Time Slots
                          </label>
                          <button
                            type="button"
                            onClick={() => setCatSlots([...catSlots, { start: "18:00", end: "23:00" }])}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Split Slot</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {catSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="time"
                                required
                                value={slot.start}
                                onChange={(e) => {
                                  const updated = [...catSlots];
                                  updated[index].start = e.target.value;
                                  setCatSlots(updated);
                                }}
                                className="rounded-xl border border-brand-border bg-white px-2.5 py-1.5 text-xs font-mono text-brand-text-primary outline-none focus:border-brand-primary"
                              />
                              <span className="text-xs text-brand-text-muted">to</span>
                              <input
                                type="time"
                                required
                                value={slot.end}
                                onChange={(e) => {
                                  const updated = [...catSlots];
                                  updated[index].end = e.target.value;
                                  setCatSlots(updated);
                                }}
                                className="rounded-xl border border-brand-border bg-white px-2.5 py-1.5 text-xs font-mono text-brand-text-primary outline-none focus:border-brand-primary"
                              />

                              {catSlots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setCatSlots(catSlots.filter((_, i) => i !== index))}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                                  title="Remove slot"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDrawerOpen(false)}
                    className="rounded-xl border border-brand-border px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCategorySubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover disabled:opacity-50 transition-all"
                  >
                    {isCategorySubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{editingCategory ? "Save Category Changes" : "Save Category"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 3. ITEM SETUP MODAL UX (PROGRESSIVE)       */}
      {/* ========================================== */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl border border-brand-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface-muted/30 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-secondary">
                      {editingItem ? "Edit Menu Item" : "Add Menu Item"}
                    </h3>
                    <p className="text-xs text-brand-text-secondary">
                      Configure dish identity, portion sizing, and prep routing.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="rounded-xl p-1.5 text-brand-text-muted hover:bg-brand-surface-muted hover:text-brand-secondary transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Form */}
              <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 🟢 PART 1: THE BASICS (ALWAYS OPEN) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Part 1: The Basics (Required)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Item Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-brand-text-primary mb-1">
                        Item Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g. Paneer Butter Masala, Cold Coffee"
                        className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-bold text-brand-text-primary mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-semibold text-brand-secondary focus:border-brand-primary outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned Kitchen */}
                    <div>
                      <label className="block text-xs font-bold text-brand-text-primary mb-1">
                        Assigned Kitchen / Prep Station <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={itemKitchen}
                        onChange={(e) => setItemKitchen(e.target.value)}
                        className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-semibold text-brand-secondary focus:border-brand-primary outline-none"
                      >
                        {kitchens.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.name} ({k.type || "Kitchen"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dietary Tag: Single-Select Pills */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-brand-text-primary mb-1.5">
                        Dietary Classification <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(Object.entries(DIETARY_TAG_CONFIGS) as [DietaryTag, any][]).map(([tag, config]) => {
                          const isSelected = itemDietary === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setItemDietary(tag)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                                isSelected
                                  ? `${config.badgeBg} ${config.badgeText} ${config.borderColor} ring-2 ring-brand-primary/20 shadow-sm`
                                  : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
                              }`}
                            >
                              <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                              <span>{config.label}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description with Live Character Count (max 250) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-brand-text-primary">
                          Item Description
                        </label>
                        <span className={`text-[11px] font-mono ${itemDesc.length > 240 ? "text-rose-500 font-bold" : "text-brand-text-muted"}`}>
                          {itemDesc.length} / 250
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={250}
                        value={itemDesc}
                        onChange={(e) => setItemDesc(e.target.value)}
                        placeholder="Detail the ingredients, aroma, or spices. Good descriptions help customers decide faster."
                        className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Preparation Time & Serving Capacity (Side by Side) */}
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Preparation Time */}
                      <div>
                        <label className="block text-xs font-bold text-brand-text-primary mb-1">
                          Preparation Time (Minutes) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-muted" />
                          <input
                            type="number"
                            min="1"
                            max="360"
                            required
                            value={prepTimeMinutes}
                            onChange={(e) => setPrepTimeMinutes(e.target.value === "" ? "" : parseInt(e.target.value))}
                            placeholder="e.g. 15"
                            className="w-full rounded-xl border border-brand-border bg-white pl-9 pr-12 py-2 text-xs font-bold text-brand-secondary focus:border-brand-primary outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-semibold text-brand-text-muted">
                            mins
                          </span>
                        </div>
                        {/* Quick Preset Pills */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {[10, 15, 20, 30, 45].map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setPrepTimeMinutes(mins)}
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition-all ${
                                prepTimeMinutes === mins
                                  ? "bg-brand-secondary text-white border-brand-secondary"
                                  : "bg-brand-surface-muted/60 text-brand-text-secondary border-brand-border hover:bg-white"
                              }`}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-brand-text-muted mt-1">
                          Average kitchen preparation time before dispatch.
                        </p>
                      </div>

                      {/* Serving Capacity */}
                      <div>
                        <label className="block text-xs font-bold text-brand-text-primary mb-1">
                          Serving Capacity (Portion Size)
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-muted" />
                          <input
                            type="text"
                            maxLength={100}
                            value={servingInfo}
                            onChange={(e) => setServingInfo(e.target.value)}
                            placeholder="e.g. 1 person, 1-2 people, 2-3 people"
                            className="w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 py-2 text-xs font-semibold text-brand-secondary focus:border-brand-primary outline-none"
                          />
                        </div>
                        {/* Quick Preset Pills */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {["1 person", "1-2 people", "2-3 people", "3-4 people", "4+ people"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setServingInfo(preset)}
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition-all ${
                                servingInfo === preset
                                  ? "bg-brand-secondary text-white border-brand-secondary"
                                  : "bg-brand-surface-muted/60 text-brand-text-secondary border-brand-border hover:bg-white"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-brand-text-muted mt-1">
                          Indicates how many people this portion serves.
                        </p>
                      </div>
                    </div>

                    {/* Image Upload with Universal Cropper */}
                    <div className="sm:col-span-2">
                      <UniversalImageCropper
                        value={itemImage}
                        onChange={(url) => setItemImage(url)}
                        onRemove={() => setItemImage(null)}
                        label="Item Photo (1:1 Square)"
                        description="Drag & drop dish photo. Automatically cropped to 1:1 and compressed to 150KB - 250KB."
                      />
                    </div>

                    {/* Stock Status Toggle (strictly Available / OOS) */}
                    <div className="sm:col-span-2 rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-brand-secondary flex items-center gap-2">
                          <span>Stock Status</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              !itemOutOfStock ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                !itemOutOfStock ? "bg-emerald-600" : "bg-amber-600"
                              }`}
                            />
                            {!itemOutOfStock ? "Available" : "OOS"}
                          </span>
                        </div>
                        <div className="text-[11px] text-brand-text-muted mt-0.5">
                          {!itemOutOfStock
                            ? "Dish is in stock and orderable by customers during service hours."
                            : "Dish marked OOS. Hidden from customer ordering until toggled back on."}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItemOutOfStock(!itemOutOfStock)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          !itemOutOfStock ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                        title={!itemOutOfStock ? "Click to set OOS" : "Click to set Available"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            !itemOutOfStock ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 🔵 PART 2: PRICING, UNITS & VARIATIONS (CORE LOGIC, ALWAYS VISIBLE) */}
                <div className="border-t border-brand-border/60 pt-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-blue-700" />
                    Part 2: Pricing, Units & Variations
                  </h4>

                  {/* Radio choice: Single Option vs. Multiple Variations */}
                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-2">
                      How is this item sold?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPricingType("single")}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                          pricingType === "single"
                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                            : "border-brand-border bg-white hover:bg-brand-surface-muted/40"
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${
                          pricingType === "single" ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                        }`}>
                          {pricingType === "single" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-brand-secondary">
                            Single Option
                          </div>
                          <div className="text-[11px] text-brand-text-muted mt-0.5">
                            Standard price (e.g. Burger, Paneer Tikka plate).
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPricingType("variable")}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                          pricingType === "variable"
                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                            : "border-brand-border bg-white hover:bg-brand-surface-muted/40"
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${
                          pricingType === "variable" ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                        }`}>
                          {pricingType === "variable" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-brand-secondary">
                            Multiple Sizes / Variations
                          </div>
                          <div className="text-[11px] text-brand-text-muted mt-0.5">
                            Customer chooses portion (e.g. Half / Full, 9&quot; vs 12&quot;).
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Single Option Input */}
                  {pricingType === "single" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-brand-border bg-brand-surface-muted/30 p-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-text-primary mb-1">
                          Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-brand-text-muted">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            required
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                            placeholder="199"
                            className="w-full rounded-xl border border-brand-border bg-white pl-7 pr-3 py-2 text-xs font-bold text-brand-secondary outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-text-primary mb-1">
                          Quantity / Value <span className="text-brand-text-muted font-normal">(Opt)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={unitValue}
                          onChange={(e) => setUnitValue(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          placeholder="e.g. 250"
                          className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-text-primary mb-1">
                          Measurement Unit
                        </label>
                        <select
                          value={unitType}
                          onChange={(e) => setUnitType(e.target.value as UnitType)}
                          className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                        >
                          <option value="">No unit</option>
                          {UnitTypeEnum.options.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: Multiple Sizes / Variations Table Builder */
                    <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/30 p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-brand-text-primary mb-1">
                          Variation Group Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={variationGroupName}
                          onChange={(e) => setVariationGroupName(e.target.value)}
                          placeholder="e.g. Choose Size, Portion, Crust"
                          className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-text-primary outline-none focus:border-brand-primary font-semibold"
                        />
                      </div>

                      {/* Row-based table builder with Capacity */}
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-brand-text-muted px-1">
                          <span className="col-span-4">Option Label (e.g. Medium)</span>
                          <span className="col-span-3">Capacity (e.g. 1-2 people)</span>
                          <span className="col-span-2">Unit (Opt)</span>
                          <span className="col-span-2">Price (₹)</span>
                          <span className="col-span-1 text-center"></span>
                        </div>

                        {variationOptions.map((opt, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <input
                                type="text"
                                required
                                value={opt.label}
                                onChange={(e) => {
                                  const updated = [...variationOptions];
                                  updated[idx].label = e.target.value;
                                  setVariationOptions(updated);
                                }}
                                placeholder="e.g. Half / Regular"
                                className="w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                              />
                            </div>

                            <div className="col-span-3">
                              <input
                                type="text"
                                maxLength={100}
                                value={opt.serving_info || ""}
                                onChange={(e) => {
                                  const updated = [...variationOptions];
                                  updated[idx].serving_info = e.target.value;
                                  setVariationOptions(updated);
                                }}
                                placeholder="e.g. 1-2 people"
                                className="w-full rounded-xl border border-brand-border bg-white px-2.5 py-1.5 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                              />
                            </div>

                            <div className="col-span-2 flex gap-1">
                              <input
                                type="number"
                                min="0"
                                value={opt.unit_value}
                                onChange={(e) => {
                                  const updated = [...variationOptions];
                                  updated[idx].unit_value = e.target.value === "" ? "" : parseFloat(e.target.value);
                                  setVariationOptions(updated);
                                }}
                                placeholder="Val"
                                className="w-1/2 rounded-xl border border-brand-border bg-white px-1.5 py-1.5 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                              />
                              <select
                                value={opt.unit_type}
                                onChange={(e) => {
                                  const updated = [...variationOptions];
                                  updated[idx].unit_type = e.target.value as UnitType;
                                  setVariationOptions(updated);
                                }}
                                className="w-1/2 rounded-xl border border-brand-border bg-white px-1 py-1.5 text-[10px] text-brand-text-primary outline-none focus:border-brand-primary"
                              >
                                <option value="">-</option>
                                {UnitTypeEnum.options.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-span-2 relative">
                              <span className="absolute left-2.5 top-2 text-[11px] text-brand-text-muted">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                required
                                value={opt.price}
                                onChange={(e) => {
                                  const updated = [...variationOptions];
                                  updated[idx].price = e.target.value === "" ? "" : parseFloat(e.target.value);
                                  setVariationOptions(updated);
                                }}
                                placeholder="199"
                                className="w-full rounded-xl border border-brand-border bg-white pl-6 pr-2 py-1.5 text-xs font-bold text-brand-secondary outline-none focus:border-brand-primary"
                              />
                            </div>

                            <div className="col-span-1 flex justify-center">
                              {variationOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => setVariationOptions(variationOptions.filter((_, i) => i !== idx))}
                                  className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                                  title="Remove option"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setVariationOptions([
                              ...variationOptions,
                              { label: "", price: "", serving_info: "" },
                            ])
                          }
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Add Another Size / Variation</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🟠 PART 3: ADVANCED SETTINGS (ACCORDION, COLLAPSED BY DEFAULT) */}
                <div className="border-t border-brand-border/60 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-brand-surface-muted/60 hover:bg-brand-surface-muted text-left transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300">
                        Part 3: Advanced
                      </span>
                      <span className="text-xs font-bold text-brand-secondary">
                        Add-ons, Packaging Charges & Custom Hours
                      </span>
                    </div>
                    {isAdvancedOpen ? (
                      <ChevronDown className="h-4 w-4 text-brand-text-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-brand-text-muted" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isAdvancedOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-5 pt-4 px-1"
                      >
                        {/* Packaging Charge */}
                        <div>
                          <label className="block text-xs font-bold text-brand-text-primary mb-1">
                            Packaging Charge (₹ per item)
                          </label>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3 top-2.5 text-xs text-brand-text-muted">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={packagingCharge}
                              onChange={(e) => setPackagingCharge(e.target.value === "" ? "" : parseFloat(e.target.value))}
                              placeholder="0"
                              className="w-full rounded-xl border border-brand-border bg-white pl-7 pr-3 py-2 text-xs text-brand-text-primary outline-none focus:border-brand-primary"
                            />
                          </div>
                          <span className="text-[11px] text-brand-text-muted mt-1 block">
                            Fee captured for containers/takeaway. Tax rules will link to this in Step 7.
                          </span>
                        </div>

                        {/* Add-ons & Customizations Builder */}
                        <div className="border-t border-brand-border/50 pt-4 space-y-3">
                          <div>
                            <label className="text-xs font-bold text-brand-text-primary">
                              Add-ons & Customizations
                            </label>
                            <p className="text-[11px] text-brand-text-muted">
                              Add custom toppings, dips, or extras with specific pricing from scratch.
                            </p>
                          </div>

                          {/* Manual Custom Add-on Input Row */}
                          <div className="rounded-2xl border border-purple-200/80 bg-purple-50/60 p-3 flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="text"
                              value={newAddonName}
                              onChange={(e) => setNewAddonName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleCreateNewAddon();
                                }
                              }}
                              placeholder="Add-on Name (e.g. Extra Cheese, Garlic Dip)"
                              className="w-full sm:flex-1 rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-text-primary outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30"
                            />
                            <div className="relative w-full sm:w-28">
                              <span className="absolute left-2.5 top-1.5 text-xs font-bold text-brand-text-muted">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={newAddonPrice}
                                onChange={(e) => setNewAddonPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCreateNewAddon();
                                  }
                                }}
                                placeholder="Price"
                                className="w-full rounded-xl border border-brand-border bg-white pl-6 pr-2 py-1.5 text-xs font-bold text-brand-text-primary outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleCreateNewAddon}
                              disabled={!newAddonName.trim() || newAddonPrice === ""}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add Add-on</span>
                            </button>
                          </div>

                          {/* Configured Custom Add-ons for this dish */}
                          {selectedAddonIds.length === 0 ? (
                            <p className="text-xs text-brand-text-muted italic py-1">
                              No custom add-ons added yet. Add custom add-ons above with your own pricing.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">
                                Added Custom Add-ons ({selectedAddonIds.length})
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {selectedAddonIds.map((id) => {
                                  const add = addons.find((a) => a.id === id);
                                  if (!add) return null;
                                  return (
                                    <div
                                      key={add.id}
                                      className="inline-flex items-center gap-2 rounded-xl bg-purple-100/80 border border-purple-300 px-3 py-1.5 text-xs font-semibold text-purple-900 shadow-sm"
                                    >
                                      <span>{add.name}</span>
                                      <span className="text-purple-700 font-bold">(+₹{add.price})</span>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedAddonIds((prev) => prev.filter((itemAddonId) => itemAddonId !== add.id))}
                                        title="Remove add-on from dish"
                                        className="ml-1 text-purple-400 hover:text-rose-600 transition-colors"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Item Availability Override */}
                        <div className="border-t border-brand-border/50 pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-brand-text-primary">
                                Custom Hours for this Dish
                              </div>
                              <div className="text-[11px] text-brand-text-muted">
                                Only enable if this dish is served at different hours than its parent category.
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOverrideAvailability(!overrideAvailability)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                overrideAvailability ? "bg-amber-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  overrideAvailability ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {overrideAvailability && (
                            <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/50 p-4 space-y-3">
                              <div>
                                <label className="block text-[11px] font-bold text-brand-text-secondary mb-1">
                                  Days Available
                                </label>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {DAYS_OF_WEEK.map((d) => {
                                    const isSelected = itemDays.includes(d.key);
                                    return (
                                      <button
                                        key={d.key}
                                        type="button"
                                        onClick={() => toggleDaySelection(itemDays, setItemDays, d.key)}
                                        className={`h-7 w-7 rounded-lg text-xs font-bold border transition-all ${
                                          isSelected
                                            ? "bg-amber-600 text-white border-amber-600"
                                            : "bg-white text-brand-text-secondary border-brand-border"
                                        }`}
                                      >
                                        {d.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-brand-text-secondary mb-1">
                                  Service Window
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    value={itemSlots[0]?.start || "11:00"}
                                    onChange={(e) => setItemSlots([{ start: e.target.value, end: itemSlots[0]?.end || "23:00" }])}
                                    className="rounded-xl border border-brand-border bg-white px-2 py-1 text-xs font-mono"
                                  />
                                  <span className="text-xs text-brand-text-muted">to</span>
                                  <input
                                    type="time"
                                    value={itemSlots[0]?.end || "23:00"}
                                    onChange={(e) => setItemSlots([{ start: itemSlots[0]?.start || "11:00", end: e.target.value }])}
                                    className="rounded-xl border border-brand-border bg-white px-2 py-1 text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="rounded-xl border border-brand-border px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isItemSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover disabled:opacity-50 transition-all"
                  >
                    {isItemSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{editingItem ? "Save Item Changes" : "Save Menu Item"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
