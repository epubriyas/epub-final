import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { put, get, del } from '@vercel/blob'

const token = () => process.env.BLOB_READ_WRITE_TOKEN
export async function storePrivateFile(filename: string, bytes: Uint8Array) {
  if (token()) {
    await put(`quote-attachments/${filename}`, Buffer.from(bytes), {
      access: 'private',
      token: token(),
      addRandomSuffix: false,
    })
    return
  }
  const root = path.resolve(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads')
  await mkdir(root, { recursive: true })
  await writeFile(path.join(root, filename), bytes, { flag: 'wx', mode: 0o600 })
}
export async function removePrivateFile(filename: string) {
  if (token()) return del(`quote-attachments/${filename}`, { token: token() })
  return unlink(path.resolve(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads', filename))
}
export async function readPrivateFile(filename: string) {
  if (token()) {
    const result = await get(`quote-attachments/${filename}`, {
      access: 'private',
      token: token(),
      useCache: false,
    })
    if (!result || result.statusCode !== 200) throw new Error('File not found')
    return result.stream
  }
  return readFile(path.resolve(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads', filename))
}
