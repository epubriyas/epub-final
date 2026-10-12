# Service pages: audit, implementation and release notes

## Repository audit

- Next.js 16.3.6, React 19, TypeScript, Tailwind 4, Payload 3.90.2 and PostgreSQL. The existing styling system is global CSS with tokens and scoped page styles; no motion library is installed.
- Public routes are `/services` and `/services/[slug]`. Category links use `#publishing`, `#language`, `#media`, `#learning` and `#accessibility`. These URLs are preserved.
- Service records already contain title, slug, a category select, short description, hero copy, Lexical overview, features, workflow, FAQs, publication status and SEO fields. ServiceCategories is a separate collection with no Services relationship. Existing category data is retained.
- The initial catalog contained 16 service records: 13 published, with Accessibility, Proofreading and Subtitling still drafts. Accessibility has copied copyediting workflow descriptions and needs editorial review before publication. No existing record was republished or rewritten.
- The generic DetailPage supplied basic text, lists and FAQs, with identical layouts and no service visuals, related links or quote preselection. The listing duplicated Desktop Publishing across two groups.
- Reused components and infrastructure: localized links, header/footer, RichText, native details/summary, lightweight CSS reveals, Media storage and focal points, content access helpers, metadata helper, sitemap and existing quote form/API.
- Media already supplies alt text, local storage, responsive image sizes and focal points. Existing publishing, education and media photography is reused where relevant. Other services use distinct, labeled illustrative compositions.
- The initial TypeScript check passed. The existing quote form accepts broad service categories rather than individual catalog titles.

## Implementation

1. Scoped service tokens in `src/styles/services.css` use the requested brand palette without changing unrelated pages. Primary action backgrounds use a darker teal for readable white text.
2. Editorial, technical and publication hero variants use the service's CMS title as the animated main heading on every service page. Hero description and eyebrow remain CMS-editable; stored marketing headlines do not replace the service name.
3. Reusable sections render overviews, numbered capabilities, source/output comparisons, sorted workflows, optional quality notes and use cases, related services, native FAQs and project CTAs. Empty optional sections are omitted.
4. Each catalog service has a visual profile in `src/config/service-design.ts`: publication layout, XML, digital reading, editing, language, accessibility, conversion, audio, subtitles, learning, cover/asset design or indexing. Unknown services receive a neutral fallback.
5. Hero imagery uses Next Image with responsive sizing, a reserved aspect ratio, focal points, hero preloading and an error fallback to the service diagram. Below-the-fold visual explanations use selectable HTML rather than raster infographics.
6. Published CMS relationships take precedence over suggested related slugs. Suggestions resolve against the actual published catalog. Self-links, duplicates, drafts and unresolved relationships are excluded.
7. Metadata remains CMS-driven with unique canonical, Open Graph and Twitter fields; uploaded hero media supplies social images when available. Breadcrumb structured data is escaped. FAQ schema is deliberately omitted. The existing dynamic sitemap already includes published services.
8. Quote CTAs pass an allowlisted existing category in `?service=`. The server and form both validate it. The submission API, files, consent, email and review steps are preserved.
9. Short scroll reveals use transforms with full text opacity, respect reduced motion and leave content visible without animation. Manual Light/Dark controls continue to work.

## CMS editing

The XML hero now plays a four-second transformation on first entering the viewport: source lines draw, the output panel enters, and XML lines reveal with a short highlight. It stops automatically and offers keyboard-accessible replay. Mobile retains the source article above the XML output. Reduced-motion and JavaScript-disabled visitors receive readable static content; replay space is reserved to prevent hydration layout shifts. Animation, replay, mobile overflow, static fallback and reduced-motion browser checks passed, along with the light/dark accessibility checks.

Existing fields remain intact. Newly optional fields are:

- `hero.image`: Media upload; image uploads are rendered, missing/non-image uploads fall back.
- `hero.layout`: editorial, technical or publication override.
- `visualExplanation`: title, description, sourceLabel and outputLabel.
- `quality`: verified titles and descriptions of review practices.
- `useCases`: titles/descriptions, optionally linked to a published Industry.
- `relatedServices`: service relationships; the picker filters published records and excludes the current record.

Existing `faqs` provide accessible native disclosures. Add genuine questions through the CMS when available. Quality, use cases and FAQs remain absent on records that have no approved content; the renderer does not fabricate them. CTAs use fixed existing destinations rather than introducing another form or a configurable unsafe URL.

## Validation completed

- `npm run lint`: passed, with no warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, including next-sitemap postbuild.
- Targeted integration checks: 37 tests passed across service design, optional sections, quote form, quote API and email mocks. Email tests were run with `RESEND_API_KEY` cleared in that test process to prevent local provider configuration overriding SMTP mocks; provider settings were not changed on disk.
- All five browser checks passed in the final run.
- All 13 published services plus the listing checked at 320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1600 and 1920 pixels, with no horizontal document overflow.
- Six representative service types passed automated WCAG 2/2.1/2.2 A/AA axe checks in light and dark themes. These automated checks do not constitute certification.
- Verified metadata, one H1, published related links, image loading, unavailable-image fallback, missing CMS fields, invalid/draft 404s, reduced motion, process anchors, quote category preselection, invalid parameter rejection, mobile navigation, and no browser console or page errors in the catalog run.
- Production HTTP smoke passed against `next start`: listing, publication/technical/editorial service variants, quote route and invalid-slug 404. The temporary production server was stopped after verification.
- `npx tsx scripts/verify-service-cms.ts`: verified optional fields, populated relationships and public draft access against PostgreSQL using a temporary draft, removed afterwards.
- Screenshots in `artifacts/services/` were visually inspected at desktop and narrow mobile sizes.

## Deployment

The additive migration `20261011_111342_services_premium` is generated, registered and applied to the local database. Payload types were regenerated with `npm run generate:types`. An unrelated pre-existing Media nullability difference was excluded from this migration and snapshot.

For the VPS release, take the normal database backup and run `npm run payload -- migrate` with the release's database configuration **before serving the updated application**. The equivalent Docker deployment uses the existing migrate service. No deployment was performed by this task. No content reseeding is required; existing published records render with the new fallbacks immediately.

Payload may warn about historical development schema pushes when its dev marker is present. Locally, only the reviewed additive service migration was pending. Do not assume that warning is harmless for a different database: inspect its migration status and schema before running release migrations.

## Subtitling and Accessibility upgrade

The existing local Subtitling and Accessibility records were drafts, so their navigation links had no public page. They now have expanded editable copy, capabilities, workflow, project review considerations, use cases, FAQs and metadata, and are published locally. Original records were saved under the ignored `.local-backups` directory before updating.

Both pages use editorial image heroes, matching the eLearning Localization presentation. Uploaded CMS hero media still takes precedence. Existing media and accessibility imagery supply the image fallback.

The Subtitling transformation section now includes an illustrative subtitle sequence with cue selection, play, pause and reset. Playback stops after the sequence; reduced-motion visitors can choose cues manually. The Accessibility section lets readers switch between visual layout, reading order and a written alternative. These studies explain content preparation and do not certify a compliance outcome.

No schema migration is required. New copy lives in the existing service fields and remains editable in Payload. `scripts/create-subtitling-accessibility-pages.ts` is restricted to local databases, backs up draft records before updating and preserves already published records on subsequent runs. Production needs the application update plus published service content in its own Payload database; use the existing content-transfer workflow or edit the two records in production Payload.

`node scripts/verify-service-upgrades.mjs` checks both pages on the local development site: loaded hero images, desktop/tablet/mobile overflow, subtitle controls, reading views, reduced motion and scoped automated accessibility checks. Captures are in `artifacts/services-upgrade`.
