# ADR 002: Component Infrastructure & Pure Frame-Driven Animations

## Context
Phase 2 (Components) requires reusable, brand-agnostic UI and motion primitives (`src/theme`, `src/components/frames`, `src/engine/cursor`, `src/engine/charts`, `src/components/text`). Remotion mandates strict determinism, zero CSS transitions, and WCAG accessibility standards.

## Decisions

### 1. Pure Mathematical Animation (No CSS Transitions)
- CSS `transition:` declarations trigger Remotion runtime warnings (`@remotion/non-pure-animation`) and cause frame-rate dependent flickering during multi-threaded headless rendering.
- All animated elements (`CountUp`, `BarChart`, `LineChart`, `RingChart`, `WordReveal`, `Cursor`) compute styles purely via `interpolate` and mathematical easing curves (`eased = 1 - Math.pow(1 - progress, 3)`) as a function of current frame.

### 2. Unconditional `useCurrentFrame` & Vitest Mock Setup
- To comply with React's `react-hooks/rules-of-hooks`, `useCurrentFrame()` must be called unconditionally at component top level.
- Because Remotion throws when `useCurrentFrame` is called outside `<Composition>` or `<Player>`, Vitest uses `src/test/setup.ts` to mock `useCurrentFrame` defaulting to 0 for headless testing.
- All animated components also accept an optional `frame?: number` prop that overrides the hook value for Storybook controls, headless rendering, and deterministic unit tests.

### 3. Storybook 10 Remotion Player Integration
- Storybook 10 with Vite was integrated (`.storybook/preview.tsx`) using `@remotion/player`.
- Stories provide interactive controls for `frame` (0..120), `theme`, and `locale` (`en`, `hi`, `mr`).

### 4. WCAG Contrast Enforcement
- `src/theme/contrast.ts` implements WCAG 2.1 relative luminance and contrast ratio calculations.
- `ThemeProvider` validates `primaryColor` vs `backgroundColor` against WCAG AA standards (4.5:1).

### 5. Automated Brand Literals Guard (BRD-25)
- `scripts/check-brand-literals.mjs` enforces zero inline hex codes and brand names across `src/components`, `src/theme`, and `src/engine`. All fallback colors reference `src/tokens/colors.ts`.

## Consequences
- Clean static validation passes across ESLint, TypeScript, Vitest, and Storybook builds.
- Components are fully deterministic and ready for BharatQR UI clones in Batch 2B.
