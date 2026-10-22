import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { parse } from 'dotenv'
import pg from 'pg'

const env = parse(await fs.readFile('.env', 'utf8'))
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(env.DATABASE_URL).hostname))
  throw new Error('Only a local test database is allowed')
if (env.ENQUIRY_RECIPIENT_APPROVED === 'true')
  throw new Error('Live notifications are enabled; use a test mail transport before running')
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000'
const origin = new URL(env.NEXT_PUBLIC_SERVER_URL || base).origin
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(base).hostname))
  throw new Error('Only a local API is allowed')
const submissionKey = randomUUID()
const contactKey = randomUUID()
const database = new pg.Client({ connectionString: env.DATABASE_URL })
const results = []
await database.connect()
try {
  for (const invalid of [false, false, true]) {
    const body = new FormData()
    for (const [key, value] of Object.entries({
      submission_key: invalid ? randomUUID() : submissionKey,
      service_required: 'publishing_editorial',
      full_name: 'Synthetic UI Audit',
      business_email: invalid ? 'invalid-address' : 'ui-audit@example.invalid',
      organization: 'Synthetic QA',
      project_description:
        'Synthetic audit fixture: review an example publication layout. Not a customer enquiry.',
    }))
      body.set(key, value)
    const response = await fetch(base + '/api/quote', {
      method: 'POST',
      headers: { Origin: origin },
      body,
    })
    const json = await response.json()
    results.push({
      invalid,
      status: response.status,
      reference: json.reference,
      notification: json.notification,
    })
    if (response.status !== (invalid ? 422 : 201)) throw new Error('Unexpected quote API status')
    if (!invalid && json.notification !== 'unavailable')
      throw new Error('Unexpected notification state')
  }
  const count = Number(
    (
      await database.query('SELECT count(*) AS count FROM quote_requests WHERE submission_key=$1', [
        submissionKey,
      ])
    ).rows[0].count,
  )
  if (count !== 1 || results[0].reference !== results[1].reference)
    throw new Error('Duplicate submission was not idempotent')
  const contactReferences = []
  for (const invalid of [false, false, true]) {
    const response = await fetch(base + '/api/enquiry', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_key: invalid ? randomUUID() : contactKey,
        full_name: 'Synthetic UI Audit',
        business_email: invalid ? 'invalid' : 'ui-audit@example.invalid',
        organization: 'Synthetic QA',
        inquiry_type: 'general',
        message:
          'Synthetic audit fixture: verify contact enquiry persistence, not a customer enquiry.',
      }),
    })
    const value = await response.json()
    results.push({ kind: 'contact', invalid, status: response.status })
    if (response.status !== (invalid ? 422 : 201)) throw new Error('Unexpected contact API status')
    if (!invalid) contactReferences.push(value.enquiryId)
  }
  const contactCount = Number(
    (
      await database.query('SELECT count(*) AS count FROM enquiries WHERE submission_key=$1', [
        contactKey,
      ])
    ).rows[0].count,
  )
  if (contactCount !== 1 || contactReferences[0] !== contactReferences[1])
    throw new Error('Contact duplicate prevention failed')
  console.log(
    'Local persistence, duplicate prevention and invalid email verified; notifications unavailable, no delivery claim.',
  )
} finally {
  await database.query('DELETE FROM quote_requests WHERE submission_key=$1', [submissionKey])
  await database.query('DELETE FROM enquiries WHERE submission_key=$1', [contactKey])
  await database.end()
  await fs.mkdir('artifacts/master-audit', { recursive: true })
  await fs.writeFile(
    'artifacts/master-audit/quote-persistence.json',
    JSON.stringify({ results, syntheticFixtureRemoved: true }, null, 2),
  )
}
