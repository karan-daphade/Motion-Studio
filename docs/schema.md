<span id="sec_26" class="anchor"></span>5.2 Schema (Zod)

> // src/catalog/schema.ts
>
> import { z } from 'zod';
>
> export const Lang = z.enum(\['en', 'hi', 'mr'\]);
>
> const LocaleCopy = z.object({ title: z.string().max(48), sub:
> z.string().max(90) });
>
> export const Feature = z.object({
>
> key: z.string(), // e.g. 'qr_ordering'
>
> category: z.enum(\['Customer
> Experience','Operations','Billing','Setup','Insights'\]),
>
> availability: z.enum(\['live', 'beta', 'roadmap'\]),
>
> uiComponent: z.string(), // component registered in components/
>
> mockData: z.record(z.any()), // props passed to the UI component
>
> heroMetric: z.object({ value: z.string(), label: Lang.optional()
> }).optional(),
>
> locales: z.object({ en: LocaleCopy, hi: LocaleCopy, mr: LocaleCopy }),
>
> voiceover: z.record(Lang, z.string()).optional(), // script lines per
> language
>
> sfxCues: z.array(z.object({ frame: z.number(), sfx: z.string()
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
> palette: z.record(z.string()), // background, surface, primary, accent
>
> cta: z.record(Lang, z.string()),
>
> logo: z.object({ svg: z.string(), sting: z.string() }),
>
> });


<!-- Section 16 Open Decisions (rows 4 and 9 are referenced here) -->

<span id="sec_86" class="anchor"></span>16. Open Decisions

| **\#** | **Decision** | **Options** | **Needed by** |
|----|----|----|----|
| 1 | Big idea for the hero film | A Soundbox, B Chaos to Calm, C One QR | Gate G1 |
| 2 | Final product name in assets | BharatQR (working name) or final brand | Before hero film |
| 3 | Who reviews Hindi and Marathi copy and audio | Native-speaking friend, colleague, or paid reviewer (Part B) | Phase 1 |
| 4 | Voice approach for hero film | Human volunteer with release, free cloud or open-source voice, or paid actor later | Phase 4 |
| 5 | Live-action footage | Shoot at a real cafe, use free stock, or illustrated plates only | Phase 8 |
| 6 | Whether to release before roadmap features ship | Vision film with 'coming soon', or wait | Phase 8 |
| 7 | Render machine | Local workstation or later cloud (Part B) | Phase 0 |
| 8 | Team size trigger for Remotion license | Stay at 3 or fewer, or budget the license | Ongoing |
| 9 | Sonic logo and 'ding' design approach | In-house with free DAW, or commissioned (Part B) | Phase 4 |

