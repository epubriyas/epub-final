import { ArticleListing, type ArticleSearch } from '@/components/resources/ArticleListing'
import { pageMetadata } from '@/lib/seo'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Blog',
  description:
    'Ideas, practical guidance and thoughtful perspectives on publishing, localization and digital content from EPUBTRANS.',
  alternates: { canonical: '/blog' },
})
export default function Blog({ searchParams }: { searchParams: ArticleSearch }) {
  return <ArticleListing searchParams={searchParams} />
}
