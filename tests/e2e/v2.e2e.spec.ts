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
    '/company',
    '/company/careers',
    '/work',
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
test('quote flow validates, preserves details and saves only on successful server response', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/get-a-quote')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Choose the service you need.')).toBeVisible()
  await page.getByLabel('Publishing & content', { exact: true }).check()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Describe your project in 20–5,000 characters.')).toBeVisible()
  await page
    .getByLabel('Project requirements')
    .fill(
      'This is an automated QA request for a sample publishing project. No real business request.',
    )
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await page.getByLabel('Full name').fill('EPUBTRANS Automated QA')
  await page.getByLabel('Email address').fill('qa@epubtrans.example.invalid')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('No files', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByLabel('Full name')).toHaveValue('EPUBTRANS Automated QA')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Submit request', exact: true }).click()
  await expect(page.getByText('Please confirm we can use these details')).toBeVisible()
  let attempts = 0
  await page.route('**/api/quote', async (route) => {
    attempts++
    await route.fulfill(
      attempts === 1
        ? { status: 503, json: { error: 'Please try again.' } }
        : { status: 201, json: { reference: 'QUOTE-FLOW-TEST' } },
    )
  })
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Submit request', exact: true }).click()
  await expect(page.getByText('Please try again.', { exact: true })).toBeVisible()
  await expect(page.getByText('Your project request has been saved')).toHaveCount(0)
  await page.getByRole('button', { name: 'Submit request', exact: true }).click()
  await expect(page.getByText('Your project request has been saved')).toBeVisible()
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
      service: 'Publishing & content',
      name: 'QA test',
      email: 'qa@example.invalid',
      details: 'An automated project with sufficient details for validation.',
      consent: 'true',
      files: { name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') },
    },
  })
  expect(invalid.status()).toBe(422)
  const draft = await request.get('/api/services?where[slug][equals]=accessibility')
  expect((await draft.json()).totalDocs).toBe(0)
})
