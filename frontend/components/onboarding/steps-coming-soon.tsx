"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  LayoutGrid, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  Store, 
  ChefHat, 
  Clock, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Layers
} from "lucide-react";
import { branding } from "@/config/branding";

interface StepsComingSoonProps {
  branch: any;
  kitchensCount: number;
  shiftsCount: number;
  sectionsCount?: number;
  totalUnitsCount?: number;
  employeesCount?: number;
  activeManagersCount?: number;
  categoriesCount?: number;
  itemsCount?: number;
  onNavigateStep: (step: number) => void;
}

const UPCOMING_LOCKED_STEPS = [
  {
    step: 7,
    name: "Tax & Compliance Setup",
    icon: Receipt,
    desc: "GST tax engine (CGST/SGST), packaging tax rules, city-tier overrides & live branch activation.",
    badge: "Final Phase",
  },
];

export default function StepsComingSoon({
  branch,
  kitchensCount,
  shiftsCount,
  sectionsCount = 0,
  totalUnitsCount = 0,
  employeesCount = 0,
  activeManagersCount = 0,
  categoriesCount = 0,
  itemsCount = 0,
  onNavigateStep,
}: StepsComingSoonProps) {
  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* Milestone Celebration Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center relative overflow-hidden mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Milestone Achieved: Steps 1–6 Complete!</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
          Physical Venue, Staff & Menu Configured for {branch?.name || "Your Branch"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-emerald-800 max-w-2xl mx-auto leading-relaxed">
          You have successfully established the branch profile, kitchen prep stations, operating shift schedules, physical sections with deterministic QR URLs, staff accounts with Branch Manager oversight, and your complete menu catalog with categories, variations, and add-ons.
        </p>

        {/* 6 Metrics Overview */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto text-left">
          <div 
            onClick={() => onNavigateStep(1)}
            className="group cursor-pointer rounded-xl bg-white p-3.5 border border-emerald-200 shadow-sm hover:border-brand-primary transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Step 1</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs font-bold text-brand-secondary truncate">{branch?.name || "Branch Profile"}</div>
            <div className="text-[10px] text-brand-text-muted mt-0.5">GSTIN: {branch?.gstin || "Configured"}</div>
          </div>

          <div 
            onClick={() => onNavigateStep(2)}
            className="group cursor-pointer rounded-xl bg-white p-3.5 border border-emerald-200 shadow-sm hover:border-brand-primary transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Step 2</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs font-bold text-brand-secondary">{kitchensCount} Kitchen Stations</div>
            <div className="text-[10px] text-brand-text-muted mt-0.5">KDS & Ticket Routing Ready</div>
          </div>

          <div 
            onClick={() => onNavigateStep(3)}
            className="group cursor-pointer rounded-xl bg-white p-3.5 border border-emerald-200 shadow-sm hover:border-brand-primary transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Step 3</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs font-bold text-brand-secondary">{shiftsCount} Operating Shifts</div>
            <div className="text-[10px] text-brand-text-muted mt-0.5">Schedules & Handover Ready</div>
          </div>

          <div 
            onClick={() => onNavigateStep(4)}
            className="group cursor-pointer rounded-xl bg-white p-3.5 border border-emerald-200 shadow-sm hover:border-brand-primary transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Step 4</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs font-bold text-brand-secondary">{sectionsCount} Sections ({totalUnitsCount} Units)</div>
            <div className="text-[10px] text-brand-text-muted mt-0.5">QR & Queue URLs Active</div>
          </div>

          <div 
            onClick={() => onNavigateStep(5)}
            className="group cursor-pointer rounded-xl bg-white p-3.5 border border-emerald-200 shadow-sm hover:border-brand-primary transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Step 5</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs font-bold text-brand-secondary">{employeesCount} Staff ({activeManagersCount} Mgr)</div>
            <div className="text-[10px] text-brand-text-muted mt-0.5">Credentials & Roles Active</div>
          </div>

          <div 
            onClick={() => onNavigateStep(6)}
            className="group cursor-pointer rounded-xl bg-white p-3.5 border border-emerald-200 shadow-sm hover:border-brand-primary transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Step 6</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs font-bold text-brand-secondary">{categoriesCount} Categories ({itemsCount} Items)</div>
            <div className="text-[10px] text-brand-text-muted mt-0.5">Menu, Variations & Pricing Ready</div>
          </div>
        </div>
      </div>

      {/* Locked Step 7 Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-brand-secondary">
              Upcoming Onboarding Step (Step 7)
            </h3>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Per the project roadmap, the Tax & Compliance engine is staged for the final prompt.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-text-muted bg-brand-surface-muted px-2.5 py-1 rounded-full border border-brand-border">
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {UPCOMING_LOCKED_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-2xl border border-brand-border/80 bg-brand-surface-muted/40 p-5 opacity-80"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-surface-muted border border-brand-border text-brand-text-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-secondary">
                        Step {s.step}: {s.name}
                      </div>
                      <span className="text-[10px] font-semibold text-brand-text-muted bg-brand-surface-muted px-2 py-0.5 rounded border border-brand-border/50 inline-block mt-0.5">
                        {s.badge}
                      </span>
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-brand-text-muted" />
                </div>
                <p className="text-xs text-brand-text-secondary leading-relaxed mt-2">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border pt-6">
        <button
          type="button"
          onClick={() => onNavigateStep(6)}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-5 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Menu Engineering (Step 6)</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Step 6 verified. Step 7 (Tax & Activation) will unlock in the final session.</span>
        </div>
      </div>
    </div>
  );
}
