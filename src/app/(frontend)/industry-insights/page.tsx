import { ArticleListing, type ArticleSearch } from '@/components/resources/ArticleListing'
import { pageMetadata } from '@/lib/seo'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Industry Insights',
  description: 'Perspectives on publishing, localization, learning and accessible content.',
  alternates: { canonical: '/industry-insights' },
})
export default function Insights({ searchParams }: { searchParams: ArticleSearch }) {
  return <ArticleListing searchParams={searchParams} insights />
}
