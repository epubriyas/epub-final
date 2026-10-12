# Portfolio and on-site samples

The existing `/work` and `/work/[slug]` routes now use the existing Payload `case-studies` collection. Samples are explicitly labelled; no customer names, outcomes or project workflow claims were invented. Related services come from published CMS relationships and quote links use the existing validated service preselection.

## Source audit and publication

The supplied Drive folder was accessible. The private inventory contains 37 files: 17 PDFs, 7 ZIP archives, 7 EPUBs, 5 MOBIs and 1 DOCX. Its actual folders include DTP, typesetting, PDF-to-INDD and eBook examples. Large archives, MOBI files and the larger interactive EPUBs were not downloaded or exposed.

Owner permission on 11 October 2026 was **display on site only**. We prepared 25 records from verified source PDFs, selected PDF-to-layout archives and EPUBs. There are 19 published samples across Publishing & Typesetting, Multilingual DTP, eBook & EPUB and Document Conversion. Six records remain drafts because extracted preview text contains contact details: Arabic and Portuguese layouts, both sample 3 conversion variants, Medium 1 and Simple 2 typesetting. Review both image and text before publishing these records; do not simply remove the draft gate.

PDFs use actual rendered WebP pages, capped at six pages per source. EPUBs use their source covers and up to four readable spine sections, with bounded text. The EPUB reader is a clearly labelled excerpt; original typesetting, embedded audio/video and interactive features are not reproduced. Native INDD, MOBI and DOCX downloads are not offered. Excerpt boundaries are shown in the viewer.

## Storage and access

Originals, private inventory and prepared assets live in ignored `private-uploads/portfolio-source` and `private-uploads/portfolio-prepared`. Neither directory has a public serving route. Next.js standalone tracing excludes those files, generated preview storage, backups and test artifacts.

The `portfolio-previews` upload collection stores generated images only, defaulting to `private-uploads/portfolio-previews`. Public image reads require a reference from a published, permission-confirmed case study. Drafts, unapproved records and unreferenced uploads are denied. Responses use `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, noarchive`. Next Image optimization is disabled for these assets to prevent an optimizer cache bypassing later permission changes.

The initial explorer requests lightweight metadata and thumbnails. `/api/work/[slug]/preview` loads full preview content only when a visitor opens a sample; it applies the same publication and permission gates. Restricted detail and preview routes return 404. There are no Drive links, original-file endpoints or download controls in the portfolio.

Visitors can still save or capture anything visible in a browser. “On-site only” means no original-file downloads or download action; it is not a DRM guarantee.

## Maintenance and deployment

Use the Payload admin to curate the existing case studies and generated preview collection. Check publication status, permission confirmation and related services when editing. Public URLs retain the existing routing conventions.

For production, run the committed Payload migration, retain the PostgreSQL records, and mount persistent preview storage. Set `PORTFOLIO_PREVIEW_DIR` to its absolute path if the default is unsuitable. Serve previews through Payload's protected file endpoints; do not expose the storage directory as static hosting. Generated previews are intentionally excluded from the standalone package and must be provisioned separately. Originals and preparation directories should stay off the public deployment.

The local database had an existing Payload development migration marker. `scripts/apply-portfolio-migration.mjs` backed up metadata and applied only the additive portfolio migration in a transaction; it did not reset the database. Normal production deployment should use `npm run payload -- migrate`, not that local helper.

Preparation tools, run from the project root:

```powershell
node scripts/inventory-portfolio.mjs <source-folder-id>
# Download only approved, size-checked source files into the private source directory.
python scripts/prepare-portfolio.py
npx tsx scripts/import-portfolio.ts --approved-on-site-only
```

Preparation requires Pillow, pypdf and Poppler's `pdftoppm`. The import is idempotent by slug and requires the explicit display-permission flag. Importing sources does not authorize publication of contact details. Keep the generated audit and inspect previews before changing status.

## Verification

```powershell
npm run lint
npm run typecheck
npm run test:int
$env:PLAYWRIGHT_BASE_URL = 'http://localhost:3000'
npx playwright test tests/e2e/portfolio.e2e.spec.ts --reporter=line
npx tsx scripts/verify-portfolio-access.ts
npm run build
```

The browser coverage includes category/search/reset behavior, deferred content loading, PDF navigation/zoom/text/full screen, EPUB navigation/text size, keyboard focus and Escape, quote preselection, preview failures, reduced motion, accessibility checks, detail/service routes and overflow checks at 320, 375, 390, 414, 768, 1024, 1440 and 1920 pixels. The access audit checks published assets, all six drafts, an unapproved published record, cache headers and absence of original-source information.
