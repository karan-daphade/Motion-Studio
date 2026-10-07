<span id="sec_52" class="anchor"></span>8. Functional Requirements

Requirements are grouped by capability. There is no MVP cut-line;
**Tier** expresses build dependency order only:

| **Tier** | **Meaning**                                        |
|----------|----------------------------------------------------|
| T0       | Foundation: everything else depends on it          |
| T1       | Core: needed for a complete, polished single video |
| T2       | Advanced: cinematic quality layers                 |
| T3       | Expansion: product-level and automation features   |

<span id="sec_53" class="anchor"></span>8.1 Catalog and content (CAT)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| CAT-01 | Zod schemas for Product, Feature, Tenant props and Cue Sheet. | Invalid catalog fails the build with a readable error; schemas exported as JSON Schema. | T0 |
| CAT-02 | product.json holds brand name, domain, palette, CTA per language, logo and sonic logo reference. | Changing the primary color updates every composition with no code edit. | T0 |
| CAT-03 | features.json holds every feature with category, availability, UI component, mock data, localized copy, voiceover and hooks. | A new feature is addable with data only; at least 15 seed features present. | T0 |
| CAT-04 | Locale completeness gate: a feature is renderable only when en, hi, mr exist and are marked reviewed. | Rendering an unreviewed language is blocked with a clear message. | T1 |
| CAT-05 | Availability enforcement: roadmap features show a 'coming soon' treatment. | QA fails if a roadmap feature appears without the label. | T1 |
| CAT-06 | Length limits per field and language (title 48, sub 90 characters, adjustable). | Overlong strings fail validation before render. | T1 |
| CAT-07 | Realistic mock-data library (Indian names, menu items, rupee amounts, table numbers). | No lorem ipsum or Western placeholder data anywhere. | T1 |
| CAT-08 | Tenant props schema for personalized videos. | Invalid tenant data falls back safely or fails before render. | T3 |

<span id="sec_54" class="anchor"></span>8.2 Design system and tokens
(DS)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| DS-01 | Typed token modules: springs, easing, durations, stagger, text-hold, colors, typography, perspective, grain, safe zones. | No numeric spring or easing literal appears inside scenes (lint rule). | T0 |
| DS-02 | Spring tiers (LIGHT, MEDIUM, HEAVY, HERO) selected by object weight. | Component API accepts a weight prop mapped to a tier. | T0 |
| DS-03 | Theme object derived from product.json palette, with perceptual color helpers. | Swapping brand color keeps contrast above 4.5:1 for text. | T1 |
| DS-04 | Safe-zone constants for each format (9:16, 4:5, 1:1, 16:9). | Overlay helper renders the zones in Studio for review. | T1 |
| DS-05 | Motion identity doc generated from tokens. | docs/motion-identity.md stays in sync with code via a script. | T2 |

<span id="sec_55" class="anchor"></span>8.3 Component library (UI)

Components are **pure, prop-driven clones** of the real product UI, with
no data fetching, router, auth or side effects. They live in
src/components/ui-clones/ and are reviewed in Storybook.

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| UI-01 | Clone process: copy from frontend/, strip data and routing, expose all visible data through props. | A clone renders identically from mock props in Storybook and in Remotion. | T0 |
| UI-02 | Core clones: QR card and QR sheet, table grid and table card, session panel, waiting-list panel and token, menu spreadsheet table, tax and promo table, order card, KDS ticket and board, bill and receipt, analytics widgets, onboarding stepper, employee list, outlet card, notification bell. | Each has a Storybook story, a mock-data fixture and a Devanagari variant. | T1 |
| UI-03 | Device frames: phone (portrait and landscape), tablet, laptop, thermal printer and receipt, QR standee, counter terminal. | Each device accepts a screen child and exposes anchor points for camera and cursor. | T1 |
| UI-04 | Animated cursor with waypoint interpolation, click ripple and hover states. | Cursor path is defined as data; click frame triggers button press and SFX cue. | T1 |
| UI-05 | Frame-driven chart components (bar, line, ring, count-up). | Charts never use time-based animation; values are interpolated from frame. | T1 |
| UI-06 | Lighting-aware surfaces: spotlight card, glass panel, glow edge. | Highlight follows camera or cursor via frame-based props. | T2 |
| UI-07 | Cloned components inherit product design tokens, so product theme changes flow into videos. | Brand color swap test updates every screen. | T2 |

<span id="sec_56" class="anchor"></span>8.4 Scene engine (SCN)

| **Scene template** | **Purpose** | **Inputs** | **Default length (30 fps)** |
|----|----|----|----|
| Hook | Stop the scroll with pain, number or transformation | Hook text, visual, SFX | 30-60 frames |
| Problem | Make the pain tangible and local | Setting, lines, B-roll or illustration | 60-120 frames |
| Reveal | Product appears with a hero move | Device, screen component, camera path | 45-90 frames |
| FeatureDemo | One feature shown in action | Feature key, cursor path, callouts | 120-240 frames |
| Proof | Number, testimonial or comparison | Metric, quote, footage | 60-120 frames |
| Montage | Rapid sequence of screens or moments | Clips, beat grid | 90-180 frames |
| CTA | Final call to action with URL and logo | CTA text, domain, QR | 60-90 frames |
| LogoSting | Animated logo with sonic logo | Logo SVG, sting audio | 30-60 frames |

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| SCN-01 | Each scene is a typed component with a documented input contract and default timing. | Scenes compose through TransitionSeries or Series with no manual frame math in compositions. | T1 |
| SCN-02 | Scene durations derive from the cue sheet and audio timing, not hardcoded numbers. | Changing voiceover length changes scene timing automatically. | T1 |
| SCN-03 | Transitions: fade, slide, wipe, match-cut, whip-pan with directional blur, light leak, liquid shader. | Each transition has parameters and a preview story. | T2 |
| SCN-04 | Beat-synced cuts using music beat grid. | Cut times can be snapped to a beat array with one flag. | T2 |
| SCN-05 | Speed ramps via time remapping. | Slow-to-fast ramps work on clips and animations without audio glitch. | T2 |

<span id="sec_57" class="anchor"></span>8.5 Cinematography (CAM)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| CAM-01 | Virtual camera rig for 2.5D (CSS perspective) and 3D (R3F): dolly, truck, orbit, push-in, rack focus. | Camera moves are defined as keyframe data and previewable in Studio. | T1 |
| CAM-02 | Seeded handheld drift using noise, adjustable intensity. | Same seed gives identical motion across renders. | T2 |
| CAM-03 | Depth of field with animated focus distance. | Focus pulls between foreground and hero over a set number of frames. | T2 |
| CAM-04 | Camera motion blur with sample count control. | Whip pans show clean directional blur without banding. | T2 |
| CAM-05 | Lens effects: vignette, bloom, chromatic aberration, subtle distortion, anamorphic flare, halation. | Effects are presets with intensity limits to prevent overuse. | T2 |
| CAM-06 | Film grain: seeded grain overlay or scanned grain plate at 3-4 percent. | No visible banding on dark gradients in the delivery encode. | T1 |
| CAM-07 | Color: LUT application in-engine (3D scenes) and in finishing (ffmpeg lut3d). | A look can be switched by changing one LUT path. | T2 |

<span id="sec_58" class="anchor"></span>8.6 3D and hybrid Blender (3D)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| 3D-01 | R3F scene kit: lighting presets (counter lamp, kitchen warm, studio soft), HDRI environments, ground contact shadows. | A scene looks lit and grounded with no per-scene light tuning. | T2 |
| 3D-02 | Physical materials: glass with transmission, brushed metal, matte plastic, paper, steel. | Material library reused across devices and props. | T2 |
| 3D-03 | Hero props: phone on a table, QR standee, thermal printer feeding a receipt, POS terminal, KDS screen, tickets, cutlery and cups. | Each prop is a GLB with optimized geometry and a screen slot. | T2 |
| 3D-04 | Deterministic physics: falling order tickets, cards and coins from a fixed seed, cached per frame. | Two renders produce identical motion. | T2 |
| 3D-05 | Blender hero pipeline via bpy: scripted scene, Cycles render, export as image sequence, alpha video or GLB. | One command regenerates a hero shot from the .blend and script. | T2 |
| 3D-06 | Screen replacement: product UI mapped onto 3D device screens with correct perspective and reflection. | Screen content updates with props; no baked pixels. | T2 |
| 3D-07 | 2.5D parallax from photos using depth maps (Depth Anything V2 Small) and SAM cutouts. | Camera move reveals plausible depth without artifacts at edges. | T2 |

<span id="sec_59" class="anchor"></span>8.7 Typography and localization
(LOC)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| LOC-01 | Font stacks per language loaded via @remotion/google-fonts with await before render. | No fallback font flashes in any frame. | T0 |
| LOC-02 | Text components animate by word or line. A lint rule blocks per-character animation on Devanagari. | Conjunct stress test strings render correctly through every text animation. | T0 |
| LOC-03 | fitText and measureText guarantee text fits boxes in all three languages. | No overflow or clipping at any frame; automated check passes. | T1 |
| LOC-04 | Indian number and currency formatting (lakh and crore grouping, rupee symbol) via Intl.NumberFormat('en-IN'). | Amounts such as 84,200 and 1,25,000 render per Indian convention. | T1 |
| LOC-05 | Language switch via lang prop: copy, fonts, voiceover and captions all follow. | One render command per language yields complete localized video. | T1 |
| LOC-06 | Native-speaker review lock with reviewer and date in the catalog. | Unreviewed text cannot be rendered for release. | T1 |
| LOC-07 | Right text length budget: Devanagari strings may run up to 30 percent longer; layouts accommodate this. | Layout holds with the longest approved string. | T1 |

<span id="sec_60" class="anchor"></span>8.8 Audio (AUD)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| AUD-01 | Voiceover per language per video stored in public/voiceovers/\<lang\>/. | Naming convention enforced by a script. | T0 |
| AUD-02 | Duration auto-measured; calculateMetadata sets composition length from audio length plus padding. | Hindi and Marathi versions never cut off the narration. | T1 |
| AUD-03 | Whisper word-level timestamps drive visual events (word-synced reveals) and captions. | A named word triggers its animation within one frame of the spoken word. | T1 |
| AUD-04 | Sonic palette: UI sounds tuned to the music key, layered foley, risers, impacts, room tone. | Every on-screen interaction has a defined sound; no default whoosh library used raw. | T2 |
| AUD-05 | Sound cues defined in the cue sheet by frame and mapped to files. | Click sound fires on the exact frame of the cursor click. | T1 |
| AUD-06 | Automatic ducking: music at roughly 10 percent during voiceover, restoring to roughly 35 percent in pauses, with smooth ramps. | Voiceover intelligibility passes a listening check; no pumping. | T1 |
| AUD-07 | Spatial panning of SFX to follow on-screen position. | A sound from the left of frame is panned left. | T2 |
| AUD-08 | Mastering chain (EQ, compression, limiter) and loudness normalization to -14 LUFS, true peak at or below -1 dBTP. | Measured loudness is within 0.5 LU of target. | T1 |
| AUD-09 | Sonic logo and payment-style 'ding' motif designed in-house (no third-party jingles). | Motif appears in hero film and every bumper. | T2 |
| AUD-10 | Beat detection exports a beat grid JSON per track. | Scene cuts can snap to beats. | T2 |
| AUD-11 | Voice release tracking for any human voice recorded. | Signed release file linked in the asset manifest. | T1 |

<span id="sec_61" class="anchor"></span>8.9 Captions (CAP)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| CAP-01 | Word-synced captions in all three languages, TikTok-style highlight and a quieter 'subtitle' style. | Style switchable per format. | T1 |
| CAP-02 | Devanagari-aware line breaking (no splitting inside a grapheme cluster). | No broken glyphs at line breaks. | T1 |
| CAP-03 | Captions respect safe zones and never overlap key UI. | Automated overlap test on key frames. | T1 |
| CAP-04 | SRT and VTT exports per language. | Files generated with every render batch. | T1 |

<span id="sec_62" class="anchor"></span>8.10 Compositions and formats
(FMT)

| **Output** | **Resolution / ratio** | **Typical length** | **Notes** |
|----|----|----|----|
| Reel / Short | 1080x1920 (9:16) | 15-60 s | Safe zones, burned captions |
| Feed | 1080x1350 (4:5) | 15-45 s | Alternate crop with re-layout |
| Square | 1080x1080 (1:1) | 15-45 s | LinkedIn, WhatsApp |
| Landscape | 1920x1080 (16:9), 4K master | 30-90 s | Website, YouTube, presentations |
| Bumper | 9:16 and 16:9 | 6 s | Logo, benefit, sonic sting |
| WhatsApp cut | 720x1280 or 720x720 | Under 16 MB | Compressed H.264 |
| Signage loop | 1920x1080 or 1080x1920 | 30-120 s seamless | Muted, no CTA clutter |
| Master | ProRes 4444 / 422 HQ | Same as source | For grading and archive |

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| FMT-01 | Composition registry in Root.tsx generates compositions for every language, format and variant from catalog data. | Studio lists all outputs; no copy-pasted compositions. | T1 |
| FMT-02 | Layout adapts per aspect ratio through layout rules, not scaling. | 4:5 and 1:1 look designed, not cropped. | T2 |
| FMT-03 | Seamless loop support for signage. | First and last frames match; no visible jump. | T3 |

<span id="sec_63" class="anchor"></span>8.11 Render and export (REN)

| **Setting** | **Value** | **Purpose** |
|----|----|----|
| Frame rate | 30 fps default; 60 fps for fast UI scrolling shots | Smooth motion |
| Supersampling | Render at 2x (--scale=2) or at 4K and downscale for delivery | Crisper edges and text |
| Codec for delivery | H.264, --crf 16-18 | Quality vs size balance |
| Master codec | ProRes 4444 (alpha when needed) or 422 HQ | Grading and archival |
| Image format | PNG for alpha scenes; JPEG with high quality for others | Speed vs fidelity |
| GL backend | --gl=angle (or vulkan, egl on Linux) per machine | Stable WebGL |
| Concurrency | Tuned to CPU and RAM; lower for 3D scenes | Avoid crashes |
| Props | Passed by --props JSON file; includes lang, feature, variant | Batch rendering |

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| REN-01 | render-all.ts renders the matrix languages x formats x variants from a manifest. | One command produces every deliverable and a render manifest. | T1 |
| REN-02 | Determinism check: render twice, hash sampled frames and audio. | Hashes match or the build fails. | T1 |
| REN-03 | Resumable batch with skip of up-to-date outputs. | Interrupted batches continue without redoing finished renders. | T1 |
| REN-04 | Finishing script: LUT, grain, loudness normalization, delivery encodes, WhatsApp cut. | Finishing is one command per video. | T1 |
| REN-05 | Optional ProRes conform for DaVinci Resolve. | Master files import cleanly with correct color tags. | T2 |
| REN-06 | Thumbnails and cover frames via remotion still. | One cover per language per video. | T1 |

<span id="sec_64" class="anchor"></span>8.12 Automated QA (QA)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| QA-01 | Visual critique loop: render N key stills, send to a vision model with the rubric and style frames, receive structured JSON (scores and fix list). | Loop repeats until the threshold or an iteration cap; every iteration is logged. | T1 |
| QA-02 | Safe-zone check on 9:16 key frames. | Zero violations. | T1 |
| QA-03 | Contrast check (WCAG ratio) for all text on its background. | Minimum 4.5:1 for body text, 3:1 for large display text. | T1 |
| QA-04 | Text overflow and clipping detection per language. | Zero clipped glyphs across languages. | T1 |
| QA-05 | Dead-frame and flicker detection through frame differencing. | No unintended static or flickering stretches. | T2 |
| QA-06 | Audio checks: clipping, loudness, silence gaps, VO and music balance. | All within targets. | T1 |
| QA-07 | Visual regression with golden frames after code changes. | Diff above threshold fails the check and shows the diff image. | T2 |
| QA-08 | Availability and legal check: roadmap labels, no unlogged assets, no forbidden licenses. | Release blocked on failure. | T1 |
| QA-09 | Devanagari glyph test: conjunct stress strings per font. | All glyphs render; report saved. | T1 |

<span id="sec_65" class="anchor"></span>8.13 Personalization and product
integration (PER)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| PER-01 | Personalized sales video per restaurant: name, logo, brand color, menu highlights, language. | One command or form input renders a 30 s video. | T3 |
| PER-02 | Owner recap video ('Your month'): orders, revenue, best day, top dish from tenant analytics snapshots. | Data is snapshotted at build time; no network at render time. | T3 |
| PER-03 | Remotion Player embeds in the product for onboarding tours and tips. | Same composition renders in app and in export. | T3 |
| PER-04 | Menu-item promo generator: a dish photo and price become a short promo clip. | Template accepts any menu item with safe fallbacks for missing photos. | T3 |
| PER-05 | Festival templates (Diwali, Ganesh Chaturthi, Gudi Padwa and others) as theme variants. | Theme swap changes palette, motifs and music bed. | T3 |
| PER-06 | Digital signage templates for restaurants' own screens. | Loops seamlessly at 1920x1080 and 1080x1920. | T3 |

<span id="sec_66" class="anchor"></span>8.14 Live action and finishing
(LIV)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| LIV-01 | Footage ingest: proxies, color-space normalization, logging in the asset manifest. | Any clip can be dropped into a scene with one component. | T2 |
| LIV-02 | Screen replacement via tracking (OpenCV or Blender): product UI mapped into filmed devices. | Track holds through the shot; reflections preserved. | T2 |
| LIV-03 | Testimonial template: footage, lower-third, Whisper subtitles in the speaker's language. | Subtitles are word-accurate and reviewed. | T2 |
| LIV-04 | Generative plates (if used) pass through the same grade, grain and lens treatment as other footage. | No generated shot looks out of family. | T2 |
| LIV-05 | Final grade in DaVinci Resolve (free) for hero films. | Graded master matches approved style frames. | T2 |

<span id="sec_67" class="anchor"></span>8.15 Automation (AUT)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| AUT-01 | Playwright captures real app flows with seeded demo data at 60 fps, plus screenshots. | A capture command regenerates all reference footage. | T3 |
| AUT-02 | Release-note video: changelog entry plus fresh captures produce a short clip. | One command per release. | T3 |
| AUT-03 | A/B hook variants rendered from a list in the catalog. | Three or more variants per video in the batch manifest. | T3 |
| AUT-04 | Cue-sheet generator: given feature keys, a language model returns validated cue-sheet JSON. | Output passes the Cue Sheet schema or is rejected and retried. | T1 |


<!-- Section 16 Open Decisions (rows 4 voice, 9 sonic logo referenced by 8.8 AUD) -->

<span id="sec_86" class="anchor"></span>16. Open Decisions

| **\#** | **Decision** | **Options** | **Needed by** |
|----|----|----|----|
| 1 | Big idea for the hero film | A Soundbox, B Chaos to Calm, C One QR | Gate G1 |
| 2 | Final product name in assets | BharatQR (working name) or final brand | Before hero film |
| 3 | Who reviews Hindi and Marathi copy and audio | Native-speaking friend, colleague, or paid reviewer (Part B) | Phase 1 |
| 4 | Voice approach for hero film | Human volunteer with release, free cloud or open-source voice, or paid actor later | Phase 4 |
| 5 | Live-action footage | Shoot at a real cafe, use free stock, or illustrated plates only | Phase 8 |
| 6 | Whether to release before roadmap features ship | Vision film with 'coming soon', or wait | Phase 8 |
| 7 | Render machine | Local workstation or later cloud (Part B) | Phase 0 |
| 8 | Team size trigger for Remotion license | Stay at 3 or fewer, or budget the license | Ongoing |
| 9 | Sonic logo and 'ding' design approach | In-house with free DAW, or commissioned (Part B) | Phase 4 |

