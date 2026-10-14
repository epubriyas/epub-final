import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "about_page_mission" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "about_page_vision" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "about_page_mission_vision_approved" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "about_page_mission";
  ALTER TABLE "site_settings" DROP COLUMN "about_page_vision";
  ALTER TABLE "site_settings" DROP COLUMN "about_page_mission_vision_approved";`)
}
