import React from "react";
import Link from "next/link";
import { appName } from "@/config/branding";
import { ShieldCheck, Store, Clock, ArrowLeft, Terminal } from "lucide-react";

interface StaffLoginPageProps {
  searchParams: Promise<{ b?: string }>;
}

export default async function StaffLoginPage({ searchParams }: StaffLoginPageProps) {
  const { b: branchCode } = await searchParams;

  return (
    <div className="min-h-screen bg-brand-background flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-brandCard mb-4">
          <Terminal className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
          {appName} Staff Terminal
        </h1>
        <p className="mt-1 text-xs text-brand-text-secondary">
          Front-of-House POS, Waiter Tablet & Kitchen Display Station
        </p>
      </div>

      {/* Main Holding Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-brand-border bg-white p-7 sm:p-8 shadow-brandCard">
          {/* Branch Identification Pill */}
          {branchCode && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary-light/50 px-3.5 py-1.5 text-xs font-bold text-brand-primary border border-brand-primary/20 w-full justify-center">
              <Store className="h-3.5 w-3.5" />
              <span>Branch Terminal Code: {branchCode.toUpperCase()}</span>
            </div>
          )}

          <div className="text-center py-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-bold text-brand-secondary">
              Staff Login — Coming Soon
            </h2>

            <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
              This terminal QR code has been successfully verified. The full staff PIN & credentials
              login experience is scheduled for Phase 2 operations.
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-brand-surface-muted p-4 border border-brand-border/60 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-brand-secondary font-bold">
              <Clock className="h-4 w-4 text-brand-primary" />
              <span>Upcoming Operational Capabilities</span>
            </div>
            <ul className="text-[11px] text-brand-text-muted space-y-1.5 pl-6 list-disc">
              <li>Role-based access (Manager, Waiter, KDS, Biller, Cashier)</li>
              <li>Active shift check-in and station assignment</li>
              <li>Instant real-time ticket order firing & billing settlement</li>
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-brand-border/60 flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-secondary px-4 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-secondary/90 transition-all text-center"
            >
              <span>Restaurant Owner / Admin Portal</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-brand-text-muted hover:text-brand-secondary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to BharatQR Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-brand-text-muted mt-8">
        &copy; {new Date().getFullYear()} {appName} POS • Enterprise Operational Infrastructure
      </div>
    </div>
  );
}
