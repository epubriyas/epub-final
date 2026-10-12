import { getWorkPreview } from '@/lib/portfolio'
export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const sample = await getWorkPreview((await params).slug)
  return Response.json(sample || { error: 'Sample not found' }, {
    status: sample ? 200 : 404,
    headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, noarchive' },
  })
}
