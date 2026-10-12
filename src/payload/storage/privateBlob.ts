import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { put, get, del } from '@vercel/blob'
import path from 'node:path'

const token = process.env.BLOB_READ_WRITE_TOKEN
const adapter: Adapter = ({ collection }) => ({
  name: 'vercel-private-blob',
  handleUpload: async ({ file, storageFilePath }) => {
    await put(storageFilePath, file.buffer, {
      access: 'private',
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.mimeType,
    })
  },
  handleDelete: async ({ storageFilePath }) => {
    await del(storageFilePath, { token })
  },
  generateURL: ({ filename }) => `/api/${collection.slug}/file/${encodeURIComponent(filename)}`,
  staticHandler: async (_req, { doc, headers, params }) => {
    const stored = doc as { prefix?: string; _objectKey?: string } | undefined
    const prefix = typeof stored?.prefix === 'string' ? stored.prefix : collection.slug
    const objectKey = typeof stored?._objectKey === 'string' ? stored._objectKey : ''
    const key = path.posix.join(prefix || collection.slug, objectKey, params.filename)
    const result = await get(key, { access: 'private', token, useCache: false })
    if (!result || result.statusCode !== 200) return new Response('Not found', { status: 404 })
    const responseHeaders = new Headers(headers)
    responseHeaders.set('Content-Type', result.blob.contentType)
    responseHeaders.set('Cache-Control', 'private, no-store')
    responseHeaders.set('X-Content-Type-Options', 'nosniff')
    return new Response(result.stream, { headers: responseHeaders })
  },
})

/** Payload authorizes file reads before the handler; the backing Blob objects remain private. */
export const privateBlobStorage = cloudStoragePlugin({
  enabled: Boolean(token),
  alwaysInsertFields: true,
  collections: {
    media: { adapter, prefix: 'media' },
    'portfolio-previews': { adapter, prefix: 'portfolio-previews' },
  },
})
