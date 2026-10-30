import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { seoLink, type LinkPolicy } from '@/lib/seo/links'
import { sanitizeComment } from '@/lib/seo/comments'
import { articleMetadata, articleSchema } from '@/lib/seo/article'
import { prepareArticleContent } from '@/lib/seo/article-content'
import RichText from '@/components/RichText'
import { BlogCover } from '@/components/blog/BlogCover'
import type { Post, Media } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// The code block's admin icon imports Sass; isolate these tests from admin UI.
vi.mock('@/blocks/Code/Component', () => ({ CodeBlock: () => null }))

const policy: LinkPolicy = {
  primaryURL: 'https://example.com',
  affiliateRules: [
    { hostname: 'amazon.com', includeSubdomains: true, queryParameter: 'tag' },
    { hostname: 'hop.clickbank.net', includeSubdomains: true },
    { hostname: 'example.com', pathPrefix: '/go/' },
  ],
}
const content = (children: unknown[]) =>
  ({
    root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
  }) as DefaultTypedEditorState
const text = (value: string) => ({
  type: 'text',
  text: value,
  version: 1,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
})
const post = (slug: string, title: string): Post => ({
  id: 1,
  title,
  slug,
  content: content([
    { type: 'paragraph', children: [text(title + ' article description')], version: 1 },
  ]),
  updatedAt: '2026-10-29T00:00:00Z',
  createdAt: '2026-10-28T00:00:00Z',
  publishedAt: '2026-10-28T00:00:00Z',
  populatedAuthors: [{ name: 'Actual CMS Author' }],
})

describe('SEO link policy', () => {
  it.each([
    '/services',
    '../services',
    '#topic',
    '?page=2',
    'https://example.com/a',
    'https://www.example.com/a',
    '//example.com/a',
  ])('keeps internal URL %s clean and unchanged', (href) => {
    expect(seoLink(href, policy)).toEqual({ href })
  })
  it('preserves new-tab behavior with required security', () => {
    expect(seoLink('/services', policy, 'auto', true)).toEqual({
      href: '/services',
      target: '_blank',
      rel: 'noopener',
    })
  })
  it.each([
    'https://example.com.evil.test/',
    'https://evil-example.com/',
    'https://sub.example.com/',
  ])('never trusts similar domains %s', (href) => {
    expect(seoLink(href, policy, 'trusted')).toMatchObject({ target: '_blank', rel: 'noopener' })
  })
  it('trusts editorial links without adding commercial rel', () => {
    expect(seoLink('https://reference.test/', policy, 'trusted')).toEqual({
      href: 'https://reference.test/',
      target: '_blank',
      rel: 'noopener',
    })
  })
  it.each([
    'https://amazon.com/item?tag=publisher-20',
    'https://www.amazon.com/item?tag=publisher-20',
    'https://seller.hop.clickbank.net/',
    '/go/product',
  ])('detects configured affiliate %s', (href) => {
    expect(seoLink(href, policy).rel).toBe('sponsored nofollow')
  })
  it.each([
    'https://amazon.com/item',
    'https://reference.test/go/product',
    'https://notamazon.com/item?tag=publisher',
    'https://clickbank.example.net/',
  ])('avoids ambiguous commercial matches %s', (href) => {
    expect(seoLink(href, policy).rel).toBeUndefined()
  })
  it('prioritizes explicit metadata', () => {
    expect(seoLink('/go/product', policy, 'editorial').rel).toBeUndefined()
    expect(seoLink('https://reference.test/', policy, 'sponsored').rel).toBe('sponsored nofollow')
    expect(seoLink('https://amazon.com/item?tag=x', policy, 'trusted').rel).toBe('noopener')
  })
  it.each([
    'javascript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,test',
    'vbscript:test',
    'https://user:pass@example.com/',
    'file:///etc/passwd',
    '',
  ])('rejects unsafe URLs %s', (href) => {
    expect(seoLink(href, policy)).toEqual({})
  })
  it('processes existing rel and unsafe links during actual Lexical rendering', () => {
    const html = renderToStaticMarkup(
      <RichText
        data={content([
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'link',
                version: 3,
                fields: { url: '/services', rel: 'sponsored nofollow', linkType: 'custom' },
                children: [text('Internal')],
              },
              {
                type: 'link',
                version: 3,
                fields: { url: 'javascript:alert(1)', linkType: 'custom' },
                children: [text('Unsafe')],
              },
              {
                type: 'link',
                version: 3,
                fields: {
                  url: 'https://reference.test',
                  seoClassification: 'trusted',
                  linkType: 'custom',
                },
                children: [text('Trusted')],
              },
            ],
          },
        ])}
      />,
    )
    expect(html).toContain('<a href="/services">Internal</a>')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('target="_blank" rel="noopener"')
  })
})

describe('UGC sanitization', () => {
  it('replaces all supplied rel and removes untrusted attributes', () => {
    const html = sanitizeComment(
      '<p><a href="/internal" rel="sponsored" target="_blank" onclick="alert(1)" data-seo="trusted">Visit</a><a href="https://reference.test">External</a></p>',
    )
    expect(html.match(/rel="ugc nofollow"/g)).toHaveLength(2)
    expect(html).not.toMatch(/sponsored|target|onclick|data-seo/)
    expect(sanitizeComment(html)).toBe(html)
  })
  it.each([
    'javascript:alert(1)',
    'jav&#x61;script:alert(1)',
    'java&#10;script:alert(1)',
    'data:text/html,bad',
    '//evil.test',
  ])('removes unsafe comment URL %s', (href) => {
    expect(sanitizeComment(`<a href="${href}">safe text</a>`)).not.toContain('href=')
  })
  it('removes scripts, SVG, frames, styles, event handlers and forms but preserves formatting', () => {
    const html = sanitizeComment(
      '<script>alert(1)</script><svg onload="alert(1)"><a xlink:href="javascript:alert(1)">bad</a></svg><iframe srcdoc="bad"></iframe><form><input></form><p style="color:red" onmouseover="evil()"><strong>Safe</strong> &amp; sound<img src=x onerror=evil()></p>',
    )
    expect(html).not.toMatch(
      /script|svg|iframe|input|form|style=|onload|onerror|onmouseover|javascript/,
    )
    expect(html).toContain('<strong>Safe</strong> &amp; sound')
  })
})

describe('article SEO and server rendering', () => {
  it('keeps CMS SEO titles from repeating the publisher name', () => {
    const article = post('custom-title', 'Visible article title')
    article.meta = { title: 'Custom SEO title | EPUBTRANS' }
    expect(articleMetadata(article).title).toEqual({ absolute: 'Custom SEO title | EPUBTRANS' })
  })
  it('uses unique real article values and canonical encoding', () => {
    const a = articleMetadata(post('first article', 'First'))
    const b = articleMetadata(post('second', 'Second'))
    expect(a.title).not.toEqual(b.title)
    expect(a.description).not.toBe(b.description)
    expect(a.alternates?.canonical).not.toBe(b.alternates?.canonical)
    expect(a.alternates?.canonical).toMatch(/first%20article$/)
    expect(articleMetadata(post('draft', 'Draft'), true).robots).toEqual({
      index: false,
      follow: false,
    })
  })
  it('includes image, author, publisher, dates and main entity without invented values', () => {
    const article = post('article', 'Article')
    article.heroImage = {
      url: '/image.jpg',
      alt: 'Publishing desk',
      width: 1200,
      height: 800,
    } as Media
    const schema = articleSchema(article)
    expect(schema.author).toEqual([{ '@type': 'Person', name: 'Actual CMS Author' }])
    expect(schema.mainEntityOfPage['@id']).toBe(schema.url)
    expect(schema.image).toMatch(/image.jpg$/)
    expect(schema.datePublished).toBe(article.publishedAt)
    expect(articleMetadata(article).openGraph).toMatchObject({
      type: 'article',
      images: [{ alt: 'Publishing desk', width: 1200, height: 800 }],
    })
    delete article.populatedAuthors
    expect(articleSchema(article).author).toBeUndefined()
  })
  it('generates deterministic anchors, repairs heading jumps and preserves source content', () => {
    const original = content(
      ['h1', 'h4', 'h2', 'h3'].map((tag) => ({
        type: 'heading',
        tag,
        version: 1,
        children: [text('Heading')],
      })),
    )
    const prepared = prepareArticleContent(original)
    expect(prepared.sections.map((s) => s.level)).toEqual([2, 3, 2, 3])
    expect(new Set(prepared.sections.map((s) => s.id)).size).toBe(4)
    expect(original.root.children[0]).toMatchObject({ tag: 'h1' })
    const html = renderToStaticMarkup(<RichText data={prepared.data} />)
    expect(html).toContain('<h2 id="article-section-1">')
    expect(html).not.toContain('<h1')
  })
  it('supplies image alt fallback and dimensions when legacy media lacks alt', () => {
    const html = renderToStaticMarkup(
      <BlogCover
        image={{ url: '/image.jpg', width: 1200, height: 800 } as Media}
        alt="Article illustration subject"
        priority
      />,
    )
    expect(html).toContain('alt="Article illustration subject"')
    expect(html).toContain('width="1200"')
    expect(html).not.toContain('loading="lazy"')
  })
})
