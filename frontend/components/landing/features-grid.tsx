import { 
  QrCode, 
  ChefHat, 
  GitBranch, 
  ShieldCheck, 
  Receipt, 
  Users, 
  Clock, 
  Smartphone,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { branding } from "@/config/branding";

const features = [
  {
    icon: QrCode,
    title: "Seamless QR Table Sessions",
    description:
      "Guests scan table or room QR codes to instantly join a shared live dining session without installing apps or signing up. Real-time cart synchronization allows everyone at the table to browse and order together.",
    badge: "Guest Experience",
    color: "bg-orange-50 text-brand-primary border-orange-200",
  },
  {
    icon: ChefHat,
    title: "Station-Level Kitchen Routing (KDS)",
    description:
      "Eliminate order slip confusion. Items automatically route to designated prep stations (Main Kitchen, Bar, Bakery, Dessert Counter). Supabase Realtime delivers instant ticket alerts to chef displays.",
    badge: "Kitchen Operations",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: GitBranch,
    title: "Enterprise Multi-Branch Control",
    description:
      "Manage all physical branches under one restaurant umbrella. Each location configures its own shifts, floor sections, prep kitchens, dynamic menus, and staff hierarchies with complete tenant isolation.",
    badge: "Multi-Location",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    icon: Users,
    title: "Granular Staff & Shift Hierarchy",
    description:
      "Assign waiters, section managers, kitchen staff, and cashiers to dedicated dining zones and working shifts. Shift management supports cross-midnight transitions and detailed access flags.",
    badge: "Workforce",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    icon: Receipt,
    title: "Intelligent GST Tax & Compliance Engine",
    description:
      "Fully configurable Indian tax engine supporting CGST, SGST, IGST, cess, service charges, inclusive/exclusive calculation modes, and regional city-tier tax adjustments.",
    badge: "Compliance Ready",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: ShieldCheck,
    title: "Immutable Security & Audit Trail",
    description:
      "Enterprise security architecture featuring bcrypt password encryption, SHA-256 OTP verification, brute-force account lockouts, httpOnly session cookies, and comprehensive PostgreSQL audit logs.",
    badge: "Bank-Grade Security",
    color: "bg-slate-100 text-slate-800 border-slate-300",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-white border-y border-brand-border/60 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20 mb-4">
            <span>Enterprise-Grade POS & Live Operations</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">
            Engineered Specifically for High-Velocity Hospitality
          </h2>
          <p className="mt-4 text-base text-brand-text-secondary leading-relaxed">
            Every feature in {branding.appName} is modeled after the real-world operational chaos of bustling restaurants, cafes, bars, and hotels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-background p-8 transition-all duration-300 hover:bg-white hover:shadow-brandHover hover:-translate-y-1 hover:border-brand-primary/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${item.color} shadow-sm transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand-text-secondary border border-brand-border shadow-xs">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-secondary group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-brand-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border/60">
                  <Link
                    href="/admin/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform"
                  >
                    <span>Deploy in your restaurant</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
