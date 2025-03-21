import { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import generateEmbedding from '@/utils/generateEmbedding'
import deleteEmbedding from '@/utils/deleteEmbedding'

export const WorkExperience: CollectionConfig = {
  slug: 'workExperience',
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor(),
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      admin: {
        description: 'Provide a link to the project website or app if applicable.',
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
  ],
  hooks: {
    afterChange: [generateEmbedding],
    afterDelete: [deleteEmbedding],
  },
}
