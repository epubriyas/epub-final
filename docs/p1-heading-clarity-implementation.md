# P1 heading clarity implementation — 2026-10-27

Implemented locally on `main`, starting at `b36f8f2`. Preview: http://localhost:3000. No deployment or commit performed. Editorial approval remains pending.

## Files and scope

- `src/app/(frontend)/contact/page.tsx`: H1, hero paragraph and three H2s. `/contact-us/page.tsx` re-exports this component; the existing `/contact` alias consequently displays the same updated copy. Contact metadata stays unchanged.
- `src/app/(frontend)/get-a-quote/page.tsx`: H1, hero paragraph and after-enquiry H2. Existing absolute SEO title retained.
- `src/components/forms/QuoteForm.tsx`: sidebar H3 and first-step H2 wording only; semantic levels and form behavior retained.
- `src/app/(frontend)/industries/page.tsx`: H1, hero paragraph, two H2s, generic metadata replaced with the exact proposed title and description. The existing SEO helper also updates social text.
- `src/lib/i18n/public-ui-texts.json`: added all 14 replacement English strings to the public translation allowlist; retained old entries for compatibility.
- `tests/e2e/v2.e2e.spec.ts`: current Contact H1 expectation and service radio selector corrected.

No shared hero, CSS, URLs, redirects, schema, indexing policy, contact data, form logic, service links or industry-card data changed. Initial working tree was clean. Existing service-dedup and audience-pathway work remains intact. Optional Technology and Work copy was not changed.

## Heading map

| Route | Previous | Replacement |
|---|---|---|
| Contact | Find your way to us. | Contact EPUBTRANS About Publishing & Localization Projects |
| Contact | Your next chapter starts here. | Request a Detailed Project Quote |
| Contact | Tell us what you have in mind. | Send a General Enquiry |
| Contact | At home in Chennai. Connected to your team. | Our Offices in Chennai |
| Quote | A clear brief. A considered next step. | Request a Quote for Publishing & Content Production Services |
| Quote | Built around your requirements. | Share Your Project Requirements |
| Quote | What do you have in mind? | Choose the Service You Need |
| Quote | From brief to next steps. | What Happens After You Submit an Enquiry |
| Industries | Content support shaped around your industry. | Digital Publishing & Localization Services by Industry |
| Industries | A clear process for connected content. | How We Assess Industry-Specific Content Projects |
| Industries | Practical answers before you begin. | Frequently Asked Questions About Project Requirements |

All three hero paragraphs match package `03_PROPOSED_COPY.md`. Forced breaks in replaced Contact headings were removed; IDs and heading levels remain intact.

## Verification

| Check | Status | Evidence |
|---|---|---|
| Production build and TypeScript | PASS | `npm run build`, exit 0, including sitemap generation |
| Lint | PASS | `npm run lint`, exit 0 |
| Integration suite | PASS | `npx vitest run --config vitest.config.mts --maxWorkers=1`: 26 files, 114 tests passed |
| Initial parallel integration attempt | FAIL | 88 tests passed, seven fork startup timeouts; resolved by the single-worker run |
| H1 and responsive overflow | PASS | `node artifacts/heading-clarity/check.cjs`: all three pages at 320, 375, 768, 1280; one exact H1, no horizontal overflow; reduced motion enabled |
| Contact and quote client form regression | PASS | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/v2.e2e.spec.ts --grep 'quote flow\|contact' --reporter=line`: 2 passed; validation, four-step flow, retained data, mocked error and success responses |
| Real enquiry delivery | NOT TESTED | Form tests intercept API responses; no real submission or email sent |
| All map/service links, industry FAQ interaction, language picker | NOT TESTED | Source diff preserves them; not independently exercised in this ticket |
| Translation quality / RTL layout | NOT TESTED | Requires localization review |
| Production canonical/indexability | NOT TESTED | Existing policies retained; production was not deployed or inspected |

Screenshots and machine-readable results are in `artifacts/heading-clarity/`. Visually inspected the 320px Quote and 1280px Industries screenshots. Other widths have automated bounds checks and saved screenshots; no claim of exhaustive visual or assistive-technology review.

## Localization and release review

English is the source. Translation lookup uses normalized source text, not named page keys. All 14 new strings were allowlisted for the existing translation system. No new translations were authored. Localization TODO: review these strings in hi, ta, te, bn, mr, kn, ml, gu, pa, or, as, ur, es, fr, de, pt, it, ar, zh-CN, ja, ko, ru. RTL locales include ur and ar. Existing automatic-translation behavior remains in place; human approval is not implied by the allowlist.

The supplied brief says: “obtain normal editorial approval before production release.” English content-owner and localization-owner review are still pending. This local implementation does not establish those approvals. No service-scope claims were added beyond the requested text.

## Rollback

Starting reference: `b36f8f2`. Revert only the six implementation/test files listed above to that revision, or reverse this task's diff if subsequent work touches them. Remove this report separately if desired. Do not reset the whole repository or discard unrelated future changes. No database rollback is required.

Additional rendered check: PASS — `node artifacts/heading-clarity/secondary.cjs` verified all eight mandatory secondary headings and the three page titles. Contact and Quote omit canonicals locally under existing indexing gates; Industries retains its existing localhost canonical in this environment. Production-origin validation remains NOT TESTED.
