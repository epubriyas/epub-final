// @vitest-environment jsdom
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { EnterpriseBlock } from '@/components/editorial/EnterpriseBlock'
import type { Page, Post } from '@/payload-types'

vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/components/RichText', () => ({ default: () => <p>CMS content</p> }))
vi.mock('@/components/Media', () => ({ Media: () => <span>Approved logo</span> }))

type Block = Page['layout'][number]
const render = (block: Block) => renderToStaticMarkup(<EnterpriseBlock block={block} />)

describe('CMS sections with publishable content', () => {
  it('omits empty lists and logo walls without approved populated media', () => {
    const blocks: Block[] = [
      { blockType: 'faq', title: 'FAQ', items: [] },
      { blockType: 'timeline', title: 'Timeline', items: [] },
      { blockType: 'serviceExplorer', title: 'Services', services: [42] },
      { blockType: 'solutionGrid', title: 'Solutions', solutions: [] },
      { blockType: 'fullWidthMedia', media: 42 },
      {
        blockType: 'logoWall',
        title: 'Clients',
        logos: [{ name: 'Unresolved', media: 42, permissionConfirmed: true }],
      },
    ]
    for (const block of blocks) expect(render(block)).toBe('')
  })

  it('links published articles to the blog route and withholds drafts', () => {
    const article: Post = {
      id: 1,
      title: 'Published article',
      slug: 'published-article',
      _status: 'published',
      createdAt: '',
      updatedAt: '',
      content: {
        root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
      },
    }
    const html = render({
      blockType: 'insights',
      title: 'Articles',
      posts: [article, { ...article, id: 2, title: 'Draft article', _status: 'draft' }],
    })
    expect(html).toContain('href="/blog/published-article"')
    expect(html).not.toContain('Draft article')
    expect(
      render({
        blockType: 'insights',
        title: 'Articles',
        posts: [{ ...article, _status: 'draft' }],
      }),
    ).toBe('')
  })

  it('preserves useful FAQ content', () => {
    const html = render({
      blockType: 'faq',
      title: 'FAQ',
      items: [{ question: 'Which files?', answer: 'Supply the source files.' }],
    })
    expect(html).toContain('<summary>Which files?</summary>')
    expect(html).toContain('Supply the source files.')
  })
})
