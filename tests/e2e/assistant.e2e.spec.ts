import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test.beforeEach(async ({ page }) => {
  await page.route('**/api/assistant', async (route) => {
    const { messages } = route.request().postDataJSON()
    const last = messages[messages.length - 1].content.toLowerCase()
    const text = /quote|cost/.test(last)
      ? 'The scope and volume determine pricing. [Prepare a project enquiry](/get-a-quote)'
      : 'We can help localize your brochure. Which languages do you need? [Translation & localization](/translation-services)'
    await route.fulfill({
      contentType: 'application/x-ndjson',
      body:
        JSON.stringify({ type: 'delta', text }) + '\n' + JSON.stringify({ type: 'done' }) + '\n',
    })
  })
})
test('assistant supports conversation, reset, keyboard dismissal and service handoff', async ({
  page,
}) => {
  await page.goto('/resources')
  const launcher = page.getByRole('button', { name: 'Open EPUBTRANS assistant' })
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'How can we help?' })
  await expect(dialog).toBeVisible()
  await page.getByLabel('Your message', { exact: true }).fill('I need to translate a brochure')
  await page.getByLabel('Your message', { exact: true }).press('Shift+Enter')
  await page
    .getByLabel('Your message', { exact: true })
    .pressSequentially('The audience is in France.')
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'I need to translate a brochure\nThe audience is in France.',
  )
  await expect(dialog.locator('.et-assistant-message-user')).toHaveCount(0)
  await page.getByLabel('Your message', { exact: true }).press('Enter')
  await expect(dialog.getByRole('link', { name: 'Translation & localization' })).toHaveAttribute(
    'href',
    '/translation-services',
  )
  await page.getByLabel('Your message', { exact: true }).fill('How much will it cost?')
  const followUp = page.waitForRequest('**/api/assistant')
  await page.getByRole('button', { name: 'Send message' }).click()
  expect(
    (await followUp).postDataJSON().messages.map((message: { role: string }) => message.role),
  ).toEqual(['user', 'assistant', 'user'])
  await expect(dialog.getByRole('link', { name: 'Prepare a project enquiry' })).toBeVisible()
  await expect(dialog.locator('.et-assistant-reply-brand')).toHaveCount(3)
  await dialog.screenshot({ path: 'artifacts/v2/screens/assistant-branded-conversation.png' })
  await page.getByRole('button', { name: 'Start a new conversation' }).click()
  await expect(dialog.getByRole('button', { name: 'Explore our services' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(launcher).toBeFocused()
  await launcher.click()
  await dialog.getByRole('button', { name: 'Request a quote' }).click()
  await dialog.getByRole('link', { name: 'Prepare a project enquiry' }).click()
  await expect(page).toHaveURL(/\/get-a-quote$/)
  await expect(dialog).not.toBeVisible()
})
test('assistant retries an unavailable reply without duplicating the visitor message', async ({
  page,
}) => {
  let attempts = 0
  await page.route('**/api/assistant', async (route) => {
    attempts++
    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Please try again.' }),
      })
      return
    }
    expect(route.request().postDataJSON().messages).toEqual([
      { role: 'user', content: 'Can you explain localization?' },
    ])
    await route.fulfill({
      contentType: 'application/x-ndjson',
      body:
        JSON.stringify({
          type: 'delta',
          text: 'Localization adapts content for a specific audience.',
        }) +
        '\n' +
        JSON.stringify({ type: 'done' }) +
        '\n',
    })
  })
  await page.goto('/resources')
  await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).click()
  await page.getByLabel('Your message', { exact: true }).fill('Can you explain localization?')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Please try again.')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('log')).toContainText('Localization adapts content')
  await expect(
    page.getByRole('log').getByText('Can you explain localization?', { exact: true }),
  ).toHaveCount(1)
  await expect(page.getByRole('dialog').getByRole('alert')).toHaveCount(0)
})
test('stopping before a reply clears the writing state', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/assistant', async (route) => {
    await gate
    await route
      .fulfill({ contentType: 'application/x-ndjson', body: '{"type":"done"}\n' })
      .catch(() => {})
  })
  await page.goto('/resources')
  await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).click()
  await page.getByLabel('Your message', { exact: true }).fill('Help with a brochure')
  await page.getByRole('button', { name: 'Send message' }).click()
  try {
    await expect(page.getByText('Writing a reply…')).toBeVisible()
    await page.getByRole('button', { name: 'Stop reply' }).click()
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible()
    await expect(page.getByText('Writing a reply…')).toHaveCount(0)
  } finally {
    release()
  }
})
test('assistant fits small screens and meets accessibility checks', async ({ page }) => {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/resources')
    await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).screenshot({
      path: `artifacts/v2/screens/assistant-ai-launcher-${width}.png`,
      animations: 'disabled',
    })
    await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByLabel('Your message', { exact: true })).toBeVisible()
    await expect
      .poll(async () =>
        Math.round(
          (await dialog.getByRole('button', { name: 'Send message' }).boundingBox())?.width || 0,
        ),
      )
      .toBe(44)
    await expect
      .poll(async () =>
        Math.round(
          (await dialog.getByRole('button', { name: 'Send message' }).boundingBox())?.height || 0,
        ),
      )
      .toBe(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const panel = await dialog.boundingBox()
    expect(panel!.x).toBeGreaterThanOrEqual(0)
    expect(panel!.y).toBeGreaterThanOrEqual(0)
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(width)
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(height)
    if (width <= 600) {
      expect(
        await dialog
          .getByLabel('Your message', { exact: true })
          .evaluate((element) => getComputedStyle(element).fontSize),
      ).toBe('16px')
    }
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([])
    await dialog.screenshot({ path: `artifacts/v2/screens/assistant-${width}.png` })
    await page.getByRole('button', { name: 'Close assistant' }).click()
  }
})
test('mobile composer stays visible when the visual viewport shrinks for a keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/resources')
  await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).click()
  const dialog = page.getByRole('dialog')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.evaluate(() => {
    const viewport = window.visualViewport!
    Object.defineProperty(viewport, 'height', { configurable: true, value: 320 })
    Object.defineProperty(viewport, 'offsetTop', { configurable: true, value: 12 })
    viewport.dispatchEvent(new Event('resize'))
  })
  await expect(dialog).toHaveAttribute('data-compact', 'true')
  const composer = dialog.getByLabel('Your message', { exact: true })
  await composer.fill('A project enquiry\nFrench translation\nTwelve pages')
  await expect
    .poll(async () => {
      const panel = await dialog.boundingBox()
      const field = await composer.boundingBox()
      const send = await dialog.getByRole('button', { name: 'Send message' }).boundingBox()
      return (
        !!panel &&
        !!field &&
        !!send &&
        panel.y >= 12 &&
        panel.y + panel.height <= 332 &&
        field.y + field.height <= 332 &&
        send.y + send.height <= 332
      )
    })
    .toBe(true)
  expect(
    await dialog.locator('.et-assistant-conversation').evaluate((element) => element.clientHeight),
  ).toBeGreaterThan(50)
  await dialog.screenshot({ path: 'artifacts/v2/screens/assistant-mobile-keyboard.png' })
  await page.evaluate(() => {
    const viewport = window.visualViewport!
    Reflect.deleteProperty(viewport, 'height')
    Reflect.deleteProperty(viewport, 'offsetTop')
    viewport.dispatchEvent(new Event('resize'))
  })
  await expect(dialog).toHaveAttribute('data-compact', 'false')
  await page.getByRole('button', { name: 'Close assistant' }).click()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})
