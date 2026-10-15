import { cache } from 'react'
import defaults from '@/config/landing-content.json'
import { contentPayload } from '@/lib/content'
import {
  validateLandingContent,
  validateDirectory,
  type HomeLandingContent,
  type ServicesLandingContent,
} from '@/lib/landing-schema'

export const getLandingContent = cache(async () => {
  const payload = await contentPayload()
  const content = await payload.findGlobal({ slug: 'landing-pages', overrideAccess: false })
  return {
    home:
      validateLandingContent(content.homeContent, defaults.home) === true
        ? (content.homeContent as HomeLandingContent)
        : defaults.home,
    directory:
      validateDirectory(content.servicesContent) === true
        ? (content.servicesContent as ServicesLandingContent)
        : defaults.directory,
  }
})
