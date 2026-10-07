# BharatQR Brand Profile: Assumed Fields Register

> Updated: 2026-10-07 after Brand Intake ingestion from `C:\Users\karan\Desktop\MyPOS`.
> Reference: PRD Section 16.4, Appendix F, Appendix G, and BRD-06 provenance rules.

## Resolved / Promoted to "Provided" from Source Codebase

| Field Path | Source in Codebase | Promoted Status |
|---|---|---|
| `colors.primary` (`#E8590C`) | `config/branding.ts` (`branding.primaryColor`) | `provided` |
| `colors.secondary` (`#0F172A`) | `config/branding.ts` (`branding.secondaryColor`) | `provided` |
| `colors.accent` (`#10B981`) | `config/branding.ts` (`branding.accentColor`) | `provided` |
| `typography.families` (`Inter`) | `config/branding.ts` (`branding.fontFamily`) | `provided` |
| `strategy.taglines.en` | `config/branding.ts` (`branding.tagline`) | `provided` |
| `business.competitors` | `docs/PROJECT.md` & `docs/FEATURES.md` | `provided` |
| `business.stage` | `docs/PROJECT.md` & `docs/FEATURES.md` | `provided` |
| `contacts[0]` | Karan Datta Daphade (`karan@bharatqr.internal`) | `provided` |
| `identity.logos` | `public/logo.png` & vector SVG | `provided` |
| `legalName` | `BharatQR Technologies` | `provided` |

## Remaining Items Pending Owner Confirmation

| Field Path | Current Value | Rationale | Owner Action Required |
|---|---|---|---|
| `project.deadline` | `"2026-12-15"` | Target launch campaign deadline | Confirm target video delivery date |
| `compliance.trademarkNotes` | Pending formal filing | Working name in PRD Decision 2 | Confirm trademark filing status |
| `assets.missing` | `sonic-logo.wav` | Audio sonic brand sting | Provide official audio sting asset |

## Provenance Rule Enforced
As mandated by **BRD-06** and **BRD-08**:
- All promoted fields have direct traceability to `C:\Users\karan\Desktop\MyPOS`.
- The brand status remains `"draft"` until native localization review and formal lock.
