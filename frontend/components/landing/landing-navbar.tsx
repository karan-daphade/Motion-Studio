"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { appName } from "@/config/branding";

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <BrandLogo size="md" href="/" />
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-brand-text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-ready animate-pulse" />
            <span>Live POS & Operations</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-text-secondary">
          <a href="#features" className="hover:text-brand-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-brand-primary transition-colors">
            How It Works
          </a>
          <a href="#multi-branch" className="hover:text-brand-primary transition-colors">
            Multi-Branch
          </a>
          <a href="#roles" className="hover:text-brand-primary transition-colors">
            Role Portals
          </a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-text-primary hover:bg-brand-surface-muted transition-colors border border-transparent hover:border-brand-border"
          >
            Owner Login
          </Link>
          <Link
            href="/admin/signup"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-xl p-2.5 text-brand-text-secondary hover:bg-brand-surface-muted hover:text-brand-text-primary transition-colors border border-brand-border"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-white px-4 py-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-brand-text-primary hover:text-brand-primary py-2"
            >
              Platform Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-brand-text-primary hover:text-brand-primary py-2"
            >
              How It Works
            </a>
            <a
              href="#multi-branch"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-brand-text-primary hover:text-brand-primary py-2"
            >
              Multi-Branch Operations
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-brand-text-primary hover:text-brand-primary py-2"
            >
              Four Core User Portals
            </a>

            <div className="pt-4 border-t border-brand-border flex flex-col gap-3">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl border border-brand-border py-3 text-sm font-semibold text-brand-text-primary hover:bg-brand-surface-muted"
              >
                Owner Login
              </Link>
              <Link
                href="/admin/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-brand-primary py-3 text-sm font-bold text-white shadow-brandCard hover:bg-brand-primary-hover"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
