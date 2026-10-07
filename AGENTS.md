# AGENTS.md — Motion Studio

> **Read `docs/roadmap.md` first.**

---

## Project One-Liner

Motion Studio is a programmatic, agency-grade motion-video engine that turns a structured
product catalog into broadcast-quality video — rendered entirely in React/TypeScript via
Remotion, orchestrated by AI coding agents, with zero timeline editing.

---

## Golden Rules (Non-Negotiable)

These rules apply to every agent, every task, every commit.

### 1. Determinism above all
- Never use `Math.random()`, `Date.now()`, `new Date()` for any visual or timing value.
- All motion derives from `useCurrentFrame()` and Remotion's `random('seed')`.
- No `useState` that is not derived from frame and props.
- Physics simulations are precomputed per frame from a fixed seed.
- Same inputs → same pixels and same audio, always.

### 2. Tokens only — no raw numbers in scenes
- Every motion value (spring config, easing, duration, color, spacing) comes from
  `src/tokens/`. Raw numbers in scene files are a build error.
- No hardcoded copy in any component or scene. All user-facing text comes from
  `catalog/product.json` or `catalog/features.json`.

### 3. No hardcoded copy anywhere
- Every string visible to a viewer is read from the catalog JSON at render time.
- Localized copy (English, Hindi, Marathi) lives only in the catalog; scenes are locale-agnostic.

### 4. Verify packages before using them
- Before adding any npm package: run `npm view <pkg> version license` and read the
  installed types or README in `node_modules/`.
- Never invent package names, APIs, flags, versions, or file contents.
- If you cannot verify something, write **UNVERIFIED** and ask the owner.
- Forbidden: any package that is not open-source or that requires a paid license for
  commercial use. Check the license register in `docs/licensing.md`.

### 5. Never claim success without command output
- Every step that matters ends with a real command and its pasted output.
- Do not write "should work", "done", or "fixed" without evidence.
- If a check fails, diagnose from the actual error. Maximum 3 fix attempts, then stop
  and report what you tried.

### 6. Plan before code
- Post a numbered plan (files to touch, commands to run, how each step will be verified).
- Wait for owner approval before executing. Stay strictly in scope.

### 7. Update docs after every task
- Tick `docs/roadmap.md` for completed items.
- Add a `docs/decisions/` entry for any architectural choice.
- Record new packages in `docs/licensing.md`.
- Commit with a clear message referencing the FR IDs addressed.

---

## Documentation Map

Read the file listed below before working on the topic it covers.

| File | Contents |
|------|----------|
| `docs/roadmap.md` | Build phases in dependency order — **read this first** |
| `docs/project.md` | Sections 1–3: executive summary, goals, users and use cases |
| `docs/architecture.md` | Section 6: architectural principles, determinism rules, repo structure, pipeline |
| `docs/tech-stack.md` | Section 7: complete inventory of every package — check here before adding anything |
| `docs/schema.md` | Section 5.2 Zod schema for catalog + Section 16 open decisions 4 & 9 |
| `docs/requirements.md` | Section 8: all functional requirements (CAT, DS, UI, SCN, CAM, 3D, LOC, AUD, …) |
| `docs/quality-rubric.md` | Section 10: the agency-grade scorecard, hard-fail conditions, review gates |
| `docs/guidelines.md` | Appendix A: `remotion-guidelines.md` draft — non-negotiable coding rules |
| `docs/licensing.md` | Section 15: license families, Remotion terms, compliance practices |
| `docs/decisions/README.md` | Decision log format + open decisions from PRD section 16 |
| `docs/prompts/footer.md` | Mandatory footer appended to every agent task prompt |
| `docs/setup.md` | Environment setup log — tool versions and commands run on day 0 |
| `docs/PRD.full.md` | Full PRD converted from docx — source of truth for all splits above |

---

## Execution Protocol (summary from `docs/prompts/footer.md`)

1. **Read first** — AGENTS.md, `docs/roadmap.md`, every doc the task names.
2. **No guessing** — verify every package, API, flag, and version from source.
3. **Plan before code** — post a numbered plan, wait for approval, stay in scope.
4. **Small steps** — after each step run the check commands and paste real output.
5. **Fix loop** — diagnose from actual errors; max 3 attempts, then stop and report.
6. **Self-audit** — list each acceptance criterion as PASS or FAIL with evidence.
7. **Never say "done"** — only report what you ran and saw.
8. **Update docs** — roadmap, decisions, licensing, then commit.
9. **Finish with** — summary, files changed, commands run, open risks, UNVERIFIED items. Then STOP.
