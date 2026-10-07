---
name: motion-identity
description: How to apply Motion Studio's token system — springs, easing, timing, colors, safe zones — to any scene or composition. Use this skill before writing any animation code.
---

# Skill: Motion Identity

> Read `docs/architecture.md` sections 6.1–6.2 and `docs/guidelines.md` section 2 before starting any task that involves animation.

## When to use this skill

Any time you are writing or reviewing code that sets opacity, position, scale, rotation, color, or any other time-varying visual property.

## Token files

All tokens live in `src/tokens/`. Never hardcode values in scene files.

| File | Exports | Purpose |
|------|---------|---------|
| `springs.ts` | `SPRING_LIGHT`, `SPRING_MEDIUM`, `SPRING_HEAVY`, `SPRING_HERO` | Spring configs for `spring()` |
| `easing.ts` | `HOUSE_EASE`, `EXIT_EASE`, `SNAP_EASE` | Cubic-bezier arrays for `interpolate()` |
| `timing.ts` | `DURATION_*`, `STAGGER_*`, `textHoldFrames()` | Frame counts for durations |
| `colors.ts` | `COLORS` | Studio defaults — override from catalog |
| `safeZones.ts` | `SAFE_ZONES`, `SAFE_ZONE_9_16`, etc. | Keep content inside these |

## Spring tier selection

| Object type | Token |
|-------------|-------|
| Chip, icon, badge, tooltip | `SPRING_LIGHT` |
| Card, button, list item | `SPRING_MEDIUM` |
| Panel, device, modal | `SPRING_HEAVY` |
| Hero reveal, camera settle | `SPRING_HERO` |

## Usage pattern

```typescript
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRING_MEDIUM } from '../tokens/springs';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const progress = spring({ frame, fps, config: SPRING_MEDIUM, durationInFrames: 20 });
```

## Rules (non-negotiable)

- `NEVER` use `Math.random()`, `Date.now()`, or `new Date()` for any visual value.
- `NEVER` hardcode spring damping/mass/stiffness — always import from `src/tokens/springs`.
- `NEVER` use CSS `animation`, `transition`, `setTimeout`, or `requestAnimationFrame`.
- All motion must derive from `useCurrentFrame()`.
- Stagger siblings by `STAGGER_MIN`–`STAGGER_MAX` frames (3–5). Overlap entrances; avoid purely sequential.
- Apply follow-through: heavier objects settle later than lighter ones.
- Text hold: use `textHoldFrames(wordCount)` from `timing.ts`.

## Safe zone checklist (9:16)

- Top inset: `SAFE_ZONE_9_16.top` (14% from top)
- Bottom inset: `SAFE_ZONE_9_16.bottom` (25% from bottom)
- Horizontal: `SAFE_ZONE_9_16.horizontal` (5% each side)

## Verification

After any animation change, run `npm run typecheck` and `npm run determinism` before committing.
