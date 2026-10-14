import { test, expect, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

async function expectContentToFit(page: Page, scope = '#main-content') {
  const metrics = await page.locator(scope).evaluate((root) => {
    const overflow = [...root.querySelectorAll('*')]
      .filter((element) => {
        if (!element.getClientRects().length || getComputedStyle(element).visibility === 'hidden')
          return false
        const box = element.getBoundingClientRect()
        if (box.left >= -1 && box.right <= innerWidth + 1) return false
        let parent = element.parentElement
        while (parent && parent !== root) {
          // Artwork and local scrollers can extend; the page must never mask content overflow.
          if (
            parent.tagName !== 'MAIN' &&
            ['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(parent).overflowX)
          )
            return false
          parent = parent.parentElement
        }
        return true
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName,
        class: element.getAttribute('class'),
        text: element.textContent?.slice(0, 60),
      }))
    return { width: document.documentElement.scrollWidth, viewport: innerWidth, overflow }
  })
  expect(metrics.width, `${page.url()} page width`).toBeLessThanOrEqual(metrics.viewport)
  expect(metrics.overflow, `${page.url()} clipped or overflowing content`).toEqual([])
}

test('all public pages fit phones, tablets and desktop without clipped content', async ({
  page,
}) => {
  test.setTimeout(240000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const routes = new Set([
    '/',
    '/services',
    '/solutions',
    '/industries',
    '/technology',
    '/resources',
    '/company',
    '/company/careers',
    '/work',
    '/contact-us',
    '/get-a-quote',
    '/search',
    '/terms',
    '/privacy-policy',
    '/accessibility',
  ])
  const widths = [320, 360, 390, 430, 600, 768, 820, 1024, 1280, 1440]
  await mkdir('artifacts/mobile', { recursive: true })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const route of routes) {
    const response = await page.goto(route)
    // Unpublished service links render the site's responsive not-found page.
    expect([200, 404], route).toContain(response?.status())
    await expect(page.locator('main h1')).toHaveCount(1)
    if (response?.status() === 404)
      await expect(page.locator('main h1')).toHaveText('This page is out of the edition.')
    const links = await page
      .locator('#main-content a[href]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
    for (const link of links) {
      if (link?.startsWith('/') && !link.startsWith('//') && !/^\/(api|admin|media)\//.test(link))
        routes.add(link.split(/[?#]/)[0])
    }
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await expectContentToFit(page)
      await expectContentToFit(page, '.et-header')
      await expectContentToFit(page, '.et-footer')
      if (width === 390 && ['/', '/get-a-quote', '/services', '/company'].includes(route)) {
        await page.screenshot({
          path: `artifacts/mobile/verified-${route === '/' ? 'home' : route.slice(1)}.png`,
        })
      }
    }
  }
  expect(errors).toEqual([])
  console.log(`Verified ${routes.size} public routes at ${widths.length} viewport widths.`)
})

test('mobile menus remain scrollable on narrow phones, tablets and landscape', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    const company = dialog.getByRole('button', { name: 'Company', exact: true })
    await company.click()
    const sectionId = await company.getAttribute('aria-controls')
    expect(sectionId).toBeTruthy()
    for (const summary of await dialog.locator(`[id="${sectionId}"] summary`).all())
      await summary.click()
    await expectContentToFit(page, '.et-mobile-dialog')
    const internships = dialog.getByRole('link', { name: 'Internships', exact: true })
    await internships.scrollIntoViewIfNeeded()
    expect((await internships.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await internships.click()
    await expect(page).toHaveURL(/\/company\/careers#internships$/)
    await expect(dialog).not.toBeVisible()
    expect(await page.locator('body').evaluate((element) => element.style.overflow)).toBe('')
    await page.getByRole('button', { name: 'Choose website language' }).click()
    const language = page.getByRole('dialog', { name: 'Choose website language' })
    await expectContentToFit(page, '.et-mobile-language-dialog')
    await language.getByRole('button', { name: 'French', exact: true }).scrollIntoViewIfNeeded()
    await expect(language.getByRole('button', { name: 'French', exact: true })).toBeInViewport()
    await language.getByRole('button', { name: 'Close language selection' }).click()
  }
})

test('crossing the desktop breakpoint closes menus and releases the scroll lock', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.getByRole('dialog', { name: 'Site navigation' })).not.toBeVisible()
  expect(await page.locator('body').evaluate((element) => element.style.overflow)).toBe('')
  await page.getByRole('button', { name: 'Company', exact: true }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.et-mega')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Choose website language' }).click()
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.getByRole('dialog', { name: 'Choose website language' })).not.toBeVisible()
  expect(await page.locator('body').evaluate((element) => element.style.overflow)).toBe('')
})

test('every quote step works on a small phone and preserves long details', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/get-a-quote')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Please check the highlighted fields.')).toBeVisible()
  await expectContentToFit(page)
  await page.getByLabel('Service Required *').selectOption('publishing_editorial')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.locator('.et-quote-progress li')).toHaveCount(4)
  await expect(page.locator('#files')).toHaveCount(0)
  expect(
    await page
      .getByLabel('Project Description *')
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThanOrEqual(16)
  const details =
    'A multilingual publishing project with accessible digital output. ' +
    'ManuscriptReference'.repeat(20)
  await page.getByLabel('Project Description *').fill(details)
  await page.getByLabel('Source File Format').fill('DOCX')
  await page.getByLabel('Required Output Format').fill('EPUB')
  await page.getByLabel('Approximate Volume (for example, page count)').fill('To be confirmed')
  await page.getByLabel('Source and Target Languages, if applicable').fill('English to Tamil')
  await page.getByLabel('Preferred Delivery Date').fill('2027-01-20')
  await page.getByLabel('Additional Information').fill('Mobile layout verification only.')
  await expectContentToFit(page)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Full Name *').fill('Mobile layout verification')
  await page.getByLabel('Business Email *').fill('mobile-layout-check@example.invalid')
  await page.getByLabel('Company / Organization *').fill('PublishingCompanyName'.repeat(8))
  await page.getByLabel('Country / Region').fill('India')
  await expectContentToFit(page)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectContentToFit(page)
  await page.getByRole('button', { name: 'Return to Project Requirements step' }).click()
  await expect(page.getByLabel('Project Description *')).toHaveValue(details)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectContentToFit(page)
  await page.route('**/api/quote', async (route) => {
    const request = route.request().postDataBuffer()?.toString() || ''
    expect(request).toContain(details)
    expect(request).toContain('Mobile layout verification only.')
    expect(request).toContain('mobile-layout-check@example.invalid')
    expect(request).toContain('service_required')
    await route.fulfill({ json: { reference: 'MOBILE-LAYOUT-TEST', notification: 'unavailable' } })
  })
  await page.getByRole('button', { name: 'Submit Project Enquiry', exact: true }).click()
  await expect(
    page.getByText('Your project enquiry has been submitted.', { exact: true }),
  ).toBeVisible()
  await expectContentToFit(page)
})
