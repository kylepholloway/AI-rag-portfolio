import { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import generateEmbedding from '@/utils/generateEmbedding'
import deleteEmbedding from '@/utils/deleteEmbedding'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true, editor: lexicalEditor() },
    {
      name: 'timePeriod',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      admin: {
        description: 'Provide a link to the project website or app if applicable.',
        position: 'sidebar',
      },
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Metadata / Keywords',
      minRows: 0,
      maxRows: 20,
      labels: { singular: 'Keyword', plural: 'Keywords' },
      fields: [{ name: 'keyword', type: 'text', required: false }],
    },
    {
      name: 'roleLevel',
      type: 'number',
      label: 'Priority Level (1–5)',
      min: 1,
      max: 5,
      defaultValue: 3,
      admin: {
        description: '5 = High, 4 = Medium, ..., 1 = Low',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [generateEmbedding],
    afterDelete: [deleteEmbedding],
  },
}
