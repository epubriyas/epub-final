# Technology navigation and pages

The Technology PDF informs three public capability pages and a separate Production OS page. Each page includes an overview, capabilities, detailed explanations, an illustrative workflow and common questions. Production OS is presented as an internal initiative in development; its workflow graphic is a concept illustration, and the page does not claim released features or measured efficiency gains.

## Routes

- `/technology`: overview, capability cards, Production OS introduction and existing published CMS Technology content.
- `/technology/production-technologies`: publishing, XML, localization, conversion and quality capabilities.
- `/technology/workflow-automation`: practical automation, AI evaluation and human review.
- `/technology/in-house-development`: operational development, expanded Production OS concept and development process.
- `/technology/production-os`: initiative definition, intended capabilities, conceptual workflow, development process and status questions.
- The Technology dropdown has four direct page links in three groups. Redundant section links were removed; each page has its own clearly labelled on-page navigation.

The shared Technology dropdown uses the existing desktop disclosures and mobile accordion navigation. Services, Resources, Company and backend handlers retain their existing behavior. All four routes are included in the existing XML sitemap. Unknown Technology topic routes return 404. The existing `in-house-development#production-os` section remains accessible for older links.

## Content and collections

The existing `technologies` Payload collection continues to supply published content to the overview. No collection, migration or database record was created. Reference-derived capability copy is centralized in `src/config/technology.ts` and `src/config/technology-guides.ts`; shared UI lives in `src/components/technology/TechnologyContent.tsx` and `TechnologyGuide.tsx`. This update does not implement Production OS software or add CMS fields for the static capability pages.

## Changed files

- `src/config/navigation.ts` — Technology submenu and destinations.
- `src/config/technology.ts` — reference-based public copy and concept descriptions.
- `src/config/technology-guides.ts` — detailed explanations, tool groups, examples and questions.
- `src/components/navigation/Header.client.tsx` — scoped Technology dropdown class.
- `src/components/technology/TechnologyContent.tsx` — capability cards, OS concept and development process.
- `src/components/technology/TechnologyGuide.tsx` — reading navigation and detailed content sections.
- `src/app/(frontend)/technology/page.tsx` — expanded overview, existing CMS content retained.
- `src/app/(frontend)/technology/[topic]/page.tsx` — three topic pages and metadata.
- `src/app/(frontend)/technology/production-os/page.tsx` — dedicated initiative page and metadata.
- `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts` — new route entries.
- `src/styles/technology.css`, `src/styles/index.css` — responsive, scoped styles respecting theme and reduced motion.
- `src/lib/i18n/catalog.ts`, `public-ui-texts.json`, `ta.json` — new public copy allowlist and Tamil navigation labels.
- `tests/e2e/technology.e2e.spec.ts` — routes, anchors, desktop/mobile navigation, layout and accessibility.
- `tests/e2e/resources.e2e.spec.ts` — accommodates Technology becoming a disclosure.

## Validation

Run `npm run typecheck`, targeted ESLint, and `npm run test:e2e -- tests/e2e/technology.e2e.spec.ts tests/e2e/resources.e2e.spec.ts --reporter=line`. For an existing server on port 3000 set `PLAYWRIGHT_BASE_URL=http://localhost:3000`. Browser tests save screenshots under `artifacts/technology`.

Verified locally: TypeScript and targeted ESLint passed; all five Technology/Resources browser tests passed. The two Technology tests also passed again with dark-theme accessibility coverage. Visual review covered the settled desktop dropdown and desktop/mobile Production OS section. A production build was not run.

After the detailed-content expansion, TypeScript and targeted ESLint passed again. Both Technology browser tests passed across all four pages, including direct menu destinations, section anchors, 320–1440px layouts and light/dark accessibility. Desktop overview/tool sections and the dedicated mobile Production OS page were visually reviewed.
