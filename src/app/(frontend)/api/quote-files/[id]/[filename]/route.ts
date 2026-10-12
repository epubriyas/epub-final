import { readPrivateFile } from '@/lib/private-files'
import { contentPayload } from '@/lib/content'
export const runtime = 'nodejs'
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  const { id, filename } = await params
  if (!/^\d+$/.test(id) || !/^[0-9a-f-]+\.(txt|pdf|docx)$/.test(filename))
    return new Response('Not found', { status: 404 })
  const payload = await contentPayload()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Unauthorized', { status: 401 })
  try {
    const quote = await payload.findByID({
      collection: 'quote-requests',
      id: Number(id),
      user,
      overrideAccess: false,
      depth: 0,
    })
    const file = quote.attachments?.find((file) => file.path === filename)
    if (!file) return new Response('Not found', { status: 404 })
    const bytes = await readPrivateFile(filename)
    return new Response(bytes, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
