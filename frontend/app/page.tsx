import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { branding } from "@/config/branding";
import LandingNavbar from "@/components/landing/landing-navbar";
import HeroVisual from "@/components/landing/hero-visual";
import FeaturesGrid from "@/components/landing/features-grid";
import HowItWorks from "@/components/landing/how-it-works";
import RolePortalLinks from "@/components/landing/role-portal-links";
import LandingFooter from "@/components/landing/landing-footer";


export const metadata: Metadata = {
  title: `${branding.appName} — ${branding.tagline}`,
  description:
    "Enterprise web-based POS and real-time operations engine for modern restaurants, cafes, bars, and hotels. Realtime QR table sessions, kitchen routing, multi-branch control, and automated GST compliance.",
  openGraph: {
    title: `${branding.appName} — Multi-Tenant Restaurant POS & Live Operations`,
    description:
      "Modern QR table ordering, real-time Kitchen Display Systems (KDS), and multi-branch management without expensive proprietary hardware.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary selection:bg-brand-primary-light selection:text-brand-primary">
      {/* Navigation Header */}
      <LandingNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Subtle Ambient Background Gradients */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 opacity-40 blur-3xl -z-10 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top, ${branding.primaryColor}25, ${branding.accentColor}15, transparent 70%)`
            }}
          />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Copy (Left Column) */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                {/* Micro Pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Next-Gen Cloud Restaurant Operating System</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-secondary leading-[1.1]">
                  Intelligent Operations for Modern Restaurants & Hotels
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg text-brand-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Frictionless QR table sessions for diners, instant multi-station kitchen routing for chefs, and unified multi-branch analytics for owners — all without dedicated POS hardware.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/admin/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-7 py-4 text-base font-bold text-white shadow-brandCard hover:bg-brand-primary-hover hover:shadow-brandHover transition-all transform active:scale-98"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/admin/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-7 py-4 text-base font-bold text-brand-text-primary hover:bg-brand-surface-muted transition-all"
                  >
                    <span>Owner Login</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-brand-text-secondary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-ready shrink-0" />
                    <span>Zero Hardware Lock-In</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-ready shrink-0" />
                    <span>Live Supabase Realtime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-ready shrink-0" />
                    <span>Indian GST Tax Engine</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual Mockup (Right Column) */}
              <div className="lg:col-span-6">
                <HeroVisual />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <FeaturesGrid />

        {/* 3-STEP HOW IT WORKS */}
        <HowItWorks />

        {/* 4 CORE ROLES */}
        <RolePortalLinks />

        {/* BOTTOM CTA BANNER */}
        <section className="py-20 bg-brand-background border-t border-brand-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-brand-secondary p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
              {/* Decorative circle glow */}
              <div 
                className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-30 blur-2xl pointer-events-none"
                style={{ backgroundColor: branding.primaryColor }}
              />

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white max-w-2xl mx-auto">
                Ready to Accelerate Table Turnaround and Supercharge Kitchen Workflow?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-brand-text-muted max-w-xl mx-auto">
                Join restaurants already upgrading to real-time QR ordering and automated station dispatch. Setup takes under 10 minutes.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/admin/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 py-4 text-base font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
                >
                  <span>Register Your Restaurant Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  <span>Sign In to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
