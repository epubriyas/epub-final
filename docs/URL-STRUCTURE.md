# EPUBTRANS page paths

The base URL is http://localhost:3000 during development and https://www.epubtrans.com after deployment. No production site changes were made.

## Service records

These V1 paths render directly and are canonical. The corresponding /services/<cms-slug> routes permanently redirect to them. CMS slugs and IDs are unchanged.

| Service | CMS ID | CMS slug | Canonical path (localhost) | Local status |
|---|---|---|---|---|
| Translation Services | 14 | translation | [/translation-services](http://localhost:3000/translation-services) | published |
| Desktop Publishing Services | 5 | desktop-publishing | [/desktop-publishing-services](http://localhost:3000/desktop-publishing-services) | published |
| Copyediting Services | 1 | copyediting | [/copyediting-services](http://localhost:3000/copyediting-services) | published |
| Typesetting Services | 15 | typesetting | [/typesetting-services](http://localhost:3000/typesetting-services) | published |
| Cover Page Design Services | 3 | cover-page-design | [/cover-page-design-services](http://localhost:3000/cover-page-design-services) | published |
| SciELO XML Markup Services | 11 | scielo-xml-markup | [/scielo-xml-markup-services](http://localhost:3000/scielo-xml-markup-services) | published |
| Proofreading Services | 10 | proofreading | [/proofreading-services](http://localhost:3000/proofreading-services) | published |
| eBook Creation Services | 6 | ebook-creation | [/ebook-creation-services](http://localhost:3000/ebook-creation-services) | published |
| Graphic Design and Image Services | 8 | graphic-design-image-services | [/graphic-design-image-services](http://localhost:3000/graphic-design-image-services) | published |
| Data Conversion Services | 4 | data-conversion | [/data-conversion-services](http://localhost:3000/data-conversion-services) | published |
| Subtitling Services | 12 | subtitling | [/subtitling-services](http://localhost:3000/subtitling-services) | published |
| Voiceover Services | 16 | voiceover | [/voiceover-services](http://localhost:3000/voiceover-services) | published |
| Transcription Services | 13 | transcription | [/transcription-services](http://localhost:3000/transcription-services) | published |
| e-Learning Localization Services | 7 | elearning-localization | [/elearning-localization-services](http://localhost:3000/elearning-localization-services) | published |
| Accessibility Services | 2 | accessibility | [/accessibility-services](http://localhost:3000/accessibility-services) | published |

## Main pages

| Page | Path |
|---|---|
| Home | / |
| What We Do | /services |
| Solutions | /solutions |
| Solution detail | /solutions/<slug> |
| Industries | /industries |
| Industry detail | /industries/<slug> |
| Technology | /technology |
| Technology guide | /technology/<topic> |
| Resources | /resources |
| Blog | /blog |
| Blog article | /blog/<slug> |
| About EPUBTRANS | /company |
| Global Presence | /company/global-presence |
| Careers | /company/careers |
| Career opening | /company/careers/<slug> |
| Portfolio | /work |
| Portfolio detail | /work/<slug> |
| Contact | /contact |
| Request a Quote | /get-a-quote |
| Website accessibility statement | /accessibility |
| Privacy policy | /privacy-policy |
| Terms | /terms |
| Payload admin | /admin |

## Redirects and language paths

- The 15 former /services/<slug> paths redirect in one hop to the V1 service paths, preserving query strings and language prefixes.
- /industry-insights redirects to /blog.
- /resources/<article-slug> redirects to /blog/<article-slug>.
- /about-us redirects to /company; /careers redirects to /company/careers; /portfolio redirects to /work.
- Non-English pages retain the same structure after their locale prefix, such as /ta/translation-services. /en paths normalize to the unprefixed English page.
- The website accessibility statement /accessibility and the commercial service /accessibility-services remain distinct pages.
- Dynamic detail pages show published CMS records only. Unknown service paths do not receive invented pages.

The machine-readable record is artifacts/routes/service-url-records.json. Deploy the routing update and publish the intended service records in the deployment's Payload database to use these paths on the live site.
