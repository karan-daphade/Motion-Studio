import { QrCode, ChefHat, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { branding } from "@/config/branding";

const steps = [
  {
    step: "01",
    title: "Guests Scan Table QR & Browse Live Menu",
    description:
      "Guests open their phone camera, scan the unique QR code on their dining table or room, and instantly access your responsive digital menu. Guests can customize variations, dietary tags, and send orders directly.",
    icon: QrCode,
    badge: "Front of House",
  },
  {
    step: "02",
    title: "Order Items Route Directly to Station KDS",
    description:
      "Cocktails and beverages route to the Bar; entrees route to the Main Kitchen; desserts route to the Pastry station. Chefs update status in one tap, notifying waitstaff instantly the moment dishes are plated.",
    icon: ChefHat,
    badge: "Back of House",
  },
  {
    step: "03",
    title: "One-Click Section Billing & Automated GST",
    description:
      "Bills compile automatically with configured CGST, SGST, service charges, and dish discounts. Guests can request check settlement from their phone or settle directly at the cash register.",
    icon: CheckCircle2,
    badge: "Settlement & Audit",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-brand-background scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20 mb-4">
            <span>The 3-Step Live Operations Loop</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">
            From QR Scan to Kitchen Fire to Settled Bill
          </h2>
          <p className="mt-4 text-base text-brand-text-secondary leading-relaxed">
            Eliminate handwritten tickets, waiter miscommunication, and peak-hour ordering bottlenecks with a seamless real-time workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-white p-8 border border-brand-border shadow-brandCard transition-all hover:shadow-brandHover"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-black text-brand-primary/40">
                    {item.step}
                  </span>
                  <span className="rounded-full bg-brand-surface-muted px-2.5 py-1 text-[11px] font-semibold text-brand-text-secondary border border-brand-border">
                    {item.badge}
                  </span>
                </div>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-brand-secondary mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/admin/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-6 py-3.5 text-sm font-bold text-white shadow-brandCard hover:bg-brand-secondaryLight transition-all"
          >
            <span>Start Setting Up Your Restaurant</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
