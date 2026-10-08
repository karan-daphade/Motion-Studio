"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { appName, logoPath } from "@/config/branding";
import { 
  QrCode, 
  ShoppingBag, 
  Clock, 
  Sparkles, 
  UtensilsCrossed, 
  CheckCircle2, 
  ArrowLeft,
  Search
} from "lucide-react";
import ShareSessionQRModal from "@/components/operations/ShareSessionQRModal";

function CustomerContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const sessionIdParam = searchParams.get("session_id") || "sess_live";
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const displayTable = tableParam || "T-04";

  return (
    <div className="min-h-screen bg-brand-background pb-24">
      {/* Mobile-optimized Customer Header */}
      <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-brand-surface-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm border border-brand-border p-1">
                <Image
                  src={logoPath}
                  alt={appName}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-sm font-black text-brand-secondary tracking-tight block">
                  {appName}
                </span>
                <span className="text-[10px] text-brand-text-muted">Digital Dining</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/10 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Table {displayTable}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Share Modal Container (Story 15.6 Section 2.C) */}
      <ShareSessionQRModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sessionId={sessionIdParam}
        tableLabel={displayTable}
      />

      {/* Main Container constrained for mobile-first dining */}
      <main className="mx-auto max-w-md px-4 pt-4">
        {/* Role Boundary Info */}
        <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50/80 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <QrCode className="h-4 w-4 text-purple-600" />
            <h2 className="text-xs font-bold text-purple-900">
              Customer QR Dining Session (`/customer`)
            </h2>
          </div>
          <p className="text-[11px] text-purple-700 leading-relaxed">
            Accessible via QR code scan without mandatory app installation. Automatically establishes or joins a shared <code className="font-mono font-semibold bg-purple-100 px-1 py-0.2 rounded text-purple-900">table_session</code>.
          </p>
        </div>

        {/* Restaurant Profile Card */}
        <div className="rounded-2xl bg-white p-4 shadow-brandCard border border-brand-border mb-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-black text-brand-secondary">
              Spice Garden Restaurant
            </h1>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Open Now
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary">
            Connaught Place, New Delhi • Table Session Active
          </p>
        </div>

        {/* Live Order Status Pipeline Demonstration */}
        <div className="rounded-2xl bg-white p-4 shadow-brandCard border border-brand-border mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-primary" />
              <h3 className="text-xs font-bold text-brand-secondary">
                Live Order Tracking
              </h3>
            </div>
            <span className="text-[10px] font-mono text-brand-text-muted">
              Realtime Sync
            </span>
          </div>

          <div className="relative flex items-center justify-between text-center pt-2 pb-1">
            {[
              { label: "Ordered", status: "done" },
              { label: "Preparing", status: "active" },
              { label: "Ready", status: "waiting" },
              { label: "Served", status: "waiting" },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center z-10">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step.status === "done"
                      ? "bg-status-ready text-white shadow-sm"
                      : step.status === "active"
                      ? "bg-brand-primary text-white ring-4 ring-brand-primary/20 shadow-sm animate-pulse"
                      : "bg-brand-surface-muted text-brand-text-muted border border-brand-border"
                  }`}
                >
                  {step.status === "done" ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${step.status === "active" ? "text-brand-primary font-bold" : "text-brand-text-secondary"}`}>
                  {step.label}
                </span>
              </div>
            ))}
            <div className="absolute top-5.5 left-6 right-6 h-0.5 bg-brand-border -z-0" />
          </div>
        </div>

        {/* Category Pills Preview */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {["All Items", "Starters", "Main Course", "Breads", "Beverages", "Desserts"].map((cat, i) => (
            <button
              key={cat}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                i === 0
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white text-brand-text-secondary border border-brand-border hover:bg-brand-surface-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Catalog Skeleton Card */}
        <div className="rounded-2xl bg-white p-4 shadow-brandCard border border-brand-border text-center py-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary mb-3">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-brand-secondary">Digital Menu Ready for Catalog Data</h4>
          <p className="text-xs text-brand-text-secondary mt-1 max-w-xs mx-auto">
            Once categories, items, and variations are created in the Admin Onboarding Wizard, they will render here dynamically.
          </p>
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-brand-border bg-white/95 backdrop-blur-md p-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <span className="text-[10px] text-brand-text-muted block">Active Table Session</span>
            <span className="text-xs font-bold text-brand-secondary">0 items in order</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-brand-primary-hover"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>View Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-brand-text-muted">
          <Clock className="h-4 w-4 animate-spin text-brand-primary" />
          <span>Loading menu...</span>
        </div>
      </div>
    }>
      <CustomerContent />
    </Suspense>
  );
}
