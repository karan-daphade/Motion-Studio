# ADR 001: Preview vs Release Modes for Catalog and Review Gate

## Status
Accepted

## Context
Functional Requirement **CAT-04** dictates that a feature is renderable for distribution only when copy for all target languages (English, Hindi, Marathi) exists and has passed native review. Per Open Decision 3, Hindi and Marathi transcreated copy must be verified by a native speaker.

However, during active iteration, local Studio previews and development testing must not be blocked before native review is completed.

## Decision
We introduce two distinct operational modes across the catalog loading engine and CLI tooling:

1. **`preview` mode (Default for Studio and dev previews)**:
   - Verifies structural integrity, schemas, and that copy exists for all declared languages (`brand.localization.languages`).
   - Checks review status (`reviewedBy` / `reviewedOn`). If strings are unreviewed, logs clear diagnostic warnings (`[WARN]`) without aborting execution.
   - Allows animators and agents to assemble layouts, test typography, and preview animations.

2. **`release` mode (Enforced for production batch rendering and CI distribution)**:
   - Strictly enforces the **CAT-04** review gate.
   - If any transcreated language (e.g. Hindi or Marathi) lacks a recorded native reviewer (`reviewedBy` / `reviewedOn`), release is immediately blocked (`exit 1` / thrown Error).
   - Guarantees zero unreviewed copy reaches final published outputs.

## Consequences
- Developers and agents can build and preview scenes incrementally.
- No video can be rendered for release without passing native review sign-off.
