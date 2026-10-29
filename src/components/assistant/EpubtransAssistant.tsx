'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { ArrowUp, ArrowUpRight, MessageCircle, RotateCcw, Square, X } from 'lucide-react'
import Image from 'next/image'
import Link from '@/components/i18n/LocalizedLink'
import type { AssistantReply } from '@/lib/assistant'
import { companyWhatsApp } from '@/config/contact'
import { serviceSlugForPath } from '@/config/service-paths'

type Message = AssistantReply & { id: number; role: 'assistant' | 'user' }
function AssistantText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const parts = text.split(/(\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, index) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link?.[2] === companyWhatsApp.href)
          return (
            <a key={index} href={companyWhatsApp.href} target="_blank" rel="noopener noreferrer">
              {link[1]}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )
        if (
          link &&
          (serviceSlugForPath(link[2]) ||
            /^\/(services(?:\/[a-z0-9-]+)?|resources|work|company(?:\/careers)?|contact-us|get-a-quote)$/.test(
              link[2],
            ))
        )
          return (
            <Link key={index} href={link[2]} onClick={onNavigate}>
              {link[1]}
            </Link>
          )
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={index}>{part.slice(2, -2)}</strong>
        return <span key={index}>{link ? link[1] : part}</span>
      })}
    </>
  )
}
const welcome: Message = {
  id: 0,
  role: 'assistant',
  text: 'Welcome to EPUBTRANS. I can help you explore our services or prepare a project enquiry. How can I assist?',
}
const suggestions = ['Explore our services', 'Plan a translation project', 'Request a quote']
function AssistantBrandMark() {
  return (
    <span className="et-assistant-brandmark" aria-hidden="true">
      <Image src="/favicon.jpeg" alt="" width={941} height={150} sizes="240px" />
    </span>
  )
}
export function EpubtransAssistant({ email, phone }: { email: string; phone: string }) {
  const [launcherCompact, setLauncherCompact] = useState(false)
  const [hoverReplay, setHoverReplay] = useState(false)
  const hoverReplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => setLauncherCompact(true), 5000)
    return () => {
      window.clearTimeout(timer)
      if (hoverReplayTimer.current) clearTimeout(hoverReplayTimer.current)
    }
  }, [])
  const pathname = usePathname()
  const [dock, setDock] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDock(document.getElementById('project-assistant-dock'))
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])
  const dialog = useRef<HTMLDialogElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const conversation = useRef<HTMLDivElement>(null)
  const followLatest = useRef(true)
  const [open, setOpen] = useState(false)

  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>([welcome])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)
  const nextId = useRef(1)
  const close = () => {
    dialog.current?.close()
    setOpen(false)
    launcher.current?.focus()
  }
  useEffect(() => {
    if (open && conversation.current && followLatest.current)
      conversation.current.scrollTop = messages.length === 1 ? 0 : conversation.current.scrollHeight
  }, [messages, open])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const viewport = window.visualViewport
    let frame = 0
    const resize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (dialog.current)
          dialog.current.dataset.compact = String((viewport?.height || window.innerHeight) <= 520)
        dialog.current?.style.setProperty(
          '--assistant-viewport-height',
          `${viewport?.height || window.innerHeight}px`,
        )
        dialog.current?.style.setProperty(
          '--assistant-viewport-top',
          `${viewport?.offsetTop || 0}px`,
        )
        if (followLatest.current && conversation.current && messages.length > 1)
          conversation.current.scrollTop = conversation.current.scrollHeight
      })
    }
    resize()
    viewport?.addEventListener('resize', resize)
    viewport?.addEventListener('scroll', resize)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      viewport?.removeEventListener('resize', resize)
      viewport?.removeEventListener('scroll', resize)
      window.removeEventListener('resize', resize)
      document.body.style.overflow = previousOverflow
    }
  }, [open, messages.length])
  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (!input.current) return
    input.current.style.height = 'auto'
    input.current.style.height = `${Math.min(input.current.scrollHeight, 104)}px`
  }, [draft, open])
  const send = async (value: string, retry = false) => {
    const text = value.trim().slice(0, 2000)
    if (!text || request.current) return
    followLatest.current = true
    const previous = retry ? messages.slice(0, -1) : messages
    const userId = nextId.current++,
      replyId = nextId.current++
    const next: Message[] = [...previous, { id: userId, role: 'user', text }]
    const history = next.filter((message) => message.id !== 0 && message.text.trim()).slice(-20)
    while (history.reduce((sum, message) => sum + message.text.length, 0) > 12000) history.shift()
    setMessages([...next, { id: replyId, role: 'assistant' as const, text: '' }].slice(-41))
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    setDraft('')
    input.current?.focus()
    let complete = false,
      responseText = ''
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((message) => ({
            role: message.role,
            content: message.text.slice(0, 2000),
          })),
        }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(
          typeof result.error === 'string' ? result.error : 'Unable to connect. Please try again.',
        )
      }
      if (!response.body) throw new Error('Unable to receive the reply. Please try again.')
      const reader = response.body.getReader(),
        decoder = new TextDecoder()
      let buffer = ''
      try {
        for (;;) {
          const { value, done } = await reader.read()
          if (controller.signal.aborted) return
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          if (done && buffer) lines.push(buffer)
          for (const line of lines) {
            if (!line.trim()) continue
            const event = JSON.parse(line) as { type: string; text?: string; error?: string }
            if (event.type === 'error') throw new Error(event.error || 'The reply was interrupted.')
            if (event.type === 'done') complete = true
            if (event.type === 'delta' && typeof event.text === 'string') {
              responseText += event.text
              setMessages((current) =>
                current.map((message) =>
                  message.id === replyId ? { ...message, text: responseText } : message,
                ),
              )
            }
          }
          if (done) break
        }
      } finally {
        await reader.cancel().catch(() => {})
        reader.releaseLock()
      }
      if (!complete || !responseText.trim())
        throw new Error('The reply was interrupted. Please try again.')
    } catch (reason) {
      if (!controller.signal.aborted) {
        setMessages(next.slice(-40))
        setError(reason instanceof Error ? reason.message : 'Unable to connect. Please try again.')
      }
    } finally {
      if (request.current === controller) {
        if (controller.signal.aborted && !responseText)
          setMessages((current) => current.filter((message) => message.id !== replyId))
        request.current = null
        setPending(false)
      }
    }
  }
  const launcherButton = (
    <button
      type="button"
      ref={launcher}
      className="et-assistant-launcher et-assistant-launcher-pill"
      data-compact={launcherCompact && !dock ? 'true' : 'false'}
      data-replay={hoverReplay && !dock ? 'true' : 'false'}
      onPointerEnter={(event) => {
        if (!launcherCompact || dock || event.pointerType !== 'mouse') return
        if (hoverReplayTimer.current) clearTimeout(hoverReplayTimer.current)
        setHoverReplay(true)
        hoverReplayTimer.current = setTimeout(() => setHoverReplay(false), 4000)
      }}
      onPointerLeave={() => {
        if (hoverReplayTimer.current) clearTimeout(hoverReplayTimer.current)
        setHoverReplay(false)
      }}
      aria-label="Open EPUBTRANS assistant"
      title="AI assistant"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="epubtrans-assistant"
      onClick={() => {
        dialog.current?.showModal()
        followLatest.current = true
        setOpen(true)
        if (window.matchMedia('(min-width: 601px) and (pointer: fine)').matches)
          input.current?.focus()
        else dialog.current?.focus({ preventScroll: true })
      }}
    >
      <span className="et-assistant-compact-symbol" aria-hidden="true">
        <AssistantBrandMark />
        <span className="et-assistant-compact-label">AI assistant</span>
      </span>
      <span className="et-assistant-launcher-copy">
        <span className="et-assistant-logo-reveal" aria-hidden="true">
          <AssistantBrandMark />
          <span className="et-assistant-wordmark">
            <Image src="/favicon.jpeg" alt="" width={941} height={150} sizes="160px" />
          </span>
        </span>
        <small>
          <span className="et-assistant-ai-dot" aria-hidden="true" />
          Ask our AI assistant
        </small>
      </span>
      <ArrowUpRight className="et-assistant-launcher-arrow" size={16} aria-hidden="true" />
    </button>
  )
  return (
    <div className="et-assistant" data-no-translate>
      {dock ? createPortal(launcherButton, dock) : launcherButton}
      <dialog
        ref={dialog}
        id="epubtrans-assistant"
        className="et-assistant-panel"
        tabIndex={-1}
        aria-labelledby="assistant-title"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const rect = dialog.current.getBoundingClientRect()
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              close()
          }
        }}
      >
        <div className="et-assistant-shell">
          <header className="et-assistant-heading">
            <div className="et-assistant-heading-top">
              <span className="et-assistant-eyebrow">EPUBTRANS / ASSISTANT</span>
              <div>
                <button
                  type="button"
                  aria-label="Start a new conversation"
                  onClick={() => {
                    setMessages([welcome])
                    followLatest.current = true
                    request.current?.abort()
                    request.current = null
                    setPending(false)
                    setError('')
                    setDraft('')
                    input.current?.focus()
                  }}
                >
                  <RotateCcw size={16} />
                </button>
                <button type="button" aria-label="Close assistant" onClick={close}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <h2 id="assistant-title">How can we help?</h2>
            <div className="et-assistant-heading-meta">
              <p>
                <span aria-hidden="true" /> AI project guidance
              </p>
              <a
                href={companyWhatsApp.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Message our team: ${companyWhatsApp.number}`}
                aria-label="Message EPUBTRANS on WhatsApp (opens in a new tab)"
              >
                <MessageCircle size={13} aria-hidden="true" /> WhatsApp{' '}
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </div>
          </header>
          <div
            className="et-assistant-conversation"
            ref={conversation}
            onScroll={() => {
              const element = conversation.current
              if (element)
                followLatest.current =
                  element.scrollHeight - element.scrollTop - element.clientHeight < 64
            }}
          >
            <div
              role="log"
              aria-label="Conversation"
              aria-live="polite"
              aria-relevant="additions text"
              aria-busy={pending}
              data-private
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`et-assistant-message et-assistant-message-${message.role}`}
                >
                  <div className="et-assistant-message-heading">
                    {message.role === 'assistant' && (
                      <span className="et-assistant-reply-brand">
                        <AssistantBrandMark />
                      </span>
                    )}
                    <span className="et-assistant-message-label">
                      {message.role === 'assistant' ? 'EPUBTRANS' : 'You'}
                    </span>
                    {message.role === 'assistant' && (
                      <span className="et-assistant-ai-label">AI</span>
                    )}
                  </div>
                  <p>
                    {message.role === 'assistant' ? (
                      message.text ? (
                        <AssistantText text={message.text} onNavigate={close} />
                      ) : (
                        <span className="et-assistant-writing">Writing a reply…</span>
                      )
                    ) : (
                      message.text
                    )}
                  </p>
                  {!!message.links?.length && (
                    <div className="et-assistant-links">
                      {message.links.map((link) => (
                        <Link key={link.href} href={link.href} onClick={close}>
                          {link.label}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {messages.length === 1 && (
              <div className="et-assistant-suggestions">
                <p>CHOOSE A STARTING POINT</p>
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => send(suggestion)}>
                    {suggestion}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            {error && (
              <div className="et-assistant-error" role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => void send(messages[messages.length - 1].text, true)}
                >
                  Try again
                </button>
              </div>
            )}
          </div>
          <form
            className="et-assistant-composer"
            onSubmit={(event) => {
              event.preventDefault()
              send(draft)
            }}
          >
            <label htmlFor="assistant-message" className="sr-only">
              Your message
            </label>
            <div className="et-assistant-inputbox">
              <textarea
                ref={input}
                id="assistant-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={2000}
                rows={1}
                placeholder="Ask EPUBTRANS…"
                autoComplete="off"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    if (!pending) void send(draft)
                  }
                }}
              />
              <div className="et-assistant-input-actions">
                <span>Enter to send · Shift + Enter for a new line</span>
                <button
                  type="submit"
                  aria-label={pending ? 'Stop reply' : 'Send message'}
                  disabled={!pending && !draft.trim()}
                  title={pending ? 'Stop reply' : 'Send message'}
                  onClick={(event) => {
                    if (pending) {
                      event.preventDefault()
                      request.current?.abort()
                    }
                  }}
                >
                  {pending ? (
                    <Square size={15} aria-hidden="true" />
                  ) : (
                    <ArrowUp size={20} strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <p>
              AI replies may be inaccurate. Avoid confidential details.
              {(email || phone) && (
                <span className="et-assistant-contact-links">
                  {email && <a href={`mailto:${email}`}>Email our team</a>}
                  {email && phone && <span aria-hidden="true">·</span>}
                  {phone && <a href={`tel:${phone.replace(/[^+0-9]/g, '')}`}>Call us</a>}
                </span>
              )}
            </p>
          </form>
        </div>
      </dialog>
    </div>
  )
}
