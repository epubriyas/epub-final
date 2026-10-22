import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'dotenv'
import pg from 'pg'

// Copy editorial content only. Production is always read-only; customer records,
// accounts, sessions, jobs and CMS history are deliberately excluded.
const local = parse(await fs.readFile('.env', 'utf8'))
const cloud = parse(await fs.readFile('.vercel/.env.production.local', 'utf8'))
const targetURL = new URL(local.DATABASE_URL)
const sourceURL = new URL(cloud.DATABASE_URL_UNPOOLED || cloud.DATABASE_URL)
if (!['localhost', '127.0.0.1', '::1'].includes(targetURL.hostname))
  throw new Error('Restore destination must be localhost')
if (sourceURL.hostname === targetURL.hostname) throw new Error('Source must be remote')
const source = new pg.Client({ connectionString: sourceURL.href })
const target = new pg.Client({ connectionString: targetURL.href })
const roots = [
  'careers', 'case_studies', 'categories', 'footer', 'forms', 'header',
  'industries', 'landing_pages', 'media', 'pages', 'portfolio_previews',
  'posts', 'redirects', 'resources', 'search', 'service_categories',
  'services', 'site_settings', 'solutions', 'technologies', 'payload_folders',
]
const quote = (name) => '"' + name.replaceAll('"', '""') + '"'
try {
  await source.connect()
  await target.connect()
  await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  const tables = (await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
    .rows.map(({ tablename }) => tablename)
    .filter((name) => roots.some((root) => name === root || name.startsWith(root + '_')))
  for (const name of ['services', 'pages', 'posts', 'case_studies', 'industries', 'solutions']) {
    const { rows } = await target.query(`SELECT count(*) AS count FROM ${quote(name)}`)
    if (Number(rows[0].count)) throw new Error(`Local ${name} contains content; restore requires an empty content database`)
  }
  const before = {}
  const content = {}
  for (const name of tables) {
    before[name] = (await target.query(`SELECT * FROM ${quote(name)}`)).rows
    content[name] = (await source.query(`SELECT * FROM ${quote(name)}`)).rows
  }
  await source.query('COMMIT')
  await fs.mkdir('.local-backups', { recursive: true })
  await fs.writeFile(`.local-backups/before-content-restore-${Date.now()}.json`, JSON.stringify(before))
  // Author display names live in posts_populated_authors; do not copy accounts.
  if (content.posts_rels) content.posts_rels = content.posts_rels.filter((row) => !row.users_id)
  await target.query('BEGIN')
  await target.query("SET LOCAL session_replication_role = 'replica'")
  for (const name of [...tables].reverse()) await target.query(`DELETE FROM ${quote(name)}`)
  for (const name of tables) {
    for (const row of content[name]) {
      await target.query(`INSERT INTO ${quote(name)} SELECT * FROM json_populate_record(NULL::${quote(name)}, $1::json)`, [JSON.stringify(row)])
    }
    const columns = (await target.query("SELECT column_name, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1", [name])).rows
    for (const column of columns.filter((column) => column.column_default?.startsWith('nextval('))) {
      const { rows } = await target.query('SELECT pg_get_serial_sequence($1,$2) AS sequence', [name, column.column_name])
      if (rows[0].sequence) await target.query(`SELECT setval($1::regclass, GREATEST(COALESCE((SELECT max(${quote(column.column_name)}) FROM ${quote(name)}),0),1), EXISTS(SELECT 1 FROM ${quote(name)}))`, [rows[0].sequence])
    }
  }
  await target.query("SET LOCAL session_replication_role = 'origin'")
  const constraints = (await target.query(`
    SELECT c.conrelid::regclass::text AS child, c.confrelid::regclass::text AS parent,
      array_agg(a.attname::text ORDER BY k.ordinality) AS child_columns,
      array_agg(b.attname::text ORDER BY k.ordinality) AS parent_columns
    FROM pg_constraint c
    CROSS JOIN LATERAL unnest(c.conkey, c.confkey) WITH ORDINALITY k(child_key, parent_key, ordinality)
    JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.child_key
    JOIN pg_attribute b ON b.attrelid=c.confrelid AND b.attnum=k.parent_key
    WHERE c.contype='f'
    GROUP BY c.oid, c.conrelid, c.confrelid
  `)).rows
  for (const constraint of constraints.filter((constraint) => tables.includes(constraint.child))) {
    const join = constraint.child_columns.map((column, index) => `child.${quote(column)}=parent.${quote(constraint.parent_columns[index])}`).join(' AND ')
    const present = constraint.child_columns.map((column) => `child.${quote(column)} IS NOT NULL`).join(' AND ')
    const result = await target.query(`SELECT 1 FROM ${quote(constraint.child)} child WHERE ${present} AND NOT EXISTS(SELECT 1 FROM ${quote(constraint.parent)} parent WHERE ${join}) LIMIT 1`)
    if (result.rowCount) throw new Error(`Missing relationship: ${constraint.child} -> ${constraint.parent}`)
  }
  await target.query('COMMIT')
  let filesRestored = 0
  for (const [table, directory, collection] of [
    ['media', 'src/public/media', 'media'],
    ['portfolio_previews', local.PORTFOLIO_PREVIEW_DIR || 'private-uploads/portfolio-previews', 'portfolio-previews'],
  ]) {
    await fs.mkdir(directory, { recursive: true })
    for (const row of content[table] || []) {
      for (const [key, filename] of Object.entries(row)) {
        if (!(key === 'filename' || key.endsWith('_filename')) || !filename) continue
        if (path.basename(filename) !== filename) throw new Error('Unsafe media filename')
        const destination = path.join(directory, filename)
        try { await fs.access(destination); continue } catch (error) { if (error.code !== 'ENOENT') throw error }
        const response = await fetch(`https://epubtrans-v2.vercel.app/api/${collection}/file/${encodeURIComponent(filename)}`)
        // Unpublished previews remain private and must be transferred separately.
        if (collection === 'portfolio-previews' && [401, 403, 404].includes(response.status)) continue
        if (!response.ok) throw new Error(`Media restore failed: HTTP ${response.status}`)
        await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()))
        filesRestored++
      }
    }
  }
  console.log('Restored editorial tables:', tables.length)
  console.log('Restored missing public files:', filesRestored)
  for (const name of roots) if (content[name]) console.log(`${name}: ${content[name].length}`)
} catch (error) {
  await target.query('ROLLBACK').catch(() => {})
  throw error
} finally {
  await source.end()
  await target.end()
}
