"use client";

import React, { useState, useMemo } from "react";
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Flame, 
  Receipt, 
  Sparkles, 
  Check, 
  ArrowLeft,
  Bike,
  UtensilsCrossed,
  Clock,
  AlertCircle
} from "lucide-react";
import { branding } from "@/config/branding";
import { 
  OperationsMenuItem, 
  addOrderToSession, 
  createDraftBill 
} from "@/app/actions/operations-tables-actions";

export interface AddItemsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "draft" | "live_fire";
  categories: Array<{ id: string; name: string; is_available: boolean }>;
  menuItems: OperationsMenuItem[];
  branchId: string;
  tableSessionId?: string;
  tableLabels?: string[];
  onOrderFired?: () => void;
  onDraftBillCreated?: (billNumber: string) => void;
}

interface CartItem {
  id: string; // unique cart key (itemId + variationId)
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  variationId?: string | null;
  variationName?: string;
  addons?: Array<{ id: string; name: string; price: number }>;
  notes?: string;
  dietary_tag: string;
}

export default function AddItemsPanel({
  isOpen,
  onClose,
  mode,
  categories,
  menuItems,
  branchId,
  tableSessionId,
  tableLabels = [],
  onOrderFired,
  onDraftBillCreated,
}: AddItemsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedDiet, setSelectedDiet] = useState<string>("all");

  // Cart state
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Draft mode specific fields
  const [orderType, setOrderType] = useState<"takeaway" | "delivery">("takeaway");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Customizer modal state for items with variations/addons
  const [customizingItem, setCustomizingItem] = useState<OperationsMenuItem | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [customItemNotes, setCustomItemNotes] = useState("");

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategoryId !== "all" && item.category_id !== selectedCategoryId) {
        return false;
      }
      if (selectedDiet !== "all" && item.dietary_tag !== selectedDiet) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, selectedDiet, searchQuery]);

  // Cart summary calculations
  const cartItemsList = Object.values(cart);
  const totalItemCount = cartItemsList.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItemsList.reduce((sum, item) => {
    const addonsTotal = (item.addons || []).reduce((aSum, a) => aSum + a.price, 0);
    return sum + (item.price + addonsTotal) * item.quantity;
  }, 0);
  const estimatedTax = mode === "draft" ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const grandTotal = subtotal + estimatedTax;

  const handleQuickAdd = (item: OperationsMenuItem) => {
    // If item has variations or addons, open customizer
    if (item.variations.length > 0 || item.addons.length > 0) {
      setCustomizingItem(item);
      setSelectedVariationId(item.variations[0]?.id || null);
      setSelectedAddonIds([]);
      setCustomItemNotes("");
      return;
    }

    // Direct single item add
    const cartKey = item.id;
    setCart((prev) => {
      const existing = prev[cartKey];
      if (existing) {
        return {
          ...prev,
          [cartKey]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [cartKey]: {
          id: cartKey,
          itemId: item.id,
          name: item.name,
          price: item.base_price,
          quantity: 1,
          dietary_tag: item.dietary_tag,
        },
      };
    });
  };

  const handleCustomizerSave = () => {
    if (!customizingItem) return;

    let chosenPrice = customizingItem.base_price;
    let chosenVariationName: string | undefined = undefined;

    if (selectedVariationId) {
      const v = customizingItem.variations.find((varOpt) => varOpt.id === selectedVariationId);
      if (v) {
        chosenPrice = v.price;
        chosenVariationName = v.name;
      }
    }

    const chosenAddons = customizingItem.addons.filter((a) => selectedAddonIds.includes(a.id));
    const cartKey = `${customizingItem.id}-${selectedVariationId || "single"}-${selectedAddonIds.sort().join("-")}`;

    setCart((prev) => {
      const existing = prev[cartKey];
      if (existing) {
        return {
          ...prev,
          [cartKey]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [cartKey]: {
          id: cartKey,
          itemId: customizingItem.id,
          name: customizingItem.name,
          price: chosenPrice,
          quantity: 1,
          variationId: selectedVariationId,
          variationName: chosenVariationName,
          addons: chosenAddons,
          notes: customItemNotes.trim() || undefined,
          dietary_tag: customizingItem.dietary_tag,
        },
      };
    });

    setCustomizingItem(null);
  };

  const updateCartQuantity = (cartKey: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const nextState = { ...prev };
        delete nextState[cartKey];
        return nextState;
      }
      return {
        ...prev,
        [cartKey]: { ...existing, quantity: nextQty },
      };
    });
  };

  // Submit Handler: Live-Fire Mode
  const handleFireOrder = async () => {
    if (!tableSessionId || cartItemsList.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const itemsPayload = cartItemsList.map((c) => ({
      itemId: c.itemId,
      variationId: c.variationId,
      quantity: c.quantity,
      price: c.price + (c.addons?.reduce((s, a) => s + a.price, 0) || 0),
      notes: [c.variationName, c.addons?.map((a) => a.name).join(", "), c.notes]
        .filter(Boolean)
        .join(" | "),
    }));

    const result = await addOrderToSession(tableSessionId, itemsPayload);
    setIsSubmitting(false);

    if (result.success) {
      setCart({});
      setIsReviewOpen(false);
      onOrderFired?.();
      onClose();
    } else {
      setErrorMessage(result.error || "Failed to fire order");
    }
  };

  // Submit Handler: Draft Mode (New Bill)
  const handleFinalizeDraftBill = async () => {
    if (cartItemsList.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const itemsPayload = cartItemsList.map((c) => ({
      itemId: c.itemId,
      variationId: c.variationId,
      quantity: c.quantity,
      price: c.price + (c.addons?.reduce((s, a) => s + a.price, 0) || 0),
      notes: [c.variationName, c.addons?.map((a) => a.name).join(", "), c.notes]
        .filter(Boolean)
        .join(" | "),
    }));

    const result = await createDraftBill(
      branchId,
      orderType,
      itemsPayload,
      { name: customerName.trim(), phone: customerPhone.trim() },
      orderNotes.trim()
    );

    setIsSubmitting(false);

    if (result.success) {
      setCart({});
      setIsReviewOpen(false);
      onDraftBillCreated?.(result.billNumber || "BILL");
      onClose();
    } else {
      setErrorMessage(result.error || "Failed to finalize bill");
    }
  };

  // Keyboard shortcut: Escape to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    >
      {/* Side Panel: 100% on mobile, 450px to 540px on tablet/desktop */}
      <div className="w-full md:w-[480px] lg:w-[540px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* PANEL HEADER */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface-muted/60 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {mode === "live_fire" ? (
                <>
                  <div className="p-2 rounded-xl bg-orange-100 text-brand-primary">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-brand-secondary">
                      Add Order — {tableLabels.length > 0 ? tableLabels.join(", ") : "Table"}
                    </h2>
                    <p className="text-xs text-brand-text-muted">
                      Fires immediately to kitchen on submit
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-brand-secondary">
                      New Bill (No Table Session)
                    </h2>
                    <p className="text-xs text-brand-text-muted">
                      Draft cart reviewed before finalizing order + bill
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DRAFT MODE ORDER TYPE SELECTOR */}
        {mode === "draft" && !isReviewOpen && (
          <div className="p-3 bg-brand-background border-b border-brand-border flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOrderType("takeaway")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                orderType === "takeaway"
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Takeaway / Counter</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                orderType === "delivery"
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              <Bike className="h-4 w-4" />
              <span>Direct Delivery</span>
            </button>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="m-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MAIN BODY: MENU BROWSER OR CART REVIEW */}
        {!isReviewOpen ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* SEARCH & FILTERS */}
            <div className="p-3 sm:p-4 border-b border-brand-border space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted" />
                <input
                  type="text"
                  placeholder="Search dishes or items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-brand-surface-muted/50 text-xs text-brand-secondary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("all")}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedCategoryId === "all"
                      ? "bg-brand-secondary text-white"
                      : "bg-brand-surface-muted text-brand-text-secondary hover:bg-brand-border"
                  }`}
                >
                  All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                      selectedCategoryId === c.id
                        ? "bg-brand-secondary text-white"
                        : "bg-brand-surface-muted text-brand-text-secondary hover:bg-brand-border"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* DIETARY FILTER CHIPS */}
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDiet("all")}
                  className={`px-2.5 py-0.5 rounded-lg border font-bold ${
                    selectedDiet === "all"
                      ? "border-brand-secondary bg-brand-secondary/5 text-brand-secondary"
                      : "border-brand-border text-brand-text-muted hover:border-brand-text-secondary"
                  }`}
                >
                  All Diet
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDiet("veg")}
                  className={`px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
                    selectedDiet === "veg"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-brand-border text-brand-text-muted hover:border-emerald-500"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDiet("non_veg")}
                  className={`px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
                    selectedDiet === "non_veg"
                      ? "border-rose-600 bg-rose-50 text-rose-700"
                      : "border-brand-border text-brand-text-muted hover:border-rose-500"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            {/* ITEM CATALOG LIST */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-brand-text-muted">
                  <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No items match your search</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isInCart = Object.values(cart).some((c) => c.itemId === item.id);
                  const totalInCartForItem = Object.values(cart)
                    .filter((c) => c.itemId === item.id)
                    .reduce((sum, c) => sum + c.quantity, 0);

                  const isVeg = item.dietary_tag === "veg" || item.dietary_tag === "vegan";

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        item.out_of_stock
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : isInCart
                          ? "bg-brand-primary-light/30 border-brand-primary/40"
                          : "bg-white border-brand-border hover:border-brand-primary/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-xs border flex items-center justify-center shrink-0 ${
                              isVeg ? "border-emerald-600" : "border-rose-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isVeg ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                          </span>
                          <span className="text-xs font-bold text-brand-secondary truncate">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-brand-secondary">
                            ₹{item.base_price}
                          </span>
                          {item.variations.length > 0 && (
                            <span className="text-[10px] text-brand-text-muted">
                              ({item.variations.length} sizes)
                            </span>
                          )}
                          {item.prep_time_minutes && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-md font-semibold">
                              {item.prep_time_minutes}m
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ADD / QTY BUTTON */}
                      <div>
                        {item.out_of_stock ? (
                          <span className="text-[11px] font-bold text-amber-600 px-2 py-1 rounded-lg bg-amber-50">
                            86'd (OOS)
                          </span>
                        ) : item.variations.length > 0 || item.addons.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(item)}
                            className="px-3 py-1.5 rounded-xl border border-brand-primary text-brand-primary bg-white hover:bg-brand-primary hover:text-white font-bold text-xs transition-colors shadow-2xs"
                          >
                            {totalInCartForItem > 0 ? `+ Add (${totalInCartForItem})` : "+ Customize"}
                          </button>
                        ) : totalInCartForItem > 0 ? (
                          <div className="flex items-center gap-1.5 bg-brand-primary text-white rounded-xl p-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="h-6 w-6 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center font-black"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold px-1">{totalInCartForItem}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(item)}
                              className="h-6 w-6 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center font-black"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(item)}
                            className="px-3 py-1.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* CART REVIEW STEP */
          <div className="flex-1 flex flex-col min-h-0 bg-brand-background">
            <div className="p-3 border-b border-brand-border bg-white flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="flex items-center gap-1 text-xs font-bold text-brand-text-secondary hover:text-brand-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Menu</span>
              </button>
              <span className="text-xs font-bold text-brand-secondary">
                Review Order ({totalItemCount} items)
              </span>
            </div>

            {/* DRAFT MODE CUSTOMER INFO FORM */}
            {mode === "draft" && (
              <div className="p-4 bg-white border-b border-brand-border space-y-3">
                <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                  Customer & Delivery Details (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="p-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="p-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Order notes (e.g. delivery address or takeaway time)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}

            {/* REVIEW ITEMS LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItemsList.map((item) => {
                const itemTotal =
                  (item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)) *
                  item.quantity;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white border border-brand-border shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-brand-secondary">{item.name}</span>
                        {item.variationName && (
                          <span className="text-[11px] text-brand-text-muted block">
                            Size: {item.variationName}
                          </span>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <span className="text-[10px] text-brand-text-muted block">
                            Addons: {item.addons.map((a) => a.name).join(", ")}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[10px] text-orange-600 block italic">
                            Note: {item.notes}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-black text-brand-secondary">₹{itemTotal}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-brand-border/60">
                      <span className="text-[11px] text-brand-text-muted">
                        ₹{item.price} each
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="h-6 w-6 rounded-lg border border-brand-border hover:bg-brand-surface-muted flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="h-6 w-6 rounded-lg border border-brand-border hover:bg-brand-surface-muted flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BILL SUMMARY */}
            <div className="p-4 bg-white border-t border-brand-border space-y-2">
              <div className="flex justify-between text-xs text-brand-text-secondary">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {mode === "draft" && (
                <div className="flex justify-between text-xs text-brand-text-secondary">
                  <span>Estimated GST (5%)</span>
                  <span>₹{estimatedTax}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-brand-secondary pt-1 border-t border-brand-border">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION DOCK */}
        {cartItemsList.length > 0 && (
          <div className="p-4 border-t border-brand-border bg-white shadow-lg shrink-0">
            {!isReviewOpen ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[11px] text-brand-text-muted block">
                    {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in cart
                  </span>
                  <span className="text-base font-black text-brand-secondary">
                    ₹{subtotal}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-brand-secondary text-white font-bold text-xs hover:bg-brand-secondaryLight transition-all shadow-brandCard flex items-center gap-2"
                >
                  <span>Review Cart</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </div>
            ) : mode === "live_fire" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFireOrder}
                className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-black text-sm shadow-brandCard hover:bg-brand-primary-hover active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Flame className="h-5 w-5" />
                <span>
                  {isSubmitting ? "Firing to Kitchen..." : `Fire to Kitchen (₹${grandTotal})`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalizeDraftBill}
                className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-black text-sm shadow-brandCard hover:bg-brand-primary-hover active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Receipt className="h-5 w-5" />
                <span>
                  {isSubmitting ? "Creating Order + Bill..." : `Finalize & Create Bill (₹${grandTotal})`}
                </span>
              </button>
            )}
          </div>
        )}

        {/* INLINE ITEM CUSTOMIZER MODAL */}
        {customizingItem && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-brand-secondary">
                    {customizingItem.name}
                  </h4>
                  <p className="text-[11px] text-brand-text-muted">Select size and optional addons</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomizingItem(null)}
                  className="p-1 rounded-lg text-brand-text-muted hover:bg-brand-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Variations */}
              {customizingItem.variations.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider block">
                    Choose Portion / Size:
                  </span>
                  <div className="space-y-1">
                    {customizingItem.variations.map((v) => (
                      <label
                        key={v.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedVariationId === v.id
                            ? "border-brand-primary bg-brand-primary-light/40 text-brand-primary font-bold"
                            : "border-brand-border hover:bg-brand-surface-muted text-brand-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariationId === v.id}
                            onChange={() => setSelectedVariationId(v.id)}
                            className="accent-brand-primary"
                          />
                          <span>{v.name}</span>
                        </div>
                        <span>₹{v.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons */}
              {customizingItem.addons.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider block">
                    Add-ons:
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {customizingItem.addons.map((a) => {
                      const isChecked = selectedAddonIds.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "border-brand-primary bg-brand-primary-light/40 text-brand-primary font-bold"
                              : "border-brand-border hover:bg-brand-surface-muted text-brand-secondary"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAddonIds((prev) => [...prev, a.id]);
                                } else {
                                  setSelectedAddonIds((prev) => prev.filter((id) => id !== a.id));
                                }
                              }}
                              className="accent-brand-primary"
                            />
                            <span>{a.name}</span>
                          </div>
                          <span>+₹{a.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special instructions */}
              <div>
                <input
                  type="text"
                  placeholder="Special instructions (e.g. less spicy)"
                  value={customItemNotes}
                  onChange={(e) => setCustomItemNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleCustomizerSave}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover shadow-xs transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
