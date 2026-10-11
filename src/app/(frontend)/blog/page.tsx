import { ArticleListing, type ArticleSearch } from '@/components/resources/ArticleListing'
import { pageMetadata } from '@/lib/seo'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Articles and ideas from EPUBTRANS.',
  alternates: { canonical: '/blog' },
})
export default function Blog({ searchParams }: { searchParams: ArticleSearch }) {
  return <ArticleListing searchParams={searchParams} />
}
