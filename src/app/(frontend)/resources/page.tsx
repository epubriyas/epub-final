import { pageMetadata } from '@/lib/seo'
import Link from '@/components/i18n/LocalizedLink'
import { contentPayload } from '@/lib/content'
import { PageHero, ContentCTA } from '@/components/editorial/Primitives'
import RichText from '@/components/RichText'
import { headers } from 'next/headers'
import { languagePath } from '@/config/languages'
import { getResourceGroup } from '@/config/resource-content'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Resources',
  description:
    'Project checklists, articles and downloads to help you plan publishing, localization and accessible content with EPUBTRANS.',
  alternates: { canonical: '/resources' },
})

const projectGuides = [
  {
    title: 'Prepare your manuscript.',
    description:
      'Give your publishing team a clear starting point, from the first edit to the final format.',
    steps: [
      'Share the editable source files, illustrations and references.',
      'Confirm your audience, style guide and preferred spelling.',
      'List the print and digital formats you need, with key delivery dates.',
    ],
    href: '/copyediting-services',
    link: 'Explore editorial support',
  },
  {
    title: 'Plan a multilingual release.',
    description: 'Define the language, context and review process before localization begins.',
    steps: [
      'Specify each target language, region and audience.',
      'Provide approved terminology, brand guidance and source assets.',
      'Agree on in-country review and the formats needed for each market.',
    ],
    href: '/translation-services',
    link: 'Explore language services',
  },
  {
    title: 'Scope accessible content.',
    description: 'Build accessibility requirements into your brief and production workflow.',
    steps: [
      'Identify your delivery formats and the accessibility requirements they must meet.',
      'Include source files, image descriptions and any existing audit findings.',
      'Plan time for testing, corrections and a final review before release.',
    ],
    href: '/services#digital-accessibility',
    link: 'Explore accessibility services',
  },
]

export default async function Resources({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[]
    page?: string | string[]
    category?: string | string[]
    type?: string | string[]
  }>
}) {
  const params = await searchParams
  const resourceGroup = getResourceGroup(params.type)
  const resourceType = resourceGroup ? String(params.type) : ''
  const q = (typeof params.q === 'string' ? params.q : '').slice(0, 120)
  const category =
    typeof params.category === 'string' && /^\d+$/.test(params.category) ? params.category : ''
  const currentPage = Math.floor(Math.max(1, Math.min(1000, Number(params.page) || 1)))
  const payload = await contentPayload()
  const locale = (await headers()).get('x-epubtrans-language') || 'en'
  const hubPath = languagePath('/resources', locale)
  const categories = await payload.find({
    collection: 'categories',
    overrideAccess: false,
    pagination: false,
    sort: 'title',
  })
  const resources = await payload.find({
    collection: 'resources',
    overrideAccess: false,
    limit: 12,
    page: resourceGroup ? currentPage : 1,
    depth: 1,
    sort: 'title',
    where: {
      and: [
        { status: { equals: 'published' } },
        ...(resourceGroup ? [{ type: { in: [...resourceGroup.types] } }] : []),
        ...(q ? [{ or: [{ title: { contains: q } }, { description: { contains: q } }] }] : []),
      ],
    },
  })
  const posts = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    depth: 1,
    limit: 8,
    page: currentPage,
    sort: '-publishedAt',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(q
          ? [{ or: [{ title: { contains: q } }, { 'meta.description': { contains: q } }] }]
          : []),
        ...(category ? [{ categories: { contains: Number(category) } }] : []),
      ],
    },
  })
  return (
    <main>
      <PageHero
        eyebrow="RESOURCES"
        title={resourceGroup?.title || 'Publishing and localization resources'}
        description={
          resourceGroup
            ? 'Published reference material to support your planning and production.'
            : 'Practical checklists, articles and downloads to help you prepare your next publishing, localization or accessibility project.'
        }
      />
      {!q && !category && !resourceGroup && (
        <section className="et-container et-content-section" aria-labelledby="project-guides-title">
          <p className="et-label">START WITH YOUR PROJECT</p>
          <h2 id="project-guides-title">Project preparation checklists</h2>
          <p>
            Use these checklists to shape your brief, gather the right files and make your first
            conversation more useful.
          </p>
          <div className="et-resource-guides">
            {projectGuides.map((guide, index) => (
              <article key={guide.title}>
                <p className="et-label">{String(index + 1).padStart(2, '0')} / PROJECT CHECKLIST</p>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <ul>
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
                <Link className="et-text-link" href={guide.href}>
                  {guide.link} →
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="et-container et-content-section">
        <p className="et-label">EXPLORE THE LIBRARY</p>
        <h2>{resourceGroup?.title || 'Articles & resources.'}</h2>
        <p>
          {resourceGroup
            ? 'Search published downloadable resources.'
            : 'Search published articles and downloadable resources. The category filter applies to articles.'}
        </p>
        <form action={hubPath} className="et-search-form">
          {resourceGroup && <input type="hidden" name="type" value={resourceType} />}
          <label htmlFor="resource-search">Search resources</label>
          <div>
            <input
              name="q"
              id="resource-search"
              defaultValue={q}
              maxLength={120}
              placeholder="Publishing, language, learning…"
            />
            {!resourceGroup && (
              <>
                <label htmlFor="resource-category" className="sr-only">
                  Article category
                </label>
                <select
                  name="category"
                  id="resource-category"
                  defaultValue={category}
                  aria-label="Article category"
                >
                  <option value="">All article categories</option>
                  {categories.docs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button className="et-button" type="submit">
              Search →
            </button>
          </div>
        </form>
        {!resourceGroup && (
          <>
            <h2 className="et-resource-section-title">Articles & perspectives</h2>
            {posts.docs.length ? (
              <div className="et-content-list">
                {posts.docs.map((post) => (
                  <Link className="et-content-row" key={post.id} href={`/blog/${post.slug}`}>
                    <div>
                      <p className="et-label">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'PERSPECTIVE'}
                      </p>
                      <h3>{post.title}</h3>
                      <p>{post.meta?.description}</p>
                    </div>
                    <span>Read ↗</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="et-empty">
                <h2>{q || category ? 'No matching articles.' : 'New articles are on the way.'}</h2>
                <p>
                  {q || category
                    ? 'Try a broader search or clear the article category filter.'
                    : 'Start with the project checklists above, or talk to us about the content you are preparing.'}
                </p>
                <Link className="et-text-link" href={q || category ? '/resources' : '/services'}>
                  {q || category ? 'Clear filters' : 'Explore services'} →
                </Link>
              </div>
            )}
            <nav className="et-pagination" aria-label="Article pages">
              {posts.hasPrevPage && (
                <Link
                  href={`/resources?q=${encodeURIComponent(q)}&category=${category}&page=${currentPage - 1}`}
                >
                  ← Previous
                </Link>
              )}
              {posts.totalPages > 1 && (
                <span>
                  Page {currentPage} of {posts.totalPages}
                </span>
              )}
              {posts.hasNextPage && (
                <Link
                  href={`/resources?q=${encodeURIComponent(q)}&category=${category}&page=${currentPage + 1}`}
                >
                  Next →
                </Link>
              )}
            </nav>
          </>
        )}
        {!!resources.docs.length && (
          <section className="et-resource-downloads">
            <p className="et-label">RESOURCE LIBRARY</p>
            <h2>{resourceGroup?.title || 'Guides & downloads.'}</h2>
            <p>Published reference material to support your planning and production.</p>
            {resources.docs.map((resource) => (
              <article key={resource.id} className="et-copy">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                {resource.content && <RichText data={resource.content} enableGutter={false} />}{' '}
                {typeof resource.file === 'object' && resource.file?.url && (
                  <Link className="et-text-link" href={resource.file.url}>
                    Download resource →
                  </Link>
                )}
              </article>
            ))}
          </section>
        )}
        {resourceGroup && !resources.docs.length && (
          <div className="et-empty">
            <h2>{q ? 'No matching resources.' : 'New resources are on the way.'}</h2>
            <p>
              {q
                ? 'Try a broader search.'
                : 'Published resources will appear here as they become available.'}
            </p>
          </div>
        )}
        {resourceGroup && (
          <nav className="et-pagination" aria-label="Resource pages">
            {resources.hasPrevPage && (
              <Link
                href={`/resources?type=${resourceType}&q=${encodeURIComponent(q)}&page=${currentPage - 1}`}
              >
                ← Previous
              </Link>
            )}
            {resources.totalPages > 1 && (
              <span>
                Page {currentPage} of {resources.totalPages}
              </span>
            )}
            {resources.hasNextPage && (
              <Link
                href={`/resources?type=${resourceType}&q=${encodeURIComponent(q)}&page=${currentPage + 1}`}
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </section>
      <ContentCTA />
    </main>
  )
}
