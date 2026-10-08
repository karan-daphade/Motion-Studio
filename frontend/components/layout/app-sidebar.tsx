"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  LayoutGrid, 
  Receipt, 
  ChefHat, 
  Calculator, 
  UtensilsCrossed, 
  Building2, 
  Clock, 
  FileText, 
  ShieldAlert, 
  Plus, 
  X, 
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from "lucide-react";
import BrandLogo from "@/components/brand/brand-logo";

export interface BranchOption {
  id: string;
  name: string;
  status: string;
}

interface AppSidebarProps {
  branches: BranchOption[];
  currentBranchId?: string;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AppSidebar({
  branches,
  currentBranchId,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(
    pathname.startsWith("/admin/settings")
  );

  const selectedBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const isAllBranches = searchParams.get("branchId") === "all";

  const handleBranchSelect = (branchId: string) => {
    setIsBranchDropdownOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (branchId === "all") {
      params.set("branchId", "all");
    } else {
      params.set("branchId", branchId);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const isRouteActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      exact: true,
      icon: LayoutDashboard,
      badge: isAllBranches ? "All" : undefined,
    },
    {
      label: "Outlets",
      href: "/admin/outlets",
      icon: Store,
      badge: branches.length > 0 ? `${branches.length}` : undefined,
    },
    {
      label: "Employees",
      href: "/admin/employees",
      icon: Users,
    },
    {
      label: "Permissions",
      href: "/admin/permissions",
      icon: ShieldCheck,
      badge: "Soon",
    },
    {
      label: "Subscription",
      href: "/admin/subscription",
      icon: CreditCard,
    },
  ];

  const settingsSubItems = [
    { label: "Branch Profile", href: "/admin/settings/branch", icon: Building2 },
    { label: "Kitchens & Bars", href: "/admin/settings/kitchens", icon: ChefHat },
    { label: "Shifts", href: "/admin/settings/shifts", icon: Clock },
    { label: "Sections & Tables", href: "/admin/settings/sections", icon: LayoutGrid },
    { label: "Employees", href: "/admin/settings/employees", icon: Users },
    { label: "Menu Catalog", href: "/admin/settings/menu", icon: UtensilsCrossed },
    { label: "Taxes & Charges", href: "/admin/settings/taxes", icon: FileText },
    { label: "Integrations", href: "/admin/settings/integrations", icon: Sparkles, badge: "Upcoming" },
    { label: "Security", href: "/admin/settings/security", icon: ShieldAlert },
  ];

  const operationsItems = [
    { label: "Tables", href: "/operations/tables", icon: LayoutGrid },
    { label: "Orders", href: "/operations/orders", icon: Receipt },
    { label: "KDS", href: "/operations/kds", icon: ChefHat },
    { label: "Billing", href: "/operations/billing", icon: Calculator },
    { label: "Menu", href: "/operations/menu", icon: UtensilsCrossed },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      <div>
        {/* Top Header & Mobile Close Button */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-brand-border/60">
          <div className="flex items-center gap-2">
            {!isCollapsed ? (
              <BrandLogo size="sm" roleBadge="Admin" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white font-black text-sm">
                B
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-surface-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Branch Switcher Dropdown */}
        <div className="p-3 border-b border-brand-border/40">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between rounded-xl border border-brand-border/80 bg-brand-surface-muted/60 p-2 text-left transition-all hover:bg-brand-surface-muted focus:outline-none ${
                isCollapsed ? "justify-center p-2" : "px-3 py-2"
              }`}
              title={isCollapsed ? (isAllBranches ? "All Outlets" : selectedBranch?.name) : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-primary-light text-brand-primary font-bold">
                  <Store className="h-3.5 w-3.5" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-brand-secondary truncate">
                      {isAllBranches ? "All Outlets (Overview)" : (selectedBranch?.name || "Select Outlet")}
                    </p>
                    <p className="text-[10px] text-brand-text-muted truncate">
                      {isAllBranches 
                        ? `${branches.length} Outlets Total` 
                        : (selectedBranch?.status === "active" ? "Active Outlet" : "Setup in progress")}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`h-3.5 w-3.5 text-brand-text-muted transition-transform shrink-0 ${isBranchDropdownOpen ? "rotate-180" : ""}`} />
              )}
            </button>

            {/* Dropdown Menu */}
            {isBranchDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-brand-border bg-white p-1.5 shadow-xl animate-in fade-in duration-100 min-w-[220px]">
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleBranchSelect("all")}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isAllBranches ? "bg-brand-primary-light text-brand-primary font-bold" : "text-brand-secondary hover:bg-brand-surface-muted"
                    }`}
                  >
                    <span>All Outlets (Overview)</span>
                    {isAllBranches && <Check className="h-3.5 w-3.5 text-brand-primary" />}
                  </button>

                  <div className="my-1 border-t border-brand-border/40" />

                  {branches.map((b) => {
                    const isSelected = !isAllBranches && (b.id === currentBranchId || (!currentBranchId && b.id === branches[0]?.id));
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBranchSelect(b.id)}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                          isSelected ? "bg-brand-primary-light text-brand-primary font-bold" : "text-brand-secondary hover:bg-brand-surface-muted"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-semibold">{b.name}</p>
                          <span className={`text-[9px] ${b.status === "active" ? "text-emerald-600" : "text-amber-600"}`}>
                            {b.status === "active" ? "● Active" : "○ In Progress"}
                          </span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-brand-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-brand-border/40">
                  <Link
                    href="/admin/outlets?action=new"
                    onClick={() => setIsBranchDropdownOpen(false)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary-light/60 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Outlet</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          {/* Section 1: Main Admin Management */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-wider text-brand-text-muted">
                Management
              </p>
            )}
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const active = isRouteActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-brand-primary-light text-brand-primary font-bold shadow-sm"
                        : "text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-brand-primary" : "text-brand-text-muted"}`} />
                    {!isCollapsed && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-brand-primary">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}

              {/* Settings Accordion / Submenu */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSettingsExpanded((prev) => !prev)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    pathname.startsWith("/admin/settings")
                      ? "bg-brand-primary-light/40 text-brand-primary font-bold"
                      : "text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title={isCollapsed ? "Settings" : undefined}
                >
                  <Settings className={`h-4 w-4 shrink-0 ${pathname.startsWith("/admin/settings") ? "text-brand-primary" : "text-brand-text-muted"}`} />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between">
                      <span>Settings</span>
                      <ChevronRight className={`h-3.5 w-3.5 text-brand-text-muted transition-transform ${isSettingsExpanded ? "rotate-90" : ""}`} />
                    </div>
                  )}
                </button>

                {/* Submenu Links */}
                {!isCollapsed && isSettingsExpanded && (
                  <div className="ml-4 pl-3 border-l border-brand-border/60 mt-1 space-y-0.5">
                    {settingsSubItems.map((sub) => {
                      const active = pathname === sub.href;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                            active
                              ? "bg-brand-primary-light text-brand-primary font-bold"
                              : "text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon className={`h-3 w-3 shrink-0 ${active ? "text-brand-primary" : "text-brand-text-muted"}`} />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className="rounded bg-amber-100 text-amber-800 text-[8px] font-bold px-1 py-0.2">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border/60" />

          {/* Section 2: Operations */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-wider text-brand-primary">
                Live Operations
              </p>
            )}
            <nav className="space-y-0.5">
              {operationsItems.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/20"
                        : "text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-brand-text-muted"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Collapse / Expand Toggle Button */}
      <div className="hidden md:block p-3 border-t border-brand-border/60">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 rounded-xl p-2 text-xs font-semibold text-brand-text-muted hover:bg-brand-surface-muted hover:text-brand-text-primary transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-16 left-0 bottom-0 z-30 border-r border-brand-border bg-white transition-all duration-200 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Backdrop + Slide-over) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-white border-r border-brand-border shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
