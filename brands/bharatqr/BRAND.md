# Brand Brief: BharatQR

> **Status:** Draft (Codebase Intake Fulfilled)  
> **Source Codebase:** `C:\Users\karan\Desktop\MyPOS`  
> **Intake Date:** 2026-10-07  
> **Schema Version:** 1.0  

---

## 1. Brand Overview & Offering

**BharatQR** is an enterprise-grade, fully responsive, web-based multi-tenant POS and live operations platform designed specifically for Indian restaurants, cafes, bars, and hotels.

- **Tagline:** *"Intelligent Restaurant & Hotel Live Operations Platform"*
- **Industry:** Restaurant & Hotel SaaS
- **Target Markets:** India
- **Core USPs:**
  1. App-less QR table ordering with multi-device companion sync.
  2. Sequential 7-step branch onboarding wizard.
  3. Real-time kitchen order routing (KDS) across stations.
  4. Daily-reset section queue tokens (`{SectionLabel}-{DailySeq}`).
  5. Section 9(5) CGST Act compliant automated tax calculations.

---

## 2. Design System & Brand Palette

Extracted from `@/config/branding.ts`:

### Core Palette
- **Primary:** `#E8590C` (Vibrant Saffron / Warm Tangerine — energetic & appetizing)
- **Secondary:** `#0F172A` (Deep Slate Navy — executive stability & luxury feel)
- **Accent:** `#10B981` (Fresh Emerald — operational readiness & live action)
- **Background (Light):** `#F8FAFC`
- **Surface:** `#FFFFFF`
- **Surface Muted:** `#F1F5F9`
- **Border:** `#E2E8F0`
- **Background (Dark):** `#0F172A`
- **Surface (Dark):** `#1E293B`

### Status Palette
- **Pending:** `#F59E0B` (Warm Amber)
- **Preparing:** `#3B82F6` (Active Blue)
- **Ready:** `#10B981` (Radiant Emerald)
- **Served:** `#8B5CF6` (Soft Purple)
- **Billed:** `#64748B` (Slate Gray)
- **Cancelled:** `#EF4444` (Ruby Red)

---

## 3. Typography & Layout

- **Latin Font:** `Inter` (`var(--font-inter)`)
- **Devanagari Font:** `Noto Sans Devanagari`
- **Border Radii:** `6px` (sm), `10px` (md), `14px` (lg), `20px` (xl), `9999px` (full)
- **Base Grid:** 12-column responsive layout, 8px spacing unit.
- **Iconography:** Lucide React outline icons with 2px stroke.

---

## 4. Key Platform Roles & Portals

1. **Super Admin (`/super-admin`):** Platform provider, tenant subscriptions.
2. **Restaurant Admin (`/admin`):** 7-step branch setup, outlet management, live KPIs.
3. **Staff / Operations (`/operations`, `/staff`):** Visual table grid, KDS, live orders, waitlist FIFO queue.
4. **Customer (`/o/...`, `/q/...`, `/session/...`):** App-less table ordering, queue tracking, shared companion sessions.

---

## 5. Languages & Localization

- **Supported Languages:** English (`en`), Hindi (`hi`), Marathi (`mr`)
- **Currency:** Indian Rupee (`INR` / `₹`)
- **Number Format:** `en-IN` (e.g. `₹1,24,500`)
- **Date Format:** `DD/MM/YYYY`
- **Brand Names:**
  - English: `BharatQR`
  - Hindi: `भारत क्यूआर`
  - Marathi: `भारत क्यूआर`
