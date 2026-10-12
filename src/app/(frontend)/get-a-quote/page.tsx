import { pageMetadata } from '@/lib/seo'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { PageHero } from '@/components/editorial/Primitives'
import { quoteServices } from '@/lib/validation/quote'
export const metadata = pageMetadata({
  title: 'Get a Quote',
  description: 'Tell EPUBTRANS about your publishing, translation or digital content project.',
  alternates: { canonical: '/get-a-quote' },
})

export default async function Quote({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>
}) {
  const service = (await searchParams).service
  const initialService =
    typeof service === 'string' && quoteServices.some((value) => value === service) ? service : ''
  return (
    <main>
      <PageHero
        eyebrow="GET A QUOTE"
        title="Let’s shape what comes next."
        description="Tell us about your content. We’ll start with your requirements."
      />
      <section className="et-container et-content-section">
        <QuoteForm key={initialService} initialService={initialService} />
      </section>
    </main>
  )
}
