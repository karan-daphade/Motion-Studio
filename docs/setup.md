# Motion Studio — Setup Log

Generated: 2026-10-07

## Step 1: Tool Version Check

All commands run from `D:\motion-studio` in PowerShell.

### node -v
```
v24.19.0
```

### npm -v
```
11.17.0
```

### git --version
```
git version 2.55.0.windows.1
```

### ffmpeg -version
```
ffmpeg version 8.1.1-full_build-www.gyan.dev Copyright (c) 2000-2026 the FFmpeg developers
built with gcc 15.2.0 (Rev13, Built by MSYS2 project)
libavutil      60. 26.101 / 60. 26.101
libavcodec     62. 28.101 / 62. 28.101
libavformat    62. 12.101 / 62. 12.101
libavdevice    62.  3.101 / 62.  3.101
libavfilter    11. 14.101 / 11. 14.101
libswscale      9.  5.101 /  9.  5.101
libswresample   6.  3.101 /  6.  3.101
```

### pandoc --version
```
pandoc 3.12
Features: +server +lua
Scripting engine: Lua 5.4
User data directory: C:\Users\karan\AppData\Roaming\pandoc
Copyright (C) 2006-2025 John MacFarlane. Web:  https://pandoc.org
```
_(Pandoc was not initially installed; installed per-user via the 3.12 MSI installer before proceeding.)_

## Step 2: Git Init + .gitignore

```
git init
# Output: Initialized empty Git repository in D:/motion-studio/.git/
```

`.gitignore` created with entries: `node_modules/`, `out/`, `.env`, `public/brand/`, `*.log`, `.DS_Store`

## Step 3: Folder Creation

```powershell
New-Item -ItemType Directory -Force -Path docs, docs/source, docs/prompts, docs/decisions, skills, brands, remotion-video
```

All folders created successfully.

## Step 4: PRD Conversion

Source file copied from `C:\Users\karan\Downloads\Motion_Studio_PRD.docx` to `docs/source/Motion_Studio_PRD_v1.1.docx`.

```
pandoc -t gfm "docs/source/Motion_Studio_PRD_v1.1.docx" -o "docs/PRD.full.md"
```

Output: `docs/PRD.full.md` — 2342 lines, 129,733 bytes.

## Step 5: Split Results

| File | Sections | Lines |
|------|----------|-------|
| docs/project.md | 1, 2, 3 | 154 |
| docs/architecture.md | 6 | 142 |
| docs/tech-stack.md | 7 | 293 |
| docs/schema.md | 5.2 + sec 16 decisions | 68 |
| docs/guidelines.md | Appendix A | 92 |
| docs/requirements.md | 8 + sec 16 decisions | 240 |
| docs/quality-rubric.md | 10 | 35 |
| docs/roadmap.md | 13 | 17 |
| docs/licensing.md | 15 | 50 |

## Step 6: Phase 0 Foundations Setup

### Pinned Versions & Native Binding Fix
- Resolved npm optional dependency bug on Windows by pinning `@rspack/binding-win32-x64-msvc: 1.7.11`.
- Pinned all `remotion` and `@remotion/*` packages to exact `4.0.533`.
- Added `scripts/check-versions.mjs` (`npm run check:versions`).

### Tooling
- TypeScript compiler in strict mode (`tsconfig.json`).
- ESLint configured with `@remotion/eslint-config-flat` (`eslint.config.mjs`).
- Prettier (`.prettierrc`).
- Vitest 3.2.7 and Vite 6.2.0 installed and configured (`vitest.config.ts`).
- npm scripts: `typecheck`, `lint`, `test`, `check:versions`, `check:licenses`, `determinism`.

### Tokens Skeleton
- Created `src/tokens/`:
  - `springs.ts` (`SPRING_LIGHT`, `SPRING_MEDIUM`, `SPRING_HEAVY`, `SPRING_HERO`)
  - `easing.ts` (`HOUSE_EASE`, `EXIT_EASE`, `SNAP_EASE`)
  - `timing.ts` (`DURATION_*`, `STAGGER_*`, `TEXT_HOLD_MIN`, `textHoldFrames`, `PERSPECTIVE`, `GRAIN`)
  - `colors.ts` (`COLORS`)
  - `safeZones.ts` (`SAFE_ZONE_9_16`, `SAFE_ZONE_16_9`, `SAFE_ZONE_1_1`, `SAFE_ZONES`)
- Added comprehensive unit tests in `src/tokens/__tests__/tokens.test.ts` (13 tests passing).

### Schemas
- Created `src/schema/catalog.ts` and `src/schema/brand.ts` verbatim from `docs/schema.md`.
- Added unit tests in `src/schema/__tests__/schema.test.ts` covering valid and invalid samples (4 tests passing).

### Determinism Verification
- Created `HelloDeterminism` composition in `src/compositions/HelloDeterminism.tsx` and registered in `src/Root.tsx`.
- Created `scripts/check-determinism.mjs` (`npm run determinism`).
- Stills rendered across two runs at frames 0, 15, 30, and 45. All frame SHA-256 hashes matched byte-for-byte.
- Verified `npx remotion still HelloDeterminism out/hello_still.png --frame=30` generated valid still image (56,434 bytes).

### Licensing Register & Audit
- Created `LICENSES.md` recording all dependencies and permissible licenses.
- Created `assets-manifest.json` skeleton for media asset provenance tracking.
- Created `scripts/check-licenses.mjs` (`npm run check:licenses`) auditing package licenses and blocking forbidden packages.
