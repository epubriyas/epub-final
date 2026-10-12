import { test, expect } from '@playwright/test'

test('service menu uses the Company presentation and keeps every service reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByRole('button', { name: 'What We Do', exact: true }).click()
  const menu = page.locator('.et-mega-services')
  await expect(menu.getByRole('link', { name: 'Explore our services', exact: true })).toBeVisible()
  await expect(menu.getByRole('heading')).toHaveText([
    'Language & localization',
    'Publishing & content',
    'Media',
    'Learning',
    'Accessibility',
  ])
  await expect(menu.getByRole('link')).toHaveCount(16)
  await expect(menu.locator('.et-mega-group-description')).toHaveCount(5)
  await menu.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  )
  await page.screenshot({ path: 'artifacts/v2/screens/services-menu-desktop.png' })
  await menu.getByRole('link', { name: 'Copyediting', exact: true }).click()
  await expect(page).toHaveURL(/\/copyediting-services$/)
  await expect(page.locator('main h1')).toBeVisible()
})

test('company menu presents three columns and navigates to company content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Company', exact: true })
  await trigger.focus()
  await trigger.press('ArrowDown')
  const menu = page.locator('.et-mega-company')
  await expect(menu.getByRole('link', { name: 'Discover EPUBTRANS' })).toBeFocused()
  await expect(menu.getByRole('heading')).toHaveText([
    'About EPUBTRANS',
    'Global Presence',
    'Careers',
  ])
  await expect(menu.getByRole('link')).toHaveCount(14)
  const columns = await menu
    .locator('.et-mega-groups > div')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top))
  expect(new Set(columns).size).toBe(1)
  await menu.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  )
  await page.screenshot({ path: 'artifacts/v2/screens/company-menu-desktop.png' })
  await menu.getByRole('link', { name: 'Our Story', exact: true }).click()
  await expect(page).toHaveURL(/\/company#our-story$/)
  await expect(page.locator('#our-story')).toBeInViewport()
  await expect(menu).toHaveCount(0)
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('mobile company groups lead to internship content without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Site navigation' })
  await dialog.getByRole('button', { name: 'Company', exact: true }).click()
  await expect(dialog.getByRole('link', { name: 'Discover EPUBTRANS' })).toBeVisible()
  await expect(dialog.locator('#mobile-5 summary')).toHaveText([
    'About EPUBTRANS',
    'Global Presence',
    'Careers',
  ])
  await dialog.locator('#mobile-5 summary').getByText('Careers', { exact: true }).click()
  await dialog
    .locator('#mobile-5')
    .evaluate((element) => element.scrollIntoView({ block: 'start' }))
  await page.screenshot({ path: 'artifacts/v2/screens/company-menu-mobile.png' })
  await dialog.getByRole('link', { name: 'Internships', exact: true }).click()
  await expect(page).toHaveURL(/\/company\/careers#internships$/)
  await expect(page.locator('#internships')).toBeInViewport()
  await expect(dialog).not.toBeVisible()
  expect(await page.locator('body').evaluate((el) => el.style.overflow)).toBe('')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('desktop menus open on hover, stay open over links and close after leaving', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const services = page.getByRole('button', { name: 'What We Do', exact: true })
  await services.hover()
  await expect(services).toHaveAttribute('aria-expanded', 'true')
  await page.locator('#mega-0 a').first().hover()
  await page.waitForTimeout(250)
  await expect(page.locator('#mega-0')).toBeVisible()
  const resources = page.getByRole('button', { name: 'Resources', exact: true })
  await resources.hover()
  await expect(resources).toHaveAttribute('aria-expanded', 'true')
  await expect(services).toHaveAttribute('aria-expanded', 'false')
  await page.mouse.move(5, 850)
  await expect(resources).toHaveAttribute('aria-expanded', 'false')
})

test('desktop disclosure supports keyboard, Escape and outside dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'What We Do', exact: true })
  await trigger.focus()
  await trigger.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#mega-0')).toBeVisible()
  await trigger.press('ArrowDown')
  await expect(page.locator('#mega-0 a').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(page.locator('#mega-0')).toHaveCount(0)
  await trigger.click()
  await page.mouse.click(10, 850)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})
test('mobile modal locks scroll, contains focus, reveals service categories and restores focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Open navigation' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Site navigation' })
  await expect(dialog).toBeVisible()
  expect(await page.locator('body').evaluate((el) => el.style.overflow)).toBe('hidden')
  await dialog.getByRole('button', { name: 'What We Do' }).click()
  await dialog.getByText('Publishing & content', { exact: true }).click()
  await expect(dialog.getByRole('link', { name: 'Copyediting', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  expect(await page.locator('body').evaluate((el) => el.style.overflow)).toBe('')
})
