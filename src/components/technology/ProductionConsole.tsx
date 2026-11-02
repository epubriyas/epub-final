'use client'

import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  Braces,
  Check,
  CheckCheck,
  CircleDot,
  FileText,
  FolderInput,
  Layers3,
  PackageCheck,
  Pause,
  Play,
  ScanLine,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import styles from './ProductionConsole.module.css'

const stages = [
  {
    name: 'Intake',
    icon: FolderInput,
    title: 'Start with a clear source.',
    description: 'Bring the manuscript, assets and production requirements into one shared brief.',
    activity: 'Source package prepared',
    detail: 'Every output starts with an agreed specification.',
    label: 'SOURCE PACKAGE',
    items: [
      { title: 'Manuscript.docx', detail: 'Editorial source', type: 'DOCX' },
      {
        title: 'Figures & tables',
        detail: 'Supporting content',
        type: 'ASSETS',
      },
      {
        title: 'Production brief',
        detail: 'Formats · language · review criteria',
        type: 'BRIEF',
      },
    ],
  },
  {
    name: 'Transform',
    icon: Workflow,
    title: 'Give content its next form.',
    description:
      'Connect the agreed structure to the required publishing formats, with exceptions kept visible.',
    activity: 'Transformation route selected',
    detail: 'Production specialists guide the conversion approach.',
    label: 'TRANSFORMATION ROUTE',
    items: [
      {
        title: 'Content structure',
        detail: 'Headings · tables · references',
        type: 'MAP',
      },
      {
        title: 'Structured master',
        detail: 'Content and metadata relationships',
        type: 'XML',
      },
      {
        title: 'Digital edition',
        detail: 'Reading order and navigation',
        type: 'EPUB',
      },
    ],
  },
  {
    name: 'Review',
    icon: ShieldCheck,
    title: 'Put expertise at the checkpoint.',
    description:
      'Bring technical checks and specialist review together before an output moves forward.',
    activity: 'Review criteria in focus',
    detail: 'People remain accountable for the quality of the output.',
    label: 'REVIEW CHECKPOINTS',
    items: [
      {
        title: 'Content completeness',
        detail: 'Compare with the source',
        type: 'CHECK',
      },
      {
        title: 'Structure & navigation',
        detail: 'Review against the specification',
        type: 'CHECK',
      },
      {
        title: 'Specialist approval',
        detail: 'Resolve exceptions before handoff',
        type: 'REVIEW',
      },
    ],
  },
  {
    name: 'Deliver',
    icon: PackageCheck,
    title: 'Make the handoff clear.',
    description:
      'Organize the agreed files, review notes and delivery context into a defined final package.',
    activity: 'Delivery package illustrated',
    detail: 'A considered handoff closes the production loop.',
    label: 'DELIVERY PACKAGE',
    items: [
      {
        title: 'Publication.epub',
        detail: 'Digital reading edition',
        type: 'EPUB',
      },
      {
        title: 'Structured-content.xml',
        detail: 'Reusable content master',
        type: 'XML',
      },
      {
        title: 'Delivery notes',
        detail: 'Scope, checks and handoff context',
        type: 'NOTES',
      },
    ],
  },
] as const

const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
const getReducedMotion = () => window.matchMedia(motionQuery).matches
const getServerMotion = () => true

export function ProductionConsole({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, getServerMotion)
  const running = playing && !reducedMotion
  const panelId = useId()
  const current = stages[active]

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setActive((value) => (value + 1) % stages.length), 4000)
    return () => window.clearInterval(timer)
  }, [running])

  return (
    <div className={`${styles.console} ${compact ? styles.compact : ''}`} data-running={running}>
      <div className={styles.toolbar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Layers3 size={17} aria-hidden="true" />
          </span>
          <span>
            Production <strong>OS</strong>
          </span>
          <span className={styles.version}>CONCEPT</span>
        </div>
        <span className={styles.environment}>
          <span />
          Internal initiative
        </span>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="Illustrative workspace">
          <span className={styles.sidebarLabel}>WORKSPACE</span>
          <div className={styles.sidebarActive}>
            <Layers3 size={15} aria-hidden="true" /> Production flow
          </div>
          <div>
            <FileText size={15} aria-hidden="true" /> Source library
          </div>
          <div>
            <ShieldCheck size={15} aria-hidden="true" /> Review criteria
          </div>
          <div>
            <ArrowDownToLine size={15} aria-hidden="true" /> Deliverables
          </div>
          <div className={styles.sidebarBottom}>
            <span className={styles.teamAvatar}>ET</span>
            <span>
              EPUBTRANS
              <br />
              <small>Production & development</small>
            </span>
          </div>
        </aside>

        <div className={styles.canvas}>
          <div className={styles.canvasHeading}>
            <div>
              <span className={styles.eyebrow}>ILLUSTRATIVE WORKFLOW</span>
              <h3>Content, in motion.</h3>
            </div>
            <button
              type="button"
              className={styles.playButton}
              onClick={() => setPlaying((value) => !value)}
              disabled={reducedMotion}
              aria-pressed={running}
              title={
                reducedMotion
                  ? 'Automatic playback is off for reduced motion. Select a stage below.'
                  : undefined
              }
            >
              {running ? (
                <Pause size={13} aria-hidden="true" />
              ) : (
                <Play size={13} aria-hidden="true" />
              )}
              <span>{running ? 'Pause' : 'Play workflow'}</span>
            </button>
          </div>

          <div className={styles.stages} role="group" aria-label="Explore the production workflow">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              return (
                <button
                  key={stage.name}
                  type="button"
                  className={`${styles.stage} ${active === index ? styles.activeStage : ''}`}
                  aria-pressed={active === index}
                  aria-controls={panelId}
                  onClick={() => {
                    setPlaying(false)
                    setActive(index)
                  }}
                >
                  <span className={styles.stageIcon}>
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className={styles.stageName}>{stage.name}</span>
                  <span className={styles.stageNumber}>0{index + 1}</span>
                </button>
              )
            })}
          </div>

          <div
            id={panelId}
            className={styles.detailPanel}
            aria-live={running ? 'off' : 'polite'}
            aria-atomic="true"
          >
            <div key={current.name} className={styles.panelContent}>
              <div className={styles.panelIntro}>
                <span className={styles.eyebrow}>{current.label}</span>
                <h4>{current.title}</h4>
                <p>{current.description}</p>
              </div>
              <div className={styles.fileList}>
                {current.items.map((item, index) => (
                  <div className={styles.file} key={item.title}>
                    <span className={styles.fileIcon}>
                      {active === 2 ? (
                        <CheckCheck size={18} aria-hidden="true" />
                      ) : item.type === 'XML' ? (
                        <Braces size={18} aria-hidden="true" />
                      ) : (
                        <FileText size={18} aria-hidden="true" />
                      )}
                    </span>
                    <span className={styles.fileText}>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </span>
                    <span
                      className={`${styles.fileType} ${active === 2 && index === 2 ? styles.reviewType : ''}`}
                    >
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.processingStrip}>
                <span className={styles.processor}>
                  <ScanLine size={18} aria-hidden="true" />
                </span>
                <div>
                  <span className={styles.eyebrow}>HUMAN EXPERTISE + TECHNOLOGY</span>
                  <p>{current.detail}</p>
                </div>
                <ArrowRight size={17} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className={styles.consoleFooter}>
            <span>
              <CircleDot size={12} aria-hidden="true" />
              {current.activity}
            </span>
            <span className={styles.sequence}>
              <Check size={12} aria-hidden="true" />
              {String(active + 1).padStart(2, '0')} / 04
            </span>
          </div>
        </div>
      </div>
      <div className={styles.disclaimer}>
        <span className={styles.conceptDot} />
        Concept demonstration · In development · Sample content
      </div>
    </div>
  )
}
