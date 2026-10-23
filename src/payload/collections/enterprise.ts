import type { CollectionConfig, Field, Where } from 'payload'
import { authenticated } from '@/payload/access/authenticated'
import { publishedContent } from '@/payload/access/publishedContent'
import { caseStudyCategories, resourceTypes } from '@/config/resource-content'
import {
  BlocksFeature,
  HeadingFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  UnorderedListFeature,
  OrderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { BlogInfographic } from '@/blocks/BlogInfographic/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
const itemFields: Field[] = [
  { name: 'title', type: 'text', required: true },
  { name: 'description', type: 'textarea' },
]
export function contentCollection(slug: string, extra: Field[] = []): CollectionConfig {
  return {
    slug,
    admin: { useAsTitle: 'title', group: 'Content' },
    access: {
      read: publishedContent,
      create: authenticated,
      update: authenticated,
      delete: authenticated,
    },
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true, unique: true, index: true },
      { name: 'description', type: 'textarea' },
      { name: 'content', type: 'richText' },
      { name: 'media', type: 'upload', relationTo: 'media' },
      { name: 'capabilities', type: 'array', fields: itemFields },
      ...extra,
      {
        name: 'status',
        type: 'select',
        defaultValue: 'draft',
        required: true,
        options: ['draft', 'published'],
        index: true,
      },
      {
        name: 'seo',
        type: 'group',
        fields: [
          { name: 'metaTitle', type: 'text' },
          { name: 'metaDescription', type: 'textarea' },
        ],
      },
    ],
    timestamps: true,
  }
}
export const ServiceCategories = contentCollection('service-categories')
export const Technologies = contentCollection('technologies')
export const CaseStudies = contentCollection('case-studies', [
  {
    name: 'category',
    type: 'select',
    options: caseStudyCategories,
    index: true,
    admin: { description: 'Choose the Resources menu category for this case study.' },
  },
  { name: 'industry', type: 'relationship', relationTo: 'industries' },
  { name: 'client', type: 'text' },
  {
    name: 'permissionConfirmed',
    type: 'checkbox',
    defaultValue: false,
    admin: { description: 'Confirm permission to publish client details and media.' },
  },
  {
    name: 'source',
    type: 'text',
    admin: { description: 'Evidence supporting the case and any results.' },
  },
  { name: 'outcomes', type: 'array', fields: itemFields },
  {
    name: 'workKind',
    type: 'select',
    defaultValue: 'case-study',
    options: [
      { label: 'Case study', value: 'case-study' },
      { label: 'Sample', value: 'sample' },
      { label: 'Internal demonstration', value: 'demonstration' },
    ],
  },
  {
    name: 'services',
    type: 'relationship',
    relationTo: 'services',
    hasMany: true,
    filterOptions: { status: { equals: 'published' } },
  },
  {
    name: 'sampleCategory',
    type: 'text',
    admin: {
      description: 'Verified sample category. Only categories with published samples are shown.',
    },
  },
  {
    name: 'fileType',
    type: 'select',
    options: ['pdf', 'epub', 'image', 'document-preview'],
    admin: {
      description:
        'Verified source format. EPUB is shown as a safe reading excerpt; original interactivity is not reproduced.',
    },
  },
  { name: 'featured', type: 'checkbox', defaultValue: false },
  { name: 'displayOrder', type: 'number', defaultValue: 100 },
  { name: 'thumbnail', type: 'upload', relationTo: 'portfolio-previews' },
  { name: 'sourcePageCount', type: 'number' },
  {
    name: 'previewNote',
    type: 'textarea',
    admin: { description: 'Clearly state whether this is an excerpt or generated preview.' },
  },
  {
    name: 'previewPages',
    type: 'array',
    fields: [
      { name: 'asset', type: 'upload', relationTo: 'portfolio-previews', required: true },
      { name: 'sourcePage', type: 'number', required: true },
      {
        name: 'text',
        type: 'textarea',
        admin: { description: 'Source text for the accessible reading alternative.' },
      },
    ],
  },
  {
    name: 'readerSections',
    type: 'array',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'text', type: 'textarea', required: true },
    ],
  },
  { name: 'workflow', type: 'array', fields: itemFields },
])
CaseStudies.access = {
  ...CaseStudies.access,
  read: ({ req }): boolean | Where =>
    req.user
      ? true
      : { and: [{ status: { equals: 'published' } }, { permissionConfirmed: { equals: true } }] },
}
export const Resources = contentCollection('resources', [
  {
    name: 'type',
    type: 'select',
    options: resourceTypes,
    index: true,
    admin: {
      description: 'Choose the resource type to include it in the Resources menu listings.',
    },
  },
  { name: 'file', type: 'upload', relationTo: 'media' },
])
export const Careers = contentCollection('careers', [
  { name: 'location', type: 'text' },
  { name: 'employmentType', type: 'select', options: ['full-time', 'part-time', 'contract'] },
  { name: 'applicationEmail', type: 'email' },
])
Careers.hooks = {
  beforeChange: [
    ({ data, originalDoc }) => {
      if (
        (data.status ?? originalDoc?.status) === 'published' &&
        !(data.applicationEmail ?? originalDoc?.applicationEmail)?.trim()
      ) {
        throw new Error('A verified application mailbox is required before publishing a vacancy.')
      }
      return data
    },
  ],
}
Careers.labels = { singular: 'Career Opening', plural: 'Careers' }
Careers.admin = {
  ...Careers.admin,
  defaultColumns: ['title', 'location', 'employmentType', 'status', 'updatedAt'],
  description:
    'Verify owner authorization for the role and application mailbox before setting Status to Published and Save. Draft openings stay private. Preview lets you review the role page before publication.',
  preview: (data, { req }) =>
    generatePreviewPath({ collection: 'careers', slug: data.slug as string, req }),
}
Careers.fields = Careers.fields.map((field): Field => {
  if (!('name' in field) || field.type === 'ui') return field
  if (field.name === 'content')
    return {
      name: 'content',
      type: 'richText',
      label: 'Role details',
      admin: {
        description:
          'Describe responsibilities, experience, skills and how to apply. Add headings, lists or Infographic blocks to make the opening easy to scan.',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlocksFeature({ blocks: [BlogInfographic] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    }
  if (field.name === 'capabilities')
    return {
      ...field,
      label: 'Role highlights & requirements',
      admin: {
        description: 'Optional short points, displayed clearly below the full role details.',
      },
    }
  if (field.name === 'description')
    return {
      ...field,
      label: 'Short role summary',
      admin: {
        description:
          'A concise introduction displayed on the opening card and at the top of its role page.',
      },
    }
  if (field.name === 'status')
    return {
      ...field,
      admin: {
        description:
          'Published + Save makes the opening visible immediately. Draft + Save removes it from the public website.',
      },
    }
  if (field.name === 'media') return { ...field, admin: { hidden: true } }
  return field
})
export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  admin: {
    useAsTitle: 'name',
    group: 'Operations',
    defaultColumns: ['name', 'email', 'service', 'createdAt'],
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'submissionKey', type: 'text', unique: true, index: true, admin: { readOnly: true } },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'service', type: 'text', required: true },
    { name: 'sourceLanguage', type: 'text' },
    { name: 'targetLanguages', type: 'text' },
    { name: 'languages', type: 'text' },
    { name: 'countryRegion', type: 'text' },
    { name: 'sourceFileFormat', type: 'text' },
    { name: 'targetOutputFormat', type: 'text' },
    { name: 'approximateVolume', type: 'text' },
    { name: 'additionalRequirements', type: 'textarea' },
    { name: 'details', type: 'textarea', required: true },
    { name: 'deadline', type: 'date' },
    { name: 'consent', type: 'checkbox', defaultValue: false },
    { name: 'sourcePage', type: 'text', defaultValue: '/get-a-quote' },
    {
      name: 'attachments',
      type: 'array',
      fields: [
        { name: 'originalName', type: 'text', required: true },
        { name: 'path', type: 'text', required: true },
        { name: 'size', type: 'number', required: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'reviewing', 'contacted', 'closed'],
    },
  ],
  timestamps: true,
}

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Operations',
    defaultColumns: ['name', 'email', 'inquiryType', 'createdAt'],
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'submissionKey', type: 'text', unique: true, index: true, admin: { readOnly: true } },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'organization', type: 'text' },
    {
      name: 'inquiryType',
      type: 'select',
      required: true,
      options: [
        { label: 'General Enquiry', value: 'general' },
        { label: 'Services Information', value: 'services' },
        { label: 'Business Partnership', value: 'partnership' },
        { label: 'Existing Project', value: 'existing_project' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    { name: 'sourcePage', type: 'text', defaultValue: '/contact-us' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'reviewing', 'contacted', 'closed'],
    },
  ],
  timestamps: true,
}
