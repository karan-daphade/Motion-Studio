<span id="sec_16" class="anchor"></span>4. Creative Strategy and Art
Direction

Creative decisions are made and written down **before** code. This
section is the brief every agent reads first.

<span id="sec_17" class="anchor"></span>4.1 The big idea

A premium ad has one thesis. Three candidates are proposed; the owner
picks one for the hero film. The recommendation is Option A.

| **Option** | **Thesis** | **Signature device** | **Risk** |
|----|----|----|----|
| A. The Soundbox (recommended) | Every Indian shopkeeper knows the sound of a payment announced aloud. 'Your restaurant should announce itself.' Orders, tables and bills each get a confident, satisfying sound and a matching visual pulse. | A recurring sonic and visual 'ding' tied to the rupee amount; a QR code that match-cuts into a table, a plate, a bill. | Must stay generic: no real payment-brand trademarks, sounds or voices. |
| B. Chaos to Calm | A noisy, overloaded dinner rush resolves into a quiet, ordered system. | Rapid chaotic montage that snaps into a calm grid when the product appears. | Easy to overdo; needs strong sound design to land. |
| C. One QR, Whole Restaurant | A single QR code is the thread that connects customer, kitchen and owner. | Continuous camera move following one order from table to kitchen to bill. | Technically the most demanding (long continuous 3D move). |

<span id="sec_18" class="anchor"></span>4.2 Visual identity and look

- **Palette:** deep dark base (#0B0F19), elevated surface (#161F30), one
  saturated primary (#3B82F6), one warm accent (#10B981 or a saffron
  tone chosen at style-frame stage). Never more than two accents in a
  scene.

- **Light and mood:** dark UI glass lit by warm practical light (the
  glow of a counter lamp, kitchen heat) to add human warmth to a cool
  interface.

- **Texture:** subtle seeded film grain, soft vignette, restrained
  bloom. Surfaces are matte, glass or brushed metal, never plastic
  gradients.

- **Layout:** strict grid, asymmetric compositions, generous negative
  space, one hero element per scene.

- **Typography:** Inter or Outfit for English; Noto Sans Devanagari,
  Mukta or Hind for Hindi and Marathi. A maximum of two typefaces per
  video. Large, confident type with controlled hierarchy.

- **Local visual language:** chai counter, thali, steel utensils,
  handwritten menu boards, WhatsApp green, UPI and rupee context,
  festival marigold and diya tones used sparingly. Specific, never
  stereotyped or clip-art.

<span id="sec_19" class="anchor"></span>4.3 Motion identity: the token
system

Every animation pulls from named tokens. Values below are starting
points to be tuned during style-frame review. Frame numbers assume 30
fps.

| **Token** | **Value** | **Used for** |
|----|----|----|
| SPRING_LIGHT | damping 18, mass 0.6, stiffness 180 | Chips, icons, small UI elements |
| SPRING_MEDIUM (house) | damping 14, mass 0.8, stiffness 120 | Cards, list items, buttons |
| SPRING_HEAVY | damping 20, mass 1.2, stiffness 90 | Panels, devices, large surfaces |
| SPRING_HERO | damping 26, mass 1.6, stiffness 70 | Hero object reveals, camera settles |
| HOUSE_EASE | cubic-bezier(0.22, 1, 0.36, 1) | Default ease-out for entrances |
| EXIT_EASE | cubic-bezier(0.64, 0, 0.78, 0) | Exits and fades-out |
| SNAP_EASE | cubic-bezier(0.16, 1, 0.3, 1) | Quick UI responses (button press, toggle) |
| DURATION_MICRO / STANDARD / PANEL / HERO | 6-9 / 12-18 / 20-30 / 36-60 frames | Timing ladder for choreography |
| STAGGER | 3-5 frames between siblings | Lists, grids, word reveals |
| TEXT_HOLD | Minimum 36 frames, plus 8 frames per word beyond four | Readability floor for any on-screen text |
| PERSPECTIVE | 1200 px; rotateX 10 deg, rotateY -8 deg resting tilt | 2.5D device and card presentation |
| GRAIN | Seeded noise at 3-4 percent opacity | Anti-banding and film texture |

**House tokens and brand tokens.** The values above are the studio's
house defaults. In Multi-Brand Mode a brand may adjust motion tokens
only inside the bounded ranges in section 16.6; safe zones, text-hold,
contrast and Devanagari rules can be made stricter by a brand but never
relaxed.

**Principle:** heavier objects move slower and settle later. A phone
moves differently from a small badge. Secondary motion (follow-through,
slight overlap, settle) is added to everything that moves.

<span id="sec_20" class="anchor"></span>4.4 Anti-generic rules: avoiding
the 'AI video' look

| **Common tell** | **Rule this PRD enforces** |
|----|----|
| Purple-blue gradient backgrounds everywhere | Palette comes from the brand tokens; backgrounds are lit scenes or tonal darks, not default gradients. |
| Glassmorphism on every element | Glass is used only for hero surfaces. Most elements are solid or matte. |
| Everything centered, same entrance for every element | Asymmetric compositions; entrances vary by object weight and importance. |
| Uniform pacing | Deliberate fast and slow beats, with at least one moment of near-silence and stillness per film. |
| Default whooshes and stock TTS voice | Designed sound palette in the music's key; human voice actor for hero film; AI voice only for variants. |
| UI floating in a void | UI lives on devices in physical settings with lighting, shadow and depth of field. |
| Too many elements per scene | One hero per scene. Maximum three simultaneous text items. |
| Perfectly smooth, lifeless camera | Subtle seeded handheld drift, rack focus, and motion blur. |
| Text-heavy slides | Maximum about seven words on screen at a time; pictures carry the story. |
| Mismatched assets from different sources | All generated or stock assets pass through the same grade, grain and lens treatment. |

<span id="sec_21" class="anchor"></span>4.5 Storytelling frameworks

| **Structure** | **Length** | **Beats** |
|----|----|----|
| Reel (single feature) | 15-30 s | Hook (0-2 s) pain, then Reveal (product), Demo (one feature in action), Proof (number), CTA (last 3 s). |
| Brand film | 45-60 s | Hook, Problem world, Turn (the moment it changes), Product montage, Human proof (owner moment), Promise, CTA and logo sting. |
| Bumper | 6 s | One visual, one benefit, logo and sonic sting. |
| How-to | 30-60 s | Goal stated, 3-5 numbered steps, recap. |

**Hook formulas to test:** (1) a pain question ('Customers waiting 20
minutes just to see the menu?'), (2) a surprising number, (3) a visual
transformation, (4) a relatable restaurant moment, (5) a local-language
proverb or idiom reworked for the product. Each video ships with at
least three hook variants.

<span id="sec_22" class="anchor"></span>4.6 Reference study protocol

1.  Collect 15-20 reference videos from respected product and brand
    films (for example Linear, Stripe, Raycast, Arc, Apple product
    films, and well-regarded Indian fintech and food-tech ads).

2.  Sample frames at fixed intervals and analyze them with a vision
    model for: framing, depth, easing character, pacing, text treatment,
    color, and audio mood.

3.  Summarize findings as a one-page **motion language brief** and store
    it in docs/references/.

4.  Never copy shots or assets; extract principles only.

<span id="sec_23" class="anchor"></span>4.7 Style-frame process

Before any composition code, produce 5-8 still style frames covering:
hero frame, a feature frame, a Devanagari type frame, a 3D device frame,
a data frame, an end card. They may be built in Figma (free tier) or as
Remotion stills. The owner approves them; the agent then replicates them
frame-accurately and uses them as the reference for the visual critique
loop.

