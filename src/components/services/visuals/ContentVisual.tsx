import type { VisualKind } from '@/config/service-design'
import { XmlConversionVisual } from './XmlConversionVisual'

export function ContentVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'xml') return <XmlConversionVisual />
  if (kind === 'editing')
    return (
      <div className="sv-editing">
        <span className="sv-meta">EDITORIAL STUDY / SAMPLE COPY</span>
        <h3>
          Meaning matters.
          <br />
          So does the detail.
        </h3>
        <p>
          The publication <del>bring</del> <ins>brings</ins> together ideas, context and a{' '}
          <mark>consistent editorial voice.</mark>
        </p>
        <div className="sv-editor-note">
          Subject–verb agreement
          <br />
          and consistency review
        </div>
        <div className="sv-lines" />
      </div>
    )
  if (kind === 'language' || kind === 'learning')
    return (
      <div className={`sv-language ${kind === 'learning' ? 'sv-learning' : ''}`}>
        <div className="sv-document">
          <span className="sv-meta">
            {kind === 'learning' ? 'SOURCE LESSON' : 'SOURCE CONTENT'}
          </span>
          <h3>
            Meaning.
            <br />
            Context.
            <br />
            Structure.
          </h3>
          <div className="sv-lines" />
        </div>
        <div className="sv-language-review">
          <span className="sv-meta">
            {kind === 'learning' ? 'LOCALIZED LESSON' : 'TARGET-LANGUAGE EDITION'}
          </span>
          <h3>
            Same purpose.
            <br />A new audience.
          </h3>
          <ul>
            <li>Language requirements</li>
            <li>Content context</li>
            <li>Layout &amp; format</li>
          </ul>
        </div>
      </div>
    )
  if (kind === 'accessibility')
    return (
      <div className="sv-access">
        <span className="sv-meta">ILLUSTRATIVE DOCUMENT STRUCTURE</span>
        <ol>
          <li>
            <b>H1</b>
            <span>Document title</span>
          </li>
          <li>
            <b>H2</b>
            <span>Section heading</span>
          </li>
          <li>
            <b>P</b>
            <span>Paragraph content</span>
          </li>
          <li>
            <b>FIG</b>
            <span>Image with a text alternative</span>
          </li>
        </ol>
        <p>Reading order follows the content hierarchy.</p>
      </div>
    )
  if (kind === 'index')
    return (
      <div className="sv-index">
        <span className="sv-meta">ILLUSTRATIVE SUBJECT INDEX</span>
        <h3>
          Find the
          <br />
          connection.
        </h3>
        <dl>
          <div>
            <dt>Content structure</dt>
            <dd>12, 24</dd>
          </div>
          <div>
            <dt>Editorial review</dt>
            <dd>18</dd>
          </div>
          <div>
            <dt>Publication layout</dt>
            <dd>32–38</dd>
          </div>
          <div>
            <dt>Typography</dt>
            <dd>35, 42</dd>
          </div>
        </dl>
        <p>Topics connected to their publication references.</p>
      </div>
    )
  return (
    <div className="sv-conversion">
      <div className="sv-document">
        <span className="sv-meta">SOURCE FORMAT</span>
        <h3>
          Content
          <br />
          to work with.
        </h3>
        <div className="sv-lines" />
      </div>
      <div className="sv-document sv-output">
        <span className="sv-meta">OUTPUT FORMAT</span>
        <h3>
          Structure
          <br />
          to build on.
        </h3>
        <ul>
          <li>Content</li>
          <li>Formatting</li>
          <li>Output requirements</li>
        </ul>
      </div>
    </div>
  )
}
