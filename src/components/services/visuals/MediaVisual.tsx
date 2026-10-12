export function MediaVisual({
  subtitles,
  transcription,
}: {
  subtitles?: boolean
  transcription?: boolean
}) {
  return (
    <div className="sv-media">
      <span className="sv-meta">ILLUSTRATIVE {subtitles ? 'SUBTITLE' : 'AUDIO'} STUDY</span>
      <h3>
        {subtitles ? (
          <>
            Language.
            <br />
            In time with the scene.
          </>
        ) : transcription ? (
          <>
            Spoken words.
            <br />
            Written structure.
          </>
        ) : (
          <>
            A script.
            <br />A spoken dimension.
          </>
        )}
      </h3>
      <div className="sv-wave" aria-hidden="true">
        {Array.from({ length: 32 }, (_, i) => (
          <i key={i} style={{ height: `${18 + ((i * 17 + 11) % 64)}%` }} />
        ))}
      </div>
      <div className="sv-transcript">
        <span className="sv-meta">
          {subtitles
            ? '00:00:04 → 00:00:08'
            : transcription
              ? 'SAMPLE TRANSCRIPT'
              : 'SAMPLE SCRIPT'}
        </span>
        <p>Every story begins with a clear idea.</p>
      </div>
    </div>
  )
}
