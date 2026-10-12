import type { Where } from 'payload'
import { headers } from 'next/headers'
import { ArrowUpRight, BookOpen, Globe2, Layers, Search } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { Media } from '@/components/Media'
import { contentPayload } from '@/lib/content'
import { languagePath } from '@/config/languages'
import { articleDate, articleSummary, readingTime } from '@/lib/blog'
import { ContentCTA } from '@/components/editorial/Primitives'
import type { Post } from '@/payload-types'
import { BlogMotion } from './BlogMotion'
import styles from './blog.module.css'

export type ArticleSearch = Promise<{
  q?: string | string[]
  page?: string | string[]
  category?: string | string[]
}>

function Cover({ post }: { post: Post }) {
  const image =
    post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : post.meta?.image
  return image && typeof image === 'object' ? (
    <Media resource={image} size="(max-width: 650px) 100vw, 50vw" />
  ) : (
    <div className={styles.coverArt} aria-hidden="true">
      <span className={styles.coverOrbit} />
      <BookOpen size={60} strokeWidth={1} />
      <span className={styles.coverLines}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.coverCaption}>WORDS / CULTURE / FORMAT</span>
    </div>
  )
}

function PostDetails({ post }: { post: Post }) {
  const categories = post.categories?.filter((category) => typeof category === 'object') || []
  return (
    <div className={styles.postMeta}>
      {categories.slice(0, 2).map((category) => (
        <span key={category.id}>{category.title}</span>
      ))}
      {post.publishedAt && <time dateTime={post.publishedAt}>{articleDate(post.publishedAt)}</time>}
      <span>{readingTime(post)} min read</span>
    </div>
  )
}

export async function BlogListing({ searchParams }: { searchParams: ArticleSearch }) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.slice(0, 120) : ''
  const selected = typeof params.category === 'string' ? params.category : ''
  const number = Number(params.page)
  const page = Number.isFinite(number) ? Math.floor(Math.max(1, Math.min(1000, number))) : 1
  const payload = await contentPayload()
  const locale = (await headers()).get('x-epubtrans-language') || 'en'
  const path = '/blog'
  const categories = (
    await payload.find({
      collection: 'categories',
      overrideAccess: false,
      pagination: false,
      sort: 'title',
    })
  ).docs
  const category = categories.find((item) => item.slug === selected)
  const conditions: Where[] = [{ _status: { equals: 'published' } }]
  if (selected) conditions.push({ categories: { contains: category?.id ?? -1 } })
  if (q)
    conditions.push({ or: [{ title: { contains: q } }, { 'meta.description': { contains: q } }] })
  const posts = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    depth: 1,
    limit: 9,
    page,
    sort: '-publishedAt',
    where: { and: conditions },
  })
  const featured = !q && !selected && page === 1 ? posts.docs[0] : undefined
  const cards = featured ? posts.docs.slice(1) : posts.docs
  const pageHref = (next: number) =>
    `${path}?${new URLSearchParams({ ...(q ? { q } : {}), ...(selected ? { category: selected } : {}), page: String(next) })}`
  return (
    <BlogMotion className={styles.page}>
      <header className={`et-container ${styles.hero}`}>
        <div>
          <p className={styles.eyebrow}>EPUBTRANS / THE BLOG</p>
          <h1>Good content starts with a fresh perspective.</h1>
          <p className={styles.lead}>
            Ideas, practical guidance and thoughtful perspectives on the craft of publishing,
            language and digital content.
          </p>
        </div>
        <figure className={styles.heroGraphic} data-blog-motion>
          <figcaption>THE CONTENT PERSPECTIVE</figcaption>
          <div className={styles.graphicCore}>
            <BookOpen size={36} strokeWidth={1.3} />
            <span>A better reading experience</span>
          </div>
          <svg viewBox="0 0 360 75" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path pathLength="1" d="M180 0V30 M60 75V30H300V75 M180 30V75" />
          </svg>
          <ul>
            <li>
              <BookOpen aria-hidden="true" size={22} />
              <span>Publishing</span>
            </li>
            <li>
              <Globe2 aria-hidden="true" size={22} />
              <span>Language</span>
            </li>
            <li>
              <Layers aria-hidden="true" size={22} />
              <span>Digital</span>
            </li>
          </ul>
          <p>Words, culture and format. Connected.</p>
        </figure>
      </header>
      <section className={`et-container ${styles.listing}`} aria-labelledby="articles-heading">
        <div className={styles.listingTop}>
          <div>
            <p className={styles.eyebrow}>EXPLORE THE JOURNAL</p>
            <h2 id="articles-heading">
              {q || selected ? 'Your reading list.' : 'The latest thinking.'}
            </h2>
          </div>
          <p>
            {posts.totalDocs} {posts.totalDocs === 1 ? 'article' : 'articles'}
          </p>
        </div>
        <form action={languagePath(path, locale)} className={styles.filters}>
          <div>
            <label htmlFor="article-search">Search articles</label>
            <div className={styles.searchInput}>
              <Search size={18} aria-hidden="true" />
              <input
                id="article-search"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="What would you like to explore?"
                maxLength={120}
              />
            </div>
          </div>
          <div>
            <label htmlFor="article-category">Topic</label>
            <select id="article-category" name="category" defaultValue={selected}>
              <option value="">All topics</option>
              {categories.map((item) => (
                <option value={item.slug || ''} key={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <button className="et-button" type="submit">
            Explore <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          {(q || selected) && <Link href={path}>Clear filters</Link>}
        </form>
        {featured && (
          <Link className={styles.featured} href={`/blog/${featured.slug}`}>
            <div className={styles.cover}>
              <Cover post={featured} />
            </div>
            <div className={styles.featuredContent}>
              <p className={styles.eyebrow}>LATEST ARTICLE</p>
              <PostDetails post={featured} />
              <h2>{featured.title}</h2>
              <p>{articleSummary(featured)}</p>
              <span className={styles.readLink}>
                Read the story <ArrowUpRight size={20} aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}
        {cards.length > 0 && (
          <div className={styles.grid}>
            {cards.map((post) => (
              <Link href={`/blog/${post.slug}`} className={styles.card} key={post.id}>
                <div className={styles.cover}>
                  <Cover post={post} />
                </div>
                <div className={styles.cardContent}>
                  <PostDetails post={post} />
                  <h3>{post.title}</h3>
                  <p>{articleSummary(post)}</p>
                  <span className={styles.readLink}>
                    Read article <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!posts.docs.length && (
          <div className={styles.empty}>
            <BookOpen size={40} strokeWidth={1.2} aria-hidden="true" />
            <h3>
              {q || selected
                ? 'No articles match this search.'
                : 'The next perspective is taking shape.'}
            </h3>
            <p>
              {q || selected
                ? 'Try another topic or a broader search to find your next read.'
                : 'Return for new ideas on publishing, language and digital content. In the meantime, explore the work behind every edition.'}
            </p>
            <Link href={q || selected ? path : '/services'}>
              {q || selected ? 'View all articles' : 'Explore our capabilities'}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
        <nav className={styles.pagination} aria-label="Article pages">
          {posts.hasPrevPage && <Link href={pageHref(page - 1)}>← Previous</Link>}
          {posts.totalPages > 1 && (
            <span>
              Page {page} of {posts.totalPages}
            </span>
          )}
          {posts.hasNextPage && <Link href={pageHref(page + 1)}>Next →</Link>}
        </nav>
      </section>
      <ContentCTA />
    </BlogMotion>
  )
}
