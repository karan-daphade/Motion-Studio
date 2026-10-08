import Link from "next/link";
import { ShieldCheck, Store, Users, QrCode, ArrowRight } from "lucide-react";
import { branding } from "@/config/branding";

const roles = [
  {
    id: "admin",
    name: "Restaurant Owner",
    badge: "Operations Hub",
    href: "/admin",
    icon: Store,
    description: "7-step branch onboarding wizard, multi-branch control, floor layouts, shift rules, and live sales analytics.",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "staff",
    name: "Staff & Waiters",
    badge: "Touch POS Terminal",
    href: "/staff",
    icon: Users,
    description: "Waitstaff table session manager, Kitchen Display System (KDS) stations, and section-wise settlement.",
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "customer",
    name: "Customer QR Ordering",
    badge: "Guest Mobile Web",
    href: "/customer",
    icon: QrCode,
    description: "Frictionless QR ordering experience, digital menu with item tags, live progress timeline, and check payment.",
    color: "from-violet-500 to-purple-700",
  },
  {
    id: "super-admin",
    name: "Platform Super Admin",
    badge: "SaaS Owner",
    href: "/super-admin",
    icon: ShieldCheck,
    description: "Platform-wide restaurant directory, subscription tier enforcement, system telemetry, and audit logs.",
    color: "from-blue-600 to-indigo-700",
  },
];

export default function RolePortalLinks() {
  return (
    <section id="roles" className="py-24 bg-white border-t border-brand-border scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20 mb-4">
            <span>Modular Role Portals</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">
            Built for Every Stakeholder in Your Hospitality Business
          </h2>
          <p className="mt-4 text-base text-brand-text-secondary leading-relaxed">
            Independent, role-specific interfaces designed with tailored ergonomical densities and strict security boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.id}
                href={role.href}
                className="group relative flex flex-col justify-between rounded-2xl bg-brand-background p-6 border border-brand-border transition-all duration-300 hover:bg-white hover:shadow-brandHover hover:-translate-y-1 hover:border-brand-primary/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-white shadow-sm transition-transform group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand-text-secondary border border-brand-border">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-secondary group-hover:text-brand-primary transition-colors">
                    {role.name}
                  </h3>
                  <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs font-bold text-brand-primary">
                  <span>Open Portal</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
