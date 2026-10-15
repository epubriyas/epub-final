# Homepage and services directory content handoff

Implemented from EPUBTRANS Website Revamp version 1.0 dated 12 October 2026, with the user's explicit instruction to preserve the existing UI taking priority over design changes. Existing stylesheets, fonts, artwork, responsive rules and animation components are retained. Required content sections reuse the current presentation classes.

## Content and destinations

The homepage uses the supplied hero, two audience pathways, six service categories, source-to-output explanation, four ordered workflow steps, four differentiators, optional approved portfolio and resource previews, and final enquiry. The directory uses the supplied introduction, six semantic category anchors, 17 entries representing 15 established service destinations plus XML/JATS enquiry and supporting PDF recreation, two audience sections, project guidance and five native FAQ disclosures. Search covers category titles, service titles and descriptions.

XML/JATS links to `/get-a-quote`; PDF recreation links to `/data-conversion-services`. Translation, subtitling, voiceover and transcription begin with `pendingApproval` status and lead to an enquiry. An editor can change each status to `active` after confirming scope; its established destination is retained in the CMS. `hidden` cards are withheld. Indexing is not added to the directory, and no XML, OCR or PDF recreation URLs are created.

Portfolio previews use the existing published and permission-confirmed query and require actual preview material. Resource previews use published articles with relevant publishing, localization or accessibility titles, metadata or categories. Empty and unrelated previews are omitted.

## Editing and migration

Payload Admin → Homepage and Services Directory contains editable `homeContent` and `servicesContent` JSON documents, seeded with the verbatim handoff copy. They control headlines, paragraphs, audience cards, categories, card descriptions, CTAs, FAQs and metadata. The editor preserves the documented field structure. Validation checks field types, internal URLs, card statuses and unique anchors. Category and card `sortOrder` values control directory order. Existing individual service records are unchanged.

The new global replaces the previous generic homepage block layout for this route. Other CMS pages and blocks remain supported. The editorial status records review progress; it does not deploy the site or certify claims. The existing draft homepage blocks are retained in the database.

Migration `20261014_074433_landing_pages` creates and seeds only the new global table and enum. It has been applied to the local development database without resetting existing data. Deployments must apply this migration before serving the updated routes. The schema snapshot includes the preceding contact/quote schema; the migration deliberately excludes those already-applied changes.

SEO titles are absolute so the shared layout does not append EPUBTRANS twice. Canonicals use `/` and `/services` against the configured server URL, matching the existing sitemap conventions. Localhost and Vercel preview landing pages are noindex; set `SITE_NOINDEX=true` on other staging hosts. CMS `seo.noIndex` can also disable indexing per landing page.

The main navigation presentation is retained under the user's UI constraint. Existing unpublished-service fallbacks now point to the new category anchors. The shared quote route and form behavior are retained.

## Launch decisions

Management must still confirm wording, service availability, XML/JATS scope, multimedia delivery claims, accessibility testing scope, indexing disposition and production hostname. No claim approval, certification, external publication or deployment is implied by this implementation.

## Verification

- Production build, TypeScript compilation and sitemap generation passed.
- Lint passed with no errors and four existing unused-argument warnings in the private-storage migration.
- Integration tests: 21 files and 96 tests passed.
- Final production browser check passed for both landing pages: exact metadata, six anchor destinations, search, keyboard FAQs, quote navigation, five viewport widths and automated accessibility at desktop and mobile sizes. All 15 established service URLs, the quote route and English/Tamil landing routes returned 200.
- Both existing homepage workflow tests passed, covering animation, seven widths, light/dark accessibility, reduced motion and rendering without JavaScript.
- Desktop and mobile screenshots were inspected. Local QA images are in `artifacts/landing-handoff/` and excluded from Git.
