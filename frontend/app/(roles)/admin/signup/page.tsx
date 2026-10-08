"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { initiateAdminSignup } from "@/app/actions/auth-actions";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Ticket, 
  Store, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Check,
  X,
  Calendar,
  Languages
} from "lucide-react";
import { branding } from "@/config/branding";

const LANGUAGE_OPTIONS = ["English", "Hindi", "Marathi", "Other"];

export default function AdminSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    restaurantName: "",
    country: "India",
    state: "",
    district: "",
    address: "",
    pinCode: "",
    totalBranches: 1,
    referenceCode: "",
    mobileNumber: "",
    businessEmail: "",
    website: "",
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [otherLanguageText, setOtherLanguageText] = useState("");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const [maxDobDate] = useState(() => {
    return new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalBranches" ? (parseInt(value, 10) || 1) : value,
    }));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => 
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const removeLanguageBadge = (lang: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLanguages((prev) => prev.filter((l) => l !== lang));
    if (lang === "Other") {
      setOtherLanguageText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate 18+ for Date of Birth if provided
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        setError("Please enter a valid Date of Birth.");
        setLoading(false);
        return;
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        setError("Owner must be at least 18 years of age.");
        setLoading(false);
        return;
      }
    }

    const finalLanguages = [
      ...selectedLanguages.filter((l) => l !== "Other"),
      ...(selectedLanguages.includes("Other") && otherLanguageText.trim() ? [otherLanguageText.trim()] : []),
    ];

    try {
      const result = await initiateAdminSignup({
        ...formData,
        gender: (formData.gender as "Male" | "Female" | "Other" | "Prefer not to say" | "") || undefined,
        languagesSpoken: finalLanguages,
      });
      if (result.success) {
        router.push(`/admin/verify-otp?email=${encodeURIComponent(formData.businessEmail)}&context=signup`);
      } else {
        setError(result.error || "Sign-up request failed. Please check your details.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary">
            Register Your Restaurant Brand
          </h1>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Get started with {branding.appName} in minutes. We will send a 6-digit verification code to your business email.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to proceed</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Owner Profile */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                1. Owner Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-bold text-brand-text-primary mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Karan"
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-bold text-brand-text-primary mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Daphade"
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-xs font-bold text-brand-text-primary mb-1">
                    Gender <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  >
                    <option value="">Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-bold text-brand-text-primary mb-1">
                    Date of Birth <span className="text-xs text-brand-text-muted font-normal">(Optional, 18+)</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={maxDobDate}
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Languages Spoken — Multi-select Dropdown */}
                <div className="sm:col-span-2" ref={langDropdownRef}>
                  <label className="block text-xs font-bold text-brand-text-primary mb-1">
                    Languages Spoken <span className="text-xs text-brand-text-muted font-normal">(Optional multi-select)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                      className="w-full min-h-[42px] flex items-center justify-between rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-left focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
                        {selectedLanguages.length === 0 ? (
                          <span className="text-brand-text-muted">Select spoken languages...</span>
                        ) : (
                          selectedLanguages.map((lang) => (
                            <span
                              key={lang}
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-primary-light/60 px-2 py-0.5 text-xs font-semibold text-brand-primary border border-brand-primary/20"
                            >
                              {lang === "Other" && otherLanguageText ? `Other: ${otherLanguageText}` : lang}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => removeLanguageBadge(lang, e)}
                                className="hover:text-rose-600 rounded-sm"
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-brand-text-muted shrink-0 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isLangDropdownOpen && (
                      <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-brand-border bg-white p-2 shadow-xl animate-in fade-in duration-100">
                        <div className="space-y-1">
                          {LANGUAGE_OPTIONS.map((opt) => {
                            const isChecked = selectedLanguages.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleLanguage(opt)}
                                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                  isChecked
                                    ? "bg-brand-primary-light text-brand-primary font-bold"
                                    : "text-brand-text-primary hover:bg-brand-surface-muted"
                                }`}
                              >
                                <span>{opt}</span>
                                {isChecked && <Check className="h-3.5 w-3.5 text-brand-primary" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Free text for Other */}
                        {selectedLanguages.includes("Other") && (
                          <div className="mt-2 pt-2 border-t border-brand-border/60">
                            <label htmlFor="otherLangInput" className="block text-[11px] font-bold text-brand-text-secondary mb-1">
                              Specify Other Language(s):
                            </label>
                            <input
                              id="otherLangInput"
                              type="text"
                              value={otherLanguageText}
                              onChange={(e) => setOtherLanguageText(e.target.value)}
                              placeholder="e.g. Gujarati, Kannada, French"
                              className="w-full rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs text-brand-text-primary focus:border-brand-primary outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Restaurant Details */}
            <div className="pt-4 border-t border-brand-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                2. Restaurant Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="restaurantName" className="block text-xs font-bold text-brand-text-primary mb-1">
                    Restaurant / Brand Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      required
                      value={formData.restaurantName}
                      onChange={handleChange}
                      placeholder="e.g. Spice Garden Bistro"
                      className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    <Store className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="totalBranches" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Total Branches <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="totalBranches"
                      name="totalBranches"
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={formData.totalBranches}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="referenceCode" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Reference Code <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="referenceCode"
                        name="referenceCode"
                        type="text"
                        value={formData.referenceCode}
                        onChange={handleChange}
                        placeholder="e.g. REF-2026"
                        className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                      <Ticket className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Physical Location */}
            <div className="pt-4 border-t border-brand-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                3. Business Location
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-xs font-bold text-brand-text-primary mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Maharashtra"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-xs font-bold text-brand-text-primary mb-1">
                      District / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="district"
                      name="district"
                      type="text"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Pune"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Shop 4, Phoenix Marketcity"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="pinCode" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Pin Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      required
                      value={formData.pinCode}
                      onChange={handleChange}
                      placeholder="e.g. 411014"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Contact & Verification */}
            <div className="pt-4 border-t border-brand-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                4. Credentials & Verification Endpoint
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="businessEmail" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="businessEmail"
                        name="businessEmail"
                        type="email"
                        required
                        value={formData.businessEmail}
                        onChange={handleChange}
                        placeholder="owner@restaurant.com"
                        className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                    </div>
                    <span className="text-[11px] text-brand-text-muted mt-1 block">
                      OTP will be dispatched via Gmail SMTP to this address.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-xs font-bold text-brand-text-primary mb-1">
                      Mobile Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        required
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                    </div>
                    <span className="text-[11px] text-brand-text-muted mt-1 block">
                      Used for critical shift and operations alerts.
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-xs font-bold text-brand-text-primary mb-1">
                    Website URL <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.spicegarden.in"
                      className="w-full rounded-xl border border-brand-border bg-white pl-10 pr-3.5 py-2.5 text-sm text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-brand-border">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing & Dispatching Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Business Email & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Existing Account Footer */}
          <div className="mt-8 text-center border-t border-brand-border/60 pt-6">
            <p className="text-xs text-brand-text-secondary">
              Already have an active owner account?{" "}
              <Link href="/admin/login" className="font-bold text-brand-primary hover:underline">
                Sign In to Dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
