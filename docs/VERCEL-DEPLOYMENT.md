# Vercel deployment

V2 is deployed at https://epubtrans-v2.vercel.app. Payload admin is https://epubtrans-v2.vercel.app/admin. The existing www.epubtrans.com domain was not reassigned.

- Project: `epubtrans-v2` in `riyascodexxs-projects`.
- Database: managed Neon, resource `epubtrans-v2-db`, Free plan, Singapore region.
- File storage: private Vercel Blob store `epubtrans-v2-files`, Singapore region.
- Existing local database records were transferred to a new empty cloud database. Database archives are stored only in ignored `.local-backups`.
- All 260 original media, generated portfolio preview and attachment objects were transferred without missing files.
- The original local environment remains in `.env`. Cloud environment files live only in ignored `.vercel`; they must not be committed or uploaded as artifacts.

## File access

The custom Payload cloud adapter keeps Blob objects private. Payload's collection/file access checks run before media and preview streams are returned. Public Media remains readable through its Payload endpoint; unpublished or unapproved portfolio previews retain the existing access checks. Quote attachments require an authenticated administrator and an attachment belonging to the requested quote.

Cloud deployments use Blob for new uploads and private attachments. Local development uses existing filesystem directories when no Blob token is configured. Translation cache uses `/tmp` on Vercel and can be rebuilt.

The additive `20261012_054530_vercel_private_storage` migration adds storage prefixes and object keys to Media and PortfolioPreviews. It was applied before copying the database; the migration history was transferred with the records.

## Future releases

### Blog publishing and origin checks

Local Payload and deployed Payload use separate databases and storage unless explicitly configured otherwise. A GitHub push deploys application code; it does not transfer local articles or uploaded files. Publish production articles through the deployed `/admin` and upload their images there. Do not copy local database records over the populated production database.

Set `NEXT_PUBLIC_SERVER_URL` in Vercel to the actual public HTTPS site origin. Verify `DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN` and, for assistant replies, `GEMINI_API_KEY` in the Production environment. Redeploy after environment changes. Keep the Blob store and database connected across deployments.

The assistant, translation, enquiry and quote endpoints share exact-origin validation. They accept same-origin requests and the exact production, deployment and branch URLs supplied by Vercel. Unrelated Vercel domains remain rejected. Payload CORS uses these exact configured origins too.

After deploying, check `/blog`, open a published article, load its `/api/media/file/...` URL, and send an assistant message. A missing provider key returns a configuration error; it should no longer be reported as an origin error.

Authenticate and verify the linked project with the Vercel CLI. Build a staged production deployment with `vercel deploy --prod --skip-domain`, verify it, then promote that exact deployment. Do not run the initial database transfer script against the populated cloud database. It refuses a non-empty destination.

Do not run local content-import scripts against production. Managers can publish blog articles, career openings and service edits through the deployed Payload admin. Existing admin accounts were preserved in the transfer.

The `.vercelignore` excludes environment files, authentication state, database backups, private original documents, local uploads and QA artifacts. Vercel secrets were supplied through standard input and are not stored in source code.

Initial provisioning scripts reference this machine's PostgreSQL tools and CLI cache. They are one-time migration helpers, not release build steps. The live application requires the connected database, Blob token and Payload secret in its Vercel environment.
