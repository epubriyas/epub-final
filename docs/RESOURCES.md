# Resources menu and publishing

No new collections are introduced. The existing Posts, Categories, Media,
Case Studies and Resources collections remain the sources of content.

| Menu item | Route | Content source |
| --- | --- | --- |
| Blog | `/blog` | All published Posts |
| Industry Insights | `/industry-insights` | Published Posts with the Industry Insights category |
| Publishing | `/work?category=publishing` | Case Studies, category Publishing |
| Localization | `/work?category=localization` | Case Studies, category Localization |
| eLearning | `/work?category=elearning` | Case Studies, category eLearning |
| Accessibility | `/work?category=accessibility` | Case Studies, category Accessibility |
| Guides & eBooks | `/resources?type=guides-ebooks` | Resources, type Guide or eBook |
| Whitepapers & Reports | `/resources?type=whitepapers-reports` | Resources, type Whitepaper or Report |

Article URLs remain `/resources/<slug>`. Existing `/posts` redirects, resources
search, category filtering, project checklists, `/work` and `/work/<slug>` remain.
Technology stays in its separate navigation item.

## Publishing an article

1. Open Payload Admin → Posts and create or edit an article.
2. Add a title, slug, rich-text content and optional images from Media.
3. For Industry Insights, select the category with slug `industry-insights`.
   The migration creates this category only if it is missing. Articles can use
   other existing Categories as well; Blog shows every published article.
4. Save a draft and use Preview or Live Preview while logged in to Payload.
   Anonymous visitors cannot read drafts.
5. Publish the article. It appears automatically in Blog, the Resources hub,
   and Industry Insights if categorized there, without editing source code.

## Case studies and downloads

In Case Studies, choose the Category, set Status to Published, and confirm
permission to publish the client information. Unapproved case studies stay
private. In Resources, choose Type, attach a file from Media if applicable, and
set Status to Published. Existing entries without a classification still appear
on the original hub pages; assign their category or type to include them in a
filtered submenu listing. No existing content is automatically reclassified.

## Deployment

Run `npm run payload -- migrate` before starting the updated application on each
deployment database. The additive migration adds indexed Case Studies category
and Resources type fields. It preserves existing records and Media schema.
Post previews reuse the existing authenticated preview endpoint and require a
configured `PREVIEW_SECRET` and an active Payload Admin session.

Cases and downloadable Resources retain their existing status-based publishing;
they do not gain Posts' version history or draft/live-preview features.

## Files changed for this upgrade

- Navigation: `src/config/navigation.ts`, `src/components/navigation/Header.client.tsx`, `src/styles/enterprise.css`.
- Classification: `src/config/resource-content.ts`, `src/payload/collections/enterprise.ts`, `src/payload-types.ts`.
- Article publishing: `src/payload/collections/Posts/index.ts`, `src/payload/collections/Posts/hooks/revalidatePost.ts`, `src/payload/plugins/index.ts`.
- Listings: `src/components/resources/ArticleListing.tsx`, `src/app/(frontend)/blog/page.tsx`, `src/app/(frontend)/industry-insights/page.tsx`, `src/app/(frontend)/resources/page.tsx`, `src/app/(frontend)/work/page.tsx`.
- Discovery and language copy: `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`, `src/lib/i18n/ta.json`, `src/lib/i18n/public-ui-texts.json`.
- Migration: `src/payload/migrations/20261009_075405_resources_navigation.ts`, its `.json` schema snapshot, and `src/payload/migrations/index.ts`.
- Verification and documentation: `tests/e2e/resources.e2e.spec.ts`, `artifacts/resources/menu-desktop.png`, `docs/RESOURCES.md`.
