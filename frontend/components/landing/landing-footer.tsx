import Link from "next/link";
import BrandLogo from "@/components/brand/brand-logo";
import { branding } from "@/config/branding";

export default function LandingFooter() {
  return (
    <footer className="border-t border-brand-border bg-brand-secondary text-brand-text-inverse py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-brand-secondaryLight">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tight text-white">
                {branding.appName}
              </span>
            </div>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              {branding.tagline}. Designed for independent restaurants, bustling chains, and luxury hotel dining.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud & Realtime Online</span>
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-text-muted">
              <li><a href="#features" className="hover:text-white transition-colors">QR Table Sessions</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Kitchen Display System (KDS)</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Multi-Branch Manager</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Indian GST Engine</a></li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[11px]">
              Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-text-muted">
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Restaurant Admin Login</Link></li>
              <li><Link href="/admin/signup" className="hover:text-white transition-colors">New Restaurant Sign Up</Link></li>
              <li><Link href="/staff" className="hover:text-white transition-colors">Staff / POS Terminal</Link></li>
              <li><Link href="/customer" className="hover:text-white transition-colors">Customer QR Demo</Link></li>
              <li><Link href="/super-admin" className="hover:text-white transition-colors">Platform Super Admin</Link></li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[11px]">
              Security & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-text-muted">
              <li><span>Row Level Security (RLS)</span></li>
              <li><span>Bcrypt Credential Hashing</span></li>
              <li><span>Timing-Safe Verification</span></li>
              <li><span>Rate-Limited Auth Endpoints</span></li>
              <li><span>Audit Trail System</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-muted">
          <p>© {new Date().getFullYear()} {branding.appName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
            <Link href="/admin/signup" className="hover:text-white transition-colors">Create Account</Link>
            <span className="text-brand-text-muted/60">v0.2.0-alpha</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
