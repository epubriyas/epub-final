import type { GlobalConfig } from 'payload'
import { authenticated } from '@/payload/access/authenticated'
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'EPUBTRANS' },
    { name: 'description', type: 'textarea' },
    { name: 'email', type: 'email', defaultValue: 'info@epubtrans.com' },
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
              'Optional replacement for the current mission. Review the About EPUBTRANS draft and obtain management approval before enabling it.',
          },
        },
        {
          name: 'vision',
          type: 'textarea',
          admin: {
            description:
              'Optional replacement for the current vision. Review the About EPUBTRANS draft and obtain management approval before enabling it.',
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
