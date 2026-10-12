import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
const records = JSON.parse(await readFile('artifacts/routes/service-url-records.json', 'utf8'))
const browser = await chromium.launch({ channel: 'msedge' })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const results = []
  for (const record of records) {
    const response = await page.goto(record.localhost, { waitUntil: 'domcontentloaded' })
    if (response.status() !== 200 || new URL(page.url()).pathname !== record.path)
      throw new Error(`${record.path}: direct route failed`)
    if ((await page.locator('main h1').count()) !== 1) throw new Error(`${record.path}: heading`)
    const canonical = await page.locator('link[rel=canonical]').getAttribute('href')
    if (canonical !== record.localhost) throw new Error(`${record.path}: canonical ${canonical}`)
    const old = await context.request.get(
      `http://localhost:3000/services/${record.cmsSlug}?ref=url-check`,
      { maxRedirects: 0 },
    )
    if (old.status() !== 301 || !old.headers().location.endsWith(`${record.path}?ref=url-check`))
      throw new Error(`${record.path}: redirect`)
    await page.setViewportSize({ width: 390, height: 900 })
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
      throw new Error(`${record.path}: mobile overflow`)
    await page.setViewportSize({ width: 1440, height: 900 })
    results.push({
      ...record,
      httpStatus: response.status(),
      canonical,
      oldRouteStatus: old.status(),
    })
  }
  await page.goto('http://localhost:3000/services')
  const links = await page
    .locator('.sp-catalog-link')
    .evaluateAll((items) => items.map((item) => item.getAttribute('href')))
  for (const record of records)
    if (!links.includes(record.path)) throw new Error(`Catalog missing ${record.path}`)
  await page.getByRole('button', { name: 'What We Do', exact: true }).click()
  const menuLinks = await page
    .locator('.et-mega-services a')
    .evaluateAll((items) => items.map((item) => item.getAttribute('href')))
  for (const record of records)
    if (!menuLinks.includes(record.path)) throw new Error(`Menu missing ${record.path}`)
  const sitemap = await (
    await context.request.get('http://localhost:3000/pages-sitemap.xml')
  ).text()
  for (const record of records)
    if (!sitemap.includes(record.localhost)) throw new Error(`Sitemap missing ${record.path}`)
  if (sitemap.includes('/services/translation'))
    throw new Error('Old canonical URL remains in sitemap')
  const languageRedirect = await context.request.get(
    'http://localhost:3000/ta/services/translation?ref=locale',
    { maxRedirects: 0 },
  )
  if (
    languageRedirect.status() !== 301 ||
    !languageRedirect.headers().location.endsWith('/ta/translation-services?ref=locale')
  )
    throw new Error('Language redirect')
  const missing = await context.request.get('http://localhost:3000/not-a-real-service-services')
  if (missing.status() !== 404) throw new Error('Unknown service should return 404')
  await writeFile(
    'artifacts/routes/service-url-verification.json',
    JSON.stringify(results, null, 2),
  )
  console.log(
    'PASS: all 15 direct V1 routes, canonical URLs, 301 redirects, query and locale preservation, menu/catalog/sitemap links and mobile overflow.',
  )
} finally {
  await browser.close()
}
