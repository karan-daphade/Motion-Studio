<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>PRODUCT REQUIREMENTS DOCUMENT</strong></p>
<p><strong>Motion Studio</strong></p>
<p>A programmatic, agency-grade motion-video engine for a SaaS product,
built with Remotion and AI coding agents</p>
<p>Remotion | React + TypeScript | Three.js + Blender | Whisper | Claude
Code + Antigravity</p></td>
</tr>
</tbody>
</table>

|  |  |
|----|----|
| **Product promoted** | BharatQR (working name), a multi-tenant restaurant and hotel POS platform |
| **Document version** | 1.0 (initial full PRD) |
| **Date** | 5 October 2026 |
| **Owner** | Karan Datta Daphade |
| **Status** | Draft for owner approval |
| **Languages in scope** | English, Hindi, Marathi |
| **Quality target** | Agency-grade output equivalent to a \$10,000 to \$20,000 (10 to 20 lakh rupees) production, and not generic AI-looking video |
| **Software cost today** | Zero. Part A uses only free and open-source tools |
| **Paid roadmap** | Part B (final section) lists every paid upgrade to consider when a budget becomes available |

**Document Control**

------------------------------------------------------------------------

| **Version** | **Date** | **Change** | **Author** |
|----|----|----|----|
| 1.0 | 5 October 2026 | Initial full PRD: vision, creative strategy, architecture, complete free tech stack, requirements, hero film spec, roadmap, risks, licensing, Part B paid upgrades | Karan Datta Daphade with Claude |

**How to read this document**

| **Part** | **Contents** | **Audience** |
|----|----|----|
| Part A: Product Requirements (Sections 1-16, Appendices A-F) | Everything needed to build the studio with a free stack: vision, goals, creative direction, catalog, architecture, library inventory, skills, functional requirements, quality rubric, hero film, agent prompts, roadmap, risks, licensing | Owner and every coding agent |
| Part B: Future Paid Upgrades | Prioritized shopping list for when budget arrives, with the free tool each upgrade replaces and triggers for buying | Owner (budget planning) |

**Conventions**

| **Marker** | **Meaning** |
|----|----|
| (verify) | A package name, API, license or price that must be confirmed at the source before use |
| code style | File names, package names, commands, or schema keys |
| FR IDs (e.g. CAT-01) | Functional requirement identifiers used for traceability in tasks and QA |
| Tier T0 to T3 | Build dependency order, not priority of importance |

***Source note.** This PRD extends the owner's summary document
(architecture, stack, catalog, audio pipeline, polish techniques,
two-stage prompting, batch execution). It adds creative strategy, a full
dependency inventory, agent skills, a quality rubric, a hero film plan,
governance and a paid-upgrade roadmap.*

**Contents**

------------------------------------------------------------------------

[**1. Executive Summary**](#sec_1)

> [1.1 Vision](#sec_2)
>
> [1.2 The product being promoted](#sec_3)
>
> [1.3 Problem statement](#sec_4)
>
> [1.4 Solution overview](#sec_5)
>
> [1.5 Operating assumptions](#sec_6)

[**2. Goals, Non-Goals and Success Metrics**](#sec_7)

> [2.1 Goals](#sec_8)
>
> [2.2 Non-goals](#sec_9)
>
> [2.3 Success metrics](#sec_10)

[**3. Users, Audiences and Use Cases**](#sec_11)

> [3.1 Internal users](#sec_12)
>
> [3.2 Audiences who watch the videos](#sec_13)
>
> [3.3 Distribution channels](#sec_14)
>
> [3.4 Use cases](#sec_15)

[**4. Creative Strategy and Art Direction**](#sec_16)

> [4.1 The big idea](#sec_17)
>
> [4.2 Visual identity and look](#sec_18)
>
> [4.3 Motion identity: the token system](#sec_19)
>
> [4.4 Anti-generic rules: avoiding the 'AI video' look](#sec_20)
>
> [4.5 Storytelling frameworks](#sec_21)
>
> [4.6 Reference study protocol](#sec_22)
>
> [4.7 Style-frame process](#sec_23)

[**5. Product Catalog and Content Model (the Brain)**](#sec_24)

> [5.1 Principles](#sec_25)
>
> [5.2 Schema (Zod)](#sec_26)
>
> [5.3 Seed feature list (from the product roadmap)](#sec_27)
>
> [5.4 Localization workflow](#sec_28)
>
> [5.5 Personalization schema (tenant videos)](#sec_29)

[**6. System Architecture**](#sec_30)

> [6.1 Architectural principles](#sec_31)
>
> [6.2 Determinism rules (non-negotiable)](#sec_32)
>
> [6.3 Repository structure](#sec_33)
>
> [6.4 Production pipeline](#sec_34)
>
> [6.5 Environment and hardware](#sec_35)
>
> [6.6 Versioning, caching and provenance](#sec_36)

[**7. Technology Stack: Complete Inventory**](#sec_37)

> [7.1 Core video framework: Remotion and first-party packages](#sec_38)
>
> [7.2 Motion and animation utilities](#sec_39)
>
> [7.3 3D, shaders and physics](#sec_40)
>
> [7.4 2D graphics, imaging and QR](#sec_41)
>
> [7.5 Typography (all SIL Open Font License)](#sec_42)
>
> [7.6 Icons and symbols](#sec_43)
>
> [7.7 UI, data and Node tooling](#sec_44)
>
> [7.8 Audio, speech and music](#sec_45)
>
> [7.9 AI and machine-learning tools (local, free)](#sec_46)
>
> [7.10 Media production and finishing tools](#sec_47)
>
> [7.11 Development, QA and operations](#sec_48)
>
> [7.12 Asset sources and licensing rules](#sec_49)
>
> [7.13 Agent skills and MCP servers](#sec_50)
>
> [7.14 Verification protocol and forbidden list](#sec_51)

[**8. Functional Requirements**](#sec_52)

> [8.1 Catalog and content (CAT)](#sec_53)
>
> [8.2 Design system and tokens (DS)](#sec_54)
>
> [8.3 Component library (UI)](#sec_55)
>
> [8.4 Scene engine (SCN)](#sec_56)
>
> [8.5 Cinematography (CAM)](#sec_57)
>
> [8.6 3D and hybrid Blender (3D)](#sec_58)
>
> [8.7 Typography and localization (LOC)](#sec_59)
>
> [8.8 Audio (AUD)](#sec_60)
>
> [8.9 Captions (CAP)](#sec_61)
>
> [8.10 Compositions and formats (FMT)](#sec_62)
>
> [8.11 Render and export (REN)](#sec_63)
>
> [8.12 Automated QA (QA)](#sec_64)
>
> [8.13 Personalization and product integration (PER)](#sec_65)
>
> [8.14 Live action and finishing (LIV)](#sec_66)
>
> [8.15 Automation (AUT)](#sec_67)

[**9. Non-Functional Requirements**](#sec_68)

[**10. Quality Standard: The Agency-Grade Rubric**](#sec_69)

> [10.1 Scorecard](#sec_70)
>
> [10.2 Hard-fail conditions](#sec_71)
>
> [10.3 Review gates](#sec_72)

[**11. Hero Film Specification: 'The Soundbox' (Draft)**](#sec_73)

> [11.1 Beat sheet](#sec_74)
>
> [11.2 Hero film production checklist](#sec_75)

[**12. AI Agent Operating Model**](#sec_76)

> [12.1 Roles](#sec_77)
>
> [12.2 Staged prompting framework](#sec_78)
>
> [12.3 Governance](#sec_79)

[**13. Build Roadmap (Dependency Order)**](#sec_80)

[**14. Risks and Mitigations**](#sec_81)

[**15. Licensing and Compliance Register**](#sec_82)

> [15.1 Remotion](#sec_83)
>
> [15.2 License families in this project](#sec_84)
>
> [15.3 Compliance practices](#sec_85)

[**16. Open Decisions**](#sec_86)

[**Appendix A: \`remotion-guidelines.md\` (Draft Contents)**](#sec_87)

[**Appendix B: Cue-Sheet Example and Batch Commands**](#sec_88)

> [B.1 Cue-sheet JSON (excerpt)](#sec_89)
>
> [B.2 Duration from audio](#sec_90)
>
> [B.3 Batch rendering (example)](#sec_91)

[**Appendix C: Pre-Release QA Checklist**](#sec_92)

[**Appendix D: Devanagari Stress Strings**](#sec_93)

[**Appendix E: Learning and Reference Resources**](#sec_94)

[**Appendix F: Glossary**](#sec_95)

[**Part B: Future Paid Upgrades (Budget Roadmap)**](#sec_96)

> [B1. How to use this section](#sec_97)
>
> [B2. Where the free stack falls short](#sec_98)
>
> [B3. Tier A: Human craft (highest impact per rupee)](#sec_99)
>
> [B4. Tier B: Tools and services that raise craft](#sec_100)
>
> [B5. Tier C: Scale and infrastructure](#sec_101)
>
> [B6. Tier D: Growth, legal and distribution](#sec_102)
>
> [B7. Suggested purchase sequence](#sec_103)
>
> [B8. Trigger checklist: when to start spending](#sec_104)
>
> [B9. Budget log (fill in as you buy)](#sec_105)

<span id="sec_1" class="anchor"></span>1. Executive Summary

<span id="sec_2" class="anchor"></span>1.1 Vision

Build a **programmatic motion-video studio** that turns a structured
description of a SaaS product into broadcast-grade, agency-quality
video, with no timeline editor in the loop. Every pixel is rendered from
React and TypeScript by **Remotion**, every motion value comes from a
shared design-token system, and the whole production is orchestrated by
AI coding agents (Claude Code and Google Antigravity) working from
written rules, not improvisation.

The target is output that a viewer cannot distinguish from a **\$10,000
to \$20,000 (roughly 10 to 20 lakh rupees) commissioned motion-design
production**. It must not look like a templated or AI-generated video.
Craft, restraint, sound and finishing are first-class requirements,
equal in weight to the code.

<span id="sec_3" class="anchor"></span>1.2 The product being promoted

The first customer of this studio is **BharatQR** (working name; earlier
drafts used the placeholder CloudPOS): a multi-tenant, web-based
restaurant and hotel POS and live-operations platform with QR-based
table and room ordering, a 7-step branch onboarding wizard, table and
session management, kitchen display, billing, GST-aware tax rules, and
multi-outlet analytics. The audience is restaurant and cafe owners in
India, communicating in **English, Hindi and Marathi**.

<span id="sec_4" class="anchor"></span>1.3 Problem statement

- Agency-quality motion videos cost lakhs of rupees per piece and take
  weeks, so a SaaS with 50+ features cannot afford one per feature or
  one per language.

- Template tools and AI video generators are fast but produce generic
  output: default gradients, identical easing, stock voices, no sound
  design, no art direction.

- Hindi and Marathi motion graphics are rarely done well. Devanagari
  conjuncts break under naive per-letter animation, and fonts,
  line-height and tone are usually an afterthought.

- A feature that ships on Monday needs a launch video on Tuesday. Manual
  editing cannot keep pace with a product built with coding agents.

<span id="sec_5" class="anchor"></span>1.4 Solution overview

A **data-driven, token-driven, agent-operated** pipeline:

1.  **Catalog (the Brain):** product.json and features.json describe the
    brand, every feature, mock data and localized copy in three
    languages. No text is hardcoded in scenes.

2.  **Creative layer:** a written big idea, motion identity, style
    frames, storyboards and cue sheets produced before any code.

3.  **Component and scene engine:** prop-driven clones of the real
    product UI, reusable scene templates, a virtual camera rig and a 3D
    layer, all frame-deterministic.

4.  **Audio pipeline:** voiceover, Whisper word timestamps, music,
    designed sound effects, ducking and loudness mastering.

5.  **Render and finishing:** supersampled renders, ProRes masters, LUT
    grading, multi-format and multi-language batch export.

6.  **Automated quality control:** a render, critique, fix loop where a
    vision model reviews still frames against a rubric, plus
    deterministic checks for safe zones, contrast, loudness and
    typography.

7.  **Extensions:** per-restaurant personalized videos, monthly owner
    recap videos, festival templates, in-app tours through the Remotion
    Player, and release-note videos generated from the live app.

<span id="sec_6" class="anchor"></span>1.5 Operating assumptions

|  |  |
|----|----|
| **Budget** | **Zero software spend.** The entire stack in Part A is free or open source. Paid improvements are catalogued separately in Part B (final section of this document). |
| **Team** | One owner-operator working with AI coding agents (Claude Code, Antigravity). Remotion's free license applies while the project involves three people or fewer. |
| **Time and skill** | Treated as non-constraints. The agent builds everything; the roadmap is ordered by dependency, not by an MVP cut-line. |
| **Quality bar** | Agency-grade (see section 10 rubric). Where a free tool cannot meet the bar, the gap is recorded in Part B rather than quietly lowered. |
| **Source of truth** | This PRD, remotion-guidelines.md, and the catalog JSON files. Agents must read them before writing code. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>Honest scope note</strong></p>
<p>A long feature list does not by itself create a premium look. Studio
work is often simpler than template work: fewer elements, more negative
space, stronger ideas. Every advanced technique in this PRD is a tool to
be used selectively, governed by the quality rubric in section 10 and
the anti-generic rules in section 4.4.</p></td>
</tr>
</tbody>
</table>

<span id="sec_7" class="anchor"></span>2. Goals, Non-Goals and Success
Metrics

<span id="sec_8" class="anchor"></span>2.1 Goals

| **ID** | **Goal** | **Why it matters** |
|----|----|----|
| G1 | Produce hero films and feature videos that score 85 or more out of 100 on the section 10 quality rubric. | Defines 'agency-grade' in measurable terms. |
| G2 | Generate one video per feature in English, Hindi and Marathi from a single catalog entry. | Scales marketing to 50+ features without 50+ manual edits. |
| G3 | Guarantee deterministic, reproducible renders (same inputs give the same pixels and audio). | Enables safe iteration, diffing and automated QA. |
| G4 | Deliver authentic Devanagari typography and natural Hindi and Marathi audio. | Core differentiator for the Indian restaurant market. |
| G5 | Create a reusable motion identity (tokens, camera, sound palette) so every video looks like one brand. | Consistency is what separates a studio from a template. |
| G6 | Export every needed format: 9:16, 4:5, 1:1, 16:9, bumpers, WhatsApp-compressed, signage loops, masters. | One source, all channels. |
| G7 | Automate QA so defects are caught before a human looks. | Frees attention for creative judgment. |
| G8 | Use only free and open-source components, with a license register proving compliance. | Zero budget today; no legal surprises later. |
| G9 | Extend the engine into product features: personalized sales videos, owner recap videos, in-app tours. | Turns a marketing tool into a product advantage. |

<span id="sec_9" class="anchor"></span>2.2 Non-goals

- Replacing human creative judgment. Agents execute; the owner approves
  concept, style frames and final cuts.

- Building a general-purpose video editor or a template marketplace.

- Generating photoreal people, products or full scenes with generative
  AI as the main visual. Generative tools, if used, supply background
  texture only.

- Live streaming, long-form video (over 3 minutes) or interactive video
  in version 1.

- Real-time rendering. All output is rendered offline, frame by frame.

<span id="sec_10" class="anchor"></span>2.3 Success metrics

| **Metric** | **Target** | **How measured** |
|----|----|----|
| Quality rubric score (hero film) | 85 or more / 100 | Section 10 scorecard, reviewed by owner plus vision-model critique |
| Quality rubric score (feature videos) | 80 or more / 100 | Same scorecard, automated first pass |
| Render determinism | 100%: identical frame hashes on re-render | Hash of sampled frames across two runs |
| Localization parity | EN, HI, MR versions of every video ship together | Batch manifest completeness check |
| Devanagari defects at release | 0 broken conjuncts, 0 clipped glyphs | Still-frame review plus automated overflow checks |
| Loudness compliance | -14 LUFS integrated (social), true peak at or below -1 dBTP | ffmpeg loudnorm analysis |
| Safe-zone violations | 0 on 9:16 outputs | Automated overlay test on key frames |
| Open-source compliance | 100% of dependencies and assets listed in the license register | Manifest audit before each release |
| Marketing outcomes (baseline TBD) | Hook hold rate, average watch time, demo requests per video | Platform analytics, tracked per variant |

<span id="sec_11" class="anchor"></span>3. Users, Audiences and Use
Cases

<span id="sec_12" class="anchor"></span>3.1 Internal users

| **Role** | **Description** | **Needs from the studio** |
|----|----|----|
| Owner / Producer | Founder and sole operator. Approves creative direction and final cuts. | Fast iteration, clear review gates, one command to render everything. |
| Coding agents | Claude Code, Google Antigravity. Execute assembly, tests, renders. | Unambiguous written rules, typed props, deterministic APIs, a QA loop that tells them what is wrong. |
| Reviewer agents | Vision-model critics, localization reviewers, sound checkers. | Rubrics, reference frames, structured JSON output. |

<span id="sec_13" class="anchor"></span>3.2 Audiences who watch the
videos

| **Audience** | **Context** | **Implication for the videos** |
|----|----|----|
| Restaurant and cafe owners (primary) | Small to mid-size independent outlets in India. Mobile-first, WhatsApp-heavy, often Marathi or Hindi speaking, skeptical of software. | Open with a pain they feel, not a feature. Short, local, visual, captions always on. Show the owner's world (counter, kitchen, chai, thali), not a generic office. |
| Branch and floor managers | Daily operators of tables, orders, billing. | How-to clarity: one idea per video, screen-accurate UI. |
| Staff (waiters, kitchen, billers) | Low-friction users who will watch training clips in their own language. | Plain language, large type, slow pacing. |
| Investors, partners, hiring managers | Evaluate polish and engineering depth. | A premium hero film and a visible production system behind it. |

<span id="sec_14" class="anchor"></span>3.3 Distribution channels

| **Channel** | **Format** | **Notes** |
|----|----|----|
| Instagram Reels, YouTube Shorts | 9:16, 1080x1920, 15-60 s | Captions burned in; key content inside safe zones. |
| WhatsApp (shares, status, direct sales) | 9:16 or 1:1, 720p, under 16 MB | The main B2B channel for Indian restaurants. Provide a compressed cut. |
| Website hero and feature pages | 16:9, 1080p or 4K, looping | Muted autoplay: design for silent first. |
| LinkedIn, X | 1:1 or 4:5 (and 16:9) | Founder-story and product-depth cuts. |
| In-restaurant signage and table screens | 16:9 or 9:16 loops | No audio assumed; long seamless loops. |
| In-product (onboarding tours, tips) | Remotion Player embed | Same compositions rendered live in the app. |

<span id="sec_15" class="anchor"></span>3.4 Use cases

| **ID** | **Use case** | **Output** |
|----|----|----|
| UC-01 | Launch the flagship brand film | 60 s hero film, 3 languages, all formats |
| UC-02 | Explain a single feature (e.g. QR ordering) | 15-30 s Reel per feature, 3 languages |
| UC-03 | Announce a new release | Release-note clip generated from fresh app screens |
| UC-04 | Pitch a specific restaurant | Personalized video with their name, logo, menu items |
| UC-05 | Monthly owner recap | Shareable 'Your month' video from tenant analytics |
| UC-06 | Festival campaigns | Diwali, Ganesh Chaturthi, Gudi Padwa variants |
| UC-07 | Staff training clips | Step-by-step how-to in Marathi or Hindi |
| UC-08 | Website and signage loops | Muted, seamless, high-resolution loops |
| UC-09 | Testimonial films | Real owner footage with branded lower-thirds and captions |
| UC-10 | A/B hook testing | 3-5 variants of the first 3 seconds per video |
| UC-11 | In-app guided tours | Remotion Player compositions inside the product |
| UC-12 | Investor and partner reel | Studio-quality summary of product and engineering depth |

<span id="sec_16" class="anchor"></span>4. Creative Strategy and Art
Direction

Creative decisions are made and written down **before** code. This
section is the brief every agent reads first.

<span id="sec_17" class="anchor"></span>4.1 The big idea

A premium ad has one thesis. Three candidates are proposed; the owner
picks one for the hero film. The recommendation is Option A.

| **Option** | **Thesis** | **Signature device** | **Risk** |
|----|----|----|----|
| A. The Soundbox (recommended) | Every Indian shopkeeper knows the sound of a payment announced aloud. 'Your restaurant should announce itself.' Orders, tables and bills each get a confident, satisfying sound and a matching visual pulse. | A recurring sonic and visual 'ding' tied to the rupee amount; a QR code that match-cuts into a table, a plate, a bill. | Must stay generic: no real payment-brand trademarks, sounds or voices. |
| B. Chaos to Calm | A noisy, overloaded dinner rush resolves into a quiet, ordered system. | Rapid chaotic montage that snaps into a calm grid when the product appears. | Easy to overdo; needs strong sound design to land. |
| C. One QR, Whole Restaurant | A single QR code is the thread that connects customer, kitchen and owner. | Continuous camera move following one order from table to kitchen to bill. | Technically the most demanding (long continuous 3D move). |

<span id="sec_18" class="anchor"></span>4.2 Visual identity and look

- **Palette:** deep dark base (#0B0F19), elevated surface (#161F30), one
  saturated primary (#3B82F6), one warm accent (#10B981 or a saffron
  tone chosen at style-frame stage). Never more than two accents in a
  scene.

- **Light and mood:** dark UI glass lit by warm practical light (the
  glow of a counter lamp, kitchen heat) to add human warmth to a cool
  interface.

- **Texture:** subtle seeded film grain, soft vignette, restrained
  bloom. Surfaces are matte, glass or brushed metal, never plastic
  gradients.

- **Layout:** strict grid, asymmetric compositions, generous negative
  space, one hero element per scene.

- **Typography:** Inter or Outfit for English; Noto Sans Devanagari,
  Mukta or Hind for Hindi and Marathi. A maximum of two typefaces per
  video. Large, confident type with controlled hierarchy.

- **Local visual language:** chai counter, thali, steel utensils,
  handwritten menu boards, WhatsApp green, UPI and rupee context,
  festival marigold and diya tones used sparingly. Specific, never
  stereotyped or clip-art.

<span id="sec_19" class="anchor"></span>4.3 Motion identity: the token
system

Every animation pulls from named tokens. Values below are starting
points to be tuned during style-frame review. Frame numbers assume 30
fps.

| **Token** | **Value** | **Used for** |
|----|----|----|
| SPRING_LIGHT | damping 18, mass 0.6, stiffness 180 | Chips, icons, small UI elements |
| SPRING_MEDIUM (house) | damping 14, mass 0.8, stiffness 120 | Cards, list items, buttons |
| SPRING_HEAVY | damping 20, mass 1.2, stiffness 90 | Panels, devices, large surfaces |
| SPRING_HERO | damping 26, mass 1.6, stiffness 70 | Hero object reveals, camera settles |
| HOUSE_EASE | cubic-bezier(0.22, 1, 0.36, 1) | Default ease-out for entrances |
| EXIT_EASE | cubic-bezier(0.64, 0, 0.78, 0) | Exits and fades-out |
| SNAP_EASE | cubic-bezier(0.16, 1, 0.3, 1) | Quick UI responses (button press, toggle) |
| DURATION_MICRO / STANDARD / PANEL / HERO | 6-9 / 12-18 / 20-30 / 36-60 frames | Timing ladder for choreography |
| STAGGER | 3-5 frames between siblings | Lists, grids, word reveals |
| TEXT_HOLD | Minimum 36 frames, plus 8 frames per word beyond four | Readability floor for any on-screen text |
| PERSPECTIVE | 1200 px; rotateX 10 deg, rotateY -8 deg resting tilt | 2.5D device and card presentation |
| GRAIN | Seeded noise at 3-4 percent opacity | Anti-banding and film texture |

**Principle:** heavier objects move slower and settle later. A phone
moves differently from a small badge. Secondary motion (follow-through,
slight overlap, settle) is added to everything that moves.

<span id="sec_20" class="anchor"></span>4.4 Anti-generic rules: avoiding
the 'AI video' look

| **Common tell** | **Rule this PRD enforces** |
|----|----|
| Purple-blue gradient backgrounds everywhere | Palette comes from the brand tokens; backgrounds are lit scenes or tonal darks, not default gradients. |
| Glassmorphism on every element | Glass is used only for hero surfaces. Most elements are solid or matte. |
| Everything centered, same entrance for every element | Asymmetric compositions; entrances vary by object weight and importance. |
| Uniform pacing | Deliberate fast and slow beats, with at least one moment of near-silence and stillness per film. |
| Default whooshes and stock TTS voice | Designed sound palette in the music's key; human voice actor for hero film; AI voice only for variants. |
| UI floating in a void | UI lives on devices in physical settings with lighting, shadow and depth of field. |
| Too many elements per scene | One hero per scene. Maximum three simultaneous text items. |
| Perfectly smooth, lifeless camera | Subtle seeded handheld drift, rack focus, and motion blur. |
| Text-heavy slides | Maximum about seven words on screen at a time; pictures carry the story. |
| Mismatched assets from different sources | All generated or stock assets pass through the same grade, grain and lens treatment. |

<span id="sec_21" class="anchor"></span>4.5 Storytelling frameworks

| **Structure** | **Length** | **Beats** |
|----|----|----|
| Reel (single feature) | 15-30 s | Hook (0-2 s) pain, then Reveal (product), Demo (one feature in action), Proof (number), CTA (last 3 s). |
| Brand film | 45-60 s | Hook, Problem world, Turn (the moment it changes), Product montage, Human proof (owner moment), Promise, CTA and logo sting. |
| Bumper | 6 s | One visual, one benefit, logo and sonic sting. |
| How-to | 30-60 s | Goal stated, 3-5 numbered steps, recap. |

**Hook formulas to test:** (1) a pain question ('Customers waiting 20
minutes just to see the menu?'), (2) a surprising number, (3) a visual
transformation, (4) a relatable restaurant moment, (5) a local-language
proverb or idiom reworked for the product. Each video ships with at
least three hook variants.

<span id="sec_22" class="anchor"></span>4.6 Reference study protocol

1.  Collect 15-20 reference videos from respected product and brand
    films (for example Linear, Stripe, Raycast, Arc, Apple product
    films, and well-regarded Indian fintech and food-tech ads).

2.  Sample frames at fixed intervals and analyze them with a vision
    model for: framing, depth, easing character, pacing, text treatment,
    color, and audio mood.

3.  Summarize findings as a one-page **motion language brief** and store
    it in docs/references/.

4.  Never copy shots or assets; extract principles only.

<span id="sec_23" class="anchor"></span>4.7 Style-frame process

Before any composition code, produce 5-8 still style frames covering:
hero frame, a feature frame, a Devanagari type frame, a 3D device frame,
a data frame, an end card. They may be built in Figma (free tier) or as
Remotion stills. The owner approves them; the agent then replicates them
frame-accurately and uses them as the reference for the visual critique
loop.

<span id="sec_24" class="anchor"></span>5. Product Catalog and Content
Model (the Brain)

<span id="sec_25" class="anchor"></span>5.1 Principles

- **Single source of truth:** all brand, feature, copy and mock-data
  values live in JSON validated by Zod schemas. Scenes read from the
  catalog; they never contain literal copy.

- **Locale-complete:** a feature is not renderable until en, hi and mr
  copy all exist and have passed native review.

- **Honest availability:** each feature carries an availability field
  (live, beta, roadmap). Roadmap features may appear in videos only with
  a 'coming soon' treatment, enforced by QA.

- **Mock data is realistic and Indian:** rupee amounts, plausible menu
  items, Indian names and table numbers.

<span id="sec_26" class="anchor"></span>5.2 Schema (Zod)

> // src/catalog/schema.ts
>
> import { z } from 'zod';
>
> export const Lang = z.enum(\['en', 'hi', 'mr'\]);
>
> const LocaleCopy = z.object({ title: z.string().max(48), sub:
> z.string().max(90) });
>
> export const Feature = z.object({
>
> key: z.string(), // e.g. 'qr_ordering'
>
> category: z.enum(\['Customer
> Experience','Operations','Billing','Setup','Insights'\]),
>
> availability: z.enum(\['live', 'beta', 'roadmap'\]),
>
> uiComponent: z.string(), // component registered in components/
>
> mockData: z.record(z.any()), // props passed to the UI component
>
> heroMetric: z.object({ value: z.string(), label: Lang.optional()
> }).optional(),
>
> locales: z.object({ en: LocaleCopy, hi: LocaleCopy, mr: LocaleCopy }),
>
> voiceover: z.record(Lang, z.string()).optional(), // script lines per
> language
>
> sfxCues: z.array(z.object({ frame: z.number(), sfx: z.string()
> })).optional(),
>
> hooks: z.array(z.string()).optional(), // A/B hook variants
>
> });
>
> export const Product = z.object({
>
> name: z.string(), domain: z.string(),
>
> palette: z.record(z.string()), // background, surface, primary, accent
>
> cta: z.record(Lang, z.string()),
>
> logo: z.object({ svg: z.string(), sting: z.string() }),
>
> });

<span id="sec_27" class="anchor"></span>5.3 Seed feature list (from the
product roadmap)

The catalog is seeded from the real product. availability below reflects
the current build status and must be kept in sync.

| **Feature key** | **Category** | **Hero visual** | **Availability** |
|----|----|----|----|
| qr_table_ordering | Customer Experience | QR code match-cut to table and menu on a phone | Roadmap (customer flow is the last build phase) |
| qr_generation_download | Setup | Per-table QR cards fanning out into a ZIP download | Live |
| onboarding_wizard | Setup | Seven steps progressing: Branch, Kitchen, Shift, Sections, Employees, Menu, Tax | Live |
| table_management | Operations | Floor grid with live table states, merging and reservations | Live (in development) |
| waiting_list_tokens | Operations | Walk-in queue token (e.g. A-12) assigned to a table | Live (in development) |
| menu_management | Setup | Spreadsheet-style menu with variations and add-ons | Live |
| tax_promo_rules | Billing | GST rules and promo codes table with channel scoping | Live |
| multi_outlet_dashboard | Insights | Sales, orders, tables and employees widgets across outlets | Live (shell) |
| orders_live | Operations | Orders with Waiting, Accepted and Completed states | Roadmap |
| kitchen_display | Operations | KDS tickets moving across the kitchen board | Roadmap |
| billing_split | Billing | Bill creation, split bill, payment settled with a ding | Roadmap |
| roles_permissions | Setup | Granular role matrix (Owner, Manager, Waiter, Biller) | Roadmap |
| kot_printing | Operations | Thermal printer ticket printing in the kitchen | Roadmap |
| offline_mode | Operations | Orders keep flowing when the internet drops | Roadmap |
| delivery_platform_sync | Operations | Zomato and other platform orders in one screen | Roadmap |

<span id="sec_28" class="anchor"></span>5.4 Localization workflow

1.  Agent drafts copy in English, then Hindi and Marathi
    **transcreated** (re-written naturally, not literally translated).
    Hindi may use natural Hinglish for terms like QR, bill and order.

2.  A native speaker reviews and approves; approved strings are locked
    in the catalog with a reviewedBy and date field.

3.  Automated checks verify length limits per language (Devanagari often
    runs longer), glyph coverage, and absence of untranslated
    placeholders.

4.  Voiceover script is generated from the locked copy and rechecked for
    pronunciation of English loanwords and rupee amounts.

<span id="sec_29" class="anchor"></span>5.5 Personalization schema
(tenant videos)

> export const TenantVideoProps = z.object({
>
> restaurantName: z.string(), logoUrl: z.string().optional(),
>
> brandColor: z.string().regex(/^#\[0-9a-fA-F\]{6}\$/),
>
> language: Lang,
>
> menuHighlights: z.array(z.object({
>
> name: z.string(), price: z.string(), photo: z.string().optional(),
>
> })).max(6),
>
> stats: z.object({ orders: z.number(), revenue: z.string(), topDish:
> z.string() }).optional(),
>
> });

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
> ├── CLAUDE.md \# agent entry rules: read docs first, stay in scope
>
> ├── docs/
>
> │ ├── PRD.md \# this document (source of truth)
>
> │ ├── remotion-guidelines.md \# non-negotiable quality rules (Appendix
> A)
>
> │ ├── motion-identity.md \# tokens, camera, sound palette
>
> │ ├── references/ \# reference-study briefs
>
> │ ├── style-frames/ \# approved stills
>
> │ └── decisions/ \# decision log (ADR-style)
>
> ├── skills/ \# custom agent skills (see 7.13)
>
> ├── frontend/ \# the SaaS app (separate; components cloned from here)
>
> └── remotion-video/
>
> ├── public/
>
> │ ├── voiceovers/{en,hi,mr}/ \# narration audio
>
> │ ├── music/ sfx/ \# licensed or free-licensed audio
>
> │ ├── models/ hdri/ \# GLB models, HDR environment maps
>
> │ ├── luts/ textures/ \# .cube LUTs, grain, light-leak plates
>
> │ ├── footage/ lottie/ \# live-action plates, Lottie/Rive files
>
> │ └── brand/ \# logo SVG, sonic logo, fonts (if local)
>
> ├── src/
>
> │ ├── catalog/ \# schema.ts, product.json, features.json, tenants/
>
> │ ├── tokens/ \# springs, easing, timing, colors, type, safe zones
>
> │ ├── engine/ \# primitives, camera rig, 3D, shaders, audio, captions
>
> │ ├── components/ \# ui-clones/, devices/, charts/, shared/
>
> │ ├── scenes/ \# Hook, Problem, Reveal, Demo, Proof, CTA
>
> │ ├── compositions/ \# HeroFilm, FeatureReel, Bumper, HowTo,
> TenantPitch,
>
> │ │ \# OwnerRecap, ReleaseNotes, SignageLoop
>
> │ ├── Root.tsx \# composition registry + calculateMetadata
>
> │ ├── index.ts
>
> │ └── render-all.ts \# batch renderer (languages x formats x variants)
>
> ├── scripts/ \# whisper, audio-master, qa, capture, manifest, grade
>
> ├── blender/ \# .blend sources, bpy scripts, exports
>
> ├── qa/ \# reports, golden frames, rubric results
>
> ├── out/ \# renders (gitignored)
>
> ├── remotion.config.ts package.json tsconfig.json LICENSES.md
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

<span id="sec_68" class="anchor"></span>9. Non-Functional Requirements

| **Area** | **Requirement** | **Measure** |
|----|----|----|
| Determinism | Identical inputs yield identical frames and audio timing. | Frame-hash comparison across two renders: 100% match. |
| Visual quality | Delivery encodes show no banding, blockiness or soft text. | Review at 100% zoom on dark gradients and Devanagari text. |
| Performance | A 30 s 1080x1920 feature reel renders in a reasonable time on the target machine; heavy 3D scenes are optimized (instancing, compressed GLB, texture limits). | Benchmarked with remotion benchmark; budget recorded per composition. |
| Reliability | Batches are resumable; one failed render does not stop the batch. | Manifest shows pass, fail and retry state per output. |
| Maintainability | Typed code, lint rules, Storybook, docs kept current by agents. | CI lint and typecheck green; docs updated per task. |
| Accessibility | Captions in every language; text contrast at least 4.5:1; no flashing above 3 flashes per second. | Automated contrast and flash checks. |
| Portability | Project runs on Windows, macOS and Linux with documented setup. | Fresh-machine setup script tested. |
| Security | No secrets in repo; .env ignored; no tenant personal data in committed files. | Secret scan in pre-commit. |
| Privacy | Tenant data used in recap videos is limited to what the owner has consented to; follow applicable Indian data-protection law (confirm requirements with a qualified advisor). | Consent flag required in tenant props. |
| Licensing | Only free or open-source components; every dependency and asset logged. | Pre-release audit produces a clean register. |
| Observability | Each render logs inputs, versions, durations and warnings. | Render manifest per batch. |
| Honesty in marketing | No unshipped feature presented as live. | QA-08 and CAT-05 enforced. |

<span id="sec_69" class="anchor"></span>10. Quality Standard: The
Agency-Grade Rubric

Every release is scored out of 100 by (1) a vision-model critique
against style frames and (2) the owner. The target is **85 or more for
hero films and 80 or more for feature videos**. Any hard-fail condition
rejects the video regardless of score.

<span id="sec_70" class="anchor"></span>10.1 Scorecard

| **Category** | **Points** | **What a 90 percent score looks like** |
|----|----|----|
| Concept and hook | 15 | A clear single idea; hook lands in under two seconds; a memorable signature device. |
| Composition and art direction | 15 | Strong grid, negative space, one hero per scene, consistent with approved style frames. |
| Motion quality | 15 | Weighted springs, overlap and follow-through, intentional rhythm contrast, no robotic linear movement. |
| Typography and localization | 10 | Flawless Devanagari, natural copy, readable hold times, hierarchy that guides the eye. |
| Sound design and mix | 15 | Designed palette, synced SFX, clean voice, ducking without pumping, a moment of silence. |
| Color, light, texture and finish | 10 | Cohesive grade, believable lighting, grain, no banding, assets in one visual family. |
| Story clarity and pacing | 10 | The viewer can state the benefit after one watch; pacing varies with purpose. |
| UI accuracy and honesty | 5 | Screens match the real product; roadmap items are labeled. |
| Technical delivery | 5 | Correct formats, safe zones, loudness, captions, file sizes. |

<span id="sec_71" class="anchor"></span>10.2 Hard-fail conditions

- Broken or clipped Devanagari glyphs in any frame.

- Text outside the safe zone on 9:16 deliveries, or overflowing its
  container.

- Loudness more than 1 LU from target, or clipping.

- An asset without a logged license, or any forbidden-license item.

- A roadmap feature presented as live.

- Visible flicker, banding or dropped frames.

- Unreviewed Hindi or Marathi copy or audio.

<span id="sec_72" class="anchor"></span>10.3 Review gates

| **Gate** | **Artifact reviewed** | **Reviewer** |
|----|----|----|
| G1 Style frames | 5-8 stills | Owner |
| G2 Animatic | Rough timing with scratch voice, boxes for visuals | Owner and critique agent |
| G3 Picture lock | Full visuals, temporary sound | Owner and critique agent (rubric) |
| G4 Sound lock | Final mix and captions | Owner, native speaker for HI and MR |
| G5 Release QA | Final deliverables and manifest | Automated QA, then owner |

<span id="sec_73" class="anchor"></span>11. Hero Film Specification:
'The Soundbox' (Draft)

A concrete first target that exercises every layer of the studio. This
is a **creative proposal** for owner approval at Gate 1, not a locked
script.

|  |  |
|----|----|
| **Format** | 9:16 master, 1080x1920 at 30 fps (900 frames, 30 seconds), with 16:9 and 1:1 re-layouts |
| **Languages** | English, Hindi, Marathi (transcreated, not literal) |
| **Thesis** | Every Indian shopkeeper knows the sound of a payment announcing itself. The restaurant that runs well sounds confident. |
| **Signature device** | A recurring 'ding' motif and a QR code that match-cuts through the whole journey (table, order, kitchen, bill, dashboard). The motif is original and must not imitate any real payment-brand sound or voice. |
| **Look** | Dark, warm-lit cafe counter and kitchen; steel, glass and paper textures; restrained bloom and grain; saffron or marigold accent decided at style-frame stage. |
| **Availability caveat** | Several beats show features that are on the roadmap (customer QR ordering, KDS, billing). Either release the film after those ship, or label it as a vision film with 'coming soon' treatment. |

<span id="sec_74" class="anchor"></span>11.1 Beat sheet

<table>
<colgroup>
<col style="width: 11%" />
<col style="width: 26%" />
<col style="width: 23%" />
<col style="width: 18%" />
<col style="width: 19%" />
</colgroup>
<thead>
<tr>
<th><p><strong>Beat / frames</strong></p></th>
<th><p><strong>Visual and camera</strong></p></th>
<th><p><strong>Techniques</strong></p></th>
<th><p><strong>Sound</strong></p></th>
<th><p><strong>VO draft (EN)</strong></p></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>1 Hook</p>
<p>0-60</p></td>
<td><p>Dark counter at closing; a phone lights up beside a steel till;
macro push-in.</p></td>
<td><p>Rack focus, warm practical light, grain, bloom</p></td>
<td><p>Near silence, then one clean ding</p></td>
<td><p>Every shop in India knows this sound.</p></td>
</tr>
<tr>
<td><p>2 Problem</p>
<p>60-150</p></td>
<td><p>Dinner rush: paper slips, shouting, waving customers; rapid cuts
increasing in tempo.</p></td>
<td><p>Footage plates, speed ramps, whip-pans, handheld noise</p></td>
<td><p>Rising tension bed, chaotic foley</p></td>
<td><p>But behind the counter, orders get lost. Tables wait. Bills go
wrong.</p></td>
</tr>
<tr>
<td><p>3 Turn</p>
<p>150-210</p></td>
<td><p>Everything stops. A QR code on a steel table tent catches the
light.</p></td>
<td><p>Match-cut anchor, slow dolly, depth of field</p></td>
<td><p>Silence, one soft tonal note</p></td>
<td><p>(none)</p></td>
</tr>
<tr>
<td><p>4 Scan</p>
<p>210-330</p></td>
<td><p>QR morphs into a phone screen: menu opens, a thumb taps, order
placed.</p></td>
<td><p>QR-to-screen morph, 3D phone, MeshTransmissionMaterial, cursor or
thumb</p></td>
<td><p>Soft UI taps, ding on order</p></td>
<td><p>One scan. The order is in.</p></td>
</tr>
<tr>
<td><p>5 Kitchen</p>
<p>330-450</p></td>
<td><p>A ticket drops into the kitchen board and lands in its column; a
cook glances up.</p></td>
<td><p>Rapier physics ticket drop, DoF, footage plate with screen
replacement</p></td>
<td><p>Thermal-printer foley, ticket thud</p></td>
<td><p>The kitchen knows instantly.</p></td>
</tr>
<tr>
<td><p>6 Floor</p>
<p>450-570</p></td>
<td><p>Table grid flips states; a waiting token (A-12) slides to a
table.</p></td>
<td><p>2.5D grid, stagger, token card, spring tiers</p></td>
<td><p>Layered clicks tuned to the key</p></td>
<td><p>Every table, every token, in one view.</p></td>
</tr>
<tr>
<td><p>7 Bill</p>
<p>570-690</p></td>
<td><p>GST-accurate bill, split, then settled; the rupee amount counts
up.</p></td>
<td><p>CountUp, receipt paper physics, glow on settle</p></td>
<td><p>Ding in the signature motif</p></td>
<td><p>Bill done. Payment in.</p></td>
</tr>
<tr>
<td><p>8 Owner</p>
<p>690-780</p></td>
<td><p>Laptop dashboard with sales ring and outlets; camera pulls back
to the owner at home.</p></td>
<td><p>Frame-driven charts, parallax pull-back, grade shift to
warm</p></td>
<td><p>Music opens up, warm pad</p></td>
<td><p>Your whole restaurant, in your pocket.</p></td>
</tr>
<tr>
<td><p>9 Promise</p>
<p>780-850</p></td>
<td><p>Owner relaxes with chai; short human beat; one line of
type.</p></td>
<td><p>Footage or illustrated plate, kinetic type by word</p></td>
<td><p>Ambient room tone, music peak</p></td>
<td><p>Run it calmly.</p></td>
</tr>
<tr>
<td><p>10 CTA</p>
<p>850-900</p></td>
<td><p>Logo sting, URL and QR; sonic logo resolves.</p></td>
<td><p>Logo animation, light leak, final ding</p></td>
<td><p>Sonic logo, tail reverb</p></td>
<td><p>[Product]. Start free at [domain].</p></td>
</tr>
</tbody>
</table>

**Timing note:** the English draft is about 58 words for 28 seconds of
speech. Hindi and Marathi often run longer; durations are re-measured
from the actual audio and scenes stretch through calculateMetadata.

<span id="sec_75" class="anchor"></span>11.2 Hero film production
checklist

- Approve concept and style frames (G1); write catalog entries and
  transcreated copy; native review.

- Record or synthesize scratch voice; build the animatic (G2).

- Shoot or source footage plates (a day at a real cafe); log releases.

- Build Blender hero shots (phone, standee, printer) and export.

- Assemble in Remotion; run critique loop to picture lock (G3).

- Design sonic palette and sonic logo; final voice; mix (G4).

- Supersampled render, grade, encodes, captions, manifest, QA (G5).

<span id="sec_76" class="anchor"></span>12. AI Agent Operating Model

<span id="sec_77" class="anchor"></span>12.1 Roles

| **Role** | **Responsibility** | **Inputs** | **Outputs** |
|----|----|----|----|
| Director | Concept, thesis, storyboard, hook variants | Brief, references, catalog | Concept doc, beat sheet |
| Art-director critic | Judges stills against style frames and rubric | Rendered stills, style frames, rubric | Scores and fix list (JSON) |
| Motion engineer | Writes components, scenes and compositions to spec | Cue sheet, tokens, guidelines | Typed code, previews |
| 3D artist | R3F scenes and Blender scripts | Beat sheet, camera plan | GLB, image sequences, scene code |
| Localization editor | Transcreation, glyph and length checks | English copy, tone guide | Locked HI and MR copy |
| Sound editor | Palette, SFX placement, mix, ducking | Locked picture, cue sheet | Final audio, loudness report |
| QA engineer | Runs automated checks and regression | Renders, manifest | QA report, pass or fail |
| Render operator | Batch rendering, finishing, packaging | Locked compositions | Deliverables, manifest |

One underlying agent (Claude Code or Antigravity) can play each role in
turn, loading the matching skill. The roles exist so each task has a
clear contract, not to imply separate systems.

<span id="sec_78" class="anchor"></span>12.2 Staged prompting framework

Prompts are templates stored in the repo. Every stage prompt begins with
the standard footer.

Standard footer (attached to every prompt)

> Before you start: read CLAUDE.md, docs/PRD.md (relevant sections),
> docs/remotion-guidelines.md,
>
> and the skills listed for this task. Stay strictly within this task's
> scope. Do not invent
>
> package names: verify with \`npm view\`. After finishing: run
> typecheck, lint and the relevant
>
> tests, report real pass/fail results, and update docs and the decision
> log.
>
> For new capabilities: write an implementation plan file first and wait
> for approval.

Stage 0: Concept prompt

> Role: Director. Using the product catalog and the motion language
> brief, propose 3 big ideas
>
> for a \<length\> video aimed at \<audience\> in \<language\>. For
> each: thesis, signature device,
>
> 5-beat outline, hook variants (3), sound idea, risks. Do not write
> code.

Stage 1: Cue-sheet prompt

> Role: Director. Input: feature keys \<keys\>, language \<lang\>,
> approved style frames.
>
> Output: a Cue Sheet JSON that validates against src/catalog/schema.ts
> (CueSheet).
>
> Include scene boundaries in frames at 30 fps, voiceover lines with
> word counts, SFX cues with
>
> frames, cursor waypoints, camera keyframes and music ducking. Respect
> text-hold rules.

Stage 2: Assembly prompt

> Role: Motion engineer. Assemble src/compositions/\<Name\>.tsx from the
> Cue Sheet.
>
> Use only tokens from src/tokens/. Use scene templates in src/scenes/.
> Pull copy via \`lang\`.
>
> Animate by frame only. Enforce safe zones for the target format. No
> per-character animation
>
> for Devanagari. Provide a Studio preview and a Storybook story for any
> new component.

Stage 3: Critique prompt

> Role: Art-director critic. Compare these N stills with the approved
> style frames and the rubric
>
> in PRD section 10. Return ONLY JSON:
>
> { "scores":
> {"concept":0-15,"composition":0-15,"motion":0-15,"type":0-10,
>
> "sound":0-15,"finish":0-10,"clarity":0-10,"honesty":0-5,"technical":0-5},
>
> "hardFails": \[string\], "fixes":
> \[{"frame":n,"issue":string,"suggestion":string}\] }

Stage 4: Sound prompt

> Role: Sound editor. Using the locked picture and cue sheet, place SFX
> from the approved palette,
>
> pan by screen position, set ducking per AUD-06, master to -14 LUFS
> (true peak \<= -1 dBTP),
>
> export a loudness report. Do not use any asset missing from
> assets-manifest.json.

Stage 5: Release prompt

> Role: Render operator. Run the determinism check, batch render the
> manifest, run finishing,
>
> run all QA checks, generate the render manifest and license audit.
> Stop on any hard fail.

<span id="sec_79" class="anchor"></span>12.3 Governance

- Agents never change tokens, rubric or guidelines without an approved
  decision-log entry.

- New features require a written plan and owner approval before code.

- Each task ends with real test and render output, not a claim that it
  compiles.

- If an agent is unsure about a package, license or API, it must verify
  rather than guess.

<span id="sec_80" class="anchor"></span>13. Build Roadmap (Dependency
Order)

Phases are ordered by dependency. With agent-driven development, several
phases can proceed in parallel once their prerequisites are met.

| **Phase** | **Scope** | **Deliverables** | **Exit criteria** |
|----|----|----|----|
| 0 Foundations | Repo, Remotion setup, pinned versions, tokens skeleton, guidelines, CLAUDE.md, license register, package verification | Running Studio, lint rules, LICENSES.md, assets-manifest.json, first 8 skills | Hello-world composition renders deterministically |
| 1 The Brain | Schemas, product.json, features.json (15 seed features), locale workflow | Validated catalog, native-reviewed EN, HI, MR copy for first features | Catalog gate blocks incomplete features |
| 2 Components | UI clones, device frames, cursor, charts, Storybook | Story for every clone; mock-data fixtures | Brand-color swap test passes |
| 3 Scene engine | Scene templates, transitions, composition registry, first feature reel (EN) | One complete 20 s reel | Rubric 70+ on first pass |
| 4 Audio | VO pipeline, Whisper sync, captions, SFX palette, ducking, mastering | Fully mixed reel in 3 languages | Loudness and sync checks pass |
| 5 Cinema | Camera rig, lens effects, grain, LUT, motion blur, 3D kit, physics, Blender pipeline | 3D hero prop shots; cinematic reel | Rubric 80+ on a feature reel |
| 6 Localization at scale | All seed features in 3 languages; Devanagari QA suite | Batch of localized reels | Zero glyph defects |
| 7 QA automation | Critique loop, safe-zone, contrast, overflow, regression, determinism | QA report generator | Release blocked by any hard fail |
| 8 Hero film | Soundbox film with footage plates, Blender shots, designed sound, grade | 60 s and 30 s hero cuts in all formats | Rubric 85+ |
| 9 Product features | Tenant personalization, owner recap, Player embed, festival templates, signage | Working personalized renders and in-app Player | Tenant video renders from live data snapshot |
| 10 Automation | Playwright capture, release-note videos, A/B variants | One-command release clip | Zero manual steps for a release video |

<span id="sec_81" class="anchor"></span>14. Risks and Mitigations

| **Risk** | **Impact** | **Mitigation** |
|----|----|----|
| Agents hallucinate package names or APIs | Wasted sessions, broken builds | Verification protocol (7.14); pinned versions; npm view before install. |
| Output looks 'AI generated' or generic | Fails the core goal | Anti-generic rules, style frames, critique loop, human VO and real footage for hero film. |
| Devanagari rendering problems (esp. 3D text) | Broken glyphs; unprofessional look | Word-level animation only; DOM or canvas texture for 3D text; QA-09 stress strings. |
| Free Hindi and Marathi TTS sounds robotic | Weak audio quality | Compare Indic Parler-TTS and free-tier cloud voices; use a human recording (with release) for hero film; flag upgrade in Part B. |
| WebGL instability or slow renders | Crashes, long waits | GL flag tuning, lower concurrency, asset optimization, supersample only at finishing. |
| Non-determinism sneaks in | Flaky renders, bad QA | Lint rules, determinism check in every render. |
| Asset or music licensing mistakes | Takedowns or legal exposure | Asset manifest, forbidden list, license audit before release. |
| Roadmap features shown as live | Misleading marketing | Availability field, QA gate, 'coming soon' treatment. |
| Remotion license change or team growth past 3 people | License cost or compliance gap | Re-read license before adding people; budget in Part B. |
| Free tools change terms or limits | Sudden cost or loss of capability | Prefer open-source; record fallback for each tool. |
| Tenant data privacy | Trust and legal exposure | Consent flag, snapshots only, no personal data in repo. |
| Scope creep from the long feature list | Diluted quality | Rubric governs; one hero per scene; remove before adding. |
| Agent drift from guidelines over long sessions | Inconsistent output | Standard footer, short focused tasks, regression checks. |
| Synthetic voice or likeness misuse | Ethical and platform-policy issues | Voice releases; disclose synthetic media where platforms require; no cloning without consent. |

<span id="sec_82" class="anchor"></span>15. Licensing and Compliance
Register

This section summarizes licensing posture. It is guidance, not legal
advice; verify each license at the source before first use and again
before commercial release.

<span id="sec_83" class="anchor"></span>15.1 Remotion

- Remotion is free for individuals and for companies of up to **three
  people**, including commercial use, unlimited videos and self-hosted
  cloud rendering. There is no functional difference between free and
  paid versions.

- A Company License is required once the entity has **four or more
  people** involved. At the time of research it was priced at about
  **\$25 per developer seat per month with a \$100 per month minimum**,
  with an Enterprise tier starting around \$500 per month. Some pricing
  pages also list a per-render option; confirm current terms.

- The threshold depends on headcount, not revenue. For collaborations,
  combined headcount counts. The obligation falls on the entity that
  owns the project's IP.

- The Remotion repository notes that license terms will change slightly
  in **Remotion 5.0**. Re-read the license when upgrading.

- The free license forbids copying or modifying Remotion to sell or
  sublicense a derivative of Remotion itself.

<span id="sec_84" class="anchor"></span>15.2 License families in this
project

| **Family** | **Examples** | **Obligation / posture** |
|----|----|----|
| MIT, ISC, BSD, Apache-2.0 | React, Three.js, R3F, zod, d3, lucide-react, sharp, Rapier, Playwright | Keep notices; free commercial use; log in LICENSES.md. |
| GPL / LGPL tools | Blender, ffmpeg builds, SoX, pedalboard, Audacity, Inkscape, ComfyUI | Used as tools; outputs are yours. Do not embed GPL code in a distributed product. |
| SIL Open Font License | Inter, Outfit, Noto, Mukta, Hind, Poppins, Baloo 2 | Free for commercial use; do not sell the fonts themselves. |
| CC0 | Poly Haven, ambientCG, Quaternius, Kenney | No obligation; still log source. |
| CC-BY | Some Freesound, Sketchfab, Incompetech items | Attribution required; keep attribution text in manifest and credits. |
| Platform content licenses | Pexels, Pixabay, Unsplash, Mixkit | Read terms; avoid identifiable people and brands without release. |
| Proprietary freeware | DaVinci Resolve (Free), Figma (free tier) | Follow product terms; no redistribution. |
| Non-commercial licenses (forbidden) | Depth Anything V2 Base/Large/Giant, Coqui XTTS-v2, Meta MMS-TTS, certain beat-tracking models | Do not use. |
| AI model licenses | FLUX.1 \[schnell\], SDXL, open-weight VLMs | Verify per model before use. |

<span id="sec_85" class="anchor"></span>15.3 Compliance practices

- LICENSES.md (dependencies) and assets-manifest.json (assets) updated
  in the same commit as any addition.

- Pre-release audit script lists every dependency and asset, flags
  anything unlogged or on the forbidden list.

- Credits and attribution file generated per video where CC-BY assets
  are used.

- Signed voice release for any human voice; written consent for
  testimonials and recognizable people.

- No third-party brand logos, jingles or soundbox voices. The 'ding'
  motif is original.

- Check each publishing platform's current policy on AI-generated or
  synthetic media and disclose where required.

- Free-tier terms (ElevenLabs free, cloud TTS quotas, Uppbeat) are
  re-read before any commercial publishing.

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

<span id="sec_87" class="anchor"></span>Appendix A:
\`remotion-guidelines.md\` (Draft Contents)

This file is read by every coding agent before every task.

> \# Remotion Guidelines (non-negotiable)
>
> \## 1. Determinism
>
> \- Never use Math.random(), Date.now(), new Date() for visuals. Use
> random('seed') from remotion.
>
> \- No CSS animations/transitions, setTimeout, requestAnimationFrame.
> All motion from useCurrentFrame().
>
> \- No unseeded or time-varying useState. Derive values from frame and
> props.
>
> \- Await fonts, images, models via delayRender/continueRender or
> Remotion loaders.
>
> \- No network calls at render time. Use snapshotted JSON.
>
> \- Physics simulations are precomputed per frame from a fixed seed.
>
> \## 2. Motion
>
> \- Use tokens from src/tokens/ only. No raw spring/easing numbers in
> scenes.
>
> \- Spring tier follows object weight: LIGHT, MEDIUM, HEAVY, HERO.
>
> \- Stagger siblings 3-5 frames. Overlap animations; avoid purely
> sequential entrances.
>
> \- Add follow-through and settle to every moving object.
>
> \- One hero element per scene. Maximum three simultaneous text items.
>
> \- Text hold: at least 36 frames, plus 8 frames per word beyond four.
>
> \## 3. Typography and localization
>
> \- Fonts via @remotion/google-fonts; two typefaces maximum per video.
>
> \- Devanagari: line-height \>= 1.4, no letter-spacing, animate by word
> or line, never by character.
>
> \- Use fitText/measureText so text never overflows in any language.
>
> \- Never hardcode copy. Pull from catalog via \`lang\`.
>
> \- Format money with Intl.NumberFormat('en-IN') (lakh/crore grouping).
>
> \## 4. Composition and safe zones
>
> \- 9:16: keep key content out of top ~14%, bottom ~25% and right edge
> (see tokens/safeZones).
>
> \- Layouts adapt per aspect ratio; do not simply scale.
>
> \## 5. Look
>
> \- Use brand palette tokens; at most two accent colors per scene.
>
> \- Glass only on hero surfaces. Seeded grain at 3-4%. No default
> purple-blue gradient.
>
> \- Place UI on devices in lit scenes with depth of field where
> appropriate.
>
> \## 6. Audio
>
> \- Every interaction has a defined sound from the palette. No raw
> stock whooshes.
>
> \- Duck music to ~10% during VO, ~35% in pauses with smooth ramps.
>
> \- Master to -14 LUFS, true peak \<= -1 dBTP.
>
> \## 7. Assets and licensing
>
> \- Every asset has a row in assets-manifest.json. Every dependency is
> in LICENSES.md.
>
> \- Forbidden: items on the 'Do not use' list in PRD section 7.14.
>
> \## 8. Process
>
> \- Read docs first. Stay in scope. Verify packages with \`npm view\`
> before installing.
>
> \- New capability: write a plan, wait for approval. Finish with real
> test and render results.

<span id="sec_88" class="anchor"></span>Appendix B: Cue-Sheet Example
and Batch Commands

<span id="sec_89" class="anchor"></span>B.1 Cue-sheet JSON (excerpt)

> {
>
> "composition": "FeatureReel", "lang": "en", "fps": 30,
>
> "feature": "qr_table_ordering", "durationInFrames": 810,
>
> "scenes": \[
>
> { "id": "hook", "scene": "Hook", "from": 0, "to": 60 },
>
> { "id": "reveal", "scene": "Reveal", "from": 60, "to": 150 },
>
> { "id": "demo", "scene": "FeatureDemo", "from": 150, "to": 570 },
>
> { "id": "proof", "scene": "Proof", "from": 570, "to": 720 },
>
> { "id": "cta", "scene": "CTA", "from": 720, "to": 810 }
>
> \],
>
> "voiceover": \[ { "line": "One scan. The order is in.", "startFrame":
> 210 } \],
>
> "sfx": \[ { "frame": 160, "file": "sfx/click-soft.wav", "pan": 0.2,
> "gain": 0.8 } \],
>
> "music": { "file": "music/bed-01.mp3", "duckTo": 0.10, "restoreTo":
> 0.35 },
>
> "cursor": \[ { "frame": 120, "x": 540, "y": 900 },
>
> { "frame": 160, "x": 540, "y": 1180, "click": true } \],
>
> "camera": \[ { "frame": 0, "pos": \[0, 0, 6\], "look": \[0, 0, 0\],
> "fov": 35 } \]
>
> }

<span id="sec_90" class="anchor"></span>B.2 Duration from audio

> // Root.tsx (concept; verify the audio-duration API for the pinned
> Remotion version)
>
> calculateMetadata: async ({ props }) =\> {
>
> const seconds = await getAudioDuration(staticFile(props.voice)); //
> verify API name
>
> return { durationInFrames: Math.ceil((seconds + 0.5) \* 30) };
>
> }

<span id="sec_91" class="anchor"></span>B.3 Batch rendering (example)

> \# One language, one format, supersampled
>
> npx remotion render src/index.ts FeatureReel out/qr-reel-en.mp4 \\
>
> --props=./props/qr-en.json --scale=2 --crf=17 --gl=angle
>
> \# Master for grading
>
> npx remotion render src/index.ts HeroFilm out/hero-en-master.mov \\
>
> --codec=prores --prores-profile=4444 --image-format=png
> --props=./props/hero-en.json
>
> \# Whole matrix from a manifest (languages x formats x variants)
>
> npx tsx src/render-all.ts --manifest=./render-manifest.json

<span id="sec_92" class="anchor"></span>Appendix C: Pre-Release QA
Checklist

| **Check** | **Pass criteria** | **Status** |
|----|----|----|
| Determinism | Two renders produce identical frame hashes | \[ \] |
| Rubric score | At or above target (85 hero, 80 feature) | \[ \] |
| Hard fails | None present | \[ \] |
| Devanagari glyphs | Stress strings render; no clipping | \[ \] |
| Native review | HI and MR copy and audio approved | \[ \] |
| Safe zones | No violations on 9:16 key frames | \[ \] |
| Contrast | 4.5:1 body, 3:1 large text | \[ \] |
| Loudness | -14 LUFS, true peak at or below -1 dBTP | \[ \] |
| Captions | Accurate, synced, SRT and VTT exported | \[ \] |
| Availability | Roadmap features labeled | \[ \] |
| Assets and dependencies | All logged; none forbidden | \[ \] |
| Attribution | Credits file generated if needed | \[ \] |
| Formats | All planned aspect ratios and WhatsApp cut exported | \[ \] |
| File sizes | WhatsApp cut under 16 MB | \[ \] |
| Manifest | Render manifest saved and tagged in Git | \[ \] |

<span id="sec_93" class="anchor"></span>Appendix D: Devanagari Stress
Strings

Used by QA-09 and the devanagari-typography skill to confirm that fonts,
line breaking and animations never split or corrupt conjunct characters.

| **String**             | **Why it is included**                     |
|------------------------|--------------------------------------------|
| क्ष त्र ज्ञ श्र            | Common compound conjuncts                  |
| द्ध द्य ट्ट ड्ड            | Stacked conjuncts                          |
| प्रत्येक विद्यार्थी स्त्री    | Multi-consonant clusters in everyday words |
| ऑर्डर बिल टेबल क्यूआर      | Loanwords with matras and chandra marks    |
| कार्यक्षमता ज्ञानेश्वर      | Long words that stress line breaking       |
| ₹1,25,000 ₹84,200 ₹450 | Rupee symbol and Indian digit grouping     |

<span id="sec_94" class="anchor"></span>Appendix E: Learning and
Reference Resources

- Remotion documentation and its community Discord for API questions and
  examples.

- Three.js and React Three Fiber documentation (pmndrs docs) for 3D and
  postprocessing.

- Blender Manual and Poly Haven tutorials for materials, lighting and
  HDRIs.

- 'The Animator's Survival Kit' (Richard Williams) and the 12 principles
  of animation for motion theory.

- Inspiration and critique: Awwwards, Motionographer, Behance motion
  projects, Land-book, Vimeo Staff Picks.

- Sound design basics: Freesound community guides and free DAW tutorials
  (Audacity, LMMS).

- Typography: Google Fonts Devanagari specimen pages and the Indian Type
  Foundry's educational material.

<span id="sec_95" class="anchor"></span>Appendix F: Glossary

| **Term** | **Meaning** |
|----|----|
| Agent / coding agent | An AI system (Claude Code, Antigravity) that writes and runs code on the owner's behalf. |
| Skill | A folder with a SKILL.md that teaches an agent one repeatable kind of work. |
| MCP | Model Context Protocol: a standard way for agents to use external tools such as a browser or Blender. |
| Composition | A Remotion video definition (size, fps, duration, component, props). |
| Cue sheet | Frame-accurate JSON plan of scenes, voice, SFX, cursor and camera. |
| Token | A named design or motion constant (spring, easing, duration, color). |
| Transcreation | Re-writing copy naturally in another language rather than translating word for word. |
| Supersampling | Rendering above the delivery resolution and downscaling for crisper results. |
| LUFS | Loudness unit used to normalize audio across platforms. |
| True peak (dBTP) | Maximum inter-sample audio level; kept below clipping. |
| LUT | Look-up table that applies a color grade. |
| HDRI | High-dynamic-range image used to light 3D scenes. |
| DoF | Depth of field: selective focus. |
| Safe zone | Region of the frame that stays clear of platform interface overlays. |
| Gate | A review checkpoint with an owner decision. |

<span id="sec_96" class="anchor"></span>Part B: Future Paid Upgrades
(Budget Roadmap)

This page is the **shopping list for when budget becomes available**.
Part A is built entirely on free and open-source tools. Everything below
is optional, ordered by how much perceived quality it adds per rupee,
and tied to the free tool it improves on.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>Pricing caution</strong></p>
<p>Prices change often. Only <strong>Remotion</strong> and
<strong>ElevenLabs</strong> figures were checked while writing (October
2026); everything else is marked 'quote' or 'check vendor page' and must
be priced at the time of purchase. Costs in dollars should be converted
at the current rate.</p></td>
</tr>
</tbody>
</table>

<span id="sec_97" class="anchor"></span>B1. How to use this section

- When a budget appears, start at **Tier A** and work downward. Tier A
  is human craft: it moves the film from 'excellent engineering' toward
  'expensive production'.

- Each row names the free tool it replaces so the pipeline stays
  modular: upgrading a voice or a music track does not change the code.

- Log every purchase in the budget log at the end of this section, with
  what changed in the result.

- Re-check the Part A **license register** after buying: paid assets
  have their own license terms.

<span id="sec_98" class="anchor"></span>B2. Where the free stack falls
short

| **Free-stack limitation** | **Visible effect** | **Upgrade that fixes it** |
|----|----|----|
| Free Hindi and Marathi synthetic voices | Slightly flat or robotic delivery; wrong emphasis on loanwords | UA1 voice actor, UB1 / UB2 premium AI voice |
| Free music libraries are widely used | Soundtrack feels familiar, not signature | UA3 custom score, UB3 premium library |
| No professionally shot footage | Reliance on illustration or stock; less human warmth | UA5 shoot, UB5 stock subscription |
| Free sound effects, self-made palette | Mix lacks polish and depth | UA4 sound designer, UB4 premium SFX |
| DaVinci Resolve Free | Resolution cap (UHD) and missing advanced tools | UB6 Resolve Studio |
| Local hardware | Slow 3D and 4K renders limit iteration | UC1 GPU workstation, UC2 cloud GPU, UC3 cloud rendering |
| Remotion free license (up to 3 people) | Cannot add a fourth collaborator without a license | UC4 Remotion Company License |
| Self-reviewed copy | Risk of unnatural Marathi or Hindi | UA2 native copywriter and proofreader |
| No external creative review | Blind spots in taste and polish | UA6 senior motion-design review |

<span id="sec_99" class="anchor"></span>B3. Tier A: Human craft (highest
impact per rupee)

| **ID** | **Upgrade** | **What it improves** | **Replaces (free option)** | **Cost note** | **Buy when** |
|----|----|----|----|----|----|
| UA1 | Professional voice actor (Marathi, Hindi, English), recorded in a studio or with a pro remote setup | Natural performance, emphasis, emotion; the single biggest audio upgrade | AI4Bharat Indic Parler-TTS, cloud TTS free tiers, volunteer voice | Per-project quote; get 3 quotes | Before releasing the hero film |
| UA2 | Native-speaker copywriter and proofreader for Marathi and Hindi | Idiomatic, persuasive copy; avoids stiff translation | Self or friend review | Per word or per project quote | Before any paid distribution |
| UA3 | Custom music score and sonic logo from a composer | Ownable brand sound; the 'ding' motif designed professionally | Free libraries, LMMS or GarageBand composition | Commission quote | When the brand sound is locked |
| UA4 | Professional sound designer and mixer | Layered foley, impacts, spatial mix, broadcast-grade master | Self-made palette, Pedalboard chain | Per-project quote | Hero film and flagship cuts |
| UA5 | One-day professional shoot (videographer, lighting, location, releases) plus testimonial shoot | Real people, real restaurants, cinematic plates for screen replacement | Phone footage, free stock | Day-rate quote plus location and talent costs | When hero film beats are locked |
| UA6 | Senior motion-design or art-direction review sessions | Catches taste and polish problems the rubric misses | Self and vision-model critique | Hourly or session quote | At gates G1 and G3 |
| UA7 | Licensed Devanagari and Latin display typeface, or custom lettering for the wordmark | Distinctive brand typography beyond Google Fonts | SIL OFL Google Fonts | Font license or commission quote | When branding is finalized |
| UA8 | Professional 3D artist for hero props and brand scenes | Showroom-quality phone, standee, printer, restaurant environments | Free GLB models and self-built Blender scenes | Per asset or per project quote | If 3D beats look generic |
| UA9 | Professional colorist for the final grade | Cohesive cinematic look across footage and renders | Self-grade in Resolve Free | Per-project quote | Hero film |

<span id="sec_100" class="anchor"></span>B4. Tier B: Tools and services
that raise craft

| **ID** | **Upgrade** | **What it improves** | **Replaces (free option)** | **Cost note** | **Buy when** |
|----|----|----|----|----|----|
| UB1 | ElevenLabs paid plan | Natural multilingual voices, professional voice cloning from Creator, commercial rights | Free plan (no commercial license) and open-source voices | Starter about \$5-6/month (minimum for commercial use); Creator about \$22/month (includes professional voice cloning); Pro about \$99/month. Verify. | When a good AI voice is needed for many variants |
| UB2 | Sarvam AI or other Indian-language TTS paid tiers | Voices tuned for Indian languages including Marathi | Open-source and free cloud TTS | Check vendor page | If ElevenLabs quality is insufficient for Marathi |
| UB3 | Premium music subscription (Epidemic Sound, Artlist or similar) | Large, high-quality, cleared catalog and stems | Pixabay, Uppbeat free, Free Music Archive | Subscription; check vendor page | Before regular paid distribution |
| UB4 | Premium sound-effects library | Pro foley and UI sound sets | Freesound, Mixkit, self-made | Check vendor page | When sound design deepens |
| UB5 | Stock footage subscription (Envato Elements, Storyblocks, Artlist) | Cinematic B-roll, Indian restaurant and food scenes | Pexels, Pixabay | Subscription; check vendor page | When footage is needed without a shoot |
| UB6 | DaVinci Resolve Studio (one-time license) | Higher resolution, advanced noise reduction, more GPU effects, collaboration | Resolve Free | One-time license; check vendor page | When delivering above UHD or needing advanced tools |
| UB7 | AI video generators (Veo, Runway, Kling and similar) credits | Establishing shots and plates when no footage is available | Stock footage and own shoots | Credit-based; check vendor page | Occasional hero beats; treat as plates only |
| UB8 | Premium AI image tools (Midjourney or similar) | Faster, richer style frames and backgrounds | ComfyUI with FLUX or SDXL (local) | Subscription; check vendor page | At style-frame stage |
| UB9 | Topaz Video AI or similar | High-quality upscaling and frame interpolation | Real-ESRGAN, RIFE | Check vendor page | When mixing low-res footage |
| UB10 | Mocha Pro or advanced compositing software | Faster, more reliable planar tracking and compositing | OpenCV and Blender tracking | Check vendor page | If many screen replacements are needed |
| UB11 | Figma paid seat (Dev Mode and MCP) | Design-to-code access for agents; design tokens | Free Figma and manual token export | Check vendor page | When the product design system grows |
| UB12 | Premium 3D asset libraries (Fab, TurboSquid, CGTrader) | Quality props, devices and environments | Poly Haven, Quaternius, Sketchfab CC0 | Per asset | To speed up 3D beats |
| UB13 | Higher Claude plan or API credits for the vision-critique loop | Automated multi-pass critique at scale | Manual critique through existing subscriptions | Usage-based; check vendor page | When batch volume grows |

<span id="sec_101" class="anchor"></span>B5. Tier C: Scale and
infrastructure

| **ID** | **Upgrade** | **What it improves** | **Replaces (free option)** | **Cost note** | **Buy when** |
|----|----|----|----|----|----|
| UC1 | Dedicated GPU workstation or GPU and RAM upgrade | Fast 3D renders and local AI models; shorter iteration loops | Existing machine | Hardware cost | When renders exceed a comfortable wait |
| UC2 | Cloud GPU rental (RunPod, Lambda and similar) | On-demand power without hardware purchase | Local GPU | Hourly rate; check vendor | For heavy batches or local AI models |
| UC3 | Remotion Lambda (AWS) or Cloud Run rendering | Parallel cloud renders for large batches and personalized videos | Local rendering | Cloud compute cost plus Remotion license; check vendor | When rendering 100+ outputs or serving customers |
| UC4 | Remotion Company License | Legal use at 4+ people; prioritized support | Free license (up to 3 people) | Verified: about \$25 per developer seat per month, \$100 per month minimum; Enterprise from about \$500 per month; some sources also list per-render pricing. Re-check. | The day a fourth person joins the project |
| UC5 | Video hosting and delivery (Mux, Cloudflare Stream, Bunny) | Fast, adaptive playback for in-product videos | Direct file hosting | Usage-based; check vendor (the Remotion company license lists Mux credits) | When embedding videos in the product at scale |
| UC6 | Cloud storage and backup for masters (S3, R2, Drive) | Safe archive of ProRes masters and assets | Local disks | Storage cost | When masters accumulate |
| UC7 | CI render runners or self-hosted runner | Automated nightly renders and QA | Local runs | Usage-based | When release videos should render automatically |
| UC8 | Job queue and hosting for per-tenant video jobs (Redis, workers) | Reliable personalized and recap videos inside the product | Manual command line | Hosting cost | When tenant video features go live |

<span id="sec_102" class="anchor"></span>B6. Tier D: Growth, legal and
distribution

| **ID** | **Upgrade** | **What it improves** | **Replaces (free option)** | **Cost note** | **Buy when** |
|----|----|----|----|----|----|
| UD1 | Legal review (music, voice, likeness, trademarks, tenant data under Indian data-protection law) | Reduces legal exposure before scaling | Self-checking with the Part A register | Advisor quote | Before paid campaigns and tenant-data videos |
| UD2 | Paid distribution (Meta, YouTube, Google ads) | Reaches restaurant owners at scale and generates A/B data | Organic sharing and WhatsApp | Ad spend | When the hero film passes the rubric |
| UD3 | Analytics and attribution tools | Measures hook retention and demo conversions per variant | Platform-native analytics | Subscription tiers | When running A/B hook tests |
| UD4 | Additional Indian languages (Gujarati, Kannada, Tamil, Telugu, Bengali and others) with native reviewers and voices | Expands market reach beyond EN, HI, MR | None (new capability) | Per language: reviewer plus voice | When entering new states |
| UD5 | Customer testimonial program (travel, incentives, release management) | Authentic social proof | Informal testimonials | Per testimonial | When customers are live |
| UD6 | Trademark and copyright filing for brand name, logo and sonic logo | Protects brand assets | None | Filing fees | After brand is final |
| UD7 | Subtitling and translation services for long-form content | Accuracy and speed at volume | Whisper plus self-review | Per minute quote | If long-form content grows |

<span id="sec_103" class="anchor"></span>B7. Suggested purchase sequence

A sensible order when money arrives in stages. Adjust to results from
the rubric.

| **Step** | **Buy** | **Reason** |
|----|----|----|
| 1 | UA1 voice actor (hero film), UA2 native copy review | Biggest jump in perceived quality and credibility |
| 2 | UB3 music subscription or UA3 custom score; UB1 ElevenLabs for variants | Sound identity and scalable localized voice |
| 3 | UA5 shoot day, UA4 sound designer | Human warmth and a professional mix |
| 4 | UA6 senior review, UA9 colorist, UB6 Resolve Studio | Polish and finish |
| 5 | UC1 or UC2 compute, UB7 AI plates, UB8 image tools | Iteration speed and extra visual material |
| 6 | UC4 Remotion license (when team reaches 4), UC3 cloud rendering, UC5 hosting, UC8 job queue | Scale and product integration |
| 7 | UD1 legal review, UD2 ads, UD3 analytics, UD4 more languages | Growth and compliance |

<span id="sec_104" class="anchor"></span>B8. Trigger checklist: when to
start spending

- Hero film scores 85 or more on every category **except** sound or
  voice: buy UA1, UA3 or UA4.

- Hindi or Marathi copy feels stiff in review: buy UA2 before any paid
  distribution.

- A fourth person joins the project or a collaborator is added: buy UC4
  the same day.

- Renders for a single video take longer than you are willing to wait:
  consider UC1 or UC2.

- Personalized or recap videos go live for customers: plan UC3, UC5 and
  UC8.

- Paid advertising begins: complete UD1 legal review and move to cleared
  music (UB3 or UA3).

- Customers outside Maharashtra and Hindi-speaking states ask for
  videos: start UD4.

<span id="sec_105" class="anchor"></span>B9. Budget log (fill in as you
buy)

| **Date** | **Item (ID)** | **Cost** | **License terms noted** | **Result / what improved** |
|----|----|----|----|----|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
