# Responsive validation

Date: 22 October 2026. Browser: installed Microsoft Edge through Playwright; local development server on port 3000; 900px viewport height; reduced motion requested for deterministic captures. Production/build performance is assessed separately.

## Required matrix

Widths: **320, 390, 430, 768, 1024, 1440, 1920px**.

Routes: `/`, `/services`, `/typesetting-services`, `/translation-services`, `/work`, `/work/complex-1-typesetting-sample`, `/about-us`, `/contact-us`, `/get-a-quote`, `/resources`, `/blog`.

`node scripts/audit-ui.mjs --phase=before` completed **77 route/viewport combinations**. All returned HTTP 200 with one main H1, no detected out-of-container content or horizontal page overflow, and no page JavaScript errors. Axe at 390px and 1440px identified a mobile contact-link target-size violation. Absence of overflow did not prove absence of the assistant obstruction: a separate scroll/rectangle inspection reproduced it.

Initial assistant collisions with quote controls were found at 320px (7 sampled intersections), 390px (5), 768px (1), and 1440px (1); none at 1920px. These were recorded before changing the fixed launcher to an in-flow form dock.

## Retest procedure

- `node scripts/audit-ui.mjs --phase=after`: repeats every matrix cell and captures full-page screenshots, computed palette tokens, status, H1 count, overflow and browser errors. Axe runs at 390/1440px for all 11 routes. The JSON contains every individual result.
- `tests/e2e/master-audit.e2e.spec.ts`: all four quote stages at all seven widths, validation, selected cards, Back preserving data, one synthetic mocked submission per run, help/control nonintersection, related-card widths and incomplete-row centering, staging headers, skip link, keyboard menu dismissal, mobile dialog and assistant focus return.
- Existing navigation, assistant, portfolio and accessibility tests are also run against this checkout using `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`. Port 3001 belongs to another checkout and is excluded.

## Evidence locations

| Evidence | Location |
| --- | --- |
| Before matrix and images | `artifacts/master-audit/before/results.json` and adjacent PNGs |
| Before typesetting related cards | `artifacts/master-audit/before/related-detail.png` |
| Before About introduction | `artifacts/master-audit/before/about-detail.png` |
| After matrix and images | `artifacts/master-audit/after/results.json` and adjacent PNGs |
| Quote-stage images | `artifacts/master-audit/quote-steps/` |
| Browser commands and failures/retests | `artifacts/master-audit/browser-tests.log` |

Full WCAG conformance, all assistive technologies, all operating systems and all real devices are not implied by this desktop-browser matrix. Final aggregate results and any incomplete checks appear in the release checklist.

## Final production retest

Final standalone production retest: 77 route/viewport cells, 22 axe scans, 0 HTTP failures, 0 overflow findings, 0 pages with JavaScript errors, 0 scans with violations. Eleven routes were checked at 320, 390, 430, 768, 1024, 1440 and 1920px. Material after screenshots were refreshed at 390/1440px; metrics cover all seven widths.

The selected Playwright suite passed **18/18 tests** (`browser-standalone.log`), including all four quote stages at seven widths. Use `http://127.0.0.1:3000`; the former localhost IPv6 listener was stale and was stopped. The other checkout on port 3001 was untouched. Invalid-submit content movement measured 0px on contact and quote after reserving feedback space. Real-device/native assistive-technology testing remains outside this desktop matrix.

After correcting findings from the extra theme audit, the targeted final retest passed 13/13 axe scans at 390/1440px in both themes across Industries, blog article and Work, including the open dark viewer. All three portfolio browser tests passed again. The complete matrix preceded only these scoped theme/viewer corrections; affected pages and viewer were retested directly. Multilingual evaluation did not finish and is not claimed as a pass.
