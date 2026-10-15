import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "portfolio_previews" ADD COLUMN "prefix" varchar DEFAULT 'portfolio-previews';
  ALTER TABLE "portfolio_previews" ADD COLUMN "_objectkey" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "portfolio_previews" DROP COLUMN "prefix";
  ALTER TABLE "portfolio_previews" DROP COLUMN "_objectkey";`)
}
