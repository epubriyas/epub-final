import sanitizeHtml from 'sanitize-html'

/** Use only for visitor HTML. Editorial metadata is deliberately never accepted. */
export function sanitizeComment(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'a',
    ],
    allowedAttributes: { a: ['href', 'title', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attributes) => ({
        tagName: 'a',
        attribs: {
          href: attributes.href || '',
          ...(attributes.title ? { title: attributes.title } : {}),
          rel: 'ugc nofollow',
        },
      }),
    },
  })
}
