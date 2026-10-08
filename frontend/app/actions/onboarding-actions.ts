"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/auth-service";
import { 
  BranchSetupSchema, 
  KitchenSchema, 
  ShiftSchema, 
  SectionSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  CategorySchema,
  ItemSchema,
  AddonSchema,
  TaxRuleInputSchema,
  PromoCodeInputSchema,
  BranchChargeSettingsInputSchema,
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
  DEFAULT_ROLE_PERMISSIONS
} from "@/lib/onboarding/schemas";
import { 
  generateShortCode, 
  buildTableTargetUrl, 
  buildSectionQueueUrl 
} from "@/lib/onboarding/short-code";
import { deriveTimezoneFromLocation } from "@/lib/utils/timezone";

/**
 * Helper: Checks if a branch has at least one active Branch Manager
 */
async function checkHasActiveBranchManager(supabase: any, branchId: string): Promise<boolean> {
  const { data } = await supabase
    .from("employees")
    .select("id")
    .eq("branch_id", branchId)
    .eq("role", "manager")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1);

  return Boolean(data && data.length > 0);
}

/**
 * 1. GET COMPLETE ONBOARDING DATA FOR CURRENT ADMIN & BRANCH
 */
export async function getOnboardingData(branchId?: string) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const { user, restaurant, branch } = authContext;
  const supabase = createServiceRoleClient();

  let kitchens: any[] = [];
  let shifts: any[] = [];
  let sections: any[] = [];
  let tables: any[] = [];
  let employees: any[] = [];
  let categories: any[] = [];
  let items: any[] = [];
  let addons: any[] = [];
  let taxRules: any[] = [];
  let promoCodes: any[] = [];
  let chargeSettings: any = {
    service_charge_enabled: false,
    service_charge_type: "percentage",
    service_charge_rate: 0,
    service_charge_bill_note: "Service charge is discretionary / voluntary.",
    packaging_charge_enabled: false,
    packaging_charge_type: "order",
    packaging_charge_order_amount: 0,
  };

  if (branch) {
    // Phase 1: Concurrently fetch root branch datasets
    const [
      kitchenRes,
      shiftRes,
      sectionRes,
      empRes,
      catWithDelRes,
      addonWithBranchRes,
      taxWithDelRes,
      promoRes,
      chargeRes,
    ] = await Promise.all([
      supabase.from("kitchens").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("priority", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("shifts").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("priority", { ascending: true }).order("start_time", { ascending: true }),
      supabase.from("sections").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("created_at", { ascending: true }),
      supabase.from("employees").select("id, branch_id, external_id, first_name, last_name, role, email, username, phone, status, permissions, employment_type, start_date, end_date, created_at, updated_at").eq("branch_id", branch.id).is("deleted_at", null).order("created_at", { ascending: true }),
      supabase.from("categories").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("created_at", { ascending: true }),
      supabase.from("addons").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("name", { ascending: true }),
      supabase.from("tax_rules").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("created_at", { ascending: true }),
      supabase.from("promo_codes").select("*").eq("branch_id", branch.id).is("deleted_at", null).order("created_at", { ascending: true }),
      supabase.from("branch_charge_settings").select("*").eq("branch_id", branch.id).maybeSingle(),
    ]);

    if (!kitchenRes.error && kitchenRes.data) {
      kitchens = kitchenRes.data;
    }

    if (!shiftRes.error && shiftRes.data) {
      shifts = shiftRes.data;
    }

    if (!sectionRes.error && sectionRes.data) {
      sections = sectionRes.data;
    }

    const employeeData = empRes.data || [];
    let categoryData = catWithDelRes.data;
    if (catWithDelRes.error) {
      const { data: catFb } = await supabase.from("categories").select("*").eq("branch_id", branch.id).order("created_at", { ascending: true });
      categoryData = catFb || [];
    }

    let addonData = addonWithBranchRes.data;
    if (addonWithBranchRes.error) {
      const { data: addAll } = await supabase.from("addons").select("*").order("name", { ascending: true });
      addonData = addAll;
    }
    if (addonData) {
      addons = addonData;
    }

    let rawTaxData = taxWithDelRes.data;
    if (taxWithDelRes.error) {
      const { data: taxFb } = await supabase.from("tax_rules").select("*").eq("branch_id", branch.id).order("created_at", { ascending: true });
      rawTaxData = taxFb || [];
    }
    if (rawTaxData) {
      taxRules = rawTaxData.map((tr: any) => ({
        ...tr,
        revenue_classification: tr.revenue_classification || tr.location_scope?.revenue_classification || "government_tax",
        gst_classification: tr.gst_classification || tr.location_scope?.gst_classification || "services",
        is_discretionary: Boolean(tr.is_discretionary ?? tr.location_scope?.is_discretionary),
        calculation_type: (tr.calculation_type === "fixed" ? "fixed_per_item" : tr.calculation_type) || (tr.location_scope?.calculation_type === "fixed" ? "fixed_per_item" : tr.location_scope?.calculation_type) || "percentage",
        tax_type: tr.tax_type || tr.calculation_mode || "exclusive",
        order_channels: Array.isArray(tr.order_channels) ? tr.order_channels : (Array.isArray(tr.location_scope?.order_channels) ? tr.location_scope.order_channels : (Array.isArray(tr.order_channel) ? tr.order_channel : ["dine_in", "takeaway", "online"])),
        applies_to: Array.isArray(tr.applies_to) ? tr.applies_to : ["all"],
        rate: Number(tr.rate) || 0,
        active: tr.active !== false,
      }));
    }

    // Promo codes: query or ADR-018 JSONB fallback
    if (!promoRes.error && promoRes.data) {
      promoCodes = promoRes.data.map((p: any) => ({
        ...p,
        discount_type: p.discount_type || "percentage",
        discount_value: Number(p.discount_value) || 0,
        max_discount_cap: p.max_discount_cap !== null && p.max_discount_cap !== undefined ? Number(p.max_discount_cap) : null,
        min_bill_amount: p.min_bill_amount !== null && p.min_bill_amount !== undefined ? Number(p.min_bill_amount) : null,
        applicable_order_types: Array.isArray(p.applicable_order_types) ? p.applicable_order_types : ["dine_in", "takeaway", "online"],
        no_expiry: p.no_expiry !== false,
        active: p.active !== false,
      }));
    } else {
      const fbPromos = (branch as any)?.onboarding_progress?.promo_codes;
      if (Array.isArray(fbPromos)) {
        promoCodes = fbPromos.filter((p: any) => !p.deleted_at).map((p: any) => ({
          ...p,
          discount_type: p.discount_type || "percentage",
          discount_value: Number(p.discount_value) || 0,
          max_discount_cap: p.max_discount_cap !== null && p.max_discount_cap !== undefined ? Number(p.max_discount_cap) : null,
          min_bill_amount: p.min_bill_amount !== null && p.min_bill_amount !== undefined ? Number(p.min_bill_amount) : null,
          applicable_order_types: Array.isArray(p.applicable_order_types) ? p.applicable_order_types : ["dine_in", "takeaway", "online"],
          no_expiry: p.no_expiry !== false,
          active: p.active !== false,
        }));
      }
    }

    // Branch charge settings: query or ADR-018 JSONB fallback
    if (!chargeRes.error && chargeRes.data) {
      chargeSettings = {
        ...chargeRes.data,
        service_charge_enabled: Boolean(chargeRes.data.service_charge_enabled),
        service_charge_type: chargeRes.data.service_charge_type || "percentage",
        service_charge_rate: Number(chargeRes.data.service_charge_rate) || 0,
        service_charge_bill_note: chargeRes.data.service_charge_bill_note || "Service charge is discretionary / voluntary.",
        packaging_charge_enabled: Boolean(chargeRes.data.packaging_charge_enabled),
        packaging_charge_type: chargeRes.data.packaging_charge_type || "order",
        packaging_charge_order_amount: Number(chargeRes.data.packaging_charge_order_amount) || 0,
      };
    } else if ((branch as any)?.onboarding_progress?.charge_settings) {
      const fbCharge = (branch as any).onboarding_progress.charge_settings;
      chargeSettings = {
        ...chargeSettings,
        ...fbCharge,
        service_charge_enabled: Boolean(fbCharge.service_charge_enabled),
        service_charge_type: fbCharge.service_charge_type || "percentage",
        service_charge_rate: Number(fbCharge.service_charge_rate) || 0,
        service_charge_bill_note: fbCharge.service_charge_bill_note || "Service charge is discretionary / voluntary.",
        packaging_charge_enabled: Boolean(fbCharge.packaging_charge_enabled),
        packaging_charge_type: fbCharge.packaging_charge_type || "order",
        packaging_charge_order_amount: Number(fbCharge.packaging_charge_order_amount) || 0,
      };
    }

    // Phase 2: Concurrent secondary relations
    const sectionIds = sections.map((s) => s.id);
    const empIds = employeeData.map((e: any) => e.id);

    if (categoryData && categoryData.length > 0) {
      categories = categoryData.map((cat: any) => {
        let desc = cat.description;
        if (desc === undefined && Array.isArray(cat.tags)) {
          const descTag = cat.tags.find((t: any) => t && t.key === "description");
          if (descTag) desc = descTag.value;
        }
        let isAvail = cat.is_available;
        if (isAvail === undefined && cat.availability && typeof cat.availability === "object") {
          isAvail = cat.availability.is_available;
        }
        if (isAvail === undefined) {
          isAvail = true;
        }
        return {
          ...cat,
          description: desc || null,
          is_available: isAvail !== false,
        };
      });
    }
    const catIds = categories.map((c: any) => c.id);

    const [
      tablesRes,
      secRes,
      shiftRes2,
      kitRes,
      itmRes,
    ] = await Promise.all([
      sectionIds.length > 0
        ? supabase.from("tables").select("*").in("section_id", sectionIds).is("deleted_at", null).order("table_number", { ascending: true })
        : Promise.resolve({ data: [] as any[], error: null }),
      empIds.length > 0
        ? supabase.from("employee_sections").select("employee_id, section_id").in("employee_id", empIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      empIds.length > 0
        ? supabase.from("employee_shifts").select("employee_id, shift_id").in("employee_id", empIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      empIds.length > 0
        ? supabase.from("employee_kitchens").select("employee_id, kitchen_id").in("employee_id", empIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      catIds.length > 0
        ? supabase.from("items").select("*").in("category_id", catIds).is("deleted_at", null).order("created_at", { ascending: true })
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);

    if (!tablesRes.error && tablesRes.data) {
      tables = tablesRes.data;
    } else if (tablesRes.error && sectionIds.length > 0) {
      const { data: fbTables } = await supabase
        .from("tables")
        .select("*")
        .in("section_id", sectionIds)
        .is("deleted_at", null);
      tables = fbTables || [];
    }

    if (employeeData.length > 0) {
      const secMap = new Map<string, string[]>();
      (secRes.data || []).forEach((row: any) => {
        if (!secMap.has(row.employee_id)) secMap.set(row.employee_id, []);
        secMap.get(row.employee_id)!.push(row.section_id);
      });

      const shiftMap = new Map<string, string[]>();
      (shiftRes2.data || []).forEach((row: any) => {
        if (!shiftMap.has(row.employee_id)) shiftMap.set(row.employee_id, []);
        shiftMap.get(row.employee_id)!.push(row.shift_id);
      });

      const kitMap = new Map<string, string[]>();
      (kitRes.data || []).forEach((row: any) => {
        if (!kitMap.has(row.employee_id)) kitMap.set(row.employee_id, []);
        kitMap.get(row.employee_id)!.push(row.kitchen_id);
      });

      employees = employeeData.map((e: any) => ({
        ...e,
        assigned_section_ids: secMap.get(e.id) || [],
        assigned_shift_ids: shiftMap.get(e.id) || [],
        assigned_kitchen_ids: kitMap.get(e.id) || [],
      }));
    }

    let itemData = itmRes.data;
    if (itmRes.error && catIds.length > 0) {
      const { data: itmWithoutDel } = await supabase.from("items").select("*").in("category_id", catIds).order("created_at", { ascending: true });
      itemData = itmWithoutDel;
    }

    // Phase 3: Variations & Addons for items
    if (itemData && itemData.length > 0) {
      const itemIds = itemData.map((it: any) => it.id);
      const [varGroupRes, itemAddonRes] = await Promise.all([
        supabase.from("variation_groups").select("id, item_id, group_name").in("item_id", itemIds),
        supabase.from("item_addons").select("item_id, addon_id").in("item_id", itemIds),
      ]);

      const varGroups = varGroupRes.data || [];
      const varGroupIds = varGroups.map((vg: any) => vg.id);

      let varOptions: any[] = [];
      if (varGroupIds.length > 0) {
        const { data: optData } = await supabase
          .from("variation_options")
          .select("*")
          .in("group_id", varGroupIds)
          .order("price", { ascending: true });
        varOptions = optData || [];
      }

      const optMap = new Map<string, any[]>();
      varOptions.forEach((opt: any) => {
        if (!optMap.has(opt.group_id)) optMap.set(opt.group_id, []);
        optMap.get(opt.group_id)!.push(opt);
      });

      const itemVarMap = new Map<string, any[]>();
      varGroups.forEach((vg: any) => {
        if (!itemVarMap.has(vg.item_id)) itemVarMap.set(vg.item_id, []);
        itemVarMap.get(vg.item_id)!.push({
          ...vg,
          options: optMap.get(vg.id) || [],
        });
      });

      const itemAddonMap = new Map<string, string[]>();
      (itemAddonRes.data || []).forEach((ia: any) => {
        if (!itemAddonMap.has(ia.item_id)) itemAddonMap.set(ia.item_id, []);
        itemAddonMap.get(ia.item_id)!.push(ia.addon_id);
      });

      items = itemData.map((it: any) => {
        let dietary = it.dietary_tag || "veg";
        let pkg = it.packaging_charge !== undefined ? Number(it.packaging_charge) : 0;
        let uVal = it.unit_value !== undefined ? it.unit_value : null;
        let uType = it.unit_type !== undefined ? it.unit_type : null;
        let pType = it.pricing_type || (itemVarMap.has(it.id) ? "variable" : "single");
        let oos = it.out_of_stock === true;
        let servInfo = it.serving_info || null;
        let prepTime = it.prep_time_minutes !== undefined && it.prep_time_minutes !== null ? Number(it.prep_time_minutes) : 15;

        if (Array.isArray(it.tags)) {
          it.tags.forEach((t: any) => {
            if (t && typeof t === "object") {
              if (t.key === "dietary_tag" && !it.dietary_tag) dietary = t.value;
              if (t.key === "packaging_charge" && it.packaging_charge === undefined) pkg = Number(t.value) || 0;
              if (t.key === "unit_value" && it.unit_value === undefined) uVal = Number(t.value) || null;
              if (t.key === "unit_type" && it.unit_type === undefined) uType = t.value;
              if (t.key === "pricing_type" && !it.pricing_type) pType = t.value;
              if (t.key === "out_of_stock" && it.out_of_stock === undefined) oos = Boolean(t.value);
              if (t.key === "serving_info" && !it.serving_info) servInfo = t.value;
              if (t.key === "prep_time_minutes" && (it.prep_time_minutes === undefined || it.prep_time_minutes === null)) prepTime = Number(t.value) || 15;
            }
          });
        }

        return {
          ...it,
          dietary_tag: dietary,
          packaging_charge: pkg,
          unit_value: uVal,
          unit_type: uType,
          pricing_type: pType,
          serving_info: servInfo,
          prep_time_minutes: prepTime,
          out_of_stock: oos,
          variations: itemVarMap.get(it.id) || null,
          addon_ids: itemAddonMap.get(it.id) || [],
        };
      });
    }
  }

  return {
    success: true,
    user,
    restaurant,
    branch,
    kitchens,
    shifts,
    sections,
    tables,
    employees,
    categories,
    items,
    addons,
    price_display_mode: (branch as any)?.price_display_mode || (branch as any)?.onboarding_progress?.price_display_mode || "exclusive",
    tax_rules: taxRules,
    promo_codes: promoCodes,
    charge_settings: chargeSettings,
  };
}

/**
 * 2. SAVE STEP 1: BRANCH SETUP (CREATE OR UPDATE)
 * Updates branch to status: 'onboarding_in_progress' and sets step 1 completed.
 */
export async function saveBranchSetup(branchId: string | null, rawInput: BranchSetupInput) {
  const authContext = await getAuthenticatedAdmin(branchId || undefined);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const { user, restaurant } = authContext;
  if (!restaurant) {
    return { success: false, error: "Restaurant organization profile missing." };
  }

  const parseResult = BranchSetupSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.issues[0]?.message || "Please fix validation errors." 
    };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  // Existing progress or default
  let completedSteps = authContext.branch?.onboarding_progress?.completed_steps || [];
  if (!completedSteps.includes(1)) {
    completedSteps = [...completedSteps, 1];
  }

  const onboardingProgress = {
    current_step: 2, // Auto-advance to Kitchen Management
    completed_steps: completedSteps,
    branch_meta: {
      city: data.city,
      state: data.state,
      pin_code: data.pin_code,
    },
  };

  const derivedTimezone = deriveTimezoneFromLocation({
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    city: data.city,
    state: data.state,
    country: (restaurant as any)?.country || "India",
  });

  const branchPayload: any = {
    name: data.name,
    address: data.address,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    google_maps_url: data.google_maps_url || null,
    phone: data.phone,
    gstin: data.gstin || null,
    manager_name: data.manager_name,
    manager_phone: data.manager_phone,
    timezone: derivedTimezone,
    google_review_link: data.google_review_link || null,
    logo_image_url: data.logo_image_url || null,
    facebook_url: data.facebook_url || null,
    instagram_url: data.instagram_url || null,
    youtube_url: data.youtube_url || null,
    status: "onboarding_in_progress",
    onboarding_progress: onboardingProgress,
    updated_at: new Date().toISOString(),
  };

  // Attempt insert or update with city/state/pin_code columns first
  let savedBranch: any = null;
  const payloadWithAddressCols = {
    ...branchPayload,
    city: data.city,
    state: data.state,
    pin_code: data.pin_code,
  };

  if (branchId) {
    // Update existing branch
    let { data: updated, error: updateError } = await supabase
      .from("branches")
      .update(payloadWithAddressCols)
      .eq("id", branchId)
      .select()
      .maybeSingle();

    if (updateError && updateError.message?.includes("column")) {
      // Fallback if city/state/pin_code columns don't exist yet in Supabase
      const fallbackResult = await supabase
        .from("branches")
        .update(branchPayload)
        .eq("id", branchId)
        .select()
        .single();
      
      if (fallbackResult.error) {
        return { success: false, error: fallbackResult.error.message };
      }
      savedBranch = fallbackResult.data;
    } else if (updateError) {
      return { success: false, error: updateError.message };
    } else {
      savedBranch = updated;
    }
  } else {
    // Create new branch for this restaurant
    const newBranchPayload = {
      ...payloadWithAddressCols,
      restaurant_id: restaurant.id,
      created_by: user.id,
    };

    let { data: inserted, error: insertError } = await supabase
      .from("branches")
      .insert(newBranchPayload)
      .select()
      .single();

    if (insertError && insertError.message?.includes("column")) {
      // Fallback without address columns
      const fallbackPayload = {
        ...branchPayload,
        restaurant_id: restaurant.id,
        created_by: user.id,
      };

      const fallbackResult = await supabase
        .from("branches")
        .insert(fallbackPayload)
        .select()
        .single();

      if (fallbackResult.error) {
        return { success: false, error: fallbackResult.error.message };
      }
      savedBranch = fallbackResult.data;
    } else if (insertError) {
      return { success: false, error: insertError.message };
    } else {
      savedBranch = inserted;
    }
  }

  revalidatePath("/admin/onboarding");
  return { 
    success: true, 
    branch: savedBranch,
    message: "Branch setup saved successfully!" 
  };
}

/**
 * 3. KITCHEN MANAGEMENT ACTIONS (STEP 2)
 */
export async function createKitchen(branchId: string, rawInput: KitchenInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized." };
  }

  const parseResult = KitchenSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  // If this kitchen is set as default, unset any other default kitchens for this branch
  if (data.default_kitchen) {
    await supabase
      .from("kitchens")
      .update({ default_kitchen: false })
      .eq("branch_id", branchId)
      .is("deleted_at", null);
  }

  const { data: newKitchen, error } = await supabase
    .from("kitchens")
    .insert({
      branch_id: branchId,
      name: data.name,
      type: data.type,
      printer_station_id: data.printer_station_id || null,
      priority: data.priority,
      capacity: data.capacity || 50,
      default_kitchen: data.default_kitchen,
      active: data.active,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Update completed_steps to include Step 2 if active
  if (data.active && authContext.branch) {
    const prevCompleted = authContext.branch.onboarding_progress?.completed_steps || [];
    if (!prevCompleted.includes(2)) {
      const updatedCompleted = [...prevCompleted, 2];
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...authContext.branch.onboarding_progress,
            completed_steps: updatedCompleted,
          },
        })
        .eq("id", branchId);
    }
  }

  revalidatePath("/admin/onboarding");
  return { success: true, kitchen: newKitchen };
}

export async function updateKitchen(kitchenId: string, rawInput: KitchenInput) {
  const parseResult = KitchenSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  // Look up kitchen to get branch_id
  const { data: existing } = await supabase
    .from("kitchens")
    .select("branch_id")
    .eq("id", kitchenId)
    .single();

  if (!existing) {
    return { success: false, error: "Kitchen station not found." };
  }

  if (data.default_kitchen) {
    await supabase
      .from("kitchens")
      .update({ default_kitchen: false })
      .eq("branch_id", existing.branch_id)
      .neq("id", kitchenId)
      .is("deleted_at", null);
  }

  const { data: updated, error } = await supabase
    .from("kitchens")
    .update({
      name: data.name,
      type: data.type,
      printer_station_id: data.printer_station_id || null,
      priority: data.priority,
      capacity: data.capacity || 50,
      default_kitchen: data.default_kitchen,
      active: data.active,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", kitchenId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, kitchen: updated };
}

export async function deleteKitchen(kitchenId: string) {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("kitchens")
    .select("branch_id")
    .eq("id", kitchenId)
    .single();

  if (!existing) {
    return { success: false, error: "Kitchen not found." };
  }

  const { error } = await supabase
    .from("kitchens")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", kitchenId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Check remaining active kitchens
  const { count } = await supabase
    .from("kitchens")
    .select("id", { count: "exact", head: true })
    .eq("branch_id", existing.branch_id)
    .eq("active", true)
    .is("deleted_at", null);

  if (count === 0) {
    // Remove Step 2 from completed_steps if no active kitchens left
    const { data: branch } = await supabase
      .from("branches")
      .select("onboarding_progress")
      .eq("id", existing.branch_id)
      .single();

    if (branch && branch.onboarding_progress) {
      const updatedSteps = (branch.onboarding_progress.completed_steps || []).filter((s: number) => s !== 2);
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: updatedSteps,
          },
        })
        .eq("id", existing.branch_id);
    }
  }

  revalidatePath("/admin/onboarding");
  return { success: true };
}

/**
 * 4. SHIFT MANAGEMENT ACTIONS (STEP 3)
 */
export async function createShift(branchId: string, rawInput: ShiftInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized." };
  }

  const parseResult = ShiftSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  // If set as default, unset any other default shift in this branch
  if (data.default_shift) {
    await supabase
      .from("shifts")
      .update({ default_shift: false })
      .eq("branch_id", branchId)
      .is("deleted_at", null);
  }

  const { data: newShift, error } = await supabase
    .from("shifts")
    .insert({
      branch_id: branchId,
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      cross_midnight: data.cross_midnight,
      active: data.active,
      default_shift: data.default_shift,
      priority: data.priority,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Update completed_steps to include Step 3 if active
  if (data.active && authContext.branch) {
    const prevCompleted = authContext.branch.onboarding_progress?.completed_steps || [];
    if (!prevCompleted.includes(3)) {
      const updatedCompleted = [...prevCompleted, 3];
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...authContext.branch.onboarding_progress,
            completed_steps: updatedCompleted,
          },
        })
        .eq("id", branchId);
    }
  }

  revalidatePath("/admin/onboarding");
  return { success: true, shift: newShift };
}

export async function updateShift(shiftId: string, rawInput: ShiftInput) {
  const parseResult = ShiftSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("shifts")
    .select("branch_id")
    .eq("id", shiftId)
    .single();

  if (!existing) {
    return { success: false, error: "Shift not found." };
  }

  if (data.default_shift) {
    await supabase
      .from("shifts")
      .update({ default_shift: false })
      .eq("branch_id", existing.branch_id)
      .neq("id", shiftId)
      .is("deleted_at", null);
  }

  const { data: updated, error } = await supabase
    .from("shifts")
    .update({
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      cross_midnight: data.cross_midnight,
      active: data.active,
      default_shift: data.default_shift,
      priority: data.priority,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shiftId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, shift: updated };
}

export async function deleteShift(shiftId: string) {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("shifts")
    .select("branch_id")
    .eq("id", shiftId)
    .single();

  if (!existing) {
    return { success: false, error: "Shift not found." };
  }

  const { error } = await supabase
    .from("shifts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", shiftId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Check remaining active shifts
  const { count } = await supabase
    .from("shifts")
    .select("id", { count: "exact", head: true })
    .eq("branch_id", existing.branch_id)
    .eq("active", true)
    .is("deleted_at", null);

  if (count === 0) {
    const { data: branch } = await supabase
      .from("branches")
      .select("onboarding_progress")
      .eq("id", existing.branch_id)
      .single();

    if (branch && branch.onboarding_progress) {
      const updatedSteps = (branch.onboarding_progress.completed_steps || []).filter((s: number) => s !== 3);
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: updatedSteps,
          },
        })
        .eq("id", existing.branch_id);
    }
  }

  revalidatePath("/admin/onboarding");
  return { success: true };
}

/**
 * 5. PERSIST STEP NAVIGATION / AUTOSAVE PROGRESS
 */
export async function updateOnboardingProgress(
  branchId: string, 
  currentStep: number, 
  completedSteps?: number[]
) {
  const supabase = createServiceRoleClient();

  const { data: branch } = await supabase
    .from("branches")
    .select("onboarding_progress")
    .eq("id", branchId)
    .single();

  if (!branch) {
    return { success: false, error: "Branch not found." };
  }

  const existingProgress = branch.onboarding_progress || {};
  const mergedCompleted = completedSteps || existingProgress.completed_steps || [];

  const updatedProgress = {
    ...existingProgress,
    current_step: currentStep,
    completed_steps: Array.from(new Set(mergedCompleted)),
  };

  const { error } = await supabase
    .from("branches")
    .update({
      onboarding_progress: updatedProgress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", branchId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, progress: updatedProgress };
}

/**
 * 6. STEP 4: SECTIONS & TABLES ACTIONS
 */

/**
 * Creates a physical section, auto-generates branch/section short codes,
 * generates deterministic table QR URLs (/o/{branch}/{section}/{table}),
 * and generates section queue URL (/q/{branch}/{section}) if not a Room.
 */
export async function createSection(branchId: string, rawInput: SectionInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized." };
  }

  const parseResult = SectionSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  // 1. Ensure branch has an immutable short_code
  let branchShortCode = authContext.branch?.short_code;
  if (!branchShortCode) {
    branchShortCode = generateShortCode(6);
    await supabase
      .from("branches")
      .update({ short_code: branchShortCode })
      .eq("id", branchId);
  }

  // 2. Generate section short_code
  const sectionShortCode = generateShortCode(6);

  // 3. Generate section queue URL (excluded for 'room' type per specification)
  const queueUrl = data.type === "room" ? null : buildSectionQueueUrl(branchShortCode, sectionShortCode);
  const unitLabel = data.unit_label || (data.type === "room" ? "Room" : "Table");

  // 4. Insert section record
  const sectionPayload: any = {
    branch_id: branchId,
    name: data.name,
    type: data.type,
    floor: data.floor || null,
    table_count: data.table_count,
    unit_label: unitLabel,
    short_code: sectionShortCode,
    queue_url: queueUrl,
    active: true,
    notes: data.notes || null,
  };

  let createdSection: any = null;
  const { data: insertedSec, error: secErr } = await supabase
    .from("sections")
    .insert(sectionPayload)
    .select()
    .single();

  if (secErr) {
    // Resilience fallback if short_code / unit_label / queue_url columns aren't in schema cache
    if (secErr.message?.includes("column")) {
      const fallbackPayload = {
        branch_id: branchId,
        name: data.name,
        type: data.type,
        floor: data.floor || null,
        table_count: data.table_count,
        active: true,
        notes: data.notes || null,
      };
      const { data: fbSec, error: fbErr } = await supabase
        .from("sections")
        .insert(fallbackPayload)
        .select()
        .single();

      if (fbErr) return { success: false, error: fbErr.message };
      createdSection = {
        ...fbSec,
        short_code: sectionShortCode,
        unit_label: unitLabel,
        queue_url: queueUrl,
      };
    } else {
      return { success: false, error: secErr.message };
    }
  } else {
    createdSection = insertedSec;
  }

  // 5. Generate deterministic table records (1..N)
  const tableRows: any[] = [];
  for (let i = 1; i <= data.table_count; i++) {
    const targetUrl = buildTableTargetUrl(branchShortCode, sectionShortCode, i);
    tableRows.push({
      section_id: createdSection.id,
      table_name: `${unitLabel} ${i}`,
      table_number: i,
      qr_url: targetUrl,
      status: "active",
      seating_capacity: data.type === "room" ? 2 : 4,
    });
  }

  // Bulk insert tables
  const { data: insertedTables, error: tblErr } = await supabase
    .from("tables")
    .insert(tableRows)
    .select();

  let finalTables = insertedTables || [];
  if (tblErr) {
    // Fallback without table_number column if not present in schema cache
    if (tblErr.message?.includes("column")) {
      const fallbackRows = tableRows.map(({ table_number, ...rest }) => rest);
      const { data: fbTables } = await supabase
        .from("tables")
        .insert(fallbackRows)
        .select();
      finalTables = fbTables || [];
    } else {
      console.error("[TABLE INSERT ERROR]", tblErr);
    }
  }

  // 6. Update onboarding_progress to mark Step 4 as completed and persist section short codes
  if (authContext.branch) {
    const curProg = authContext.branch.onboarding_progress || {};
    const prevCompleted = curProg.completed_steps || [];
    const updatedCompleted = prevCompleted.includes(4) ? prevCompleted : [...prevCompleted, 4];
    const prevSectionShortCodes = curProg.section_short_codes || {};
    try {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...curProg,
            completed_steps: updatedCompleted,
            short_code: branchShortCode,
            section_short_codes: {
              ...prevSectionShortCodes,
              [createdSection.id]: sectionShortCode,
            },
          },
        })
        .eq("id", branchId);
    } catch {}
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}
  return { 
    success: true, 
    section: createdSection, 
    tables: finalTables 
  };
}

/**
 * Updates an existing section.
 * Enforces atomic unit count scaling:
 * - Decreasing count (e.g. 12 -> 10): sets status = 'inactive' on tables > newCount. NEVER deletes rows.
 * - Increasing count (e.g. 10 -> 15): reactivates inactive tables and creates new tables (max+1)..newCount.
 * - Updates table names if unit_label changed.
 */
export async function updateSection(sectionId: string, rawInput: SectionInput) {
  const parseResult = SectionSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." };
  }

  const data = parseResult.data;
  const supabase = createServiceRoleClient();

  // 1. Fetch section directly by primary key (avoiding fragile embedded join)
  const { data: section, error: secFetchErr } = await supabase
    .from("sections")
    .select("*")
    .eq("id", sectionId)
    .maybeSingle();

  if (secFetchErr || !section) {
    return { success: false, error: secFetchErr ? secFetchErr.message : "Section not found." };
  }

  // 2. Fetch branch short_code safely
  let branchShortCode: string | null = null;
  if (section.branch_id) {
    const { data: branchData } = await supabase
      .from("branches")
      .select("*")
      .eq("id", section.branch_id)
      .maybeSingle();
    branchShortCode = branchData?.short_code || null;
  }

  // 3. Fetch existing tables for this section
  const { data: existingTables } = await supabase
    .from("tables")
    .select("*")
    .eq("section_id", sectionId);

  const currentTables = existingTables || [];

  // Robust helper to extract table number across schemas and qr_urls
  const parseTableNumber = (t: any): number => {
    if (typeof t.table_number === "number" && !isNaN(t.table_number) && t.table_number > 0) {
      return t.table_number;
    }
    if (t.qr_url) {
      const parts = t.qr_url.split("/");
      const last = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(last) && last > 0) return last;
    }
    if (t.table_name) {
      const match = t.table_name.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return 0;
  };

  // Extract branch/section short codes from existing table qr_url if not in DB column
  let sectionShortCode = section.short_code || null;
  for (const t of currentTables) {
    if (t.qr_url && t.qr_url.startsWith("/o/")) {
      const parts = t.qr_url.split("/");
      if (parts.length >= 4) {
        if (!branchShortCode) branchShortCode = parts[2];
        if (!sectionShortCode) sectionShortCode = parts[3];
        break;
      }
    }
  }

  if (!branchShortCode) branchShortCode = generateShortCode(6);
  if (!sectionShortCode) sectionShortCode = generateShortCode(6);

  const queueUrl = data.type === "room" ? null : buildSectionQueueUrl(branchShortCode, sectionShortCode);
  const activeTables = currentTables.filter((t) => t.status === "active");
  const currentActiveCount = activeTables.length;
  const newCount = data.table_count;
  const unitLabel = data.unit_label || (data.type === "room" ? "Room" : "Table");

  // 4. Handle downscaling vs upscaling (ADR-011: Never delete tables)
  if (newCount < currentActiveCount) {
    // DOWN-SCALING (e.g. 10 -> 8):
    // Deactivate tables with number > newCount. DO NOT DELETE!
    const toDeactivate = activeTables.filter((t) => {
      const num = parseTableNumber(t);
      return num > newCount;
    });

    for (const tbl of toDeactivate) {
      await supabase
        .from("tables")
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", tbl.id);
    }
  } else if (newCount > currentActiveCount) {
    // UP-SCALING (e.g. 8 -> 12):
    // First, reactivate any previously deactivated tables with number <= newCount
    const inactiveTables = currentTables.filter((t) => t.status === "inactive");
    const toReactivate = inactiveTables.filter((t) => {
      const num = parseTableNumber(t);
      return num > 0 && num <= newCount;
    });

    for (const tbl of toReactivate) {
      await supabase
        .from("tables")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", tbl.id);
    }

    // Determine highest table number currently in the database for this section
    const maxTableNumber = currentTables.reduce(
      (max, t) => Math.max(max, parseTableNumber(t)),
      0
    );

    // If newCount > maxTableNumber, insert brand new table rows
    if (newCount > maxTableNumber) {
      const newTableRows: any[] = [];
      for (let i = maxTableNumber + 1; i <= newCount; i++) {
        const targetUrl = buildTableTargetUrl(branchShortCode, sectionShortCode, i);
        newTableRows.push({
          section_id: sectionId,
          table_name: `${unitLabel} ${i}`,
          table_number: i,
          qr_url: targetUrl,
          status: "active",
          seating_capacity: data.type === "room" ? 2 : 4,
        });
      }

      const { error: insertErr } = await supabase.from("tables").insert(newTableRows);
      if (insertErr && insertErr.message?.includes("column")) {
        const fbRows = newTableRows.map(({ table_number, ...rest }) => rest);
        await supabase.from("tables").insert(fbRows);
      }
    }
  }

  // 5. Update unit_label on tables if changed
  if (data.unit_label && data.unit_label !== section.unit_label) {
    for (const t of currentTables) {
      const num = parseTableNumber(t);
      await supabase
        .from("tables")
        .update({ table_name: `${unitLabel} ${num}`.trim() })
        .eq("id", t.id);
    }
  }

  // 5. Update section record
  const updatePayload: any = {
    name: data.name,
    type: data.type,
    floor: data.floor || null,
    unit_label: unitLabel,
    table_count: newCount,
    short_code: sectionShortCode,
    queue_url: queueUrl,
    notes: data.notes || null,
    updated_at: new Date().toISOString(),
  };

  let { data: updatedSection, error: updateSecErr } = await supabase
    .from("sections")
    .update(updatePayload)
    .eq("id", sectionId)
    .select()
    .single();

  if (updateSecErr && updateSecErr.message?.includes("column")) {
    const fbPayload = {
      name: data.name,
      type: data.type,
      floor: data.floor || null,
      table_count: newCount,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    };
    const { data: fbSec, error: fbErr } = await supabase
      .from("sections")
      .update(fbPayload)
      .eq("id", sectionId)
      .select()
      .single();

    if (fbErr) {
      return { success: false, error: fbErr.message };
    }

    updatedSection = {
      ...fbSec,
      unit_label: unitLabel,
      short_code: sectionShortCode,
      queue_url: queueUrl,
    };
  } else if (updateSecErr) {
    return { success: false, error: updateSecErr.message };
  }

  // Persist updated section short code into branch.onboarding_progress
  if (section.branch_id) {
    try {
      const { data: bData } = await supabase
        .from("branches")
        .select("onboarding_progress")
        .eq("id", section.branch_id)
        .maybeSingle();

      const curProg = bData?.onboarding_progress || {};
      const prevSectionShortCodes = curProg.section_short_codes || {};
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...curProg,
            short_code: branchShortCode,
            section_short_codes: {
              ...prevSectionShortCodes,
              [sectionId]: sectionShortCode,
            },
          },
        })
        .eq("id", section.branch_id);
    } catch {}
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}
  return { success: true, section: updatedSection };
}

/**
 * Soft-deletes a section and deactivates all of its tables.
 */
export async function deleteSection(sectionId: string) {
  const supabase = createServiceRoleClient();

  const { data: section } = await supabase
    .from("sections")
    .select("branch_id")
    .eq("id", sectionId)
    .single();

  if (!section) {
    return { success: false, error: "Section not found." };
  }

  // Soft-delete section
  await supabase
    .from("sections")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", sectionId);

  // Deactivate tables
  await supabase
    .from("tables")
    .update({ status: "inactive" })
    .eq("section_id", sectionId);

  // Check remaining active sections for this branch
  const { count } = await supabase
    .from("sections")
    .select("id", { count: "exact", head: true })
    .eq("branch_id", section.branch_id)
    .eq("active", true)
    .is("deleted_at", null);

  if (count === 0) {
    const { data: branch } = await supabase
      .from("branches")
      .select("onboarding_progress")
      .eq("id", section.branch_id)
      .single();

    if (branch && branch.onboarding_progress) {
      const updatedSteps = (branch.onboarding_progress.completed_steps || []).filter((s: number) => s !== 4);
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: updatedSteps,
          },
        })
        .eq("id", section.branch_id);
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}
  return { success: true };
}

// ============================================================================
// 6. STEP 5: EMPLOYEE MANAGEMENT ACTIONS
// ============================================================================

/**
 * Creates a new branch employee with encrypted credentials and role-based responsibilities.
 * Enforces platform-wide username uniqueness and bcrypt (cost 12) password hashing.
 */
export async function createEmployee(branchId: string, rawInput: CreateEmployeeInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const { user } = authContext;
  const parseResult = CreateEmployeeSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.issues[0]?.message || "Validation failed for employee details." 
    };
  }

  const data = parseResult.data;
  const normalizedUsername = data.username.toLowerCase().trim();
  const supabase = createServiceRoleClient();

  // 1. Check platform-wide username uniqueness in employees table
  const { data: existingEmp } = await supabase
    .from("employees")
    .select("id")
    .ilike("username", normalizedUsername)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingEmp) {
    return { 
      success: false, 
      error: `The username "${normalizedUsername}" is already taken platform-wide. Please choose another username.` 
    };
  }

  // 2. Check platform-wide username uniqueness in users table (admins / platform accounts)
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .ilike("username", normalizedUsername)
    .maybeSingle();

  if (existingUser) {
    return { 
      success: false, 
      error: `The username "${normalizedUsername}" is already taken platform-wide. Please choose another username.` 
    };
  }

  // 3. Hash password with bcrypt (cost factor 12)
  const passwordHash = await hashPassword(data.password);

  // 4. Default role-based permissions JSONB template
  const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[data.role] || {};

  // 5. Insert employee record
  const insertPayload = {
    branch_id: branchId,
    first_name: data.first_name,
    last_name: data.last_name,
    role: data.role,
    email: data.email || null,
    username: normalizedUsername,
    phone: data.phone || null,
    password_hash: passwordHash,
    status: data.status,
    permissions: defaultPermissions,
    employment_type: data.employment_type,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    created_by: user.id,
  };

  const { data: newEmployee, error: insertError } = await supabase
    .from("employees")
    .insert(insertPayload)
    .select("id, branch_id, external_id, first_name, last_name, role, email, username, phone, status, permissions, employment_type, start_date, end_date, created_at, updated_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505" || insertError.message?.includes("unique") || insertError.message?.includes("duplicate")) {
      return { 
        success: false, 
        error: `The username "${normalizedUsername}" is already taken platform-wide. Please choose another username.` 
      };
    }
    return { success: false, error: insertError.message };
  }

  const employeeId = newEmployee.id;

  // 6. Insert junction table associations
  if (data.assigned_section_ids && data.assigned_section_ids.length > 0) {
    const secRows = data.assigned_section_ids.map((secId) => ({
      employee_id: employeeId,
      section_id: secId,
    }));
    await supabase.from("employee_sections").insert(secRows);
  }

  if (data.assigned_shift_ids && data.assigned_shift_ids.length > 0) {
    const shiftRows = data.assigned_shift_ids.map((shiftId) => ({
      employee_id: employeeId,
      shift_id: shiftId,
    }));
    await supabase.from("employee_shifts").insert(shiftRows);
  }

  if (data.assigned_kitchen_ids && data.assigned_kitchen_ids.length > 0) {
    const kitRows = data.assigned_kitchen_ids.map((kitId) => ({
      employee_id: employeeId,
      kitchen_id: kitId,
    }));
    await supabase.from("employee_kitchens").insert(kitRows);
  }

  // 7. Check if an active Branch Manager was created to update completed_steps
  if (data.role === "manager" && data.status === "active") {
    const { data: branch } = await supabase
      .from("branches")
      .select("onboarding_progress")
      .eq("id", branchId)
      .single();

    if (branch && branch.onboarding_progress) {
      const currentCompleted = branch.onboarding_progress.completed_steps || [];
      if (!currentCompleted.includes(5)) {
        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...branch.onboarding_progress,
              completed_steps: [...currentCompleted, 5],
            },
          })
          .eq("id", branchId);
      }
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { 
    success: true, 
    employee: {
      ...newEmployee,
      assigned_section_ids: data.assigned_section_ids || [],
      assigned_shift_ids: data.assigned_shift_ids || [],
      assigned_kitchen_ids: data.assigned_kitchen_ids || [],
    } 
  };
}

/**
 * Updates an employee's details, role, responsibilities, or password.
 * Password is only rehashed if a non-empty string is provided.
 */
export async function updateEmployee(employeeId: string, rawInput: UpdateEmployeeInput) {
  const supabase = createServiceRoleClient();

  const { data: currentEmp } = await supabase
    .from("employees")
    .select("id, branch_id, role, status")
    .eq("id", employeeId)
    .single();

  if (!currentEmp) {
    return { success: false, error: "Employee not found." };
  }

  const authContext = await getAuthenticatedAdmin(currentEmp.branch_id);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const parseResult = UpdateEmployeeSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.issues[0]?.message || "Validation failed for employee details." 
    };
  }

  const data = parseResult.data;
  const normalizedUsername = data.username.toLowerCase().trim();

  // 1. Platform-wide username uniqueness check (excluding this employee)
  const { data: existingEmp } = await supabase
    .from("employees")
    .select("id")
    .ilike("username", normalizedUsername)
    .neq("id", employeeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingEmp) {
    return { 
      success: false, 
      error: `The username "${normalizedUsername}" is already taken platform-wide. Please choose another username.` 
    };
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .ilike("username", normalizedUsername)
    .maybeSingle();

  if (existingUser) {
    return { 
      success: false, 
      error: `The username "${normalizedUsername}" is already taken platform-wide. Please choose another username.` 
    };
  }

  // 2. Build update payload
  const updatePayload: any = {
    first_name: data.first_name,
    last_name: data.last_name,
    role: data.role,
    email: data.email || null,
    username: normalizedUsername,
    phone: data.phone || null,
    status: data.status,
    employment_type: data.employment_type,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    updated_at: new Date().toISOString(),
  };

  // If role changed, refresh default permissions
  if (data.role !== currentEmp.role) {
    updatePayload.permissions = DEFAULT_ROLE_PERMISSIONS[data.role] || {};
  }

  // Password reset check: only re-hash with bcrypt if a new password was provided
  if (data.password && data.password.trim().length > 0) {
    updatePayload.password_hash = await hashPassword(data.password);
  }

  const { data: updatedEmployee, error: updateError } = await supabase
    .from("employees")
    .update(updatePayload)
    .eq("id", employeeId)
    .select("id, branch_id, external_id, first_name, last_name, role, email, username, phone, status, permissions, employment_type, start_date, end_date, created_at, updated_at")
    .single();

  if (updateError) {
    if (updateError.code === "23505" || updateError.message?.includes("unique") || updateError.message?.includes("duplicate")) {
      return { 
        success: false, 
        error: `The username "${normalizedUsername}" is already taken platform-wide. Please choose another username.` 
      };
    }
    return { success: false, error: updateError.message };
  }

  // 3. Sync junction tables (delete existing + re-insert)
  await Promise.all([
    supabase.from("employee_sections").delete().eq("employee_id", employeeId),
    supabase.from("employee_shifts").delete().eq("employee_id", employeeId),
    supabase.from("employee_kitchens").delete().eq("employee_id", employeeId),
  ]);

  if (data.assigned_section_ids && data.assigned_section_ids.length > 0) {
    const secRows = data.assigned_section_ids.map((secId) => ({
      employee_id: employeeId,
      section_id: secId,
    }));
    await supabase.from("employee_sections").insert(secRows);
  }

  if (data.assigned_shift_ids && data.assigned_shift_ids.length > 0) {
    const shiftRows = data.assigned_shift_ids.map((shiftId) => ({
      employee_id: employeeId,
      shift_id: shiftId,
    }));
    await supabase.from("employee_shifts").insert(shiftRows);
  }

  if (data.assigned_kitchen_ids && data.assigned_kitchen_ids.length > 0) {
    const kitRows = data.assigned_kitchen_ids.map((kitId) => ({
      employee_id: employeeId,
      kitchen_id: kitId,
    }));
    await supabase.from("employee_kitchens").insert(kitRows);
  }

  // 4. Branch Manager gating check: update completed_steps if active manager exists or not
  const hasManager = await checkHasActiveBranchManager(supabase, currentEmp.branch_id);
  const { data: branch } = await supabase
    .from("branches")
    .select("onboarding_progress")
    .eq("id", currentEmp.branch_id)
    .single();

  if (branch && branch.onboarding_progress) {
    const currentCompleted = branch.onboarding_progress.completed_steps || [];
    if (!hasManager && currentCompleted.includes(5)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: currentCompleted.filter((s: number) => s !== 5),
          },
        })
        .eq("id", currentEmp.branch_id);
    } else if (hasManager && !currentCompleted.includes(5)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: [...currentCompleted, 5],
          },
        })
        .eq("id", currentEmp.branch_id);
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { 
    success: true, 
    employee: {
      ...updatedEmployee,
      assigned_section_ids: data.assigned_section_ids || [],
      assigned_shift_ids: data.assigned_shift_ids || [],
      assigned_kitchen_ids: data.assigned_kitchen_ids || [],
    } 
  };
}

/**
 * Toggles an employee's active / inactive status.
 * Preserves employee records and historical references.
 */
export async function toggleEmployeeStatus(employeeId: string, active: boolean) {
  const supabase = createServiceRoleClient();

  const { data: currentEmp } = await supabase
    .from("employees")
    .select("id, branch_id, role, status")
    .eq("id", employeeId)
    .single();

  if (!currentEmp) {
    return { success: false, error: "Employee not found." };
  }

  const authContext = await getAuthenticatedAdmin(currentEmp.branch_id);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const newStatus = active ? "active" : "inactive";

  const { error } = await supabase
    .from("employees")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Check Branch Manager gating status
  const hasManager = await checkHasActiveBranchManager(supabase, currentEmp.branch_id);
  const { data: branch } = await supabase
    .from("branches")
    .select("onboarding_progress")
    .eq("id", currentEmp.branch_id)
    .single();

  if (branch && branch.onboarding_progress) {
    const currentCompleted = branch.onboarding_progress.completed_steps || [];
    if (!hasManager && currentCompleted.includes(5)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: currentCompleted.filter((s: number) => s !== 5),
          },
        })
        .eq("id", currentEmp.branch_id);
    } else if (hasManager && !currentCompleted.includes(5)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: [...currentCompleted, 5],
          },
        })
        .eq("id", currentEmp.branch_id);
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { success: true, status: newStatus };
}

/**
 * Soft-deletes an employee record and deactivates status.
 */
export async function deleteEmployee(employeeId: string) {
  const supabase = createServiceRoleClient();

  const { data: currentEmp } = await supabase
    .from("employees")
    .select("id, branch_id, role")
    .eq("id", employeeId)
    .single();

  if (!currentEmp) {
    return { success: false, error: "Employee not found." };
  }

  const authContext = await getAuthenticatedAdmin(currentEmp.branch_id);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const { error } = await supabase
    .from("employees")
    .update({ 
      deleted_at: new Date().toISOString(), 
      status: "inactive",
      updated_at: new Date().toISOString() 
    })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Check Branch Manager gating status
  const hasManager = await checkHasActiveBranchManager(supabase, currentEmp.branch_id);
  const { data: branch } = await supabase
    .from("branches")
    .select("onboarding_progress")
    .eq("id", currentEmp.branch_id)
    .single();

  if (branch && branch.onboarding_progress) {
    const currentCompleted = branch.onboarding_progress.completed_steps || [];
    if (!hasManager && currentCompleted.includes(5)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: currentCompleted.filter((s: number) => s !== 5),
          },
        })
        .eq("id", currentEmp.branch_id);
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { success: true };
}

// ============================================================================
// 7. STEP 6: MENU ENGINEERING ACTIONS
// ============================================================================

/**
 * Helper: Checks if a branch meets the Step 6 gating requirement (at least 1 category with >= 1 item).
 */
async function checkHasMenuGatingMet(supabase: any, branchId: string): Promise<boolean> {
  // Query categories (try with deleted_at, fallback without)
  let categories: any[] | null = null;
  const { data: catWithDel, error: catDelErr } = await supabase
    .from("categories")
    .select("id")
    .eq("branch_id", branchId)
    .is("deleted_at", null);

  if (catDelErr) {
    const { data: catWithoutDel } = await supabase
      .from("categories")
      .select("id")
      .eq("branch_id", branchId);
    categories = catWithoutDel;
  } else {
    categories = catWithDel;
  }

  if (!categories || categories.length === 0) return false;

  const categoryIds = categories.map((c: any) => c.id);
  let items: any[] | null = null;
  const { data: itemsWithDel, error: itmDelErr } = await supabase
    .from("items")
    .select("id")
    .in("category_id", categoryIds)
    .is("deleted_at", null)
    .limit(1);

  if (itmDelErr) {
    const { data: itemsWithoutDel } = await supabase
      .from("items")
      .select("id")
      .in("category_id", categoryIds)
      .limit(1);
    items = itemsWithoutDel;
  } else {
    items = itemsWithDel;
  }

  return Boolean(items && items.length > 0);
}

/**
 * Upload an optimized menu image to Supabase Storage ('menu-images' bucket).
 */
export async function uploadMenuImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const authContext = await getAuthenticatedAdmin();
    if (!authContext) {
      return { success: false, error: "Unauthorized. Please sign in as an admin." };
    }

    const supabase = createServiceRoleClient();

    // Ensure 'menu-images' bucket exists
    try {
      await supabase.storage.createBucket("menu-images", { public: true });
    } catch {}

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const branchId = authContext.branch?.id || authContext.restaurant?.id || authContext.user.id;
    const fileExt = file.type?.includes("webp") ? "webp" : "jpg";
    const fileName = `${branchId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(fileName, buffer, {
        contentType: file.type || "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase Storage upload warning, using base64 fallback:", uploadError.message);
      const base64Url = `data:${file.type || "image/webp"};base64,${buffer.toString("base64")}`;
      return { success: true, url: base64Url };
    }

    const { data: publicData } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    return { success: true, url: publicData.publicUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to upload image." };
  }
}

/**
 * Creates a menu category.
 */
export async function createCategory(branchId: string, rawInput: CategoryInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const parsed = CategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid category data." };
  }

  const supabase = createServiceRoleClient();
  const isAvailable = parsed.data.is_available ?? true;
  const availabilityWithStatus = {
    ...parsed.data.availability,
    is_available: isAvailable,
  };

  const basePayload: Record<string, any> = {
    branch_id: branchId,
    name: parsed.data.name,
    image_url: parsed.data.image_url || null,
    availability: availabilityWithStatus,
    created_by: authContext.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let data: any = null;
  // First attempt: insert with is_available and description
  const { data: insertedWithAll, error: insertError } = await supabase
    .from("categories")
    .insert({
      ...basePayload,
      description: parsed.data.description || null,
      is_available: isAvailable,
    })
    .select()
    .single();

  if (insertError) {
    // If description or is_available column does not exist yet in schema cache, fallback gracefully
    if (insertError.message?.includes("column")) {
      const fallbackTags: any[] = [];
      if (parsed.data.description) fallbackTags.push({ key: "description", value: parsed.data.description });
      fallbackTags.push({ key: "is_available", value: isAvailable });

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("categories")
        .insert({
          ...basePayload,
          tags: fallbackTags,
        })
        .select()
        .single();

      if (fallbackError) {
        return { success: false, error: fallbackError.message };
      }
      data = {
        ...fallbackData,
        description: parsed.data.description || null,
        is_available: isAvailable,
      };
    } else {
      return { success: false, error: insertError.message };
    }
  } else {
    data = insertedWithAll;
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { success: true, category: data };
}

/**
 * Updates a menu category.
 */
export async function updateCategory(categoryId: string, rawInput: Partial<CategoryInput>) {
  const supabase = createServiceRoleClient();
  const { data: currentCat } = await supabase
    .from("categories")
    .select("id, branch_id, availability")
    .eq("id", categoryId)
    .single();

  if (!currentCat) {
    return { success: false, error: "Category not found." };
  }

  const authContext = await getAuthenticatedAdmin(currentCat.branch_id);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (rawInput.name !== undefined) updatePayload.name = rawInput.name.trim();
  if (rawInput.description !== undefined) updatePayload.description = rawInput.description?.trim() || null;
  if (rawInput.image_url !== undefined) updatePayload.image_url = rawInput.image_url || null;
  if (rawInput.is_available !== undefined) updatePayload.is_available = rawInput.is_available;

  if (rawInput.availability !== undefined || rawInput.is_available !== undefined) {
    const baseAvail = rawInput.availability || (currentCat.availability && typeof currentCat.availability === "object" ? currentCat.availability : { all_day: true });
    updatePayload.availability = {
      ...baseAvail,
      ...(rawInput.is_available !== undefined ? { is_available: rawInput.is_available } : {}),
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updatePayload)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    if (error.message?.includes("column")) {
      delete updatePayload.description;
      delete updatePayload.is_available;

      const fallbackTags: any[] = [];
      if (rawInput.description !== undefined) {
        fallbackTags.push({ key: "description", value: rawInput.description });
      }
      if (rawInput.is_available !== undefined) {
        fallbackTags.push({ key: "is_available", value: rawInput.is_available });
      }
      if (fallbackTags.length > 0) {
        updatePayload.tags = fallbackTags;
      }

      const { data: fbData, error: fbErr } = await supabase
        .from("categories")
        .update(updatePayload)
        .eq("id", categoryId)
        .select()
        .single();

      if (fbErr) return { success: false, error: fbErr.message };
      return {
        success: true,
        category: {
          ...fbData,
          description: rawInput.description !== undefined ? rawInput.description : (fbData.description || null),
          is_available: rawInput.is_available !== undefined ? rawInput.is_available : (fbData.is_available ?? true),
        },
      };
    }
    return { success: false, error: error.message };
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { success: true, category: data };
}

/**
 * Soft-deletes a category and cascades soft-delete to its child items.
 */
export async function deleteCategory(categoryId: string) {
  const supabase = createServiceRoleClient();
  const { data: currentCat } = await supabase
    .from("categories")
    .select("id, branch_id")
    .eq("id", categoryId)
    .single();

  if (!currentCat) {
    return { success: false, error: "Category not found." };
  }

  const authContext = await getAuthenticatedAdmin(currentCat.branch_id);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const now = new Date().toISOString();

  // Soft-delete category (fallback to hard delete if deleted_at column is not yet migrated)
  const { error: catSoftErr } = await supabase
    .from("categories")
    .update({ deleted_at: now, updated_at: now })
    .eq("id", categoryId);

  if (catSoftErr) {
    if (catSoftErr.message?.includes("deleted_at") || catSoftErr.message?.includes("column")) {
      await supabase.from("items").delete().eq("category_id", categoryId);
      await supabase.from("categories").delete().eq("id", categoryId);
    } else {
      return { success: false, error: catSoftErr.message };
    }
  } else {
    // Soft-delete items under this category
    const { error: itemSoftErr } = await supabase
      .from("items")
      .update({ deleted_at: now, updated_at: now })
      .eq("category_id", categoryId);

    if (itemSoftErr && (itemSoftErr.message?.includes("deleted_at") || itemSoftErr.message?.includes("column"))) {
      await supabase.from("items").delete().eq("category_id", categoryId);
    }
  }

  // Recalculate Step 6 gating
  const meetsGating = await checkHasMenuGatingMet(supabase, currentCat.branch_id);
  const { data: branch } = await supabase
    .from("branches")
    .select("onboarding_progress")
    .eq("id", currentCat.branch_id)
    .single();

  if (branch && branch.onboarding_progress) {
    const currentCompleted = branch.onboarding_progress.completed_steps || [];
    if (!meetsGating && currentCompleted.includes(6)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: currentCompleted.filter((s: number) => s !== 6),
          },
        })
        .eq("id", currentCat.branch_id);
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { success: true };
}

/**
 * Creates a menu item with variations and addon linkages.
 */
export async function createItem(branchId: string, rawInput: ItemInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const parsed = ItemSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid item data." };
  }

  const input = parsed.data;
  const supabase = createServiceRoleClient();
  const standardBasePrice = input.pricing_type === "single" ? input.base_price : (input.variations?.options[0]?.price || 0);

  // 1. Insert item record (try with full Step 6 columns, fallback gracefully if migration pending)
  let itemData: any = null;
  const fullPayload = {
    category_id: input.category_id,
    name: input.name,
    dietary_tag: input.dietary_tag,
    description: input.description || null,
    assigned_kitchen_id: input.assigned_kitchen_id || null,
    image_url: input.image_url || null,
    pricing_type: input.pricing_type,
    base_price: standardBasePrice,
    unit_value: input.unit_value || null,
    unit_type: input.unit_type || null,
    serving_info: input.serving_info || null,
    prep_time_minutes: input.prep_time_minutes !== undefined && input.prep_time_minutes !== null ? input.prep_time_minutes : 15,
    packaging_charge: input.packaging_charge || 0,
    availability: input.override_availability && input.availability ? input.availability : { all_day: true },
    out_of_stock: input.out_of_stock ?? false,
    created_by: authContext.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: insertedFull, error: itemError } = await supabase
    .from("items")
    .insert(fullPayload)
    .select()
    .single();

  if (itemError) {
    if (itemError.message?.includes("column")) {
      const fallbackTags = [
        { key: "dietary_tag", value: input.dietary_tag },
        { key: "packaging_charge", value: input.packaging_charge || 0 },
        { key: "unit_value", value: input.unit_value || null },
        { key: "unit_type", value: input.unit_type || null },
        { key: "pricing_type", value: input.pricing_type },
        { key: "out_of_stock", value: input.out_of_stock ?? false },
        { key: "serving_info", value: input.serving_info || null },
        { key: "prep_time_minutes", value: input.prep_time_minutes ?? 15 },
      ];

      const fallbackPayload = {
        category_id: input.category_id,
        name: input.name,
        description: input.description || null,
        assigned_kitchen_id: input.assigned_kitchen_id || null,
        image_url: input.image_url || null,
        base_price: standardBasePrice,
        availability: input.override_availability && input.availability ? input.availability : { all_day: true },
        tags: fallbackTags,
        created_by: authContext.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedFallback, error: fallbackError } = await supabase
        .from("items")
        .insert(fallbackPayload)
        .select()
        .single();

      if (fallbackError) {
        return { success: false, error: fallbackError.message };
      }

      itemData = {
        ...insertedFallback,
        dietary_tag: input.dietary_tag,
        packaging_charge: input.packaging_charge || 0,
        unit_value: input.unit_value || null,
        unit_type: input.unit_type || null,
        pricing_type: input.pricing_type,
        serving_info: input.serving_info || null,
        prep_time_minutes: input.prep_time_minutes ?? 15,
        out_of_stock: input.out_of_stock ?? false,
      };
    } else {
      return { success: false, error: itemError.message };
    }
  } else {
    itemData = insertedFull;
  }

  const itemId = itemData.id;
  let completeVariations: any = null;

  // 2. If variable pricing, insert variation group and options
  if (input.pricing_type === "variable" && input.variations && input.variations.options.length >= 2) {
    const { data: groupData, error: groupError } = await supabase
      .from("variation_groups")
      .insert({
        item_id: itemId,
        group_name: input.variations.group_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!groupError && groupData) {
      const optionsToInsert = input.variations.options.map((opt) => ({
        group_id: groupData.id,
        label: opt.label,
        unit_value: opt.unit_value || null,
        unit_type: opt.unit_type || null,
        serving_info: opt.serving_info || null,
        price: opt.price,
        external_id: opt.external_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: optionsData } = await supabase
        .from("variation_options")
        .insert(optionsToInsert)
        .select();

      completeVariations = {
        ...groupData,
        options: optionsData || [],
      };
    } else {
      // Fallback: save into legacy 'variations' table if variation_groups table is not yet created
      try {
        const { data: legVar } = await supabase
          .from("variations")
          .insert({
            item_id: itemId,
            group_name: input.variations.group_name,
            options: input.variations.options,
          })
          .select()
          .single();

        if (legVar) {
          completeVariations = legVar;
        }
      } catch {}
    }
  }

  // 3. Insert item_addons linkages (with table resilience)
  if (input.addon_ids && input.addon_ids.length > 0) {
    try {
      const addonRows = input.addon_ids.map((addonId) => ({
        item_id: itemId,
        addon_id: addonId,
        created_at: new Date().toISOString(),
      }));

      await supabase.from("item_addons").insert(addonRows);
    } catch {}
  }

  // 4. Update onboarding progress if gating requirement met
  const meetsGating = await checkHasMenuGatingMet(supabase, branchId);
  const { data: branch } = await supabase
    .from("branches")
    .select("onboarding_progress")
    .eq("id", branchId)
    .single();

  if (branch && branch.onboarding_progress) {
    const currentCompleted = branch.onboarding_progress.completed_steps || [];
    if (meetsGating && !currentCompleted.includes(6)) {
      await supabase
        .from("branches")
        .update({
          onboarding_progress: {
            ...branch.onboarding_progress,
            completed_steps: [...currentCompleted, 6],
          },
        })
        .eq("id", branchId);
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return {
    success: true,
    item: {
      ...itemData,
      variations: completeVariations,
      addon_ids: input.addon_ids || [],
    },
  };
}

/**
 * Updates a menu item with variations and addon linkages.
 */
export async function updateItem(itemId: string, rawInput: Partial<ItemInput>) {
  const supabase = createServiceRoleClient();
  const { data: currentItem } = await supabase
    .from("items")
    .select("id, category_id, out_of_stock")
    .eq("id", itemId)
    .single();

  if (!currentItem) {
    return { success: false, error: "Item not found." };
  }

  const { data: cat } = await supabase
    .from("categories")
    .select("branch_id")
    .eq("id", currentItem.category_id)
    .single();

  const branchId = cat?.branch_id;
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (rawInput.name !== undefined) updatePayload.name = rawInput.name.trim();
  if (rawInput.dietary_tag !== undefined) updatePayload.dietary_tag = rawInput.dietary_tag;
  if (rawInput.description !== undefined) updatePayload.description = rawInput.description?.trim() || null;
  if (rawInput.assigned_kitchen_id !== undefined) updatePayload.assigned_kitchen_id = rawInput.assigned_kitchen_id || null;
  if (rawInput.image_url !== undefined) updatePayload.image_url = rawInput.image_url || null;
  if (rawInput.category_id !== undefined) updatePayload.category_id = rawInput.category_id;
  if (rawInput.pricing_type !== undefined) updatePayload.pricing_type = rawInput.pricing_type;
  if (rawInput.base_price !== undefined) updatePayload.base_price = rawInput.base_price;
  if (rawInput.unit_value !== undefined) updatePayload.unit_value = rawInput.unit_value || null;
  if (rawInput.unit_type !== undefined) updatePayload.unit_type = rawInput.unit_type || null;
  if (rawInput.serving_info !== undefined) updatePayload.serving_info = rawInput.serving_info || null;
  if (rawInput.prep_time_minutes !== undefined) updatePayload.prep_time_minutes = rawInput.prep_time_minutes !== null ? rawInput.prep_time_minutes : 15;
  if (rawInput.packaging_charge !== undefined) updatePayload.packaging_charge = rawInput.packaging_charge || 0;
  if (rawInput.out_of_stock !== undefined) updatePayload.out_of_stock = rawInput.out_of_stock;
  if (rawInput.override_availability !== undefined) {
    updatePayload.availability = rawInput.override_availability && rawInput.availability ? rawInput.availability : { all_day: true };
  }

  let updatedItem: any = null;
  const { data: itemUpdData, error: updateError } = await supabase
    .from("items")
    .update(updatePayload)
    .eq("id", itemId)
    .select()
    .single();

  if (updateError) {
    if (updateError.message?.includes("column")) {
      const fallbackPayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (rawInput.name !== undefined) fallbackPayload.name = rawInput.name.trim();
      if (rawInput.description !== undefined) fallbackPayload.description = rawInput.description?.trim() || null;
      if (rawInput.assigned_kitchen_id !== undefined) fallbackPayload.assigned_kitchen_id = rawInput.assigned_kitchen_id || null;
      if (rawInput.image_url !== undefined) fallbackPayload.image_url = rawInput.image_url || null;
      if (rawInput.category_id !== undefined) fallbackPayload.category_id = rawInput.category_id;
      if (rawInput.base_price !== undefined) fallbackPayload.base_price = rawInput.base_price;
      if (rawInput.override_availability !== undefined) {
        fallbackPayload.availability = rawInput.override_availability && rawInput.availability ? rawInput.availability : { all_day: true };
      }

      fallbackPayload.tags = [
        { key: "dietary_tag", value: rawInput.dietary_tag || "veg" },
        { key: "packaging_charge", value: rawInput.packaging_charge || 0 },
        { key: "unit_value", value: rawInput.unit_value || null },
        { key: "unit_type", value: rawInput.unit_type || null },
        { key: "pricing_type", value: rawInput.pricing_type || "single" },
      ];
      if (rawInput.out_of_stock !== undefined) {
        fallbackPayload.tags.push({ key: "out_of_stock", value: rawInput.out_of_stock });
      }
      if (rawInput.serving_info !== undefined) {
        fallbackPayload.tags.push({ key: "serving_info", value: rawInput.serving_info });
      }
      if (rawInput.prep_time_minutes !== undefined) {
        fallbackPayload.tags.push({ key: "prep_time_minutes", value: rawInput.prep_time_minutes });
      }

      const { data: fbItem, error: fbErr } = await supabase
        .from("items")
        .update(fallbackPayload)
        .eq("id", itemId)
        .select()
        .single();

      if (fbErr) return { success: false, error: fbErr.message };
      updatedItem = {
        ...fbItem,
        dietary_tag: rawInput.dietary_tag || "veg",
        packaging_charge: rawInput.packaging_charge || 0,
        unit_value: rawInput.unit_value || null,
        unit_type: rawInput.unit_type || null,
        pricing_type: rawInput.pricing_type || "single",
        serving_info: rawInput.serving_info !== undefined ? rawInput.serving_info : (fbItem.serving_info || null),
        prep_time_minutes: rawInput.prep_time_minutes !== undefined ? rawInput.prep_time_minutes : (fbItem.prep_time_minutes ?? 15),
        out_of_stock: rawInput.out_of_stock !== undefined ? rawInput.out_of_stock : (fbItem.out_of_stock ?? false),
      };
    } else {
      return { success: false, error: updateError.message };
    }
  } else {
    updatedItem = itemUpdData;
  }

  // Handle variations update
  let completeVariations: any = null;
  if (rawInput.pricing_type === "variable" && rawInput.variations && rawInput.variations.options.length >= 2) {
    try {
      await supabase.from("variation_groups").delete().eq("item_id", itemId);

      const { data: groupData } = await supabase
        .from("variation_groups")
        .insert({
          item_id: itemId,
          group_name: rawInput.variations.group_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (groupData) {
        const optionsToInsert = rawInput.variations.options.map((opt) => ({
          group_id: groupData.id,
          label: opt.label,
          unit_value: opt.unit_value || null,
          unit_type: opt.unit_type || null,
          serving_info: opt.serving_info || null,
          price: opt.price,
          external_id: opt.external_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { data: optionsData } = await supabase
          .from("variation_options")
          .insert(optionsToInsert)
          .select();

        completeVariations = {
          ...groupData,
          options: optionsData || [],
        };
      }
    } catch {
      // Legacy variations fallback
      try {
        await supabase.from("variations").delete().eq("item_id", itemId);
        const { data: legVar } = await supabase
          .from("variations")
          .insert({
            item_id: itemId,
            group_name: rawInput.variations.group_name,
            options: rawInput.variations.options,
          })
          .select()
          .single();
        completeVariations = legVar;
      } catch {}
    }
  } else if (rawInput.pricing_type === "single") {
    try {
      await supabase.from("variation_groups").delete().eq("item_id", itemId);
      await supabase.from("variations").delete().eq("item_id", itemId);
    } catch {}
  }

  // Handle addon linkages
  if (rawInput.addon_ids !== undefined) {
    try {
      await supabase.from("item_addons").delete().eq("item_id", itemId);

      if (rawInput.addon_ids.length > 0) {
        const addonRows = rawInput.addon_ids.map((addonId) => ({
          item_id: itemId,
          addon_id: addonId,
          created_at: new Date().toISOString(),
        }));

        await supabase.from("item_addons").insert(addonRows);
      }
    } catch {}
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return {
    success: true,
    item: {
      ...updatedItem,
      variations: completeVariations,
      addon_ids: rawInput.addon_ids || [],
    },
  };
}

/**
 * Soft-deletes a menu item.
 */
export async function deleteItem(itemId: string) {
  const supabase = createServiceRoleClient();
  const { data: currentItem } = await supabase
    .from("items")
    .select("id, category_id")
    .eq("id", itemId)
    .single();

  if (!currentItem) {
    return { success: false, error: "Item not found." };
  }

  const { data: cat } = await supabase
    .from("categories")
    .select("branch_id")
    .eq("id", currentItem.category_id)
    .single();

  const branchId = cat?.branch_id;
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const now = new Date().toISOString();
  // Try soft delete, fallback to hard delete if deleted_at column is not yet migrated
  const { error } = await supabase
    .from("items")
    .update({ deleted_at: now, updated_at: now })
    .eq("id", itemId);

  if (error) {
    if (error.message?.includes("deleted_at") || error.message?.includes("column")) {
      await supabase.from("items").delete().eq("id", itemId);
    } else {
      return { success: false, error: error.message };
    }
  }

  // Recalculate Step 6 gating
  if (branchId) {
    const meetsGating = await checkHasMenuGatingMet(supabase, branchId);
    const { data: branch } = await supabase
      .from("branches")
      .select("onboarding_progress")
      .eq("id", branchId)
      .single();

    if (branch && branch.onboarding_progress) {
      const currentCompleted = branch.onboarding_progress.completed_steps || [];
      if (!meetsGating && currentCompleted.includes(6)) {
        await supabase
          .from("branches")
          .update({
            onboarding_progress: {
              ...branch.onboarding_progress,
              completed_steps: currentCompleted.filter((s: number) => s !== 6),
            },
          })
          .eq("id", branchId);
      }
    }
  }

  try {
    revalidatePath("/admin/onboarding");
  } catch {}

  return { success: true };
}

/**
 * Creates an add-on item.
 */
export async function createAddon(branchId: string, rawInput: AddonInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext) {
    return { success: false, error: "Unauthorized. Please sign in as an admin." };
  }

  const parsed = AddonSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid addon data." };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("addons")
    .insert({
      branch_id: branchId,
      name: parsed.data.name,
      price: parsed.data.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.message?.includes("column")) {
      // Fallback: insert without branch_id or timestamps if migration not yet applied
      const { data: fbAddon, error: fbErr } = await supabase
        .from("addons")
        .insert({
          name: parsed.data.name,
          price: parsed.data.price,
        })
        .select()
        .single();

      if (fbErr) return { success: false, error: fbErr.message };
      return { success: true, addon: fbAddon };
    }
    return { success: false, error: error.message };
  }

  return { success: true, addon: data };
}

/**
 * Fetches all addons for a branch.
 */
export async function getBranchAddons(branchId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("branch_id", branchId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    // Fallback: query without branch_id / deleted_at
    const { data: allAddons, error: allErr } = await supabase
      .from("addons")
      .select("*")
      .order("name", { ascending: true });

    if (allErr) {
      return { success: false, error: allErr.message, addons: [] };
    }
    return { success: true, addons: allAddons || [] };
  }

  return { success: true, addons: data || [] };
}

// ==============================================================================
// STEP 7: TAX RULES, PROMO CODES, CHARGE SETTINGS & ONBOARDING COMPLETION
// ==============================================================================

/**
 * Updates the global price display mode (exclusive or inclusive) on branches.
 */
export async function updatePriceDisplayMode(branchId: string, mode: "exclusive" | "inclusive") {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("branches")
    .update({ 
      price_display_mode: mode,
      updated_at: new Date().toISOString() 
    })
    .eq("id", branchId);

  if (error) {
    // ADR-018 graceful fallback to branch onboarding_progress JSONB
    const rawProgress = (authContext.branch as any)?.onboarding_progress || {};
    const { error: fbErr } = await supabase
      .from("branches")
      .update({
        onboarding_progress: {
          ...rawProgress,
          price_display_mode: mode,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", branchId);

    if (fbErr) return { success: false, error: fbErr.message };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, mode };
}

/**
 * Creates a new tax rule for a branch.
 */
export async function createTaxRule(branchId: string, rawInput: TaxRuleInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = TaxRuleInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid tax rule payload." };
  }

  const supabase = createServiceRoleClient();
  const payload = {
    branch_id: branchId,
    name: parsed.data.name,
    type: "GST",
    revenue_classification: parsed.data.revenue_classification || "government_tax",
    gst_classification: parsed.data.gst_classification,
    is_discretionary: parsed.data.is_discretionary || false,
    calculation_type: parsed.data.calculation_type,
    tax_type: parsed.data.tax_type,
    calculation_mode: parsed.data.tax_type,
    rate: parsed.data.rate,
    applies_to: parsed.data.applies_to,
    order_channels: parsed.data.order_channels,
    active: parsed.data.active,
    created_by: authContext.user.id,
  };

  const { data, error } = await supabase
    .from("tax_rules")
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Graceful fallback if specific column is not present in legacy cache (ADR-018)
    const fallbackPayload = {
      branch_id: branchId,
      name: parsed.data.name,
      type: "GST",
      rate: parsed.data.rate,
      calculation_mode: parsed.data.tax_type,
      applies_to: parsed.data.applies_to,
      location_scope: {
        revenue_classification: parsed.data.revenue_classification || "government_tax",
        gst_classification: parsed.data.gst_classification,
        is_discretionary: parsed.data.is_discretionary || false,
        calculation_type: parsed.data.calculation_type,
        order_channels: parsed.data.order_channels,
      },
      active: parsed.data.active,
      created_by: authContext.user.id,
    };
    const { data: fbData, error: fbError } = await supabase
      .from("tax_rules")
      .insert(fallbackPayload)
      .select()
      .single();

    if (fbError) return { success: false, error: fbError.message };
    return { 
      success: true, 
      taxRule: {
        ...fbData,
        revenue_classification: parsed.data.revenue_classification || "government_tax",
        gst_classification: parsed.data.gst_classification,
        is_discretionary: parsed.data.is_discretionary || false,
        calculation_type: parsed.data.calculation_type,
        tax_type: parsed.data.tax_type,
        order_channels: parsed.data.order_channels,
      } 
    };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, taxRule: data };
}

/**
 * Updates an existing tax rule.
 */
export async function updateTaxRule(ruleId: string, rawInput: Partial<TaxRuleInput>) {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (rawInput.name !== undefined) updateData.name = rawInput.name.trim();
  if (rawInput.revenue_classification !== undefined) updateData.revenue_classification = rawInput.revenue_classification;
  if (rawInput.gst_classification !== undefined) updateData.gst_classification = rawInput.gst_classification;
  if (rawInput.is_discretionary !== undefined) updateData.is_discretionary = rawInput.is_discretionary;
  if (rawInput.calculation_type !== undefined) updateData.calculation_type = rawInput.calculation_type;
  if (rawInput.tax_type !== undefined) {
    updateData.tax_type = rawInput.tax_type;
    updateData.calculation_mode = rawInput.tax_type;
  }
  if (rawInput.rate !== undefined) updateData.rate = Number(rawInput.rate);
  if (rawInput.applies_to !== undefined) updateData.applies_to = rawInput.applies_to;
  if (rawInput.order_channels !== undefined) updateData.order_channels = rawInput.order_channels;
  if (rawInput.active !== undefined) updateData.active = rawInput.active;

  const { data, error } = await supabase
    .from("tax_rules")
    .update(updateData)
    .eq("id", ruleId)
    .select()
    .single();

  if (error) {
    // ADR-018: fallback to location_scope
    const { data: existingRule } = await supabase.from("tax_rules").select("*").eq("id", ruleId).maybeSingle();
    const existingScope = (existingRule?.location_scope && typeof existingRule.location_scope === "object") ? existingRule.location_scope : {};

    const fbUpdate: any = {
      updated_at: new Date().toISOString(),
    };
    if (rawInput.name !== undefined) fbUpdate.name = rawInput.name.trim();
    if (rawInput.tax_type !== undefined) fbUpdate.calculation_mode = rawInput.tax_type;
    if (rawInput.rate !== undefined) fbUpdate.rate = Number(rawInput.rate);
    if (rawInput.applies_to !== undefined) fbUpdate.applies_to = rawInput.applies_to;
    if (rawInput.active !== undefined) fbUpdate.active = rawInput.active;
    fbUpdate.location_scope = {
      ...existingScope,
      ...(rawInput.revenue_classification !== undefined ? { revenue_classification: rawInput.revenue_classification } : {}),
      ...(rawInput.gst_classification !== undefined ? { gst_classification: rawInput.gst_classification } : {}),
      ...(rawInput.is_discretionary !== undefined ? { is_discretionary: rawInput.is_discretionary } : {}),
      ...(rawInput.calculation_type !== undefined ? { calculation_type: rawInput.calculation_type } : {}),
      ...(rawInput.order_channels !== undefined ? { order_channels: rawInput.order_channels } : {}),
    };

    const { data: fbData, error: fbError } = await supabase
      .from("tax_rules")
      .update(fbUpdate)
      .eq("id", ruleId)
      .select()
      .single();

    if (fbError) return { success: false, error: fbError.message };
    return {
      success: true,
      taxRule: {
        ...fbData,
        revenue_classification: fbData.location_scope?.revenue_classification || "government_tax",
        gst_classification: fbData.location_scope?.gst_classification || "services",
        is_discretionary: Boolean(fbData.location_scope?.is_discretionary),
        calculation_type: fbData.location_scope?.calculation_type || "percentage",
        tax_type: fbData.calculation_mode || "exclusive",
        order_channels: fbData.location_scope?.order_channels || ["dine_in", "takeaway", "online"],
      }
    };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, taxRule: data };
}

/**
 * Toggles a tax rule active/inactive.
 */
export async function toggleTaxRuleStatus(ruleId: string, active: boolean) {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tax_rules")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", ruleId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, taxRule: data };
}

/**
 * Soft-deletes a tax rule.
 */
export async function deleteTaxRule(ruleId: string) {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("tax_rules")
    .update({ 
      deleted_at: new Date().toISOString(),
      active: false 
    })
    .eq("id", ruleId);

  if (error) {
    // Fallback: hard delete if deleted_at column is not present
    const { error: delErr } = await supabase.from("tax_rules").delete().eq("id", ruleId);
    if (delErr) return { success: false, error: delErr.message };
  }

  revalidatePath("/admin/onboarding");
  return { success: true };
}

/**
 * Creates a new promo code for a branch.
 */
export async function createPromoCode(branchId: string, rawInput: PromoCodeInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = PromoCodeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid promo code payload." };
  }

  const supabase = createServiceRoleClient();

  // Check unique coupon code for this branch
  const { data: existing } = await supabase
    .from("promo_codes")
    .select("id")
    .eq("branch_id", branchId)
    .ilike("code", parsed.data.code)
    .is("deleted_at", null)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: `Coupon code "${parsed.data.code}" already exists for this branch.` };
  }

  const payload = {
    branch_id: branchId,
    title: parsed.data.title,
    code: parsed.data.code,
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    max_discount_cap: parsed.data.max_discount_cap || null,
    min_bill_amount: parsed.data.min_bill_amount || null,
    applicable_order_types: parsed.data.applicable_order_types,
    start_date: parsed.data.no_expiry ? null : (parsed.data.start_date || null),
    end_date: parsed.data.no_expiry ? null : (parsed.data.end_date || null),
    no_expiry: parsed.data.no_expiry,
    active: parsed.data.active,
    created_by: authContext.user.id,
  };

  const { data, error } = await supabase
    .from("promo_codes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    // ADR-018: fallback to branch.onboarding_progress.promo_codes JSONB
    const rawProgress = (authContext.branch as any)?.onboarding_progress || {};
    const existingPromos: any[] = Array.isArray(rawProgress.promo_codes) ? rawProgress.promo_codes : [];

    if (existingPromos.some((p: any) => !p.deleted_at && p.code.toLowerCase() === parsed.data.code.toLowerCase())) {
      return { success: false, error: `Coupon code "${parsed.data.code}" already exists for this branch.` };
    }

    const newPromo = {
      id: "promo-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    const updatedPromos = [...existingPromos, newPromo];
    const { error: fbErr } = await supabase
      .from("branches")
      .update({
        onboarding_progress: {
          ...rawProgress,
          promo_codes: updatedPromos,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", branchId);

    if (fbErr) return { success: false, error: fbErr.message };
    revalidatePath("/admin/onboarding");
    return { success: true, promoCode: newPromo };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, promoCode: data };
}

/**
 * Updates an existing promo code.
 */
export async function updatePromoCode(promoId: string, rawInput: Partial<PromoCodeInput>) {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (rawInput.title !== undefined) updateData.title = rawInput.title.trim();
  if (rawInput.code !== undefined) {
    const normCode = rawInput.code.toUpperCase().replace(/\s+/g, "");
    updateData.code = normCode;
  }
  if (rawInput.discount_type !== undefined) updateData.discount_type = rawInput.discount_type;
  if (rawInput.discount_value !== undefined) updateData.discount_value = Number(rawInput.discount_value);
  if (rawInput.max_discount_cap !== undefined) updateData.max_discount_cap = rawInput.max_discount_cap !== null ? Number(rawInput.max_discount_cap) : null;
  if (rawInput.min_bill_amount !== undefined) updateData.min_bill_amount = rawInput.min_bill_amount !== null ? Number(rawInput.min_bill_amount) : null;
  if (rawInput.applicable_order_types !== undefined) updateData.applicable_order_types = rawInput.applicable_order_types;
  if (rawInput.no_expiry !== undefined) {
    updateData.no_expiry = rawInput.no_expiry;
    if (rawInput.no_expiry) {
      updateData.start_date = null;
      updateData.end_date = null;
    } else {
      if (rawInput.start_date !== undefined) updateData.start_date = rawInput.start_date;
      if (rawInput.end_date !== undefined) updateData.end_date = rawInput.end_date;
    }
  }
  if (rawInput.active !== undefined) updateData.active = rawInput.active;

  const { data, error } = await supabase
    .from("promo_codes")
    .update(updateData)
    .eq("id", promoId)
    .select()
    .single();

  if (error) {
    // ADR-018: fallback to branch.onboarding_progress.promo_codes
    const rawProgress = (authContext.branch as any)?.onboarding_progress || {};
    const existingPromos: any[] = Array.isArray(rawProgress.promo_codes) ? rawProgress.promo_codes : [];
    let updatedPromoObj: any = null;

    const updatedPromos = existingPromos.map((p: any) => {
      if (p.id === promoId) {
        updatedPromoObj = { ...p, ...updateData };
        return updatedPromoObj;
      }
      return p;
    });

    if (!updatedPromoObj) return { success: false, error: "Promo code not found." };

    const { error: fbErr } = await supabase
      .from("branches")
      .update({
        onboarding_progress: {
          ...rawProgress,
          promo_codes: updatedPromos,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", authContext.branch.id);

    if (fbErr) return { success: false, error: fbErr.message };
    revalidatePath("/admin/onboarding");
    return { success: true, promoCode: updatedPromoObj };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, promoCode: data };
}

/**
 * Toggles a promo code active/inactive.
 */
export async function togglePromoCodeStatus(promoId: string, active: boolean) {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", promoId)
    .select()
    .single();

  if (error) {
    // ADR-018: fallback to branch.onboarding_progress.promo_codes
    const rawProgress = (authContext.branch as any)?.onboarding_progress || {};
    const existingPromos: any[] = Array.isArray(rawProgress.promo_codes) ? rawProgress.promo_codes : [];
    let toggledObj: any = null;

    const updatedPromos = existingPromos.map((p: any) => {
      if (p.id === promoId) {
        toggledObj = { ...p, active, updated_at: new Date().toISOString() };
        return toggledObj;
      }
      return p;
    });

    if (!toggledObj) return { success: false, error: "Promo code not found." };

    const { error: fbErr } = await supabase
      .from("branches")
      .update({
        onboarding_progress: {
          ...rawProgress,
          promo_codes: updatedPromos,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", authContext.branch.id);

    if (fbErr) return { success: false, error: fbErr.message };
    return { success: true, promoCode: toggledObj };
  }

  return { success: true, promoCode: data };
}

/**
 * Soft-deletes a promo code.
 */
export async function deletePromoCode(promoId: string) {
  const authContext = await getAuthenticatedAdmin();
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("promo_codes")
    .update({ 
      deleted_at: new Date().toISOString(),
      active: false 
    })
    .eq("id", promoId);

  if (error) {
    // ADR-018: fallback to branch.onboarding_progress.promo_codes
    const rawProgress = (authContext.branch as any)?.onboarding_progress || {};
    const existingPromos: any[] = Array.isArray(rawProgress.promo_codes) ? rawProgress.promo_codes : [];
    const updatedPromos = existingPromos.filter((p: any) => p.id !== promoId);

    const { error: fbErr } = await supabase
      .from("branches")
      .update({
        onboarding_progress: {
          ...rawProgress,
          promo_codes: updatedPromos,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", authContext.branch.id);

    if (fbErr) {
      const { error: delErr } = await supabase.from("promo_codes").delete().eq("id", promoId);
      if (delErr) return { success: false, error: delErr.message };
    }
  }

  revalidatePath("/admin/onboarding");
  return { success: true };
}

/**
 * Saves branch charge settings (service charges & packaging charges).
 */
export async function saveBranchChargeSettings(branchId: string, rawInput: BranchChargeSettingsInput) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = BranchChargeSettingsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid charge settings payload." };
  }

  const supabase = createServiceRoleClient();
  const payload = {
    branch_id: branchId,
    service_charge_enabled: parsed.data.service_charge_enabled,
    service_charge_type: parsed.data.service_charge_type,
    service_charge_rate: parsed.data.service_charge_rate,
    service_charge_bill_note: parsed.data.service_charge_bill_note,
    packaging_charge_enabled: parsed.data.packaging_charge_enabled,
    packaging_charge_type: parsed.data.packaging_charge_type,
    packaging_charge_order_amount: parsed.data.packaging_charge_order_amount,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("branch_charge_settings")
    .upsert(payload, { onConflict: "branch_id" })
    .select()
    .single();

  if (error) {
    // ADR-018: fallback to branch.onboarding_progress.charge_settings
    const rawProgress = (authContext.branch as any)?.onboarding_progress || {};
    const { error: fbErr } = await supabase
      .from("branches")
      .update({
        onboarding_progress: {
          ...rawProgress,
          charge_settings: payload,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", branchId);

    if (fbErr) return { success: false, error: fbErr.message };
    revalidatePath("/admin/onboarding");
    return { success: true, chargeSettings: payload };
  }

  revalidatePath("/admin/onboarding");
  return { success: true, chargeSettings: data };
}

/**
 * Final Onboarding Completion Gate:
 * Verifies that at least 1 tax rule exists for the branch,
 * marks branches.status = 'active', and marks all 7 steps complete in onboarding_progress.
 */
export async function completeBranchOnboarding(branchId: string) {
  const authContext = await getAuthenticatedAdmin(branchId);
  if (!authContext || !authContext.branch) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createServiceRoleClient();

  // 1. Mandatory Gate: At least one active tax rule required
  const { data: taxRules, error: taxError } = await supabase
    .from("tax_rules")
    .select("id")
    .eq("branch_id", branchId)
    .eq("active", true)
    .limit(1);

  if (taxError || !taxRules || taxRules.length === 0) {
    return { 
      success: false, 
      error: "At least one active Tax Rule must be added before completing onboarding." 
    };
  }

  // 2. Set branches.status = 'active' and mark all 7 steps complete
  const allCompletedSteps = [1, 2, 3, 4, 5, 6, 7];
  const { data: updatedBranch, error: updateError } = await supabase
    .from("branches")
    .update({
      status: "active",
      onboarding_progress: {
        current_step: 7,
        completed_steps: allCompletedSteps,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", branchId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/onboarding");

  return { 
    success: true, 
    branch: updatedBranch,
    redirectUrl: "/admin" 
  };
}



