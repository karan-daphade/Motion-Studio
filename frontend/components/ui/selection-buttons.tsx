"use client";

import React from "react";

export interface SelectionOption<T extends string = string> {
  value: T;
  label: string;
  subLabel?: string;
  badge?: string;
}

interface SelectionButtonsProps<T extends string = string> {
  options: SelectionOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

/**
 * Standardized Outlined Selection Buttons Component.
 * Enforces the brand outlined selection style across all forms:
 * - White/neutral background with subtle hover
 * - Saffron accent border (border-brand-primary) and light saffron tint when selected
 * - Consistent rounded-xl corners, typography, and accessibility.
 */
export default function SelectionButtons<T extends string = string>({
  options,
  value,
  onChange,
  name,
  columns = 2,
  className = "",
  size = "md",
  disabled = false,
}: SelectionButtonsProps<T>) {
  const gridColClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  const paddingClass = size === "sm" ? "p-2 text-[11px]" : "p-2.5 text-xs";

  return (
    <div className={`grid ${gridColClass} gap-2 ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`cursor-pointer flex flex-col items-center justify-center text-center ${paddingClass} rounded-xl border font-bold transition-all select-none ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${
              isSelected
                ? "border-brand-primary bg-brand-primary-light/40 text-brand-primary shadow-sm ring-1 ring-brand-primary/20"
                : "border-brand-border bg-white text-brand-secondary hover:bg-brand-surface-muted/60 hover:border-brand-border"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              disabled={disabled}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span>{opt.label}</span>
              {opt.badge && (
                <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-brand-primary-light text-brand-primary border border-brand-primary/20">
                  {opt.badge}
                </span>
              )}
            </div>
            {opt.subLabel && (
              <span className="text-[10px] font-normal text-brand-text-muted mt-0.5">
                {opt.subLabel}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

interface MultiSelectionButtonsProps<T extends string = string> {
  options: SelectionOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

/**
 * Standardized Outlined Multi-Select Buttons Component.
 * Shares identical saffron-accent selected styling with SelectionButtons for checkboxes.
 */
export function MultiSelectionButtons<T extends string = string>({
  options,
  values,
  onChange,
  columns = 3,
  className = "",
  size = "md",
  disabled = false,
}: MultiSelectionButtonsProps<T>) {
  const gridColClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  const paddingClass = size === "sm" ? "p-2 text-[11px]" : "p-2.5 text-xs";

  const toggleValue = (val: T) => {
    if (disabled) return;
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className={`grid ${gridColClass} gap-2 ${className}`}>
      {options.map((opt) => {
        const isSelected = values.includes(opt.value);
        return (
          <label
            key={opt.value}
            onClick={(e) => {
              e.preventDefault();
              toggleValue(opt.value);
            }}
            className={`cursor-pointer flex flex-col items-center justify-center text-center ${paddingClass} rounded-xl border font-bold transition-all select-none ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${
              isSelected
                ? "border-brand-primary bg-brand-primary-light/40 text-brand-primary shadow-sm ring-1 ring-brand-primary/20"
                : "border-brand-border bg-white text-brand-secondary hover:bg-brand-surface-muted/60 hover:border-brand-border"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={disabled}
              onChange={() => {}}
              className="sr-only"
            />
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span>{opt.label}</span>
              {opt.badge && (
                <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-brand-primary-light text-brand-primary border border-brand-primary/20">
                  {opt.badge}
                </span>
              )}
            </div>
            {opt.subLabel && (
              <span className="text-[10px] font-normal text-brand-text-muted mt-0.5">
                {opt.subLabel}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
