# P1 multilingual audit and implementation — 2026-10-27

Repository: D:/co/epubtrans-v2. Branch: main, starting commit b36f8f2 with earlier P1 changes already uncommitted. Implementation decision: **A — English source with disclosed browser reading previews**. No production deployment, new locale prefix, translated slug, CMS schema or translation approval has been published.

## Inventory and architecture

The picker exposes 11 choices: en, hi, ta, te, bn, fr, es, de, ar, zh-CN, ja. The actual existing router supports 23 prefixes: ar, as, bn, de, en, es, fr, gu, hi, it, ja, kn, ko, ml, mr, or, pa, pt, ru, ta, te, ur, zh-CN. The additional prefixes were already accepted by proxy.ts; this task does not add picker choices or language routes. Existing English URLs remain unprefixed. Existing /en normalization is retained for compatibility; no new /en route or redirect was introduced.

Baseline HTTP audit: 253 actual URLs across 23 locales and 11 core pages returned 200. Every server response used English body content and English HTML language/direction, with no hreflang. Final audit adds the resources hub, for 276 URLs across 12 pages. Full records: p1-multilingual-locale-inventory.json and .csv. The route set covers Home, Services, Typesetting, multilingual DTP, EPUB, general JATS, SciELO, Accessibility, Contact, Quote, Industries and Resources. All established service paths are also protected by the existing 16-service URL contract tests.

Payload has no configured localization schema or approved per-page locale identities. Service handoff JSON, landing globals and page routes provide English content. A 230-entry Tamil dictionary and provider caches offer partial/unreviewed browser substitutions; they are not approved page translations. All non-English page/locale pairs are classified PARTIAL_TRANSLATION because substantive server content and metadata remain English, and full review has not been supplied. English rows identify the complete original source, not new editorial approval of the earlier P1 changes. No non-English pair is READY_FULL_TRANSLATION. No new locale indexing is authorized.

Read-only CMS checks returned zero publicly published resource records and zero published posts. Therefore a genuine localized resource-article sample and its linguistic review are BLOCKED; the resources hub was checked instead. Evidence: artifacts/multilingual/cms-review.json. No article was invented.

## Confirmed findings and fixes

| Finding | Evidence / severity | Resolution |
|---|---|---|
| Saved preference redirected an explicitly requested English homepage | proxy.ts read epubtrans-language and returned a locale 307; high route-intent issue | Removed that redirect. Requested URLs now win; selected locales persist through prefixed links, history and reload |
| Desktop picker had only a short code as its accessible name | EN/TA/etc button text; medium accessibility issue | Descriptive name, current-selection description, ArrowDown opening, Escape/focus return and focus restoration after selection |
| Picker promised persistence without explaining translation availability | Original follow-you wording; medium UX issue | Clear English-source/automatic-preview disclosure, partial fallback notice and honest link-based persistence description |
| Translation API omitted unregistered strings without necessarily reporting partial coverage | Allowed subset could fully succeed; high false-completeness issue | Partial flag now covers every requested source string absent from returned translations |
| Client accepted unchanged English as a translated result | API could return source text; high language-state issue | Reject unchanged/empty results except explicit protected fixed terms; retain successful batches and disclose incomplete/failure states |
| Small translated portions changed the language of remaining English content | Root lang/dir changed when any cached text existed; medium accessibility issue | Mixed pages retain en/ltr; translated elements carry lang/dir. Root changes only after the current pass has complete eligible-text coverage, and remains a noindex preview |
| Option labels and informative alt text were omitted | option exclusion and missing alt attribute scan; medium accessibility issue | Translate visible option text/alt attributes without changing option values or private inputs; email/URL/telephone fields stay LTR |
| File names could enter client translation batches | Upload list text and remove labels; privacy/terminology concern | Exclude the upload list alongside existing private-value exclusions; new tests protect input values, option values and file names |
| Locale previews lacked an unconditional locale-specific indexing guard | Source rewrites reused English metadata; high release risk | X-Robots-Tag: noindex, follow on every non-English rewrite, plus locale-aware root robots metadata. English production/staging policy stays intact |
| Cached locale round trips duplicated URL fragments | Reproduced #process#process on return to an initially cached English page; high deep-link issue | Shared client locale navigation preserves the exact browser path/query/fragment and uses Next-compatible native history normalization after navigation, without forcing a page reload |
| English fallback notice used /en normalization and lost URL context | Old notice linked to /en plus pathname only; medium route/context issue | Direct existing English URL with query and fragment preserved; normal links/new tabs work without a normalization hop |
| Selected English badge narrowly failed contrast | Browser axe: white on #078686, 4.4:1; medium accessibility issue | Existing accessible action/text-on-action theme tokens |
| Floating assistant intercepted the last picker option | Browser pointer interception on Japanese; high switching issue | Open language panel/header stacks above the assistant; no forced test click |
| Expanded RTL header overflowed at 1280px | Measured document width 1329px, controls at negative X; medium layout issue | Locale-scoped wrapping/gaps at desktop widths, leaving English header spacing unchanged |

## Files changed in this ticket

- src/proxy.ts: explicit English request handling and reading-preview noindex response header; existing service redirects and localized admin protection retained.
- src/config/languages.ts: query/fragment-safe prefix manipulation, existing zh-CN convention preserved, invalid locale paths not generated, protected API/admin links stay unlocalized.
- src/app/(frontend)/layout.tsx: locale-aware root robots metadata; existing English titles, metadataBase, canonicals and environment policy retained.
- src/components/i18n/LanguageSelector.tsx: honest preview disclosure, English-language semantics for the picker and unchanged-selection handling.
- src/components/navigation/Header.client.tsx: accessible language-control name/current selection, keyboard opening/focus restoration, requested-locale attribute for scoped layout.
- src/components/i18n/LocaleProvider.tsx: honest completeness tracking, per-element language/direction, alternative text and option labels, LTR identifiers, private file/value exclusions, direct English return preserving query/fragment, shared locale navigation with cached-fragment repair, and cleanup of language attributes.
- src/app/(frontend)/api/translate/route.ts: accurate partial-result flag. Existing origin/catalogue/privacy safeguards remain.
- src/styles/navigation.css: selected badge contrast, language-panel stacking and translated-header reflow at desktop widths when a non-English preview is selected.
- tests/int/multilingual-routing.int.spec.ts: new route, cookie, locale guard, protected route, tag, query and fragment checks.
- tests/int/localization.int.spec.tsx and translation-route.int.spec.ts: unchanged-source, mixed-language, option/alt, value/file privacy and omitted-string tests; existing mixed-page assertions updated.
- tests/e2e/multilingual-qa.e2e.spec.ts: new picker, history, fallback, focus, RTL and synthetic enquiry contract tests.
- tests/e2e/languages-careers.e2e.spec.ts: descriptive picker selectors and current homepage/partial-Tamil expectations, without changing homepage copy.
- This implementation report, full locale inventory (JSON/CSV), and p1-multilingual-review-queue.json.

## SEO decision

There are **no approved equivalent localized publication clusters**, so no hreflang, x-default or localized sitemap entries are emitted. Existing English canonical paths and title/description ownership stay intact. English canonicals are appropriate for these English-server-content reading previews; this is not a policy to canonicalize future genuinely translated pages to English. A future approved full translation requires its own reviewed body, metadata, stable identity, self canonical and reciprocal equivalents, plus an explicit release change.

Current origin handling only permits the established apex/www production domains for indexing and rejects Vercel/localhost/preview origins. Those guards were retained. No production host preference was silently changed. Local metadata/canonicals necessarily use the configured local origin. Real production-origin/header checks remain BLOCKED for this un-deployed change.

Live-source limitations: the browsing tool could not retrieve staging robots.txt or sitemap.xml; tool access errors do not establish endpoint failure or indexability. The [public production homepage](https://www.epubtrans.com/) returned different, older-site content in the browsing view, not this local build. That is not proof of deployment or a raw HTTP/header audit. No production form submission was made.

## QA evidence

Build/lint/integration and browser evidence are stored under artifacts/multilingual/. Final results are appended below. The initial browser runs exposed a stale homepage assertion plus real badge contrast, panel stacking, translated-header width and cached-fragment issues. Those failures are retained in browser-initial.log/browser-layout-run.log/browser-before-final-assertions.log; final verdicts use the reruns. Browser translation responses are deliberately mocked for repeatable failure/RTL mechanics, and form responses are intercepted. A test fixture is never translation-quality approval or proof of email delivery.


## Final results — local production build

| Test / documented cases | Status | Actual evidence |
|---|---|---|
| Build | PASS | npm run build, exit 0; compilation, TypeScript, static generation and sitemap generation; artifacts/multilingual/build.log |
| Lint | PASS | npm run lint, exit 0, no warnings; lint.log |
| Explicit TypeScript | PASS | npm run typecheck, exit 0; typecheck.log |
| Integration / prior P1 contracts | PASS | npx vitest run --config vitest.config.mts --maxWorkers=1 --testTimeout=20000; 28 files, 124 tests passed; integration.log |
| Routing, result reporting and cached-fragment unit cases | PASS | Targeted run: 3 files, 18 tests; subsequent full suite includes edited-draft preservation assertion; targeted.log/integration.log |
| F01–F08, F12 / eleven choices, direct URLs, fallback, reload, new tab, history, keyboard/mobile focus | PASS | Final browser suite: 8/8 passed in 1.1 minutes; browser.log, browser.exit=0 |
| F09–F11 / alternate-locale enquiry contracts and Arabic directions | PASS for mechanics | Mock Arabic preview at 375/1280, LTR email values, preserved option/service codes and private text, Contact and four-step Quote confirmations. Translation and submission responses intercepted; no real message/email delivered |
| S01–S06, S09–S10 / source language, heading/meta/canonical preservation and no bogus alternates | PASS for branch A | node artifacts/multilingual/verify-http.cjs; 276 URLs, 23 languages, 12 pages; HTTP 200, server en/ltr, baseline H1/title/description/canonicals preserved on the original 253 URLs, 23 resource-hub URLs additionally inventoried, non-English X-Robots noindex, zero hreflang; http.log and inventory files |
| S07–S08 / local sitemap, robots, environment guards | PASS locally | check-discovery.cjs: both XML sitemaps return 200, all 16 established service entries present, local robots disallows crawling. Existing site-indexing tests reject staging/lookalike/HTTP origins and allow configured approved production domains |
| Picker accessibility | PASS for automated checks | Desktop/mobile axe scans and focus/selection checks; picker-axe.json reports no violations; selected badge contrast repaired |
| Core translation completeness / human terminology review | BLOCKED | No approved full non-English page records; metadata remains English by design. No claim of translated publishing/certification terminology approval |
| True localized self-canonical/reciprocal hreflang/unpublish workflow | N/A for branch A; BLOCKED for future locale publication | No approved translated equivalent cluster exists. No fake cluster or translation record was created merely to pass a test |
| Live staging and production headers/indexation | BLOCKED | Public retrieval limitations and different production content; not deployed. Local and unit results do not prove live deployment |
| Published localized resource article | BLOCKED | Local public resources/posts inventories each returned zero published records |
| Real email delivery / manual linguistic, assistive-technology and 200% browser-zoom sign-off | BLOCKED | Requires an authorized live delivery test and qualified human reviewers. Narrow-width/RTL fixtures do not substitute for those approvals |

Browser command: npx playwright test --config artifacts/multilingual/playwright.config.ts tests/e2e/multilingual-qa.e2e.spec.ts tests/e2e/languages-careers.e2e.spec.ts --grep-invert 'careers page and company menu' --workers=1 --reporter=line. The unrelated careers-page audit was excluded. The temporary audit config uses the existing Edge project, a separately managed local production server at port 3006, and a 30-second assertion allowance. Application test configuration was not changed.

Initial failures were used to fix real defects, rather than reported as passes. The older homepage assertion was updated to current partial Tamil/English source behavior. After the product fixes, a history test was corrected to await an exact English URL: its old suffix regex also matched the French URL before navigation completed. Final results above refer to the complete 8-test rerun. The cached-fragment workaround uses the installed Next.js native-history integration; no dependency code or version was modified.

Artifacts include picker-375.png, arabic-fixture-375.png, arabic-fixture-1280.png, the old overflow measurements, final raw logs, the sitemap capture and SEO-discovery results. Visually inspected the 375px language picker; screenshot inspection is not a native-language or screen-reader certification.

The final inventories are provided as both CSV and JSON, with stable English route identity, actual tested URL, source H1/title/meta/canonical, language/direction, response protection, selector visibility, translation/review status, evidence date and release decision for every row.

## Review/release blockers

- **BLOCKED:** Qualified human review of every non-English substantive page, terminology, caveats, headings, metadata, forms, accessibility strings, script typography and actual RTL reading quality. No reviewer or approval was supplied. See p1-multilingual-review-queue.json.
- **BLOCKED:** True multilingual SEO release, reciprocal hreflang and translation-unpublish tests: no approved localized page records exist. The unpublish/reciprocity scenarios are not applicable to the implemented preview-only branch; they must be exercised when an approved translation model exists.
- **BLOCKED:** Actual localized resource article review; no published local sample.
- **BLOCKED:** Production/staging raw headers and post-deployment indexing verification, Search Console ownership and preferred-host approval. No deployment occurred.
- **BLOCKED:** Real enquiry delivery and manual screen-reader/200%-browser-zoom/linguistic certification. Automated narrow-width, focus, role and RTL fixtures cover mechanics only.

## Prior P1 preservation and rollback

English service handoffs, keyword-owner mappings, service paths, conversion anchors, audience pathways, heading copy, forms and submission endpoints were not rewritten. This ticket changes only the translation endpoint's result reporting, not enquiry/quote APIs. The prior keyword migration remains prepared; no migration was applied by this task.

Reverse only this ticket's changes, restoring its pre-edit source snapshots in artifacts/multilingual/before/ where available. navigation.css was otherwise unchanged at task start and can be restored from the starting Git version. Remove the newly added multilingual tests/reports if rolling back. Do not reset the repository: earlier heading/keyword changes were already uncommitted. Deploying a rollback is a separate release action.

Verdict: **PARTIAL_PASS_WITH_BLOCKERS** — the English-source/preview branch can be technically verified; no new locale has multilingual publication approval.
