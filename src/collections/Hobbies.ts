import { CollectionConfig } from 'payload'
import generateEmbedding from '@/utils/generateEmbedding'

export const Hobbies: CollectionConfig = {
  slug: 'hobbies',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
  ],
  hooks: { afterChange: [generateEmbedding] },
}
