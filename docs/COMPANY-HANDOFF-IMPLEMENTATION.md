# Company handoff implementation

Sources: `EPUBTRANS_About_Us_Developer_Handoff_v1.0.md` (ET-ABOUT-001 v1.0) and `EPUBTRANS Company Navigation.docx`, supplied by the user. The user's constraint is to retain the current UI.

## Implemented

- Retained existing components, styles, palette, typography, illustrations, responsive layouts and motion. No CSS changes were needed for this handoff.
- Kept the Company dropdown's existing presentation while reducing its groups to three destinations: About EPUBTRANS, Global Delivery & Collaboration, Careers. The existing overview link also leads to About. Section links remain within page content rather than the global dropdown.
- Updated the footer and Company page navigation consistently. Contact and Get a Quote remain global actions.
- Retained the existing approved About content and replaced fallback Mission and Vision with the exact handoff wording. Explicitly approved, complete CMS overrides still take precedence; unapproved or incomplete overrides use the handoff text. Updated CMS help text without changing the schema.
- Added AboutPage JSON-LD using the visible company name and description, without introducing address, personnel, customer, certification or performance claims.
- Retained `/about-us`, its existing `https://www.epubtrans.com/about-us` canonical, and `/company` as the existing staging alias. The sitemap already includes `/about-us` and excludes the alias. No URL was retired and no new redirect was introduced.
- Provisionally retained `/company/global-presence` and its existing anchors. Updated its public title, metadata and four topics to international collaboration, Chennai-based support, multilingual requirements and project communication/delivery. No office network or language totals are asserted.
- Updated Careers headings to Careers at EPUBTRANS, Areas of Work and Current Opportunities. Replaced the unverified general internship promotion with application instructions in the same layout. Existing published CMS vacancies remain unchanged; this work does not verify or republish them.
- Leadership and invented company history were already absent from the About page and remain absent.

## Verification

- Compared 48 visible About copy blocks with section 2 of the supplied Markdown: all matched.
- About integration checks cover required sections, links, approved fallback copy and CMS approval behavior.
- Quote form/API tests exercise validation and successful save/notification handling with mocked services. These are not evidence of live email delivery.
- Production build, TypeScript and targeted ESLint checks passed.
- Browser checks cover desktop/mobile Company navigation, keyboard dismissal, service destinations, canonical/schema/sitemap output, the staging alias, retained Global Delivery anchors, accessibility and overflow at 320, 390, 768 and 1440 pixels.
- Reviewed desktop and mobile Company menu screenshots in `artifacts/clean-ui/company-handoff/`.

## Business facts and release checks still pending

The supplied documents distinguish implementation from live publication. No deployment or external email was performed.

- Owner confirmation of the DTP Assistant vacancy, recruitment owner/contact, application destination and any active internship process is still required. A clarification was requested; no business approval was inferred from elapsed time or the CMS published flag.
- Confirm current technical service scope, Chennai location and international working arrangements before live publication, as requested by the handoff.
- Confirm the preferred production hostname, canonical and trailing-slash policy. This change preserves the existing setting rather than choosing a new production domain.
- Global Delivery remains provisional; assess unique business information and traffic/backlinks before any future merge, removal, redirect or noindex decision.
- Live form receipt/email delivery, production robots/indexation and analytics require deployment-specific verification. Automated local tests do not establish these external outcomes.
