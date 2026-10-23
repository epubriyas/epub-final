import { cache } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { pageMetadata } from '@/lib/seo'
import { contentPayload, getPreviewAccess } from '@/lib/content'
import { articleDate, articleImage, articleSummary, readingTime } from '@/lib/blog'
import Link from '@/components/i18n/LocalizedLink'
import { BlogCover } from '@/components/blog/BlogCover'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ArticleTools } from '@/components/blog/ArticleTools'
import { BlogMotion } from '@/components/blog/BlogMotion'
import { getServerSideURL } from '@/utilities/getURL'
import baseStyles from '@/components/blog/blog.module.css'
import articleStyles from '@/components/blog/article.module.css'

const styles = { ...baseStyles, ...articleStyles }

const getPost = cache(async (slug: string) => {
  // Decode encoded path segments before matching existing CMS slugs with spaces.
  let decodedSlug = slug
  try {
    decodedSlug = decodeURIComponent(slug)
  } catch {
    return undefined
  }
  const payload = await contentPayload()
  const access = await getPreviewAccess()
  return (
    await payload.find({
      collection: 'posts',
      overrideAccess: false,
      user: access.user,
      draft: access.draft,
      depth: 1,
      limit: 1,
      where: {
        and: [
          { slug: { equals: decodedSlug } },
          ...(!access.draft ? [{ _status: { equals: 'published' } }] : []),
        ],
      },
    })
  ).docs[0]
})
type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  const { draft } = await getPreviewAccess()
  return pageMetadata({
    title: post?.meta?.title || post?.title || 'Article',
    description: post ? articleSummary(post) : undefined,
    alternates: { canonical: `/blog/${slug}` },
    ...(draft ? { robots: { index: false, follow: false } } : {}),
  })
}

export default async function BlogArticle({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const { draft } = await getPreviewAccess()
  const authors = post.populatedAuthors?.filter((author) => author.name) || []
  const categories = post.categories?.filter((category) => typeof category === 'object') || []
  const heroImage = articleImage(post)
  const payload = await contentPayload()
  const relatedIds =
    post.relatedPosts?.map((related) => (typeof related === 'object' ? related.id : related)) || []
  const related = (
    await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      limit: 3,
      depth: 1,
      sort: '-publishedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { id: { not_equals: post.id } },
          ...(relatedIds.length ? [{ id: { in: relatedIds } }] : []),
        ],
      },
    })
  ).docs
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: articleSummary(post),
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt,
    url: `${getServerSideURL()}/blog/${encodeURIComponent(post.slug!)}`,
    author: authors.length
      ? authors.map((author) => ({ '@type': 'Person', name: author.name }))
      : undefined,
    publisher: { '@type': 'Organization', name: 'EPUBTRANS' },
  }
  return (
    <BlogMotion key={post.id} className={`${styles.page} ${styles.articlePage}`}>
      {draft && (
        <>
          <LivePreviewListener />
          <p className={`et-container ${styles.previewNotice}`}>
            Draft preview · This version is visible only to signed-in editors.
          </p>
        </>
      )}
      <header className={`et-container ${styles.articleHeader}`} data-blog-motion>
        <Link className={styles.backLink} href="/blog">
          <ArrowLeft size={18} aria-hidden="true" /> Back to the blog
        </Link>
        <div className={styles.headerGrid}>
          <div className={styles.titlePanel}>
            <div className={styles.articleTopics}>
              <p className={styles.eyebrow}>EPUBTRANS INSIGHTS / ARTICLE</p>
              {categories
                .filter((category) => category.slug)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${encodeURIComponent(category.slug!)}`}
                  >
                    {category.title}
                  </Link>
                ))}
            </div>
            <h1>{post.title}</h1>
            {post.meta?.description && <p className={styles.lead}>{post.meta.description}</p>}
            <div className={styles.postMeta}>
              <span>
                <small>WRITTEN BY</small>
                {authors.length
                  ? authors.map((author) => author.name).join(', ')
                  : 'Author not specified'}
              </span>
              {post.publishedAt && (
                <span>
                  <small>PUBLISHED</small>
                  <time dateTime={post.publishedAt}>{articleDate(post.publishedAt)}</time>
                </span>
              )}
              <span>
                <small>READING TIME</small>
                {readingTime(post)} min read
              </span>
            </div>
          </div>
          {heroImage && (
            <figure
              className={styles.headerVisual}
              data-portrait={Boolean(
                heroImage.height && heroImage.width && heroImage.height > heroImage.width,
              )}
            >
              <div className={styles.imageFrame}>
                <BlogCover
                  image={heroImage}
                  fit="contain"
                  priority
                  sizes="(max-width: 750px) 100vw, 1120px"
                />
              </div>
              <figcaption>EPUBTRANS / INSIGHTS</figcaption>
            </figure>
          )}
        </div>
      </header>
      <div className={`et-container ${styles.articleLayout}`}>
        <aside className={styles.articleAside}>
          <p className={styles.eyebrow}>THE PERSPECTIVE</p>
          <p className={styles.asideIntro}>
            Ideas and experience from the people behind our publishing work.
          </p>
          <ArticleTools />
          <Link className={styles.asideBack} href="/blog">
            Explore all insights <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </aside>
        <article id="article-content" className={styles.articleBody} aria-label={post.title}>
          <RichText data={post.content} enableGutter={false} />
          <div className={styles.authorNote}>
            <span className={styles.authorMark}>ET</span>
            <div>
              <p>
                {authors.length
                  ? authors.map((author) => author.name).join(', ')
                  : 'Author not specified'}
              </p>
              <span>Publishing. Language. Digital content.</span>
            </div>
          </div>
        </article>
      </div>
      <section className={`et-container ${styles.articleEnd}`} data-blog-motion>
        <div>
          <p className={styles.eyebrow}>FROM PERSPECTIVE TO PROGRESS</p>
          <h2>
            What’s next for
            <br />
            your content?
          </h2>
        </div>
        <div>
          <p>
            Bring your publishing, localization or digital production challenge to our team.
            Together, we can shape a practical way forward.
          </p>
          <Link href="/get-a-quote">
            Let’s start a conversation <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
      {related.length > 0 && (
        <section className={`et-container ${styles.related}`} data-blog-motion>
          <p className={styles.eyebrow}>KEEP EXPLORING</p>
          <h2>More from the journal.</h2>
          <div className={styles.grid}>
            {related.map((item) => (
              <Link
                key={item.id}
                className={styles.relatedCard}
                href={`/blog/${encodeURIComponent(item.slug!)}`}
              >
                <div className={articleStyles.relatedImage}>
                  <BlogCover
                    image={articleImage(item)}
                    fit="contain"
                    sizes="(max-width: 750px) 100vw, 33vw"
                  />
                </div>
                <h3>{item.title}</h3>
                <p>{articleSummary(item)}</p>
                <span className={styles.readLink}>
                  Read article <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {!draft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
      )}
    </BlogMotion>
  )
}
