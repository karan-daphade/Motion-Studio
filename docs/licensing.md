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

