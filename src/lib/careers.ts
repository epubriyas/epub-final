import { cache } from 'react'
import { contentPayload, getPreviewAccess } from '@/lib/content'
import type { Career } from '@/payload-types'

export function roleSummary(description?: string | null): string {
  const text = description?.replace(/\s+/g, ' ').trim() || ''
  if (text.length <= 240) return text
  const end = text.lastIndexOf(' ', 237)
  return `${text.slice(0, end > 160 ? end : 237).trimEnd()}…`
}

export const employmentLabel = (value: Career['employmentType']) =>
  value ? { 'full-time': 'Full time', 'part-time': 'Part time', contract: 'Contract' }[value] : ''

export const applicationHref = (role: Career) =>
  role.status === 'published' && role.applicationEmail
    ? `mailto:${role.applicationEmail}?subject=${encodeURIComponent(`Application: ${role.title}`)}`
    : undefined

export const getCareer = cache(async (slug: string) => {
  let lookup = slug
  try {
    lookup = decodeURIComponent(slug)
  } catch {
    /* Keep literal slugs containing a percent sign. */
  }
  const payload = await contentPayload()
  const access = await getPreviewAccess()
  return (
    await payload.find({
      collection: 'careers',
      overrideAccess: false,
      user: access.user,
      depth: 1,
      limit: 1,
      where: {
        and: [
          { slug: { equals: lookup } },
          ...(!access.draft ? [{ status: { equals: 'published' } }] : []),
        ],
      },
    })
  ).docs[0]
})
