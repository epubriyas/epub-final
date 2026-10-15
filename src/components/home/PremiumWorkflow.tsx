'use client'

import { FileText, Layers3, ScanLine, Send, ArrowDownRight } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'
import type { HomeLandingContent } from '@/lib/landing-schema'

const stages = [
  {
    title: 'Prepare',
    caption: 'A clear starting point',
    icon: FileText,
    details: ['Manuscripts, media and source files', 'Your audience and output requirements'],
  },
  {
    title: 'Transform',
    caption: 'Expertise in motion',
    icon: Layers3,
    details: ['Editorial and language expertise', 'Publishing and digital production'],
  },
  {
    title: 'Review',
    caption: 'Attention to the details',
    icon: ScanLine,
    details: ['Content and format review', 'Agreed project requirements'],
  },
  {
    title: 'Deliver',
    caption: 'Ready for the next chapter',
    icon: Send,
    details: ['Your chosen delivery formats', 'Content for its next audience'],
  },
]

export function PremiumWorkflow({ steps }: { steps?: HomeLandingContent['workflow']['steps'] }) {
  const board = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = board.current
    if (!element) return
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.hp-process-card'))
    const measure = () => {
      if (cards.length !== 4) return
      const bounds = element.getBoundingClientRect()
      const points = cards.map((card) => {
        return { x: card.offsetLeft + card.offsetWidth / 2, y: card.offsetTop - 30 }
      })
      const [a, b, c, d] = points
      const bend = Math.min(64, bounds.width * 0.06)
      const path = [
        `M ${a.x} ${a.y}`,
        `C ${a.x + bend * 2} ${a.y - bend}, ${b.x - bend * 2} ${b.y + bend}, ${b.x} ${b.y}`,
        `C ${bounds.width + bend} ${b.y - bend}, ${bounds.width + bend} ${c.y + bend}, ${c.x} ${c.y}`,
        `C ${c.x - bend * 2} ${c.y - bend}, ${d.x + bend * 2} ${d.y + bend}, ${d.x} ${d.y}`,
      ].join(' ')
      const svg = element.querySelector('svg.hp-process-route')
      svg?.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height)
      svg?.querySelectorAll('path').forEach((line) => line.setAttribute('d', path))
      element.style.setProperty('--workflow-path', 'path("' + path + '")')
      element.querySelectorAll<HTMLElement>('.hp-checkpoint').forEach((node, index) => {
        node.style.left = points[index].x + 'px'
        node.style.top = points[index].y + 'px'
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    cards.forEach((card) => observer.observe(card))
    measure()
    const pointer = (event: PointerEvent) => {
      if (!matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        if (!inside) {
          card.style.removeProperty('transform')
          card.removeAttribute('data-lit')
          return
        }
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        card.style.setProperty('--light-x', x * 100 + '%')
        card.style.setProperty('--light-y', y * 100 + '%')
        card.style.transform =
          'perspective(1000px) rotateX(' +
          (1 - y * 2) +
          'deg) rotateY(' +
          (x * 2 - 1) +
          'deg) translateY(-4px)'
        card.dataset.lit = 'true'
      })
    }
    const reset = () =>
      cards.forEach((card) => {
        card.style.removeProperty('transform')
        card.removeAttribute('data-lit')
      })
    element.addEventListener('pointermove', pointer, { passive: true })
    element.addEventListener('pointerleave', reset)
    return () => {
      observer.disconnect()
      element.removeEventListener('pointermove', pointer)
      element.removeEventListener('pointerleave', reset)
    }
  }, [])
  const displayedStages = steps
    ? steps.map((step, i) => ({
        title: step.title,
        caption: '',
        details: [step.description],
        icon: stages[i % stages.length].icon,
      }))
    : stages
  return (
    <div className={`hp-process${steps ? ' hp-process-detailed' : ''}`} data-home-motion="process">
      <div className="hp-process-label">
        <ArrowDownRight size={18} aria-hidden="true" /> FROM SOURCE TO AUDIENCE
      </div>
      <div className="hp-process-board" ref={board}>
        <svg
          className="hp-process-route"
          viewBox="0 0 1000 720"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="hp-route-base"
            d="M270 50 C430 -10 530 110 730 50 C1060 -20 1060 470 730 400 C530 330 470 470 270 400"
          />
          <path
            className="hp-route-progress"
            pathLength="100"
            d="M270 50 C430 -10 530 110 730 50 C1060 -20 1060 470 730 400 C530 330 470 470 270 400"
          />
        </svg>
        <div className="hp-checkpoints" aria-hidden="true">
          {displayedStages.map((stage, i) => (
            <span
              key={stage.title}
              className="hp-checkpoint"
              style={{ '--stage': i } as CSSProperties}
            />
          ))}
        </div>
        <span className="hp-route-particle" aria-hidden="true" />
        <ol className="hp-process-cards" aria-label="Content production workflow">
          {displayedStages.map(({ title, caption, icon: Icon, details }, i) => (
            <li
              key={title}
              className="hp-process-card"
              data-home-motion="stage"
              style={{ '--stage': i } as CSSProperties}
            >
              <div className="hp-stage-top">
                <span className="hp-stage-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="hp-stage-icon">
                  <Icon size={24} strokeWidth={1.4} aria-hidden="true" />
                </span>
              </div>
              <h3>{title}</h3>
              {caption && <p className="hp-stage-caption">{caption}</p>}
              <ul>
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
      <p className="hp-process-foot">
        One connected workflow. <span>Shaped around your content.</span>
      </p>
    </div>
  )
}
