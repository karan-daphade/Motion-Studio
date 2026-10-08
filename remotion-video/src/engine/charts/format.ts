// src/engine/charts/format.ts
// Indian Number & Currency Formatter (UI-05)

export function formatIndianNumber(value: number, isCurrency = false): string {
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rounded);

  return isCurrency ? `₹${formatted}` : formatted;
}
