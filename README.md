# EPUBTRANS V2

An editorial publishing and localization website using Next.js, React, TypeScript, Payload CMS and PostgreSQL.

## Project structure

```text
src/
├── app/             Website routes, API routes and CMS admin routes
├── blocks/          Reusable CMS content blocks and their renderers
├── components/      UI grouped by purpose: navigation, forms, heroes, search, etc.
├── config/          Navigation, languages, contact details and site settings
├── lib/             Content queries, assistant logic, translation, SEO and validation
├── payload/         CMS collections, globals, fields, hooks, access and migrations
├── providers/       Theme and shared React providers
├── styles/          Global CSS, design tokens, responsive rules and themes
├── types/           Shared application types
├── utilities/       Reusable helpers and React hooks
├── payload.config.ts    CMS entry point
├── payload-types.ts     Generated CMS types
└── proxy.ts             Next.js request handling
```

See the [folder guide](docs/PROJECT-STRUCTURE.md) for where to add new files.

## Local development

Use Node 22 and npm. Copy `.env.example` to `.env` and configure a PostgreSQL connection, a strong Payload secret and the local server URL. Keep secrets out of Git.

```sh
npm ci
npm run payload -- migrate
npm run dev -- --port 3001
```

The existing development database already has the baseline and additive enterprise migration applied. Do not seed or re-adopt it. The legacy template seed route is disabled.

When moving to another laptop, the source code alone does not include PostgreSQL content or uploaded files. For a new empty local database, run the migrations above, then `node scripts/restore-local-content.mjs` to restore editorial content from the deployed database configured in `.vercel/.env.production.local`. The script only writes to localhost, refuses to replace existing content, backs up local editorial rows, and excludes user accounts, enquiries, quote requests, and submissions. It restores missing publicly accessible media files; transfer unpublished preview files separately. Keep environment files and backups private. For a completely new local installation, create your own administrator at `/admin`.

## Checks

```sh
npm run typecheck
npm run lint
npm run test:int
npm run test:e2e
npm run build
```

Browser tests use the installed Microsoft Edge channel on this Windows machine. For Linux CI install a Playwright browser and adjust the channel in playwright.config.ts. End-to-end tests need a disposable development database; they create a uniquely identified admin and synthetic quote fixtures. Remove synthetic enquiries with `node --import tsx/esm scripts/cleanup-qa.ts` after testing.

## Editing and deployment

Content editors use `/admin`. A published `home` Page replaces the curated homepage through the block composer. Services, solutions and industries retain the existing content; additional collections support technology, resources, careers and permission-approved case studies. Site Settings controls contact information. Quote submissions are stored privately without email notifications.

See [build audit](docs/BUILD-AUDIT.md), [phase tracker](docs/PHASES.md), [validation and remaining work](docs/VALIDATION.md), and [manual VPS deployment](docs/DEPLOYMENT.md).

Use package-lock.json and npm for this implementation.

Generated screenshots and audit output (`artifacts/`), temporary document extracts (`tmp/`), test reports, local uploads, database backups and environment secrets are excluded from Git. Keep `.env.example` and `deployment/.env.production.example` as setup templates. Source code, CMS migrations, public website assets and tests belong in the repository.
