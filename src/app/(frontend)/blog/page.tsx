import { ArticleListing, type ArticleSearch } from '@/components/resources/ArticleListing'
import { pageMetadata } from '@/lib/seo'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Publishing & Localization Insights',
  description:
    'Practical guides to publishing production, XML, EPUB, document conversion, multilingual DTP, accessibility and localization workflows.',
  alternates: { canonical: '/blog' },
})
export default function Blog({ searchParams }: { searchParams: ArticleSearch }) {
  return <ArticleListing searchParams={searchParams} />
}
