import 'dotenv/config'
import pg from 'pg'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

// Follow the repository's local-baseline adoption workflow without resetting dev data.
const url = new URL(process.env.DATABASE_URL)
if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname))
  throw new Error(
    'This helper is restricted to the local development database. Deploy the registered migration normally elsewhere.',
  )
const name = '20261011_123958_portfolio_samples'
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  if ((await client.query('SELECT id FROM payload_migrations WHERE name=$1', [name])).rowCount)
    console.log('Portfolio migration already applied.')
  else {
    const source = await readFile(`src/payload/migrations/${name}.ts`, 'utf8')
    const statement = source
      .split('export async function down')[0]
      .match(/await db.execute\(sql`([\s\S]*?)`\)/)?.[1]
    if (
      !statement ||
      /\$\{|(?:^|;)\s*(DROP|DELETE|TRUNCATE|UPDATE)\b|ALTER[^;]*\bDROP\b/im.test(statement)
    )
      throw new Error('Expected static additive SQL only.')
    await mkdir('.local-backups', { recursive: true })
    await writeFile(
      `.local-backups/pre-portfolio-${Date.now()}.json`,
      JSON.stringify(
        {
          cases: (await client.query('SELECT * FROM case_studies')).rows,
          columns: (
            await client.query(
              "SELECT * FROM information_schema.columns WHERE table_schema='public'",
            )
          ).rows,
          migrations: (await client.query('SELECT * FROM payload_migrations')).rows,
        },
        null,
        2,
      ),
    )
    await client.query('BEGIN')
    await client.query(statement)
    await client.query(
      'INSERT INTO payload_migrations (name,batch) SELECT $1,COALESCE(MAX(batch),0)+1 FROM payload_migrations',
      [name],
    )
    await client.query('COMMIT')
    console.log(
      'Additive portfolio migration applied transactionally; existing records preserved and local backup saved.',
    )
  }
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  await client.end()
}
