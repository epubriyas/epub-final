import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin, type Where } from 'payload'
import { revalidateRedirects } from '@/payload/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/payload/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/payload/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { privateBlobStorage } from '@/payload/storage/privateBlob'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | EPUBTRANS` : 'EPUBTRANS'
}

const generateURL: GenerateURL<Post | Page> = ({ doc, collectionConfig }) => {
  const url = getServerSideURL()

  return doc?.slug
    ? `${url}${collectionConfig?.slug === 'posts' ? '/blog' : ''}/${doc.slug === 'home' && collectionConfig?.slug === 'pages' ? '' : encodeURIComponent(doc.slug)}`
    : url
}

export const plugins: Plugin[] = [
  privateBlobStorage,
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      access: {
        read: async ({ req }): Promise<boolean | Where> => {
          if (req.user) return true
          const published = await req.payload.find({
            collection: 'posts',
            overrideAccess: false,
            pagination: false,
            depth: 0,
            select: { slug: true },
            where: { _status: { equals: 'published' } },
            req,
          })
          return {
            and: [
              { 'doc.relationTo': { equals: 'posts' } },
              { 'doc.value': { in: published.docs.map((post) => post.id) } },
            ],
          }
        },
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
