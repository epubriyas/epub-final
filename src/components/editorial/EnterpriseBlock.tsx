import type { Page, Media as MediaType } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { ArrowLink, PageHero } from './Primitives'
import Link from '@/components/i18n/LocalizedLink'
import { servicePath } from '@/config/service-paths'

type LayoutBlock = Page['layout'][number]
export function EnterpriseBlock({ block }: { block: LayoutBlock }) {
  const title = 'title' in block ? block.title : undefined
  const description = 'description' in block ? block.description : undefined
  const eyebrow = 'eyebrow' in block ? block.eyebrow : undefined
  const link = 'link' in block ? block.link : undefined
  const media = 'media' in block ? block.media : undefined
  const renderMedia = (value: MediaType | number | null | undefined) =>
    typeof value === 'object' && value ? (
      <Media resource={value} imgClassName="et-cms-image" size="(max-width: 650px) 100vw, 70vw" />
    ) : null
  if (block.blockType === 'enterpriseHero' || block.blockType === 'editorialHero')
    return (
      <>
        <PageHero title={title || ''} eyebrow={eyebrow || ''} description={description || ''} />
        {renderMedia(media)}
        {link?.url && (
          <div className="et-container">
            <ArrowLink href={link.url}>{link.label || 'Explore'}</ArrowLink>
          </div>
        )}
      </>
    )
  if (block.blockType === 'richContent')
    return (
      <section className="et-content-section et-container">
        <RichText data={block.content} enableGutter={false} />
      </section>
    )
  if (block.blockType === 'fullWidthMedia')
    return (
      <figure className="et-container et-content-section">
        {renderMedia(block.media)}
        {block.caption && <figcaption className="et-label">{block.caption}</figcaption>}
      </figure>
    )
  if (block.blockType === 'stats') {
    const verified = block.items?.filter((item) => item.verified && item.source)
    if (!verified?.length) return null
    return (
      <div className="et-container et-stats">
        {verified.map((item) => (
          <div key={item.id}>
            <strong>{item.value}</strong>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    )
  }
  if (block.blockType === 'quote')
    return block.permissionConfirmed && block.source ? (
      <blockquote className="et-container et-pullquote">
        <p>{block.text}</p>
        <cite>{block.attribution}</cite>
      </blockquote>
    ) : null
  if (block.blockType === 'logoWall')
    return (
      <section className="et-container et-content-section">
        <h2>{title}</h2>
        <div className="et-logo-wall">
          {block.logos
            ?.filter((item) => item.permissionConfirmed)
            .map((item) => (
              <div key={item.id}>
                {renderMedia(item.media)}
                <p>{item.name}</p>
              </div>
            ))}
        </div>
      </section>
    )
  if (block.blockType === 'faq')
    return (
      <section className="et-container et-content-section">
        <h2>{title}</h2>
        {block.items?.map((item) => (
          <details className="et-faq" key={item.id}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    )
  if (block.blockType === 'timeline')
    return (
      <section className="et-container et-content-section">
        <h2>{title}</h2>
        <ol className="et-content-list">
          {block.items?.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>
      </section>
    )
  const records =
    block.blockType === 'serviceExplorer'
      ? block.services
      : block.blockType === 'solutionGrid'
        ? block.solutions
        : block.blockType === 'industryExplorer'
          ? block.industries
          : block.blockType === 'caseStudies'
            ? block.cases
            : block.blockType === 'insights'
              ? block.posts
              : undefined
  const route =
    block.blockType === 'serviceExplorer'
      ? 'services'
      : block.blockType === 'solutionGrid'
        ? 'solutions'
        : block.blockType === 'industryExplorer'
          ? 'industries'
          : block.blockType === 'caseStudies'
            ? 'work'
            : 'insights'
  if (records)
    return (
      <section className="et-container et-content-section">
        <p className="et-label">{eyebrow}</p>
        <h2>{title}</h2>
        <div className="et-content-list">
          {records
            .filter(
              (record) =>
                typeof record === 'object' &&
                record &&
                (('status' in record && record.status === 'published') ||
                  ('_status' in record && record._status === 'published')) &&
                (!('permissionConfirmed' in record) || record.permissionConfirmed),
            )
            .map((record) =>
              typeof record === 'object' && record ? (
                <Link
                  className="et-content-row"
                  key={record.id}
                  href={
                    route === 'services' ? servicePath(record.slug) : `/${route}/${record.slug}`
                  }
                >
                  <h3>{record.title}</h3>
                  <span>Explore →</span>
                </Link>
              ) : null,
            )}
        </div>
      </section>
    )
  if (
    block.blockType === 'mediaText' ||
    block.blockType === 'statement' ||
    block.blockType === 'enterpriseCTA'
  )
    return (
      <section className="et-container et-content-section">
        <p className="et-label">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="et-lead">{description}</p>
        {renderMedia(media)}
        {block.blockType === 'mediaText' && block.content && (
          <RichText data={block.content} enableGutter={false} />
        )}{' '}
        {link?.url && <ArrowLink href={link.url}>{link.label || 'Explore'}</ArrowLink>}
      </section>
    )
  return null
}
