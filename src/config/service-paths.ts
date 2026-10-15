/** V1 public URLs are canonical; Payload slugs remain stable internal record identifiers. */
export const servicePaths: Record<string, string> = {
  translation: '/translation-services',
  'desktop-publishing': '/desktop-publishing-services',
  copyediting: '/copyediting-services',
  typesetting: '/typesetting-services',
  'cover-page-design': '/cover-page-design-services',
  'scielo-xml-markup': '/scielo-xml-markup-services',
  'xml-jats': '/xml-conversion-services',
  proofreading: '/proofreading-services',
  'ebook-creation': '/ebook-creation-services',
  'graphic-design-image-services': '/graphic-design-image-services',
  'data-conversion': '/data-conversion-services',
  subtitling: '/subtitling-services',
  voiceover: '/voiceover-services',
  transcription: '/transcription-services',
  'elearning-localization': '/elearning-localization-services',
  accessibility: '/accessibility-services',
}

export function servicePath(slug: string): string {
  return Object.hasOwn(servicePaths, slug)
    ? servicePaths[slug]
    : `/services/${encodeURIComponent(slug)}`
}

export function serviceSlugForPath(path: string): string | undefined {
  return Object.keys(servicePaths).find((slug) => servicePaths[slug] === path)
}

export const serviceRedirects = Object.fromEntries(
  Object.entries(servicePaths).map(([slug, path]) => [`/services/${slug}`, path]),
)
