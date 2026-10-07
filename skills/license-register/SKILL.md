---
name: license-register
description: How to add a new npm dependency or asset to the project while maintaining LICENSES.md and assets-manifest.json compliance with docs/licensing.md.
---

# Skill: License Register

> Read `docs/licensing.md` (section 15) completely before adding any package or asset.

## Adding an npm package

1. **Verify** the package exists and read its license:
   ```bash
   npm view <pkg> version license
   ```
2. **Check the forbidden list** (from `docs/licensing.md` section 15.2):
   - Non-commercial licenses → **DO NOT USE**
   - Proprietary licenses → **DO NOT USE** (unless freeware tools like DaVinci Resolve)
3. **Check the allowed families**: MIT, ISC, BSD, Apache-2.0, GPL/LGPL (tools only), OFL, CC0, CC-BY.
4. **Install with exact version** (no `^` or `~`):
   ```bash
   npm install <pkg>@<exact-version> --save-exact
   ```
5. **Add a row to `LICENSES.md`**:

   | Package | Version | License | Source | Notes |
   |---------|---------|---------|--------|-------|
   | `zod`   | 4.6.5   | MIT     | https://github.com/colinhacks/zod | Schema validation |

6. **Run** `npm run check:licenses` and paste the output.
7. Commit LICENSES.md in the same commit as the package.json change.

## Adding an asset

1. Identify the license: CC0, CC-BY, OFL, platform license (Pexels/Pixabay).
2. Add a row to `assets-manifest.json`:
   ```json
   {
     "id": "bgm_upbeat_01",
     "type": "audio",
     "source": "https://pixabay.com/music/...",
     "author": "MusicAuthor",
     "license": "Pixabay License",
     "licenseUrl": "https://pixabay.com/service/license/",
     "dateAdded": "2026-10-07",
     "attribution": "Music by MusicAuthor from Pixabay"
   }
   ```
3. If CC-BY, the attribution text goes into the video credits file for that render.
4. Never add assets with identifiable people or third-party brand logos without a signed release.

## Forbidden packages (from docs/licensing.md)

Do not add any of these under any circumstances:
- `depth-anything-v2` (non-commercial)
- Coqui XTTS-v2 (non-commercial)
- Meta MMS-TTS (non-commercial)
- Any beat-tracking models on the non-commercial list

## Running the check

```bash
npm run check:licenses
```

Exit 0 = all clear. Exit 1 = review the flagged rows.
