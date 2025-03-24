import { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import generateEmbedding from '@/utils/generateEmbedding'
import deleteEmbedding from '@/utils/deleteEmbedding'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true, editor: lexicalEditor() },
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
