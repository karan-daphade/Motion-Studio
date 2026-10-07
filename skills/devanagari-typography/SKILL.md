---
name: devanagari-typography
description: Rules for rendering Hindi and Marathi text in Remotion — font selection, line-height, animation strategy, overflow prevention, and common pitfalls.
---

# Skill: Devanagari Typography

> Read `docs/requirements.md` section 8.7 (LOC) and `docs/guidelines.md` section 3 before any Devanagari text task.

## Approved fonts (all SIL Open Font License)

| Font | Weight range | Best for |
|------|-------------|---------|
| Noto Sans Devanagari | 100–900 | Body, captions, subtitles |
| Mukta | 200–800 | UI labels, short callouts |
| Hind | 300–700 | Mid-size body |
| Baloo 2 | 400–800 | Display, hero text |
| Poppins (Devanagari subset) | 300–700 | Bilingual mixed layouts |

Load fonts via `@remotion/google-fonts`. Maximum two typefaces per video.

## Critical rendering rules

| Rule | Reason |
|------|--------|
| `lineHeight >= 1.4` | Devanagari matras extend above and below the baseline — tight line-height clips them |
| `letterSpacing: 0` (no positive value) | Positive letter-spacing breaks conjunct consonants (e.g., क्ष splits incorrectly) |
| Animate by **word** or **line** — never by **character** | Character-level animation severs conjuncts and half-forms |
| Use `fitText` / `measureText` to guard against overflow | Hindi titles are often 30–40% wider than English equivalents |
| `direction: 'ltr'` (Devanagari is left-to-right) | Confirm on mixed bidi layouts |

## Font loading pattern

```typescript
import { loadFont } from '@remotion/google-fonts/NotoSansDevanagari';

const { fontFamily } = loadFont('normal'); // call at module level, not in component
```

## Word-by-word reveal pattern

```typescript
const words = hindiText.split(' ');
return (
  <>
    {words.map((word, i) => {
      const wordFrame = frame - i * STAGGER_MIN; // use timing token
      const opacity = spring({ frame: Math.max(0, wordFrame), fps, config: SPRING_LIGHT });
      return <span key={i} style={{ opacity, display: 'inline-block', marginRight: '0.25em' }}>{word}</span>;
    })}
  </>
);
```

## Stress test strings (from Appendix D)

Run any new text component against these:
- `क्षत्रिय महाराष्ट्र` — tests conjuncts and ra-matra
- `ऑर्डर ट्रैकिंग` — tests ra + halant + diacritic stacks
- `बिलिंग ₹1,23,456` — tests Indian number grouping

## Checklist before committing

- [ ] `lineHeight` ≥ 1.4 on all Devanagari text
- [ ] No `letterSpacing` > 0 on Devanagari
- [ ] Animation is word-level or line-level
- [ ] `fitText` used on any headline that changes locale
- [ ] Visual spot-check: render a still for the Devanagari frame (`npm run typecheck` + `npx remotion still`)
