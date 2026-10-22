# Fix log — 22 October 2026

## Shared foundations

- `src/styles/tokens.css`: corrected the old cream/mint palette to the approved off-white, teal, soft teal, orange, deep teal, gray and border colors. Added explicit action, link, alert and green roles. Primary teal/white measures 4.41:1 and fails small-text AA; approved deep teal/white measures 12.71:1. Deep teal is therefore the action/link foreground or background where small text requires it. No new permanent brand variant was introduced.
- Existing CSS in styles and component modules: replaced verified former palette literals, including scoped service overrides, while preserving artwork, layouts, authentic portfolio assets and the existing Geist family. Added system fallbacks for supported scripts.
- `theme.css`, service styles and the About module: retained dark mode using approved foreground/background combinations; corrected dark artwork labels and the Mission/Vision surface after axe identified contrast regressions during retest.
- `navigation.css`: visible menu edges and increased desktop navigation type. Existing keyboard disclosures, Escape behavior, mobile dialogs and route mappings retained.

## Page and interaction corrections

- `ServiceHandoffContent.tsx` and `services-polish.css`: related services now share one card system instead of putting unlinked content into a separate list. Flexible three/two/one-column rows center incomplete groups. Typesetting previously showed four linked cards and one differently styled XML card; all five now share the layout.
- Four service handoff JSON files: linked already-described XML/JATS capability cards to the confirmed `/xml-conversion-services` destination. No slug changes or new claims.
- `about-page.module.css`: distributed existing approved introductory copy across balanced desktop columns, preserving readable line lengths; arranged Who We Are heading/copy into a desktop layout. Mobile remains one column. No filler content was added.
- `QuoteForm.tsx`, contact page and assistant component/CSS: form pages provide an in-flow help dock; other pages reserve a header dock. The launcher is portaled after the dock resolves, avoiding a hydration capture race. Dialog, conversation, reset, abort and focus return remain. Responsive browser tests verify no obstruction of quote controls.
- `QuoteForm.tsx`: the service radiogroup exposes invalid state and associates feedback. The four stages, validation rules, entered values, upload handling and backend contract remain.
- `FieldFeedback.tsx` and form CSS reserve feedback space and retain stable IDs/live announcements. Invalid contact and quote submissions previously moved subsequent content by 88.5px and 100.8px; retest measured 0px for both.
- Homepage primary CTA now uses the filled button treatment, visually distinct from the secondary arrow link. The second above-the-fold portfolio thumbnail loads eagerly after a browser LCP warning.
- `contact.css`: email/phone links have a 44px minimum interactive height after the baseline mobile axe scan found a WCAG 2.2 target-size failure.
- Assistant reply links now recognize canonical service URLs from the existing service-path map. The prior allowlist accepted `/services/...` but rendered canonical service links as plain text. The same constrained path list prevents arbitrary URLs being introduced.

## Staging safety and portability

- `site-indexing.cjs`, root metadata, Next headers and sitemap configuration: non-production hosts receive noindex protection; generated staging robots.txt disallows crawling. HTTPS `epubtrans.com` and `www.epubtrans.com` remain eligible in self-hosted production; Vercel preview/development contexts remain excluded. Legal pages retain their specific review restrictions.
- Added policy tests for localhost, Vercel, preview context, deceptive hostnames, invalid origins and the future production domain.
- Preserved prior task changes: PostgreSQL credential correction, `.npmrc` warning removal, local editorial-content restoration and laptop-transfer instructions. No further CMS data or permissions were changed by this audit except a uniquely identified, cleaned-up synthetic quote fixture used for persistence verification.

## Evidence and limitations

Additional release scans found and corrected three theme-specific cases: Industries project section now uses the theme-aware accent surface; blog author initials use paired action colors; viewer heading/reading/loading surfaces follow the active theme. The image-preview scroll region is keyboard focusable and named. These findings were outside the original light-theme matrix and are retained in release audit history.

Next.js and matching ESLint configuration were patched from 16.3.6 to 16.3.8. The final dependency audit still reports 11 high and 5 moderate findings in other dependency chains; no critical findings. The braces advisory has no published patch. No forced Payload downgrade was attempted. References: https://github.com/advisories/GHSA-cjq9-62q9-8jv4, https://github.com/advisories/GHSA-4jqv-mc3x-m676, https://github.com/advisories/GHSA-vfj7-8cjw-p6xm.

Final browser verification uses `http://127.0.0.1:3000`, the standalone production build. A stale IPv6 development listener on port 3000 was stopped after identifying mixed-server measurements. Superseded logs remain as history. No process for the other checkout on port 3001 was changed. Quote and contact persistence/idempotency tests remove their uniquely identified synthetic records; live notifications remain disabled during QA.

Before/after full-page images and JSON metrics: `artifacts/master-audit/before/` and `artifacts/master-audit/after/`. Quote step screenshots and browser traces are kept separately. These generated artifacts are intentionally ignored by Git. Actual final command results, remaining approvals and performance limitations are recorded in the release checklist; an edit alone is not considered a passed check.
