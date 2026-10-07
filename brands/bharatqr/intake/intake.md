# BharatQR — Filled Brand Intake Document

> **Source**: `C:\Users\karan\Desktop\MyPOS`  
> **Extracted on**: 2026-10-07  
> **Brand ID**: `bharatqr`  
> **Status**: Extracted from codebase & source documentation  

---

## Section S0: Project & Contacts

- **S0-01 (Display Name)**: `BharatQR`
- **S0-02 (Legal Name)**: `BharatQR Technologies`
- **S0-03 (Project Goal)**: Launch a hero brand film and per-feature video reels for restaurant and cafe owners.
- **S0-04 (Deliverables)**: 60s hero film, 15–30s feature Reels, 6s bumpers.
- **S0-05 (Success Measures)**: Hook hold rate, demo requests per video.
- **S0-06 (Deadline)**: 2026-12-15.
- **S0-07 / S0-08 / S0-09 (Contacts)**: Karan Datta Daphade (`karan@bharatqr.internal`, approver: true).

---

## Section S1: Business & Offering

- **S1-01 (Industry)**: Restaurant and hotel software (SaaS).
- **S1-02 (Offering)**: Enterprise-grade, responsive multi-tenant POS and live operations platform with QR-based table & room ordering, KDS, waitlist management, and automated GST compliance.
- **S1-03 (USPs)**:
  1. App-less QR table ordering with multi-device companion sync.
  2. Gated 7-step branch onboarding wizard.
  3. Real-time kitchen order routing (KDS) across stations.
  4. Section queue tokens with daily sequence reset (`{SectionLabel}-{DailySeq}`).
  5. Section 9(5) CGST Act compliant tax engine.
- **S1-04 (Markets)**: India.
- **S1-05 (Stage)**: Active development / Pre-launch: 7-step owner onboarding and live floor operations engines fully built.
- **S1-06 (Price Position)**: Affordable SaaS subscription designed for independent Indian restaurants, cafes, and bars.
- **S1-07 (Competitors)**: Petpooja, Posist, UrbanPiper, DotPe.

---

## Section S2: Audience

- **S2-01 (Primary Audience)**: Independent restaurant and cafe owner / operator.
- **S2-02 (Description)**: Runs 1 to 3 food service outlets, manages shifts and live floor operations personally.
- **S2-03 (Age Range)**: 28–55.
- **S2-04 (Languages)**: English, Hindi, Marathi.
- **S2-05 (Tech Comfort)**: Medium.
- **S2-06 (Channels)**: WhatsApp, Instagram, YouTube, Industry forums.
- **S2-07 (Pain Points)**: Aggregator commission squeeze (up to 30%+), miscommunication between waitstaff and kitchen during rush hours, clunky legacy desktop POS systems, complicated GST calculation and bill splitting errors.
- **S2-08 (Desires)**: Direct customer QR ordering bypassing third-party commissions, instant 7-step setup without IT specialists, reliable real-time KDS updates, automated GST-compliant billing.
- **S2-09 (Objections)**: Staff training overhead, offline resilience, menu setup complexity.

---

## Section S3: Brand Strategy & Tone

- **S3-01 (Mission)**: Empower every Indian food business with modern, broadcast-grade live operations technology.
- **S3-02 (Values)**: Operational speed and clarity, zero customer friction, data isolation, dual-storage resilience.
- **S3-03 (Positioning)**: The intelligent live operations platform built for high-velocity Indian dining.
- **S3-04 (Personality)**: Energetic, reliable, approachable, efficient.
- **S3-05 (Tone Boundaries)**: Not cluttered, not corporate-stiff, not overly academic, not gimmicky.
- **S3-06 (Taglines)**:
  - *"Intelligent Restaurant & Hotel Live Operations Platform"*
  - *"Hospitality at the Speed of QR"*
  - *"Scan. Order. Savor."*

---

## Section S4 & S5: Visual Identity & Colors

- **S4-01 (Logos)**:
  - Vector: `assets/logo.svg`
  - Raster: `assets/logo.png`
- **S5-01 (Primary Color)**: `#E8590C` (Vibrant Saffron / Warm Tangerine — energetic & appetizing)
- **S5-02 (Secondary Color)**: `#0F172A` (Deep Slate Navy — executive stability & luxury feel)
- **S5-03 (Accent Color)**: `#10B981` (Fresh Emerald — operational readiness & live action)
- **S5-04 (Neutrals)**: Background `#F8FAFC`, Surface `#FFFFFF`, Surface Muted `#F1F5F9`, Border `#E2E8F0`, Text Primary `#0F172A`, Text Secondary `#475569`, Text Muted `#94A3B8`.
- **S5-06 (Status Colors)**:
  - Pending: `#F59E0B` (Warm Amber)
  - Preparing: `#3B82F6` (Active Blue)
  - Ready: `#10B981` (Radiant Emerald)
  - Served: `#8B5CF6` (Soft Purple)
  - Billed: `#64748B` (Slate Gray)
  - Cancelled: `#EF4444` (Ruby Red)

---

## Section S6 & S7: Typography & Layout

- **S6-01 to S6-05 (Fonts)**: Inter (Latin UI & Headings), Noto Sans Devanagari (Hindi & Marathi).
- **S7-01 to S7-03 (Geometry & Radii)**: 12-column grid, 8px base units, 6px / 10px / 14px / 20px / full radii.
- **S7-06 (Icons)**: Lucide React outline icons with 2px stroke.

---

## Section S9: Product UI

- **Platform**: Web and mobile-web (responsive for mobile, tablet, desktop, foldable).
- **Core Screens**:
  1. `onboarding_wizard`: 7-step sequential gated branch onboarding.
  2. `table_management`: Operations table grid, visual floor layout, runtime multi-table merges.
  3. `kitchen_display`: Multi-station KDS (`pending` → `preparing` → `ready` → `served`).
  4. `waiting_list`: Walk-in queue with daily tokens (`{SectionLabel}-{DailySeq}`) and real-time updates.
  5. `customer_session`: Unified dining session screen with zero-OTP companion joining.

---

## Section S13: Localization

- **Supported Languages**: English (`en`), Hindi (`hi`), Marathi (`mr`).
- **Primary Language**: `en`.
- **Currency & Format**: Indian Rupee (`INR` / `₹`), `DD/MM/YYYY`, `en-IN` numbering.
- **Brand Name**:
  - `en`: BharatQR
  - `hi`: भारत क्यूआर
  - `mr`: भारत क्यूआर
