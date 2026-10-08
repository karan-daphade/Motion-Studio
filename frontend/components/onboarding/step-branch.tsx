"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { 
  Store, 
  MapPin, 
  Phone, 
  User, 
  Globe, 
  Compass, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  Navigation,
  Star,
  Share2,
  HelpCircle
} from "lucide-react";
import UniversalImageCropper from "./universal-image-cropper";
import { branding } from "@/config/branding";
import { BranchSetupSchema, type BranchSetupInput, GSTIN_REGEX, PHONE_REGEX, PIN_CODE_REGEX } from "@/lib/onboarding/schemas";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi (NCT)", "Chandigarh",
  "Puducherry", "Jammu & Kashmir", "Ladakh"
];

export interface StepBranchRef {
  triggerAutosave: () => Promise<boolean>;
}

interface StepBranchProps {
  initialBranch: any | null;
  onSaveSuccess: (savedBranch: any) => void;
  onSaveAction: (data: BranchSetupInput) => Promise<{ success: boolean; branch?: any; error?: string }>;
  isFirstBranch?: boolean;
  isSettingsMode?: boolean;
}

const StepBranch = forwardRef<StepBranchRef, StepBranchProps>(function StepBranch(
  { initialBranch, onSaveSuccess, onSaveAction, isFirstBranch = false, isSettingsMode = false },
  ref
) {
  // Extract initial values
  const meta = initialBranch?.onboarding_progress?.branch_meta || {};
  const [formData, setFormData] = useState<BranchSetupInput>({
    name: initialBranch?.name || "",
    address: initialBranch?.address || "",
    city: initialBranch?.city || meta.city || "",
    state: initialBranch?.state || meta.state || "Maharashtra",
    pin_code: initialBranch?.pin_code || meta.pin_code || "",
    latitude: initialBranch?.latitude ? Number(initialBranch.latitude) : null,
    longitude: initialBranch?.longitude ? Number(initialBranch.longitude) : null,
    google_maps_url: initialBranch?.google_maps_url || "",
    phone: initialBranch?.phone || "",
    gstin: initialBranch?.gstin || "",
    manager_name: initialBranch?.manager_name || "",
    manager_phone: initialBranch?.manager_phone || "",
    timezone: initialBranch?.timezone || "Asia/Kolkata",
    google_review_link: initialBranch?.google_review_link || "",
    logo_image_url: initialBranch?.logo_image_url || "",
    facebook_url: initialBranch?.facebook_url || "",
    instagram_url: initialBranch?.instagram_url || "",
    youtube_url: initialBranch?.youtube_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [saveBanner, setSaveBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync if initial branch changes
  useEffect(() => {
    if (initialBranch) {
      const bMeta = initialBranch?.onboarding_progress?.branch_meta || {};
      setFormData((prev) => ({
        ...prev,
        name: initialBranch.name || prev.name,
        address: initialBranch.address || prev.address,
        city: initialBranch.city || bMeta.city || prev.city,
        state: initialBranch.state || bMeta.state || prev.state,
        pin_code: initialBranch.pin_code || bMeta.pin_code || prev.pin_code,
        latitude: initialBranch.latitude ? Number(initialBranch.latitude) : prev.latitude,
        longitude: initialBranch.longitude ? Number(initialBranch.longitude) : prev.longitude,
        google_maps_url: initialBranch.google_maps_url || prev.google_maps_url,
        phone: initialBranch.phone || prev.phone,
        gstin: initialBranch.gstin || prev.gstin,
        manager_name: initialBranch.manager_name || prev.manager_name,
        manager_phone: initialBranch.manager_phone || prev.manager_phone,
        timezone: initialBranch.timezone || prev.timezone,
        google_review_link: initialBranch.google_review_link || prev.google_review_link,
        logo_image_url: initialBranch.logo_image_url || prev.logo_image_url,
        facebook_url: initialBranch.facebook_url || prev.facebook_url,
        instagram_url: initialBranch.instagram_url || prev.instagram_url,
        youtube_url: initialBranch.youtube_url || prev.youtube_url,
      }));
    }
  }, [initialBranch]);

  const handleChange = (field: keyof BranchSetupInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setSaveBanner({ type: "error", message: "Geolocation is not supported by your browser." });
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        handleChange("latitude", lat);
        handleChange("longitude", lng);
        setSaveBanner({
          type: "success",
          message: `GPS coordinates captured: ${lat}, ${lng}`,
        });
      },
      (err) => {
        setGeoLoading(false);
        setSaveBanner({
          type: "error",
          message: `GPS error: ${err.message || "Unable to retrieve device location."}`,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Perform form validation
  const validateForm = (): boolean => {
    const result = BranchSetupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setSaveBanner({
        type: "error",
        message: result.error.issues[0]?.message || "Please resolve highlighted form errors.",
      });
      return false;
    }
    setErrors({});
    return true;
  };

  // Submit action
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return false;

    setIsSubmitting(true);
    setSaveBanner(null);

    try {
      const res = await onSaveAction(formData);
      setIsSubmitting(false);

      if (!res.success) {
        setSaveBanner({ type: "error", message: res.error || "Failed to save branch details." });
        return false;
      }

      setSaveBanner({ type: "success", message: "Branch setup saved successfully!" });
      if (res.branch) {
        onSaveSuccess(res.branch);
      }
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSaveBanner({ type: "error", message: err?.message || "Unexpected network error." });
      return false;
    }
  };

  // Expose autosave method to parent via ref
  useImperativeHandle(ref, () => ({
    triggerAutosave: async () => {
      // If form has non-empty name, attempt save
      if (formData.name && formData.name.trim().length >= 2) {
        return await handleSave();
      }
      return false;
    },
  }));

  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* Step Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary font-bold">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
                {isSettingsMode ? "Branch Profile & Compliance" : (isFirstBranch ? "Create Your First Branch" : "Step 1: Branch Setup")}
              </h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                {isSettingsMode 
                  ? "Update physical outlet identity, GPS coordinates, brand logo, Google review link, and GST tax settings."
                  : "Establish the physical identity, location coordinates, manager contact, and GST compliance for this outlet."}
              </p>
            </div>
          </div>
        </div>

        {!isSettingsMode && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-brand-text-muted">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Status: Onboarding In Progress</span>
          </div>
        )}
      </div>

      {/* Alert Banner */}
      {saveBanner && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-xl p-4 border text-xs sm:text-sm font-medium transition-all ${
            saveBanner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {saveBanner.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <span>{saveBanner.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Basic Branch Identity */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-secondary mb-4 pb-2 border-b border-brand-border/40">
            <Building2 className="h-4 w-4 text-brand-primary" />
            <span>Outlet Profile</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="branchName" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Branch Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="branchName"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Spice Garden — Indiranagar Outlet"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="branchPhone" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Outlet Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-brand-text-muted font-mono">
                  +91
                </span>
                <input
                  id="branchPhone"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className={`w-full rounded-xl border pl-12 pr-3.5 py-2.5 text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                      : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
            </div>

            {/* Branch Logo / Profile Image using UniversalImageCropper */}
            <div className="sm:col-span-2 pt-2">
              <label className="block text-xs font-bold text-brand-secondary mb-1.5">
                Branch Logo / Profile Image <span className="text-xs text-brand-text-muted font-normal">(Optional, 1:1 Aspect Ratio)</span>
              </label>
              <UniversalImageCropper
                value={formData.logo_image_url}
                onChange={(url) => handleChange("logo_image_url", url)}
                onRemove={() => handleChange("logo_image_url", "")}
                label="Upload Branch Logo"
                description="Upload your restaurant/outlet logo. It appears on digital receipts, QR ordering menus, and printed bills."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Physical Address & Geolocation */}
        <div>
          <div className="flex items-center justify-between text-sm font-bold text-brand-secondary mb-4 pb-2 border-b border-brand-border/40">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-primary" />
              <span>Physical Address & GPS</span>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/30 bg-brand-primary-light px-2.5 py-1 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
            >
              {geoLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              <span>{geoLoading ? "Detecting..." : "Detect Location via GPS"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label htmlFor="address" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="address"
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Building number, Street name, Landmark, Area"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.address
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-bold text-brand-secondary mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="e.g. Pune"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.city
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.city && <p className="mt-1 text-xs text-rose-600">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-xs font-bold text-brand-secondary mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-xs text-rose-600">{errors.state}</p>}
            </div>

            <div>
              <label htmlFor="pinCode" className="block text-xs font-bold text-brand-secondary mb-1.5">
                PIN Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="pinCode"
                type="text"
                maxLength={6}
                value={formData.pin_code}
                onChange={(e) => handleChange("pin_code", e.target.value.replace(/\D/g, ""))}
                placeholder="411001"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                  errors.pin_code
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.pin_code && <p className="mt-1 text-xs text-rose-600">{errors.pin_code}</p>}
            </div>

            <div>
              <label htmlFor="latitude" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Latitude (Optional)
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude !== null && formData.latitude !== undefined ? formData.latitude : ""}
                onChange={(e) => handleChange("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="18.5204"
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-mono focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
              </input>
            </div>

            <div>
              <label htmlFor="longitude" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Longitude (Optional)
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude !== null && formData.longitude !== undefined ? formData.longitude : ""}
                onChange={(e) => handleChange("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="73.8567"
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-mono focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label htmlFor="googleMapsUrl" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Google Maps URL (Optional)
              </label>
              <input
                id="googleMapsUrl"
                type="url"
                value={formData.google_maps_url || ""}
                onChange={(e) => handleChange("google_maps_url", e.target.value)}
                placeholder="https://maps.google.com/..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.google_maps_url
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.google_maps_url && <p className="mt-1 text-xs text-rose-600">{errors.google_maps_url}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Manager Details & Tax Compliance */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-secondary mb-4 pb-2 border-b border-brand-border/40">
            <FileText className="h-4 w-4 text-brand-primary" />
            <span>Manager & GST Compliance</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="managerName" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Branch Manager Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="managerName"
                type="text"
                value={formData.manager_name}
                onChange={(e) => handleChange("manager_name", e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.manager_name
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.manager_name && <p className="mt-1 text-xs text-rose-600">{errors.manager_name}</p>}
            </div>

            <div>
              <label htmlFor="managerPhone" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Manager Mobile <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-brand-text-muted font-mono">
                  +91
                </span>
                <input
                  id="managerPhone"
                  type="tel"
                  maxLength={10}
                  value={formData.manager_phone}
                  onChange={(e) => handleChange("manager_phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="9823456789"
                  className={`w-full rounded-xl border pl-12 pr-3.5 py-2.5 text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                    errors.manager_phone
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                  }`}
                />
              </div>
              {errors.manager_phone && <p className="mt-1 text-xs text-rose-600">{errors.manager_phone}</p>}
            </div>

            <div>
              <label htmlFor="gstin" className="block text-xs font-bold text-brand-secondary mb-1.5">
                GSTIN (Tax Identification) <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
              </label>
              <input
                id="gstin"
                type="text"
                maxLength={15}
                value={formData.gstin || ""}
                onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                placeholder="27AAAAA0000A1Z5"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider transition-all focus:outline-none focus:ring-2 ${
                  errors.gstin
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.gstin && <p className="mt-1 text-xs text-rose-600">{errors.gstin}</p>}
              <p className="mt-1 text-[11px] text-brand-text-muted">
                Optional. 15-digit alphanumeric format required if issuing B2B GST tax invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Customer Reviews & Social Media Links */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-secondary mb-4 pb-2 border-b border-brand-border/40">
            <Share2 className="h-4 w-4 text-brand-primary" />
            <span>Online Presence & Social Links</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Google Review Link with Tooltip */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="googleReviewLink" className="flex items-center gap-1.5 text-xs font-bold text-brand-secondary">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Google Review Link</span>
                  <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
                </label>
                <div className="group relative flex items-center">
                  <span className="inline-flex items-center gap-1 text-[11px] text-brand-primary cursor-pointer hover:underline">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>How to find this?</span>
                  </span>
                  <div className="absolute right-0 bottom-full mb-2 hidden w-72 rounded-xl bg-brand-secondary p-3 text-[11px] text-white shadow-xl group-hover:block z-20 pointer-events-none">
                    Go to your <strong>Google Business Profile</strong> &rarr; Click <strong>&quot;Ask for reviews&quot;</strong> &rarr; Copy the link provided.
                  </div>
                </div>
              </div>
              <input
                id="googleReviewLink"
                type="url"
                value={formData.google_review_link || ""}
                onChange={(e) => handleChange("google_review_link", e.target.value)}
                placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.google_review_link
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.google_review_link && (
                <p className="mt-1 text-xs text-rose-600">{errors.google_review_link}</p>
              )}
              <p className="mt-1 text-[11px] text-brand-text-muted">
                Customers can tap this directly from their digital receipt to leave your outlet a 5-star Google review.
              </p>
            </div>

            {/* Facebook URL */}
            <div>
              <label htmlFor="facebookUrl" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Facebook Page URL <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
              </label>
              <input
                id="facebookUrl"
                type="url"
                value={formData.facebook_url || ""}
                onChange={(e) => handleChange("facebook_url", e.target.value)}
                placeholder="https://facebook.com/yourbrand"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.facebook_url
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.facebook_url && (
                <p className="mt-1 text-xs text-rose-600">{errors.facebook_url}</p>
              )}
            </div>

            {/* Instagram URL */}
            <div>
              <label htmlFor="instagramUrl" className="block text-xs font-bold text-brand-secondary mb-1.5">
                Instagram Profile URL <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
              </label>
              <input
                id="instagramUrl"
                type="url"
                value={formData.instagram_url || ""}
                onChange={(e) => handleChange("instagram_url", e.target.value)}
                placeholder="https://instagram.com/yourbrand"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.instagram_url
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.instagram_url && (
                <p className="mt-1 text-xs text-rose-600">{errors.instagram_url}</p>
              )}
            </div>

            {/* YouTube URL */}
            <div className="sm:col-span-2">
              <label htmlFor="youtubeUrl" className="block text-xs font-bold text-brand-secondary mb-1.5">
                YouTube Channel URL <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
              </label>
              <input
                id="youtubeUrl"
                type="url"
                value={formData.youtube_url || ""}
                onChange={(e) => handleChange("youtube_url", e.target.value)}
                placeholder="https://youtube.com/@yourbrand"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.youtube_url
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200"
                    : "border-brand-border bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                }`}
              />
              {errors.youtube_url && (
                <p className="mt-1 text-xs text-rose-600">{errors.youtube_url}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-brand-border/60">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Branch Profile...</span>
              </>
            ) : isSettingsMode ? (
              <span>Save Branch Profile</span>
            ) : (
              <>
                <span>Save & Continue to Kitchens</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

export default StepBranch;
