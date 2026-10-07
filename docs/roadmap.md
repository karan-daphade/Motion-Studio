# Build Roadmap (Dependency Order)

Phases are ordered by dependency. With agent-driven development, several
phases can proceed in parallel once their prerequisites are met.

| Status | **Phase** | **Scope** | **Deliverables** | **Exit criteria** |
|---|---|---|---|---|
| [x] | 0 Foundations | Repo, Remotion setup, pinned versions, tokens skeleton, guidelines, AGENTS.md, license register, package verification | Running Studio, lint rules, LICENSES.md, assets-manifest.json, first 8 skills | Hello-world composition renders deterministically |
| [ ] | 1 The Brain | Schemas, product.json, features.json (15 seed features), locale workflow | Validated catalog, native-reviewed EN, HI, MR copy for first features | Catalog gate blocks incomplete features |
| [ ] | 2 Components | UI clones, device frames, cursor, charts, Storybook | Story for every clone; mock-data fixtures | Brand-color swap test passes |
| [ ] | 3 Scene engine | Scene templates, transitions, composition registry, first feature reel (EN) | One complete 20 s reel | Rubric 70+ on first pass |
| [ ] | 4 Audio | VO pipeline, Whisper sync, captions, SFX palette, ducking, mastering | Fully mixed reel in 3 languages | Loudness and sync checks pass |
| [ ] | 5 Cinema | Camera rig, lens effects, grain, LUT, motion blur, 3D kit, physics, Blender pipeline | 3D hero prop shots; cinematic reel | Rubric 80+ on a feature reel |
| [ ] | 6 Localization at scale | All seed features in 3 languages; Devanagari QA suite | Batch of localized reels | Zero glyph defects |
| [ ] | 7 QA automation | Critique loop, safe-zone, contrast, overflow, regression, determinism | QA report generator | Release blocked by any hard fail |
| [ ] | 8 Hero film | Soundbox film with footage plates, Blender shots, designed sound, grade | 60 s and 30 s hero cuts in all formats | Rubric 85+ |
| [ ] | 9 Product features | Tenant personalization, owner recap, Player embed, festival templates, signage | Working personalized renders and in-app Player | Tenant video renders from live data snapshot |
| [ ] | 10 Automation | Playwright capture, release-note videos, A/B variants | One-command release clip | Zero manual steps for a release video |
