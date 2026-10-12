import type { ServiceDesign } from '@/config/service-design'
import type { CSSProperties } from 'react'

export function TransformationDiagram({ design }: { design: ServiceDesign }) {
  const audio = design.kind === 'audio' || design.kind === 'subtitles'
  return (
    <figure className={`sp-transformation sp-transformation-${design.kind}`} data-motion="diagram">
      <div className="sp-transform-panels">
        <div className="sp-transform-source">
          <span className="sv-meta">SOURCE / {design.source}</span>
          {audio ? (
            <>
              <div className="sv-wave" aria-hidden="true">
                {Array.from({ length: 20 }, (_, i) => (
                  <i key={i} style={{ height: `${20 + ((i * 13) % 65)}%` }} />
                ))}
              </div>
              <p>Recording, script or timed media content.</p>
            </>
          ) : (
            <>
              <h3>
                Ideas.
                <br />
                Content.
                <br />
                Context.
              </h3>
              <div className="sv-lines" aria-hidden="true" />
              <p>The starting material for your project.</p>
            </>
          )}
        </div>
        <svg
          className="sp-transform-arrow sp-transform-route"
          viewBox="0 0 48 80"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="sp-route-track"
            d="M4 40 H15 Q24 40 24 30 V22 Q24 14 32 14 H39 V40 H44"
          />
          <path
            className="sp-route-ink"
            pathLength="100"
            d="M4 40 H15 Q24 40 24 30 V22 Q24 14 32 14 H39 V40 H44"
          />
          <circle className="sp-route-source" cx="4" cy="40" r="3" />
          <circle className="sp-route-destination" cx="44" cy="40" r="3" />
        </svg>
        <div className="sp-transform-output">
          <span className="sv-meta">DELIVERABLE / {design.output}</span>
          {design.kind === 'xml' ? (
            <pre>
              <code>
                {
                  '<article>\n  <title>Publication title</title>\n  <body>\n    <section>Content</section>\n  </body>\n</article>'
                }
              </code>
            </pre>
          ) : design.kind === 'editing' ? (
            <>
              <h3>A clearer sentence.</h3>
              <p>
                The publication <del>bring</del> <ins>brings</ins> together the ideas.
              </p>
              <span className="sp-transform-note">Illustrative editorial correction</span>
            </>
          ) : design.kind === 'index' ? (
            <>
              <h3>Topics → pages</h3>
              <dl>
                <div style={{ '--motion-index': 0 } as CSSProperties}>
                  <dt>Content</dt>
                  <dd>12</dd>
                </div>
                <div style={{ '--motion-index': 1 } as CSSProperties}>
                  <dt>Publication</dt>
                  <dd>24–28</dd>
                </div>
                <div style={{ '--motion-index': 2 } as CSSProperties}>
                  <dt>Structure</dt>
                  <dd>32</dd>
                </div>
              </dl>
            </>
          ) : design.kind === 'audio' ? (
            <>
              <h3>{design.output}</h3>
              <div className="sp-transform-lines" />
              <p>Format and delivery requirements agreed for the project.</p>
            </>
          ) : design.kind === 'subtitles' ? (
            <>
              <h3>Picture + language</h3>
              <p className="sp-transform-caption">
                00:00:04 → 00:00:08
                <br />
                Every story begins with a clear idea.
              </p>
            </>
          ) : design.kind === 'accessibility' ? (
            <>
              <h3>A content hierarchy.</h3>
              <ol>
                {[
                  'H1 / Document title',
                  'H2 / Section heading',
                  'P / Paragraph',
                  'FIG / Text alternative',
                ].map((level, i) => (
                  <li key={level} style={{ '--motion-index': i } as CSSProperties}>
                    {level}
                  </li>
                ))}
              </ol>
            </>
          ) : design.kind === 'layout' || design.kind === 'reader' || design.kind === 'design' ? (
            <>
              <h3>
                {design.kind === 'reader'
                  ? 'A digital edition.'
                  : design.kind === 'design'
                    ? 'Form & meaning.'
                    : 'A considered page.'}
              </h3>
              <div className="sp-transform-publication">
                <div />
                <div>
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <p>
                {design.kind === 'reader'
                  ? 'Content organized for digital reading.'
                  : 'Content, typography and visual structure.'}
              </p>
            </>
          ) : (
            <>
              <h3>{design.output}</h3>
              <ul>
                <li>Content requirements</li>
                <li>
                  {design.kind === 'language' || design.kind === 'learning'
                    ? 'Target-language context'
                    : 'Output structure'}
                </li>
                <li>Format &amp; presentation</li>
              </ul>
            </>
          )}
        </div>
      </div>
      <figcaption>
        Illustrative transformation. Final content and format depend on the agreed project scope.
      </figcaption>
    </figure>
  )
}
