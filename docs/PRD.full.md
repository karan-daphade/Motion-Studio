<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>PRODUCT REQUIREMENTS DOCUMENT</strong></p>
<p><strong>Motion Studio</strong></p>
<p>A programmatic, agency-grade motion-video engine for BharatQR and
other brands, built with Remotion and AI coding agents</p>
<p>Remotion | React + TypeScript | Three.js + Blender | Whisper | Claude
Code + Antigravity</p></td>
</tr>
</tbody>
</table>

|  |  |
|----|----|
| **Product promoted** | BharatQR (working name, brand \#1), a multi-tenant restaurant and hotel POS platform; other brands through Multi-Brand Mode |
| **Document version** | 1.1 (adds Multi-Brand Mode and the Brand Intake pipeline) |
| **Date** | 6 October 2026 |
| **Owner** | Karan Datta Daphade |
| **Status** | Draft for owner approval |
| **Languages in scope** | English, Hindi, Marathi |
| **Quality target** | Agency-grade output equivalent to a \$10,000 to \$20,000 (10 to 20 lakh rupees) production, and not generic AI-looking video |
| **Software cost today** | Zero. Part A uses only free and open-source tools |
| **Paid roadmap** | Part B (final section) lists every paid upgrade to consider when a budget becomes available |
| **Companion file** | Brand_Intake_Template.docx: the questionnaire sent to each brand or client (section 16.8) |

**Document Control**

------------------------------------------------------------------------

| **Version** | **Date** | **Change** | **Author** |
|----|----|----|----|
| 1.0 | 5 October 2026 | Initial full PRD: vision, creative strategy, architecture, complete free tech stack, requirements, hero film spec, roadmap, risks, licensing, Part B paid upgrades | Karan Datta Daphade with Claude |
| 1.1 | 6 October 2026 | Added Multi-Brand (Client) Mode: Brand Profile schema, Brand Intake Document and pipeline, brand-compliance checks, client workflow, confidentiality tiers and LLM routing, client-work licensing. Fixed schemas (zod 4 compatible and tested), made languages brand-defined, corrected feature availability and roles, refreshed Remotion terms, extended Part B | Karan Datta Daphade with Claude |

**How to read this document**

| **Part** | **Contents** | **Audience** |
|----|----|----|
| Part A: Product Requirements (Sections 1-17, Appendices A-I) | Everything needed to build the studio with a free stack: vision, goals, creative direction, catalog, architecture, library inventory, skills, functional requirements, quality rubric, hero film, agent prompts, roadmap, risks, licensing, Multi-Brand Mode (Section 16), appendices | Owner and every coding agent |
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
> [5.2 Schemas (Zod)](#sec_26)
>
> [5.3 Seed feature list (from the product roadmap)](#sec_27)
>
> [5.4 Localization workflow](#sec_28)
>
> [5.5 Personalization and cue-sheet schemas](#sec_29)

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
>
> [8.16 Multi-brand requirements (BRD)](#sec_68)

[**9. Non-Functional Requirements**](#sec_69)

[**10. Quality Standard: The Agency-Grade Rubric**](#sec_70)

> [10.1 Scorecard](#sec_71)
>
> [10.2 Hard-fail conditions](#sec_72)
>
> [10.3 Review gates](#sec_73)
>
> [10.4 Scoring in Multi-Brand Mode](#sec_74)

[**11. Hero Film Specification: 'The Soundbox' (Draft)**](#sec_75)

> [11.1 Beat sheet](#sec_76)
>
> [11.2 Hero film production checklist](#sec_77)

[**12. AI Agent Operating Model**](#sec_78)

> [12.1 Roles](#sec_79)
>
> [12.2 Staged prompting framework](#sec_80)
>
> [12.3 Governance](#sec_81)

[**13. Build Roadmap (Dependency Order)**](#sec_82)

[**14. Risks and Mitigations**](#sec_83)

[**15. Licensing and Compliance Register**](#sec_84)

> [15.1 Remotion](#sec_85)
>
> [15.2 License families in this project](#sec_86)
>
> [15.3 Compliance practices](#sec_87)
>
> [15.4 Licensing when producing videos for clients](#sec_88)

[**16. Multi-Brand (Client) Mode**](#sec_89)

> [16.1 Purpose and scope](#sec_90)
>
> [16.2 Principles](#sec_91)
>
> [16.3 Folder structure and isolation](#sec_92)
>
> [16.4 The Brand Profile (brand.json)](#sec_93)
>
> [16.5 Intake pipeline](#sec_94)
>
> [16.6 From brand profile to engine tokens](#sec_95)
>
> [16.7 Brand-compliance checks](#sec_96)
>
> [16.8 The Brand Intake Document](#sec_97)
>
> [16.9 Multi-brand requirements (BRD)](#sec_98)
>
> [16.10 Client workflow](#sec_99)
>
> [16.11 LLM usage plan and confidentiality tiers](#sec_100)
>
> [16.12 Contracts, licensing and IP for client work](#sec_101)
>
> [16.13 Changes this mode makes to the rest of the PRD](#sec_102)

[**17. Open Decisions**](#sec_103)

[**Appendix A: remotion-guidelines.md (Draft Contents)**](#sec_104)

[**Appendix B: Cue-Sheet Example and Batch Commands**](#sec_105)

> [B.1 Cue-sheet JSON (validated example)](#sec_106)
>
> [B.2 Duration from audio](#sec_107)
>
> [B.3 Batch rendering (example)](#sec_108)

[**Appendix C: Pre-Release QA Checklist**](#sec_109)

[**Appendix D: Devanagari Stress Strings**](#sec_110)

[**Appendix E: Learning and Reference Resources**](#sec_111)

[**Appendix F: Intake Question Map**](#sec_112)

[**Appendix G: Example brand.json (Illustrative)**](#sec_113)

[**Appendix H: Extraction and Check Prompts**](#sec_114)

> [H.1 Intake extraction prompt](#sec_115)
>
> [H.2 Semantic claims and tone check (BC-06, BC-09)](#sec_116)
>
> [H.3 BRAND.md outline (generated by template)](#sec_117)

[**Appendix I: Glossary**](#sec_118)

[**Part B: Future Paid Upgrades (Budget Roadmap)**](#sec_119)

> [B1. How to use this section](#sec_120)
>
> [B2. Where the free stack falls short](#sec_121)
>
> [B3. Tier A: Human craft (highest impact per rupee)](#sec_122)
>
> [B4. Tier B: Tools and services that raise craft](#sec_123)
>
> [B5. Tier C: Scale and infrastructure](#sec_124)
>
> [B6. Tier D: Growth, legal and distribution](#sec_125)
>
> [B7. Suggested purchase sequence](#sec_126)
>
> [B8. Trigger checklist: when to start spending](#sec_127)
>
> [B9. Budget log (fill in as you buy)](#sec_128)

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
multi-outlet analytics. Several of these modules are still in
development (see the availability column in section 5.3). The audience
is restaurant and cafe owners in India, communicating in **English,
Hindi and Marathi**.

BharatQR is **brand number one** in the studio. The same engine can also
produce videos for other brands and clients through **Multi-Brand Mode**
(section 16), which adds a Brand Kit folder per brand, a detailed Brand
Intake Document, brand-compliance checks and a client approval workflow.

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

1.  **Catalog (the Brain):** per-brand product.json and features.json
    describe the brand, every feature, mock data and localized copy in
    every language the brand uses (English, Hindi and Marathi for
    BharatQR). No text is hardcoded in scenes.

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
| G10 | Serve multiple brands and clients from one engine through isolated Brand Kits and a detailed Brand Intake Document, with brand-compliance checks. | Makes the studio reusable and potentially a service, without per-client rebuilds. |

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
| Client brand owner (Multi-Brand Mode) | Founder or marketing lead of another brand who supplies the Brand Intake Document and approves videos. | A clear intake form, a brand-lock step, approval packs and predictable revision rounds (section 16). |

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
| UC-13 | Brand onboarding for a new client | Completed intake, validated brand profile, approved style frames |
| UC-14 | Client brand film | Hero film in the client's language set, brand-compliance checked |
| UC-15 | Client campaign pack | Batch of feature, offer or festival videos from one locked brand profile |

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

**House tokens and brand tokens.** The values above are the studio's
house defaults. In Multi-Brand Mode a brand may adjust motion tokens
only inside the bounded ranges in section 16.6; safe zones, text-hold,
contrast and Devanagari rules can be made stricter by a brand but never
relaxed.

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

- **Brand-scoped:** catalog data lives under brands/\<id\>/catalog/
  (section 16.3). BharatQR is the first brand; schemas live in
  src/schema/.

<span id="sec_26" class="anchor"></span>5.2 Schemas (Zod)

These schemas were written for this PRD, type-checked with strict
TypeScript and exercised with valid and invalid sample data on zod 4.x.
Languages and feature categories are **brand-defined** so other brands
can use other languages (completeness against the brand's language list
is enforced by the build script, CAT-04). Use two-argument z.record(key,
value) and avoid enum-keyed records for optional per-language fields,
because zod 4 treats enum-keyed records as exhaustive.

> // src/schema/catalog.ts (Product, Feature, Tenant props, Cue sheet)
>
> import { z } from 'zod';
>
> // Languages are brand-defined BCP-47 style codes ('en', 'hi', 'mr',
> 'gu', ...).
>
> // Completeness against brand.localization.languages is checked by the
> build script (CAT-04).
>
> export const Lang =
> z.string().regex(/^\[a-z\]{2,3}(-\[A-Za-z0-9\]{2,8})\*\$/);
>
> const PerLang = z.record(Lang, z.string());
>
> const atLeastOne = (o: Record\<string, unknown\>) =\>
> Object.keys(o).length \> 0;
>
> const LocaleCopy = z.object({ title: z.string().max(48), sub:
> z.string().max(90) });
>
> const Frame = z.number().int().nonnegative();
>
> const Vec3 = z.tuple(\[z.number(), z.number(), z.number()\]);
>
> export const Feature = z.object({
>
> key: z.string(), // e.g. 'qr_table_ordering'
>
> category: z.string(), // taxonomy is defined per brand
>
> availability: z.enum(\['live', 'beta', 'roadmap'\]),
>
> uiComponent: z.string(), // component registered in components/
>
> mockData: z.record(z.string(), z.any()), // props passed to the UI
> component
>
> heroMetric: z.object({ value: z.string(), label: PerLang.optional()
> }).optional(),
>
> locales: z.record(Lang, LocaleCopy).refine(atLeastOne, 'at least one
> language'),
>
> reviewed: z.record(Lang, z.string()).optional(), // language -\>
> reviewer + date
>
> voiceover: PerLang.optional(), // script lines per language
>
> sfxCues: z.array(z.object({ frame: Frame, sfx: z.string()
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
> palette: z.record(z.string(), z.string()), // background, surface,
> primary, accent
>
> cta: PerLang.refine(atLeastOne, 'at least one language'),
>
> logo: z.object({ svg: z.string(), sting: z.string() }),
>
> });
>
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
> consentToUseData: z.literal(true), // recap and pitch videos need
> owner consent
>
> });
>
> export const CueSheet = z.object({
>
> composition: z.string(), lang: Lang, fps: z.number().int().positive(),
>
> feature: z.string(), durationInFrames: z.number().int().positive(),
>
> scenes: z.array(z.object({
>
> id: z.string(),
>
> scene: z.enum(\[
>
> 'Hook', 'Problem', 'Reveal', 'FeatureDemo', 'Proof', 'Montage', 'CTA',
> 'LogoSting',
>
> \]),
>
> from: Frame, to: Frame,
>
> })).min(1),
>
> voiceover: z.array(z.object({ line: z.string(), startFrame: Frame })),
>
> sfx: z.array(z.object({
>
> frame: Frame, file: z.string(),
>
> pan: z.number().min(-1).max(1), gain: z.number().min(0).max(1),
>
> })),
>
> music: z.object({
>
> file: z.string(), duckTo: z.number().min(0).max(1), restoreTo:
> z.number().min(0).max(1),
>
> }),
>
> cursor: z.array(z.object({
>
> frame: Frame, x: z.number(), y: z.number(), click:
> z.boolean().optional(),
>
> })),
>
> camera: z.array(z.object({ frame: Frame, pos: Vec3, look: Vec3, fov:
> z.number() })),
>
> }).refine(
>
> \(c\) =\> c.scenes.every((s) =\> s.from \< s.to && s.to \<=
> c.durationInFrames),
>
> { message: 'every scene needs from \< to and to \<= durationInFrames'
> },
>
> );

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
| multi_outlet_dashboard | Insights | Sales, orders, tables and employees widgets across outlets | In development (dashboard shell) |
| orders_live | Operations | Orders with Waiting, Accepted and Completed states | Roadmap (placeholder shell exists) |
| kitchen_display | Operations | KDS tickets moving across the kitchen board | Roadmap (placeholder shell exists) |
| billing_split | Billing | Bill creation, split bill, payment settled with a ding | Roadmap (placeholder shell exists) |
| roles_permissions | Setup | Granular role matrix (Owner, Branch Manager, Section Manager, Biller, Waiter, Kitchen Staff) | Partial (table permissions enforced; full matrix planned) |
| kot_printing | Operations | Thermal printer ticket printing in the kitchen | Roadmap |
| offline_mode | Operations | Orders keep flowing when the internet drops | Roadmap |
| delivery_platform_sync | Operations | Zomato and other platform orders in one screen | Roadmap |

*Status reflects the owner's project notes as of 6 October 2026. Confirm
it before each release; the QA gate blocks any roadmap feature shown
without a 'coming soon' label.*

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

<span id="sec_29" class="anchor"></span>5.5 Personalization and
cue-sheet schemas

TenantVideoProps (personalized and recap videos) and CueSheet (the
frame-accurate plan produced at Stage 1) are defined in the same schema
file shown in 5.2. TenantVideoProps requires consentToUseData: true, so
a recap or pitch video cannot be built from a restaurant's data without
recorded consent. CueSheet rejects any scene that ends after the
composition does. An example cue sheet that validates against it is in
Appendix B.

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
> │ ├── motion-identity.md \# house tokens, camera, sound palette
>
> │ ├── references/ style-frames/ \# study briefs, approved stills
>
> │ └── decisions/ \# decision log (ADR-style)
>
> ├── skills/ \# custom agent skills (see 7.13)
>
> ├── brands/ \# one isolated folder per brand (section 16.3)
>
> │ ├── \_template/ \# copied to start a new brand
>
> │ └── bharatqr/ \# brand \#1: intake/, brand.json, catalog/, assets/,
> ui/
>
> ├── frontend/ \# the BharatQR app (separate; components cloned from
> here)
>
> └── remotion-video/
>
> ├── public/
>
> │ ├── brand/ \# generated copy of the ACTIVE brand's assets
> (gitignored)
>
> │ ├── models/ hdri/ \# shared GLB models and HDR maps (CC0 or logged)
>
> │ ├── luts/ textures/ \# shared .cube LUTs, grain, light-leak plates
>
> │ └── sfx/ \# shared generic SFX (logged licenses)
>
> ├── src/
>
> │ ├── schema/ \# catalog.ts, brand.ts (Zod; see 5.2 and 16.4)
>
> │ ├── tokens/ \# house springs, easing, timing, colors, type, safe
> zones
>
> │ ├── engine/ \# primitives, camera rig, 3D, shaders, audio, captions
>
> │ ├── theme/ \# brand theme provider (reads brand.json)
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
> │ └── render-all.ts \# batch renderer (brands x languages x formats x
> variants)
>
> ├── scripts/ \# whisper, audio-master, qa, capture, sync-brand,
> manifest
>
> ├── blender/ \# .blend sources, bpy scripts, exports
>
> ├── qa/ \# reports, golden frames, rubric results
>
> ├── out/\<brand\>/\<lang\>/\<fmt\>/ \# renders (gitignored)
>
> ├── remotion.config.ts package.json tsconfig.json LICENSES.md

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

- assets-manifest.json (one per brand, plus one for shared engine
  assets) records source, author, license, URL, date and attribution
  text for every asset; LICENSES.md records every dependency.

- Render cache for precomputed physics, Whisper output, depth maps and
  cutouts, keyed by input hash.

- Each brand carries its own assets-manifest.json and license notes
  inside brands/\<id\>/ (section 16.3); the engine repository holds only
  shared assets and LICENSES.md for engine dependencies.

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
| zod | Catalog, brand, props and cue-sheet validation; structured LLM output schemas. Pin the version: the schemas in this PRD were tested on zod 4.x | MIT |
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
| Ollama with an open-weight vision model (verify license) | Free local alternative for visual critique and for confidential client material that must not leave the machine | Varies by model |
| Gemini API free tier | Free cloud LLM for non-sensitive tasks. Google states that on the free tier your prompts and responses may be used to improve its products (human reviewers may read them); the paid tier is not used that way. Never send confidential client data here | Free tier with rate limits (verify current limits and terms) |
| Groq or OpenRouter free models (verify) | Optional free cloud inference for drafts and structured extraction of non-sensitive content. Check each provider's data-use terms, limits and model licenses | Free tiers (verify) |

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

Custom skills to author (19)

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
| brand-intake | Read a filled Brand Intake Document, run the completeness check, extract brand.json using intake IDs, never invent values, apply studio defaults, list missing items |
| brand-compliance | Run checks BC-01 to BC-15 against a locked brand profile and report hard fails and warnings |
| client-workflow | Gates, approval records, revision rounds, change requests, delivery package, confidentiality tiers and the LLM routing policy |

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
| CAT-01 | Zod schemas for Product, Feature, Tenant props, Cue Sheet (src/schema/catalog.ts) and Brand Profile (src/schema/brand.ts). | Invalid catalog or brand file fails the build with a readable error; schemas exported as JSON Schema. | T0 |
| CAT-02 | Each brand has brands/\<id\>/catalog/product.json with name, domain, palette, CTA per language, logo and sonic logo reference. | Changing the primary color in the brand files updates every composition with no code edit. | T0 |
| CAT-03 | Each brand has brands/\<id\>/catalog/features.json with every feature: category, availability, UI component, mock data, localized copy, voiceover and hooks. | A new feature is addable with data only; BharatQR has at least 15 seed features. | T0 |
| CAT-04 | Locale completeness gate: a feature is renderable only when every language in the brand's localization.languages has copy and a recorded reviewer (for BharatQR: en, hi, mr). | Rendering an incomplete or unreviewed language is blocked with a clear message listing what is missing. | T1 |
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
| DS-06 | Brand token overrides: colors, typography, layout and motion personality from brand.json feed the theme; motion overrides must stay inside the bounded ranges in section 16.6. | An override outside its range fails validation; safe-zone, text-hold, contrast and Devanagari rules cannot be relaxed by a brand. | T2 |

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

<span id="sec_68" class="anchor"></span>8.16 Multi-brand requirements
(BRD)

Requirements for serving multiple brands and clients (BRD-01 to BRD-26)
are specified in section 16.9 so that the brand model, intake process,
compliance checks and client workflow can be read in one place.

<span id="sec_69" class="anchor"></span>9. Non-Functional Requirements

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
| Confidentiality (client brands) | Client materials are processed only as allowed by the brand's confidentiality tier; cloud AI services are restricted for NDA and restricted projects (section 16.11). | LLM router policy test; no client files in shared repositories. |
| Brand isolation | Assets, catalogs, prompts and outputs of one brand are never available to another brand's render. | Path check in the asset loader; separate repositories or submodules per client (section 16.3). |

<span id="sec_70" class="anchor"></span>10. Quality Standard: The
Agency-Grade Rubric

Every release is scored out of 100 by (1) a vision-model critique
against style frames and (2) the owner. The target is **85 or more for
hero films and 80 or more for feature videos**. Any hard-fail condition
rejects the video regardless of score.

<span id="sec_71" class="anchor"></span>10.1 Scorecard

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

<span id="sec_72" class="anchor"></span>10.2 Hard-fail conditions

- Broken or clipped Devanagari glyphs in any frame.

- Text outside the safe zone on 9:16 deliveries, or overflowing its
  container.

- Loudness more than 1 LU from target, or clipping.

- An asset without a logged license, or any forbidden-license item.

- A roadmap feature presented as live.

- Visible flicker, banding or dropped frames.

- Unreviewed copy or audio in any delivered language (for BharatQR:
  Hindi and Marathi).

<span id="sec_73" class="anchor"></span>10.3 Review gates

| **Gate** | **Artifact reviewed** | **Reviewer** |
|----|----|----|
| G1 Style frames | 5-8 stills | Owner |
| G2 Animatic | Rough timing with scratch voice, boxes for visuals | Owner and critique agent |
| G3 Picture lock | Full visuals, temporary sound | Owner and critique agent (rubric) |
| G4 Sound lock | Final mix and captions | Owner, plus a native speaker for each delivered language |
| G5 Release QA | Final deliverables and manifest | Automated QA, then owner |

<span id="sec_74" class="anchor"></span>10.4 Scoring in Multi-Brand Mode

For client brands the final score is **0.9 x base score + brand fidelity
(0 to 10)**, so the maximum stays 100. Brand fidelity awards: identity
and logo rules 3, color and typography 3, motion and sound personality
match 2, messaging and tone 2. Brand-compliance hard fails (section
16.7) reject a video regardless of score.

<span id="sec_75" class="anchor"></span>11. Hero Film Specification:
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

<span id="sec_76" class="anchor"></span>11.1 Beat sheet

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

<span id="sec_77" class="anchor"></span>11.2 Hero film production
checklist

- Approve concept and style frames (G1); write catalog entries and
  transcreated copy; native review.

- Record or synthesize scratch voice; build the animatic (G2).

- Shoot or source footage plates (a day at a real cafe); log releases.

- Build Blender hero shots (phone, standee, printer) and export.

- Assemble in Remotion; run critique loop to picture lock (G3).

- Design sonic palette and sonic logo; final voice; mix (G4).

- Supersampled render, grade, encodes, captions, manifest, QA (G5).

<span id="sec_78" class="anchor"></span>12. AI Agent Operating Model

<span id="sec_79" class="anchor"></span>12.1 Roles

| **Role** | **Responsibility** | **Inputs** | **Outputs** |
|----|----|----|----|
| Director | Concept, thesis, storyboard, hook variants | Brief, references, catalog | Concept doc, beat sheet |
| Art-director critic | Judges stills against style frames and rubric | Rendered stills, style frames, rubric | Scores and fix list (JSON) |
| Motion engineer | Writes components, scenes and compositions to spec | Cue sheet, tokens, guidelines | Typed code, previews |
| 3D artist | R3F scenes and Blender scripts | Beat sheet, camera plan | GLB, image sequences, scene code |
| Brand analyst (Multi-Brand Mode) | Reads the intake, runs the completeness check, builds and validates brand.json, flags gaps and conflicts | Filled Brand Intake Document, attachments | Validated brand profile, missing-items list |
| Localization editor | Transcreation, glyph and length checks | English copy, tone guide | Locked copy in every brand language |
| Sound editor | Palette, SFX placement, mix, ducking | Locked picture, cue sheet | Final audio, loudness report |
| QA engineer | Runs automated checks and regression | Renders, manifest | QA report, pass or fail |
| Render operator | Batch rendering, finishing, packaging | Locked compositions | Deliverables, manifest |

One underlying agent (Claude Code or Antigravity) can play each role in
turn, loading the matching skill. The roles exist so each task has a
clear contract, not to imply separate systems.

<span id="sec_80" class="anchor"></span>12.2 Staged prompting framework

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
> Output: a Cue Sheet JSON that validates against src/schema/catalog.ts
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

<span id="sec_81" class="anchor"></span>12.3 Governance

- Agents never change tokens, rubric or guidelines without an approved
  decision-log entry.

- New features require a written plan and owner approval before code.

- Each task ends with real test and render output, not a claim that it
  compiles.

- If an agent is unsure about a package, license or API, it must verify
  rather than guess.

<span id="sec_82" class="anchor"></span>13. Build Roadmap (Dependency
Order)

Phases are ordered by dependency. With agent-driven development, several
phases can proceed in parallel once their prerequisites are met.

| **Phase** | **Scope** | **Deliverables** | **Exit criteria** |
|----|----|----|----|
| 0 Foundations | Repo, Remotion setup, pinned versions, tokens skeleton, guidelines, CLAUDE.md, license register, package verification | Running Studio, lint rules, LICENSES.md, assets-manifest.json, first 8 skills | Hello-world composition renders deterministically |
| 1 The Brain | Schemas in src/schema/, the brands/ folder with \_template/ and bharatqr/, product.json, features.json (15 seed features), locale workflow | Validated catalog, native-reviewed EN, HI, MR copy for first features | Catalog gate blocks incomplete features |
| 2 Components | UI clones, device frames, cursor, charts, Storybook | Story for every clone; mock-data fixtures | Brand-color swap test passes |
| 3 Scene engine | Scene templates, transitions, composition registry, first feature reel (EN) | One complete 20 s reel | Rubric 70+ on first pass |
| 4 Audio | VO pipeline, Whisper sync, captions, SFX palette, ducking, mastering | Fully mixed reel in 3 languages | Loudness and sync checks pass |
| 5 Cinema | Camera rig, lens effects, grain, LUT, motion blur, 3D kit, physics, Blender pipeline | 3D hero prop shots; cinematic reel | Rubric 80+ on a feature reel |
| 6 Localization at scale | All seed features in 3 languages; Devanagari QA suite | Batch of localized reels | Zero glyph defects |
| 7 QA automation | Critique loop, safe-zone, contrast, overflow, regression, determinism | QA report generator | Release blocked by any hard fail |
| 8 Hero film | Soundbox film with footage plates, Blender shots, designed sound, grade | 60 s and 30 s hero cuts in all formats | Rubric 85+ |
| 9 Product features | Tenant personalization, owner recap, Player embed, festival templates, signage | Working personalized renders and in-app Player | Tenant video renders from live data snapshot |
| 10 Automation | Playwright capture, release-note videos, A/B variants | One-command release clip | Zero manual steps for a release video |
| 11 Multi-Brand Mode | Brand Intake pipeline, completeness check, extraction, studio defaults, brand lock, theme provider, brand-compliance QA, approval records, LLM router, second-brand pilot | Working brand:new, brand:validate, intake ingestion, compliance report, one pilot client brand | A new brand goes from filled intake to approved style frames with no engine code changes |

<span id="sec_83" class="anchor"></span>14. Risks and Mitigations

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
| Client data or assets leak between brands | Confidentiality breach, loss of trust | One repository or submodule per client, separate .env, asset-loader path check, no shared prompts containing client data (BRD-22). |
| Client confidential material sent to a free cloud AI tier | Data used to improve a vendor's products; breach of NDA | Confidentiality tiers in brand.json and an LLM router that blocks free cloud tiers for NDA and restricted brands (BRD-20). |
| Intake is incomplete or wrong, so the video misrepresents the brand | Rework, client dissatisfaction | Completeness gate, provenance tags, human review, brand lock and approval pack before production. |
| Client brand misinterpreted by agents | Off-brand output | BRAND.md plus tokens as the only brand source; brand-compliance checks BC-01 to BC-15; style-frame approval. |
| Client supplies assets they do not own or have not licensed | Legal exposure for both parties | Asset ownership and licence fields in the intake; warranty clause in the contract; unlogged assets blocked. |
| Unlimited revisions and scope creep | Unpaid work, delays | Revision rounds stored in brand.json; change requests after brand lock (section 16.10). |
| Remotion license obligation for client work is misjudged | Compliance gap or unexpected cost | Re-read the license FAQ for agencies, count combined headcount, and confirm in writing with Remotion if unclear (section 15.4). |

<span id="sec_84" class="anchor"></span>15. Licensing and Compliance
Register

This section summarizes licensing posture. It is guidance, not legal
advice; verify each license at the source before first use and again
before commercial release.

<span id="sec_85" class="anchor"></span>15.1 Remotion

- Remotion is free for individuals, for-profit organizations of up to
  **three people**, and non-profits, including commercial use, unlimited
  videos and self-hosted cloud rendering. There is no functional
  difference between free and paid versions. Any commercial use is
  allowed as long as Remotion itself is not sold as a product or used to
  let others avoid a license they would need.

- A Company License is required for entities that are not eligible for
  the free license (four or more people). When last checked
  (October 2026) the Company License had two options: **Remotion for
  Creators at about \$25 per developer seat per month**, and **Remotion
  for Automators at \$0.01 per render with a \$100 per month minimum**;
  an Enterprise tier started at a \$500 per month minimum. One source
  also described a \$100 per month minimum for seats, so confirm exactly
  which minimum applies to your option on the official pricing page.

- The threshold depends on headcount, not revenue. For collaborations
  between teams or companies, the combined headcount counts. Remotion's
  FAQ says the responsibility for the license falls on the entity that
  ultimately owns the output or the IP of the Remotion project (the
  wording varies between pages), so ownership terms in client contracts
  matter.

- Free License users may build automations without buying renders; the
  Automators minimum applies only to Company License users.

- The repository notes that license terms will change slightly in
  **Remotion 5.0**. Re-read the license when upgrading.

- The free license forbids selling Remotion itself or a derivative of
  it.

<span id="sec_86" class="anchor"></span>15.2 License families in this
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

<span id="sec_87" class="anchor"></span>15.3 Compliance practices

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

<span id="sec_88" class="anchor"></span>15.4 Licensing when producing
videos for clients

Client work adds obligations beyond personal use. The checklist is in
section 16.12. In short: (1) decide **who owns the Remotion project code
and who owns the delivered videos**, because Remotion's license
responsibility follows ownership; (2) count the combined headcount of
everyone collaborating on the work, including the client's people if
they own the project; (3) if there is any doubt, ask Remotion in writing
before charging a client; (4) never pass on music, stock, font or voice
licenses that are not transferable; (5) obtain a signed asset-ownership
warranty from the client.

<span id="sec_89" class="anchor"></span>16. Multi-Brand (Client) Mode

<span id="sec_90" class="anchor"></span>16.1 Purpose and scope

The studio is built first for BharatQR, but nothing in the engine has to
be specific to one brand. Multi-Brand Mode makes that explicit: a brand
becomes **data** (a validated Brand Profile plus a Brand Kit folder),
and the same engine, tokens, scenes, audio pipeline and QA produce
videos for any number of brands.

| **Mode** | **What it means** | **Example** |
|----|----|----|
| Product mode (default) | One brand, owned by the studio operator. | BharatQR feature Reels and hero film |
| Studio mode (Multi-Brand) | Several brands or clients, each in an isolated Brand Kit with its own profile, assets, approvals and confidentiality tier. | A cafe chain, a clothing label, a coaching institute |

| **In scope** | **Out of scope** |
|----|----|
| Brands that can supply the Brand Intake Document (section 16.8) and the required assets | Brands that cannot supply a minimal intake or whose assets have no clear rights |
| Software products (UI cloning), physical products and services (photos, 3D, footage), service businesses (testimonials) | Regulated claims (health, finance, legal) without the client's written sign-off on every claim |
| Videos in any language set the brand defines, with native review | Languages with no native reviewer available |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>What the existing PRD already covers</strong></p>
<p>Sections 1 to 15 already describe the engine, tokens, scenes, audio,
QA, hero film process and licensing. Multi-Brand Mode adds: the Brand
Profile schema, the Brand Intake Document and its pipeline, bounded
brand token overrides, brand-compliance QA, a client workflow with
approvals, confidentiality tiers with an LLM routing policy, and
client-work licensing and contract guidance.</p></td>
</tr>
</tbody>
</table>

<span id="sec_91" class="anchor"></span>16.2 Principles

- **Brand as data.** The engine contains no brand literals. Colors,
  fonts, names, copy and rules come from brand.json and the brand's
  catalog.

- **Isolation.** One brand's assets, prompts, catalog and outputs are
  never available to another brand's render.

- **Provenance.** Every value is tagged provided, derived or assumed.
  Assumed values are shown to the client for confirmation at style-frame
  approval.

- **Lock before production.** A brand moves from draft to review to
  locked. Production uses a locked version, and every render records the
  brand version and hash.

- **Compliance as a gate.** Brand-compliance checks (section 16.7) run
  with the standard QA and can block a release.

- **Humans approve.** Agents extract, build and check; a person confirms
  the brand lock, style frames, language review and final release.

- **Confidentiality tiers.** The brand's tier decides which AI services
  may touch its material (section 16.11).

- **Stricter, never looser.** A brand may tighten house rules (safe
  zones, contrast, text-hold). It may not relax them.

<span id="sec_92" class="anchor"></span>16.3 Folder structure and
isolation

> brands/
>
> ├── \_template/ \# copied by \`npm run brand:new \<id\>\`
>
> └── \<brand-id\>/
>
> ├── intake/ \# filled Brand Intake Document and raw client files
>
> ├── brand.json \# validated Brand Profile (section 16.4)
>
> ├── BRAND.md \# agent-readable brief generated from brand.json
>
> ├── catalog/ \# product.json, features.json, tenants/
>
> ├── ui/ \# screenshots, component specs, cloned components
>
> ├── assets/ \# logos, fonts, images, footage, music, sfx, voiceovers
>
> ├── voice/ \# pronunciation.json, scripts, voice releases
>
> ├── compliance/ \# claims register, disclaimers, legal notes
>
> ├── assets-manifest.json \# source, owner and license of every asset
>
> ├── approvals/ \# style-frame, picture, sound and release sign-offs
>
> └── CHANGELOG.md \# brand profile versions and change requests

- **Separate repository per client** (private), or a git submodule under
  brands/, so client files never enter the shared engine repository or
  another client's history.

- **Assets reach Remotion through a sync script.** scripts/sync-brand.ts
  copies the active brand's assets/ into remotion-video/public/brand/
  (gitignored) before Studio or a render, because staticFile() reads
  from the public directory. Remotion also offers a public-directory
  option on the CLI; verify it for the pinned version before relying on
  it.

- **Loader path check.** The asset loader rejects any path that resolves
  outside the active brand's folder or the shared engine assets.

- **Separate .env per brand** for any keys; nothing secret in
  brand.json.

- **Outputs** are written to out/\<brand\>/\<language\>/\<format\>/ and
  never mixed.

<span id="sec_93" class="anchor"></span>16.4 The Brand Profile
(brand.json)

brand.json is the single machine-readable description of a brand. The
schema below was written for this PRD, type-checked with strict
TypeScript and validated against the example in Appendix G on zod 4.x.
Languages use BCP-47 style codes (en, hi, mr); the extraction step
converts names such as 'Marathi' to codes.

> // src/schema/brand.ts (Brand Profile, schema version 1.0)
>
> import { z } from 'zod';
>
> const Hex = z.string().regex(/^#\[0-9a-fA-F\]{6}\$/);
>
> const Str = z.string().min(1);
>
> const Lang =
> z.string().regex(/^\[a-z\]{2,3}(-\[A-Za-z0-9\]{2,8})\*\$/); // 'en',
> 'hi', 'mr', ...
>
> const PerLang = z.record(Lang, z.string());
>
> const Availability = z.enum(\['live', 'beta', 'roadmap'\]);
>
> const Source = z.enum(\['provided', 'derived', 'assumed'\]);
>
> const Contact = z.object({
>
> name: Str, role: Str, email: z.string().optional(), phone:
> z.string().optional(),
>
> isApprover: z.boolean(),
>
> });
>
> const Persona = z.object({
>
> name: Str, description: Str, ageRange: z.string().optional(),
>
> languages: z.array(Str).min(1), techComfort: z.enum(\['low', 'medium',
> 'high'\]),
>
> channels: z.array(Str), pains: z.array(Str), desires: z.array(Str),
>
> objections: z.array(Str),
>
> });
>
> const Logo = z.object({
>
> name: Str, file: Str, background: z.enum(\['light', 'dark', 'any',
> 'brand'\]),
>
> minWidthPx: z.number().int().positive(), clearSpace: Str,
>
> });
>
> const FontRole = z.object({
>
> role: z.enum(\['display', 'heading', 'body', 'ui', 'numerals',
> 'accent'\]),
>
> script: z.enum(\['latin', 'devanagari', 'other'\]),
>
> family: Str, weights: z.array(z.number().int()).min(1),
>
> source: z.enum(\['google', 'client-licensed', 'system', 'custom'\]),
>
> licenseStatus: z.enum(\['open', 'client-licensed', 'unknown'\]),
>
> fallbacks: z.array(Str),
>
> });
>
> export const Brand = z.object({
>
> schemaVersion: z.literal('1.0'),
>
> id: z.string().regex(/^\[a-z0-9-\]+\$/),
>
> displayName: Str, legalName: z.string().optional(),
>
> status: z.enum(\['draft', 'review', 'locked'\]),
>
> version: Str, lockedOn: z.string().optional(),
>
> project: z.object({
>
> goal: Str, deadline: z.string().optional(), deliverables:
> z.array(Str).min(1),
>
> successMeasures: z.array(Str),
>
> }),
>
> contacts: z.array(Contact).min(1),
>
> business: z.object({
>
> industry: Str, offering: Str, usp: z.array(Str).min(1), markets:
> z.array(Str),
>
> stage: z.string().optional(), pricePosition: z.string().optional(),
>
> competitors: z.array(Str),
>
> }),
>
> audience: z.object({ primary: Persona, secondary: Persona.optional()
> }),
>
> strategy: z.object({
>
> mission: z.string().optional(), values: z.array(Str),
>
> positioning: Str, personality: z.array(Str).min(3).max(5), notThis:
> z.array(Str),
>
> taglines: PerLang, story: z.string().optional(),
>
> }),
>
> identity: z.object({
>
> logos: z.array(Logo).min(1), logoDonts: z.array(Str),
>
> animatedLogoFile: z.string().optional(),
>
> }),
>
> colors: z.object({
>
> primary: Hex, secondary: Hex.optional(), accent: Hex.optional(),
>
> neutrals: z.array(Hex), background: z.object({ light: Hex, dark: Hex
> }),
>
> semantic: z.object({ success: Hex, warning: Hex, error: Hex, info: Hex
> }).partial(),
>
> usageRatio: z.string().optional(), gradientsAllowed: z.boolean(),
>
> gradients: z.array(z.object({
>
> name: Str, stops: z.array(Hex).min(2), angle: z.number(),
>
> })),
>
> forbidden: z.array(Str), contrastMin: z.number().min(4.5),
>
> }),
>
> typography: z.object({
>
> families: z.array(FontRole).min(1), scale: z.record(z.string(),
> z.number()),
>
> caseRules: z.string(), letterSpacingLatin: z.number(),
>
> devanagariLineHeightMin: z.number().min(1.4),
>
> }),
>
> layout: z.object({
>
> grid: z.object({ columns: z.number().int(), margin: z.number(),
> gutter: z.number() }),
>
> radii: z.object({ small: z.number(), medium: z.number(), large:
> z.number() }),
>
> shadows: z.string(), borders: z.string(), spacingUnit: z.number(),
>
> iconStyle: z.enum(\['outline', 'solid', 'duotone', 'custom'\]),
>
> patterns: z.array(Str),
>
> }),
>
> imagery: z.object({
>
> photoStyle: z.string(), illustrationStyle: z.string(), colorGrade:
> z.string(),
>
> subjects: z.array(Str), avoid: z.array(Str),
>
> mascot: z.object({
>
> exists: z.boolean(), file: z.string().optional(), rules:
> z.string().optional(),
>
> }),
>
> }),
>
> productUI: z.object({
>
> hasSoftwareProduct: z.boolean(),
>
> platforms: z.array(z.enum(\['web', 'ios', 'android', 'desktop'\])),
>
> theme: z.enum(\['light', 'dark', 'both'\]), designSystemRef:
> z.string().optional(),
>
> fontsInUI: z.array(Str),
>
> screens: z.array(z.object({
>
> key: Str, name: Str, availability: Availability,
>
> screenshot: z.string().optional(), blurRules: z.string().optional(),
>
> })),
>
> sampleDataRules: z.string(),
>
> }),
>
> offering: z.object({
>
> items: z.array(z.object({
>
> name: Str, price: z.string().optional(), photo: z.string().optional(),
>
> })),
>
> locations: z.array(Str), packaging: z.string().optional(),
>
> }),
>
> motion: z.object({
>
> personality: z.enum(\['calm', 'confident', 'playful', 'energetic',
> 'premium-minimal'\]),
>
> pace: z.enum(\['slow', 'medium', 'fast'\]),
>
> easingFeel: z.enum(\['soft', 'snappy', 'bouncy', 'mechanical'\]),
>
> cameraStyle: z.enum(\['static', 'gentle-drift', 'dynamic'\]),
>
> allowedTransitions: z.array(Str), forbiddenTransitions: z.array(Str),
>
> use3D: z.boolean(), useCharacters: z.boolean(),
>
> textAnimation: z.enum(\['word', 'line', 'fade'\]),
> maxSimultaneousText: z.number().int(),
>
> }),
>
> sound: z.object({
>
> music: z.object({
>
> moods: z.array(Str), bpmRange: z.tuple(\[z.number(), z.number()\]),
>
> instruments: z.array(Str), avoid: z.array(Str), licensedTracks:
> z.array(Str),
>
> }),
>
> sfxStyle: z.string(), sonicLogoFile: z.string().optional(),
>
> voice: z.object({
>
> persona: Str, gender: z.enum(\['female', 'male', 'neutral', 'any'\]),
>
> ageFeel: z.string(), accent: z.string(), pace: z.enum(\['slow',
> 'medium', 'fast'\]),
>
> cloningConsentOnFile: z.boolean(),
>
> }),
>
> forbiddenSounds: z.array(Str),
>
> }),
>
> localization: z.object({
>
> languages: z.array(Lang).min(1), primaryLanguage: Lang,
>
> formality: z.enum(\['formal', 'neutral', 'casual'\]),
>
> transcreate: z.boolean(), loanwordPolicy: z.string(),
>
> numberLocale: Str, currency: Str, dateFormat: z.string(),
>
> glossary: z.array(z.object({
>
> term: Str, translations: PerLang, doNotTranslate: z.boolean(),
>
> })),
>
> pronunciations: z.array(z.object({ term: Str, lang: Lang, say: Str
> })),
>
> brandNameByLanguage: PerLang, reviewers: z.array(Str),
>
> }),
>
> messaging: z.object({
>
> pillars: z.array(Str).max(4),
>
> proofPoints: z.array(z.object({
>
> claim: Str, evidence: Str, sourceRef: z.string().optional(), approved:
> z.boolean(),
>
> })),
>
> allowedClaims: z.array(Str), prohibitedClaims: z.array(Str),
>
> disclaimers: z.array(z.object({ text: Str, whenRequired: Str })),
>
> ctas: z.array(z.object({ text: PerLang, destination: Str })),
>
> handles: z.array(Str), hashtags: z.array(Str),
>
> }),
>
> references: z.object({
>
> likes: z.array(z.object({ ref: Str, why: Str })),
>
> dislikes: z.array(z.object({ ref: Str, why: Str })),
>
> }),
>
> deliverables: z.object({
>
> formats: z.array(z.enum(\['9:16', '4:5', '1:1', '16:9'\])),
>
> durationsSeconds: z.array(z.number()), quantity: z.number().int(),
>
> platforms: z.array(Str), burnedCaptions: z.boolean(), languages:
> z.array(Lang),
>
> }),
>
> assets: z.object({
>
> provided: z.array(z.object({
>
> type: Str, path: Str, owner: z.enum(\['client', 'third-party',
> 'studio'\]),
>
> licenseNote: z.string().optional(),
>
> })),
>
> missing: z.array(Str),
>
> }),
>
> compliance: z.object({
>
> regulations: z.array(Str), testimonialConsentOnFile: z.boolean(),
>
> trademarkNotes: z.string().optional(),
>
> aiDisclosure: z.enum(\['none', 'label-synthetic-voice',
> 'label-all-ai'\]),
>
> usageRights: z.object({
>
> territory: Str, durationMonths: z.number().int().optional(),
> paidMedia: z.boolean(),
>
> }),
>
> forbiddenTopics: z.array(Str), competitorMentionAllowed: z.boolean(),
>
> }),
>
> workflow: z.object({
>
> approvers: z.array(Str).min(1), revisionRounds: z.number().int(),
>
> reviewTool: z.string().optional(), signoffFormat: z.enum(\['email',
> 'signed-form', 'tool'\]),
>
> confidentiality: z.enum(\['standard', 'nda',
> 'restricted-local-llm-only'\]),
>
> }),
>
> provenance: z.record(z.string(), Source), // dotted path -\> provided
> \| derived \| assumed
>
> });
>
> export type Brand = z.infer\<typeof Brand\>;

**Intake sections and the profile keys they feed.** Every key in the
schema is fed by at least one intake question, and every required key is
covered by a required or conditional question or by a studio default.
This was checked programmatically against the example profile (see
section 16.8).

| **Section** | **Intake topic** | **Profile keys fed** | **Questions** | **What it drives** |
|----|----|----|----|----|
| S0 | Project and Contacts | displayName, legalName, project, contacts | 9 | Credits, on-screen name, file naming; Credits and fine print |
| S1 | Business and Competition | business | 9 | Positioning, copy and competitor-aware creative |
| S2 | Audience | audience | 11 | Hooks, language, pacing, channel choices |
| S3 | Brand Strategy and Personality | strategy | 8 | Tone, taglines, personality scoring |
| S4 | Logo | identity | 7 | Logo component rules; checks BC-01 and BC-02 |
| S5 | Colour | colors | 12 | Theme palette; checks BC-03 and BC-05 |
| S6 | Typography | typography | 10 | Font loading, text fitting; check BC-04 |
| S7 | Layout, Shape and Icon Style | layout | 7 | Component radii, spacing, icon style |
| S8 | Imagery, Illustration and Characters | imagery | 8 | Footage, illustration and mascot decisions |
| S9 | Software or App Product (only if you have one) | productUI | 12 | UI clones, availability labels, blur rules |
| S10 | Physical Products, Services and Locations (only if relevant) | offering | 4 | Product, service and location scenes |
| S11 | Motion Preferences | motion | 11 | Bounded token overrides, transitions, camera |
| S12 | Music, Sound and Voice | sound | 14 | Music, SFX, voice, forbidden sounds; check BC-10 |
| S13 | Languages and Localisation | localization | 12 | Language set, glossary, number format, reviewers; check BC-11 |
| S14 | Messaging, Claims and Calls to Action | messaging | 11 | Copy, claims, disclaimers, CTAs; checks BC-06 and BC-07 |
| S15 | References and Inspiration | references | 3 | Reference analysis and critique |
| S16 | Video Requirements | deliverables | 7 | Composition matrix and batch manifest |
| S17 | Assets You Will Provide | assets | 5 | Asset manifest and provenance; check BC-12 |
| S18 | Legal, Rights and Compliance | compliance | 9 | Rights, AI disclosure, forbidden topics; check BC-14 |
| S19 | Approvals and Working Process | workflow | 6 | Approvals, revision rounds, confidentiality tier |

<span id="sec_94" class="anchor"></span>16.5 Intake pipeline

| **Stage** | **Action** | **Output** | **Gate** |
|----|----|----|----|
| 1 Collect | Client fills the Brand Intake Document and sends the files it lists (logos, fonts, screenshots, references). | brands/\<id\>/intake/ | All files readable |
| 2 Completeness check | Deterministic script lists every unanswered required question by ID and computes two scores: **completeness** (required questions answered divided by required questions applicable) and **richness** (optional questions answered). | Missing-items list | Completeness must be 100 percent to lock |
| 3 Extract | An LLM, routed by the confidentiality tier (section 16.11), maps answers to profile fields using the intake IDs. It returns an envelope with the profile, provenance, missing items and conflicts (Appendix H). It must not invent values. | Draft brand.json | Zod validation, up to 3 retries, then a person fixes it |
| 4 Apply studio defaults | Code (not the LLM) fills unanswered optional fields with the defaults below and tags them assumed. | Complete profile | Schema passes |
| 5 Human review | A person reads the profile against the intake, resolves conflicts, confirms or edits assumed values, and sets status: review. | Reviewed profile | No unresolved conflicts |
| 6 Client confirmation | The client receives an approval pack (palette, type specimens in each script, logo rules, assumed values, claims list). | Signed confirmation | Written approval |
| 7 Lock | Status becomes locked, version and lockedOn are set, BRAND.md and theme tokens are generated. | Locked brand | Lock refused if required fields are open |
| 8 Style frames | 5 to 8 stills built from the locked profile, approved by the client (gate G1). | Approved style frames | Client approval |

**Language names to codes.** The client writes language names; the
extraction step converts them to codes (English en, Hindi hi, Marathi
mr, and so on) and lists any it cannot map as a conflict.

**Studio defaults for unanswered optional questions.** These values are
applied by code and always tagged assumed, so the client sees them at
confirmation.

| **Profile field**             | **Default value**                          |
|-------------------------------|--------------------------------------------|
| typography.letterSpacingLatin | 0                                          |
| layout.grid                   | {"columns":12,"margin":64,"gutter":24}     |
| layout.radii                  | {"small":8,"medium":16,"large":28}         |
| layout.shadows                | "Soft, low-contrast, large blur"           |
| layout.borders                | "1 px hairline at low opacity"             |
| layout.spacingUnit            | 8                                          |
| layout.patterns               | \[\]                                       |
| imagery.colorGrade            | "Neutral grade with restrained saturation" |
| motion.allowedTransitions     | \["fade","slide"\]                         |
| motion.forbiddenTransitions   | \[\]                                       |
| motion.maxSimultaneousText    | 3                                          |
| sound.music.bpmRange          | \[90,115\]                                 |
| sound.music.instruments       | \[\]                                       |
| sound.music.licensedTracks    | \[\]                                       |
| sound.sfxStyle                | "Soft, tactile UI sounds in the music key" |
| sound.voice.ageFeel           | "30s"                                      |
| localization.glossary         | \[\]                                       |
| messaging.handles             | \[\]                                       |
| messaging.hashtags            | \[\]                                       |

<span id="sec_95" class="anchor"></span>16.6 From brand profile to
engine tokens

The theme provider turns the profile into the tokens scenes already use.
Brand values never reach scenes as raw numbers; they pass through the
mapping below and are clamped to the allowed ranges.

| **Profile field** | **Mapping (starting values, tunable during style-frame review)** |
|----|----|
| motion.personality = calm | Bias to SPRING_HEAVY and SPRING_HERO, longer stagger, fewer simultaneous elements |
| motion.personality = confident | SPRING_MEDIUM and SPRING_HEAVY, standard stagger, clean settles |
| motion.personality = playful | SPRING_LIGHT with slightly lower damping (more overshoot), shorter holds |
| motion.personality = energetic | SPRING_LIGHT, shorter durations, faster cuts, stronger snap easing |
| motion.personality = premium-minimal | SPRING_HEAVY and SPRING_HERO, generous negative space, very restrained effects |
| motion.pace = slow / medium / fast | Duration multiplier 1.25 / 1.0 / 0.8 |
| motion.easingFeel = soft / snappy / bouncy / mechanical | HOUSE_EASE / SNAP_EASE / lower damping with overshoot / near-linear easing without overshoot |
| motion.cameraStyle = static / gentle-drift / dynamic | No drift / low-amplitude seeded drift / drift plus push-ins and orbit moves |
| colors.\* | Theme palette; text color chosen to meet contrastMin; forbidden colors rejected by validation of scenes |
| typography.families | Font loading per script; fitText boxes; Devanagari line-height at least devanagariLineHeightMin |
| layout.\* | Card radii, spacing unit, grid, shadow and border style, icon set |

Bounded overrides

| **Token** | **Allowed range** | **House default** |
|----|----|----|
| Spring damping | 8 to 30 | 14 (SPRING_MEDIUM) |
| Spring stiffness | 60 to 220 | 120 |
| Spring mass | 0.4 to 1.8 | 0.8 |
| Stagger | 2 to 8 frames | 3 to 5 frames |
| Duration multiplier (pace) | 0.7 to 1.4 | 1.0 |
| Grain opacity | 0 to 5 percent | 3 to 4 percent |
| Text hold | Never below the house floor (36 frames plus 8 per word beyond four); brands may only lengthen it | House floor |
| Safe zones | Brands may enlarge, never shrink | Per format (section 8.10) |
| Text contrast | At least 4.5:1 for body text (contrastMin cannot be set lower) | 4.5:1 body, 3:1 large text |
| Devanagari rules | Line-height at least 1.4; no letter-spacing; never animate by character | Fixed |

<span id="sec_96" class="anchor"></span>16.7 Brand-compliance checks

These checks run with the standard QA gate (section 8.12) whenever a
video is built from a client brand. A hard fail blocks release.

| **ID** | **Check** | **Method** | **Severity** |
|----|----|----|----|
| BC-01 | Logo clear space and minimum size respected | Geometry check from the logo component's rendered bounds against identity.logos | Hard fail |
| BC-02 | Logo version used on an allowed background | Sample background luminance behind the logo on key frames | Hard fail |
| BC-03 | Colors conform to the brand palette; no forbidden colors | Dominant-color sampling on key frames against colors | Hard fail for forbidden colors, warning for drift |
| BC-04 | Only approved fonts are used | Computed-style scan of rendered text against typography.families | Hard fail |
| BC-05 | Text contrast meets contrastMin | Contrast calculation per text element | Hard fail |
| BC-06 | No prohibited claims or forbidden topics in any language | Deterministic phrase match plus an LLM semantic check on on-screen text and voiceover scripts | Hard fail |
| BC-07 | Required disclaimers present when their condition applies | Rule engine over messaging.disclaimers and scene metadata | Hard fail |
| BC-08 | Roadmap and beta features labeled | Scene metadata against productUI.screens\[\].availability | Hard fail |
| BC-09 | Tone matches brand personality | LLM scoring against strategy.personality and strategy.notThis | Warning |
| BC-10 | Sound rules: no forbidden sounds; music licensed or logged; loudness on target | Manifest audit plus loudness analysis | Hard fail |
| BC-11 | Every delivered language has a recorded native reviewer approval | Check localization.reviewers against approval records | Hard fail |
| BC-12 | Every asset has an owner and, if third-party, a license note | Brand assets-manifest.json audit | Hard fail |
| BC-13 | Formats, durations and captions match deliverables | Render manifest against the profile | Hard fail |
| BC-14 | Competitor mention rule respected | Text and logo scan against business.competitors and compliance.competitorMentionAllowed | Hard fail |
| BC-15 | Render manifest records brand version, brand hash and engine version | Manifest check | Hard fail |

<span id="sec_97" class="anchor"></span>16.8 The Brand Intake Document

A separate Word document, **Brand_Intake_Template.docx**, is sent to
each client. It is written in plain language for a non-technical reader
and organized into **20 sections with 175 numbered questions** (107
required, 14 conditional, 54 optional). Each question has an ID such as
S5-03, a hint or example, a priority, and a blank answer cell.

- **Required (R):** needed to lock the brand.

- **Conditional (C):** required only if it applies, for example the
  software-product section.

- **Optional (O):** improves quality; if left blank, the studio applies
  a documented default and tags it assumed.

- **Machine mapping:** each question ID maps to one or more Brand
  Profile paths (Appendix F), so the extraction step is traceable and
  the completeness check is deterministic.

- **Verified consistency:** a script compared the question list to a
  fully populated example profile and confirmed that every profile field
  is fed by at least one question, every question path exists in the
  profile, and every required field is covered by a required or
  conditional question or a studio default.

| **Section** | **Topic** | **Who usually answers** |
|----|----|----|
| S0 | Project and Contacts | Project owner |
| S1 | Business and Competition | Founder or marketing lead |
| S2 | Audience | Marketing or sales lead |
| S3 | Brand Strategy and Personality | Founder or brand lead |
| S4 | Logo | Designer or brand lead |
| S5 | Colour | Designer or brand lead |
| S6 | Typography | Designer or brand lead |
| S7 | Layout, Shape and Icon Style | Designer |
| S8 | Imagery, Illustration and Characters | Brand lead |
| S9 | Software or App Product (only if you have one) | Product owner |
| S10 | Physical Products, Services and Locations (only if relevant) | Business owner |
| S11 | Motion Preferences | Brand lead |
| S12 | Music, Sound and Voice | Brand lead |
| S13 | Languages and Localisation | Marketing lead and language reviewer |
| S14 | Messaging, Claims and Calls to Action | Marketing lead |
| S15 | References and Inspiration | Brand lead |
| S16 | Video Requirements | Marketing lead |
| S17 | Assets You Will Provide | Project owner |
| S18 | Legal, Rights and Compliance | Founder or legal advisor |
| S19 | Approvals and Working Process | Project owner |

**Supporting files the client sends:** logo files, brand guideline PDF,
font files with licenses, product screenshots or recordings, product and
location photos, reference videos, any existing music, voice or
animation, and the signed releases listed in Section S17 of the intake.

<span id="sec_98" class="anchor"></span>16.9 Multi-brand requirements
(BRD)

| **ID** | **Requirement** | **Acceptance criteria** | **Tier** |
|----|----|----|----|
| BRD-01 | npm run brand:new \<id\> creates a brand folder from \_template. | A valid empty structure appears; the id is validated. | T1 |
| BRD-02 | npm run brand:validate \<id\> validates brand.json against the schema. | Errors list the exact path and rule that failed. | T0 |
| BRD-03 | Intake ingestion accepts the filled intake (Word or exported Markdown or JSON) plus an attachments folder. | Answers are parsed by question ID; unparseable items are reported. | T1 |
| BRD-04 | Completeness check lists unanswered required questions by ID and reports completeness and richness scores. | Locking is refused below 100 percent completeness. | T1 |
| BRD-05 | LLM-assisted extraction maps answers to profile fields using the envelope in Appendix H. | Output is valid JSON; invalid output is retried up to 3 times with the validation errors, then escalated to a person. | T1 |
| BRD-06 | Provenance tagging for every populated field. | Each field is provided, derived or assumed; assumed fields appear in the approval pack. | T1 |
| BRD-07 | Studio defaults are applied by code for unanswered optional questions. | The defaults table in 16.5 is the only source; no LLM-invented defaults. | T1 |
| BRD-08 | Human review gate and brand lock. | locked cannot be set while required fields are open or while assumed values in messaging, localization or compliance are unconfirmed. | T1 |
| BRD-09 | BRAND.md is generated deterministically from brand.json. | Same input yields the same file; narrative text is copied from client-provided fields, not invented. | T1 |
| BRD-10 | Brand theme provider supplies colors, typography, layout and motion tokens to the engine. | A lint rule fails any hardcoded hex color, font name or brand string in engine code. | T0 |
| BRD-11 | Font loader supports Google fonts via package and client-licensed fonts from the brand folder. | A client-licensed font without a recorded license is refused. | T1 |
| BRD-12 | Asset sync script and per-brand asset manifest. | Only the active brand's assets are present in public/brand/ during a render. | T1 |
| BRD-13 | Per-brand composition registry and output folders. | out/\<brand\>/\<language\>/\<format\>/ structure is produced by the batch renderer. | T1 |
| BRD-14 | Bounded token overrides (section 16.6). | Out-of-range values fail validation. | T2 |
| BRD-15 | Brand-compliance checks BC-01 to BC-15 integrated into the QA gate. | A hard fail blocks release and produces a report with frame references. | T1 |
| BRD-16 | Brand-fidelity scoring in the critique loop using the brand's style frames. | Score follows the formula in section 10.4. | T2 |
| BRD-17 | Approval pack generator. | Produces palette, type specimens per script, logo rules, assumed values and claims list for client sign-off. | T2 |
| BRD-18 | Brand and engine version stamping in render manifests. | Every output records brand version, brand hash and engine version. | T1 |
| BRD-19 | Change control after lock. | Edits create a new version and a CHANGELOG entry; videos built on older versions are flagged. | T2 |
| BRD-20 | Confidentiality enforcement by the LLM router. | NDA and restricted brands never reach a free cloud tier; restricted brands use local models only. | T1 |
| BRD-21 | LLM router with provider fallback chain, structured-output validation and logging. | Logs hold task, provider, token counts and an input hash, never raw client content or secrets. | T1 |
| BRD-22 | Isolation between brands. | Separate repositories or submodules, separate .env, loader path check; a cross-brand path is rejected. | T1 |
| BRD-23 | Client approval records. | Each approval stores date, approver, brand version and the hash of the approved file. | T1 |
| BRD-24 | Brand-defined languages and feature categories. | Language list comes from localization.languages; completeness of locale copy is checked against it (CAT-04). | T1 |
| BRD-25 | Engine contains no brand literals. | Automated scan finds no brand names, hex colors or copy in src/ outside tests and examples. | T1 |
| BRD-26 | Delivery and handover package. | One command assembles videos, caption files, thumbnails, manifest, credits, asset and license list and approval records. | T3 |

<span id="sec_99" class="anchor"></span>16.10 Client workflow

| **Step** | **Activity** | **Studio output** | **Client action** |
|----|----|----|----|
| 0 Discovery | Call to understand goals and scope | Scope note | Confirm scope |
| 1 Intake sent | Send the Brand Intake Document and file checklist | Intake package | Fill and return |
| 2 Completeness | Run the completeness check; list gaps by ID | Missing-items list | Answer gaps |
| 3 Profile build | Extract, apply defaults, human review | Draft brand profile | Answer conflicts |
| 4 Brand lock | Approval pack, then lock | Locked profile v1.0.0 | Sign confirmation |
| 5 Style frames (G1) | 5 to 8 stills | Style frames | Approve or revise |
| 6 Copy and language lock | Draft, transcreate, native review | Locked copy per language | Approve copy |
| 7 Animatic (G2) | Timing with scratch voice | Animatic | Approve |
| 8 Picture lock (G3) | Full visuals | Picture lock cut | Approve |
| 9 Sound lock (G4) | Final mix and captions | Sound lock cut | Approve |
| 10 Release QA (G5) | All checks, manifest | Final deliverables and QA report | Sign off |
| 11 Delivery | Delivery package and archive | Package (BRD-26) | Acknowledge receipt |

- **Revision rounds** come from workflow.revisionRounds. Feedback is
  collected per gate; feedback outside the current gate is a change
  request.

- **Change after lock** creates a new brand version and a CHANGELOG
  entry; the client confirms the change and any cost or schedule impact.

- **Approvals** are recorded per gate in approvals/ in the format set by
  workflow.signoffFormat.

- **Retention and deletion:** client materials are archived or deleted
  as the contract states.

<span id="sec_100" class="anchor"></span>16.11 LLM usage plan and
confidentiality tiers

LLMs help with the first, mechanical parts (reading intake documents,
drafting structured output, copy and critique) but never decide what a
brand is. Free cloud tiers are acceptable only for non-sensitive work.
Google, for example, states that on the free Gemini API tier your
prompts and responses may be used to improve its products (with human
review), while the paid tier is not used that way; other free tiers have
their own terms.

| **Confidentiality tier (workflow.confidentiality)** | **Allowed AI routes** | **Notes** |
|----|----|----|
| standard | Local models; a paid no-training cloud tier; a free cloud tier only for tasks that contain no client-specific or business-sensitive content (for example generic hook brainstorming) | Intake documents default to local or paid routes |
| nda | Local models or a paid no-training cloud tier only | Free cloud tiers are blocked by the router |
| restricted-local-llm-only | Local models only, no cloud AI of any kind | Use local Whisper for transcription; cloud coding agents receive only the sanitized BRAND.md and tokens, or work in a local-only environment |

| **Task** | **Input** | **Route** | **Validation and review** |
|----|----|----|----|
| Intake to profile extraction | Filled intake (confidential) | By tier, local or paid for most clients | Zod schema, up to 3 retries, human review, client confirmation |
| Completeness and scoring | Intake answers | No LLM (deterministic script) | Unit tests |
| BRAND.md generation | brand.json | No LLM (template) | Deterministic output |
| English copy drafts | Messaging fields | By tier | Brand-compliance checks BC-06, BC-09; client approval |
| Hindi and Marathi (and other) transcreation drafts | Approved English copy | Best available model for the tier | Always native review; glyph and length checks |
| Cue-sheet drafts | Locked copy and catalog | By tier | CueSheet schema validation |
| Visual critique | Stills of unreleased work | By tier (stills are confidential) | Structured JSON scores; human judgment prevails |
| Semantic compliance check | On-screen text and scripts | By tier | BC-06 report reviewed by a person |
| Code assembly by coding agents | Engine code, sanitized brand brief | Claude Code, Antigravity (cloud; review each provider's data terms) | Typecheck, tests, determinism check |

| **Provider option** | **Fit** | **Cautions** |
|----|----|----|
| Local models via Ollama | Private by design; any tier | Quality varies; Hindi and Marathi are weaker; needs a capable machine |
| Gemini API free tier | Non-sensitive drafts and extraction of public material | Free-tier content may be used to improve Google products and reviewed by humans; rate limits are model-specific and shown in the provider's console (verify) |
| Gemini API paid tier | NDA material when a no-training tier is required (Part B, UB14) | Costs money; confirm the data-processing terms |
| Groq, OpenRouter free models (verify) | Optional drafts of non-sensitive material | Check data terms, model licenses and limits for each model |
| Existing Claude and Antigravity plans | Coding and critique inside your own workflow | Check each product's data and training terms for your plan |

Router design

- Provider chain per tier with automatic fallback; the router reads the
  brand's confidentiality tier before every call.

- Structured output: every task has a Zod schema; on failure the router
  retries up to 3 times with the validation errors, then escalates to a
  person.

- Low temperature for extraction; no web search or tools unless the task
  needs them.

- Redact emails, phone numbers and contact names before any cloud call
  for standard brands unless they are the point of the task.

- Cache by input hash; log task, provider, token counts and input hash,
  never raw client content or secrets.

<span id="sec_101" class="anchor"></span>16.12 Contracts, licensing and
IP for client work

This checklist is guidance for drafting or reviewing a client agreement.
It is not legal advice; a lawyer-reviewed template is listed in Part B
(UD8).

| **Topic** | **Why it matters** | **Notes** |
|----|----|----|
| Scope and deliverables | Prevents disputes about what was bought | Match deliverables and project.deliverables |
| Revision rounds and change requests | Controls unpaid work | Number of rounds from workflow.revisionRounds |
| Ownership of the delivered videos | Decides who may use and edit them | Also determines licensing responsibilities |
| Ownership of the Remotion project code | Remotion's license responsibility follows ownership and combined headcount | Decide whether the studio keeps the code or hands it over; confirm with Remotion if unclear (section 15.4) |
| Third-party asset licenses | Music, stock, fonts and voices often cannot be transferred | State exactly which licenses pass to the client and which stay with the studio |
| Client warranty on supplied assets | Protects the studio if the client lacks the rights | Based on the intake section on assets |
| Usage rights | Territory, duration, media and paid-advertising rights | Mirrors compliance.usageRights |
| Voice and likeness releases | Required for any recognizable person or cloned voice | Signed releases stored with the brand |
| AI-generated content disclosure | Platform and market rules may require labels | Mirrors compliance.aiDisclosure |
| Confidentiality and data handling | Client materials may be sensitive | Tier in workflow.confidentiality; AI service restrictions |
| Data protection | Customer or tenant data in videos may be personal data | Take advice on applicable Indian data-protection requirements |
| Payments and milestones | Cash flow and acceptance | Tie to gates G1 to G5 |
| Credit and portfolio rights | Showing the work publicly | Client may restrict |
| Termination and deletion | What happens to materials afterwards | Retention period and secure deletion |
| Liability and insurance | Limits exposure | See Part B, UD8 and UD11 |

<span id="sec_102" class="anchor"></span>16.13 Changes this mode makes
to the rest of the PRD

| **Section** | **Change in version 1.1** |
|----|----|
| 1, 2, 3 | BharatQR described as brand \#1; goal G10, a client persona, and use cases UC-13 to UC-15 added |
| 4.3 | Tokens are house defaults that brands may adjust within bounded ranges |
| 5 | Schemas moved to src/schema/; languages and categories are brand-defined; cue-sheet and tenant schemas added and tested; availability table corrected |
| 6.3, 6.6 | Repository structure and provenance updated for brands/ |
| 7 | LLM provider options, zod pinning note, three new skills (19 custom skills in total) |
| 8 | CAT-01 to CAT-04 and DS-06 updated; BRD requirements pointer |
| 9, 10, 12, 13, 14 | Confidentiality and isolation requirements; brand-mode scoring; Brand analyst role; Phase 11; client-specific risks |
| 15 | Remotion terms refreshed; client-work licensing |
| 16, 17 | New Section 16 (this section); open decisions moved to Section 17 and extended |
| Appendices | A updated; B uses a validated example; F to H added; glossary moved to Appendix I |
| Part B | Paid items for client work added (UB14, UD8 to UD12); Remotion pricing refreshed |

<span id="sec_103" class="anchor"></span>17. Open Decisions

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
| 10 | Will the studio serve outside clients, or stay internal to BharatQR? | Internal only; occasional clients; a dedicated service | Before Phase 11 |
| 11 | Ownership model for client work | Studio keeps the Remotion project and delivers videos, or hands over source code (affects the Remotion license) | Before the first client contract |
| 12 | Repository model per client | Separate private repository per client, or a git submodule under brands/ | Phase 11 |
| 13 | Which LLM providers to enable and for which confidentiality tiers | Local only, free cloud for non-sensitive tasks, paid no-training tier later (Part B) | Phase 11 |
| 14 | Contract template and who reviews it | Self-drafted from the checklist in 16.12, or a lawyer-reviewed template (Part B) | Before the first client contract |
| 15 | Intake delivery format | Filled Word document, shared form, or guided interview with the studio | Phase 11 |

<span id="sec_104" class="anchor"></span>Appendix A:
remotion-guidelines.md (Draft Contents)

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
> \## 8. Brands (Multi-Brand Mode)
>
> \- Never hardcode brand values (colors, fonts, names, copy). Read them
> from the active brand profile.
>
> \- Never read assets, catalog or prompts from another brand folder.
>
> \- Never send NDA or restricted brand material to a cloud AI service.
> Follow the LLM routing policy.
>
> \- A brand must be locked (status: locked) before production, unless
> the owner approves a draft override.
>
> \## 9. Process
>
> \- Read docs first. Stay in scope. Verify packages with \`npm view\`
> before installing.
>
> \- New capability: write a plan, wait for approval. Finish with real
> test and render results.

<span id="sec_105" class="anchor"></span>Appendix B: Cue-Sheet Example
and Batch Commands

<span id="sec_106" class="anchor"></span>B.1 Cue-sheet JSON (validated
example)

This example validates against the CueSheet schema in section 5.2.

> {
>
> "composition": "FeatureReel",
>
> "lang": "en",
>
> "fps": 30,
>
> "feature": "qr_table_ordering",
>
> "durationInFrames": 810,
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
> "voiceover": \[{ "line": "One scan. The order is in.", "startFrame":
> 210 }\],
>
> "sfx": \[{ "frame": 160, "file": "sfx/click-soft.wav", "pan": 0.2,
> "gain": 0.8 }\],
>
> "music": { "file": "music/bed-01.mp3", "duckTo": 0.1, "restoreTo":
> 0.35 },
>
> "cursor": \[
>
> { "frame": 120, "x": 540, "y": 900 },
>
> { "frame": 160, "x": 540, "y": 1180, "click": true }
>
> \],
>
> "camera": \[{ "frame": 0, "pos": \[0, 0, 6\], "look": \[0, 0, 0\],
> "fov": 35 }\]
>
> }

<span id="sec_107" class="anchor"></span>B.2 Duration from audio

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

<span id="sec_108" class="anchor"></span>B.3 Batch rendering (example)

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

<span id="sec_109" class="anchor"></span>Appendix C: Pre-Release QA
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

<span id="sec_110" class="anchor"></span>Appendix D: Devanagari Stress
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

<span id="sec_111" class="anchor"></span>Appendix E: Learning and
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

<span id="sec_112" class="anchor"></span>Appendix F: Intake Question Map

Each intake question ID with its priority and the Brand Profile paths it
feeds. \[\] marks a list. This table is generated from the same data as
the intake document, so the two cannot drift apart. R = required, C =
conditional, O = optional.

| **ID** | **Priority** | **Brand Profile path(s)** |
|----|----|----|
| S0-01 | R | displayName |
| S0-02 | O | legalName |
| S0-03 | R | project.goal |
| S0-04 | R | project.deliverables |
| S0-05 | R | project.successMeasures |
| S0-06 | O | project.deadline |
| S0-07 | R | contacts\[\].name, contacts\[\].role |
| S0-08 | R | contacts\[\].email, contacts\[\].phone |
| S0-09 | R | contacts\[\].isApprover |
| S1-01 | R | business.industry |
| S1-02 | R | business.offering |
| S1-03 | R | business.usp |
| S1-04 | R | business.markets |
| S1-05 | O | business.stage |
| S1-06 | O | business.pricePosition |
| S1-07 | R | business.competitors |
| S1-08 | O | (kept in BRAND.md notes) |
| S1-09 | O | (kept in BRAND.md notes) |
| S2-01 | R | audience.primary.name |
| S2-02 | R | audience.primary.description |
| S2-03 | O | audience.primary.ageRange |
| S2-04 | R | audience.primary.languages |
| S2-05 | R | audience.primary.techComfort |
| S2-06 | R | audience.primary.channels |
| S2-07 | R | audience.primary.pains |
| S2-08 | R | audience.primary.desires |
| S2-09 | R | audience.primary.objections |
| S2-10 | O | audience.secondary |
| S2-11 | O | (kept in BRAND.md notes) |
| S3-01 | O | strategy.mission |
| S3-02 | R | strategy.values |
| S3-03 | R | strategy.positioning |
| S3-04 | R | strategy.personality |
| S3-05 | R | strategy.notThis |
| S3-06 | R | strategy.taglines |
| S3-07 | O | strategy.story |
| S3-08 | O | (kept in BRAND.md notes) |
| S4-01 | R | identity.logos\[\].name, identity.logos\[\].file |
| S4-02 | R | identity.logos\[\].background |
| S4-03 | R | identity.logos\[\].minWidthPx |
| S4-04 | R | identity.logos\[\].clearSpace |
| S4-05 | R | identity.logoDonts |
| S4-06 | O | identity.animatedLogoFile |
| S4-07 | O | (kept in BRAND.md notes) |
| S5-01 | R | colors.primary |
| S5-02 | O | colors.secondary |
| S5-03 | O | colors.accent |
| S5-04 | R | colors.neutrals |
| S5-05 | R | colors.background |
| S5-06 | O | colors.semantic |
| S5-07 | O | colors.usageRatio |
| S5-08 | R | colors.gradientsAllowed |
| S5-09 | C | colors.gradients |
| S5-10 | R | colors.forbidden |
| S5-11 | R | colors.contrastMin |
| S5-12 | O | (kept in BRAND.md notes) |
| S6-01 | R | typography.families |
| S6-02 | R | typography.families |
| S6-03 | R | typography.families |
| S6-04 | O | typography.families |
| S6-05 | R | typography.families |
| S6-06 | O | typography.families |
| S6-07 | O | typography.scale |
| S6-08 | R | typography.caseRules |
| S6-09 | O | typography.letterSpacingLatin |
| S6-10 | R | typography.devanagariLineHeightMin |
| S7-01 | O | layout.grid |
| S7-02 | O | layout.radii |
| S7-03 | O | layout.shadows |
| S7-04 | O | layout.borders |
| S7-05 | O | layout.spacingUnit |
| S7-06 | R | layout.iconStyle |
| S7-07 | O | layout.patterns |
| S8-01 | R | imagery.photoStyle |
| S8-02 | R | imagery.illustrationStyle |
| S8-03 | O | imagery.colorGrade |
| S8-04 | R | imagery.subjects |
| S8-05 | R | imagery.avoid |
| S8-06 | R | imagery.mascot.exists |
| S8-07 | C | imagery.mascot.file |
| S8-08 | C | imagery.mascot.rules |
| S9-01 | R | productUI.hasSoftwareProduct |
| S9-02 | C | productUI.platforms |
| S9-03 | C | productUI.theme |
| S9-04 | O | productUI.designSystemRef |
| S9-05 | C | productUI.fontsInUI |
| S9-06 | C | productUI.screens\[\].key, productUI.screens\[\].name |
| S9-07 | C | productUI.screens\[\].availability |
| S9-08 | C | productUI.screens\[\].screenshot |
| S9-09 | C | productUI.screens\[\].blurRules |
| S9-10 | C | productUI.sampleDataRules |
| S9-11 | O | (kept in BRAND.md notes) |
| S9-12 | O | (kept in BRAND.md notes) |
| S10-01 | C | offering.items\[\].name, offering.items\[\].price |
| S10-02 | C | offering.items\[\].photo |
| S10-03 | C | offering.locations |
| S10-04 | O | offering.packaging |
| S11-01 | R | motion.personality |
| S11-02 | R | motion.pace |
| S11-03 | R | motion.easingFeel |
| S11-04 | R | motion.cameraStyle |
| S11-05 | O | motion.allowedTransitions |
| S11-06 | O | motion.forbiddenTransitions |
| S11-07 | R | motion.use3D |
| S11-08 | R | motion.useCharacters |
| S11-09 | R | motion.textAnimation |
| S11-10 | O | motion.maxSimultaneousText |
| S11-11 | O | (kept in BRAND.md notes) |
| S12-01 | R | sound.music.moods |
| S12-02 | O | sound.music.bpmRange |
| S12-03 | O | sound.music.instruments |
| S12-04 | R | sound.music.avoid |
| S12-05 | O | sound.music.licensedTracks |
| S12-06 | O | sound.sfxStyle |
| S12-07 | O | sound.sonicLogoFile |
| S12-08 | R | sound.voice.persona |
| S12-09 | R | sound.voice.gender |
| S12-10 | O | sound.voice.ageFeel |
| S12-11 | R | sound.voice.accent |
| S12-12 | R | sound.voice.pace |
| S12-13 | R | sound.voice.cloningConsentOnFile |
| S12-14 | R | sound.forbiddenSounds |
| S13-01 | R | localization.languages |
| S13-02 | R | localization.primaryLanguage |
| S13-03 | R | localization.formality |
| S13-04 | R | localization.transcreate |
| S13-05 | R | localization.loanwordPolicy |
| S13-06 | R | localization.numberLocale |
| S13-07 | R | localization.currency |
| S13-08 | R | localization.dateFormat |
| S13-09 | O | localization.glossary |
| S13-10 | R | localization.pronunciations |
| S13-11 | R | localization.brandNameByLanguage |
| S13-12 | R | localization.reviewers |
| S14-01 | R | messaging.pillars |
| S14-02 | R | messaging.proofPoints\[\].claim, messaging.proofPoints\[\].evidence, messaging.proofPoints\[\].sourceRef |
| S14-03 | R | messaging.proofPoints\[\].approved |
| S14-04 | R | messaging.allowedClaims |
| S14-05 | R | messaging.prohibitedClaims |
| S14-06 | R | messaging.disclaimers |
| S14-07 | R | messaging.ctas\[\].text |
| S14-08 | R | messaging.ctas\[\].destination |
| S14-09 | O | messaging.handles |
| S14-10 | O | messaging.hashtags |
| S14-11 | O | (kept in BRAND.md notes) |
| S15-01 | R | references.likes\[\].ref, references.likes\[\].why |
| S15-02 | R | references.dislikes\[\].ref, references.dislikes\[\].why |
| S15-03 | O | (kept in BRAND.md notes) |
| S16-01 | R | deliverables.formats |
| S16-02 | R | deliverables.durationsSeconds |
| S16-03 | R | deliverables.quantity |
| S16-04 | R | deliverables.platforms |
| S16-05 | R | deliverables.burnedCaptions |
| S16-06 | R | deliverables.languages |
| S16-07 | O | (kept in BRAND.md notes) |
| S17-01 | R | assets.provided\[\].type, assets.provided\[\].path |
| S17-02 | R | assets.provided\[\].owner |
| S17-03 | O | assets.provided\[\].licenseNote |
| S17-04 | R | assets.missing |
| S17-05 | R | (kept in BRAND.md notes) |
| S18-01 | R | compliance.regulations |
| S18-02 | R | compliance.testimonialConsentOnFile |
| S18-03 | O | compliance.trademarkNotes |
| S18-04 | R | compliance.aiDisclosure |
| S18-05 | R | compliance.usageRights.territory |
| S18-06 | R | compliance.usageRights.durationMonths |
| S18-07 | R | compliance.usageRights.paidMedia |
| S18-08 | R | compliance.forbiddenTopics |
| S18-09 | R | compliance.competitorMentionAllowed |
| S19-01 | R | workflow.approvers |
| S19-02 | R | workflow.revisionRounds |
| S19-03 | O | workflow.reviewTool |
| S19-04 | R | workflow.signoffFormat |
| S19-05 | R | workflow.confidentiality |
| S19-06 | O | (kept in BRAND.md notes) |

<span id="sec_113" class="anchor"></span>Appendix G: Example brand.json
(Illustrative)

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><p><strong>Illustrative only</strong></p>
<p>This example uses BharatQR values taken from the owner's summary and
project notes. Fields tagged assumed in the provenance block (for
example the legal name, competitors, deadline) are placeholders that the
owner must confirm. The file validates against the schema in section
16.4.</p></td>
</tr>
</tbody>
</table>

> {
>
> "schemaVersion": "1.0",
>
> "id": "bharatqr",
>
> "displayName": "BharatQR",
>
> "legalName": "To be confirmed by owner",
>
> "status": "draft",
>
> "version": "0.1.0",
>
> "lockedOn": "2026-12-01",
>
> "project": {
>
> "goal": "Launch a brand film and per-feature Reels for restaurant
> owners",
>
> "deadline": "2026-12-15",
>
> "deliverables": \["60 s hero film", "15-30 s feature Reels", "6 s
> bumpers"\],
>
> "successMeasures": \["Hook hold rate", "Demo requests per video"\]
>
> },
>
> "contacts": \[
>
> {
>
> "name": "Karan Datta Daphade",
>
> "role": "Owner",
>
> "email": "owner@example.com",
>
> "phone": "+91-00000-00000",
>
> "isApprover": true
>
> }
>
> \],
>
> "business": {
>
> "industry": "Restaurant and hotel software (SaaS)",
>
> "offering": "Multi-tenant POS and live-operations platform with
> QR-based table and room ordering",
>
> "usp": \["QR ordering without a customer app", "Guided 7-step branch
> onboarding"\],
>
> "markets": \["India"\],
>
> "stage": "Pre-launch, owner-side features live",
>
> "pricePosition": "Affordable for independent outlets",
>
> "competitors": \["To be confirmed by owner"\]
>
> },
>
> "audience": {
>
> "primary": {
>
> "name": "Independent restaurant owner",
>
> "description": "Runs one or a few outlets and manages operations
> personally",
>
> "ageRange": "28-55",
>
> "languages": \["Marathi", "Hindi", "English"\],
>
> "techComfort": "medium",
>
> "channels": \["WhatsApp", "Instagram", "YouTube"\],
>
> "pains": \["Lost orders", "Slow table turnover", "Billing mistakes"\],
>
> "desires": \["Calm operations", "Clear daily numbers"\],
>
> "objections": \["Software is complicated", "Staff will not adopt it"\]
>
> },
>
> "secondary": {
>
> "name": "Branch or floor manager",
>
> "description": "Handles tables, staff and daily service",
>
> "ageRange": "22-45",
>
> "languages": \["Marathi", "Hindi"\],
>
> "techComfort": "medium",
>
> "channels": \["WhatsApp", "YouTube"\],
>
> "pains": \["Waiting-list confusion"\],
>
> "desires": \["One screen for every table"\],
>
> "objections": \["Training time"\]
>
> }
>
> },
>
> "strategy": {
>
> "mission": "Help restaurants run calmly",
>
> "values": \["Clarity", "Reliability", "Local-first"\],
>
> "positioning": "The calm, local-language way to run a restaurant",
>
> "personality": \["Confident", "Warm", "Precise"\],
>
> "notThis": \["Corporate", "Gimmicky", "Cluttered"\],
>
> "taglines": { "en": "Run it calmly" },
>
> "story": "Built for Indian restaurants, in the languages their teams
> speak"
>
> },
>
> "identity": {
>
> "logos": \[
>
> {
>
> "name": "primary-horizontal",
>
> "file": "assets/logos/primary-horizontal.svg",
>
> "background": "dark",
>
> "minWidthPx": 120,
>
> "clearSpace": "Height of the icon on every side"
>
> }
>
> \],
>
> "logoDonts": \["Do not stretch", "Do not recolor", "Do not add
> shadows"\],
>
> "animatedLogoFile": "assets/logos/logo-sting.json"
>
> },
>
> "colors": {
>
> "primary": "#3B82F6",
>
> "secondary": "#161F30",
>
> "accent": "#10B981",
>
> "neutrals": \["#0B0F19", "#161F30", "#E5E7EB"\],
>
> "background": { "light": "#F8FAFC", "dark": "#0B0F19" },
>
> "semantic": { "success": "#10B981", "warning": "#F59E0B", "error":
> "#EF4444", "info": "#3B82F6" },
>
> "usageRatio": "70 percent neutral, 20 percent primary, 10 percent
> accent",
>
> "gradientsAllowed": false,
>
> "gradients": \[\],
>
> "forbidden": \["Neon purple", "Pure black text on pure white"\],
>
> "contrastMin": 4.5
>
> },
>
> "typography": {
>
> "families": \[
>
> {
>
> "role": "heading",
>
> "script": "latin",
>
> "family": "Outfit",
>
> "weights": \[600, 700\],
>
> "source": "google",
>
> "licenseStatus": "open",
>
> "fallbacks": \["Inter", "sans-serif"\]
>
> },
>
> {
>
> "role": "body",
>
> "script": "latin",
>
> "family": "Inter",
>
> "weights": \[400, 500, 600\],
>
> "source": "google",
>
> "licenseStatus": "open",
>
> "fallbacks": \["sans-serif"\]
>
> },
>
> {
>
> "role": "body",
>
> "script": "devanagari",
>
> "family": "Noto Sans Devanagari",
>
> "weights": \[400, 600, 700\],
>
> "source": "google",
>
> "licenseStatus": "open",
>
> "fallbacks": \["Mukta", "sans-serif"\]
>
> }
>
> \],
>
> "scale": { "display": 72, "h1": 56, "h2": 40, "body": 28, "caption":
> 22 },
>
> "caseRules": "Sentence case for headlines; no all-caps in Devanagari",
>
> "letterSpacingLatin": 0,
>
> "devanagariLineHeightMin": 1.4
>
> },
>
> "layout": {
>
> "grid": { "columns": 12, "margin": 64, "gutter": 24 },
>
> "radii": { "small": 8, "medium": 16, "large": 28 },
>
> "shadows": "Soft, low-contrast, large blur",
>
> "borders": "1 px hairline at low opacity",
>
> "spacingUnit": 8,
>
> "iconStyle": "outline",
>
> "patterns": \[\]
>
> },
>
> "imagery": {
>
> "photoStyle": "Warm, natural light, real restaurant counters and
> kitchens",
>
> "illustrationStyle": "None for now",
>
> "colorGrade": "Warm highlights, cool shadows, restrained saturation",
>
> "subjects": \["Chai counter", "Thali", "Steel utensils", "Handwritten
> menu board"\],
>
> "avoid": \["Generic office stock photos", "Western-only dining
> scenes"\],
>
> "mascot": { "exists": false, "file": "", "rules": "" }
>
> },
>
> "productUI": {
>
> "hasSoftwareProduct": true,
>
> "platforms": \["web"\],
>
> "theme": "both",
>
> "designSystemRef": "docs/design-system.md",
>
> "fontsInUI": \["Inter", "Noto Sans Devanagari"\],
>
> "screens": \[
>
> {
>
> "key": "onboarding_wizard",
>
> "name": "Branch onboarding wizard",
>
> "availability": "live",
>
> "screenshot": "ui/onboarding.png",
>
> "blurRules": "Blur real phone numbers and emails"
>
> },
>
> {
>
> "key": "table_management",
>
> "name": "Tables operations",
>
> "availability": "live",
>
> "screenshot": "ui/tables.png",
>
> "blurRules": "Use demo customers only"
>
> },
>
> {
>
> "key": "kitchen_display",
>
> "name": "Kitchen display",
>
> "availability": "roadmap",
>
> "screenshot": "",
>
> "blurRules": "Mock only; label coming soon"
>
> }
>
> \],
>
> "sampleDataRules": "Indian names, rupee amounts, realistic menu items;
> never real customer data"
>
> },
>
> "offering": {
>
> "items": \[{ "name": "Starter plan", "price": "To be confirmed",
> "photo": "" }\],
>
> "locations": \["Maharashtra, India"\],
>
> "packaging": ""
>
> },
>
> "motion": {
>
> "personality": "confident",
>
> "pace": "medium",
>
> "easingFeel": "soft",
>
> "cameraStyle": "gentle-drift",
>
> "allowedTransitions": \["match-cut", "slide", "light-leak"\],
>
> "forbiddenTransitions": \["spin", "cube-flip"\],
>
> "use3D": true,
>
> "useCharacters": false,
>
> "textAnimation": "word",
>
> "maxSimultaneousText": 3
>
> },
>
> "sound": {
>
> "music": {
>
> "moods": \["Warm", "Confident", "Uplifting"\],
>
> "bpmRange": \[92, 112\],
>
> "instruments": \["Soft pads", "Plucked strings", "Light percussion"\],
>
> "avoid": \["Aggressive EDM", "Copyrighted film themes"\],
>
> "licensedTracks": \[\]
>
> },
>
> "sfxStyle": "Soft, tactile UI sounds in the music key; one original
> payment-style ding motif",
>
> "sonicLogoFile": "assets/sfx/sonic-logo.wav",
>
> "voice": {
>
> "persona": "Friendly, confident restaurant-industry guide",
>
> "gender": "any",
>
> "ageFeel": "30s",
>
> "accent": "Neutral Maharashtrian Marathi; standard Hindi; Indian
> English",
>
> "pace": "medium",
>
> "cloningConsentOnFile": false
>
> },
>
> "forbiddenSounds": \["Third-party payment-brand jingles"\]
>
> },
>
> "localization": {
>
> "languages": \["en", "hi", "mr"\],
>
> "formality": "neutral",
>
> "transcreate": true,
>
> "loanwordPolicy": "Keep QR, bill and order in English letters or
> natural Devanagari spelling",
>
> "numberLocale": "en-IN",
>
> "currency": "INR",
>
> "dateFormat": "DD MMM YYYY",
>
> "glossary": \[
>
> {
>
> "term": "Table",
>
> "translations": { "hi": "टेबल", "mr": "टेबल" },
>
> "doNotTranslate": false
>
> }
>
> \],
>
> "pronunciations": \[{ "term": "BharatQR", "lang": "mr", "say": "Bharat
> Q R" }\],
>
> "brandNameByLanguage": { "en": "BharatQR" },
>
> "reviewers": \["Native Marathi reviewer to be named", "Native Hindi
> reviewer to be named"\],
>
> "primaryLanguage": "mr"
>
> },
>
> "messaging": {
>
> "pillars": \["Calm operations", "Local language", "One screen for the
> floor"\],
>
> "proofPoints": \[
>
> {
>
> "claim": "Branch onboarding in seven guided steps",
>
> "evidence": "Product onboarding flow",
>
> "sourceRef": "docs/features/onboarding.md",
>
> "approved": true
>
> }
>
> \],
>
> "allowedClaims": \["Guided onboarding", "QR codes generated per
> table"\],
>
> "prohibitedClaims": \["Guaranteed revenue increase", "Features not yet
> shipped presented as live"\],
>
> "disclaimers": \[{ "text": "Coming soon", "whenRequired": "Any roadmap
> feature shown on screen" }\],
>
> "ctas": \[
>
> {
>
> "text": { "en": "Start free", "hi": "मुफ़्त शुरू करें", "mr": "मोफत सुरू करा"
> },
>
> "destination": "Product website"
>
> }
>
> \],
>
> "handles": \["@to_be_confirmed"\],
>
> "hashtags": \["#BharatQR"\]
>
> },
>
> "references": {
>
> "likes": \[
>
> {
>
> "ref": "Reference video to be supplied by owner",
>
> "why": "Clean product storytelling"
>
> }
>
> \],
>
> "dislikes": \[{ "ref": "Template-style SaaS ads", "why": "Generic and
> forgettable" }\]
>
> },
>
> "deliverables": {
>
> "formats": \["9:16", "1:1", "16:9"\],
>
> "durationsSeconds": \[6, 15, 30, 60\],
>
> "quantity": 12,
>
> "platforms": \["Instagram Reels", "YouTube Shorts", "WhatsApp",
> "Website"\],
>
> "burnedCaptions": true,
>
> "languages": \["en", "hi", "mr"\]
>
> },
>
> "assets": {
>
> "provided": \[
>
> {
>
> "type": "logo",
>
> "path": "assets/logos/primary-horizontal.svg",
>
> "owner": "client",
>
> "licenseNote": "Owner-created"
>
> }
>
> \],
>
> "missing": \["Final logo files", "Licensed music"\]
>
> },
>
> "compliance": {
>
> "regulations": \["Indian advertising standards applicable to software
> ads"\],
>
> "testimonialConsentOnFile": false,
>
> "trademarkNotes": "Do not use third-party brand logos or sounds",
>
> "aiDisclosure": "label-synthetic-voice",
>
> "usageRights": { "territory": "India", "durationMonths": 24,
> "paidMedia": true },
>
> "forbiddenTopics": \["Competitor disparagement"\],
>
> "competitorMentionAllowed": false
>
> },
>
> "workflow": {
>
> "approvers": \["Karan Datta Daphade"\],
>
> "revisionRounds": 2,
>
> "reviewTool": "Shared folder",
>
> "signoffFormat": "email",
>
> "confidentiality": "standard"
>
> },
>
> "provenance": {
>
> "legalName": "assumed",
>
> "business.competitors": "assumed",
>
> "strategy.taglines.en": "derived",
>
> "colors.primary": "provided",
>
> "typography.families": "provided",
>
> "audience.primary": "derived",
>
> "project.deadline": "assumed"
>
> }
>
> }

<span id="sec_114" class="anchor"></span>Appendix H: Extraction and
Check Prompts

<span id="sec_115" class="anchor"></span>H.1 Intake extraction prompt

> ROLE: You convert a filled Brand Intake Document into a Brand Profile
> for the motion studio.
>
> INPUT: the intake answers keyed by question ID (S0-01 ... S19-06), the
> schema in
>
> src/schema/brand.ts, and the question map (Appendix F).
>
> RULES
>
> 1\. Return ONLY one JSON object, no prose and no markdown fences.
>
> 2\. Use only facts present in the intake. Never invent colors, fonts,
> claims, numbers,
>
> names, dates, URLs or licenses. If a value is not stated, leave the
> field out.
>
> 3\. Map answers to profile paths using the question map. One answer
> may fill several fields.
>
> 4\. Normalize: colors to \#RRGGBB (only if exact; otherwise report a
> conflict), language
>
> names to codes (English en, Hindi hi, Marathi mr, ...), numbers to
> numbers, yes/no to
>
> booleans, choice answers to the exact allowed enum value.
>
> 5\. If an answer is ambiguous, contradicts another answer, or cannot
> be mapped to an
>
> allowed value, do not guess: add it to \`conflicts\`.
>
> 6\. Tag every field you fill: \`provided\` if copied directly,
> \`derived\` if you combined or
>
> reformatted client statements. Never use \`assumed\` (code applies
> studio defaults).
>
> OUTPUT ENVELOPE
>
> {
>
> "profile": { ...Brand-shaped object; unanswered fields omitted... },
>
> "provenance": { "colors.primary": "provided", "strategy.positioning":
> "derived" },
>
> "missing": \[ { "id": "S5-04", "path": "colors.neutrals", "reason":
> "blank" } \],
>
> "conflicts": \[ { "ids": \["S5-01"\], "issue": "RGB given, HEX
> expected" } \],
>
> "notes": \[ "free-text items that belong in BRAND.md" \]
>
> }

After extraction, code applies the studio defaults (section 16.5), tags
those fields assumed, validates with Zod, and sends missing items and
conflicts back to a person.

<span id="sec_116" class="anchor"></span>H.2 Semantic claims and tone
check (BC-06, BC-09)

> ROLE: Brand compliance reviewer.
>
> INPUT: the brand's prohibitedClaims, forbiddenTopics, personality,
> notThis, and the text of
>
> every on-screen string and voiceover line for one video, per language.
>
> TASK: Find (a) any statement that matches or implies a prohibited
> claim or topic,
>
> \(b\) any line whose tone conflicts with the personality or notThis
> lists.
>
> Return ONLY JSON:
>
> { "violations": \[ { "lang": "hi", "text": "...", "rule":
> "prohibitedClaims\[1\]",
>
> "severity": "hard" } \],
>
> "toneWarnings": \[ { "lang": "en", "text": "...", "why": "..." } \] }
>
> If unsure, report it as a warning, not a pass. A person reviews every
> hard violation.

<span id="sec_117" class="anchor"></span>H.3 BRAND.md outline (generated
by template)

- Overview and positioning; audience; personality and values; what the
  brand is not

- Voice and tone, taglines, approved and prohibited claims, mandatory
  disclaimers

- Logo rules; color palette and usage; typography per script; layout and
  icon style

- Imagery, illustration and character rules; motion personality and
  limits; sound and voice rules

- Languages, glossary, pronunciations, number and date formats,
  reviewers

- Product UI screens with availability status and blur rules (if any)

- Deliverables, approvals, confidentiality tier, assumptions awaiting
  confirmation

<span id="sec_118" class="anchor"></span>Appendix I: Glossary

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
| Brand Kit | The isolated folder for one brand: intake, brand.json, catalog, assets, approvals. |
| Brand Profile (brand.json) | The validated, machine-readable description of a brand. |
| Brand Intake Document | The detailed questionnaire a client fills so the studio can build the Brand Profile. |
| Brand lock | The approved, versioned state of a Brand Profile that production uses. |
| Provenance | A tag on each profile value: provided, derived or assumed. |
| Studio default | A documented value the studio applies when an optional question is left blank. |
| Brand compliance | Automated checks that a video follows the brand's own rules (BC-01 to BC-15). |
| Confidentiality tier | The brand's setting (standard, nda, restricted) that decides which AI services may see its material. |
| Router (LLM router) | Code that picks an allowed AI provider for each task, validates the output and logs usage. |
| Transcreation (client use) | Writing the message again in each language, reviewed by a native speaker. |

<span id="sec_119" class="anchor"></span>Part B: Future Paid Upgrades
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

<span id="sec_120" class="anchor"></span>B1. How to use this section

- When a budget appears, start at **Tier A** and work downward. Tier A
  is human craft: it moves the film from 'excellent engineering' toward
  'expensive production'.

- Each row names the free tool it replaces so the pipeline stays
  modular: upgrading a voice or a music track does not change the code.

- Log every purchase in the budget log at the end of this section, with
  what changed in the result.

- Re-check the Part A **license register** after buying: paid assets
  have their own license terms.

<span id="sec_121" class="anchor"></span>B2. Where the free stack falls
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
| Free cloud LLM tiers may use your data | Cannot process confidential client intake documents in the cloud | UB14 paid no-training tier (or keep using local models) |
| No lawyer-reviewed client paperwork | Ownership and licensing risk on client projects | UD8 contract template, UD10 e-signature |

<span id="sec_122" class="anchor"></span>B3. Tier A: Human craft
(highest impact per rupee)

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

<span id="sec_123" class="anchor"></span>B4. Tier B: Tools and services
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
| UB14 | Paid, no-training tier of a cloud LLM API (for example the paid Gemini API tier, whose content Google says is not used to improve its products, or another provider with equivalent terms) | Safe cloud processing of NDA client material, higher rate limits, better Hindi and Marathi drafts | Free LLM tiers (data may be used for improvement) and local models | Usage-based; check vendor page and data terms | Before handling confidential client intake documents in the cloud |

<span id="sec_124" class="anchor"></span>B5. Tier C: Scale and
infrastructure

| **ID** | **Upgrade** | **What it improves** | **Replaces (free option)** | **Cost note** | **Buy when** |
|----|----|----|----|----|----|
| UC1 | Dedicated GPU workstation or GPU and RAM upgrade | Fast 3D renders and local AI models; shorter iteration loops | Existing machine | Hardware cost | When renders exceed a comfortable wait |
| UC2 | Cloud GPU rental (RunPod, Lambda and similar) | On-demand power without hardware purchase | Local GPU | Hourly rate; check vendor | For heavy batches or local AI models |
| UC3 | Remotion Lambda (AWS) or Cloud Run rendering | Parallel cloud renders for large batches and personalized videos | Local rendering | Cloud compute cost plus Remotion license; check vendor | When rendering 100+ outputs or serving customers |
| UC4 | Remotion Company License | Legal use at 4+ people (including combined headcount with clients); prioritized support | Free license (up to 3 people) | Checked Oct 2026: Creators about \$25 per developer seat per month; Automators \$0.01 per render with \$100 per month minimum; Enterprise from \$500 per month. Confirm which minimum applies. | The day a fourth person joins, or when client ownership terms require it |
| UC5 | Video hosting and delivery (Mux, Cloudflare Stream, Bunny) | Fast, adaptive playback for in-product videos | Direct file hosting | Usage-based; check vendor (the Remotion company license lists Mux credits) | When embedding videos in the product at scale |
| UC6 | Cloud storage and backup for masters (S3, R2, Drive) | Safe archive of ProRes masters and assets | Local disks | Storage cost | When masters accumulate |
| UC7 | CI render runners or self-hosted runner | Automated nightly renders and QA | Local runs | Usage-based | When release videos should render automatically |
| UC8 | Job queue and hosting for per-tenant video jobs (Redis, workers) | Reliable personalized and recap videos inside the product | Manual command line | Hosting cost | When tenant video features go live |

<span id="sec_125" class="anchor"></span>B6. Tier D: Growth, legal and
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
| UD8 | Lawyer-reviewed client contract template (scope, IP assignment, usage rights, warranties, revisions, confidentiality, data protection) | Clear ownership and liability when producing videos for other brands | Self-drafted from the section 16.12 checklist | Per-template or hourly quote | Before the first paid client project |
| UD9 | Client review and approval platform (frame-accurate comments and version history) | Faster feedback, auditable approvals | Shared folder and email sign-off | Subscription; check vendor | When several clients review at once |
| UD10 | E-signature and document tools | Signed intake sign-offs, releases and contracts | Email approvals and scanned forms | Subscription; check vendor | When approvals must be legally traceable |
| UD11 | Professional liability or business insurance for client work | Protection against claims over delivered work | None | Insurer quote | Before taking on larger clients |
| UD12 | Client font licenses (paid by the client) for brand typefaces | Exact brand typography | Open-license Google fonts | Paid by the client; confirm the license allows video use | When a client's brand uses licensed fonts |

<span id="sec_126" class="anchor"></span>B7. Suggested purchase sequence

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
| 7 | UD1 legal review, UD2 ads, UD3 analytics, UD4 more languages; for client work UD8, UD10, UB14 and UD9 as volume grows | Growth, compliance and client readiness |

<span id="sec_127" class="anchor"></span>B8. Trigger checklist: when to
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

- The first outside client appears: buy UD8 (contract template) and
  decide on UB14 before touching their confidential files in the cloud.

- Customers outside Maharashtra and Hindi-speaking states ask for
  videos: start UD4.

<span id="sec_128" class="anchor"></span>B9. Budget log (fill in as you
buy)

| **Date** | **Item (ID)** | **Cost** | **License terms noted** | **Result / what improved** |
|----|----|----|----|----|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
