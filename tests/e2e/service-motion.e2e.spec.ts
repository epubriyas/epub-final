import { test, expect } from '@playwright/test'

test('major sections have distinct motion and entry runs only once', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/typesetting-services')
  const sections = [
    ['hero', 'h1', 'sp-hero-type'],
    ['capabilities', '.sp-capability-list > li', 'sp-editorial-row'],
    ['diagram', '.sp-route-ink', 'sp-route-trace'],
    ['process', '.sp-step-number', 'sp-stage-number'],
    ['related', '.sp-related-grid > a', 'sp-related-deck'],
    ['cta', 'h2', 'sp-cta-focus'],
  ]
  const starts: string[] = []
  await page.exposeFunction('recordMotionStart', (name: string) => starts.push(name))
  await page.evaluate(() => {
    document.querySelector('.sp-page')!.addEventListener('animationstart', (event) => {
      const record = (window as unknown as { recordMotionStart: (name: string) => void })
        .recordMotionStart
      record((event as AnimationEvent).animationName)
    })
  })
  for (const [variant, selector, animation] of sections) {
    const section = page.locator(`[data-motion="${variant}"]`)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toHaveAttribute('data-motion-state', 'run')
    expect(
      await section
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe(animation)
  }
  expect(new Set(sections.map((section) => section[2])).size).toBe(sections.length)
  await page.waitForTimeout(1800)
  const before = starts.filter((name) => name.startsWith('sp-'))
  await page.locator('.sp-hero').scrollIntoViewIfNeeded()
  await page.locator('.sp-capabilities').scrollIntoViewIfNeeded()
  await page.locator('.sp-cta').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  expect(starts.filter((name) => name.startsWith('sp-'))).toEqual(before)
})

test('transformation stories differ by service and finish with a complete connector', async ({
  page,
}) => {
  test.setTimeout(60000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const stories = [
    ['typesetting', '.sp-transform-publication > div', 'sp-column-align'],
    ['scielo-xml-markup', 'code', 'sp-schema-check'],
    ['ebook-creation', '.sp-transform-output', 'sp-edition-turn'],
    ['translation', '.sp-transform-output ul', 'sp-language-resolve'],
    ['copyediting', 'ins', 'sp-revision-mark'],
    ['data-conversion', '.sp-transform-output', 'sp-format-boundary'],
    ['transcription', '.sp-transform-lines', 'sp-audio-rhythm'],
    ['elearning-localization', '.sp-transform-output', 'sp-module-order'],
    ['cover-page-design', '.sp-transform-publication', 'sp-palette-assemble'],
    ['indexing', 'dl > div', 'sp-index-marker'],
  ]
  for (const [slug, selector, name] of stories) {
    await page.goto(`/services/${slug}`)
    const diagram = page.locator('[data-motion="diagram"]')
    await diagram.scrollIntoViewIfNeeded()
    await expect(diagram).toHaveAttribute('data-motion-state', 'run')
    expect(
      await diagram
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe(name)
    await expect
      .poll(async () =>
        diagram.locator('.sp-route-ink').evaluate((el) => getComputedStyle(el).strokeDashoffset),
      )
      .toBe('0px')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  expect(errors).toEqual([])
})

test('following a related service initializes its own animation sequence', async ({ page }) => {
  await page.goto('/typesetting-services')
  await expect(page.locator('[data-motion="hero"]')).toHaveAttribute('data-motion-state', 'run')
  const related = page.locator('.sp-related-grid > a').first()
  const href = await related.getAttribute('href')
  await related.click()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await expect(page.locator('[data-motion="hero"]')).toHaveAttribute('data-motion-state', 'run')
  await page.locator('[data-motion="diagram"]').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-motion="diagram"]')).toHaveAttribute('data-motion-state', 'run')
})

test('reduced motion and no JavaScript preserve final content; preference changes stop motion', async ({
  page,
  browser,
}) => {
  await page.goto('/typesetting-services')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('[data-motion="hero"]')).toHaveAttribute('data-motion-state', 'static')
  for (const variant of ['hero', 'capabilities', 'diagram', 'process', 'related', 'cta']) {
    const section = page.locator(`[data-motion="${variant}"]`)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toHaveAttribute('data-motion-state', 'static')
    expect(
      await section.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === 'running').length,
      ),
    ).toBe(0)
  }
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: page.url() })
  const staticPage = await context.newPage()
  await staticPage.goto('/typesetting-services')
  await expect(staticPage.locator('h1')).toBeVisible()
  await expect(staticPage.locator('.sp-route-ink')).toBeVisible()
  expect(await staticPage.locator('h1').evaluate((el) => getComputedStyle(el).clipPath)).toBe(
    'none',
  )
  expect(await staticPage.locator('[data-motion-state]').count()).toBe(0)
  await context.close()
})

test('optional CMS FAQ keeps native keyboard expansion with CSS height enhancement', async ({
  page,
}) => {
  await page.goto('/typesetting-services')
  await expect(page.locator('[data-motion="hero"]')).toHaveAttribute('data-motion-state', 'run')
  // Published fixtures currently have no FAQs; mount the same native markup without changing CMS data.
  await page.locator('.sp-page').evaluate((main) => {
    const section = document.createElement('section')
    section.className = 'sp-faq'
    section.innerHTML =
      '<details><summary>Fixture question<span aria-hidden="true">+</span></summary><p>Fixture answer with enough content to check reserved expansion behavior.</p></details>'
    main.append(section)
  })
  const summary = page.locator('.sp-faq summary')
  const details = page.locator('.sp-faq details')
  await summary.focus()
  await summary.press('Enter')
  await expect(details).toHaveAttribute('open', '')
  await expect(details.locator('p')).toBeVisible()
  await summary.press('Space')
  await expect(details).not.toHaveAttribute('open')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await summary.press('Enter')
  await expect(details.locator('p')).toBeVisible()
  expect(
    await details.evaluate((el) => getComputedStyle(el, '::details-content').transitionDuration),
  ).toBe('0s')
})
