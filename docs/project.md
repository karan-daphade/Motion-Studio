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

