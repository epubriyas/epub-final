# UI and content audit — 13 October 2026

## Findings and implementation

The audit traced the frontend routes, shared editorial and service components, CMS block renderer, design tokens, responsive rules, theme overrides, and existing browser checks before changing those areas. Live inspection covered the homepage, services, company, solutions, industries, technology, resources, contact and portfolio. Brand colors, fonts, logo, navigation, CMS schemas, publishing filters, and useful illustrations remain in place.

| Area | Finding | Change |
| --- | --- | --- |
| Shared layout | Repeated 100–128px section padding and 80–140px column gaps | Added shared fluid section spacing (40–72px), column gaps (28–64px), and a 68-character reading width. Applied these in the existing styles rather than adding an override stylesheet. |
| Content width | Wide desktop containers and unconstrained CMS prose | Reduced the shared maximum container from 1600px to 1360px and constrained editorial and service prose. |
| Typography | Different large heading scales across service and editorial pages | Reduced shared heading and lead scales; service headings and portfolio desktop headings now reuse the shared tokens. Increased homepage service descriptions and editorial workflow descriptions to 16px. |
| Homepage | Vague service, digital publishing and portfolio headings | Replaced those headings with descriptive labels; made the hero description and services link explicit. |
| Services | Oversized catalog heading and repeated hero description | Added a descriptive catalog title, removed the repeated description from capabilities, and clarified capabilities, requirements, deliverables, workflow and related-service headings. CMS-authored titles and descriptions retain precedence. |
| Calls to action | Large repeated quote prompts and an unrelated orange corner decoration | Made shared quote prompts compact and specific; made service CTAs service-specific; removed the decorative service CTA corner. |
| Company | Repetitive story, mission and vision paragraphs and another end-of-page quote prompt | Removed redundant prose and the extra shared CTA; retained concrete examples, mission, vision, contact section and footer action. |
| CMS blocks | Empty section shells and broken article destinations | Suppressed empty FAQ/timeline/relationship sections, logo walls without approved populated media, and unresolved full-width media. Published insights now link to `/blog/[slug]`. Draft and permission filtering remain intact. |
| Browser checks | Stale Company menu index and deadline label | Resolve the menu section through `aria-controls` and use the existing `Project deadline (optional)` label. |

No dependencies, CMS migrations or database content edits were introduced. Detailed service prose remains in Payload; the changes do not substitute component strings for editable CMS descriptions.

## Verification

- `npm run typecheck`: passed on the final application and regression fixtures.
- `npm run lint`: no errors; four existing unused-argument warnings in `20261012_054530_vercel_private_storage.ts`.
- `npm run test:int`: 16 files and 78 tests passed. After the media guard and fixture refinement, both affected component suites passed again (six tests).
- `npm run build`: production compilation, TypeScript, static-page generation and sitemap generation passed. An earlier build caught a missing required `content` field in the new test fixture; the fixture was corrected before the successful build.
- Production browser crawl: 59 public routes at ten widths from 320px to 1440px passed overflow checks for main content, header and footer, with one page heading and no captured page errors. The existing crawl accepts both 200 and the site's 404 page, so this is layout coverage, not a guarantee that every destination is published.
- Service catalog browser checks passed at 13 widths from 320px to 1920px, including image loading, metadata, unique related links and quote destinations. Six representative service pages passed automated accessibility, quote preselection and process-anchor checks.
- Automated WCAG checks passed for homepage, services and quote surfaces at 390px and 1440px. Mobile menu scrolling, breakpoint scroll-lock release, and the mocked quote submission flow passed after updating stale test selectors.
- Desktop and mobile screenshots were captured in `artifacts/ui-audit/`; representative service, catalog, company/mobile and company/dark screenshots were visually inspected. Initial screenshots were captured during the audit's first edits and are not a pristine pre-change visual baseline. The original source diff provides the exact implementation comparison.
- Initial development-server browser runs timed out during the route crawl and on stale selectors. Built-site coverage and corrected interaction reruns resolved those failures. The complete unrelated end-to-end suite was not run.

## Remaining review

- The privacy and terms pages explicitly await company approval. They remain unchanged and must be completed before public launch.
- Company certifications, security, compliance, partnerships and service capability descriptions need company evidence and editorial approval. This audit does not verify those claims or add certifications, outcomes, guarantees or statistics.
- CMS service overviews still contain repeated general project-requirement language. Editors should replace that repetition with confirmed source-file requirements, deliverables and review responsibilities for each service. No new facts were invented and persisted content was not rewritten in the database.
- The work portfolio remains comparatively long because it includes sample previews and browsing controls. Those functional previews were retained; shortening their composition requires a separate review of the sample-viewing experience.
- Automated accessibility and screenshots do not replace a full screen-reader review, real-device testing or verification of every CMS record's factual meaning.
