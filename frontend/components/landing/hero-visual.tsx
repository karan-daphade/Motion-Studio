"use client";

import { motion } from "framer-motion";
import { 
  Radio, 
  QrCode, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Sparkles,
  TrendingUp
} from "lucide-react";
import { branding } from "@/config/branding";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Decorative Glow */}
      <div 
        className="absolute -top-12 -left-12 -right-12 -bottom-12 rounded-3xl opacity-25 blur-3xl -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, transparent 80%)`,
        }}
      />

      {/* Main Terminal Mockup Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-2xl border border-brand-border/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* Mock Window Titlebar */}
        <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-xs font-semibold text-brand-text-muted">
              bharatqr.live/operations
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <Radio className="h-3 w-3 animate-pulse text-emerald-500" />
            <span>Realtime KDS Active</span>
          </div>
        </div>

        {/* Live Order Card Grid */}
        <div className="space-y-4">
          {/* Order Header */}
          <div className="flex items-center justify-between rounded-xl bg-brand-surface-muted p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary font-bold text-sm">
                T-04
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-secondary text-sm">Table 4 — AC Dining Hall</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Active Session
                  </span>
                </div>
                <span className="text-xs text-brand-text-muted">Guest QR Ordering • 3 Guests</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-brand-text-muted">Running Bill</span>
              <p className="font-bold text-brand-secondary text-base">₹1,420.00</p>
            </div>
          </div>

          {/* Kitchen Routing Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Main Kitchen Ticket */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-xl border border-brand-border bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-brand-border/60">
                <div className="flex items-center gap-1.5 font-bold text-brand-secondary">
                  <ChefHat className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Main Kitchen</span>
                </div>
                <span className="text-[10px] font-mono text-brand-text-muted">Station 1</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-brand-primary">1x</span>
                    <span className="font-medium text-brand-text-primary">Paneer Tikka Masala</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    <Clock className="h-2.5 w-2.5 animate-spin text-blue-500" />
                    Preparing
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-brand-primary">2x</span>
                    <span className="font-medium text-brand-text-primary">Butter Garlic Naan</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    Ready
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bar Ticket */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="rounded-xl border border-brand-border bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-brand-border/60">
                <div className="flex items-center gap-1.5 font-bold text-brand-secondary">
                  <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Beverage Counter</span>
                </div>
                <span className="text-[10px] font-mono text-brand-text-muted">Station 2</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">2x</span>
                    <span className="font-medium text-brand-text-primary">Fresh Lime Soda</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    Served
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">1x</span>
                    <span className="font-medium text-brand-text-primary">Cold Brew Tonic</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    <Clock className="h-2.5 w-2.5 text-blue-500" />
                    Prep
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-brand-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <span className="text-brand-text-secondary">
                Avg order turnaround: <strong className="text-brand-text-primary font-bold">8.4 mins</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-primary font-semibold">
              <QrCode className="h-3.5 w-3.5" />
              <span>Zero Waiter Delay</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
