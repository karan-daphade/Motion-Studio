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

