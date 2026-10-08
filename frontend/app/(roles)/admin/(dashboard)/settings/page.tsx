import React from "react";
import Link from "next/link";
import { 
  Building2, 
  ChefHat, 
  Clock, 
  LayoutGrid, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Settings
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsHubPage() {
  const settingsSections = [
    {
      title: "Branch Profile",
      href: "/admin/settings/branch",
      icon: Building2,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Manage branch legal name, GSTIN, FSSAI license, phone numbers, and physical address.",
    },
    {
      title: "Kitchens & Bars (KDS)",
      href: "/admin/settings/kitchens",
      icon: ChefHat,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Configure prep stations, bar counters, ticket printers, and default kitchen dispatching.",
    },
    {
      title: "Operating Shifts",
      href: "/admin/settings/shifts",
      icon: Clock,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description: "Configure lunch, dinner, or midnight shifts, operating hours, and cash drawer handover rules.",
    },
    {
      title: "Dining Sections & Tables",
      href: "/admin/settings/sections",
      icon: LayoutGrid,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description: "Set up dining halls, outdoor patio, AC sections, table capacity, shapes, and QR codes.",
    },
    {
      title: "Staff & Employees",
      href: "/admin/employees",
      icon: Users,
      color: "text-teal-600 bg-teal-50 border-teal-200",
      description: "Add managers, waiters, cashiers, chefs, assign shifts and section supervisory permissions.",
    },
    {
      title: "Menu Catalog Engineering",
      href: "/admin/settings/menu",
      icon: UtensilsCrossed,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description: "Organize food categories, items, dietary tags (Veg/Non-Veg), portion sizes, addons, and prices.",
    },
    {
      title: "Taxes & Discretionary Charges",
      href: "/admin/settings/taxes",
      icon: Receipt,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description: "Configure CGST/SGST tax slabs, service charge notes, packaging fees, and promo discounts.",
    },
    {
      title: "Integrations & API",
      href: "/admin/settings/integrations",
      icon: Sparkles,
      color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
      description: "Connect Swiggy, Zomato, WhatsApp notification gateways, and cloud fiscal printers.",
      badge: "Upcoming",
    },
    {
      title: "Security & Credentials",
      href: "/admin/settings/security",
      icon: ShieldAlert,
      color: "text-slate-700 bg-slate-100 border-slate-300",
      description: "Update owner master password, review active sign-in sessions, and enforce POS PIN policies.",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
            Settings & Business Hub
          </h1>
        </div>
        <p className="text-xs text-brand-text-secondary mt-1">
          Configure all core parameters of your restaurant, operational branches, menu, and tax compliance.
        </p>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.href}
              href={sec.href}
              className="group flex flex-col justify-between rounded-3xl border border-brand-border bg-white p-6 shadow-brandCard hover:shadow-md hover:border-brand-primary/60 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${sec.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {sec.badge && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                      {sec.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-brand-secondary group-hover:text-brand-primary transition-colors">
                  {sec.title}
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1.5 leading-relaxed">
                  {sec.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs font-bold text-brand-primary group-hover:translate-x-0.5 transition-transform">
                <span>Configure Settings</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
