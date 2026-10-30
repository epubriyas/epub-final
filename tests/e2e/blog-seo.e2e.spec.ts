import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.beforeAll(async () => {
  if (!['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL!).hostname)) {
    throw new Error('Blog SEO fixture tests require a local test database')
  }
  await seedTestUser()
})
test.afterAll(async () => cleanupTestUser())

test('published articles render semantic SEO, navigation and responsive images', async ({
  page,
  request,
}) => {
  test.setTimeout(180000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect((await request.post('/api/users/login', { data: testUser })).ok()).toBe(true)
  const headers = {
    Origin: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').origin,
  }
  const cleanup: { collection: string; id: number }[] = []
  const docs: { title: string; slug: string }[] = []
  try {
    const token = randomUUID()
    const imageResponse = await request.post('/api/media', {
      headers,
      multipart: {
        _payload: JSON.stringify({ alt: 'Laptop, notebook and coffee on a wooden desk' }),
        file: {
          name: `blog-seo-${token}.jpg`,
          mimeType: 'image/jpeg',
          buffer: await readFile('public/images/insights/editorial.jpg'),
        },
      },
    })
    expect(imageResponse.status()).toBe(201)
    const image = (await imageResponse.json()).doc
    cleanup.unshift({ collection: 'media', id: image.id })
    const categoryResponse = await request.post('/api/categories', {
      headers,
      data: { title: 'SEO test category', slug: `seo-test-${token}` },
    })
    expect(categoryResponse.status()).toBe(201)
    const category = (await categoryResponse.json()).doc
    cleanup.unshift({ collection: 'categories', id: category.id })
    const text = (value: string) => ({
      type: 'text',
      text: value,
      format: 0,
      detail: 0,
      mode: 'normal',
      style: '',
      version: 1,
    })
    const paragraph = (children: unknown[]) => ({
      type: 'paragraph',
      children,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    })
    const link = (label: string, url: string, seoClassification = 'auto') => ({
      type: 'link',
      version: 3,
      fields: { linkType: 'custom', url, seoClassification },
      children: [text(label)],
    })
    for (let index = 0; index < 2; index++) {
      const response = await request.post('/api/posts', {
        headers,
        data: {
          title: `SEO verification article ${index}`,
          slug: `seo-verification-${token}-${index}`,
          _status: 'published',
          publishedAt: `2026-10-${28 + index}T00:00:00Z`,
          heroImage: image.id,
          categories: [category.id],
          meta: {
            description: `Distinct technical SEO verification description for article ${index}.`,
            image: image.id,
          },
          content: {
            root: {
              type: 'root',
              version: 1,
              direction: null,
              format: '',
              indent: 0,
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  version: 1,
                  children: [text('Article overview')],
                  direction: null,
                  format: '',
                  indent: 0,
                },
                paragraph([
                  text(
                    'A complete publishing workflow with safe contextual resources. '.repeat(20),
                  ),
                ]),
                paragraph([
                  link('Internal editorial link', '/services'),
                  text(' '),
                  link('Trusted reference', 'https://www.w3.org/', 'trusted'),
                  text(' '),
                  link('Affiliate recommendation', 'https://amazon.com/item?tag=publisher-20'),
                  text(' '),
                  link('Manual sponsorship', 'https://reference.example/', 'sponsored'),
                ]),
                {
                  type: 'heading',
                  tag: 'h3',
                  version: 1,
                  children: [text('Production details')],
                  direction: null,
                  format: '',
                  indent: 0,
                },
                paragraph([text('Accessible publishing and production details. '.repeat(20))]),
              ],
            },
          },
        },
      })
      expect(response.status(), await response.text()).toBe(201)
      const article = (await response.json()).doc
      cleanup.unshift({ collection: 'posts', id: article.id })
      docs.push(article)
    }
    const canonicals = new Set<string>()
    const titles = new Set<string>()
    const descriptions = new Set<string>()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const article of docs) {
      await page.goto(`/blog/${encodeURIComponent(article.slug)}`)
      await expect(page.locator('main')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('article > header h1')).toHaveText(article.title)
      await expect(
        page.getByRole('link', { name: 'Internal editorial link', exact: true }),
      ).not.toHaveAttribute('rel')
      await expect(
        page.getByRole('link', { name: 'Trusted reference', exact: true }),
      ).toHaveAttribute('rel', 'noopener')
      await expect(
        page.getByRole('link', { name: 'Trusted reference', exact: true }),
      ).toHaveAttribute('target', '_blank')
      await expect(
        page.getByRole('link', { name: 'Affiliate recommendation', exact: true }),
      ).toHaveAttribute('rel', 'sponsored nofollow')
      await expect(
        page.getByRole('link', { name: 'Manual sponsorship', exact: true }),
      ).toHaveAttribute('rel', 'sponsored nofollow')
      await expect(
        page.getByRole('navigation', { name: 'Adjacent articles', exact: true }),
      ).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Breadcrumb', exact: true })).toBeVisible()
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toContain(`/blog/${encodeURIComponent(article.slug)}`)
      canonicals.add(canonical!)
      titles.add(await page.title())
      descriptions.add((await page.locator('meta[name="description"]').getAttribute('content'))!)
      const schema = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) =>
          nodes
            .map((node) => JSON.parse(node.textContent || '{}'))
            .find((value) => value['@type'] === 'BlogPosting'),
        )
      expect(schema.headline).toBe(article.title)
      expect(schema.mainEntityOfPage['@id']).toBe(canonical)
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await expect(page.locator('h1')).toBeVisible()
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `overflow at ${width}`,
        ).toBe(true)
        if (article === docs[0])
          await page.screenshot({ path: `artifacts/blog-seo-${width}.png`, fullPage: true })
        const toc = page.getByRole('navigation', { name: 'On this page', exact: true })
        if (await toc.count()) {
          await expect(toc).toBeVisible()
          for (const link of await toc.locator('a').all()) {
            const hash = await link.getAttribute('href')
            await expect(page.locator(hash!)).toHaveCount(1)
          }
        }
      }
      const images = await page.locator('article img').evaluateAll((nodes) =>
        nodes.map((node) => ({
          alt: node.getAttribute('alt'),
          width: node.getAttribute('width'),
          height: node.getAttribute('height'),
        })),
      )
      expect(images.length).toBeGreaterThan(0)
      for (const image of images) {
        expect(image.alt?.trim()).toBeTruthy()
        expect(Number(image.width)).toBeGreaterThan(0)
        expect(Number(image.height)).toBeGreaterThan(0)
      }
      await expect(
        page.getByRole('navigation', { name: 'Share article', exact: true }),
      ).toBeVisible()
      await page.screenshot({
        path: `artifacts/blog-seo-${article.slug.slice(-1)}-desktop.png`,
        fullPage: true,
      })
    }
    expect(canonicals.size).toBe(docs.length)
    expect(titles.size).toBe(docs.length)
    expect(descriptions.size).toBe(docs.length)
    expect(errors).toEqual([])
    for (const route of ['/', '/blog', '/services', '/contact'])
      expect((await request.get(route)).ok()).toBe(true)
  } finally {
    for (const item of cleanup)
      expect((await request.delete(`/api/${item.collection}/${item.id}`, { headers })).ok()).toBe(
        true,
      )
  }
})
