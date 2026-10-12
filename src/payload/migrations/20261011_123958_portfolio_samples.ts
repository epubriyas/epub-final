import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_case_studies_work_kind" AS ENUM('case-study', 'sample', 'demonstration');
  CREATE TYPE "public"."enum_case_studies_file_type" AS ENUM('pdf', 'epub', 'image', 'document-preview');
  CREATE TABLE "portfolio_previews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "case_studies_preview_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"asset_id" integer NOT NULL,
  	"source_page" numeric NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "case_studies_reader_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "case_studies_workflow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  ALTER TABLE "case_studies" ADD COLUMN "work_kind" "enum_case_studies_work_kind" DEFAULT 'case-study';
  ALTER TABLE "case_studies" ADD COLUMN "sample_category" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "file_type" "enum_case_studies_file_type";
  ALTER TABLE "case_studies" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "case_studies" ADD COLUMN "display_order" numeric DEFAULT 100;
  ALTER TABLE "case_studies" ADD COLUMN "thumbnail_id" integer;
  ALTER TABLE "case_studies" ADD COLUMN "source_page_count" numeric;
  ALTER TABLE "case_studies" ADD COLUMN "preview_note" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "portfolio_previews_id" integer;
  ALTER TABLE "case_studies_preview_pages" ADD CONSTRAINT "case_studies_preview_pages_asset_id_portfolio_previews_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."portfolio_previews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_preview_pages" ADD CONSTRAINT "case_studies_preview_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_reader_sections" ADD CONSTRAINT "case_studies_reader_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_workflow" ADD CONSTRAINT "case_studies_workflow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "portfolio_previews_updated_at_idx" ON "portfolio_previews" USING btree ("updated_at");
  CREATE INDEX "portfolio_previews_created_at_idx" ON "portfolio_previews" USING btree ("created_at");
  CREATE UNIQUE INDEX "portfolio_previews_filename_idx" ON "portfolio_previews" USING btree ("filename");
  CREATE INDEX "portfolio_previews_sizes_thumbnail_sizes_thumbnail_filen_idx" ON "portfolio_previews" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "case_studies_preview_pages_order_idx" ON "case_studies_preview_pages" USING btree ("_order");
  CREATE INDEX "case_studies_preview_pages_parent_id_idx" ON "case_studies_preview_pages" USING btree ("_parent_id");
  CREATE INDEX "case_studies_preview_pages_asset_idx" ON "case_studies_preview_pages" USING btree ("asset_id");
  CREATE INDEX "case_studies_reader_sections_order_idx" ON "case_studies_reader_sections" USING btree ("_order");
  CREATE INDEX "case_studies_reader_sections_parent_id_idx" ON "case_studies_reader_sections" USING btree ("_parent_id");
  CREATE INDEX "case_studies_workflow_order_idx" ON "case_studies_workflow" USING btree ("_order");
  CREATE INDEX "case_studies_workflow_parent_id_idx" ON "case_studies_workflow" USING btree ("_parent_id");
  CREATE INDEX "case_studies_rels_order_idx" ON "case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_services_id_idx" ON "case_studies_rels" USING btree ("services_id");
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_thumbnail_id_portfolio_previews_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."portfolio_previews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_previews_fk" FOREIGN KEY ("portfolio_previews_id") REFERENCES "public"."portfolio_previews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "case_studies_thumbnail_idx" ON "case_studies" USING btree ("thumbnail_id");
  CREATE INDEX "payload_locked_documents_rels_portfolio_previews_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_previews_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "portfolio_previews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_preview_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_reader_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_workflow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "portfolio_previews" CASCADE;
  DROP TABLE "case_studies_preview_pages" CASCADE;
  DROP TABLE "case_studies_reader_sections" CASCADE;
  DROP TABLE "case_studies_workflow" CASCADE;
  DROP TABLE "case_studies_rels" CASCADE;
  ALTER TABLE "case_studies" DROP CONSTRAINT "case_studies_thumbnail_id_portfolio_previews_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_portfolio_previews_fk";
  
  DROP INDEX "case_studies_thumbnail_idx";
  DROP INDEX "payload_locked_documents_rels_portfolio_previews_id_idx";
  ALTER TABLE "case_studies" DROP COLUMN "work_kind";
  ALTER TABLE "case_studies" DROP COLUMN "sample_category";
  ALTER TABLE "case_studies" DROP COLUMN "file_type";
  ALTER TABLE "case_studies" DROP COLUMN "featured";
  ALTER TABLE "case_studies" DROP COLUMN "display_order";
  ALTER TABLE "case_studies" DROP COLUMN "thumbnail_id";
  ALTER TABLE "case_studies" DROP COLUMN "source_page_count";
  ALTER TABLE "case_studies" DROP COLUMN "preview_note";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "portfolio_previews_id";
  DROP TYPE "public"."enum_case_studies_work_kind";
  DROP TYPE "public"."enum_case_studies_file_type";`)
}
