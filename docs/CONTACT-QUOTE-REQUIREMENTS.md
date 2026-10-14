# Contact Us and Get a Quote implementation checklist

Implementation record for the supplied EPUBTRANS Contact Us Word document and Contact / Quote Developer Handoff v1.0 ZIP. The approved content is implemented on local routes; this record does not approve or indicate a production release.

## Source and approval reconciliation

- The Word document identifies the copy as “Content Draft v1.0” and “Ready for management review”; its conclusion says editorial approval is still needed.
- The ZIP handoff says the same page copy and form direction were approved on 12 October 2026. These approval statements conflict. The implementation follows the supplied wording for local review, while production indexing and unverified details remain gated.
- The ZIP’s implementation blueprint is treated as a specification, not as a deployed API contract. Its unresolved approval register and release checklist remain in force.
- The user's implementation rules govern safe project work and reporting. Document text is treated as website specification, not as authority to publish, send enquiries, or waive the listed release approvals.

## Requirement traceability

| Source requirement | Status | Implementation location / evidence |
|---|---|---|
| Keep General Contact and Project Quote as distinct conversion paths; do not combine them. | Implemented | `/contact-us` and `/get-a-quote` have separate page components, endpoints, and private Payload collections. |
| Prefer `/contact-us`; retain `/get-a-quote`; do not redirect Get a Quote. | Implemented locally | `src/app/(frontend)/contact-us/page.tsx`, `src/app/(frontend)/get-a-quote/page.tsx`, `src/config/redirects.ts`. No quote redirect is configured. |
| Keep `/contact` from becoming an indexable duplicate; decide permanent redirect only after route approval. | Implemented / awaiting approval | `/contact` remains a noindex alias to the Contact component. No permanent redirect is issued pending U04. |
| Use exact Contact title, description and H1. | Implemented | `src/app/(frontend)/contact-us/page.tsx`; local HTTP response checked for exact title and H1. |
| Use exact Quote title, description and H1. | Implemented | `src/app/(frontend)/get-a-quote/page.tsx`; local HTTP response checked for exact title and H1. |
| Use canonical candidates only after route approval; do not expose staging as indexable/canonical. | Gated / awaiting approval | Canonical tags and indexing are enabled only when `VERCEL_ENV=production` and `EPUBTRANS_INDEXING_APPROVED=true`. Local/preview pages emit noindex. |
| Contact hero and introduction: heading, tagline, three paragraphs. | Implemented | `src/app/(frontend)/contact/page.tsx`. |
| Contact paths: General Business, Publishing & Localization, Partnership, correct quote CTA. | Implemented | Contact sections and links in `src/app/(frontend)/contact/page.tsx`. |
| Contact form: name, business email, optional organization, required enquiry type, message; exact option IDs and labels; Send Enquiry. | Implemented | `src/components/forms/ContactForm.tsx`, `src/lib/validation/quote.ts`, `src/app/(frontend)/api/enquiry/route.ts`. |
| Contact success copy appears only after accepted submission. | Implemented | Component shows approved confirmation only after HTTP 201; endpoint returns acceptance only after private Payload persistence. |
| Contact information: exact Chennai location; email/phone and office addresses only after management confirmation. | Partly implemented / approval pending | Location is rendered in `src/app/(frontend)/contact/page.tsx`. Email and phone display only when `SiteSettings.contactDetailsApproved` is enabled. Full addresses are not rendered. |
| Project estimate and services sections, copy and destinations. | Implemented | Contact page links to `/get-a-quote` and `/services`. |
| Quote intro and project form copy; all approved next-step text; no price or schedule guarantee. | Implemented | `src/app/(frontend)/get-a-quote/page.tsx` and `src/components/forms/QuoteForm.tsx`. |
| Quote contact fields: full name, email, required organization, optional country/region. | Implemented | `QuoteForm`; required fields enforced in `validateQuote` and the server endpoint. |
| Quote service selector: six approved category labels plus Multiple Services / Not Sure and Other; stable IDs. | Implemented | `quoteServiceOptions` in `src/lib/validation/quote.ts`; service prefill is allowlisted. U12 business verification remains open. |
| Quote requirements: description, source/output formats, volume, languages, preferred date and additional information. | Implemented | `QuoteForm`, `validateQuote`, `QuoteRequests` collection and migration `20261013_165500_contact_quote_forms`. Optional values may be empty. |
| Quote guidance: all six service-specific information groups. | Implemented | `src/app/(frontend)/get-a-quote/page.tsx`. |
| Quote success copy and Explore Our Services link; only after server acceptance. | Implemented | `QuoteForm` success state and `/services` link. Persistence is committed before success response. |
| General and quote leads are distinct; server validation, private durable storage, correlation ID and deduplication. | Implemented locally | `/api/enquiry` → private `enquiries`; `/api/quote` → private `quote-requests`; unique `submissionKey` and retry lookup. Migration applied to local database as batch 9. |
| Prevent duplicate submits; preserve values and offer accessible errors/retry. | Implemented | Both client forms use pending guards, inline error associations and retain controlled values. API tests exercise errors and duplicate retries. |
| Privacy policy linked near each form; privacy/consent behavior chosen by legal owner. | Link implemented / legal approval pending | Both forms link to `/privacy-policy`. No unapproved consent checkbox or legal wording is presented. U07 remains blocking. |
| Upload disabled until signed security/privacy approval; reject attempts while disabled. | Implemented | No upload control in `QuoteForm`; `/api/quote` returns 422 for submitted files. Existing private-file routes/data remain for previously stored requests. |
| Notifications only to approved destination; no visitor PII in analytics. | Gated / awaiting operations and privacy | `notifyQuote` requires `ENQUIRY_RECIPIENT_APPROVED=true` and an explicit recipient; `.env.example` defaults gate off. No analytics event is emitted. U06/U10 remain open. |
| Internal links: homepage, Services, About, Contact, Quote and individual service prefill. | Implemented in source | Home link in `src/app/(frontend)/page.tsx` and seed; Services/About quote links retained; navigation, footer, assistant and service links use `/contact-us`; service query IDs are validated. |
| SEO: unique metadata/H1, no fabricated schema, staging noindex, intended sitemap routes. | Implemented / production verification pending | Contact and quote metadata are unique; sitemap contains only `/contact-us` and `/get-a-quote`; indexing gate is off by default. Production host and sitemap release review remain U14. |
| Accessibility: semantic fields, visible labels, linked errors, status announcements, focus and mobile behavior. | Implemented; QA partial | Native labelled controls, `aria-describedby`, `aria-invalid`, focus first invalid field, live status; responsive styles reuse project system. See Q19. |
| Record timestamp, service and source page; attribution only if approved. | Implemented / attribution pending | Payload timestamps, category and fixed `sourcePage` are stored. Campaign attribution and analytics are omitted pending U07/U10. |

## Approval register

| ID | Status | Current handling |
|---|---|---|
| U01 | Awaiting management / operations | Confirm the published email receives enquiries and assign a monitoring owner. |
| U02 | Awaiting management | Confirm phone and whether it should be displayed. |
| U03 | Awaiting management | Confirm any full office addresses before publishing; none are shown. |
| U04 | Awaiting developer / SEO | Approve `/contact-us`, alias/301, hostname and trailing-slash behavior. `/contact` is currently noindex; no permanent redirect is assumed. |
| U05 | Local route verified; production pending | `/get-a-quote` returned HTTP 200 locally. Production routing remains unverified. |
| U06 | Awaiting developer / operations | Approve submission destination, owner, recipient and failure alerts. Quote email is gated off; general enquiries persist privately without notification. |
| U07 | Awaiting legal / management | Approve notice, legal basis, consent/acknowledgement and retention. Privacy link is present; no new legal copy or retention period was invented. |
| U08 | Closed for current implementation; approval still required to enable | Upload control is absent and API rejects files. Do not enable until security/privacy controls are signed. |
| U09 | Tested locally | Required/optional fields, validation and submit states covered by unit/integration tests; production end-to-end still pending. |
| U10 | Awaiting marketing / privacy | No analytics events or attribution capture are enabled. |
| U11 | Implemented in source; QA partial | Routes updated in navigation, footer, assistant, home fallback/seed, services and About links. Production click-through remains unverified. |
| U12 | Awaiting management / service owners | The selector matches approved labels/IDs. Confirm that all categories accurately describe current active offerings. |
| U13 | Engineering decision recorded | Country/region, formats, volume and languages use text inputs; delivery date uses native date input; selected limits are 500 characters, 5,000-character long text and 20-character minimum project description. |
| U14 | Partly tested; production release blocked | Local route, metadata, alias and default noindex checked. Production HTTPS, final canonical/redirect, staging robots, sitemap and accessibility-device QA remain. |

## Release QA evidence

| Test | Status | Evidence / remaining work |
|---|---|---|
| Q01 Contact route | PASS locally | `/contact-us` returned HTTP 200 with the Contact page and H1. Production HTTPS not tested. |
| Q02 Quote route | PASS locally | `/get-a-quote` returned HTTP 200 with the Quote page and H1. Production HTTPS not tested. |
| Q03 Alias and redirects | PARTIAL | `/contact` returned HTTP 200 and is noindex; permanent redirect decision awaits U04. |
| Q04 Metadata and canonical | PASS locally / production pending | Exact unique titles and H1s checked. Canonical is intentionally withheld until the production SEO gate is enabled. |
| Q05 Service selector | PASS | Selector uses all eight approved IDs/options; exercised in form test. |
| Q06 Contact happy path | PASS in local route tests | Private persistence and 201 response tested with synthetic data; no live recipient notification. |
| Q07 Quote happy path | PASS in local route tests | Complete field set, persistence order and accepted response tested with synthetic data; no live recipient notification. |
| Q08 Contact required fields | PASS | API validation tests reject missing name, email, type and message. |
| Q09 Quote required fields | PASS | Server/client validation covers name, email, organization, service and description. |
| Q10 Invalid email | PASS | Client and API validators reject malformed email. |
| Q11 Optional quote fields | PASS in code path | All optional fields accept empty values; regression test to be confirmed in full suite. |
| Q12 Failure path | PASS in component/API tests | Form values remain; errors render and retry remains available; no success state on failure. |
| Q13 Duplicate submission | PASS in local tests | Client pending guard and API idempotency lookup return one stored lead for repeated key. |
| Q14 Routing and notifications | BLOCKED | Recipient, mailbox/CRM, owner and failure-alert workflow need U06 approval. |
| Q15 Analytics | BLOCKED | No events enabled pending U10; no PII is sent. |
| Q16 Privacy | BLOCKED | Existing policy is linked; legal notice/consent and retention require U07 approval. |
| Q17 Security | PARTIAL / release blocked | Origin checks, rate limits, honeypot, bounded body, server validation and private access are implemented. Independent security/retention review remains. |
| Q18 File upload | PASS for disabled behavior | UI has no upload field and API rejects incoming files. |
| Q19 Mobile / keyboard / assistive technology | PARTIAL | Labels, error associations, status announcements and focus management implemented; representative device/screen-reader QA not performed. |
| Q20 Incoming CTAs | PASS in source review / production pending | Home, Services and About point to quote/contact destinations; production click-through remains. |
| Q21 Staging / production SEO | PARTIAL | Indexing and canonical tags are gated; no production deployment or external crawler check was performed. |
| Q22 Contact details | PASS for safe default / management pending | Contact email/phone are hidden by default; full office addresses are not rendered. Approval toggle is off by default. |

## File map

- Page content, route metadata and CTAs: `src/app/(frontend)/contact/page.tsx`, `src/app/(frontend)/contact-us/page.tsx`, `src/app/(frontend)/get-a-quote/page.tsx`.
- Form UI and server validation/persistence: `src/components/forms/ContactForm.tsx`, `src/components/forms/QuoteForm.tsx`, `src/lib/validation/quote.ts`, `src/app/(frontend)/api/enquiry/route.ts`, `src/app/(frontend)/api/quote/route.ts`.
- Private CMS schema and safe contact/notification/indexing gates: `src/payload/collections/enterprise.ts`, `src/payload/globals/SiteSettings.ts`, `src/payload.config.ts`, `src/components/navigation/Footer.tsx`, `src/app/(frontend)/layout.tsx`, `src/lib/quote-email.ts`, `.env.example`.
- Route and service links: `src/config/redirects.ts`, `src/config/navigation.ts`, `src/config/service-design.ts`, `src/app/(frontend)/page.tsx`, `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`, related assistant/service components and home seed.
- Database change: `src/payload/migrations/20261013_165500_contact_quote_forms.ts`; applied to the local database and recorded as migration batch 9.
- Automated coverage: `tests/int/enquiry-route.int.spec.ts`, `tests/int/contact-form.int.spec.tsx`, `tests/int/quote-route.int.spec.ts`, `tests/int/quote-form.int.spec.tsx`, `tests/int/quote-email.int.spec.ts`, `tests/int/api.int.spec.ts`, `tests/int/services.int.spec.ts`.

## Quote upload update

The user's explicit request to add quote-form uploads supersedes the earlier disabled-upload implementation above. The Project step now accepts optional PDF, DOCX and TXT attachments (up to three files, 1 MB each). Files are validated on the server, saved through existing private storage, and recorded on the quote request. Existing authenticated download access remains in place. Failed persistence removes newly stored attachments; duplicate submissions do not store files again. Review shows the selected filenames. Eighteen focused tests and mobile selection/removal/accessibility checks passed. Notification recipient and production release settings remain governed by their existing configuration.
