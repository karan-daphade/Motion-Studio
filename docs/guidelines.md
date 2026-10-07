# Remotion Guidelines (Non-Negotiable)

This file is read by every coding agent before every task.

## 1. Determinism
- Never use `Math.random()`, `Date.now()`, `new Date()` for visuals. Use `random('seed')` from remotion.
- No CSS animations/transitions, setTimeout, requestAnimationFrame. All motion from `useCurrentFrame()`.
- No unseeded or time-varying useState. Derive values from frame and props.
- Await fonts, images, models via `delayRender`/`continueRender` or Remotion loaders.
- No network calls at render time. Use snapshotted JSON.
- Physics simulations are precomputed per frame from a fixed seed.

## 2. Motion
- Use tokens from `src/tokens/` only. No raw spring/easing numbers in scenes.
- Spring tier follows object weight: `SPRING_LIGHT`, `SPRING_MEDIUM`, `SPRING_HEAVY`, `SPRING_HERO`.
- Stagger siblings 3-5 frames. Overlap animations; avoid purely sequential entrances.
- Add follow-through and settle to every moving object.
- One hero element per scene. Maximum three simultaneous text items.
- Text hold: at least 36 frames, plus 8 frames per word beyond four.

## 3. Typography and localization
- Fonts via `@remotion/google-fonts`; two typefaces maximum per video.
- Devanagari: line-height >= 1.4, no letter-spacing, animate by word or line, never by character.
- Use `fitText`/`measureText` so text never overflows in any language.
- Never hardcode copy. Pull from catalog via `lang`.
- Format money with `Intl.NumberFormat('en-IN')` (lakh/crore grouping).

## 4. Composition and safe zones
- 9:16: keep key content out of top ~14%, bottom ~25% and right edge (see `tokens/safeZones`).
- Layouts adapt per aspect ratio; do not simply scale.

## 5. Look
- Use brand palette tokens; at most two accent colors per scene.
- Glass only on hero surfaces. Seeded grain at 3-4%. No default purple-blue gradient.
- Place UI on devices in lit scenes with depth of field where appropriate.

## 6. Audio
- Every interaction has a defined sound from the palette. No raw stock whooshes.
- Duck music to ~10% during VO, ~35% in pauses with smooth ramps.
- Master to -14 LUFS, true peak <= -1 dBTP.

## 7. Assets and licensing
- Every asset has a row in `assets-manifest.json`. Every dependency is in `LICENSES.md`.
- Forbidden: items on the 'Do not use' list in PRD section 7.14.

## 8. Process
- Read docs first. Stay in scope. Verify packages with `npm view` before installing.
- New capability: write a plan, wait for approval. Finish with real test and render results.
