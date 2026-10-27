# P1 keyword ownership and shared destinations — 2026-10-27

Ticket: P1-SERVICE-INTENT-OWNERSHIP. Implemented locally in D:/co/epubtrans-v2 on main, baseline commit b36f8f2. No deployment or production database operation. The earlier heading ticket's uncommitted changes were preserved.

## Repository and CMS findings

Read-only inspection of the local app's public Payload APIs confirmed 16 published services and one landing-pages global (ID 1), with six directory categories and 17 cards. Both conversion-card labels and the LSP recreation entry still used /data-conversion-services without fragments. The service-path configuration confirms all 16 established canonical paths. No new path, redirect, robots, sitemap, indexing policy, schema type or service record was created.

CMS service identities, publication status, relationships and images remain authoritative. ServiceRoute renders H1/copy/metadata from src/config/service-handoffs/*.json over the CMS identity/SEO fields; editing the handoffs is therefore the effective service content workflow. getLandingContent reads landing-pages.servicesContent and falls back to src/config/landing-content.json. The compatibility layer upgrades only exact legacy conversion destinations, retaining custom editor destinations and copy.

Evidence: artifacts/keyword-ownership/services-baseline.json, landing-baseline.json, baseline-inventory.json. The complete before/after H1, title, meta description, introduction, first section, CTA, source and CMS IDs are saved in docs/p1-keyword-ownership-inventory.json. No GSC, GA4, CRM, keyword metrics or backlink dataset was supplied or connected; ownership remains provisional, not a claim about search performance.

## Owner map

| Existing URL | Primary keyword theme | Dominant buyer task | Action |
|---|---|---|---|
| /xml-conversion-services | JATS XML conversion | General scholarly article markup and target-schema requirements | Targeted boundary/link edits |
| /voiceover-services | Voiceover production | Recorded speech and narration | Retain existing distinction |
| /typesetting-services | Book and journal typesetting | Publisher composition and proofs | Targeted boundary/link edits |
| /translation-services | Translation services (scope confirmation required) | Text-language work separately assessed from layout | Retain existing distinction |
| /transcription-services | Transcription | Speech-to-text | Retain existing distinction |
| /subtitling-services | Subtitling | Timed on-screen text | Retain existing distinction |
| /scielo-xml-markup-services | SciELO XML markup | SciELO Publishing Schema and collection-specific delivery | Targeted boundary/link edits |
| /proofreading-services | Proofreading for publishers | Specified corrections in final text or typeset proofs | Retain existing distinction |
| /graphic-design-image-services | Publication graphics and image services | Figures, artwork and image preparation | Retain existing distinction |
| /elearning-localization-services | eLearning localization | Course projects, interactions and functional deliverables | Retain existing distinction |
| /ebook-creation-services | EPUB conversion and eBook creation | Create reflowable or fixed-layout publication packages | Targeted boundary/link edits |
| /desktop-publishing-services | Multilingual DTP and post-translation layout | Adapt layouts around supplied approved translations | Targeted boundary/link edits |
| /data-conversion-services | PDF-to-Word, OCR and document recreation | Editable source extraction or layout reconstruction | Targeted boundary/link edits |
| /cover-page-design-services | Book cover design | Cover-specific artwork and production files | Retain existing distinction |
| /accessibility-services | Document accessibility remediation | Format-specific remediation and scoped evaluation | Retain existing distinction |
| /copyediting-services | Copyediting for publishers | Manuscript language, style and consistency before layout | Retain existing distinction |

## Changes and reasons

- src/config/landing-content.json: Data Conversion Services -> /data-conversion-services#pdf-to-word-ocr; PDF Recreation & Document Preparation -> /data-conversion-services#pdf-recreation; the LSP pathway recreation link uses the latter too. Both original card labels, 17-card count, six categories, search text and quote CTAs remain.
- src/lib/conversion-directory-links.ts (new), src/lib/landing-content.ts: an idempotent compatibility upgrade applies the same link fixes to validated older CMS globals, without overwriting editorial copy, statuses or custom links.
- src/payload/migrations/20261027_120000_conversion_entry_links.ts (new), migrations/index.ts: registered a reversible content-only migration. It recognizes exact label/base-URL pairs and uses compare-and-swap against each original JSON document, preserving concurrent edits. NOT APPLIED to a database in this task. Runtime compatibility makes the reviewed preview work before migration. Record affected: landing-pages global ID 1, servicesContent category-card hrefs and audience-card service href; no services collection write.
- src/config/service-handoffs/data-conversion.json: existing section 1 now owns PDF-to-Word Conversion & OCR; existing section 5 owns PDF Recreation & Editable Document Preparation. Their heading IDs are pdf-to-word-ocr and pdf-recreation. Added the two proposed substantive introductions and decision help; moved the existing reconstruction group into the recreation section. Retained source limitations, output distinctions, workflow, deliverables, QA and FAQ. Added a general JATS owner link alongside the existing SciELO link.
- src/lib/service-handoff.ts and src/components/services/ServiceHandoffContent.tsx: optional section anchorId renders once on its semantic H2, with tabindex=-1 and 112px sticky-header scroll margin. Existing service-section-N wrapper IDs and section order remain intact. Other service pages retain their markup behavior.
- src/config/service-handoffs/desktop-publishing.json: replaced the three-paragraph standalone PDF reconstruction pitch with a concise source-preparation boundary and recreation link. Added an explicit translation-exclusion sentence and separate translation link. The only metadata edit in this ticket replaces the description's broad recreation emphasis with the supplied multilingual-layout description; the existing differentiated title and H1 stay.
- src/config/service-handoffs/typesetting.json: added a related multilingual DTP entry for translated-file adaptation, distinguishing original publisher composition.
- src/config/service-handoffs/xml-jats.json: replaced the long neighboring SciELO/certification block with a two-sentence scope distinction and owner link. The dedicated SciELO page retains its existing certification material. Generic JATS metadata, tag-set guidance, technical checks and FAQs stay.
- src/config/service-handoffs/scielo-xml-markup.json: replaced the generic JATS group with one contextual sentence linked to the general JATS owner. SciELO-specific details, inputs, outputs and validation boundaries remain.
- src/config/service-handoffs/ebook-creation.json: condensed the lengthy accessibility subsection into EPUB-production considerations and a distinct remediation/testing bridge. Retained source/specification/acceptance dependencies and the warning that technical validation does not establish accessibility conformance.
- src/config/header-navigation.ts: the two existing document-conversion menu labels now use their respective fragments; no menu structure or labels changed. Broad footer links and generic conversion references still appropriately use the page URL.
- src/lib/i18n/public-ui-texts.json: appended new English text to the existing translation allowlist; no curated translation was overwritten and no new translation was invented.
- tests/int/conversion-directory-links.int.spec.ts (new): covers old CMS data, idempotence, non-mutation, custom destination preservation and both audience pathways.
- tests/e2e/keyword-ownership.e2e.spec.ts (new): covers all owner-page metadata, semantic H1s, axe scans, owner-link graph and conversion fragments via direct entry, refresh and keyboard/client navigation.
- tests/int/landing-directory.int.spec.tsx, tests/e2e/audience-pathways.e2e.spec.ts, tests/e2e/navigation.e2e.spec.ts: updated destination expectations only, plus formatting.

Existing differentiation was retained rather than rewritten for copyediting/proofreading, graphics/covers, translation/DTP, accessibility/EPUB, eLearning/media, and the media subservices. Their H1s, introductions, input/output requirements and existing reciprocal links were reviewed in the inventory. No unverified capabilities, standards, language coverage, versions, delivery promises or certification claims were added.

## QA

| Check | Status | Evidence |
|---|---|---|
| Production build | PASS | npm run build; TypeScript and sitemap generation included; rerun after final CSS repairs |
| Lint | PASS | npm run lint; final verification recorded below |
| Explicit TypeScript | PASS | npm run typecheck, exit 0 |
| Integration suite | PASS | npx vitest run --config vitest.config.mts --maxWorkers=1 --testTimeout=20000: 27 files, 116 tests passed |
| All 16 owner pages: direct routes, unique H1/title/description, Open Graph and own canonical paths | PASS | tests/e2e/keyword-ownership.e2e.spec.ts metadata test; artifacts/keyword-ownership/seo-results.json |
| Contextual owner graph | PASS | keyword-ownership browser test: required paired links exist and owner destinations return direct 200 |
| Content-link audit | PASS | node artifacts/keyword-ownership/check-internal-links.cjs: 25 internal links return HTTP 200 without redirect; fragment IDs occur exactly once in server HTML |
| Conversion fragments | PASS | keyword-ownership browser test at 375/1280px: direct URL, refresh, client navigation, keyboard activation/focus, sticky header clearance, no horizontal overflow |
| Updated owner accessibility | PASS | WCAG 2 A/AA and 2.1 AA axe main-content scans: all six modified owner pages have zero violations; axe-*.json evidence |
| Contact and quote forms | PASS | Managed production-browser run: both client form tests passed, including validation, four steps, retained data and mocked API failure/success; no real enquiry sent |
| Publisher/LSP pathways | PASS | Full previously failing navigation test rerun on updated CSS: 1 passed; separate mobile/desktop diagnostics place both targets at about 110px below viewport top. Locale and reduced-motion pathway tests also passed in the earlier production run |
| Header navigation | PASS | Earlier production run completed all six navigation tests, including keyboard/modal focus, mobile and category destinations |
| Redirect/sitemap regression | PASS | Existing SEO browser test completed successfully; no redirect, sitemap or robots source changes |
| CMS migration execution | NOT RUN | Prepared and registered; CMS global 1 rendered through compatibility upgrade without database writes |
| Production host, live indexability and real email delivery | NOT RUN | Local-only work; canonical origins remain environment-configured |
| Human translation quality/RTL visual approval | NOT RUN | English source allowlist updated; human review pending |

Initial runs were not clean: the parallel build/test run hit one 5-second integration timeout (115 tests otherwise passed); the single-worker 20-second-limit rerun passed all 116. Browser discovery first hit a Node JSON-import requirement in the new test, fixed by reading the source JSON explicitly. An incorrect initial Open Graph expectation was corrected to include the site suffix. A combined all-page axe test exceeded its cumulative 300-second limit and was replaced with six separately reported scans. Managed webServer teardown stalled on Windows, so later tests used a separately managed local production server. Interrupted aggregate runs are not represented as passed suites.

Two real QA findings were repaired: (1) data-conversion and SciELO small text links had 4.17:1 contrast against the light background; src/styles/services.css now uses the existing --link-primary token for .sp-text-link, and both failing scans passed on rerun. (2) native smooth focus scrolling could continue from a homepage link into the destination route; src/styles/site-motion.css makes native jumps immediate while Lenis initializes, preserving Lenis wheel smoothing. Full mobile/desktop reproduction and the audience-pathway test passed after this repair. These two one-rule CSS changes were necessary for the requested accessibility/navigation checks; there was no component redesign.

Final verification: PASS — 4/4 production-browser tests passed in 1.1 minutes after the final CSS fixes. Command: npx playwright test --config artifacts/keyword-ownership/managed.config.ts tests/e2e/services-directory.e2e.spec.ts tests/e2e/site-motion.e2e.spec.ts --grep 'directory|fluid wheel|reduced motion can' --workers=1 --reporter=line. This covered directory search/category navigation/reset/quote prefill, responsive directory widths 320–1920, light/dark axe scans, fluid wheel settling, native anchors, route navigation, live reduced-motion changes and JavaScript-disabled service content.

Other final commands/evidence:

- npx playwright test --config artifacts/keyword-ownership/managed.config.ts tests/e2e/keyword-ownership.e2e.spec.ts tests/e2e/v2.e2e.spec.ts --grep 'accessibility of updated owner: data-conversion|accessibility of updated owner: scielo|quote flow|contact form' --workers=1 --reporter=line — PASS, 4/4 in 36 seconds after contrast repair.
- npx playwright test --config artifacts/keyword-ownership/dev.config.ts tests/e2e/audience-pathways.e2e.spec.ts --grep 'publisher and localization' --workers=1 --reporter=line — PASS, 1/1 after native-scroll repair, 1.5 minutes. The complete four-case diagnostic also passed with the same native-scroll rule.
- The other four owner axe scans passed in the separately reported scan run; all six axe-*.json files now report zero violations.
- npm run build — PASS after final production source edits, including TypeScript and sitemap generation. npm run lint — PASS, exit 0. npm run typecheck — PASS, exit 0. git diff --check — PASS.
- Audit configs use the same Edge project with a 30-second assertion allowance and independent local production servers (ports 3002/3003/3004); final managed.config.ts omits automatic webServer management to avoid the Windows teardown stall. These temporary configs and screenshots are ignored artifacts, not application configuration changes.

Screenshots: artifacts/keyword-ownership/pdf-to-word-ocr-375.png, pdf-to-word-ocr-1280.png, pdf-recreation-375.png and pdf-recreation-1280.png; directory theme screenshots in artifacts/services-audit/. Visually inspected the recreation mobile screenshot. Other screenshot bounds were checked by browser tests; no exhaustive manual screen-reader or RTL review is claimed.

The earlier heading-ticket files remain untouched by this ticket except src/lib/i18n/public-ui-texts.json, where this task appended its own strings after the previous additions. No source forms, contact details, industry content or service-route configuration changed.

## Remaining review and release work

SEO/content owner: approve the provisional keyword mapping and targeted English copy; compare with GSC query/page and conversion evidence when available. Service owner: confirm current translation/media/cover priorities and retained public SciELO status wording; this ticket neither expands nor re-verifies those offers. Localization owner: review new source text across hi, ta, te, bn, mr, kn, ml, gu, pa, or, as, ur, es, fr, de, pt, it, ar, zh-CN, ja, ko, ru. Existing automatic translation remains in place; translation correctness and RTL visual review are not established merely by adding allowlist entries.

The supplied package requires the normal SEO/content and service-owner review before controlled deployment. No approval request prevents local implementation. Production release, live-domain canonicals, real enquiry delivery and search indexing outcomes have not been verified here.

## Rollback

Reverse only this ticket's patch, preserving the previous heading ticket and unrelated changes. Pre-edit source snapshots are in artifacts/keyword-ownership/before/ (the header has header-navigation-before.ts). For a deployed content migration, restore the pre-migration CMS backup or run this migration's down step only after reviewing editor changes; down rewrites matching fragment links to their base URL and does not know whether an editor independently adopted the same destination. Reverse handoff/config/code changes together so links and anchors stay synchronized. Do not reset the repository to b36f8f2: the prior heading work was already uncommitted at task start.
