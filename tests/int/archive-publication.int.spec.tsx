// @vitest-environment jsdom
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const { find } = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/components/CollectionArchive', () => ({
  CollectionArchive: ({ posts }: { posts: { title: string }[] }) => (
    <div>{posts.map((post) => post.title).join(',')}</div>
  ),
}))
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
beforeEach(() => find.mockReset())
describe('public CMS article archives', () => {
  it('enforces access and published state alongside category filters', async () => {
    find.mockResolvedValue({ docs: [] })
    await ArchiveBlock({ blockType: 'archive', populateBy: 'collection', categories: [3] })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        draft: false,
        where: { and: [{ _status: { equals: 'published' } }, { categories: { in: [3] } }] },
      }),
    )
  })
  it('rechecks selected IDs and preserves selection order without exposing stale draft objects', async () => {
    find.mockResolvedValue({
      docs: [
        { id: 2, title: 'Second' },
        { id: 1, title: 'First' },
      ],
    })
    const result = await ArchiveBlock({
      blockType: 'archive',
      populateBy: 'selection',
      selectedDocs: [
        { relationTo: 'posts', value: 1 },
        { relationTo: 'posts', value: 3 },
        { relationTo: 'posts', value: 2 },
      ],
    })
    expect(renderToStaticMarkup(result as React.ReactElement)).toContain('First,Second')
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        draft: false,
        where: { and: [{ id: { in: [1, 3, 2] } }, { _status: { equals: 'published' } }] },
      }),
    )
  })
})
