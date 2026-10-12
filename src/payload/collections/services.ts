import { authenticated } from '@/payload/access/authenticated'
import { publishedContent } from '@/payload/access/publishedContent'
import type { CollectionConfig, Where } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'updatedAt'],
    group: 'Content',
  },

  access: {
    read: publishedContent,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Service name displayed on the website.',
      },
    },

    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug. Example: translation, proofreading, accessibility',
      },
    },

    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Publishing',
          value: 'publishing',
        },
        {
          label: 'Translation & Localization',
          value: 'translation-localization',
        },
        {
          label: 'Accessibility',
          value: 'accessibility',
        },
      ],
    },

    {
      name: 'shortDescription',
      type: 'textarea',
      admin: {
        description: 'Short description used on service cards and listings.',
      },
    },

    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
        },
        {
          name: 'headline',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'layout',
          type: 'select',
          options: ['editorial', 'technical', 'publication'],
          admin: { description: 'Optional override; otherwise the layout follows the service.' },
        },
      ],
    },

    {
      name: 'overview',
      type: 'richText',
      admin: {
        description: 'Main service overview content.',
      },
    },

    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },

    {
      name: 'workflow',
      type: 'array',
      fields: [
        {
          name: 'step',
          type: 'number',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },

    {
      name: 'faqs',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },

    {
      name: 'visualExplanation',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'sourceLabel', type: 'text' },
        { name: 'outputLabel', type: 'text' },
      ],
    },
    {
      name: 'quality',
      type: 'array',
      admin: { description: 'Verified review practices only; omit unsupported compliance claims.' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'useCases',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'industry', type: 'relationship', relationTo: 'industries' },
      ],
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      filterOptions: ({ id }): Where => ({
        and: [{ status: { equals: 'published' } }, ...(id ? [{ id: { not_equals: id } }] : [])],
      }),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
    },

    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
      ],
    },
  ],
}
