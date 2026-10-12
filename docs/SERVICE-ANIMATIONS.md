# Service animation inventory

Defined before implementation. Scope: existing service detail pages; catalog, CMS records and forms retain their behavior. Every scroll sequence runs once. Shared observer, easing and timing tokens do not supply a shared entrance effect.

| Section | Concept | Trigger | Duration / movement | Desktop | Mobile | Reduced motion / no JS | Assigned elsewhere? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hero heading | Baseline typography mask | First viewport entry | 700ms, lower edge opens over heading | Full heading aperture | Same, 480ms | Complete heading | No |
| Hero supporting copy / action | Opacity settling / button compression release | Hero entry | 500ms / 480ms, scale 0.97 to 1 | Small secondary accents | Same, shorter | Full copy and action | Secondary hero accents only |
| Hero illustration | Color registration | Hero entry | 800ms, muted palette settles to brand colors | Reserved art bounds | Static art; XML retains its own sequence | Complete visual | No; digital edition turn belongs only to the EPUB explanation |
| Hero photography | Diagonal polygon aperture | Hero entry | 900ms, corner opens | Reserved image aspect ratio | 600ms | Complete image | No supporting photography exists; do not reuse here if one is added |
| XML hero demonstration | Source lines to syntax assembly | Visible once; explicit replay | Existing 4s sequence, source line composition then row emphasis | Source and code side by side | Stacked source and code | Complete markup, no replay | No; code uses emphasis rather than another text mask |
| Introduction | Static reading | None | None | Static | Static | Static | No animation assigned |
| Capabilities | Editorial row stagger | List entry | 550ms each, 90ms stagger, 8px baseline settling | Individual rows | 4px movement, 60ms stagger | Complete list | No |
| Technical explanation | Routed transformation and semantic output assembly | Diagram entry | 900ms path trace; 650–950ms output, after source/node checkpoints | Source → connector → output | Vertical connector on small phones; smaller output motions | Complete diagram and connector | No |
| Workflow | Discrete stage spotlight | Timeline entry | 650ms per stage, 400ms interval | Number and panel highlight passes between stages | Existing vertical list; same spotlight | Complete numbered stages | No; no connector drawing |
| Quality / applications | Static references | None | None | Static | Static | Static | No animation assigned |
| Related services | Editorial deck un-fanning | Link group entry | 750ms, cards settle from a small lateral fan with individual tilt; no opacity stagger | Cards converge into columns | Static entrance, small link hover | Complete links | No; distinct from capability row reveal |
| FAQ | Native answer expansion | Pointer / Enter / Space on summary | 240ms, height and answer opacity | Native details with progressive CSS enhancement | Same | Instant native details | No |
| Final CTA | Optical focus and orbiting accent | Section entry | 800ms warm text edge settles; 900ms decorative accent rotation | Heading and supporting copy stay in place, accent frames them | Text emphasis only, static accent | Full heading and accent | No; no mask or row entrance |
| Final CTA action | Inset underline emphasis | Hover / keyboard focus | 180ms inset accent | Button keeps bounds | Same | Instant | No |

## Transformation variants

Connector routing belongs only to the technical explanation, with a source checkpoint, travelling route and destination checkpoint. Output behavior depends on the existing illustration kind, without adding capability claims:

| Existing kind | Output sequence |
| --- | --- |
| XML | Schema outline checkpoint moves from structure teal to review orange; code remains readable |
| Layout / typesetting | Publication columns align to the page grid |
| Reader / EPUB | Publication plane turns from page to digital reading surface |
| Language / localization | Terminology scan crosses target requirements; source remains fixed |
| Learning | Module order settles with vertical spacing |
| Editing / proofreading | Existing deletion dims; insertion receives editorial emphasis |
| Conversion | Source/output formatting boundary straightens |
| Accessibility | Existing hierarchy receives sequential level checkpoints |
| Audio | Recording wave gives way to deliverable line rhythm |
| Subtitles | Existing timing cue receives a cursor sweep |
| Design | Publication palette blocks assemble |
| Index | Existing references receive ordered index markers |

The previous shared `sp-rise` effect is removed from service details. All base CSS renders final content; JavaScript only marks observed sections for one-shot enhancements. No scroll listeners, animation package, autoplay carousel, parallax or indefinite loop. Changing the motion preference immediately disables CSS motion and suppresses pending entrances.

## Validation — 11 October 2026

- Inventory reviewed for distinct major concepts; removed XML row masks and the hero perspective turn to avoid duplicating the hero typography and EPUB explanation.
- `npm run lint`, `npm run typecheck` and `npm run build` passed, including sitemap generation.
- 13 service integration tests passed.
- 12 Chromium/Edge browser tests passed: one-shot entry, related-route initialization, ten published service storytelling examples, XML keyboard replay, reduced motion (including live preference changes), JavaScript-disabled content, native FAQ keyboard expansion, optional image fallback, metadata/relationships, quote preselection, draft/invalid 404s, mobile navigation and light/dark WCAG checks.
- Catalog plus all 13 published service pages fit 13 widths: 320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1600, 1920px.
- Settled previews: `artifacts/services/motion-xml-desktop.png`, `motion-transformation-mobile.png`, and `typesetting-320.png`.

Native FAQ height interpolation is progressive enhancement; browsers without support keep functional native disclosures. FAQ browser validation uses a local fixture because the current published CMS records have no FAQ entries. Accessibility and subtitles illustration variants exist for the current draft services; draft content remains unpublished.
