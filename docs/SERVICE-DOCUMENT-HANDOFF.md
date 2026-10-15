# Service document implementation

The user's instruction was to apply all supplied service documents one by one and keep the current UI. The documents' research summaries, approval-status notes, keyword strategy, competitor references and developer instructions are treated as source material, not public website copy.

## Completed sequence

| Order | Document | Existing public page |
| --- | --- | --- |
| 1 | Voiceover.docx | `/voiceover-services` |
| 2 | CoverPage.docx | `/cover-page-design-services` |
| 3 | EPUBTRANS_Copyedit_Proofread.docx — Copyediting | `/copyediting-services` |
| 4 | EPUBTRANS_Copyedit_Proofread.docx — Proofreading | `/proofreading-services` |
| 5 | EPUBTRAN_Elearning_Localization.docx | `/elearning-localization-services` |
| 6 | EPUBTRAN_Accessibility.docx | `/accessibility-services` |
| 7 | EPUBTRAN_Data_Conversion.docx | `/data-conversion-services` |
| 8 | EPUBTRAN_DTP.docx | `/desktop-publishing-services` |
| 9 | EPUBTRAN_Ebook_Creation.docx | `/ebook-creation-services` |
| 10 | EPUBTRANS Typesetting services.docx | `/typesetting-services` |
| 11 | `graphic_design.docx` — draft v1.0 | `/graphic-design-image-services` |
| 12 | SciELO XML Markup Services Developer Handoff v1.1 ZIP | `/scielo-xml-markup-services` |

Each page was extracted, registered, rendered and checked before proceeding to the next page. All complete website-copy sections were included, rather than shortening the documents to a summary.

## Presentation and content

- Retained the existing service hero layouts, fonts, palette, CMS image assets, illustrative visuals, source/deliverable diagrams, capability lists, workflow timelines, related-service cards, FAQ disclosures and motion system. No stylesheets or visual assets were changed for this task.
- Applied document H1s, introductions, paragraphs, lists, H2/H3 sections, workflows, quality/scope qualifications, FAQs, final enquiry copy and CTA labels. Content length and section counts follow the supplied copy, so page heights increase where required.
- Applied the document SEO titles and descriptions to the existing canonical routes. Breadcrumb labels and BreadcrumbList match the visible H1. Existing image metadata and URL handling are retained.
- Quote buttons use the existing `/get-a-quote` form as the documents' safe default. Existing category preselection remains supported by the form when an allowlisted parameter is explicitly supplied; these document buttons do not introduce unverified service-slug parameters.
- Related links use existing specialist pages. Proposed Publishing Services, Localization Production and general XML/JATS pages remain unlinked. SciELO markup is not relabeled as covering every XML/JATS requirement.
- Only the ten mapped services use the new copy. Other service pages continue to use their existing CMS content.

## Where the copy lives

The source-aligned copy is versioned in `src/config/service-handoffs/*.json` and registered in `src/lib/service-handoff.ts`. It takes precedence for the ten mapped service pages. Existing CMS service identities, publication status, records, hero images and layout overrides are preserved; this task did not overwrite the database.

For these ten pages, edit their handoff JSON to change the document copy. Editing the old CMS overview/features/FAQs alone does not replace this content layer. Removing a service from the registry restores its original CMS-driven rendering. The hero and section renderer consume the content without storing public copy in client effects.

`scripts/extract-service-handoff.py <slug> --register` reproduces extraction from the supplied Word documents in Downloads. It uses the explicit website-copy paragraph ranges and heading/list information in the exact provided versions. If a source document is revised, review the ranges and generated copy before applying the extractor again.

## Verification

- Independent comparison against the Word files: all 2,284 website-copy checks matched rendered HTML. Workflow step numerals are displayed by the existing ordered timeline; related-service title/description pairs are displayed as cards.
- Per-page sequential checks: exact rendered copy, one H1, metadata, verified link destinations, no runtime errors and no horizontal overflow at 320, 390 and 1440 pixels. Automated accessibility checks passed on mobile and desktop.
- Production build, TypeScript and targeted ESLint passed.
- Service/quote-form integration tests: 16 passed.
- Production service browser suite: five passed, covering catalog/canonical output, image loading and fallback, 13 responsive widths, breadcrumbs, quote form selection, process anchors, reduced motion, dark theme and mobile navigation.
- Additional production dark-mode and FAQ-expansion checks passed for Voiceover, Cover Design, Proofreading, Accessibility, Data Conversion, DTP and eLearning Localization. The production suite also checked Typesetting, Copyediting and eBook Creation in dark mode.
- Screenshots were reviewed and retained under the ignored QA directory `artifacts/clean-ui/service-handoffs/`. Test-generated changes to tracked screenshots were restored.

These changes implement the user's request locally. No live deployment or external test email was performed. The documents' operational verification and release checks still apply before production publication.

## Additional two-page update — 15 October 2026

- Applied the Graphic Design & Image Services replacement draft to `/graphic-design-image-services`. The copy preserves scientific-image integrity, separates cover design, qualifies format/tool support and uses the plain `/get-a-quote` route.
- Applied the finalized SciELO XML Markup v1.1 handoff to `/scielo-xml-markup-services`. The certification claim is scoped to XML article tagging, uses the official verification link, and displays no SciELO logo. Technical support details remain qualified by project scope; validation is not presented as guaranteed SciELO acceptance.
- Kept the existing teal/mint and warm-paper service presentation and matching existing hero images. No unrelated service pages or indexing content were changed.
- Both route checks passed exact visible-copy, metadata, link, runtime, responsive overflow and accessibility checks at 1440, 390 and 320 pixels. TypeScript, targeted ESLint and the production build passed.
- The SciELO verification link currently lists EPUBTRANS. The ZIP's open technical, logo-use and prelaunch gates remain release conditions; these local changes do not constitute deployment or completion of those approvals.
