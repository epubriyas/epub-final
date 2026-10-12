'use client'

import { useEffect, useState } from 'react'
import { Captions, Play, Pause, RotateCcw, FileText, ListTree, Eye } from 'lucide-react'
import styles from './service-study.module.css'

const cues = [
  { time: '00:00 → 00:03', text: 'Every idea begins with a clear purpose.' },
  { time: '00:03 → 00:06', text: 'Language gives it a way to travel.' },
  { time: '00:06 → 00:09', text: 'Good timing makes the story easier to follow.' },
]

export function SubtitleStudy() {
  const [cue, setCue] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setReduced(preference.matches)
      if (preference.matches) setPlaying(false)
    }
    sync()
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      if (cue === cues.length - 1) setPlaying(false)
      else setCue(cue + 1)
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [playing, cue])
  return (
    <figure className={styles.study}>
      <figcaption>
        <Captions size={20} aria-hidden="true" />
        <span>SUBTITLES / AN ILLUSTRATIVE SEQUENCE</span>
      </figcaption>
      <div className={styles.screen}>
        <div className={styles.scene} aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
        <span className={styles.sceneLabel}>SCENE {String(cue + 1).padStart(2, '0')}</span>
        <p className={styles.subtitle}>{cues[cue].text}</p>
      </div>
      <div className={styles.playback}>
        <button
          type="button"
          onClick={() => {
            if (!playing && cue === 2) setCue(0)
            setPlaying(!playing)
          }}
          disabled={reduced}
          aria-label={playing ? 'Pause subtitle sequence' : 'Play subtitle sequence'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          type="button"
          onClick={() => {
            setCue(0)
            setPlaying(false)
          }}
          aria-label="Reset subtitle sequence"
        >
          <RotateCcw size={17} />
        </button>
        <span>{cues[cue].time}</span>
        <span className={styles.cc}>CC</span>
      </div>
      <div className={styles.cues} role="group" aria-label="Choose a subtitle cue">
        {cues.map((item, index) => (
          <button
            key={item.time}
            type="button"
            aria-pressed={cue === index}
            onClick={() => {
              setPlaying(false)
              setCue(index)
            }}
          >
            <span>{item.time}</span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
      <p className={styles.note}>
        {reduced ? 'Choose a cue to explore the sequence without motion. ' : ''}Sample captions show
        how words are grouped and timed. Final timing, line breaks and delivery formats depend on
        your brief.
      </p>
    </figure>
  )
}

const modes = [
  { key: 'visual', label: 'Visual layout', icon: Eye },
  { key: 'structure', label: 'Reading order', icon: ListTree },
  { key: 'text', label: 'Text alternative', icon: FileText },
] as const
export function AccessibilityStudy() {
  const [mode, setMode] = useState<(typeof modes)[number]['key']>('visual')
  return (
    <figure className={styles.study}>
      <figcaption>
        <ListTree size={20} aria-hidden="true" />
        <span>ONE MESSAGE / DIFFERENT WAYS TO READ</span>
      </figcaption>
      <div className={styles.modes} role="group" aria-label="Choose a content reading view">
        {modes.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}>
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className={styles.readingView}>
        {mode === 'visual' ? (
          <div>
            <span className={styles.kicker}>SAMPLE LEARNING PAGE</span>
            <h3>Prepare your next edition.</h3>
            <div className={styles.sampleGraphic} aria-hidden="true">
              <span>Source</span>
              <span>Review</span>
              <span>Edition</span>
            </div>
            <p>
              Start with your source content, review it against the brief, then prepare the final
              edition.
            </p>
          </div>
        ) : mode === 'structure' ? (
          <div>
            <span className={styles.kicker}>SAME CONTENT / EXPLICIT ORDER</span>
            <h3>Reading order matters.</h3>
            <ol className={styles.readingOrder}>
              <li>
                <span>01</span>Heading: Prepare your next edition.
              </li>
              <li>
                <span>02</span>Diagram: Source → Review → Edition.
              </li>
              <li>
                <span>03</span>Explanation: Start with the source, review against the brief and
                prepare the edition.
              </li>
            </ol>
          </div>
        ) : (
          <div>
            <span className={styles.kicker}>SAME MESSAGE / WRITTEN DESCRIPTION</span>
            <h3>A useful text alternative.</h3>
            <p>
              The diagram shows three stages in sequence: source content, review against the project
              brief, and preparation of the final edition.
            </p>
            <p>Describing the meaning of a visual helps communicate the information it carries.</p>
          </div>
        )}
      </div>
      <p className={styles.note}>
        This study explains content decisions. Project-specific accessibility requirements and
        validation are agreed separately.
      </p>
    </figure>
  )
}
