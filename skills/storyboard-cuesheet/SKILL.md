---
name: storyboard-cuesheet
description: How to create a cue-sheet JSON for a feature reel — beat sheet, frame mapping, voiceover sync, SFX placement, and schema validation.
---

# Skill: Storyboard and Cue Sheet

> Read `docs/requirements.md` section 8.4 (SCN) and Appendix B in `docs/PRD.full.md` before authoring a cue sheet.

## What is a cue sheet?

A cue sheet is a frame-accurate JSON document that maps copy, voiceover timing, SFX, and scene transitions to specific frame numbers. It is the contract between the audio pipeline and the scene engine.

## Story structure (from PRD section 4.5)

### Feature reel (15–30 s at 30 fps = 450–900 frames)

| Beat | Duration | Content |
|------|----------|---------|
| Hook | 0–2 s (0–60 f) | Pain question or surprising number |
| Reveal | 2–6 s (60–180 f) | Product name + feature title |
| Demo | 6–18 s (180–540 f) | Feature in action — UI, metric |
| Proof | 18–24 s (540–720 f) | Social proof number or logo |
| CTA | 24–30 s (720–900 f) | CTA text + logo sting |

## Cue-sheet JSON schema (excerpt from Appendix B)

```json
{
  "compositionId": "FeatureReel_qr_ordering_en",
  "fps": 30,
  "durationInFrames": 900,
  "lang": "en",
  "beats": [
    { "name": "Hook", "startFrame": 0, "endFrame": 60 },
    { "name": "Reveal", "startFrame": 60, "endFrame": 180 }
  ],
  "vo": [
    { "frame": 5, "line": "Customers waiting 20 minutes just to see the menu?", "audioFile": "public/voiceovers/en/qr_01.wav" }
  ],
  "sfxCues": [
    { "frame": 62, "sfx": "whoosh_soft" },
    { "frame": 178, "sfx": "ding" }
  ],
  "captions": "auto"
}
```

## Workflow

1. Lock the script (EN first, then HI, MR).
2. Record or synthesize voiceover; run Whisper for word timestamps.
3. Map Whisper timestamps to frame numbers: `frame = Math.round(timeSeconds * fps)`.
4. Fill in `sfxCues` relative to scene transitions.
5. Validate the cue sheet against the schema before handing off to the scene engine.
6. Store cue sheet in `remotion-video/src/catalog/cue-sheets/<id>.json`.

## Rules

- Cue sheets are source of truth for timing — scenes must not hardcode durations.
- Frame numbers are integers; never use floats in cue sheets.
- SFX identifiers must be registered in `src/engine/sfx-palette.ts`.
- All timing derives from `fps` (never assume 30 fps in code — read from `useVideoConfig()`).
