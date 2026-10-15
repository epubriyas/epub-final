import type { GlobalConfig } from 'payload'
import { authenticated } from '@/payload/access/authenticated'
import defaults from '@/config/landing-content.json'
import { validateLandingContent, validateDirectory } from '@/lib/landing-schema'

export const LandingPages: GlobalConfig = {
  slug: 'landing-pages',
  label: 'Homepage and Services Directory',
  access: { read: () => true, update: authenticated },
  admin: {
    description:
      'Phase 1 content handoff. Edit content here; the existing frontend controls presentation. Confirm service scope and publication approval before launch.',
  },
  fields: [
    {
      name: 'editorialStatus',
      type: 'select',
      defaultValue: 'inReview',
      options: ['draft', 'inReview', 'approved', 'published'],
      admin: { description: 'Approval register for management. This does not deploy the website.' },
    },
    {
      name: 'homeContent',
      type: 'json',
      required: true,
      defaultValue: defaults.home,
      validate: (value) => validateLandingContent(value, defaults.home),
      admin: {
        description:
          'Editable headlines, paragraphs, audience cards, service categories, workflow, previews, CTAs and SEO. Preserve the field structure; arrays may be reordered or extended.',
      },
    },
    {
      name: 'servicesContent',
      type: 'json',
      required: true,
      defaultValue: defaults.directory,
      validate: validateDirectory,
      admin: {
        description:
          'Editable directory categories, cards, FAQs, guidance and SEO. Card status: active, pendingApproval or hidden. Pending approval cards use an enquiry link until scope is confirmed. sortOrder controls category and card order.',
      },
    },
  ],
}
