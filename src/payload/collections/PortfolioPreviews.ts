import type { CollectionConfig } from 'payload'
import path from 'node:path'
import { authenticated } from '@/payload/access/authenticated'

export const PortfolioPreviews: CollectionConfig = {
  slug: 'portfolio-previews',
  admin: {
    useAsTitle: 'alt',
    group: 'Content',
    description:
      'Generated viewing images only. Original documents stay in private source storage.',
  },
  access: {
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    read: async ({ req }) => {
      if (req.user) return true
      const { docs } = await req.payload.find({
        collection: 'case-studies',
        depth: 0,
        pagination: false,
        overrideAccess: true,
        where: {
          and: [{ status: { equals: 'published' } }, { permissionConfirmed: { equals: true } }],
        },
        select: { thumbnail: true, previewPages: true },
      })
      const ids = docs
        .flatMap((doc) => [doc.thumbnail, ...(doc.previewPages ?? []).map((page) => page.asset)])
        .filter((id): id is number => typeof id === 'number')
      return ids.length ? { id: { in: ids } } : false
    },
  },
  fields: [{ name: 'alt', type: 'text', required: true }],
  upload: {
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      headers.set('X-Robots-Tag', 'noindex, noarchive')
      return headers
    },
    staticDir:
      process.env.PORTFOLIO_PREVIEW_DIR ||
      path.resolve(process.cwd(), 'private-uploads/portfolio-previews'),
    mimeTypes: ['image/webp', 'image/png', 'image/jpeg'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 560,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
    ],
    adminThumbnail: 'thumbnail',
  },
}
