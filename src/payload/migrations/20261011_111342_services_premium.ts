import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_hero_layout" AS ENUM('editorial', 'technical', 'publication');
  CREATE TABLE "services_quality" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "services_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"industry_id" integer
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  ALTER TABLE "services" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "services" ADD COLUMN "hero_layout" "enum_services_hero_layout";
  ALTER TABLE "services" ADD COLUMN "visual_explanation_title" varchar;
  ALTER TABLE "services" ADD COLUMN "visual_explanation_description" varchar;
  ALTER TABLE "services" ADD COLUMN "visual_explanation_source_label" varchar;
  ALTER TABLE "services" ADD COLUMN "visual_explanation_output_label" varchar;
  ALTER TABLE "services_quality" ADD CONSTRAINT "services_quality_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_use_cases" ADD CONSTRAINT "services_use_cases_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_use_cases" ADD CONSTRAINT "services_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_quality_order_idx" ON "services_quality" USING btree ("_order");
  CREATE INDEX "services_quality_parent_id_idx" ON "services_quality" USING btree ("_parent_id");
  CREATE INDEX "services_use_cases_order_idx" ON "services_use_cases" USING btree ("_order");
  CREATE INDEX "services_use_cases_parent_id_idx" ON "services_use_cases" USING btree ("_parent_id");
  CREATE INDEX "services_use_cases_industry_idx" ON "services_use_cases" USING btree ("industry_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_hero_hero_image_idx" ON "services" USING btree ("hero_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_quality" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_use_cases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_quality" CASCADE;
  DROP TABLE "services_use_cases" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_hero_image_id_media_id_fk";
  
  DROP INDEX "services_hero_hero_image_idx";
  ALTER TABLE "services" DROP COLUMN "hero_image_id";
  ALTER TABLE "services" DROP COLUMN "hero_layout";
  ALTER TABLE "services" DROP COLUMN "visual_explanation_title";
  ALTER TABLE "services" DROP COLUMN "visual_explanation_description";
  ALTER TABLE "services" DROP COLUMN "visual_explanation_source_label";
  ALTER TABLE "services" DROP COLUMN "visual_explanation_output_label";
  DROP TYPE "public"."enum_services_hero_layout";`)
}
