import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const widths = [375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1600, 1920, 2560]
test('responsive homepage and editorial routes render without overflow', async ({ page }) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await mkdir('artifacts/v2/screens', { recursive: true })
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 })
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Your content.')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy()
    if ([375, 768, 1024, 1440, 1920].includes(width))
      await page.screenshot({ path: `artifacts/v2/screens/home-${width}.png`, fullPage: true })
  }
  for (const route of [
    '/services',
    '/copyediting-services',
    '/solutions',
    '/solutions/digital-publishing',
    '/industries',
    '/technology',
    '/resources',
    '/about-us',
    '/company',
    '/company/careers',
    '/work',
    '/contact-us',
    '/get-a-quote',
  ]) {
    const response = await page.goto(route)
    expect(response?.status(), route).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.title()).not.toContain('Payload Website Template')
  }
  await page.goto('/accessibility-services')
  await expect(page.locator('h1')).toContainText('Accessibility Services')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  expect(
    await page.locator('.et-reveal').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  expect(errors).toEqual([])
})

test('About page publishes the required canonical metadata and preserves the company alias', async ({
  page,
}) => {
  const response = await page.goto('/about-us')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveTitle('About EPUBTRANS | Digital Publishing & Content Production')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.epubtrans.com/about-us',
  )
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About EPUBTRANS')
  await expect(page.getByRole('link', { name: 'Explore Publishing Services' })).toHaveAttribute(
    'href',
    '/typesetting-services',
  )
  await expect(
    page.getByRole('link', { name: 'Explore Localization Production Services' }),
  ).toHaveAttribute('href', '/desktop-publishing-services')
  await expect(page.locator('main')).toHaveCount(1)

  const aliasResponse = await page.goto('/company')
  expect(aliasResponse?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About EPUBTRANS')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.epubtrans.com/about-us',
  )
})

test('contact form validates and confirms only accepted general enquiries', async ({ page }) => {
  await page.goto('/contact-us')
  await expect(page).toHaveTitle('Contact EPUBTRANS | Publishing & Content Services')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact EPUBTRANS')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  let attempts = 0
  await page.route('**/api/enquiry', async (route) => {
    attempts++
    await route.fulfill(
      attempts === 1
        ? { status: 503, json: { error: "We couldn't submit your enquiry. Please try again." } }
        : { status: 201, json: { enquiryId: 'CONTACT-FLOW-TEST' } },
    )
  })
  await page.getByRole('button', { name: 'Send Enquiry' }).click()
  await expect(page.getByText('Please check the highlighted fields.')).toBeVisible()
  await page.getByLabel('Your Name *').fill('EPUBTRANS Automated QA')
  await page.getByLabel('Business Email *').fill('qa@epubtrans.example.invalid')
  await page.getByLabel('Enquiry Type *').selectOption('general')
  await page.getByLabel('Your Message *').fill('This is a synthetic test enquiry.')
  await page.getByRole('button', { name: 'Send Enquiry' }).click()
  await expect(page.getByText("We couldn't submit your enquiry. Please try again.")).toBeVisible()
  await expect(page.getByLabel('Your Message *')).toHaveValue('This is a synthetic test enquiry.')
  await page.getByRole('button', { name: 'Send Enquiry' }).click()
  await expect(page.getByText('Thank you for contacting EPUBTRANS.')).toBeVisible()
  await expect(page.getByText(/Your enquiry has been submitted/)).toBeVisible()
})

test('quote flow validates, preserves details and confirms only successful server acceptance', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/get-a-quote')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Please check the highlighted fields.')).toBeVisible()
  await page.getByLabel('Service Required *').selectOption('publishing_editorial')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Please check the highlighted fields.')).toBeVisible()
  await page
    .getByLabel('Project Description *')
    .fill(
      'This is an automated QA request for a sample publishing project. No real business request.',
    )
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Full Name *').fill('EPUBTRANS Automated QA')
  await page.getByLabel('Business Email *').fill('bad-address')
  await page.getByLabel('Company / Organization *').fill('Synthetic QA')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await page.getByLabel('Business Email *').fill('qa@epubtrans.example.invalid')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Review your project enquiry.' })).toBeVisible()
  await expect(page.locator('#files')).toHaveCount(0)
  let attempts = 0
  await page.route('**/api/quote', async (route) => {
    attempts++
    await route.fulfill(
      attempts === 1
        ? { status: 503, json: { error: "We couldn't submit your enquiry. Please try again." } }
        : { status: 201, json: { reference: 'QUOTE-FLOW-TEST', notification: 'unavailable' } },
    )
  })
  await page.getByRole('button', { name: 'Submit Project Enquiry', exact: true }).click()
  await expect(page.getByText("We couldn't submit your enquiry. Please try again.")).toBeVisible()
  await expect(page.getByLabel('Project Description *')).toHaveCount(0)
  await expect(page.getByText('Review your project enquiry.')).toBeVisible()
  await page.getByRole('button', { name: 'Submit Project Enquiry', exact: true }).click()
  await expect(page.getByText('Your project enquiry has been submitted.')).toBeVisible()
})
test('public collection writes and quote reads are denied; origins and upload signatures are enforced', async ({
  request,
}) => {
  const reads = await request.get('/api/quote-requests')
  expect(reads.status()).toBe(403)
  for (const collection of [
    'services',
    'solutions',
    'industries',
    'technologies',
    'quote-requests',
    'enquiries',
  ]) {
    const response = await request.post(`/api/${collection}`, {
      data: { title: 'Unauthenticated change' },
    })
    expect([401, 403]).toContain(response.status())
  }
  const invalidOrigin = await request.post('/api/quote', {
    headers: { Origin: 'https://untrusted.example' },
    multipart: { service: 'Publishing & content' },
  })
  expect(invalidOrigin.status()).toBe(403)
  const invalid = await request.post('/api/quote', {
    headers: { Origin: 'http://localhost:3001' },
    multipart: {
      service_required: 'publishing_editorial',
      full_name: 'QA test',
      business_email: 'qa@example.invalid',
      organization: 'QA test',
      project_description: 'An automated project with sufficient details for validation.',
      submission_key: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      files: { name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') },
    },
  })
  expect(invalid.status()).toBe(422)
  const draft = await request.get('/api/services?where[slug][equals]=accessibility')
  expect((await draft.json()).totalDocs).toBe(0)
})
