import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "quote_requests" ADD COLUMN "submission_key" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "languages" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "country_region" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "source_file_format" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "target_output_format" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "approximate_volume" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "additional_requirements" varchar;
    ALTER TABLE "quote_requests" ADD COLUMN "source_page" varchar DEFAULT '/get-a-quote';
    ALTER TABLE "quote_requests" ALTER COLUMN "consent" DROP NOT NULL;
    ALTER TABLE "site_settings" ADD COLUMN "contact_details_approved" boolean DEFAULT false;

    CREATE UNIQUE INDEX "quote_requests_submission_key_idx" ON "quote_requests" USING btree ("submission_key");

    CREATE TYPE "public"."enum_enquiries_inquiry_type" AS ENUM('general', 'services', 'partnership', 'existing_project', 'other');
    CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'reviewing', 'contacted', 'closed');
    CREATE TABLE "enquiries" (
      "id" serial PRIMARY KEY NOT NULL,
      "submission_key" varchar,
      "name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "organization" varchar,
      "inquiry_type" "enum_enquiries_inquiry_type" NOT NULL,
      "message" varchar NOT NULL,
      "source_page" varchar DEFAULT '/contact-us',
      "status" "enum_enquiries_status" DEFAULT 'new',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "enquiries_submission_key_idx" ON "enquiries" USING btree ("submission_key");
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
    DROP INDEX "enquiries_submission_key_idx";
    DROP TABLE "enquiries";
    DROP TYPE "public"."enum_enquiries_status";
    DROP TYPE "public"."enum_enquiries_inquiry_type";

    DROP INDEX "quote_requests_submission_key_idx";
    ALTER TABLE "site_settings" DROP COLUMN "contact_details_approved";
    ALTER TABLE "quote_requests" ALTER COLUMN "consent" SET NOT NULL;
    ALTER TABLE "quote_requests" DROP COLUMN "source_page";
    ALTER TABLE "quote_requests" DROP COLUMN "additional_requirements";
    ALTER TABLE "quote_requests" DROP COLUMN "approximate_volume";
    ALTER TABLE "quote_requests" DROP COLUMN "target_output_format";
    ALTER TABLE "quote_requests" DROP COLUMN "source_file_format";
    ALTER TABLE "quote_requests" DROP COLUMN "country_region";
    ALTER TABLE "quote_requests" DROP COLUMN "languages";
    ALTER TABLE "quote_requests" DROP COLUMN "submission_key";
  `)
}
