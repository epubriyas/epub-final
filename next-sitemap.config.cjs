const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
// eslint-disable-next-line @typescript-eslint/no-require-imports -- next-sitemap loads this CommonJS configuration.
const { siteCanBeIndexed } = require('./src/lib/site-indexing.cjs')
const indexable = siteCanBeIndexed(SITE_URL, process.env.VERCEL_ENV)
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: indexable
          ? ['/admin', '/api', '/next', '/search', '/privacy-policy', '/terms']
          : ['/'],
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
