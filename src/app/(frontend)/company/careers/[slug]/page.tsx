import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import RichText from '@/components/RichText'
import { BlogMotion as CareersMotion } from '@/components/blog/BlogMotion'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getCareer, employmentLabel, applicationHref, roleSummary } from '@/lib/careers'
import { getPreviewAccess, getSiteSettings } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import styles from '../careers.module.css'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const role = await getCareer(slug)
  const { draft } = await getPreviewAccess()
  return pageMetadata({
    title: role?.seo?.metaTitle || role?.title || 'Career opportunity',
    description: role?.seo?.metaDescription || role?.description,
    alternates: { canonical: `/company/careers/${slug}` },
    ...(draft ? { robots: { index: false, follow: false } } : {}),
  })
}

export default async function CareerRole({ params }: Props) {
  const { slug } = await params
  const [role, settings, access] = await Promise.all([
    getCareer(slug),
    getSiteSettings(),
    getPreviewAccess(),
  ])
  if (!role) notFound()
  const email = role.applicationEmail || settings.email || 'info@epubtrans.com'
  return (
    <CareersMotion className={styles.page}>
      {access.draft && (
        <>
          <LivePreviewListener />
          <p className={`et-container ${styles.preview}`}>
            Editor preview · Unpublished roles remain private.
          </p>
        </>
      )}
      <header className={`et-container ${styles.roleHero}`}>
        <Link href="/company/careers#open-roles" className={styles.back}>
          <ArrowLeft size={18} aria-hidden="true" /> All open roles
        </Link>
        <p className="et-label">EPUBTRANS / CAREER OPPORTUNITY</p>
        <h1>{role.title}</h1>
        {role.description && <p className={styles.intro}>{roleSummary(role.description)}</p>}
      </header>
      <div className={`et-container ${styles.roleLayout}`}>
        <article className={styles.roleBody}>
          {!role.content && role.description && (
            <section>
              <h2>About the opportunity</h2>
              <p className={styles.roleCopy}>{role.description}</p>
            </section>
          )}
          {role.content && (
            <>
              <h2>About the opportunity</h2>
              <RichText data={role.content} enableGutter={false} />
            </>
          )}
          {Boolean(role.capabilities?.length) && (
            <section className={styles.requirements}>
              <h2>Role highlights & requirements</h2>
              <ul>
                {role.capabilities?.map((item) => (
                  <li key={item.id || item.title}>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!role.content && !role.description && !role.capabilities?.length && (
            <p className={styles.intro}>
              Contact the team to discuss the responsibilities, required experience and application
              details for this opportunity.
            </p>
          )}
        </article>
        <aside className={styles.applyPanel} aria-label="Role facts and application">
          <h2>Your role at a glance.</h2>
          <dl>
            {role.location && (
              <div>
                <dt>Location</dt>
                <dd>{role.location}</dd>
              </div>
            )}
            {role.employmentType && (
              <div>
                <dt>Employment</dt>
                <dd>{employmentLabel(role.employmentType)}</dd>
              </div>
            )}
            <div>
              <dt>Applications</dt>
              <dd>{email}</dd>
            </div>
          </dl>
          <p>
            Introduce your relevant skills and experience. Include your availability and any work
            samples that support your application.
          </p>
          <a className="et-button" href={applicationHref(role, email)}>
            Apply by email <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </CareersMotion>
  )
}
