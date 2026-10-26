import { cache } from 'react'
import defaults from '@/config/landing-content.json'
import { contentPayload } from '@/lib/content'
import {
  validateLandingContent,
  validateDirectory,
  type HomeLandingContent,
  type ServicesLandingContent,
} from '@/lib/landing-schema'

// Keep older CMS records usable until the audience-pathway data migration is applied.
// Only the two known legacy links are changed; editorial copy elsewhere is preserved.
export function upgradeHomeAudienceLinks(home: HomeLandingContent): HomeLandingContent {
  return {
    ...home,
    audience: {
      ...home.audience,
      cards: home.audience.cards.map((card) => ({
        ...card,
        cta: {
          ...card.cta,
          href:
            card.cta.label === 'Explore Publishing Services' &&
            card.cta.href === '/services#publishing-editorial'
              ? '/services#for-publishers'
              : card.cta.label === 'Explore Localization Production' &&
                  card.cta.href === '/services#localization-dtp'
                ? '/services#for-localization-providers'
                : card.cta.href,
        },
      })),
    },
  }
}

export function upgradeDirectoryAudience(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const directory = value as Record<string, unknown>
  const audience = directory.audience
  if (!audience || typeof audience !== 'object' || Array.isArray(audience)) return value
  if ('eyebrow' in audience) return value
  return { ...directory, audience: defaults.directory.audience }
}

export const getLandingContent = cache(async () => {
  const payload = await contentPayload()
  const content = await payload.findGlobal({ slug: 'landing-pages', overrideAccess: false })
  const directoryContent = upgradeDirectoryAudience(content.servicesContent)
  return {
    home: upgradeHomeAudienceLinks(
      validateLandingContent(content.homeContent, defaults.home) === true
        ? (content.homeContent as HomeLandingContent)
        : defaults.home,
    ),
    directory:
      validateDirectory(directoryContent) === true
        ? (directoryContent as ServicesLandingContent)
        : defaults.directory,
  }
})
