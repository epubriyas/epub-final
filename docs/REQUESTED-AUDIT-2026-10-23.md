# EPUBTRANS requested audit — 23 October 2026

Scope: the four supplied screenshots, WEB-AUD-003 through WEB-AUD-008. Existing Next.js 16 / Payload 3 / PostgreSQL architecture retained. No deployment performed. No schema migration or route rename.

## Content decisions and operations

Changes were applied only to the configured localhost development database. Before-state snapshots are in the ignored private directory .local-backups/audit-20261023/. The ignored action log is artifacts/requested-audit-content-actions.json. Existing article versions and all records remain intact.

- Posts 9 (cristano-ronaldo), 10 (d), and 12 (andy-crestodina): full text matches the screenshot findings (football biography, film description, marketing statistics). No author/permission evidence is stored. Changed from published to draft.
- Post 8 (sameer): contains company-related marketing copy rather than the unrelated content found above. Authorship and editorial approval are not recorded. Preserved as a draft pending owner review, without declaring it plagiarized or unauthorized.
- Career 2, Desktop publish Assistant: no role or application-mailbox approval evidence found. Changed from published to draft, preserving its email, title, slug and role details privately. Owner must verify both role and mailbox before republishing.
- No replacement articles were published.
- Search access now resolves published source posts on the server; stale search rows cannot expose unpublished content through the public API. Authenticated CMS access remains available. The search page now enforces collection access.
- Existing article lookups, resource/blog listings, related queries and sitemap enforce publication status. The CMS Archive block previously bypassed access and is now fixed for category queries and manually selected records, which are re-resolved from current published state. Removed article URLs use their existing 404 behavior; there is no equivalent replacement to redirect to.
- Removed invented fallback editorial-team attribution, including Organization author schema when no author is recorded. Publisher identity remains unchanged.
- Career applications use only an explicitly set role mailbox. Draft previews do not offer an application action. General recruitment questions link to Contact. Publishing without a role mailbox is rejected. A mailbox's presence is not proof of owner approval; the CMS guidance explicitly requires that verification.

## Directory and service presentation

Verified specialist paths /translation-services, /subtitling-services, /voiceover-services and /transcription-services remain available even when the directory card carries pendingApproval. Unknown pending destinations still use the existing quote fallback. Each card has a separate Request a Quote link using the configured CTA destination unchanged.

Translation and Voiceover use the existing content layer. Their opening context is followed by deliverables, service scope and source requirements. Every remaining section, paragraph, qualification and FAQ remains available. Added linked section navigation; native details/summary FAQ controls retained. Existing styles and typography reused. No business capabilities or sample associations were invented. No service-specific approved portfolio association was available for these pages, so no new association was fabricated.

## Portfolio inventory

All 25 records accounted for: 19 public and six pre-existing private drafts. Twelve internal-looking labels were renamed using stored preview text (ten public, two private). IDs, slugs, technical identifiers, source assets, thumbnails, order, permissions and publication states are unchanged. The remaining labels already describe their content. Existing SEO titles/descriptions for renamed samples and 70 associated preview-image alternative texts were updated. Technical filenames and asset IDs remain intact. The physics title was refined after reviewing all five preview pages, which cover work, energy and power.

| ID | Previous title | Current title | State |
| --- | --- | --- | --- |
| 32 | Simple 3 typesetting sample | Veterinary parasitology reference layout | published |
| 31 | Simple 2 typesetting sample | Arthritis research article layout | draft |
| 30 | Simple 1 typesetting sample | Neurology reference chapter layout | published |
| 29 | Medium 3 typesetting sample | Biological classification textbook layout | published |
| 28 | Medium 2 typesetting sample | Endocrinology reference chapter layout | published |
| 27 | Medium 1 typesetting sample | Oncology journal article layout | draft |
| 26 | Complex Heavy2 typesetting sample | Coordinate geometry textbook layout | published |
| 25 | Complex Heavy1 typesetting sample | Mechanics textbook layout with equations | published |
| 24 | Complex 4 typesetting sample | Mammal classification reference layout | published |
| 23 | Complex 3 typesetting sample | Electrical engineering textbook layout | published |
| 22 | Complex 2 typesetting sample | Land and environment textbook layout | published |
| 21 | Complex 1 typesetting sample | Physics textbook layout: work, energy and power | published |
| 20 | PDF-to-layout sample 3 - source | PDF-to-layout sample 3 - source | draft |
| 19 | PDF-to-layout sample 3 - output | PDF-to-layout sample 3 - output | draft |
| 18 | PDF-to-layout sample 2 - source | PDF-to-layout sample 2 - source | published |
| 16 | PDF-to-layout sample 2 - output | PDF-to-layout sample 2 - output | published |
| 15 | Pick a Pumpkin · EPUB sample | Pick a Pumpkin · EPUB sample | published |
| 14 | AFL · EPUB sample | AFL · EPUB sample | published |
| 13 | The Road to Knowledge Information and Research · EPUB sample | The Road to Knowledge Information and Research · EPUB sample | published |
| 12 | The Power to Persuade Opinion and Argument · EPUB sample | The Power to Persuade Opinion and Argument · EPUB sample | published |
| 11 | Rented Silence · EPUB sample | Rented Silence · EPUB sample | published |
| 10 | Portuguese document layout | Portuguese document layout | draft |
| 9 | French document layout | French document layout | published |
| 8 | Bengali document layout | Bengali document layout | published |
| 7 | Arabic document layout | Arabic document layout | draft |

## Production handoff

Deploy the reviewed code through the existing deployment workflow. In the intended production CMS, inspect the same slugs and owner evidence, then set the flagged posts and unverified vacancy to Draft; reproduce the reviewed portfolio title changes by stable slug. Do not assume local numeric IDs match production. Preserve draft article versions and the six private portfolio samples. Confirm public APIs, sitemap, search and 404 responses after deployment. Owner decisions are still needed for article authorship/reuse permissions, the company-related draft, vacancy authorization and recruitment mailbox approval. Deployment and production CMS operations have not been performed.

## Changed source and verification files

- src/app/(frontend)/blog/[slug]/page.tsx — neutral missing-author display and schema.
- src/app/(frontend)/company/careers/page.tsx and [slug]/page.tsx — explicit mailbox handling, inactive preview application suppression, recruitment contact links.
- src/blocks/ArchiveBlock/Component.tsx — enforce public publication state for collection and manually selected archives.
- src/app/(frontend)/search/page.tsx — enforce CMS access and correct search metadata.
- src/lib/careers.ts — application links only for published roles with a mailbox.
- src/lib/landing-directory.ts and src/components/services/ServicesDirectory.tsx — specialist navigation plus independent quote actions.
- src/components/services/ServiceHandoffContent.tsx and src/styles/services.css — reading order, contents links and focus styles.
- src/payload/collections/enterprise.ts and generated src/payload-types.ts — career publishing guard and editorial instructions.
- src/payload/plugins/index.ts — public search source-publication filtering.
- tests/int/landing-directory.int.spec.tsx — updated navigation expectation.
- tests/int/archive-publication.int.spec.tsx — enforce category filters, publication checks and selected-record order.
- tests/e2e/requested-audit.e2e.spec.ts — public privacy, routing, responsive and accessibility regressions.
- tests/e2e/portfolio.e2e.spec.ts and site-motion.e2e.spec.ts — use the reviewed public sample title.
- scripts/verify-audit-publication.ts — local-only positive/negative search and vacancy publishing lifecycle verification, with fixture cleanup.

## Validation

- npm run typecheck — passed (including the local lifecycle verifier); the final build and npx tsc --noEmit also passed with the archive fix.
- npm run test:int — first attempt passed 83 tests but had eight worker startup timeouts under resource pressure. npm run test:int -- --maxWorkers=1 then passed all 108 existing tests in 25 files.
- npm run test:int -- --maxWorkers=1 tests/int/archive-publication.int.spec.tsx — passed both added archive regression tests.
- npx tsx scripts/verify-audit-publication.ts — passed positive and negative article search visibility, career mailbox publishing gate and draft vacancy privacy; temporary fixtures removed.
- npm run lint — first run found two internal anchor links; corrected to Link components. Subsequent run passed. Final lint rerun passed with the archive fix.
- npm run build — passed, including TypeScript and sitemap generation. Final build rerun passed with the archive fix.
- Initial development-server browser runs encountered cold preview/load timeouts. The dedicated audit layout tests passed; the privacy test passed on retry. Portfolio preview endpoint and file returned 200. The initial combined production screenshot test exhausted its cumulative 180-second budget after five tests passed. Splitting it into one test per page resolved that test-structure issue; the final production-build run passed all nine tests.
- git diff --check — passed.
- No production deployment, full unrelated browser suite, external editorial approval or production CMS operation was performed.

## Finding status (local implementation)

| Finding | Status | Remaining dependency |
| --- | --- | --- |
| WEB-AUD-003 | Implemented; owner approval required | Four records are private drafts locally. Owner reviews relevance, author and approval evidence before any republication; repeat the state changes in the intended production CMS. |
| WEB-AUD-004 | Implemented; owner approval required | Verify vacancy authorization and exact recruitment mailbox. The role stays private until that decision. |
| WEB-AUD-005 | Implemented; owner approval required | Resolve reuse permissions and authorship; no unsupported editorial-team byline is generated. |
| WEB-AUD-006 | Fixed and verified | Deployment through the existing release workflow remains outstanding. |
| WEB-AUD-007 | Fixed and verified | Repeat the reviewed CMS title/alternative-text updates in production by stable slug and asset relationship. |
| WEB-AUD-008 | Fixed and verified | Layout and reading order improved without substantive copy changes or invented sample associations. |

Existing private portfolio draft IDs retained unchanged: 7, 10, 19, 20, 27, 31. All 19 previously public examples remain public. No redirects, original-file downloads, dependencies, credentials or deployment settings were changed.

Final browser command: PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run test:e2e -- requested-audit.e2e.spec.ts portfolio.e2e.spec.ts --workers=1 --reporter=line --timeout=120000 — nine passed in 1.9 minutes against a fresh local production build. Checks include 404 responses and anonymous API/search/sitemap exclusion, four specialist directory routes and independent quote links, all 19 portfolio samples, PDF and EPUB viewers, quote preselection, preview-error handling, dark theme, keyboard controls, reading-guide targets and responsive overflow. Axe reported no WCAG A/AA violations on the tested main content at 1440, 768 and 390 pixels; the existing portfolio suite also checks widths from 320 to 1920 pixels. Screenshots are in artifacts/requested-audit/ and artifacts/portfolio/screens/.

Final npx eslint checks and npx tsc --noEmit passed after adding the archive regressions. Existing development server was retained; the temporary production-build validation server was stopped after testing.
