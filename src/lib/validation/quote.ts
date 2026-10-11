export const quoteServices = [
  'Publishing & content',
  'Translation & localization',
  'Media & multimedia',
  'eLearning localization',
  'Accessibility',
  'Other / discuss my project',
] as const
export interface QuoteData {
  service: string
  sourceLanguage: string
  targetLanguages: string
  details: string
  deadline: string
  name: string
  email: string
  company: string
  consent: boolean
  website: string
}
export function validateQuote(data: QuoteData): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!quoteServices.some((service) => service === data.service))
    errors.service = 'Choose the service you need.'
  if (data.name.trim().length < 2 || data.name.length > 100)
    errors.name = 'Enter your name (2–100 characters).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254)
    errors.email = 'Enter a valid email address.'
  if (data.details.trim().length < 20 || data.details.length > 5000)
    errors.details = 'Describe your project in 20–5,000 characters.'
  for (const field of ['sourceLanguage', 'targetLanguages', 'company'] as const)
    if (data[field].length > 200) errors[field] = 'Use 200 characters or fewer.'
  if (data.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(data.deadline))
    errors.deadline = 'Use a valid date.'
  if (data.deadline && Number.isNaN(Date.parse(data.deadline)))
    errors.deadline = 'Use a valid date.'
  if (!data.consent)
    errors.consent = 'Please confirm we can use these details to respond to your request.'
  return errors
}
export function getQuoteData(form: FormData): QuoteData {
  const str = (name: string) =>
    typeof form.get(name) === 'string' ? String(form.get(name)).trim() : ''
  let details = typeof form.get('details') === 'string' ? String(form.get('details')) : ''
  if (form.get('detailsEncoding') === 'json') {
    try {
      const original: unknown = JSON.parse(details)
      details = typeof original === 'string' ? original : ''
    } catch {
      details = ''
    }
  }
  return {
    service: str('service'),
    sourceLanguage: str('sourceLanguage'),
    targetLanguages: str('targetLanguages'),
    // Validate with trim(), but store and email the customer's original wording and whitespace.
    details,
    deadline: str('deadline'),
    name: str('name'),
    email: str('email'),
    company: str('company'),
    consent: form.get('consent') === 'true',
    website: str('website'),
  }
}
export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024
