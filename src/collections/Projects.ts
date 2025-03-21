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
      name: 'keywords',
      type: 'array',
      label: 'Metadata / Keywords',
      minRows: 0,
      maxRows: 20,
      labels: { singular: 'Keyword', plural: 'Keywords' },
      fields: [{ name: 'keyword', type: 'text', required: false }],
    },
  ],
  hooks: {
    afterChange: [generateEmbedding],
    afterDelete: [deleteEmbedding],
  },
}
