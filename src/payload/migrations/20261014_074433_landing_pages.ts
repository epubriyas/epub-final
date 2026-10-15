import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import defaults from '../../config/landing-content.json'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_landing_pages_editorial_status" AS ENUM('draft', 'inReview', 'approved', 'published');
    CREATE TABLE "landing_pages" (
      "id" serial PRIMARY KEY NOT NULL,
      "editorial_status" "enum_landing_pages_editorial_status" DEFAULT 'inReview',
      "home_content" jsonb NOT NULL,
      "services_content" jsonb NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `)
  await db.execute(sql`
    INSERT INTO "landing_pages" ("home_content", "services_content", "updated_at", "created_at")
    VALUES (${JSON.stringify(defaults.home)}::jsonb, ${JSON.stringify(defaults.directory)}::jsonb, now(), now());
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "landing_pages";
    DROP TYPE "public"."enum_landing_pages_editorial_status";
  `)
}
