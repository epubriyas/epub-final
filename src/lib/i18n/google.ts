import { v2 } from '@google-cloud/translate'

// Keep credentials and provider requests on the server. The official client
// retries transient provider failures and supports both API keys and ADC.
export async function translateWithGoogle(texts: string[], locale: string): Promise<string[]> {
  const client = new v2.Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY || undefined,
    projectId: process.env.GOOGLE_CLOUD_PROJECT || undefined,
  })
  const [result] = await client.translate(texts, {
    from: 'en',
    to: locale,
    format: 'text',
  })
  const values = Array.isArray(result) ? result : [result]
  if (
    values.length !== texts.length ||
    values.some((value) => typeof value !== 'string' || !value.trim() || value.length > 20000)
  )
    throw new Error('Invalid translation response')
  return values
}
