---
name: visual-qa
description: How to run the visual QA loop — rendering stills, scoring against the agency-grade rubric, and filing fixes — for any composition.
---

# Skill: Visual QA

> Read `docs/quality-rubric.md` (section 10) completely before running QA on any composition.

## QA process (from PRD section 10 rubric)

### Step 1 — Render reference stills

```bash
# Render key frames: hook, reveal, demo peak, CTA
npx remotion still --composition=<id> --frame=10 out/qa/<id>-hook.png
npx remotion still --composition=<id> --frame=60 out/qa/<id>-reveal.png
npx remotion still --composition=<id> --frame=300 out/qa/<id>-demo.png
npx remotion still --composition=<id> --frame=840 out/qa/<id>-cta.png
```

### Step 2 — Score against the rubric

Score each still 0–10 on the following dimensions (from `docs/quality-rubric.md`):

| Dimension | Weight | Key questions |
|-----------|--------|---------------|
| Concept & narrative | 15 pts | Does the story arc work? Is the hook strong? |
| Motion quality | 20 pts | Token springs? Stagger? Follow-through? |
| Typography | 15 pts | Devanagari rules? Readability? Never overflows? |
| Composition | 15 pts | Safe zones? One hero element? Asymmetry? |
| Color & look | 15 pts | On-brand palette? No default gradients? Grain? |
| Audio | 10 pts | VO sync? Music ducking? -14 LUFS? |
| Technical | 10 pts | Determinism? No lint errors? Typecheck pass? |

### Step 3 — Hard-fail conditions (from PRD section 10.2)

**Reject immediately if ANY of these are true:**
- Hardcoded text (not from catalog)
- `Math.random()` or `Date` in any visual path
- Devanagari conjunct broken by character animation
- Text overflow in any locale
- Safe zone violation
- Lint or typecheck errors

### Step 4 — File fixes

For each issue, create a finding in `qa/reports/<date>-<composition>.md`:

```markdown
## Finding: Text overflow in Hindi title — FAIL
Frame: 60
Issue: Hindi title "क्यूआर ऑर्डरिंग सुविधा" overflows safe zone at 9:16
Fix: Apply fitText() with maxWidth = compositionWidth * (1 - 2 * SAFE_ZONE_9_16.horizontal)
```

### Step 5 — Re-render and re-score

Iterate until score ≥ 70 for Phase 3, ≥ 80 for Phase 5, ≥ 85 for Phase 8 hero film.

## Determinism gate

Run `npm run determinism` after every fix. If it fails, **stop and report** — do not commit.
