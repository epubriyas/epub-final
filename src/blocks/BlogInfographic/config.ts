import type { Block } from 'payload'

export const BlogInfographic: Block = {
  slug: 'blogInfographic',
  interfaceName: 'BlogInfographicBlock',
  labels: { singular: 'Infographic', plural: 'Infographics' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'steps',
      options: [
        { label: 'Connected steps / process', value: 'steps' },
        { label: 'Key figures / statistics', value: 'metrics' },
        { label: 'Ideas / comparison cards', value: 'cards' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 6,
      admin: {
        description:
          'Add two to six items. Statistics display the value you enter; use the source note to cite their origin.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'value',
          type: 'text',
          admin: {
            description: 'Optional headline figure, such as 25%. Used in the statistics layout.',
          },
        },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'source', label: 'Source / explanatory note', type: 'text' },
  ],
}
