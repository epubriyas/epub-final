# Responsive audit — 29 October 2026

## Scope and implementation

Inspected the Next.js 16.3.8 / React 19 / Payload 3 project, filesystem routes, shared layout, navigation, footer, forms, assistant, service visuals, company pages, technology pages, articles, portfolio viewer, CSS imports, component styles and existing browser tests. Read the local Payload skill and bundled Next.js navigation and viewport documentation. The viewport metadata already uses device width, initial scale and safe-area support.

The existing responsive layouts passed the expanded route crawl. Kept their design, column behavior, typography, colors, content and animation systems. No new dependencies, backend changes or global overflow suppression were added.

Changes made for this audit:

- `src/components/navigation/footer.module.css`: raised mobile navigation, legal, brand and contact links to a 44px minimum touch height. The newer module styles did not inherit the older shared responsive footer rules.
- `src/components/navigation/Header.client.tsx`: retains the desktop trigger across React ref cleanup and restores focus after layout when responsive CSS hides the focused desktop control.
- `src/app/(frontend)/contact/page.tsx` and `src/app/(frontend)/get-a-quote/page.tsx`: added reserved assistant docks in the content flow. `/contact-us` shares the contact component.
- `src/components/assistant/EpubtransAssistant.tsx`: portals the existing launcher into these docks after mounting and on route changes. The dialog and chat behavior remain shared; the launcher has an explicit button type. This resolves the observed floating launcher obstruction on the narrow contact page.
- `src/components/assistant/assistant.css`: reserves the dock's 44px height before hydration to avoid shifting subsequent content when the launcher mounts.
- `tests/e2e/responsive.e2e.spec.ts`: expanded route seeds, viewport dimensions and landscape coverage; persists completed matrix cells; waits for hydration before interaction; checks dock behavior and focus return. Moves the pointer away from desktop hover navigation before loading the next route.
- `tests/e2e/portfolio.e2e.spec.ts`: updated two stale expectations for the existing carousel and the quote form's preselected-service flow.

Pre-existing working-tree changes to motion, header, navigation CSS and navigation tests were preserved; the header received the additional focus correction described above. The Maps link change belongs to the preceding request.

## Verification

Production Microsoft Edge / Playwright crawl: **61 public routes × 15 viewport sizes = 915 passing cells**, with no detected horizontal document overflow, exposed out-of-viewport content or page JavaScript errors. It recursively follows internal links from all main public route families, covering service detail pages, technology guides, portfolio details, company pages, contact, quote, search, legal pages and article/listing routes exposed by the current content. The expected responsive 404 surface is accepted for unpublished destinations.

Viewports: 320×568, 360×800, 375×812, 390×844, 430×932, 480×800, 600×800, 768×1024, 820×1180, 844×390, 1024×768, 1280×800, 1366×768, 1440×900 and 1920×1080.

Matrix evidence: `artifacts/responsive-20261029/matrix.json`. Visually inspected the mobile homepage and before/after 320px contact captures. Contact evidence: `artifacts/responsive-20261029/contact-fixed-320.png`. Selected homepage, services, company and quote screenshots are in `artifacts/mobile/`.

- TypeScript check: passed.
- ESLint: passed.
- Integration tests: **29 files, 135 tests passed**.
- Production build and sitemap generation: passed after retrying with filesystem access needed for Windows-generated `.next` files.
- Existing navigation and accessibility suite: **10 tests passed**, including six automated WCAG scans across home, services and quote at 390px and 1440px.
- Portfolio: **3 tests passed** after refreshing the stale test expectations; includes filtering, PDF/EPUB viewing, preview errors, dark-theme accessibility and detail sizing.
- Assistant dock: passed for three routes at 320×568, 844×390 and 1440×900, including dialog fit and focus restoration.
- Mobile footer touch targets, mobile/landscape menu scrolling and navigation, and all four quote steps with validation, long text, preserved values and a mocked submission: passed.
- Breakpoint closure, scroll-lock release and keyboard focus restoration: passed after the header ref/focus correction.
- Final production navigation/responsive interaction rerun: **14/14 passed** on the final build. The 915-cell crawl preceded only the scoped header focus and reserved dock-height refinements; affected controls were retested in this final run. Total selected passing browser coverage comprises the matrix test, 14 final controls/navigation tests, one accessibility test and three portfolio tests.

## Limits

Desktop Edge viewport emulation does not certify real iOS/Safari, Android/Chrome, native keyboards, screen readers or every possible CMS record. Unlinked or unpublished CMS content requires separate verification. Automated geometry checks allow intentional artwork clipping and local scrollers; they are not a proof against every visual collision. Earlier development runs had a browser network-suspension error and clicks before hydration; production results above supersede those incomplete runs. Windows image-cache write warnings did not cause the passing geometry checks to fail.
