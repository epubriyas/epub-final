'use client'

import Link from '@/components/i18n/LocalizedLink'
import { useRef, useState } from 'react'
import { enquiryTypes, validateContact, type ContactData } from '@/lib/validation/quote'
import { FieldFeedback } from './FieldFeedback'

const initial: ContactData = {
  name: '',
  email: '',
  organization: '',
  inquiryType: '',
  message: '',
  website: '',
}

export function ContactForm() {
  const [data, setData] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('')
  const pendingRef = useRef(false)
  const submissionKey = useRef(crypto.randomUUID())
  const update = (key: keyof ContactData, value: string) =>
    setData((current) => ({ ...current, [key]: value }))

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingRef.current || accepted) return
    const issues = validateContact(data)
    setErrors(issues)
    setMessage('')
    if (Object.keys(issues).length) {
      setMessage('Please check the highlighted fields.')
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }
    if (data.website) return
    pendingRef.current = true
    setPending(true)
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.name,
          business_email: data.email,
          organization: data.organization,
          inquiry_type: data.inquiryType,
          message: data.message,
          website: data.website,
          submission_key: submissionKey.current,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        setErrors(result.errors || {})
        setMessage(result.error || "We couldn't submit your enquiry. Please try again.")
        requestAnimationFrame(() =>
          document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        )
        return
      }
      setAccepted(true)
    } catch {
      setMessage("We couldn't submit your enquiry. Please try again.")
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  if (accepted)
    return (
      <div className="et-enquiry-success" role="status" aria-live="polite">
        <p className="et-label">Thank you for contacting EPUBTRANS.</p>
        <p>
          Your enquiry has been submitted. Our team will review your message and follow up using the
          contact information provided.
        </p>
      </div>
    )

  return (
    <form className="et-enquiry-form" onSubmit={submit} noValidate>
      <div className="et-enquiry-form-grid">
        <div className="et-field">
          <label htmlFor="contact-name">Your Name *</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            value={data.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          <FieldFeedback id="contact-name-error" message={errors.name} />
        </div>
        <div className="et-field">
          <label htmlFor="contact-email">Business Email *</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={data.email}
            onChange={(event) => update('email', event.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          <FieldFeedback id="contact-email-error" message={errors.email} />
        </div>
        <div className="et-field">
          <label htmlFor="contact-organization">Company / Organization</label>
          <input
            id="contact-organization"
            name="organization"
            autoComplete="organization"
            maxLength={200}
            value={data.organization}
            onChange={(event) => update('organization', event.target.value)}
            aria-invalid={!!errors.organization}
            aria-describedby={errors.organization ? 'contact-organization-error' : undefined}
          />
          <FieldFeedback id="contact-organization-error" message={errors.organization} />
        </div>
        <div className="et-field">
          <label htmlFor="contact-inquiry-type">Enquiry Type *</label>
          <select
            id="contact-inquiry-type"
            name="inquiryType"
            required
            value={data.inquiryType}
            onChange={(event) => update('inquiryType', event.target.value)}
            aria-invalid={!!errors.inquiryType}
            aria-describedby={errors.inquiryType ? 'contact-type-error' : undefined}
          >
            <option value="">Select an enquiry type</option>
            {enquiryTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <FieldFeedback id="contact-type-error" message={errors.inquiryType} />
        </div>
      </div>
      <div className="et-field">
        <label htmlFor="contact-message">Your Message *</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          value={data.message}
          onChange={(event) => update('message', event.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        <FieldFeedback id="contact-message-error" message={errors.message} />
      </div>
      <div className="et-field et-enquiry-privacy">
        <Link href="/privacy-policy">Privacy information</Link>
      </div>
      <div className="et-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(event) => update('website', event.target.value)}
        />
      </div>
      <p className="et-form-message" role="alert">
        {message}
      </p>
      <button type="submit" className="et-button" disabled={pending}>
        {pending ? 'Sending…' : 'Send Enquiry'}
      </button>
    </form>
  )
}
