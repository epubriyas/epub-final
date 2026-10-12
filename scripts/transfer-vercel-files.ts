import 'dotenv/config'
import { getPayload } from 'payload'
import { parse } from 'dotenv'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { put } from '@vercel/blob'
import config from '../src/payload.config'
const cloud = parse(await readFile('.vercel/.env.production.local'))
if (!cloud.BLOB_READ_WRITE_TOKEN) throw new Error('Cloud file store is missing')
const payload = await getPayload({ config })
let uploaded = 0,
  missing = 0
try {
  for (const slug of ['media', 'portfolio-previews'] as const) {
    const docs = (
      await payload.find({ collection: slug, overrideAccess: true, pagination: false, depth: 0 })
    ).docs
    const upload = payload.collections[slug].config.upload
    const root = typeof upload === 'object' ? upload.staticDir : undefined
    if (!root) throw new Error('Missing local storage directory')
    for (const doc of docs) {
      const names = [
        doc.filename,
        ...Object.values(doc.sizes || {}).map((size) => size?.filename),
      ].filter((name): name is string => Boolean(name))
      for (const filename of [...new Set(names)]) {
        try {
          const file = path.resolve(root, filename)
          if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error('Unsafe file path')
          await stat(file)
          await put(
            `${doc.prefix || slug}/${doc._objectKey ? doc._objectKey + '/' : ''}${filename}`,
            await readFile(file),
            {
              access: 'private',
              token: cloud.BLOB_READ_WRITE_TOKEN,
              addRandomSuffix: false,
              allowOverwrite: true,
              contentType: doc.mimeType || undefined,
            },
          )
          uploaded++
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') missing++
          else throw error
        }
      }
    }
  }
  const quotes = (
    await payload.find({
      collection: 'quote-requests',
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })
  ).docs
  for (const quote of quotes)
    for (const attachment of quote.attachments || []) {
      try {
        const filename = path.basename(attachment.path)
        if (filename !== attachment.path) throw new Error('Invalid attachment path')
        await put(
          `quote-attachments/${filename}`,
          await readFile(
            path.resolve(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads', filename),
          ),
          {
            access: 'private',
            token: cloud.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: false,
            allowOverwrite: true,
          },
        )
        uploaded++
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') missing++
        else throw error
      }
    }
  console.log(JSON.stringify({ uploaded, missingLocalFiles: missing, storage: 'private Blob' }))
} finally {
  await payload.destroy()
}
process.exit(0)
