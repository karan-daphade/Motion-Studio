import React from "react";
import Link from "next/link";
import { appName } from "@/config/branding";
import { AlertCircle, BedDouble, ArrowLeft } from "lucide-react";
import { resolveWaitlistJoinSection } from "@/app/actions/qr-actions";
import WaitlistJoinClient from "@/components/waitlist/waitlist-join-client";

interface WaitlistJoinPageProps {
  searchParams: Promise<{
    section_id?: string;
    branch_id?: string;
    restaurant_id?: string;
  }>;
}

export const metadata = {
  title: `Join Waiting Queue — ${appName}`,
  description: "Self-service customer waitlist registration and live queue tracking.",
};

export default async function WaitlistJoinPage({ searchParams }: WaitlistJoinPageProps) {
  const params = await searchParams;
  const sectionId = params.section_id || null;
  const branchId = params.branch_id || params.restaurant_id || null;

  const res = await resolveWaitlistJoinSection(sectionId, branchId);

  if (!res.success || !res.data) {
    const isRoom = (res as any).isRoom;

    return (
      <div className="min-h-screen bg-brand-background flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-8 text-center shadow-brandCard">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-4">
            {isRoom ? <BedDouble className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
          </div>

          <h1 className="text-lg font-bold text-brand-secondary">
            {isRoom ? "Room Service & Bookings" : "Queue Section Unavailable"}
          </h1>

          <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
            {isRoom
              ? "Walk-in waitlist queuing is not applicable for Hotel Room sections. Please coordinate directly with the front desk."
              : res.error || "The requested waitlist queue QR code is invalid or no longer active."}
          </p>

          <div className="mt-6 pt-5 border-t border-brand-border/60">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { branch, section } = res.data;

  return (
    <WaitlistJoinClient
      branchId={branch.id}
      restaurantId={branch.restaurantId}
      sectionId={section.id}
      branchName={branch.name}
      branchCity={branch.city}
      sectionName={section.name}
      unitLabel={section.unitLabel}
    />
  );
}
