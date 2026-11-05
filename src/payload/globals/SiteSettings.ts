import type { GlobalConfig } from 'payload'
import { authenticated } from '@/payload/access/authenticated'
import { COMPANY_EMAIL } from '@/config/contact'
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'EPUBTRANS' },
    { name: 'description', type: 'textarea' },
    { name: 'email', type: 'email', defaultValue: COMPANY_EMAIL },
    { name: 'phone', type: 'text', defaultValue: '+91 44 3136 3907' },
    { name: 'location', type: 'text', defaultValue: 'Chennai, India' },
    {
      name: 'contactDetailsApproved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Enable only after management confirms the current email address and telephone number for public display.',
      },
    },
    {
      name: 'aboutPage',
      type: 'group',
      label: 'About page',
      fields: [
        {
          name: 'mission',
          type: 'textarea',
          admin: {
            description:
              'Optional approved replacement for the ET-ABOUT-001 v1.0 mission. Leave blank to use the approved handoff text.',
          },
        },
        {
          name: 'vision',
          type: 'textarea',
          admin: {
            description:
              'Optional approved replacement for the ET-ABOUT-001 v1.0 vision. Leave blank to use the approved handoff text.',
          },
        },
        {
          name: 'missionVisionApproved',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Display the new CMS mission and vision only after management approves both statements.',
          },
        },
      ],
    },
    {
      name: 'legalReviewed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Legal text and quote data retention require owner review before production.',
      },
    },
    { name: 'defaultLocale', type: 'select', options: ['en'], defaultValue: 'en' },
  ],
}
