import React from "react";
import Link from "next/link";
import { appName } from "@/config/branding";
import { 
  UtensilsCrossed, 
  MapPin, 
  Users, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { getTableOrderingInfo } from "@/app/actions/qr-actions";
import TableQRScanClient from "@/components/waitlist/table-qr-scan-client";

interface TableOrderingPageProps {
  params: Promise<{
    branchCode: string;
    sectionCode: string;
    tableNumber: string;
  }>;
}

export default async function TableOrderingPage({ params }: TableOrderingPageProps) {
  const { branchCode, sectionCode, tableNumber } = await params;
  const res = await getTableOrderingInfo(branchCode, sectionCode, tableNumber);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-8 text-center shadow-brandCard">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="text-lg font-bold text-brand-secondary">
            Table Not Found
          </h1>

          <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
            {res.error || "The requested table or dining area QR code could not be verified."}
          </p>

          <div className="mt-6 pt-5 border-t border-brand-border/60">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to {appName}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { branch, section, table } = res.data;
  const isTableActive = table.status === "active" || table.status === "occupied";

  if (isTableActive) {
    return (
      <TableQRScanClient
        initialStatus={table.status === "occupied" || !!res.data.session ? "OCCUPIED" : "AVAILABLE"}
        table={{
          id: table.id,
          name: table.name,
          label: table.name,
          seatingCapacity: table.seatingCapacity,
          status: table.status,
          branchId: branch.id || "",
          branchName: branch.name,
          sectionName: section.name,
          activeSessionId: res.data.session?.id || null,
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Brand & Table Header */}
      <header className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-border shadow-xs mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{appName} Table Dining</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-brand-secondary tracking-tight">
          {branch.name}
        </h1>

        <p className="mt-1 text-xs text-brand-text-muted flex items-center justify-center gap-1.5">
          {branch.city && (
            <>
              <MapPin className="h-3 w-3" />
              <span>{branch.city}</span>
              <span>•</span>
            </>
          )}
          <span className="font-semibold text-brand-text-secondary">{section.name}</span>
        </p>
      </header>

      {/* Main Holding Card */}
      <main className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-brandCard">
          {isTableActive ? (
            /* Active Table State */
            <div className="text-center">
              {/* Unit Tag Pill */}
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-2xl bg-brand-primary-light px-4 py-2 text-xs font-extrabold text-brand-primary border border-brand-primary/30">
                <UtensilsCrossed className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>{table.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-brand-secondary">
                  <Users className="h-3 w-3" />
                  {table.seatingCapacity} Seater
                </span>
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-brandCard mb-4">
                <UtensilsCrossed className="h-8 w-8" />
              </div>

              <h2 className="text-xl font-black text-brand-secondary tracking-tight">
                Digital Menu Coming Soon
              </h2>

              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed max-w-xs mx-auto">
                You are seated at <span className="font-bold text-brand-secondary">{table.name}</span>.
                Our full interactive digital ordering menu is launching here soon!
              </p>

              {/* Status Notice */}
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>QR Scanned & Table Verified</span>
              </div>

              {/* Ordering Instructions */}
              <div className="mt-5 rounded-2xl bg-brand-surface-muted p-4 border border-brand-border/60 text-xs text-left space-y-2">
                <p className="font-bold text-brand-secondary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-primary" />
                  How to order right now:
                </p>
                <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                  Our waitstaff is available to assist you with physical menus and take your order at the table.
                </p>
              </div>
            </div>
          ) : (
            /* Inactive Table State (ADR-011 downscaling safety) */
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertCircle className="h-6 w-6" />
              </div>

              <h2 className="text-base font-bold text-brand-secondary">
                Table Currently Inactive
              </h2>

              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                <span className="font-bold text-brand-secondary">{table.name}</span> in{" "}
                {section.name} is temporarily closed or not in active floor service.
              </p>

              <div className="mt-5 rounded-xl bg-brand-surface-muted p-3 text-[11px] text-brand-text-muted flex items-center justify-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Please speak with the restaurant manager for assistance.</span>
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-brand-border/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1 text-xs font-medium text-brand-text-muted hover:text-brand-secondary transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>About {appName} Digital Dining</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-brand-text-muted mt-8">
        &copy; {new Date().getFullYear()} {branch.name} • Powered by {appName}
      </footer>
    </div>
  );
}
