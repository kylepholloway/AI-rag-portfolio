import { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import generateEmbedding from '@/utils/generateEmbedding'

export const QA: CollectionConfig = {
  slug: 'qa',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'richText', required: true, editor: lexicalEditor() },
  ],
  hooks: { afterChange: [generateEmbedding] },
}
