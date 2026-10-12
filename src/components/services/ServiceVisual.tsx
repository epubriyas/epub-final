import type { ServiceDesign } from '@/config/service-design'
import { PublicationVisual } from './visuals/PublicationVisual'
import { ContentVisual } from './visuals/ContentVisual'
import { MediaVisual } from './visuals/MediaVisual'

export function ServiceVisual({ design, slug }: { design: ServiceDesign; slug: string }) {
  return (
    <figure className={`sv-stage sv-stage-${design.kind}`}>
      {['layout', 'reader', 'design'].includes(design.kind) ? (
        <PublicationVisual kind={design.kind} />
      ) : ['audio', 'subtitles'].includes(design.kind) ? (
        <MediaVisual
          subtitles={design.kind === 'subtitles'}
          transcription={slug === 'transcription'}
        />
      ) : (
        <ContentVisual kind={design.kind} />
      )}
      <figcaption>
        Illustrative study / {design.source} → {design.output}
      </figcaption>
    </figure>
  )
}
