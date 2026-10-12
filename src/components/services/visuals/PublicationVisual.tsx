import type { VisualKind } from '@/config/service-design'

export function PublicationVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'reader')
    return (
      <div
        className="sv-reader-set"
        aria-label="Illustrative digital edition on a tablet and smaller reader"
      >
        <div className="sv-reader">
          <span className="sv-meta">DIGITAL EDITION</span>
          <h3>
            A new
            <br />
            chapter.
          </h3>
          <div className="sv-rule" />
          <p>Content prepared for a digital reading experience.</p>
          <span className="sv-page-number">01 / CONTENTS</span>
        </div>
        <div className="sv-reader sv-reader-small">
          <span className="sv-meta">READING VIEW</span>
          <h3>
            A new
            <br />
            chapter.
          </h3>
          <div className="sv-lines" />
          <span className="sv-page-number">01</span>
        </div>
      </div>
    )
  if (kind === 'design')
    return (
      <div className="sv-design-set" aria-label="Illustrative publication cover and color palette">
        <div className="sv-cover">
          <span className="sv-meta">PUBLICATION STUDY</span>
          <h3>
            Form
            <br />
            &amp; meaning.
          </h3>
          <div className="sv-cover-art" />
          <span className="sv-meta">AN ILLUSTRATIVE EDITION</span>
        </div>
        <div className="sv-palette">
          <span>01 / COLOR &amp; COMPOSITION</span>
          <i />
          <i />
          <i />
        </div>
      </div>
    )
  return (
    <div
      className="sv-spread"
      aria-label="Illustrative two-page publication with a typography grid and image caption"
    >
      <div className="sv-spread-page">
        <span className="sv-meta">PUBLICATION / LAYOUT STUDY</span>
        <h3>
          The shape
          <br />
          of a story.
        </h3>
        <div className="sv-rule" />
        <p>Typography, space and structure. Each detail has a place on the page.</p>
        <div className="sv-lines" />
        <span className="sv-page-number">01</span>
      </div>
      <div className="sv-spread-page">
        <div className="sv-page-art">
          <span>FIG. 01</span>
        </div>
        <p className="sv-caption">Image and caption, aligned to the page grid.</p>
        <div className="sv-columns">
          <div className="sv-lines" />
          <div className="sv-lines" />
        </div>
        <span className="sv-page-number">02</span>
      </div>
    </div>
  )
}
