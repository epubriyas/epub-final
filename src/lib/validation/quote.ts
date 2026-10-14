export const quoteServiceOptions = [
  { value: 'publishing_editorial', label: 'Publishing & Editorial Services' },
  { value: 'ebook_xml', label: 'eBook, XML & Structured Content' },
  { value: 'document_conversion', label: 'Document & Data Conversion' },
  { value: 'localization_dtp', label: 'Localization & Multilingual Production' },
  { value: 'elearning_multimedia', label: 'eLearning & Multimedia' },
  { value: 'digital_accessibility', label: 'Digital Accessibility' },
  { value: 'multiple_not_sure', label: 'Multiple Services / Not Sure' },
  { value: 'other', label: 'Other' },
] as const

export const quoteServices = quoteServiceOptions.map(({ value }) => value)
export const enquiryTypes = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'services', label: 'Services Information' },
  { value: 'partnership', label: 'Business Partnership' },
  { value: 'existing_project', label: 'Existing Project' },
  { value: 'other', label: 'Other' },
] as const

export interface QuoteData {
  service: string
  sourceLanguage: string
  targetLanguages: string
  languages: string
  countryRegion: string
  sourceFileFormat: string
  targetOutputFormat: string
  approximateVolume: string
  additionalRequirements: string
  details: string
  deadline: string
  name: string
  email: string
  company: string
  website: string
}

export interface ContactData {
  name: string
  email: string
  organization: string
  inquiryType: string
  message: string
  website: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxText = 500
const hasUnsafeControls = (value: string) => /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value
}

export function validateQuote(data: QuoteData): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!quoteServices.includes(data.service as (typeof quoteServices)[number]))
    errors.service = 'Select a service or choose “Multiple Services / Not Sure”.'
  if (data.name.trim().length < 2 || data.name.length > 100 || hasUnsafeControls(data.name))
    errors.name = 'Please complete this field.'
  if (!emailPattern.test(data.email) || data.email.length > 254 || hasUnsafeControls(data.email))
    errors.email = 'Enter a valid email address.'
  if (!data.company.trim() || data.company.length > 200 || hasUnsafeControls(data.company))
    errors.company = 'Please complete this field.'
  if (data.details.trim().length < 20 || data.details.length > 5000 || hasUnsafeControls(data.details))
    errors.details = 'Please provide a short description of your project.'
  for (const field of [
    'sourceLanguage',
    'targetLanguages',
    'languages',
    'countryRegion',
    'sourceFileFormat',
    'targetOutputFormat',
    'approximateVolume',
  ] as const)
    if (data[field].length > maxText || hasUnsafeControls(data[field])) errors[field] = 'Use 500 characters or fewer.'
  if (data.additionalRequirements.length > 5000 || hasUnsafeControls(data.additionalRequirements))
    errors.additionalRequirements = 'Use 5,000 characters or fewer.'
  if (data.deadline && !validDate(data.deadline))
    errors.deadline = 'Enter a valid date.'
  return errors
}

export function validateContact(data: ContactData): Record<string, string> {
  const errors: Record<string, string> = {}
  if (data.name.trim().length < 2 || data.name.length > 100 || hasUnsafeControls(data.name)) errors.name = 'Please complete this field.'
  if (!emailPattern.test(data.email) || data.email.length > 254 || hasUnsafeControls(data.email))
    errors.email = 'Enter a valid email address.'
  if (data.organization.length > 200 || hasUnsafeControls(data.organization)) errors.organization = 'Use 200 characters or fewer.'
  if (!enquiryTypes.some(({ value }) => value === data.inquiryType))
    errors.inquiryType = 'Please complete this field.'
  if (!data.message.trim() || data.message.length > 5000 || hasUnsafeControls(data.message)) errors.message = 'Please complete this field.'
  return errors
}

export function getQuoteData(form: FormData): QuoteData {
  const str = (name: string) =>
    typeof form.get(name) === 'string' ? String(form.get(name)).trim() : ''
  let details = typeof form.get('project_description') === 'string' ? String(form.get('project_description')) : ''
  if (form.get('detailsEncoding') === 'json') {
    try {
      const original: unknown = JSON.parse(details)
      details = typeof original === 'string' ? original : ''
    } catch {
      details = ''
    }
  }
  return {
    service: str('service_required'),
    sourceLanguage: str('sourceLanguage'),
    targetLanguages: str('targetLanguages'),
    languages: str('languages'),
    countryRegion: str('country_region'),
    sourceFileFormat: str('source_file_format'),
    targetOutputFormat: str('target_output_format'),
    approximateVolume: str('approximate_volume'),
    additionalRequirements: typeof form.get('additional_requirements') === 'string' ? String(form.get('additional_requirements')) : '',
    details,
    deadline: str('preferred_delivery_date'),
    name: str('full_name'),
    email: str('business_email'),
    company: str('organization'),
    website: str('website'),
  }
}

export function getContactData(input: unknown): ContactData {
  const value = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  const str = (name: string) => (typeof value[name] === 'string' ? String(value[name]).trim() : '')
  return {
    name: str('full_name'),
    email: str('business_email'),
    organization: str('organization'),
    inquiryType: str('inquiry_type'),
    message: typeof value.message === 'string' ? value.message : '',
    website: str('website'),
  }
}

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024
