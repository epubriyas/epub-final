import { permanentRedirect } from 'next/navigation'
export default async function LegacyArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/blog/${encodeURIComponent(slug)}`)
}
