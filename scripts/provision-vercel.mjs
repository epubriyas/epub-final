import 'dotenv/config'
import pg from 'pg'
import { parse } from 'dotenv'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
const cli =
  'C:/Users/riyas/AppData/Local/npm-cache/_npx/f56f1f0dfbede539/node_modules/vercel/dist/index.js'
const cloud = parse(await readFile('.vercel/.env.production.local'))
const localURL = new URL(process.env.DATABASE_URL)
const cloudURL = new URL(cloud.DATABASE_URL_UNPOOLED || cloud.DATABASE_URL)
if (
  !['localhost', '127.0.0.1', '::1'].includes(localURL.hostname) ||
  cloudURL.hostname === localURL.hostname
)
  throw new Error('Unexpected database targets')
async function run(command, args, env, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let output = ''
    child.stdout.on('data', (value) => (output += value))
    child.stderr.on('data', (value) => (output += value))
    child.on('error', reject)
    child.on('close', async (code) => {
      if (code === 0) resolve(output)
      else {
        await writeFile('.vercel/provisioning-command-error.txt', output, { mode: 0o600 })
        reject(
          new Error(
            `Command ${command.split('/').pop()} failed with code ${code}; output retained privately.`,
          ),
        )
      }
    })
    child.stdin.end(input || '')
  })
}
const target = new pg.Client({ connectionString: cloudURL.href })
const source = new pg.Client({ connectionString: localURL.href })
await Promise.all([source.connect(), target.connect()])
try {
  const count = Number(
    (
      await target.query(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
      )
    ).rows[0].count,
  )
  if (count !== 0) throw new Error('Cloud database is not empty; refusing to overwrite it')
  await mkdir('.local-backups', { recursive: true })
  const binary = 'C:/Program Files/PostgreSQL/18/bin/'
  const pgEnv = (url) => ({
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGSSLMODE: url.searchParams.get('sslmode') || 'prefer',
  })
  await run(
    binary + 'pg_dump.exe',
    [
      '--format=custom',
      '--no-owner',
      '--no-privileges',
      '--file=.local-backups/pre-vercel-storage.dump',
    ],
    pgEnv(localURL),
  )
  const name = '20261012_054530_vercel_private_storage'
  const existing = (await source.query('SELECT 1 FROM payload_migrations WHERE name=$1', [name]))
    .rowCount
  if (!existing) {
    const text = await readFile('src/payload/migrations/' + name + '.ts', 'utf8')
    const up = text.match(/db\.execute\(sql`([\s\S]*?)`\)/)[1]
    await source.query('BEGIN')
    await source.query(up)
    await source.query(
      'INSERT INTO payload_migrations(name,batch) SELECT $1,COALESCE(MAX(batch),0)+1 FROM payload_migrations',
      [name],
    )
    await source.query('COMMIT')
  }
  console.log('Reviewed additive storage migration applied locally; backup saved.')
  await run(
    binary + 'pg_dump.exe',
    [
      '--format=custom',
      '--no-owner',
      '--no-privileges',
      '--file=.local-backups/vercel-transfer.dump',
    ],
    pgEnv(localURL),
  )
  await run(
    binary + 'pg_restore.exe',
    [
      '--dbname=' + decodeURIComponent(cloudURL.pathname.slice(1)),
      '--no-owner',
      '--no-privileges',
      '--exit-on-error',
      '.local-backups/vercel-transfer.dump',
    ],
    pgEnv(cloudURL),
  )
  console.log('Site database transferred to the new empty Neon database.')
  const secrets = {
    PAYLOAD_SECRET: randomBytes(32).toString('hex'),
    PREVIEW_SECRET: randomBytes(32).toString('hex'),
    TRANSLATION_CACHE_DIR: '/tmp/epubtrans-translations',
  }
  for (const key of [
    'GEMINI_API_KEY',
    'GEMINI_ASSISTANT_MODEL',
    'GOOGLE_TRANSLATE_API_KEY',
    'RESEND_API_KEY',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'QUOTE_FROM_EMAIL',
    'QUOTE_TO_EMAIL',
  ])
    if (process.env[key]) secrets[key] = process.env[key]
  for (const [key, value] of Object.entries(secrets)) {
    await run(
      process.execPath,
      [
        cli,
        'env',
        'add',
        key,
        'production,preview',
        '--yes',
        '--scope',
        'riyascodexxs-projects',
        '--non-interactive',
      ],
      {},
      value,
    )
    console.log(`Configured ${key} securely in production and preview.`)
  }
} catch (error) {
  await source.query('ROLLBACK').catch(() => {})
  await writeFile('.vercel/provisioning-error.txt', String(error), { mode: 0o600 })
  throw error
} finally {
  await Promise.all([source.end(), target.end()])
}
