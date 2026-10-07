---
name: render-ops
description: How to render compositions with Remotion CLI — single stills, batch renders, format exports, and the determinism check.
---

# Skill: Render Operations

> Read `docs/architecture.md` section 6.4 (production pipeline) and `docs/requirements.md` section 8.11 (REN) before running any render.

## Render commands (run from `remotion-video/`)

### Preview (Remotion Studio)
```bash
npx remotion studio
```

### Single still (for QA and style-frame review)
```bash
npx remotion still --composition=HelloDeterminism --frame=30 out/stills/frame-30.png
```

### Full video render
```bash
npx remotion render --composition=FeatureReel_qr_ordering_en --output=out/master.mov
```

### Batch render (all languages × formats)
```bash
node src/render-all.ts
```

### Determinism check (MUST pass before any commit with visual changes)
```bash
npm run determinism
```

## Output formats and specs

| Format | Resolution | FPS | Use |
|--------|-----------|-----|-----|
| 9:16 | 1080×1920 | 30 | Instagram Reels, TikTok, WhatsApp Status |
| 4:5 | 1080×1350 | 30 | Instagram Feed |
| 1:1 | 1080×1080 | 30 | Instagram Feed square |
| 16:9 | 1920×1080 | 30 | YouTube, signage |
| ProRes master | 1080×1920 | 30 | Archive, grade hand-off |

## Codec flags

- Masters: `--codec prores-4444`
- Web delivery: `--codec h264`
- WhatsApp: `--codec h264 --crf 28 --scale 0.5`

## Concurrency

- Default `--concurrency` is one tab per CPU core.
- WebGL-heavy scenes (3D, shaders): use `--concurrency=2` to avoid GPU OOM.

## Rules

- `out/` is gitignored. Never commit render output.
- Always run `npm run determinism` after any animation change.
- Log render manifest (composition, language, format, loudness, checksums) in `qa/`.
- Renders must work offline — no network calls at render time.
