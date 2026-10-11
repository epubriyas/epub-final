import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_case_studies_category" AS ENUM('publishing', 'localization', 'elearning', 'accessibility');
  CREATE TYPE "public"."enum_resources_type" AS ENUM('guide', 'ebook', 'whitepaper', 'report');
  ALTER TABLE "case_studies" ADD COLUMN "category" "enum_case_studies_category";
  ALTER TABLE "resources" ADD COLUMN "type" "enum_resources_type";
  CREATE INDEX "case_studies_category_idx" ON "case_studies" USING btree ("category");
  CREATE INDEX "resources_type_idx" ON "resources" USING btree ("type");
  INSERT INTO "categories" ("title", "slug")
    SELECT 'Industry Insights', 'industry-insights'
    WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'industry-insights');`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "case_studies_category_idx";
  DROP INDEX "resources_type_idx";
  ALTER TABLE "case_studies" DROP COLUMN "category";
  ALTER TABLE "resources" DROP COLUMN "type";
  DROP TYPE "public"."enum_case_studies_category";
  DROP TYPE "public"."enum_resources_type";`)
}
