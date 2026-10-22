# EPUBTRANS V2 UI/UX audit

Date: 22 October 2026. Scope: local V2 development repository. Branch: `main`.
The user's pasted execution request authorizes this work and adopts the complete supplied Word document as the detailed specification. The document is reference material; its instructions are applied within that request's scope. No deployment, production writes, destructive migrations, publication-permission changes, or invented content are authorized.

## Initial inspection, before source changes

- Stack: Next.js 16.3.6 App Router, React 19.2.6, TypeScript 5.7.3, Tailwind 4, Payload 3.90.2, PostgreSQL; npm/package-lock. Existing Geist font preserved.
- Public routes: filesystem pages plus CMS slugs, canonical service path map, published portfolio/blog/careers/solutions. Previous comparison recorded 61 public URLs; XML/JATS was restored locally at the user's request in the previous task.
- Shared UI: `src/components/navigation`, `src/components/forms`, `src/components/assistant`, service/company/work components. CSS entry point: `src/styles/index.css`; tokens are subsequently overridden by scoped styles.
- Local database content and media were restored in the previous task. This audit will preserve that data and publication settings.
- Existing unit/integration, Playwright, axe, responsive, localization, form, SEO, theme, navigation and portfolio tests are available. Port 3000 serves this repository; port 3001 belongs to a different checkout and must not be used for this audit.

| ID | Priority / confidence | Finding and evidence | Impact / root cause | Initial action / acceptance |
| --- | --- | --- | --- | --- |
| UI-001 | P1 / confirmed in source | `tokens.css` defines cream `#f4f2eb`, teal `#006d68`, ink `#102b2b`; `services-polish.css` overrides approved service colors with the old palette. | Brand mismatch throughout shared UI. | Replace unauthorized semantic values centrally; measure accessible combinations and verify computed styles. |
| UI-002 | P1 / unverified rendered | Fixed assistant launcher is 28px from viewport edges with z-index 90. | Potential obstruction of quote options and controls. | Reproduce across quote steps, viewports and scroll positions; retain chat functionality. |
| UI-003 | P2 / unverified rendered | Reported typesetting related-card imbalance and About introductory empty space. | Potential poor alignment. | Inspect actual shared layouts before changing. |
| UI-004 | P1 / unverified deployed | No staging robots rule apparent in shared metadata or Next headers. | Staging might be indexable. | Inspect actual deployed headers/directives and implement environment-specific safeguards locally. |
| UI-005 | P2 / confirmed content | Published blog titles include `demo 2`; portfolio titles include `Complex 1 typesetting sample`; careers title `Desktop publish Assistant`. | Editorial/readiness concern. | Record for owner/GPT2 review; preserve data, titles and permissions. |

## Evidence collection

Baseline and retest evidence will be recorded under `artifacts/master-audit/`. Findings, results, limitations and acceptance decisions below will be updated after actual checks. Baseline observations are not claimed as resolved until retested.

## Final findings and disposition

Final standalone production retest: 77 route/viewport cells, 22 axe scans, 0 HTTP failures, 0 overflow findings, 0 pages with JavaScript errors, 0 scans with violations. Eleven routes were checked at 320, 390, 430, 768, 1024, 1440 and 1920px. Material after screenshots were refreshed at 390/1440px; metrics cover all seven widths.

| Finding | Result / evidence | Remaining decision |
| --- | --- | --- |
| UI-001 palette | Approved semantic colors applied; deep teal used where primary teal fails small-text contrast. Matrix, light/dark scans and screenshot review. | Brand owner review before publication. |
| UI-002 assistant | Reproduced baseline collisions; reserved header/form docks now pass responsive quote nonintersection and focus-return tests. | None for local fix. |
| UI-003 layout | Five related cards share widths and centered incomplete rows; existing About text balanced on desktop. Browser assertions and before/after images. | None for local fix. |
| UI-004 staging | Local headers, metadata, robots and production-domain policy verified. | Remote Vercel deployment still requires authorized rollout. |
| UI-005 content | Test-like content, careers wording and publication permissions recorded without altering owner data. | Owner/EPUBTRANS GPT2 approval. |
| UI-006 P1 confirmed touch targets | Contact email/phone 44px targets resolve baseline axe finding. | None for local fix. |
| UI-007 P2 confirmed validation shift | Reserved accessible feedback eliminates measured 88.5px/100.8px contact/quote movement. | None for local fix. |
| UI-008 P2 confirmed CTA hierarchy | Filled home primary CTA distinguishes secondary link. | Visual owner review. |
| UI-009 P1 confirmed dependencies | Next patched 16.3.8; npm audit remains 11 high/5 moderate, including braces without published patch. | Dependency maintainer/security assessment before public release. |

Security source review covered exact-origin checks, authenticated collections/files, bounded/type-checked uploads, private storage, secret boundaries and publication controls. Process-local rate limits require a shared store for a multi-worker deployment. This is not a penetration-test certification. Live email delivery was not exercised. Local quote/contact duplicate persistence was verified and fixtures removed. No production deployment or destructive database migration was performed.
