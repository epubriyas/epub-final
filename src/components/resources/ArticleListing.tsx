import { contentPayload } from '@/lib/content'
import { headers } from 'next/headers'
import { languagePath } from '@/config/languages'
import Link from '@/components/i18n/LocalizedLink'
import { ContentCTA, PageHero } from '@/components/editorial/Primitives'

export type ArticleSearch = Promise<{ q?: string | string[]; page?: string | string[] }>
export async function ArticleListing({
  searchParams,
  insights = false,
}: {
  searchParams: ArticleSearch
  insights?: boolean
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.slice(0, 120) : ''
  const page = Math.floor(Math.max(1, Math.min(1000, Number(params.page) || 1)))
  const payload = await contentPayload()
  const path = insights ? '/industry-insights' : '/blog'
  const title = insights ? 'Industry Insights' : 'Blog'
  const locale = (await headers()).get('x-epubtrans-language') || 'en'
  const category = insights
    ? (
        await payload.find({
          collection: 'categories',
          overrideAccess: false,
          limit: 1,
          where: { slug: { equals: 'industry-insights' } },
        })
      ).docs[0]
    : undefined
  const posts = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    depth: 1,
    limit: 8,
    page,
    sort: '-publishedAt',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(insights ? [{ categories: { contains: category?.id ?? -1 } }] : []),
        ...(q
          ? [{ or: [{ title: { contains: q } }, { 'meta.description': { contains: q } }] }]
          : []),
      ],
    },
  })
  return (
    <main>
      <PageHero
        eyebrow="INSIGHTS & BLOG"
        title={title}
        description={
          insights
            ? 'Perspectives on publishing, localization, learning and accessible content.'
            : 'Articles and ideas from EPUBTRANS.'
        }
      />
      <section className="et-container et-content-section">
        <form action={languagePath(path, locale)} className="et-search-form">
          <label htmlFor="article-search">Search articles</label>
          <div>
            <input id="article-search" name="q" defaultValue={q} maxLength={120} />
            <button className="et-button" type="submit">
              Search →
            </button>
          </div>
        </form>
        {posts.docs.length ? (
          <div className="et-content-list">
            {posts.docs.map((post) => (
              <Link className="et-content-row" href={`/resources/${post.slug}`} key={post.id}>
                <div>
                  <h2>{post.title}</h2>
                  <p>{post.meta?.description}</p>
                </div>
                <span>Read ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="et-empty">
            <h2>{q ? 'No matching articles.' : 'New articles are on the way.'}</h2>
            <p>
              {q
                ? 'Try a broader search.'
                : 'Published articles will appear here as they become available.'}
            </p>
          </div>
        )}
        <nav className="et-pagination" aria-label="Article pages">
          {posts.hasPrevPage && (
            <Link href={`${path}?q=${encodeURIComponent(q)}&page=${page - 1}`}>← Previous</Link>
          )}
          {posts.totalPages > 1 && (
            <span>
              Page {page} of {posts.totalPages}
            </span>
          )}
          {posts.hasNextPage && (
            <Link href={`${path}?q=${encodeURIComponent(q)}&page=${page + 1}`}>Next →</Link>
          )}
        </nav>
      </section>
      <ContentCTA />
    </main>
  )
}
