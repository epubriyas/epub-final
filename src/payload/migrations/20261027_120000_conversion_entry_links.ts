import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Keep this migration independent of changing application defaults. Only exact legacy
// title/destination pairs are patched, preserving all other CMS fields and editor changes.
function patch(value: unknown, reverse: boolean): unknown {
  if (Array.isArray(value)) return value.map((item) => patch(item, reverse))
  if (!value || typeof value !== 'object') return value
  const source = value as Record<string, unknown>
  const result = Object.fromEntries(
    Object.entries(source).map(([key, item]) => [key, patch(item, reverse)]),
  )
  const label = source.title || source.label
  const fragment =
    label === 'Data Conversion Services'
      ? 'pdf-to-word-ocr'
      : label === 'PDF Recreation & Document Preparation'
        ? 'pdf-recreation'
        : undefined
  const base = '/data-conversion-services'
  if (fragment && source.href === (reverse ? `${base}#${fragment}` : base)) {
    result.href = reverse ? base : `${base}#${fragment}`
  }
  return result
}

async function migrate(db: MigrateUpArgs['db'], reverse: boolean) {
  const result = await db.execute(sql`SELECT "id", "services_content" FROM "landing_pages"`)
  for (const row of result.rows) {
    const previous = JSON.stringify(row.services_content)
    const next = JSON.stringify(patch(row.services_content, reverse))
    if (previous === next) continue
    await db.execute(sql`
      UPDATE "landing_pages"
      SET "services_content" = ${next}::jsonb, "updated_at" = now()
      WHERE "id" = ${row.id} AND "services_content" = ${previous}::jsonb
    `)
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await migrate(db, false)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await migrate(db, true)
}
