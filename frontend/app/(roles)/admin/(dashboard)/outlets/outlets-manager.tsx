"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  LayoutGrid, 
  ChefHat, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink,
  Search, 
  X, 
  Loader2,
  Settings,
  Sparkles,
  QrCode
} from "lucide-react";
import { createAdditionalOutlet, type BranchSummary } from "@/app/actions/dashboard-actions";
import { getBranchQRPayload } from "@/app/actions/qr-actions";
import { 
  assembleBranchQrZip, 
  triggerBlobDownload, 
  sanitizeFilename 
} from "@/lib/qr/client-qr-generator";

interface OutletsManagerProps {
  initialBranches: BranchSummary[];
  restaurantName: string;
}

export default function OutletsManager({
  initialBranches,
  restaurantName,
}: OutletsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [branches, setBranches] = useState<BranchSummary[]>(initialBranches);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "draft">("all");

  // QR Bulk Download State
  const [downloadingBranchId, setDownloadingBranchId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<{ branchId: string; message: string } | null>(null);

  const handleDownloadQRCodes = async (branch: BranchSummary) => {
    setDownloadingBranchId(branch.id);
    setDownloadProgress(0);
    setDownloadStatus("Fetching outlet layout...");
    setDownloadError(null);

    try {
      const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await getBranchQRPayload(branch.id, clientOrigin);

      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load branch details for QR generation.");
      }

      const payload = res.data;
      const totalTables = payload.sections.reduce((sum, s) => sum + s.tables.length, 0);

      if (totalTables === 0 && payload.sections.length === 0) {
        throw new Error("No active dining sections or tables configured for this branch.");
      }

      setDownloadStatus("Generating QR codes client-side...");
      const zipBlob = await assembleBranchQrZip(payload, (percent, statusText) => {
        setDownloadProgress(percent);
        setDownloadStatus(statusText);
      });

      const safeName = sanitizeFilename(branch.name);
      triggerBlobDownload(zipBlob, `${safeName}_QR_Codes.zip`);
    } catch (err: any) {
      setDownloadError({
        branchId: branch.id,
        message: err?.message || "Failed to generate QR zip archive.",
      });
    } finally {
      setDownloadingBranchId(null);
      setTimeout(() => {
        setDownloadStatus("");
        setDownloadProgress(0);
      }, 3000);
    }
  };

  // Add Outlet Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOutletName, setNewOutletName] = useState("");
  const [newOutletCity, setNewOutletCity] = useState("Mumbai");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Check if opened with ?action=new
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutletName.trim()) {
      setModalError("Please enter an outlet name.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await createAdditionalOutlet(newOutletName, newOutletCity);
      if (res.success && res.branchId) {
        setIsAddModalOpen(false);
        // Route immediately to onboarding for the new branch
        router.push(`/admin/onboarding?branchId=${res.branchId}`);
      } else {
        setModalError(res.error || "Failed to create outlet. Please try again.");
      }
    } catch (err: any) {
      setModalError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBranches = branches.filter((b) => {
    if (filterStatus === "active" && b.status !== "active") return false;
    if (filterStatus === "draft" && b.status === "active") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCity = (b.city || "").toLowerCase().includes(q);
      const matchAddress = (b.address || "").toLowerCase().includes(q);
      return matchName || matchCity || matchAddress;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Outlets & Branches
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branches.length} Total
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Manage physical restaurant branches, configure regional profiles, or launch new locations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalError(null);
            setNewOutletName("");
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Outlet</span>
        </button>
      </div>

      {/* Filter Chips & Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
              filterStatus === "all"
                ? "bg-brand-secondary text-white border-brand-secondary shadow-sm"
                : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
            }`}
          >
            All ({branches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("active")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
              filterStatus === "active"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-emerald-900 border-brand-border hover:bg-emerald-50"
            }`}
          >
            Active ({branches.filter((b) => b.status === "active").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("draft")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
              filterStatus === "draft"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white text-amber-900 border-brand-border hover:bg-amber-50"
            }`}
          >
            In Setup ({branches.filter((b) => b.status !== "active").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by branch name, city..."
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

      {/* Outlets Grid */}
      {filteredBranches.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-brand-border bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface-muted text-brand-text-muted mb-3">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-brand-secondary">No outlets match your filter</h3>
          <p className="text-xs text-brand-text-secondary mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new branch outlet to expand your restaurant network.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }}
            className="mt-4 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBranches.map((branch) => {
            const isActive = branch.status === "active";
            const completedSteps = branch.onboarding_progress?.completed_steps || [];
            const completedCount = Array.isArray(completedSteps) ? completedSteps.length : 0;

            return (
              <div
                key={branch.id}
                className="flex flex-col justify-between rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard hover:shadow-md transition-all"
              >
                <div>
                  {/* Top Bar: Name & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary font-bold">
                          <Store className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-brand-secondary truncate">
                            {branch.name}
                          </h2>
                          <p className="text-[11px] text-brand-text-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {[branch.city, branch.state].filter(Boolean).join(", ") || "City not set"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {isActive ? "● Active" : `Setup ${completedCount}/7`}
                    </span>
                  </div>

                  {/* Address & Phone */}
                  {(branch.address || branch.phone) && (
                    <div className="mt-4 space-y-1 text-xs text-brand-text-secondary bg-brand-surface-muted/60 rounded-xl p-2.5 border border-brand-border/40">
                      {branch.address && (
                        <p className="truncate text-[11px] leading-relaxed">
                          {branch.address}
                        </p>
                      )}
                      {branch.phone && (
                        <p className="text-[11px] text-brand-text-muted flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{branch.phone}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Physical Entity Counts */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-brand-border/60 py-3 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-brand-text-muted mb-0.5">
                        <LayoutGrid className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-black text-brand-secondary">
                        {branch.table_count || 0}
                      </p>
                      <p className="text-[10px] text-brand-text-muted">Tables</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-brand-text-muted mb-0.5">
                        <ChefHat className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-black text-brand-secondary">
                        {branch.kitchen_count || 0}
                      </p>
                      <p className="text-[10px] text-brand-text-muted">Kitchens</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-brand-text-muted mb-0.5">
                        <Users className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-black text-brand-secondary">
                        {branch.employee_count || 0}
                      </p>
                      <p className="text-[10px] text-brand-text-muted">Staff</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-5 space-y-2 pt-2">
                  {/* Download QR Codes Button */}
                  <button
                    type="button"
                    disabled={downloadingBranchId === branch.id}
                    onClick={() => handleDownloadQRCodes(branch)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface-muted/70 px-3 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-primary-light hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-2xs disabled:opacity-60"
                    title="Generate and download in-browser ZIP package of high-resolution QR codes"
                  >
                    {downloadingBranchId === branch.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
                        <span className="truncate">
                          {downloadStatus || "Generating QRs..."} ({downloadProgress}%)
                        </span>
                      </>
                    ) : (
                      <>
                        <QrCode className="h-3.5 w-3.5 text-brand-primary" />
                        <span>Download QR Codes</span>
                      </>
                    )}
                  </button>

                  {/* QR Download Progress Bar */}
                  {downloadingBranchId === branch.id && (
                    <div className="w-full bg-brand-border/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-primary h-1.5 rounded-full transition-all duration-150"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  )}

                  {/* QR Download Error Display */}
                  {downloadError?.branchId === branch.id && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 p-2 text-[11px] text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <span className="truncate">{downloadError.message}</span>
                    </div>
                  )}

                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin?branchId=${branch.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-3 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
                      >
                        <span>View Dashboard</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      <Link
                        href={`/operations/tables?branchId=${branch.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white p-2 text-brand-secondary hover:bg-brand-surface-muted transition-all"
                        title="Open Live Tables"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/admin/settings/branch?branchId=${branch.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white p-2 text-brand-secondary hover:bg-brand-surface-muted transition-all"
                        title="Branch Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/onboarding?branchId=${branch.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-all"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Resume Setup ({completedCount}/7)</span>
                      </Link>
                      <Link
                        href={`/admin/settings/branch?branchId=${branch.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white p-2 text-brand-secondary hover:bg-brand-surface-muted transition-all"
                        title="Branch Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Outlet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-brandModal border border-brand-border">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary">
                    Add New Restaurant Outlet
                  </h3>
                  <p className="text-[11px] text-brand-text-muted">
                    Create a new branch location under {restaurantName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-surface-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOutlet} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  Outlet Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newOutletName}
                  onChange={(e) => setNewOutletName(e.target.value)}
                  placeholder="e.g. Spice Garden - Bandra West"
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
                <p className="text-[10px] text-brand-text-muted mt-1">
                  Distinguish by neighborhood, mall, or area name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newOutletCity}
                  onChange={(e) => setNewOutletCity(e.target.value)}
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>

              <div className="rounded-xl bg-brand-surface-muted/80 p-3 border border-brand-border/60 text-[11px] text-brand-text-secondary">
                <p className="font-semibold text-brand-secondary flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                  What happens next?
                </p>
                Creating this outlet opens the 7-step onboarding wizard so you can configure its kitchens, shifts, dining sections, staff, and menus.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-text-secondary hover:bg-brand-surface-muted rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create & Launch Setup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
