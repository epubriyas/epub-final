import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'dotenv'
import { pathToFileURL } from 'node:url'

// Local QA only: exercise the generated self-hosted server and existing storage.
const root = process.cwd()
const env = parse(await fs.readFile(path.join(root, '.env'), 'utf8'))
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(env.DATABASE_URL).hostname)) throw new Error('Audit server requires a local database')
const output = path.resolve(root, '.next/standalone')
if (!output.startsWith(root + path.sep)) throw new Error('Unexpected output directory')
await fs.access(path.join(output, 'server.js'))
await fs.cp(path.join(root, 'public'), path.join(output, 'public'), { recursive: true })
await fs.cp(path.join(root, '.next/static'), path.join(output, '.next/static'), { recursive: true })
await fs.cp(path.join(root, 'src/public/media'), path.join(output, 'src/public/media'), { recursive: true })
Object.assign(process.env, env, {
  NODE_ENV: 'production', PORT: process.env.AUDIT_PORT || '3000', HOSTNAME: '127.0.0.1',
  PORTFOLIO_PREVIEW_DIR: path.resolve(root, env.PORTFOLIO_PREVIEW_DIR || 'private-uploads/portfolio-previews'),
  PRIVATE_UPLOAD_DIR: path.resolve(root, env.PRIVATE_UPLOAD_DIR || 'private-uploads'),
  ENQUIRY_RECIPIENT_APPROVED: 'false',
})
await import(pathToFileURL(path.join(output, 'server.js')).href)
