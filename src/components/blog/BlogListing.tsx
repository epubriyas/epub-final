import type { Where } from 'payload'
import { headers } from 'next/headers'
import Image from 'next/image'
import { ArrowUpRight, Search } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { contentPayload } from '@/lib/content'
import { languagePath } from '@/config/languages'
import { articleDate, articleImage as postImage, articleSummary, readingTime } from '@/lib/blog'
import { BlogMotion } from './BlogMotion'
import { BlogCover } from './BlogCover'
import base from './blog.module.css'
import styles from './journal.module.css'
export type ArticleSearch = Promise<{
  q?: string | string[]
  page?: string | string[]
  category?: string | string[]
}>

export async function BlogListing({ searchParams }: { searchParams: ArticleSearch }) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const selected = typeof params.category === 'string' ? params.category : ''
  const number = typeof params.page === 'string' ? Number(params.page) : 1
  const page = Number.isFinite(number) ? Math.floor(Math.max(1, Math.min(1000, number))) : 1
  const locale = (await headers()).get('x-epubtrans-language') || 'en'
  const payload = await contentPayload()
  const categories = (
    await payload.find({
      collection: 'categories',
      overrideAccess: false,
      pagination: false,
      sort: 'title',
    })
  ).docs.filter((item) => item.slug)
  const category = categories.find((item) => item.slug === selected)
  const conditions: Where[] = [{ _status: { equals: 'published' } }]
  if (selected) conditions.push({ categories: { in: [category?.id ?? -1] } })
  if (q)
    conditions.push({ or: [{ title: { contains: q } }, { 'meta.description': { contains: q } }] })
  const posts = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    depth: 1,
    limit: 8,
    page,
    sort: '-publishedAt',
    where: { and: conditions },
  })
  const featured = page === 1 && !q && !selected ? posts.docs[0] : undefined
  const featuredImage = featured ? postImage(featured) : null
  const portraitHero = Boolean(
    featuredImage?.width && featuredImage?.height && featuredImage.height > featuredImage.width,
  )
  const more = featured ? posts.docs.slice(1) : posts.docs
  const pageHref = (next: number) =>
    `/blog?${new URLSearchParams({ ...(q ? { q } : {}), ...(selected ? { category: selected } : {}), page: String(next) })}`
  return (
    <BlogMotion key={`${page}:${selected}:${q}`} className={`${base.page} ${styles.journal}`}>
      <div className={styles.masthead}>
        <div className={`et-container ${styles.mastheadInner}`}>
          <Link href="/blog">
            EPUBTRANS <span>Insights</span>
          </Link>
          <nav aria-label="Blog navigation">
            <a href="#featured">Latest articles</a>
            <a href="#topics">Explore topics</a>
            <Link href="/contact-us">Discuss a project</Link>
          </nav>
        </div>
      </div>
      <div className={`et-container ${styles.content}`}>
        <header className={styles.pageHeader} data-blog-motion>
          <p className={styles.kicker}>EPUBTRANS RESOURCES</p>
          <h1>Publishing &amp; Localization Insights</h1>
          <p>
            Practical guidance for publishers, academic publishing teams, localization service
            providers and content-production professionals.
          </p>
          <p className={styles.intro}>
            Explore the files, workflows and quality considerations behind print, digital publishing
            and multilingual delivery — from EPUB and JATS XML to document conversion, DTP and
            accessibility.
          </p>
        </header>
        <div className={styles.toolbar}>
          <nav aria-label="Browse insight topics">
            <Link href="/blog" aria-current={!selected ? 'page' : undefined}>
              All stories
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/blog?${new URLSearchParams({ ...(q ? { q } : {}), category: item.slug! })}`}
                aria-current={selected === item.slug ? 'page' : undefined}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <form action={languagePath('/blog', locale)}>
            <label htmlFor="blog-search">Search the blog</label>
            <Search size={17} aria-hidden="true" />
            <input
              id="blog-search"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search the blog"
              maxLength={120}
            />
            <input type="hidden" name="category" value={selected} />
            <button type="submit" aria-label="Search insights">
              <ArrowUpRight size={19} aria-hidden="true" />
            </button>
          </form>
        </div>
        <section
          id="featured"
          aria-labelledby="featured-heading"
          className={styles.featuredSection}
        >
          <div className={styles.sectionHeading}>
            <h2 id="featured-heading">{q || selected ? 'Search results' : 'Featured'}</h2>
            <span>
              {posts.totalDocs} {posts.totalDocs === 1 ? 'story' : 'stories'}
              {(q || selected) && (
                <>
                  {' '}
                  · <Link href="/blog">Clear filters</Link>
                </>
              )}
            </span>
          </div>
          {(featured || !posts.docs.length) && (
            <div className={styles.featuredGrid}>
              <div>
                {featured ? (
                  <Link
                    className={styles.leadStory}
                    href={`/blog/${encodeURIComponent(featured.slug!)}`}
                    data-blog-motion
                  >
                    <div className={styles.leadImage} data-portrait={portraitHero}>
                      {featuredImage ? (
                        <BlogCover
                          image={featuredImage}
                          fill
                          priority
                          fit={portraitHero ? 'contain' : 'cover'}
                          sizes="(max-width:800px) 100vw,65vw"
                        />
                      ) : (
                        <Image
                          src="/images/insights/workplace.jpg"
                          alt="Digital publishing and multilingual content production materials"
                          fill
                          priority
                          sizes="(max-width:800px) 100vw,65vw"
                        />
                      )}
                    </div>
                    <div className={styles.leadBody}>
                      <p className={styles.byline}>
                        {featured.publishedAt && (
                          <time dateTime={featured.publishedAt}>
                            {articleDate(featured.publishedAt)}
                          </time>
                        )}
                        <span>|</span>
                        {featured.populatedAuthors
                          ?.map((a) => a.name)
                          .filter(Boolean)
                          .join(', ') || 'EPUBTRANS editorial team'}
                      </p>
                      <h3>{featured.title}</h3>
                      <p>{articleSummary(featured)}</p>
                      <span className={styles.readLink}>
                        Read the story <ArrowUpRight size={19} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className={styles.empty}>
                    <h3>
                      {q || selected
                        ? 'No insights match your search.'
                        : page > 1
                          ? 'You have reached the end of the articles.'
                          : 'New insights are on the way.'}
                    </h3>
                    <p>
                      {q || selected
                        ? 'Try another topic or a broader search.'
                        : 'Browse the latest articles or explore our services.'}
                    </p>
                    <Link href="/blog">View all stories</Link>
                  </div>
                )}
              </div>
              <aside className={styles.sideStories} aria-label="Explore EPUBTRANS">
                <Link href="/services" className={styles.sideStory}>
                  <div className={styles.sideImage}>
                    <Image
                      src="/images/insights/editorial.jpg"
                      alt="Editorial workspace with notebook and laptop"
                      fill
                      sizes="(max-width:800px) 100vw,30vw"
                    />
                  </div>
                  <div>
                    <p className={styles.kicker}>PUBLISHING & EDITORIAL</p>
                    <h3>Better publishing starts with a clear production process.</h3>
                    <span className={styles.readLink}>
                      Explore our capabilities <ArrowUpRight size={17} />
                    </span>
                  </div>
                </Link>
                <Link href="/contact-us" className={styles.sideText}>
                  <p className={styles.kicker}>CONNECT WITH OUR TEAM</p>
                  <h3>Planning a publishing or localization project?</h3>
                  <span className={styles.readLink}>
                    Discuss your project <ArrowUpRight size={17} />
                  </span>
                </Link>
              </aside>
            </div>
          )}
        </section>
        {more.length > 0 && (
          <section className={styles.news} aria-labelledby="news-heading">
            <h2 id="news-heading">More stories</h2>
            <div className={styles.newsGrid}>
              {more.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${encodeURIComponent(post.slug!)}`}
                  className={styles.newsCard}
                  data-blog-motion
                >
                  <div className={styles.newsImage}>
                    <BlogCover
                      image={postImage(post)}
                      fit="contain"
                      sizes="(max-width:550px) 100vw, (max-width:800px) 50vw,33vw"
                    />
                  </div>
                  <p className={styles.byline}>
                    {post.publishedAt && articleDate(post.publishedAt)} · {readingTime(post)} min
                    read
                  </p>
                  <h3>{post.title}</h3>
                  <p>{articleSummary(post)}</p>
                  <span className={styles.readLink}>
                    Read more <ArrowUpRight size={18} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {posts.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Article pages">
            {posts.hasPrevPage && <Link href={pageHref(page - 1)}>Previous</Link>}
            <span>
              Page {page} of {posts.totalPages}
            </span>
            {posts.hasNextPage && <Link href={pageHref(page + 1)}>Next</Link>}
          </nav>
        )}
        <section id="topics" className={styles.topics} aria-labelledby="topics-heading">
          <div>
            <p className={styles.kicker}>EXPLORE MORE</p>
            <h2 id="topics-heading">
              Practical guidance.
              <br />
              Production expertise.
            </h2>
            <p>Explore the topics behind successful publishing and localization workflows.</p>
          </div>
          <div className={styles.topicLinks}>
            <Link href="/services">
              Publishing &amp; editorial production <ArrowUpRight size={20} />
            </Link>
            <Link href="/blog">
              XML, EPUB &amp; digital publishing <ArrowUpRight size={20} />
            </Link>
            <Link href="/get-a-quote">
              Plan your publishing project <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      </div>
    </BlogMotion>
  )
}
