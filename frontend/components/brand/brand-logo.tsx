"use client";

import Image from "next/image";
import Link from "next/link";
import { appName, logoPath } from "@/config/branding";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  roleBadge?: string;
  href?: string;
}

export default function BrandLogo({
  size = "md",
  showName = true,
  roleBadge,
  href = "/",
}: BrandLogoProps) {
  const dimensions = {
    sm: { img: 28, text: "text-lg", badge: "text-[10px] px-1.5 py-0.5" },
    md: { img: 36, text: "text-xl", badge: "text-xs px-2 py-0.5" },
    lg: { img: 48, text: "text-2xl", badge: "text-xs px-2.5 py-1" },
    xl: { img: 64, text: "text-3xl", badge: "text-sm px-3 py-1" },
  }[size];

  const content = (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center rounded-xl bg-white shadow-sm border border-brand-border p-1 overflow-hidden transition-transform duration-200 hover:scale-105">
        <Image
          src={logoPath}
          alt={appName}
          width={dimensions.img}
          height={dimensions.img}
          className="object-contain"
          priority
        />
      </div>

      {showName && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-brand-secondary ${dimensions.text}`}>
              {appName}
            </span>
            {roleBadge && (
              <span
                className={`font-semibold rounded-full uppercase tracking-wider bg-brand-primary-light text-brand-primary border border-brand-primary/20 ${dimensions.badge}`}
              >
                {roleBadge}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
