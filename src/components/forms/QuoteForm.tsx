'use client'

import { useRef, useState } from 'react'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight, ArrowLeft, Check, BriefcaseBusiness, Upload, X } from 'lucide-react'
import {
  quoteServiceOptions,
  quoteServices,
  validateQuote,
  type QuoteData,
} from '@/lib/validation/quote'

import { quoteUploadAccept, validateQuoteFiles } from '@/lib/quote-uploads'
import { FieldFeedback } from './FieldFeedback'

const steps = ['Service', 'Project Requirements', 'Contact Details', 'Review']
const initial: QuoteData = {
  service: '',
  sourceLanguage: '',
  targetLanguages: '',
  languages: '',
  countryRegion: '',
  sourceFileFormat: '',
  targetOutputFormat: '',
  approximateVolume: '',
  additionalRequirements: '',
  details: '',
  deadline: '',
  name: '',
  email: '',
  company: '',
  website: '',
}

export function QuoteForm({ initialService = '' }: { initialService?: string }) {
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [step, setStep] = useState(0)
  const [data, setData] = useState(() => ({
    ...initial,
    service: quoteServices.some((value) => value === initialService) ? initialService : '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [accepted, setAccepted] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const submitting = useRef(false)
  const submissionKey = useRef(crypto.randomUUID())
  const machineKeys: Partial<Record<keyof QuoteData, string>> = {
    name: 'full_name',
    email: 'business_email',
    company: 'organization',
    service: 'service_required',
    details: 'project_description',
    countryRegion: 'country_region',
    sourceFileFormat: 'source_file_format',
    targetOutputFormat: 'target_output_format',
    approximateVolume: 'approximate_volume',
    languages: 'languages',
    deadline: 'preferred_delivery_date',
    additionalRequirements: 'additional_requirements',
  }
  const update = (key: keyof QuoteData, value: string) =>
    setData((current) => ({ ...current, [key]: value }))
  const go = (next: number) => {
    setStep(next)
    setMessage('')
    requestAnimationFrame(() => heading.current?.focus())
  }
  const fieldsByStep = [['service'], ['details'], ['name', 'email', 'company'], []]
  const validateStep = (target: number) => {
    const all = validateQuote(data)
    const relevant = Object.fromEntries(
      Object.entries(all).filter(([key]) => fieldsByStep[target].includes(key)),
    )
    setErrors(relevant)
    if (Object.keys(relevant).length) {
      setMessage('Please check the highlighted fields.')
      requestAnimationFrame(() => {
        const field = relevant.service
          ? document.querySelector<HTMLElement>('input[name="service_required"]')
          : document.querySelector<HTMLElement>('[aria-invalid="true"]')
        field?.focus()
      })
      return false
    }
    return true
  }

  const input = (
    key: keyof QuoteData,
    label: string,
    type = 'text',
    required = false,
    maxLength = 500,
  ) => (
    <div className="et-field">
      <label htmlFor={`quote-${key}`}>
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={`quote-${key}`}
        name={machineKeys[key] || key}
        type={type}
        required={required}
        value={data[key]}
        maxLength={maxLength}
        onChange={(event) => update(key, event.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `quote-${key}-error` : undefined}
        autoComplete={
          key === 'name'
            ? 'name'
            : key === 'email'
              ? 'email'
              : key === 'company'
                ? 'organization'
                : 'off'
        }
      />
      <FieldFeedback id={`quote-${key}-error`} message={errors[key]} />
    </div>
  )

  async function submit() {
    if (submitting.current || accepted) return
    const issues = validateQuote(data)
    setErrors(issues)
    if (Object.keys(issues).length) {
      setMessage('Please check the highlighted fields.')
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }
    submitting.current = true
    setPending(true)
    setMessage('')
    const form = new FormData()
    Object.entries(data).forEach(([key, value]) =>
      form.set(machineKeys[key as keyof QuoteData] || key, value),
    )
    form.set('project_description', JSON.stringify(data.details))
    form.set('detailsEncoding', 'json')
    form.set('submission_key', submissionKey.current)
    form.set('website', data.website)
    files.forEach((file) => form.append('files', file))
    try {
      const response = await fetch('/api/quote', { method: 'POST', body: form })
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
      submitting.current = false
      setPending(false)
    }
  }

  if (accepted)
    return (
      <section className="et-quote-success" aria-live="polite" role="status">
        <Check size={40} aria-hidden="true" />
        <h2>Your project enquiry has been submitted.</h2>
        <p>Thank you for sharing your requirements with EPUBTRANS.</p>
        <p>
          Our team will review the information provided and contact you if further details or sample
          files are needed to assess the project.
        </p>
        <Link className="et-text-link" href="/services">
          Explore Our Services <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    )

  return (
    <div className="et-quote-layout">
      <aside aria-label="Project enquiry form progress">
        <p className="et-label">
          YOUR PROJECT / {String(step + 1).padStart(2, '0')} OF{' '}
          {String(steps.length).padStart(2, '0')}
        </p>
        <ol className="et-quote-progress">
          {steps.map((item, index) => (
            <li key={item} aria-current={index === step ? 'step' : undefined}>
              {index < step ? (
                <button
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`Return to ${item} step`}
                >
                  <span className="et-quote-step-number" aria-hidden="true">
                    <Check size={12} />
                  </span>
                  <span className="et-quote-step-label">{item}</span>
                </button>
              ) : (
                <>
                  <span className="et-quote-step-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="et-quote-step-label">{item}</span>
                </>
              )}
            </li>
          ))}
        </ol>
        <div className="qp-sidebar-note">
          <BriefcaseBusiness size={20} aria-hidden="true" />
          <h3>Share Your Project Requirements</h3>
          <p>Source formats, production scope and delivery expectations, in one clear brief.</p>
          <Link href="/contact-us">
            Prefer a conversation? <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div id="project-assistant-dock" className="et-assistant-dock" data-no-translate />
      </aside>
      <form
        className="et-quote-panel"
        onSubmit={(event) => {
          event.preventDefault()
          if (step < steps.length - 1) {
            if (validateStep(step)) go(step + 1)
          } else void submit()
        }}
        noValidate
      >
        <p className="et-label">{steps[step]}</p>
        <h2 ref={heading} tabIndex={-1}>
          {steps[step] === 'Service'
            ? 'Choose the Service You Need'
            : steps[step] === 'Project Requirements'
              ? 'Project Requirements'
              : steps[step] === 'Contact Details'
                ? 'Your Contact Details'
                : 'Review your project enquiry.'}
        </h2>

        {step === 0 && (
          <fieldset>
            <legend className="sr-only">Service Required *</legend>
            <p className="et-form-help" id="quote-service-help">
              Choose the service that best fits your project. Not sure? Select Multiple Services /
              Not Sure.
            </p>
            <div
              className="qp-service-grid"
              role="radiogroup"
              aria-label="Service Required"
              aria-invalid={!!errors.service}
              aria-describedby={errors.service ? 'quote-service-error' : 'quote-service-help'}
            >
              {quoteServiceOptions.map(({ value, label }) => (
                <label
                  className="qp-service-option"
                  key={value}
                  data-selected={data.service === value}
                >
                  <input
                    type="radio"
                    name="service_required"
                    value={value}
                    checked={data.service === value}
                    onChange={() => update('service', value)}
                    required
                    aria-describedby={errors.service ? 'quote-service-error' : 'quote-service-help'}
                  />
                  <span>{label}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </label>
              ))}
            </div>
            <FieldFeedback id="quote-service-error" message={errors.service} />
          </fieldset>
        )}

        {step === 1 && (
          <>
            <div className="et-field">
              <label htmlFor="quote-details">Project Description *</label>
              <textarea
                id="quote-details"
                name="details"
                required
                rows={6}
                maxLength={5000}
                value={data.details}
                onChange={(event) => update('details', event.target.value)}
                aria-invalid={!!errors.details}
                aria-describedby={errors.details ? 'quote-details-error' : 'quote-details-help'}
              />
              <FieldFeedback id="quote-details-error" message={errors.details} />
              <p id="quote-details-help" className="et-form-help">
                Please provide a short description of the work. You do not need to have every
                technical detail finalized before contacting us.
              </p>
            </div>
            <div className="et-enquiry-form-grid">
              {input('sourceFileFormat', 'Source File Format')}
              {input('targetOutputFormat', 'Required Output Format')}
              {input('approximateVolume', 'Approximate Volume (for example, page count)')}
              {input('languages', 'Source and Target Languages, if applicable')}
              {input('deadline', 'Preferred Delivery Date', 'date')}
            </div>
            <div className="et-field">
              <label htmlFor="quote-additionalRequirements">Additional Information</label>
              <textarea
                id="quote-additionalRequirements"
                name="additionalRequirements"
                rows={4}
                maxLength={5000}
                value={data.additionalRequirements}
                onChange={(event) => update('additionalRequirements', event.target.value)}
                aria-invalid={!!errors.additionalRequirements}
                aria-describedby={
                  errors.additionalRequirements ? 'quote-additionalRequirements-error' : undefined
                }
              />
              <FieldFeedback
                id="quote-additionalRequirements-error"
                message={errors.additionalRequirements}
              />
              <p className="et-form-help">
                Include any publisher specifications, style guides, accessibility requirements,
                reference layouts, quality checks or other instructions that may affect the project.
              </p>
            </div>
            <div className="qp-upload">
              <label className="qp-upload-label" htmlFor="quote-files">
                <Upload size={22} aria-hidden="true" />
                <span>
                  <strong>Attach project files</strong>
                  <span>Optional · PDF, DOCX or TXT · Up to 3 files, 1 MB each</span>
                </span>
              </label>
              <input
                id="quote-files"
                type="file"
                multiple
                accept={quoteUploadAccept}
                aria-describedby="quote-files-help quote-files-error"
                onChange={(event) => {
                  const selected = [...files, ...Array.from(event.target.files || [])]
                  const error = validateQuoteFiles(selected)
                  setFileError(error)
                  if (!error) setFiles(selected)
                  event.target.value = ''
                }}
              />
              <p id="quote-files-help" className="et-form-help">
                Add sample pages, a brief or reference specifications. Files are stored privately
                with your enquiry.
              </p>
              <p id="quote-files-error" className="et-field-error et-field-feedback" role="alert">
                {fileError}
              </p>
              {files.length > 0 && (
                <ul className="qp-upload-list">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      <span>
                        {file.name}
                        <small>{Math.ceil(file.size / 1024)} KB</small>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => {
                          setFiles(files.filter((_, i) => i !== index))
                          setFileError('')
                        }}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="et-enquiry-form-grid">
              {input('name', 'Full Name', 'text', true, 100)}
              {input('email', 'Business Email', 'email', true, 254)}
              {input('company', 'Company / Organization', 'text', true, 200)}
              {input('countryRegion', 'Country / Region')}
            </div>
            <p className="et-form-help">
              <Link href="/privacy-policy">Privacy information</Link>
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <dl className="et-review">
              {[
                [
                  'Service Required',
                  quoteServiceOptions.find(({ value }) => value === data.service)?.label || '',
                ],
                ['Project Description', data.details],
                ['Source File Format', data.sourceFileFormat || 'Not provided'],
                ['Required Output Format', data.targetOutputFormat || 'Not provided'],
                ['Approximate Volume', data.approximateVolume || 'Not provided'],
                ['Languages', data.languages || 'Not provided'],
                ['Preferred Delivery Date', data.deadline || 'Not provided'],
                ['Additional Information', data.additionalRequirements || 'Not provided'],
                [
                  'Attachments',
                  files.length ? files.map((file) => file.name).join(', ') : 'No files attached',
                ],
                ['Contact', `${data.name} · ${data.email}`],
                ['Company / Organization', data.company],
                ['Country / Region', data.countryRegion || 'Not provided'],
              ].map(([title, value]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd data-private>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="et-form-help">
              Any estimate or delivery commitment depends on reviewing the relevant project details.{' '}
              <Link href="/privacy-policy">Privacy information</Link>
            </p>
          </>
        )}

        <div className="et-honeypot" aria-hidden="true">
          <label htmlFor="quote-website">Website</label>
          <input
            id="quote-website"
            tabIndex={-1}
            autoComplete="off"
            value={data.website}
            onChange={(event) => update('website', event.target.value)}
          />
        </div>
        <p className="et-form-message" role="alert">
          {message}
        </p>
        <div className="et-form-actions">
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} disabled={pending}>
              <ArrowLeft size={17} /> Back
            </button>
          )}
          <button type="submit" className="et-button" disabled={pending}>
            {pending
              ? 'Submitting…'
              : step === steps.length - 1
                ? 'Submit Project Enquiry'
                : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
