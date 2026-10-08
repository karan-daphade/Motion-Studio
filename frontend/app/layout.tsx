import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { appName, branding } from "@/config/branding";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${appName} — ${branding.tagline}`,
  description: "Enterprise multi-tenant restaurant and hotel live operations platform with QR table sessions, real-time KDS, and intelligent operations management.",
  icons: {
    icon: branding.logoPath,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-brand-background text-brand-text-primary antialiased selection:bg-brand-primary-light selection:text-brand-primary">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
