# Publishing the EPUBTRANS blog

The **Blog** collection in Payload uses the existing `posts` records. Existing articles and versions are preserved. The public listing is `/blog` and articles use `/blog/<slug>`.

## Manager workflow

1. Sign in at `/admin` with an existing editor account.
2. Open **Blog**, then **Create New**.
3. Enter the title and article content. The slug field creates the URL; check it before publishing.
4. Optionally upload a cover image, select categories and authors, and choose related posts. Add image alternative text in **Media**.
5. In the content editor, insert an **Infographic** block. Choose connected steps, statistics or comparison cards. Enter a title and two to six items; add an explanatory note or source for figures. Infographics are editable content, not baked-in images.
6. Use the **SEO** tab to add a short description and search/social metadata. The description also serves as the article summary; otherwise the site derives a summary from the article.
7. Keep the article as a draft while editing; autosave is enabled. **Preview** opens the article for authenticated editors; anonymous visitors cannot access drafts.
8. Click **Publish** or **Publish changes**, depending on the editor state. The article appears on the blog immediately on the running deployment, including in search and its assigned topics. Unpublishing or deleting removes it from public queries.

Saving a new draft of an already published article preserves the published version until the editor publishes the revision. A public listing never reads preview drafts.

## Implementation and deployment

- The collection is labeled **Blog** in the admin; its API identifier remains `posts`.
- Rich text stores infographic blocks in the existing JSON content field, so this update adds no database columns and needs no database migration.
- Deploy the updated application code once before managers use the new infographic block. Subsequent article publication requires no code change or rebuild.
- The existing Media collection handles uploaded cover and article images. Preserve its storage between deployments.
- Publication hooks refresh the blog, article routes, Resources and post sitemap. Public routes query published records only; authenticated preview uses Payload access checks.
- Previous `/resources/<slug>` article URLs redirect to `/blog/<slug>`. The old `/posts/<slug>` path continues through that redirect.
- Infographic entrance animations respect reduced-motion preferences and content remains readable without JavaScript.

## Verification

Run `node --import tsx/esm scripts/verify-blog-publishing.ts` against the local database with the development site running at port 3000. It creates a temporary editor and draft, edits and publishes through Payload's admin UI, verifies public rendering and draft isolation, and removes its fixtures. It refuses remote database connections.
