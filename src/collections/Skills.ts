import { CollectionConfig } from 'payload'
import generateEmbedding from '@/utils/generateEmbedding'
import deleteEmbedding from '@/utils/deleteEmbedding'

export const Skills: CollectionConfig = {
  slug: 'skills',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
  ],
  hooks: {
    afterChange: [generateEmbedding],
    afterDelete: [deleteEmbedding],
  },
}
