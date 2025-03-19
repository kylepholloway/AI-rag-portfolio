import { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import generateEmbedding from '@/utils/generateEmbedding'
import deleteEmbedding from '@/utils/deleteEmbedding'

export const FineTuningPrompts: CollectionConfig = {
  slug: 'fineTuningPrompts',
  admin: { useAsTitle: 'prompt' },
  fields: [
    { name: 'prompt', type: 'text', required: true },
    { name: 'context', type: 'richText', required: true, editor: lexicalEditor() },
  ],
  hooks: {
    afterChange: [generateEmbedding],
    afterDelete: [deleteEmbedding],
  },
}
