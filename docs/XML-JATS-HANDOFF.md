# XML and JATS service handoff

Implemented from `EPUBTRANS_XML-JATS_Conversion.docx`, draft v1.0, 13 October 2026. Only section E is public-facing website copy. Research, strategy and the operational approval register remain outside the page.

## Presentation and content

- Reuses `ServiceDetail`, `ServiceHero`, `ServiceHandoffContent`, `ServiceMotion` and the existing service design tokens. No layout, typography, color or animation stylesheet was changed.
- The 272 nonempty source paragraphs in section E are represented in the handoff: hero, 13 sections and 12 FAQs. Metadata comes from section D.
- The five source workflow stages render as four numbered steps through the existing shared renderer. Step four retains quality review, validation, issue handling and delivery-package content; the delivery heading remains visible within it.
- SciELO-specific certification is distinguished from general JATS conversion. Supported schemas, versions, file types, MathML, transformations, validation, repository work and corrections remain conditional.
- Validation is not a promise of repository eligibility or acceptance. DOI registration, metadata deposit and repository submission are not automatically included. No secure-upload claim is added.
- Main CTA is `/get-a-quote`; secondary and final contact CTAs use `/contact-us`. No `service=xml-jats` preselection is enabled.
- Publishing Services remains described without a link because `/publishing-services` is not deployed.

## Route decision and local CMS

Canonical local route: `/xml-conversion-services`. CMS identifier: `xml-jats`. The existing routing layer redirects `/services/xml-jats` permanently to that route. `/xml-jats-services` is not created. Sitemap and breadcrumb output use the canonical route.

Read-only local inventory found no XML/JATS service record, no page occupying either candidate route and no conflicting XML redirects. Creation was restricted to the local PostgreSQL host. A new published-status record was created for local rendering; the idempotent setup script preserves any existing record. This does not deploy or publish to an external website.

After the destination passed content and browser checks, the existing directory entry, navbar item and SciELO related-service link were connected to it. The directory's CMS JSON was backed up before changing only the existing XML/JATS entry's destination. No new service card or category was introduced; existing card labels and other content remain intact. The SciELO page's copy is unchanged.

## Verification and release conditions

- `verify-service-handoffs.mjs xml-jats` passed: 272 copy fragments, eight destinations, widths 1440/390/320, metadata, one H1, runtime-error checks and automated accessibility.
- Production build, TypeScript and targeted ESLint passed. Service-route unit tests passed, including all 16 canonical paths.
- Browser coverage verifies four workflow steps, delivery copy, 12 FAQs, safe CTAs, canonical metadata, permanent redirect, alternate-route 404, sitemap uniqueness and incoming links.
- [NLM's JATS documentation](https://jats.nlm.nih.gov/) identifies JATS 1.4 as the current published standard; the copy does not infer EPUBTRANS supports every version.
- The live [SciELO provider directory](https://www.scielo.org/en/about-scielo/partnerships/companies-certified-for-xml-article-tagging-services/) contains an EPUBTRANS listing for the specific XML-tagging scope.

The web lookup could not inspect the candidate URLs. Direct HTTP verification subsequently confirmed both live candidates return 404 and the production sitemap returns 200. The preferred route therefore introduces no currently served competing XML/JATS page. Search Console is unavailable in this session; historical indexing and URL ownership remain predeployment checks. Management approval, operational capability confirmation and production form/file-transfer arrangements remain the document's release checks. No competing XML/JATS page, indexing page, production redirect change or external publication was performed.

Local setup: `node --import=tsx scripts/create-xml-jats-page.ts`. After verification, `--connect` updates the existing local directory entry. Both operations refuse non-local databases; backups are stored in `.local-backups`.
