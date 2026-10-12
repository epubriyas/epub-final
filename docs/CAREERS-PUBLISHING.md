# Publishing career openings

The Careers page is `/company/careers`. Each published opening has its own page at `/company/careers/<slug>`. The existing Careers collection and records are preserved.

## Manager workflow

1. Sign in at `/admin`, open **Content → Careers**, and choose **Create New**.
2. Enter the role title and a unique URL slug, such as `production-editor`.
3. Add a short role summary, location, employment type and application email. The application email defaults to the site contact email when left empty.
4. Write **Role details** with headings and lists for responsibilities, skills and application requirements. Insert an **Infographic** block for steps, key figures or comparison cards. Enter two to six items; only add figures supported by a source.
5. Optionally add **Role highlights & requirements**. These appear as readable points below the full details.
6. Keep **Status** as **draft** and **Save** to store a private opening. Use **Preview** to review the role page while signed in.
7. Set **Status** to **published** and click **Save**. The opening appears immediately on the running site's Careers page and its individual role page.
8. To close an opening, set **Status** back to **draft** and **Save**. Its public role page returns 404 and its card is removed.

Published-role edits become visible when saved. Careers uses the existing status workflow; it does not provide separate revision drafts for already published openings.

## What candidates see

- A concise opening card with the manager's summary, location and employment type.
- A dedicated page with full details, requirements and a facts panel.
- An **Apply by email** link with the role title in the subject. Applications use the candidate's email app; the site does not store CVs or submissions.
- An honest empty state when no openings are published. No jobs, salaries, benefits or hiring timelines are fabricated.

## Deployment and verification

Deploy the application update once. Subsequent role publication requires no rebuild. This change reuses existing database fields and stores infographic content in the existing rich-text JSON, so no database migration is needed.

Run `node --import tsx/esm scripts/verify-careers-publishing.ts` with the local development site on port 3000. It creates a temporary editor and role, publishes through the admin's Status and Save controls, verifies the public pages, infographics, application links and draft privacy, and removes the fixtures. It refuses remote database connections.
