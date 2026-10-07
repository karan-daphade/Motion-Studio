<span id="sec_37" class="anchor"></span>7. Technology Stack: Complete
Inventory

Every library, tool and service used by this project is listed here.
**All entries are free or open source at the time of writing.** Licenses
are given to the best of current knowledge and must be re-verified with
npm view \<package\> license (or the project's repository) before first
use; items marked **(verify)** have a specific uncertainty to resolve.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>Packages that need verification before use</strong></p>
<p>Onda (degueba/onda, ondajs) and its cursor primitive
(@ondajs/cursor): existence, name and license unconfirmed. Fallback is
to build the same primitives in-house (SpotlightCard, CountUp,
BlurReveal, Cursor, GrainOverlay).</p>
<p>remotion-dev/skills agent skill: confirm repository name and install
command.</p>
<p>@remotion/light-leaks, @remotion/fonts, @remotion/tailwind-v4,
@remotion/media: confirm current package names and APIs.</p>
<p>getAudioDurationInSeconds in @remotion/media-utils: confirm it is
still the recommended audio-duration API in the pinned Remotion
version.</p>
<p>troika-three-text and opentype.js: confirm Devanagari complex-script
shaping; fallback is DOM or canvas text rendered to a texture.</p>
<p>blender-mcp, RIFE, and any model weights: confirm license and current
maintenance.</p></td>
</tr>
</tbody>
</table>

<span id="sec_38" class="anchor"></span>7.1 Core video framework:
Remotion and first-party packages

All remotion and @remotion/\* packages must be pinned to the **same
exact version**.

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| remotion | Core: useCurrentFrame, spring, interpolate, Sequence, Series, AbsoluteFill, Audio, OffthreadVideo, Img, staticFile, random, delayRender | Remotion License: free for individuals and teams of up to 3 people (see section 15) |
| @remotion/cli | Studio, render, still, compositions, benchmark commands | Same |
| @remotion/renderer | Programmatic renderMedia, renderStill, selectComposition for render-all.ts | Same |
| @remotion/bundler | Bundles the project for programmatic rendering | Same |
| @remotion/studio | Preview, timeline, props editor, render queue | Same |
| @remotion/player | Embed compositions inside the product (onboarding tours, recap videos) | Same |
| @remotion/media-utils | Audio waveform data, visualizeAudio for beat-reactive visuals, media duration (verify API) | Same |
| @remotion/google-fonts | Type-safe loading of Inter, Outfit, Noto Sans Devanagari, Mukta, Hind and others | Same; fonts are SIL OFL |
| @remotion/fonts | Loading local font files with loadFont (verify) | Same |
| @remotion/transitions | TransitionSeries, fade, slide, wipe, flip and custom presentations between scenes | Same |
| @remotion/motion-blur | CameraMotionBlur and Trail for cinematic blur on fast moves | Same |
| @remotion/noise | Seeded 2D/3D/4D noise for handheld camera drift, organic motion, grain | Same |
| @remotion/shapes | Programmatic SVG shapes (rect, circle, star, pie, polygon) | Same |
| @remotion/paths | interpolatePath, evolvePath, getPointAtLength for morphs and line-draw reveals | Same |
| @remotion/layout-utils | measureText, fitText, fillTextBox: guarantees Devanagari text fits its box | Same |
| @remotion/captions | Caption data model, TikTok-style page creation, SRT parsing | Same |
| @remotion/install-whisper-cpp | Installs whisper.cpp locally and transcribes audio with word-level timestamps | Same; whisper.cpp is MIT |
| @remotion/lottie | Frame-driven Lottie animation playback | Same |
| @remotion/rive | Frame-driven Rive animation playback | Same |
| @remotion/light-leaks | Light-leak overlays for cinematic transitions (verify) | Same |
| @remotion/three | ThreeCanvas, video textures: bridge between Remotion and Three.js | Same |
| @remotion/skia | Skia (CanvasKit) canvas for advanced 2D and SkSL shaders | Same; CanvasKit is BSD-3 |
| @remotion/gif | GIF playback support | Same |
| @remotion/animation-utils | makeTransform, interpolateStyles helpers | Same |
| @remotion/zod-types | Zod types (zColor etc.) so props are editable in Studio | Same |
| @remotion/tailwind-v4 | Tailwind integration for cloned product components (verify name) | Same; Tailwind is MIT |
| @remotion/eslint-config-flat / eslint-plugin | Lint rules enforcing Remotion best practices | Same |
| Remotion Lambda / Cloud Run | Distributed cloud rendering. Not used now; see Part B | Remotion license plus cloud compute cost |

<span id="sec_39" class="anchor"></span>7.2 Motion and animation
utilities

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| Own token system (src/tokens/) | Springs, easing, timing, stagger, text-hold, safe zones as typed constants | In-house |
| Own engine primitives | SpotlightCard, CountUp, BlurReveal, Cursor (waypoint path), GrainOverlay, WordReveal, ParallaxLayer; replaces Onda if unverified | In-house |
| Onda (degueba/onda, ondajs) | Optional prebuilt primitives and cursor (verify) | Verify |
| GSAP | Complex timelines, driven by seeking a paused timeline from useCurrentFrame | Free (verify current license terms) |
| bezier-easing | Turns the cubic-bezier tokens into easing functions | MIT |
| d3-ease | Additional named easing curves | ISC |
| flubber | Smooth SVG shape morphing (QR to plate to bill transformations) | MIT |
| svg-path-properties | Path length and point measurement | MIT |
| culori | Perceptual color math (OKLCH) for harmonious gradients and brand-color swaps | MIT |
| simplex-noise, seedrandom (or alea) | Seeded noise and random streams beyond Remotion's random | MIT |
| lottie-web, @rive-app/canvas | Runtimes behind the Lottie and Rive Remotion packages | MIT |
| Kinetic type utilities (in-house) | Word-level splitting, mask reveals, path text. Never per-letter for Devanagari | In-house |

<span id="sec_40" class="anchor"></span>7.3 3D, shaders and physics

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| three | 3D engine: scenes, cameras, lights, materials | MIT |
| @react-three/fiber | React renderer for Three.js, used inside ThreeCanvas | MIT |
| @react-three/drei | Environment, Float, MeshTransmissionMaterial, RoundedBox, ContactShadows, useGLTF, Text3D, SoftShadows | MIT |
| @react-three/postprocessing, postprocessing | Bloom, depth of field, chromatic aberration, vignette, noise, tone mapping, SMAA, LUT3D grading | MIT / Zlib |
| three-stdlib | Loaders and utilities (GLTF, DRACO, KTX2) | MIT |
| @react-three/rapier + Rapier | 3D rigid-body physics (falling tickets, cards, coins). Precomputed per frame | MIT / Apache-2.0 |
| matter-js | 2D physics for UI-layer effects. Precomputed per frame | MIT |
| troika-three-text | SDF text in 3D scenes (test Devanagari shaping; verify) | MIT |
| harfbuzzjs | Complex-script text shaping if custom glyph work is needed | MIT |
| opentype.js | Glyph outlines for text-to-path and stroke effects (verify Devanagari) | MIT |
| @gltf-transform/core and CLI | Optimize GLB models: Draco or meshopt compression, texture resizing | MIT |
| gltfjsx | Convert GLB models into typed React components | MIT |
| Hand-written GLSL / SkSL | Custom shaders: liquid transitions, displacement, scan lines, procedural backgrounds | In-house |
| Blender plus bpy scripting | Photoreal hero shots (Cycles), modeling, tracking; scripted by the coding agent | GPL-3.0; renders are yours |
| blender-mcp | Lets the coding agent drive Blender (verify) | Verify |

<span id="sec_41" class="anchor"></span>7.4 2D graphics, imaging and QR

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| SVG, CSS 3D transforms | Native vector and 2.5D perspective for UI clones | Web standard |
| PixiJS (optional) | 2D WebGL particles and sprite effects | MIT |
| rough.js | Hand-drawn style strokes for annotations | MIT |
| perfect-freehand | Natural pen strokes, signatures, underline reveals | MIT |
| paper.js (optional) | Boolean path operations and path utilities | MIT |
| svgo | SVG optimization | MIT |
| sharp | Image resizing, compositing, format conversion in Node scripts | Apache-2.0 |
| qrcode, qrcode.react | Real QR generation using the same logic as the product, so on-screen QR codes actually scan | MIT / ISC |
| html-to-image or canvas text rendering (verify) | DOM or canvas to texture for Devanagari text on 3D surfaces | MIT |

<span id="sec_42" class="anchor"></span>7.5 Typography (all SIL Open
Font License)

| **Font** | **Script** | **Role** |
|----|----|----|
| Inter | Latin | UI and body text |
| Outfit | Latin | Headlines and display |
| JetBrains Mono | Latin | Numbers, code, KOT-style tickets |
| Noto Sans Devanagari | Devanagari (Hindi, Marathi) | Primary Devanagari UI and body |
| Mukta | Devanagari + Latin | Friendly headlines; pairs well with Inter |
| Hind | Devanagari + Latin | Clean UI text |
| Poppins | Devanagari + Latin | Geometric display, consistent across scripts |
| Baloo 2 | Devanagari + Latin | Warm, rounded tone for consumer-facing videos |
| Anek Devanagari | Devanagari + Latin | Modern variable family (confirm availability) |
| Yatra One, Tiro Devanagari (Hindi / Marathi), Noto Serif Devanagari | Devanagari | Festival and editorial accents |

**Devanagari rules:** line-height 1.4 or more; no added letter-spacing;
animate by **word** or line, never by character; test conjunct stress
strings; verify every glyph renders in the final font before approval.

<span id="sec_43" class="anchor"></span>7.6 Icons and symbols

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| lucide-react | Primary UI icon set | ISC |
| @phosphor-icons/react | Alternate weights and styles | MIT |
| @tabler/icons-react | Large set for specialized icons | MIT |
| heroicons | Supplemental UI icons | MIT |
| Iconify | Access to many icon sets (license differs per set; check each) | Per set |
| Simple Icons | Brand logos (trademark rules still apply; use only with permission or descriptively) | CC0 for the set; trademarks remain |

<span id="sec_44" class="anchor"></span>7.7 UI, data and Node tooling

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| React 19, TypeScript | Application and composition language (matches product stack) | MIT / Apache-2.0 |
| Tailwind CSS, Radix UI, shadcn/ui source | Styling and primitives for cloned product components | MIT |
| clsx, class-variance-authority | Variant handling in components | MIT / Apache-2.0 |
| zod | Catalog, props and cue-sheet validation; structured LLM output schemas | MIT |
| zod-to-json-schema | Export schemas for LLM structured output | ISC |
| d3 (d3-scale, d3-shape, d3-array) | Custom frame-driven charts for analytics scenes | ISC |
| date-fns, Intl.NumberFormat('en-IN') | Dates; Indian number grouping (lakh, crore) and rupee formatting | MIT / built in |
| @supabase/supabase-js | Build-time snapshots of real tenant data for recap videos (never at render time) | MIT |
| tsx, execa, commander, p-limit, chokidar, dotenv, pino | Script runner, process execution, CLI, concurrency, file watching, env, logging | MIT / BSD |
| vitest, eslint, prettier | Tests, linting, formatting | MIT |

<span id="sec_45" class="anchor"></span>7.8 Audio, speech and music

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| ffmpeg (bundled by Remotion; also installed separately) | Encoding, filters, loudnorm, lut3d, concat, audio mixing, proxy creation | LGPL / GPL depending on build; running the binary is free |
| ffmpeg-normalize, pyloudnorm | Automated loudness normalization and LUFS measurement | MIT |
| SoX | Procedural SFX generation and effect chains (verify availability) | GPL |
| pedalboard (Spotify) | Mastering chain: EQ, compressor, limiter, reverb. Run locally only; do not embed in a distributed product | GPL-3.0 |
| librosa | Beat tracking, onset detection, spectral analysis for beat-synced edits | ISC |
| Demucs | Stem separation (isolate stems for ducking and re-mixing) | MIT |
| pydub | Slicing and simple audio edits in scripts | MIT |
| whisper.cpp, OpenAI Whisper, faster-whisper | Speech to text with word timestamps (Hindi, Marathi, English); drives caption and animation sync | MIT |
| Tone.js (offline rendering) | Procedural UI sound design (tones, envelopes) rendered to files | MIT |
| Audacity, Ardour | Free DAWs for listening, editing, voice recording | GPL |
| LMMS, GarageBand (macOS), Cakewalk by BandLab (Windows) (verify) | Free music composition tools for a custom score and sonic logo | Free |
| AI4Bharat Indic Parler-TTS | Open-source Hindi and Marathi speech synthesis (needs a GPU; verify model card and supported languages) | Apache-2.0 |
| Google Cloud TTS, Azure Speech (free tiers) | Cloud voices for Hindi and Marathi within free monthly quotas (verify current quota and terms) | Free tier, usage-based beyond |
| Human voice recording (free route) | Owner or a volunteer native speaker recorded in Audacity with a **signed voice release** | Free |
| Edge-TTS (unofficial) | Scratch tracks only. Terms are unclear; never ship in a public video | Do not ship |
| ElevenLabs free plan | Preview only. Free plan has no commercial license and requires attribution; paid use is in Part B | Do not ship |

Free music and SFX sources

| **Source** | **Content** | **Licensing note** |
|----|----|----|
| Pixabay Music and SFX | Tracks and sound effects | Pixabay license; log each file |
| Uppbeat (free tier) | Tracks | Free tier requires attribution; read terms |
| Free Music Archive, Incompetech | Tracks | Per-track license; CC-BY needs attribution |
| YouTube Audio Library | Tracks and SFX | Terms are platform-oriented; verify for ads on other platforms |
| Freesound | SFX and foley | Filter for CC0; log CC-BY attributions |
| Mixkit | SFX and tracks | Mixkit license; log each file |
| Sonniss GameAudioGDC bundles | Large SFX libraries | Royalty-free; read the license before use |

<span id="sec_46" class="anchor"></span>7.9 AI and machine-learning
tools (local, free)

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| Whisper (see 7.8) | Transcription, word timings, caption source | MIT |
| Depth Anything V2 **Small** only | Depth maps for 2.5D parallax from photographs. Larger variants are non-commercial: do not use | Apache-2.0 (Small) |
| SAM 2 (Segment Anything) | Cut out people and objects from footage and photos | Apache-2.0 |
| rembg (U2-Net models) | One-click background removal | MIT / Apache-2.0 |
| Real-ESRGAN | Upscaling of textures and low-res stock | BSD-3 |
| RIFE (verify license) | Frame interpolation for smooth slow motion | Verify |
| OpenCV | Planar tracking for screen replacement, frame analysis, QA scripts | Apache-2.0 |
| pixelmatch, imagehash, Pillow, NumPy | Frame diff, visual regression, determinism hashes, safe-zone and contrast checks | ISC / BSD / HPND |
| ComfyUI with FLUX.1 \[schnell\] or SDXL (verify model licenses) | Local image generation for textures and backgrounds; never the main visual | GPL-3.0 (ComfyUI); model licenses vary |
| Claude Code, Google Antigravity | Coding agents and vision critique (existing plans) | Existing subscriptions; API usage billed separately (see Part B) |
| Ollama with an open-weight vision model (verify license) | Free local alternative for visual critique | Varies by model |

<span id="sec_47" class="anchor"></span>7.10 Media production and
finishing tools

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| Blender | 3D modeling, Cycles rendering, camera tracking, simulation | GPL-3.0 |
| DaVinci Resolve (Free edition) | Conform, grade, deliver. Free edition limits resolution to UHD and omits some AI features | Free (proprietary) |
| Figma (free tier) | Style frames, token reference, layout comps | Free tier |
| Inkscape, GIMP, Krita | Vector assets, textures, painted elements | GPL |
| ImageMagick | Batch image processing for textures and grain plates | Apache-style |
| HandBrake (optional) | Alternative encodes | GPL |
| OBS Studio (fallback) | Screen capture if Playwright capture is not suitable | GPL |
| MediaInfo | Inspect codecs, frame rates, color metadata | BSD |
| Poly Haven, ambientCG | HDRI maps, PBR textures, models | CC0 |
| Free .cube LUT packs or self-made LUTs | Color grading looks (verify each pack's license) | Varies |

<span id="sec_48" class="anchor"></span>7.11 Development, QA and
operations

| **Package / tool** | **Purpose in this project** | **License / cost** |
|----|----|----|
| Node.js 24 LTS, npm or pnpm | Runtime and package management | MIT |
| Git, GitHub (private repository) | Version control, history, releases | Free |
| Playwright | Scripted capture of real app flows (screenshots, 60 fps video, traces) with deterministic seed data | Apache-2.0 |
| Storybook | Review each UI clone and motion primitive in isolation | MIT |
| Remotion Studio | Live preview, timeline scrubbing, props editor | Remotion license |
| GitHub Actions (free tier, verify minutes) | Lint, typecheck and unit tests on push (renders stay local) | Free tier |
| Docker (optional) | Reproducible render environment | Free for small businesses (verify terms) |
| Context7 and docs-lookup MCP (verify) | Gives agents current library documentation | Verify |
| Playwright MCP, GitHub MCP, Supabase MCP, filesystem MCP | Agent access to browser, repository, database and files | Open source |
| Figma Dev Mode MCP | Design-to-code access; likely requires a paid Figma seat (verify). Listed in Part B | Paid (verify) |

<span id="sec_49" class="anchor"></span>7.12 Asset sources and licensing
rules

| **Source** | **Content** | **License** | **Rule** |
|----|----|----|----|
| Poly Haven, ambientCG, Quaternius, Kenney | HDRIs, textures, 3D models | CC0 | Preferred sources |
| Sketchfab, Poly Pizza | 3D models (phones, devices, props) | Per model | Use only CC0 or CC-BY and log attribution |
| Pexels, Pixabay, Unsplash | Photos and stock video | Own licenses | Check for identifiable people, logos and brands |
| Freesound, Mixkit, Pixabay | SFX and music | Mixed | Filter for commercial use; log each file |
| LottieFiles, Iconify | Animations and icons | Per asset or set | Log license; avoid unclear items |
| Google Fonts | Typefaces | SIL OFL | Free for commercial use |

**Rule:** no asset enters the repository without a row in
assets-manifest.json (source URL, author, license, date, attribution
text). Recognizable people need a signed release. No copyrighted music,
no third-party brand sounds or logos.

<span id="sec_50" class="anchor"></span>7.13 Agent skills and MCP
servers

Skills are folders containing a SKILL.md (and optional scripts) that
teach a coding agent how to do one kind of work reliably. This project
uses a small set of existing skills plus a library of custom ones, kept
in skills/ and listed in CLAUDE.md.

Existing or external skills

| **Skill** | **Purpose** | **Source / status** |
|----|----|----|
| Remotion best-practices skill (remotion-dev/skills) | Official rules for deterministic Remotion code: animations, audio, captions, transitions, 3D, fonts | Open source (verify repository and install command) |
| frontend-design | Distinctive visual design guidance: typography, aesthetic direction, avoiding templated looks | Anthropic public skill |
| skill-creator | Create, test and improve the custom skills below | Anthropic example skill |
| docx, pdf, pptx, xlsx | Produce supporting documents: PRD exports, pitch decks, budget sheets, release PDFs | Anthropic public skills |

Custom skills to author (16)

| **Skill folder** | **What it teaches the agent** |
|----|----|
| motion-identity | Use tokens only; spring tiers by object weight; easing, stagger and text-hold rules; forbidden defaults |
| scene-templates | Compose Hook, Problem, Reveal, FeatureDemo, Proof, Montage, CTA and LogoSting scenes with a typed input contract |
| ui-component-cloning | Turn real product components into pure, prop-driven clones with no data fetching or side effects |
| devanagari-typography | Font stack, line-height, no per-character animation, fitText, conjunct stress strings, glyph verification |
| localization-hi-mr | Transcreation rules, Hinglish policy, tone, lakh and crore formatting, native review lock |
| storyboard-cuesheet | Stage 1 prompt, cue-sheet JSON schema, words-to-duration rules, hook variants |
| camera-rig-3d | R3F with Remotion setup, lighting and HDRI presets, post-processing stacks, physics precompute |
| blender-bpy-pipeline | Scripted Blender scenes, Cycles settings, export conventions to GLB or image sequences |
| sound-design | Sonic palette, key and tempo, SFX naming, mix ratios, ducking, loudness targets |
| captions-whisper | Transcription, word timings, TikTok-style captions, Devanagari line breaking |
| visual-qa | Render key stills, rubric JSON output, regression diffs, safe-zone overlays, fix loop |
| render-ops | Render flags, supersampling, ProRes and H.264 profiles, WhatsApp encode, troubleshooting |
| license-register | Log dependencies and assets, forbidden-license list, pre-release audit |
| playwright-capture | Deterministic app capture with seeded data, cursor path recording, 60 fps output |
| release-notes-video | Turn a changelog and fresh captures into a release clip |
| tenant-personalization | Validate tenant props, snapshot assets, safe fallbacks, per-tenant rendering |

<span id="sec_51" class="anchor"></span>7.14 Verification protocol and
forbidden list

Before adding any dependency

1.  Run npm view \<package\> license version time.modified and read the
    repository's license file.

2.  Check peer dependencies against the pinned React and Remotion
    versions.

3.  Pin the exact version and commit the lockfile.

4.  Add a row to LICENSES.md.

5.  If the package touches rendering, run the determinism check (render
    twice, compare frame hashes).

Do not use

| **Item** | **Reason** |
|----|----|
| framer-motion / motion, react-spring, CSS animations and transitions | Time-based or non-frame-driven: breaks deterministic rendering |
| Math.random(), Date.now(), unseeded randomness | Breaks determinism |
| LYGIA shader library | License may restrict commercial use; verify before any use |
| Coqui XTTS-v2 | Non-commercial model license |
| Meta MMS-TTS models | Non-commercial (CC-BY-NC) license |
| Depth Anything V2 Base, Large, Giant | Non-commercial license; use Small only |
| madmom beat models, Essentia | Non-commercial model license / AGPL: verify; prefer librosa |
| ElevenLabs free-plan output, Edge-TTS output | No commercial rights or unclear terms |
| Copyrighted music, film sounds, brand sounds (including payment-soundbox jingles) and logos | Copyright and trademark risk |
| Assets without a logged license | Fails the provenance rule |

