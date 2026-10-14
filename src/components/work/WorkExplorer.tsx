'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from '@/components/i18n/LocalizedLink'
import { SampleViewer } from './SampleViewer'
import type { WorkSample } from '@/lib/portfolio'

export function WorkExplorer({
  samples,
  initialCategory = '',
}: {
  samples: WorkSample[]
  initialCategory?: string
}) {
  const categories = [...new Set(samples.map((sample) => sample.category))]
  const [category, setCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : '',
  )
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState<number | null>(null)
  const visible = samples.filter(
    (sample) =>
      (!category || sample.category === category) &&
      `${sample.title} ${sample.description} ${sample.category}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  )
  const selectCategory = (value: string) => {
    setCategory(value)
    const url = new URL(window.location.href)
    if (value) url.searchParams.set('category', value)
    else url.searchParams.delete('category')
    window.history.replaceState(null, '', url)
  }
  const open = (sample: WorkSample) => setIndex(samples.findIndex((item) => item.id === sample.id))
  return (
    <>
      <section
        className="wp-explorer et-container"
        id="explore-work"
        aria-labelledby="explorer-title"
      >
        <div className="wp-explorer-heading">
          <div>
            <p className="wp-kicker">Explore the collection</p>
            <h2 id="explorer-title">Find your next perspective.</h2>
          </div>
          <label className="wp-search">
            Search work
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title or content type"
            />
          </label>
        </div>
        <div className="wp-filters" aria-label="Filter work by service">
          <button aria-pressed={!category} onClick={() => selectCategory('')}>
            All Work <span>{samples.length}</span>
          </button>
          {categories.map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              onClick={() => selectCategory(value)}
            >
              {value} <span>{samples.filter((sample) => sample.category === value).length}</span>
            </button>
          ))}
        </div>
        <p className="wp-result-count" role="status">
          {visible.length} {visible.length === 1 ? 'sample' : 'samples'}
          {category ? ` / ${category}` : ' / All Work'}
        </p>
        <div className="wp-collection" key={category}>
          {visible.map((sample, i) => (
            <article className="wp-work-row" key={sample.id}>
              <div className="wp-row-preview">
                {sample.thumbnail ? (
                  <Image
                    unoptimized
                    src={sample.thumbnail.url}
                    alt={sample.thumbnail.alt}
                    width={sample.thumbnail.width}
                    height={sample.thumbnail.height}
                    loading="lazy"
                    sizes="(max-width: 767px) 70vw, 260px"
                  />
                ) : (
                  <p className="wp-pending">
                    {sample.kind}
                    <br />
                    Details available
                  </p>
                )}
              </div>
              <div className="wp-row-copy">
                <p className="wp-kicker">
                  {String(i + 1).padStart(2, '0')} / {sample.category} / {sample.kind}
                </p>
                <h3>
                  <Link href={`/work/${sample.slug}`}>{sample.title}</Link>
                </h3>
                <p>{sample.description}</p>
                <span className="wp-deliverable">
                  {sample.format}
                  {sample.sourcePageCount ? ` / ${sample.sourcePageCount} source pages` : ''}
                  {sample.sectionCount ? ' / Reading excerpt' : ''}
                </span>
                <div className="wp-row-actions">
                  {(sample.pageCount > 0 || sample.sectionCount > 0) && (
                    <button className="wp-text-button" onClick={() => open(sample)}>
                      View Sample ↗
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        {!visible.length && (
          <div className="wp-empty">
            <p className="wp-kicker">A considered collection</p>
            <h3>{samples.length ? 'No work matches this view.' : 'New work is taking shape.'}</h3>
            <p>
              {samples.length
                ? 'Try another phrase or return to the full collection.'
                : 'Approved sample previews will appear here as they are prepared. Tell us what you would like to explore.'}
            </p>
            {samples.length > 0 ? (
              <button
                className="wp-text-button"
                onClick={() => {
                  setSearch('')
                  selectCategory('')
                }}
              >
                Return to All Work ↗
              </button>
            ) : (
              <Link className="wp-text-button" href="/get-a-quote">
                Discuss your requirements ↗
              </Link>
            )}
          </div>
        )}
      </section>
      <SampleViewer
        samples={samples}
        index={index}
        onClose={() => setIndex(null)}
        onChange={setIndex}
      />
    </>
  )
}

export function SampleLauncher({ sample }: { sample: WorkSample }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {(sample.pageCount > 0 || sample.sectionCount > 0) && (
        <button className="wp-button" onClick={() => setOpen(true)}>
          View Sample <span aria-hidden="true">↗</span>
        </button>
      )}
      <SampleViewer
        samples={[sample]}
        index={open ? 0 : null}
        onClose={() => setOpen(false)}
        onChange={() => {}}
      />
    </>
  )
}
