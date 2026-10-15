import { test, expect } from '@playwright/test'

test('XML/JATS page preserves document scope, canonical routing and four workflow steps', async ({
  page,
  request,
}) => {
  await page.goto('/xml-conversion-services')
  await expect(page.locator('main h1')).toHaveText(
    'XML & JATS Conversion Services for Scholarly Publishers',
  )
  await expect(page.locator('.sp-timeline > li')).toHaveCount(4)
  await expect(page.locator('.sp-timeline')).toContainText('Prepare the Delivery Package')
  await expect(page.locator('.sp-faq details')).toHaveCount(12)
  await expect(
    page.locator('.sp-hero-actions').getByRole('link', { name: 'Request an XML Conversion Quote' }),
  ).toHaveAttribute('href', '/get-a-quote')
  await expect(
    page.locator('.sp-hero-actions').getByRole('link', { name: 'Discuss a Sample Article' }),
  ).toHaveAttribute('href', '/contact-us')
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
  expect(new URL(canonical!).pathname).toBe('/xml-conversion-services')
  await expect(page.locator('main')).toContainText(
    'Preparing XML does not guarantee that a journal is eligible for inclusion in a repository',
  )
  await expect(page.locator('main')).toContainText(
    'DOI registration, metadata deposit and repository submission are not automatically included',
  )
  await expect(page.locator('main a[href="/publishing-services"]')).toHaveCount(0)
  const legacy = await request.get('/services/xml-jats', { maxRedirects: 0 })
  expect(legacy.status()).toBe(301)
  expect(legacy.headers().location).toContain('/xml-conversion-services')
  const alternative = await request.get('/xml-jats-services')
  expect(alternative.status()).toBe(404)
  const sitemap = await request.get('/pages-sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect((await sitemap.text()).match(/<loc>[^<]*\/xml-conversion-services<\/loc>/g)).toHaveLength(
    1,
  )
})

test('tested XML/JATS destination is connected from directory, navbar and SciELO', async ({
  page,
}) => {
  await page.goto('/services')
  await expect(
    page
      .locator('.sp-catalog-link')
      .filter({ has: page.getByRole('heading', { name: 'XML & JATS Conversion', exact: true }) }),
  ).toHaveAttribute('href', '/xml-conversion-services')
  await page.getByRole('button', { name: 'What We Do', exact: true }).click()
  await page
    .locator('.et-mega-services')
    .getByRole('link', { name: 'XML & JATS Conversion', exact: true })
    .click()
  await expect(page).toHaveURL(/\/xml-conversion-services$/)
  await page.goto('/scielo-xml-markup-services')
  await expect(
    page.locator('.sp-related-grid').getByRole('link', { name: /XML & JATS Conversion Services/ }),
  ).toHaveAttribute('href', '/xml-conversion-services')
})
