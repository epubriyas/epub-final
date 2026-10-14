# About EPUBTRANS requirements checklist

Source: **EPUBTRANS Website Revamp — About Us Page**, Phase 1, Page 03, Content Draft v1.0, 12 October 2026. The complete document text was extracted: 143 non-empty paragraphs and five tables. It contains no text boxes or tracked changes. Word visual rendering was unavailable because LibreOffice is not installed; the text, headings, tables, URL map, metadata, and implementation notes were reviewed.

| Requirement | Existing state | Status and implementation |
| --- | --- | --- |
| Position EPUBTRANS as a digital publishing, content-transformation and localization production partner | The existing About copy used a different headline and general publishing/localization positioning. | **Implemented.** Added the supplied hero and copy while retaining the established site shell and styles. |
| Use `/about-us` as production URL; keep `/company` unless migration evidence supports changing URLs | `/about-us` redirected to `/company`; `/company` held the About content. | **Implemented.** `/about-us` serves the canonical page, `/company` remains a working compatibility alias, and the conflicting redirect was removed. Navigation and sitemap use `/about-us`. |
| Exact SEO title, description, H1 and canonical candidate | Existing metadata did not match the brief. | **Implemented.** Set the exact title, description, H1 and `https://www.epubtrans.com/about-us` canonical. Social metadata follows the same values. |
| Hero with supplied positioning, three intro paragraphs and two CTAs | Existing hero used different content. | **Implemented.** “Discuss Your Project” links to `/get-a-quote`; “Explore Our Services” links to `/services`. |
| Who We Are with four paragraphs | Existing page had different company/story copy. | **Implemented** with all four supplied paragraphs. |
| Who We Work With, with publisher and localization audience blocks | Audience information was distributed across general company content. | **Implemented** with both supplied audience blocks, complete copy and links to `/typesetting-services` and `/desktop-publishing-services`. |
| What We Do, with six capability cards | The prior page used overlapping general capability prose. | **Implemented** with all six supplied categories and descriptions. Added the mapped SciELO XML, eBook, data conversion and accessibility links. |
| Our Approach, four ordered steps and closing sentence | Existing infographic used differently named stages. | **Implemented** in the supplied order and with all instructions. |
| What Matters in Our Work, four practical differentiators | Existing page had general “Why EPUBTRANS,” Leadership and Trust content. | **Implemented** with all four supplied blocks; no metrics or proof claims were added. |
| Mission & Vision editable through CMS, with approval before replacement | Existing statements were present; the replacement copy is explicitly new and awaits management approval. | **Implemented with approval pending.** Added editable Payload fields and a gate that displays replacement statements only when both are populated and management approval is checked. Existing statements remain the default. |
| Where We Work: approved Chennai location and international focus | Existing location and contact details were elsewhere on the site. | **Implemented** using the supplied location and engagement-specific wording. Existing careers and global-presence routes remain available. |
| Explore Our Services and final Work With EPUBTRANS CTA | Existing page used repeated generic CTAs. | **Implemented** with both supplied sections and copy. Directory links go to `/services`; final “Discuss Your Project” and “Request a Quote” links go to `/get-a-quote`. |
| Preserve every mapped internal destination | The required published service records were already present in Payload. | **Already satisfied:** service records for all mapped URLs are published. **Implemented:** About page links cover `/services`, `/typesetting-services`, `/desktop-publishing-services`, `/scielo-xml-markup-services`, `/ebook-creation-services`, `/data-conversion-services`, `/accessibility-services`, and `/get-a-quote`. |
| Use only approved imagery and accurate alt text | The previous About page included abstract infographics; no approved production or workplace images were supplied. | **Awaiting approved assets.** Removed the unrelated infographics from this page and added no generic staff or unsupported illustrative imagery. |
| CMS and existing site behavior | Site Settings supported global data; the About copy was not editable. | **Implemented.** Added the Mission/Vision group, generated types, and an additive database migration. Existing quote forms, company subpages, brand tokens and motion wrapper are retained. The database migration adds three fields and is applied locally. |
| Do not link future publisher/LSP landing pages until approved | No approved landing page destinations existed. | **Already satisfied.** No future landing-page URLs were invented or linked. |
| Structured data and SEO behavior | Existing Organization structured data is rendered from current site details. | **Already satisfied.** No AboutPage structured data or new Organization claims were added; About H1 is unique and semantic headings are used. |

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed with four existing unused-argument warnings in `20261012_054530_vercel_private_storage.ts`; no errors.
- `npm run test:int` — passed: 17 files, 80 tests, including About content/link coverage and the CMS approval gate.
- `tests/e2e/navigation.e2e.spec.ts` — passed: 6 tests, including desktop and mobile About navigation.
- Responsive route sweep — passed, including `/about-us` and `/company`.
- About metadata and alias browser test — passed: exact title/canonical, audience service links and one main landmark verified.
- `npm run build` — passed; Next.js generated the production sitemap.
- `payload migrate:status` — all seven registered migrations applied locally after running the additive About fields migration.
- A broader company-related E2E run also exposed a pre-existing stale expectation in `tests/e2e/languages-careers.e2e.spec.ts`: it expects the Careers H1 “Your talent. Our next chapter.” while the unchanged Careers page renders “Your craft. A meaningful next chapter.” This About task did not alter the Careers page or test.

## Awaiting approval or input

- Management must approve the proposed Mission and Vision before enabling their replacement in Site Settings.
- Approved production/workplace imagery must be supplied before adding the document's suggested About-page images and alt text.
- The Word file could not be visually rendered in this environment. Its complete text and tables were extracted and checked.
