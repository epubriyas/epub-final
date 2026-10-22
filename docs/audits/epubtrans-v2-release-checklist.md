# Release checklist — local V2 audit

Status: **local implementation complete; final evidence below. No deployment performed. Public release remains gated by the owner and security items listed here.**

| Check | State | Evidence / limit |
| --- | --- | --- |
| Read complete authoritative specification | Reviewed | Word package metadata reports 15 pages; all 477 nonempty body/table paragraphs extracted in order. No embedded media, notes, headers or comments contain additional instructions. Traceability ledger preserves every paragraph. |
| Initial implementation inspection | Reviewed | Main branch, App Router, npm, Payload/PostgreSQL, UI/CMS routes, media, forms, metadata, tests and safeguards inspected. |
| Baseline responsive matrix | Passed with finding | 77 cells; contact mobile target-size failure and separately reproduced assistant collisions documented. |
| Integration checks | Passed | Final serial run: 25 files, 108 tests passed (`integration-serial.log`). Concurrent rerun had five 5-second resource-contention timeouts; preserved separately. |
| TypeScript | Passed | Standalone typecheck and final production build TypeScript checks completed. |
| Palette / dark-theme contrast | Corrected and tested | Ratios measured; light/dark checks and intermediate findings retained. No claim of universal WCAG conformance. |
| Quote/contact persistence and duplicates | Passed locally | Both endpoints accepted valid requests, repeated keys produced one database record, invalid email returned 422; both synthetic records removed. Origin test uses the configured trusted application origin. |
| Notification delivery | Unverified / configuration-dependent | Local response reports unavailable; no email sent and no delivery claim. Approval-gated live recipient/transport must be verified before launch. |
| Production build | Passed | Next 16.3.8 default production build, TypeScript and postbuild sitemap completed; `build-final.log`. |
| Lint | Passed | Final `npm run lint` exited 0; `lint-final.log`. |
| Browser suite | Passed | 18 selected production browser tests; `browser-standalone.log`. After final viewer fixes, all 3 portfolio tests passed again (`portfolio-final.log`). Superseded failures remain recorded. |
| Final responsive / axe | Passed | Final standalone production retest: 77 route/viewport cells, 22 axe scans, 0 HTTP failures, 0 overflow findings, 0 pages with JavaScript errors, 0 scans with violations. Eleven routes were checked at 320, 390, 430, 768, 1024, 1440 and 1920px. Material after screenshots were refreshed at 390/1440px; metrics cover all seven widths. |
| Staging indexing | Implemented locally, deployed issue remains | Actual deployed homepage had no X-Robots-Tag or robots meta; robots.txt permits public URLs. Changes require an authorized staging deployment to affect the remote site. |
| Future self-hosted production indexing | Policy tested separately | Exact HTTPS production hostnames allowed; lookalike domains, localhost, Vercel staging and previews excluded. |
| Portfolio confidentiality | Source reviewed; permission unchanged | Public previews remain permission-gated; originals stay excluded from build tracing/public presentation. Owner must confirm existing publication permissions before release. |
| Legal copy | Awaiting owner | Privacy and Terms explicitly contain review notices. No legal text invented or silently removed. |
| Content hygiene | Awaiting owner / EPUBTRANS GPT2 | Blog `demo 2` and other test-like posts, internal sample titles and the existing careers record require editorial/factual approval. No CMS publication/title changes made. |
| URL migration | Preserved | Existing canonical slugs and legacy redirects retained; no unrelated homepage redirects added. |
| Security review | Reviewed with release blockers | npm audit: 11 high, 5 moderate, zero critical; Next advisories patched. Remaining upstream findings require assessment. Origin validation, bounded uploads, type checks, private storage, permission checks and secret boundaries inspected. Process-local rate limits are not a shared multi-worker guarantee. |
| Lab performance | Measured; targets not fully met | Original release sample: LCP 552–2504ms and CLS 0 across 6 local production navigations; assistant event durations 112–592ms. Single local unthrottled samples under machine load, not Lighthouse or field INP. Home mobile narrowly exceeded 2.5s and some interactions exceeded 200ms; deployment/device performance verification remains. |

## Release decisions

Local changes are reviewable independently of deployment. Public production release is blocked by legal/content/publication approvals, notification-delivery verification, actual staging indexing remediation, multilingual verification and deployment performance checks. Substantive copywriting is referred to EPUBTRANS GPT2; no message was sent to another chat or person.

## Additional release evidence

The original release audit checked 61 public routes and five expected security statuses, scanned emitted client JS without finding configured secret values, and passed three 200% text-scale reflow samples. The first 25 extra accessibility scans found seven failing scan instances on three components; these were fixed and separately retested. The follow-up full release script stalled during multilingual evaluation and was interrupted after route/theme scans; its prior results were preserved as history. RTL/translation quality is **unverified**, not passed. The translation mock did not establish the expected Arabic document state.

Final targeted theme retest: **13/13 scans without axe violations**, covering Industries, the blog article and Work at 390/1440px in both themes, plus the open dark sample viewer. Evidence: `artifacts/master-audit/release/theme-retest.json` and `theme-retest.log`. This closes the seven earlier failing scan instances. All three portfolio browser tests also passed after these source changes. `git diff --check` passed. The source-paragraph ledger records 477 requirements/reference paragraphs with explicit external dependencies.
