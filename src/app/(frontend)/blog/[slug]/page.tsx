import { cache } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { pageMetadata } from '@/lib/seo'
import { contentPayload, getPreviewAccess } from '@/lib/content'
import { articleDate, articleSummary, readingTime } from '@/lib/blog'
import Link from '@/components/i18n/LocalizedLink'
import { BlogCover } from '@/components/blog/BlogCover'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ArticleTools } from '@/components/blog/ArticleTools'
import { BlogMotion } from '@/components/blog/BlogMotion'
import { getServerSideURL } from '@/utilities/getURL'
import styles from '@/components/blog/blog.module.css'

const getPost = cache(async (slug: string) => {
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
          { slug: { equals: slug } },
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
  const payload = await contentPayload()
  const relatedIds =
    post.relatedPosts?.map((related) => (typeof related === 'object' ? related.id : related)) || []
  const related = (
    await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      limit: 3,
      depth: 0,
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
    url: `${getServerSideURL()}/blog/${post.slug}`,
    author: authors.length
      ? authors.map((author) => ({ '@type': 'Person', name: author.name }))
      : { '@type': 'Organization', name: 'EPUBTRANS' },
    publisher: { '@type': 'Organization', name: 'EPUBTRANS' },
  }
  return (
    <BlogMotion className={`${styles.page} ${styles.articlePage}`}>
      {draft && (
        <>
          <LivePreviewListener />
          <p className={`et-container ${styles.previewNotice}`}>
            Draft preview · This version is visible only to signed-in editors.
          </p>
        </>
      )}
      <header className={`et-container ${styles.articleHeader}`}>
        <Link className={styles.backLink} href="/blog">
          <ArrowLeft size={18} aria-hidden="true" /> Back to the blog
        </Link>
        <div className={styles.articleTopics}>
          <p className={styles.eyebrow}>EPUBTRANS / JOURNAL</p>
          {categories
            .filter((category) => category.slug)
            .map((category) => (
              <Link key={category.id} href={`/blog?category=${encodeURIComponent(category.slug!)}`}>
                {category.title}
              </Link>
            ))}
        </div>
        <h1>{post.title}</h1>
        {post.meta?.description && <p className={styles.lead}>{post.meta.description}</p>}
        <div className={styles.postMeta}>
          <span>
            {authors.length ? authors.map((author) => author.name).join(', ') : 'EPUBTRANS'}
          </span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{articleDate(post.publishedAt)}</time>
          )}
          <span>{readingTime(post)} min read</span>
        </div>
      </header>
      {post.heroImage && typeof post.heroImage === 'object' && (
        <div
          className={`et-container ${styles.articleCover}`}
          data-portrait={Boolean(
            post.heroImage.height &&
            post.heroImage.width &&
            post.heroImage.height > post.heroImage.width,
          )}
        >
          <BlogCover image={post.heroImage} sizes="100vw" />
        </div>
      )}
      <div className={`et-container ${styles.articleLayout}`}>
        <aside className={styles.articleAside}>
          <ArticleTools />
        </aside>
        <article id="article-content" className={styles.articleBody} aria-label={post.title}>
          <RichText data={post.content} enableGutter={false} />
          <div className={styles.articleEnd}>
            <span className={styles.eyebrow}>CONTINUE THE CONVERSATION</span>
            <p>Have a publishing or localization challenge in mind?</p>
            <Link href="/get-a-quote">
              Talk to EPUBTRANS <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>
      {related.length > 0 && (
        <section className={`et-container ${styles.related}`}>
          <p className={styles.eyebrow}>KEEP EXPLORING</p>
          <h2>More from the journal.</h2>
          <div className={styles.grid}>
            {related.map((item) => (
              <Link key={item.id} className={styles.relatedCard} href={`/blog/${item.slug}`}>
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
