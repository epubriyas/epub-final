# Subtitling Services handoff implementation

**Status:** Implemented in the local source tree; not deployed or published.

## Scope completed

- Preserved the existing `/subtitling-services` route and CMS slug.
- Mapped the ZIP's approved copy into 15 ordered page blocks: the hero and 14 sections, including all 12 FAQs.
- Applied the approved SEO title and meta description.
- Removed the old CMS-rendered subtitling copy from this page by rendering the new handoff content layer. The only error-free reference is the approved negative qualification: “EPUBTRANS does not guarantee error-free output…”
- Kept hero and final quote actions on `/get-a-quote` without a query parameter; the secondary action uses `/contact-us`.
- Linked only to existing related service routes. Localization Production Services remains unlinked pending deployment; Indexing Services is absent.
- Used the existing subtitling-specific illustrative hero image and its descriptive alt text.
- Left Voiceover Services and Transcription Services content untouched.

## Validation completed

- `npm run typecheck` passed.
- `npm run build` passed.
- `node scripts/verify-service-handoffs.mjs subtitling` passed: approved text assertions, one H1, approved meta description, seven links, responsive checks at 1440, 390 and 320 pixels, and Axe accessibility checks at 1440 and 390 pixels.

## Release gates still open

This handoff does not authorize publication. Operational verification remains required for language and script coverage, SRT/WebVTT support, captioning/SDH scope, source-media compatibility, timing/playback tools, video processing, and eLearning integrations. Quote-form submission, media privacy/security, retention/deletion, backups, canonical host policy, full prelaunch QA, and management release approval were not verified here. No confidential media was submitted and no production settings were changed.
