import type { CollectionConfig, Field, Where } from 'payload'
import { authenticated } from '@/payload/access/authenticated'
import { publishedContent } from '@/payload/access/publishedContent'
import { caseStudyCategories, resourceTypes } from '@/config/resource-content'
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
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'service', type: 'text', required: true },
    { name: 'sourceLanguage', type: 'text' },
    { name: 'targetLanguages', type: 'text' },
    { name: 'details', type: 'textarea', required: true },
    { name: 'deadline', type: 'date' },
    { name: 'consent', type: 'checkbox', required: true },
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
