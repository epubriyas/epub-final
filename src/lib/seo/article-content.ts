import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { articleText } from '@/lib/blog'

export type ArticleSection = { id: string; title: string; level: number }

/** Stable IDs and heading hierarchy are ready in the server response, without DOM edits. */
export function prepareArticleContent(content: DefaultTypedEditorState) {
  const data = structuredClone(content)
  const sections: ArticleSection[] = []
  let previousLevel = 1
  function visit(node: { type?: string; tag?: string; id?: string; children?: unknown[] }) {
    if (node.type === 'heading') {
      const requested = Number(node.tag?.slice(1)) || 2
      const level = Math.min(Math.max(2, requested), previousLevel + 1, 4)
      previousLevel = level
      node.tag = `h${level}`
      node.id = `article-section-${sections.length + 1}`
      sections.push({ id: node.id, title: articleText(node), level })
    }
    node.children?.forEach((child) => {
      if (child && typeof child === 'object') visit(child)
    })
  }
  visit(data.root)
  return { data, sections }
}
