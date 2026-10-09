# ADR 003: UI Clones Architecture & Brand-Swap Isolation

## Context
Phase 2 Batch 2B requires creating 15 agency-grade cloned UI components from the BharatQR codebase (`frontend/`), organized across three functional groups:
1. **Customer Journey**: `TableCard`, `TableQrScan`, `WaitlistJoin`, `JoinSession`, `QueueRegistration`.
2. **Operations**: `KdsCard`, `OrderListPanel`, `BillingSummary`, `WaitlistManagementPanel`, `AlertsDrawer`.
3. **Onboarding & Brand**: `OnboardingStepper`, `StepBranch`, `BrandHeader`, `LandingHeroVisual`, `LandingFeaturesGrid`.

The engine must support seamless re-theming across brands without CSS leaks, strict determinism, Zod schema validation, localized Hindi/Marathi copy, and Storybook coverage.

## Decisions

### 1. Source Fidelity with Zero Direct Runtime Coupling
- Every clone cites its exact origin path in `frontend/` on line 1.
- Cloned components are stripped of external framework dependencies (`next/link`, `framer-motion`, Supabase realtime websockets, Next.js server actions) and re-engineered as pure React/Remotion prop-driven primitives.
- Motion (pulses, transitions, progress bars, KDS indicators) derives strictly from `useCurrentFrame()` and mathematical sine/polynomial easing curves, completely avoiding CSS transitions (`@remotion/non-pure-animation`).

### 2. Zod Props Typing (`z.input` vs `z.infer`)
- All component schemas define default values for optional props (e.g. `locale.default('en')`, `isSaving.default(false)`).
- Component prop types export `z.input<typeof PropsSchema>` rather than `z.infer`, ensuring that default fields remain optional when consuming components in JSX, tests, or Storybook stories.

### 3. Complete Token & Palette Decoupling (BRD-25 & Brand-Swap Test)
- All background colors, borders, font families, text levels, and layout radii are read exclusively from `useTheme()`.
- The brand-swap test suite (`src/components/clones/__tests__/brandSwap.test.tsx`) validates that rendering across distinct brand profiles (`baseBrand` vs `alternateBrand`) dynamically updates colors, fonts, and radii, with zero residual color leakage from the primary brand.

### 4. Authentic Indian Hospitality Domain Fixtures
- All mock fixtures in `src/catalog/mock/` reflect authentic Indian dining operations: INR (`₹`) prices, GST compliance (CGST/SGST), regional dishes (*Paneer Tikka Masala*, *Butter Garlic Naan*, *Fresh Lime Soda*), 10-digit Indian mobile formats (`+91 98...`), and Indian states/PIN codes.

## Consequences
- 100% test coverage across 25 test files (120 unit tests passed).
- Deterministic frame verification (SHA-256 match bit-for-bit across renders).
- Storybook 10 bundle cleanly generated with full interactive controls across all 15 clones.
