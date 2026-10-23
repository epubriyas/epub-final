import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 1,
      limit,
      where: {
        and: [
          { _status: { equals: 'published' } },
          ...(flattenedCategories?.length ? [{ categories: { in: flattenedCategories } }] : []),
        ],
      },
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const ids = selectedDocs.flatMap(({ value }) => {
        const valueId = value && typeof value === 'object' ? value.id : value
        return valueId ? [valueId] : []
      })
      if (ids.length) {
        const payload = await getPayload({ config: configPromise })
        const result = await payload.find({
          collection: 'posts',
          overrideAccess: false,
          draft: false,
          depth: 1,
          pagination: false,
          where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] },
        })
        // Resolve current publication state instead of trusting cached relationship objects.
        posts = ids.flatMap((id) => result.docs.filter((post) => post.id === id))
      }
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
