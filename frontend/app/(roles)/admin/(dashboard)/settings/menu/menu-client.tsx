"use client";

import React, { useState } from "react";
import StepMenu from "@/components/onboarding/step-menu";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  createItem, 
  updateItem, 
  deleteItem, 
  createAddon 
} from "@/app/actions/onboarding-actions";
import type { CategoryInput, ItemInput, AddonInput } from "@/lib/onboarding/schemas";

interface MenuClientProps {
  branchId: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  initialCategories: any[];
  initialItems: any[];
  initialAddons: any[];
  kitchens: any[];
}

export default function MenuClient({
  branchId,
  branchName,
  branches,
  initialCategories,
  initialItems,
  initialAddons,
  kitchens,
}: MenuClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [addons, setAddons] = useState(initialAddons);

  // Category Handlers
  const handleAddCategory = async (data: CategoryInput) => {
    const res = await createCategory(branchId, data);
    if (res.success && res.category) {
      setCategories((prev) => [...prev, res.category]);
    }
    return res;
  };

  const handleUpdateCategory = async (id: string, data: Partial<CategoryInput>) => {
    const res = await updateCategory(id, data);
    if (res.success && res.category) {
      setCategories((prev) => prev.map((c) => (c.id === id ? res.category : c)));
    }
    return res;
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await deleteCategory(id);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setItems((prev) => prev.filter((i) => i.category_id !== id));
    }
    return res;
  };

  // Item Handlers
  const handleAddItem = async (data: ItemInput) => {
    const res = await createItem(branchId, data);
    if (res.success && res.item) {
      setItems((prev) => [...prev, res.item]);
    }
    return res;
  };

  const handleUpdateItem = async (id: string, data: Partial<ItemInput>) => {
    const res = await updateItem(id, data);
    if (res.success && res.item) {
      setItems((prev) => prev.map((i) => (i.id === id ? res.item : i)));
    }
    return res;
  };

  const handleDeleteItem = async (id: string) => {
    const res = await deleteItem(id);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    return res;
  };

  // Addon Handler
  const handleCreateAddon = async (data: AddonInput) => {
    const res = await createAddon(branchId, data);
    if (res.success && res.addon) {
      setAddons((prev) => [...prev, res.addon]);
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Menu Catalog Engineering
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branchName}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Organize food categories, items, dietary classifications, pricing, addons, and prep stations.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branchId}
              onChange={(e) => {
                window.location.href = `/admin/settings/menu?branchId=${e.target.value}`;
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

      <StepMenu
        branchId={branchId}
        initialCategories={categories}
        initialItems={items}
        initialAddons={addons}
        kitchens={kitchens}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onCreateAddon={handleCreateAddon}
        isSettingsMode={true}
      />
    </div>
  );
}
