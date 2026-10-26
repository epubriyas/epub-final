import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'
import defaults from '../../config/landing-content.json'

// Match only the untouched previous CMS block. Other editorial changes are left for review.
const previousAudience = {
  title: 'Production Support for Different Teams',
  cards: [
    {
      title: 'For Publishers & Academic Publishing Organizations',
      paragraphs: [
        'EPUBTRANS supports publishing workflows involving editorial production, book and journal typesetting, structured XML, EPUB creation, content conversion and digital accessibility.',
        'We can review individual production tasks or related service requirements, based on your supplied files and publishing specifications.',
      ],
    },
    {
      title: 'For Localization Service Providers & Translation Agencies',
      paragraphs: [
        'We support production work that complements translation and localization projects, including multilingual DTP, editable-file conversion, layout recreation and eLearning localization.',
        'Our production activities are aligned with your agreed client specifications, workflow stages and delivery requirements.',
      ],
    },
  ],
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "landing_pages"
    SET "home_content" = jsonb_set(
      jsonb_set("home_content", '{audience,cards,0,cta,href}', ${JSON.stringify('/services#for-publishers')}::jsonb),
      '{audience,cards,1,cta,href}', ${JSON.stringify('/services#for-localization-providers')}::jsonb
    ), "updated_at" = now()
    WHERE "home_content" #>> '{audience,cards,0,cta,label}' = 'Explore Publishing Services'
      AND "home_content" #>> '{audience,cards,0,cta,href}' = '/services#publishing-editorial'
      AND "home_content" #>> '{audience,cards,1,cta,label}' = 'Explore Localization Production'
      AND "home_content" #>> '{audience,cards,1,cta,href}' = '/services#localization-dtp';
  `)
  await db.execute(sql`
    UPDATE "landing_pages"
    SET "services_content" = jsonb_set(
      "services_content", '{audience}', ${JSON.stringify(defaults.directory.audience)}::jsonb
    ), "updated_at" = now()
    WHERE "services_content" -> 'audience' = ${JSON.stringify(previousAudience)}::jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "landing_pages"
    SET "home_content" = jsonb_set(
      jsonb_set("home_content", '{audience,cards,0,cta,href}', ${JSON.stringify('/services#publishing-editorial')}::jsonb),
      '{audience,cards,1,cta,href}', ${JSON.stringify('/services#localization-dtp')}::jsonb
    ), "updated_at" = now()
    WHERE "home_content" #>> '{audience,cards,0,cta,label}' = 'Explore Publishing Services'
      AND "home_content" #>> '{audience,cards,0,cta,href}' = '/services#for-publishers'
      AND "home_content" #>> '{audience,cards,1,cta,label}' = 'Explore Localization Production'
      AND "home_content" #>> '{audience,cards,1,cta,href}' = '/services#for-localization-providers';
  `)
  await db.execute(sql`
    UPDATE "landing_pages"
    SET "services_content" = jsonb_set(
      "services_content", '{audience}', ${JSON.stringify(previousAudience)}::jsonb
    ), "updated_at" = now()
    WHERE "services_content" -> 'audience' = ${JSON.stringify(defaults.directory.audience)}::jsonb;
  `)
}
