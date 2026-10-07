<span id="sec_30" class="anchor"></span>6. System Architecture

<span id="sec_31" class="anchor"></span>6.1 Architectural principles

- **Deterministic by construction.** A frame is a pure function of its
  frame number and props. Re-rendering never changes pixels or audio
  timing.

- **Data-driven.** Copy, numbers, colors, assets and timing come from
  the catalog, tokens and cue sheets; scenes contain layout and
  choreography only.

- **Token-driven motion.** No raw spring or easing values inside scenes.
  Every motion value comes from src/tokens/.

- **Separation of concerns.** Components (what it looks like), scenes
  (how it is staged), compositions (what the finished video is), engine
  (reusable machinery), scripts (everything outside Remotion).

- **Agent-operable.** Every task has a written skill, typed inputs and a
  verifiable output so a coding agent can run it without guessing.

- **Hybrid where it counts.** Remotion for UI, type and assembly;
  Blender for photoreal hero 3D; DaVinci Resolve (free) for final grade
  when needed.

<span id="sec_32" class="anchor"></span>6.2 Determinism rules
(non-negotiable)

| **Rule** | **Detail** |
|----|----|
| No wall-clock or true randomness | Never use Math.random(), Date.now() or new Date() for visuals. Use Remotion's seeded random(seed) or a seeded RNG. |
| Frame-driven only | All motion derives from useCurrentFrame() via spring(), interpolate() or seeked timelines. No CSS animations, CSS transitions, setTimeout, requestAnimationFrame loops. |
| Stable state | No unseeded useState that changes over time; derived values only. |
| Async safety | Fonts, images, models and data must be awaited with delayRender() / continueRender() or the Remotion loaders before the frame is captured. |
| No render-time network | Data is snapshotted to JSON beforehand. Renders must work offline. |
| Physics precomputed | Rapier and Matter.js simulations are stepped per frame from a fixed seed and cached, never run in real time. |
| Media components | Use \<Img\>, \<Audio\>, \<OffthreadVideo\> and staticFile() for assets. |
| Pinned versions | All remotion and @remotion/\* packages share one exact version. Lockfile committed. |

<span id="sec_33" class="anchor"></span>6.3 Repository structure

> motion-studio/
>
> â”œâ”€â”€ CLAUDE.md \# agent entry rules: read docs first, stay in scope
>
> â”œâ”€â”€ docs/
>
> â”‚ â”œâ”€â”€ PRD.md \# this document (source of truth)
>
> â”‚ â”œâ”€â”€ remotion-guidelines.md \# non-negotiable quality rules (Appendix
> A)
>
> â”‚ â”œâ”€â”€ motion-identity.md \# tokens, camera, sound palette
>
> â”‚ â”œâ”€â”€ references/ \# reference-study briefs
>
> â”‚ â”œâ”€â”€ style-frames/ \# approved stills
>
> â”‚ â””â”€â”€ decisions/ \# decision log (ADR-style)
>
> â”œâ”€â”€ skills/ \# custom agent skills (see 7.13)
>
> â”œâ”€â”€ frontend/ \# the SaaS app (separate; components cloned from here)
>
> â””â”€â”€ remotion-video/
>
> â”œâ”€â”€ public/
>
> â”‚ â”œâ”€â”€ voiceovers/{en,hi,mr}/ \# narration audio
>
> â”‚ â”œâ”€â”€ music/ sfx/ \# licensed or free-licensed audio
>
> â”‚ â”œâ”€â”€ models/ hdri/ \# GLB models, HDR environment maps
>
> â”‚ â”œâ”€â”€ luts/ textures/ \# .cube LUTs, grain, light-leak plates
>
> â”‚ â”œâ”€â”€ footage/ lottie/ \# live-action plates, Lottie/Rive files
>
> â”‚ â””â”€â”€ brand/ \# logo SVG, sonic logo, fonts (if local)
>
> â”œâ”€â”€ src/
>
> â”‚ â”œâ”€â”€ catalog/ \# schema.ts, product.json, features.json, tenants/
>
> â”‚ â”œâ”€â”€ tokens/ \# springs, easing, timing, colors, type, safe zones
>
> â”‚ â”œâ”€â”€ engine/ \# primitives, camera rig, 3D, shaders, audio, captions
>
> â”‚ â”œâ”€â”€ components/ \# ui-clones/, devices/, charts/, shared/
>
> â”‚ â”œâ”€â”€ scenes/ \# Hook, Problem, Reveal, Demo, Proof, CTA
>
> â”‚ â”œâ”€â”€ compositions/ \# HeroFilm, FeatureReel, Bumper, HowTo,
> TenantPitch,
>
> â”‚ â”‚ \# OwnerRecap, ReleaseNotes, SignageLoop
>
> â”‚ â”œâ”€â”€ Root.tsx \# composition registry + calculateMetadata
>
> â”‚ â”œâ”€â”€ index.ts
>
> â”‚ â””â”€â”€ render-all.ts \# batch renderer (languages x formats x variants)
>
> â”œâ”€â”€ scripts/ \# whisper, audio-master, qa, capture, manifest, grade
>
> â”œâ”€â”€ blender/ \# .blend sources, bpy scripts, exports
>
> â”œâ”€â”€ qa/ \# reports, golden frames, rubric results
>
> â”œâ”€â”€ out/ \# renders (gitignored)
>
> â”œâ”€â”€ remotion.config.ts package.json tsconfig.json LICENSES.md
> assets-manifest.json

<span id="sec_34" class="anchor"></span>6.4 Production pipeline

| **Stage** | **Name** | **Input** | **Output** | **Gate** |
|----|----|----|----|----|
| 0 | Concept | Brief, references | Big idea, motion language brief | Owner approval |
| 1 | Style frames | Concept | 5-8 approved stills | Owner approval |
| 2 | Catalog and copy | Feature selection | Locked EN / HI / MR copy | Native review |
| 3 | Voice and captions | Locked copy | VO audio plus Whisper word timings | Listening check |
| 4 | Cue sheet | Copy, timings | Frame-accurate cue sheet JSON | Schema validation |
| 5 | Assembly | Cue sheet, tokens, guidelines | Composition code | Typecheck, lint, Studio preview |
| 6 | Critique loop | Rendered stills | Rubric scores, fix list | Score threshold |
| 7 | Sound | Visual lock | Mixed audio, ducking, SFX placed | Loudness analysis |
| 8 | Render | Locked composition | Supersampled master (ProRes) and encodes | Frame-hash determinism check |
| 9 | Finish | Master | Grade, grain, delivery encodes, WhatsApp cut | Visual spot check |
| 10 | QA and package | Deliverables | Manifest, license check, QA report | All checks green |

<span id="sec_35" class="anchor"></span>6.5 Environment and hardware

- **OS:** Windows, macOS or Linux. Node.js 24 LTS (aligned with the
  product stack), npm or pnpm.

- **Memory and storage:** 16 GB RAM minimum, 32 GB recommended; SSD with
  100 GB or more free (renders, caches, ProRes masters).

- **GPU:** a discrete GPU with 6 GB+ VRAM is recommended for WebGL-heavy
  scenes. CPU-only works but renders slowly.

- **Browser:** Remotion downloads and manages headless Chromium. GPU
  flags (--gl=angle, or --gl=vulkan / --gl=egl on Linux) are tuned per
  machine.

- **Parallelism:** tune --concurrency to balance CPU and memory; WebGL
  scenes usually need fewer parallel tabs.

- **Secrets:** .env files are gitignored; no keys in code, props or
  logs. Version 1 needs no paid API keys.

<span id="sec_36" class="anchor"></span>6.6 Versioning, caching and
provenance

- Git with tagged releases per video; each tag stores the composition
  ID, props hash and tool versions.

- assets-manifest.json records source, author, license, URL, date and
  attribution text for every asset; LICENSES.md records every
  dependency.

- Render cache for precomputed physics, Whisper output, depth maps and
  cutouts, keyed by input hash.

- A render manifest (JSON) is emitted per batch: composition, language,
  format, props, durations, loudness, checksums.

