# Open Source License Register

> Aligned with `docs/licensing.md` and `docs/tech-stack.md`.
> Every production and development dependency is recorded here before commit.

## Pinned Core Dependencies

| Package | Pinned Version | License | License Family | Notes / Permitted Use |
|---------|----------------|---------|----------------|-----------------------|
| `remotion` | 4.0.533 | Remotion License | Remotion License | Free for commercial use up to 3 developers |
| `@remotion/cli` | 4.0.533 | Remotion License | Remotion License | CLI & studio tools |
| `@remotion/tailwind-v4` | 4.0.533 | Remotion License | Remotion License | Tailwind v4 bridge |
| `react` | 19.2.3 | MIT | Permissive | Free commercial use |
| `react-dom` | 19.2.3 | MIT | Permissive | Free commercial use |
| `tailwindcss` | 4.0.0 | MIT | Permissive | Free commercial use |
| `zod` | 3.24.2 | MIT | Permissive | Schema and catalog validation |

## Development Tooling

| Package | Pinned Version | License | License Family | Notes / Permitted Use |
|---------|----------------|---------|----------------|-----------------------|
| `@remotion/eslint-config-flat` | 4.0.533 | ISC | Permissive | Lint configuration |
| `@types/node` | 26.6.4 | MIT | Permissive | TypeScript definitions |
| `@types/react` | 19.2.7 | MIT | Permissive | TypeScript definitions |
| `@types/web` | 0.0.166 | MIT | Permissive | TypeScript definitions |
| `eslint` | 9.39.5 | Apache-2.0 | Permissive | Linting tool |
| `prettier` | 3.8.1 | MIT | Permissive | Code formatter |
| `typescript` | 5.9.3 | Apache-2.0 | Permissive | Compiler |
| `vite` | 6.2.0 | MIT | Permissive | Test bundler |
| `vitest` | 3.2.7 | MIT | Permissive | Unit test framework |

## Prohibited Packages and Licenses

The following packages and license families are strictly forbidden in this repository:
- Non-frame-driven animation libraries: `framer-motion`, `motion`, `react-spring`
- Copyleft / GPL in client builds: `GPL-1.0`, `GPL-2.0`, `GPL-3.0`, `AGPL-1.0`, `AGPL-3.0`
- Non-commercial licenses: `CC-BY-NC`, `NC`, non-commercial AI weights
- Unverified licenses or assets missing provenance rows in `assets-manifest.json`
