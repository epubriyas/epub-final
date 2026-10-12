import 'dotenv/config'
import { getPayload } from 'payload'
import { mkdir, writeFile } from 'node:fs/promises'
import config from '../src/payload.config'
import { servicePaths } from '../src/config/service-paths'
const payload = await getPayload({ config })
try {
  if (process.argv.includes('--publish-proofreading')) {
    if (!['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL!).hostname))
      throw new Error('Local publication only.')
    const doc = (
      await payload.find({
        collection: 'services',
        where: { slug: { equals: 'proofreading' } },
        depth: 0,
        limit: 1,
      })
    ).docs[0]
    if (doc && doc.status === 'draft') {
      await mkdir('.local-backups', { recursive: true })
      await writeFile(
        `.local-backups/proofreading-before-publication-${Date.now()}.json`,
        JSON.stringify(doc, null, 2),
      )
      await payload.update({ collection: 'services', id: doc.id, data: { status: 'published' } })
      console.log('Existing Proofreading copy published locally; original record backed up.')
    }
  }
  const docs = (
    await payload.find({
      collection: 'services',
      overrideAccess: false,
      pagination: false,
      depth: 0,
    })
  ).docs
  const records = Object.entries(servicePaths).map(([slug, path]) => {
    const doc = docs.find((doc) => doc.slug === slug)
    return {
      id: doc?.id ?? null,
      title: doc?.title ?? slug,
      cmsSlug: slug,
      path,
      localhost: `http://localhost:3000${path}`,
      production: `https://www.epubtrans.com${path}`,
      status: doc?.status ?? 'missing',
    }
  })
  await mkdir('artifacts/routes', { recursive: true })
  await writeFile('artifacts/routes/service-url-records.json', JSON.stringify(records, null, 2))
  const rows = records
    .map(
      (doc) =>
        `| ${doc.title} | ${doc.id} | ${doc.cmsSlug} | [${doc.path}](${doc.localhost}) | ${doc.status} |`,
    )
    .join('\n')
  await writeFile(
    'docs/URL-STRUCTURE.md',
    `# EPUBTRANS page paths\n\nThe base URL is http://localhost:3000 during development and https://www.epubtrans.com after deployment. No production site changes were made.\n\n## Service records\n\nThese V1 paths render directly and are canonical. The corresponding /services/<cms-slug> routes permanently redirect to them. CMS slugs and IDs are unchanged.\n\n| Service | CMS ID | CMS slug | Canonical path (localhost) | Local status |\n|---|---|---|---|---|\n${rows}\n\n## Main pages\n\n| Page | Path |\n|---|---|\n| Home | / |\n| What We Do | /services |\n| Solutions | /solutions |\n| Solution detail | /solutions/<slug> |\n| Industries | /industries |\n| Industry detail | /industries/<slug> |\n| Technology | /technology |\n| Technology guide | /technology/<topic> |\n| Resources | /resources |\n| Blog | /blog |\n| Blog article | /blog/<slug> |\n| About EPUBTRANS | /company |\n| Global Presence | /company/global-presence |\n| Careers | /company/careers |\n| Career opening | /company/careers/<slug> |\n| Portfolio | /work |\n| Portfolio detail | /work/<slug> |\n| Contact | /contact |\n| Request a Quote | /get-a-quote |\n| Website accessibility statement | /accessibility |\n| Privacy policy | /privacy-policy |\n| Terms | /terms |\n| Payload admin | /admin |\n\n## Redirects and language paths\n\n- The 15 former /services/<slug> paths redirect in one hop to the V1 service paths, preserving query strings and language prefixes.\n- /industry-insights redirects to /blog.\n- /resources/<article-slug> redirects to /blog/<article-slug>.\n- /about-us redirects to /company; /careers redirects to /company/careers; /portfolio redirects to /work.\n- Non-English pages retain the same structure after their locale prefix, such as /ta/translation-services. /en paths normalize to the unprefixed English page.\n- The website accessibility statement /accessibility and the commercial service /accessibility-services remain distinct pages.\n- Dynamic detail pages show published CMS records only. Unknown service paths do not receive invented pages.\n\nThe machine-readable record is artifacts/routes/service-url-records.json. Deploy the routing update and publish the intended service records in the deployment's Payload database to use these paths on the live site.\n`,
  )
  if (records.some((doc) => doc.status !== 'published'))
    throw new Error('Some requested service records are not published; see the generated record.')
  console.log('Recorded all 15 published service IDs, slugs and local/production paths.')
} finally {
  await payload.destroy()
}
process.exit(0)
