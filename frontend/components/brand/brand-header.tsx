"use client";

import { useState, useRef, useEffect } from "react";
import BrandLogo from "./brand-logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, User, LogOut, Loader2, ChevronDown, Menu } from "lucide-react";
import { logoutAdmin } from "@/app/actions/auth-actions";

interface BrandHeaderProps {
  roleName: string;
  roleBadgeColor?: string;
  userEmail?: string;
  userName?: string;
  currentBranch?: string;
  showBackToHub?: boolean;
  hasActiveBranch?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function BrandHeader({
  roleName,
  userEmail = "demo.operator@bharatqr.internal",
  userName,
  currentBranch,
  showBackToHub = true,
  hasActiveBranch = true,
  onMobileMenuToggle,
}: BrandHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = userName?.trim() || userEmail.split("@")[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6">
          {onMobileMenuToggle && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="md:hidden rounded-lg p-2 text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary transition-colors focus:outline-none"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <BrandLogo size="md" roleBadge={roleName} />

          {currentBranch && (
            <div className="hidden items-center gap-2 rounded-lg bg-brand-surface-muted px-3 py-1.5 text-xs font-medium text-brand-text-secondary md:flex">
              <span className="h-2 w-2 rounded-full bg-status-ready animate-pulse" />
              <span>Branch: <strong className="text-brand-text-primary">{currentBranch}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showBackToHub && (
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text-secondary transition-colors hover:bg-brand-surface-muted hover:text-brand-text-primary sm:flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Role Hub</span>
            </Link>
          )}

          {/* Notification bell: Hidden when onboarding / no active branch */}
          {hasActiveBranch && (
            <button
              type="button"
              title="Notifications"
              className="relative rounded-lg p-2 text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-primary" />
            </button>
          )}

          <div className="h-5 w-px bg-brand-border" />

          {/* Profile trigger & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-brand-surface-muted transition-colors focus:outline-none"
              aria-expanded={isDropdownOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary font-bold text-xs border border-brand-primary/20">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden flex-col text-left sm:flex">
                <span className="text-xs font-bold text-brand-text-primary truncate max-w-[140px]">{displayName}</span>
                <span className="text-[10px] text-brand-text-muted">{roleName}</span>
              </div>
              <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-brand-text-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-brand-border bg-white p-3 shadow-xl animate-in fade-in duration-100 z-50">
                <div className="flex items-center gap-3 px-2 py-2 border-b border-brand-border/60 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary font-bold text-sm border border-brand-primary/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-brand-text-primary truncate">{displayName}</p>
                    <p className="text-[11px] text-brand-text-muted truncate">{userEmail}</p>
                    <span className="inline-block mt-1 rounded bg-brand-primary-light/80 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                      {roleName}
                    </span>
                  </div>
                </div>

                {currentBranch && (
                  <div className="px-2 py-2 text-[11px] text-brand-text-secondary border-b border-brand-border/40">
                    Branch: <strong className="text-brand-text-primary">{currentBranch}</strong>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <LogOut className="h-3.5 w-3.5" />
                    )}
                    <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
