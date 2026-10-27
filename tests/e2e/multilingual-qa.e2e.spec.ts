import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('all eleven picker choices retain the page, query and fragment with honest fallback and focus', async ({
  page,
}) => {
  test.setTimeout(180000)
  await page.route('**/api/translate', (route) =>
    route.fulfill({ status: 503, json: { error: 'Test outage' } }),
  )
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/typesetting-services?source=language-qa#process')
  for (const [name, code] of [
    ['Hindi', 'hi'],
    ['Tamil', 'ta'],
    ['Telugu', 'te'],
    ['Bengali', 'bn'],
    ['French', 'fr'],
    ['Spanish', 'es'],
    ['German', 'de'],
    ['Arabic', 'ar'],
    ['Chinese (Simplified)', 'zh-CN'],
    ['Japanese', 'ja'],
    ['English, default language', 'en'],
  ]) {
    const trigger = page.getByRole('button', { name: 'Choose website language', exact: true })
    await trigger.click()
    const panel = page.locator('#language-options')
    await expect(panel.getByRole('button')).toHaveCount(11)
    await panel.getByRole('button', { name, exact: true }).click()
    const destination = `${code === 'en' ? '' : '/' + code}/typesetting-services?source=language-qa#process`
    await expect(page).toHaveURL(new URL(destination, page.url()).href)
    await expect(trigger).toBeFocused()
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    if (code !== 'en') await expect(page.locator('.et-translation-status')).toContainText('English')
  }
  await expect(page.locator('.et-translation-status')).toHaveCount(0)
})

test('direct locale URLs, English preferences, reload and browser history remain predictable', async ({
  page,
  context,
  request,
  baseURL,
}) => {
  await page.route('**/api/translate', (route) =>
    route.fulfill({ status: 503, json: { error: 'Test outage' } }),
  )
  await page.goto('/fr/get-a-quote?service=ebook_xml#main-content')
  const englishURL = new URL('/get-a-quote?service=ebook_xml#main-content', page.url()).href
  const frenchURL = new URL('/fr/get-a-quote?service=ebook_xml#main-content', page.url()).href
  await expect(page.locator('input[value="ebook_xml"]')).toBeChecked()
  await page.reload()
  await expect(page).toHaveURL(frenchURL)
  const english = page
    .locator('.et-translation-status')
    .getByRole('link', { name: 'English', exact: true })
  await expect(english).toHaveAttribute('href', '/get-a-quote?service=ebook_xml#main-content')
  await english.click()
  await expect(page).toHaveURL(englishURL)
  expect(new URL(page.url()).pathname).toBe('/get-a-quote')
  await page.goBack()
  await expect(page).toHaveURL(frenchURL)
  await page.goForward()
  await expect(page).toHaveURL(englishURL)
  expect(new URL(page.url()).pathname).toBe('/get-a-quote')
  await context.addCookies([{ name: 'epubtrans-language', value: 'fr', url: baseURL! }])
  const response = await request.get('/', {
    maxRedirects: 0,
    headers: { cookie: 'epubtrans-language=fr' },
  })
  expect(response.status()).toBe(200)
  const direct = await context.newPage()
  await direct.route('**/api/translate', (route) => route.fulfill({ status: 503, json: {} }))
  await direct.goto('/ar/data-conversion-services#pdf-recreation')
  await expect(direct.locator('#pdf-recreation')).toBeInViewport()
  await expect(direct.locator('a[href="/ar/desktop-publishing-services"]').first()).toHaveCount(1)
  await direct.close()
})

test('desktop keyboard and mobile dialog expose current selection and restore focus', async ({
  page,
}) => {
  test.setTimeout(120000)
  await mkdir('artifacts/multilingual', { recursive: true })
  await page.route('**/api/translate', (route) => route.fulfill({ status: 503, json: {} }))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/services')
  const trigger = page.getByRole('button', { name: 'Choose website language', exact: true })
  await expect(trigger).toHaveCount(1)
  await trigger.focus()
  await trigger.press('ArrowDown')
  await expect(page.locator('#language-options button[aria-pressed="true"]')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await page.setViewportSize({ width: 375, height: 900 })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Choose website language' })
  await expect(dialog.getByRole('button', { name: 'English, default language' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await dialog.getByRole('button', { name: 'French', exact: true }).click()
  await expect(page).toHaveURL(/\/fr\/services$/)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAccessibleDescription('Current selection: French')
  await trigger.click()
  const axe = await new AxeBuilder({ page })
    .include('.et-mobile-language-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  await writeFile('artifacts/multilingual/picker-axe.json', JSON.stringify(axe.violations, null, 2))
  expect(axe.violations).toEqual([])
  await page.screenshot({ path: 'artifacts/multilingual/picker-375.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('Arabic reading-preview mechanics preserve form values, RTL layout and both submission contracts', async ({
  page,
}) => {
  test.setTimeout(180000)
  const sent: string[] = []
  await page.route('**/api/translate', async (route) => {
    const { texts } = route.request().postDataJSON()
    sent.push(...texts)
    // Deliberate test fixtures for direction/layout only, not approved Arabic copy.
    await route.fulfill({
      json: {
        translations: Object.fromEntries(texts.map((text: string) => [text, 'اختبار ' + text])),
      },
    })
  })
  await page.route('**/api/enquiry', (route) =>
    route.fulfill({ status: 201, json: { enquiryId: 'MULTILINGUAL-QA' } }),
  )
  await page.route('**/api/quote', (route) =>
    route.fulfill({
      status: 201,
      json: { reference: 'MULTILINGUAL-QA', notification: 'unavailable' },
    }),
  )
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ar/contact-us')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await page.locator('#contact-email').fill('qa@epubtrans.example.invalid')
    await expect(page.locator('#contact-email')).toHaveAttribute('dir', 'ltr')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `artifacts/multilingual/arabic-fixture-${width}.png` })
  }
  await page.locator('#contact-name').fill('Multilingual QA')
  await page.locator('#contact-inquiry-type').selectOption('general')
  await page.locator('#contact-message').fill('Private synthetic multilingual test message.')
  await page.locator('.et-enquiry-form button[type="submit"]').click()
  await expect(page.locator('.et-enquiry-success')).toBeVisible()
  await page.goto('/ar/get-a-quote?service=ebook_xml')
  await expect(page.locator('input[value="ebook_xml"]')).toBeChecked()
  await page.locator('.et-quote-panel button[type="submit"]').click()
  await page.locator('#quote-details').fill('Private synthetic multilingual quote requirements.')
  await page.locator('.et-quote-panel button[type="submit"]').click()
  await page.locator('#quote-name').fill('Multilingual QA')
  await page.locator('#quote-email').fill('qa@epubtrans.example.invalid')
  await page.locator('#quote-company').fill('Synthetic QA')
  await page.locator('.et-quote-panel button[type="submit"]').click()
  await expect(page.locator('[data-private]').first()).toBeVisible()
  await page.locator('.et-quote-panel button[type="submit"]').click()
  await expect(page.locator('.et-quote-success')).toBeVisible()
  expect(sent.join(' ')).not.toContain('qa@epubtrans.example.invalid')
  expect(sent.join(' ')).not.toContain('Private synthetic')
})
