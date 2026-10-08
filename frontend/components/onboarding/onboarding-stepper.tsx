"use client";

import React from "react";
import { 
  MapPin, 
  ChefHat, 
  Clock, 
  LayoutGrid, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  Check, 
  Lock,
  ChevronRight
} from "lucide-react";
import { branding } from "@/config/branding";

export interface StepDefinition {
  step: number;
  name: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ONBOARDING_STEPS: StepDefinition[] = [
  { step: 1, name: "Branch Setup", shortDesc: "Profile, GPS & GSTIN", icon: MapPin },
  { step: 2, name: "Kitchen Management", shortDesc: "Stations & Printers", icon: ChefHat },
  { step: 3, name: "Shift Management", shortDesc: "Hours & Schedules", icon: Clock },
  { step: 4, name: "Sections & Tables", shortDesc: "Floor layout & QR", icon: LayoutGrid },
  { step: 5, name: "Employees", shortDesc: "Staff roles & access", icon: Users },
  { step: 6, name: "Menu Engineering", shortDesc: "Items & dynamic pricing", icon: UtensilsCrossed },
  { step: 7, name: "Tax & Compliance", shortDesc: "GST engine & rules", icon: Receipt },
];

interface OnboardingStepperProps {
  currentStep: number;
  completedSteps: number[];
  onSelectStep: (step: number) => void;
  isSaving?: boolean;
}

export default function OnboardingStepper({
  currentStep,
  completedSteps,
  onSelectStep,
  isSaving = false,
}: OnboardingStepperProps) {
  // Calculate completion percentage
  const completedCount = completedSteps.length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  const currentStepDef = ONBOARDING_STEPS.find((s) => s.step === currentStep) || ONBOARDING_STEPS[0];

  return (
    <div className="w-full bg-white rounded-2xl border border-brand-border shadow-brandCard p-4 sm:p-6 mb-8 transition-all">
      {/* Top Header: Step Indicator & Overall Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-brand-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              Step {currentStep} of 7: {currentStepDef.name}
            </span>
            {isSaving && (
              <span className="text-[11px] font-medium text-brand-text-muted animate-pulse">
                Autosaving...
              </span>
            )}
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Complete sequential setup to activate live operations for this branch.
          </p>
        </div>

        {/* Progress bar info */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-xs font-bold text-brand-secondary">
              {progressPercent}% Completed
            </div>
            <div className="text-[10px] text-brand-text-muted">
              {completedCount} of 7 Steps Finished
            </div>
          </div>
          <div className="w-24 sm:w-32 h-2.5 bg-brand-surface-muted rounded-full overflow-hidden border border-brand-border">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Connected Stepper (Hidden on small mobile) */}
      <div className="hidden lg:grid grid-cols-7 gap-2 relative">
        {ONBOARDING_STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isCompleted = completedSteps.includes(s.step);
          const isCurrent = currentStep === s.step;
          const isLocked = !isCompleted && !isCurrent;
          const isClickable = isCompleted || isCurrent;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isClickable || isSaving}
              onClick={() => isClickable && onSelectStep(s.step)}
              className={`group flex flex-col items-center text-center p-3 rounded-xl transition-all duration-200 relative ${
                isCurrent
                  ? "bg-brand-primary-light/60 border-2 border-brand-primary shadow-sm"
                  : isCompleted
                  ? "bg-white hover:bg-brand-surface-muted/80 border border-brand-border cursor-pointer"
                  : "bg-brand-surface-muted/40 border border-brand-border/60 opacity-65 cursor-not-allowed"
              }`}
            >
              {/* Connector line between steps */}
              {idx < ONBOARDING_STEPS.length - 1 && (
                <div 
                  className={`hidden lg:block absolute top-7 -right-2 w-4 h-0.5 z-0 ${
                    completedSteps.includes(s.step) && completedSteps.includes(s.step + 1)
                      ? "bg-brand-accent"
                      : "bg-brand-border"
                  }`} 
                />
              )}

              {/* Step Circle / Badge */}
              <div 
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                  isCurrent
                    ? "bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-105"
                    : isCompleted
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-brand-surface-muted text-brand-text-muted border border-brand-border"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              {/* Title & Description */}
              <span className={`mt-2.5 text-xs font-bold truncate max-w-full ${
                isCurrent 
                  ? "text-brand-primary" 
                  : isCompleted 
                  ? "text-brand-secondary" 
                  : "text-brand-text-muted"
              }`}>
                {s.name}
              </span>
              <span className="text-[10px] text-brand-text-muted truncate max-w-full">
                {s.shortDesc}
              </span>

              {/* State pill */}
              <span className="mt-1.5">
                {isCurrent ? (
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-primary text-white">
                    Current
                  </span>
                ) : isCompleted ? (
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Done
                  </span>
                ) : isLocked && s.step > 6 ? (
                  <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded bg-brand-surface-muted text-brand-text-muted">
                    Locked
                  </span>
                ) : (
                  <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded bg-brand-surface-muted text-brand-text-muted">
                    Next
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile & Tablet Stepper (Horizontal Scroll / Compact View) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {ONBOARDING_STEPS.map((s) => {
          const isCompleted = completedSteps.includes(s.step);
          const isCurrent = currentStep === s.step;
          const isLocked = !isCompleted && !isCurrent;
          const isClickable = isCompleted || isCurrent;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isClickable || isSaving}
              onClick={() => isClickable && onSelectStep(s.step)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all ${
                isCurrent
                  ? "bg-brand-primary-light border-brand-primary shadow-sm"
                  : isCompleted
                  ? "bg-white border-brand-border"
                  : "bg-brand-surface-muted/60 border-brand-border/50 opacity-60 cursor-not-allowed"
              }`}
            >
              <div 
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  isCurrent
                    ? "bg-brand-primary text-white"
                    : isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-brand-surface-muted text-brand-text-muted"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="h-2.5 w-2.5" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-bold truncate ${
                  isCurrent ? "text-brand-primary" : "text-brand-secondary"
                }`}>
                  {s.step}. {s.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
