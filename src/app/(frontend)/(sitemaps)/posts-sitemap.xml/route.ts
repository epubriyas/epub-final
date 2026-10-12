import { getServerSideSitemap } from 'next-sitemap'
import { contentPayload } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'
export const dynamic = 'force-dynamic'
export async function GET() {
  const p = await contentPayload()
  const posts = await p.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    pagination: false,
    depth: 0,
    where: { _status: { equals: 'published' } },
  })
  return getServerSideSitemap(
    posts.docs.map((post) => ({
      loc: `${getServerSideURL()}/blog/${post.slug}`,
      lastmod: post.updatedAt,
    })),
  )
}
