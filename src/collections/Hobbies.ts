import { CollectionConfig } from 'payload'
import generateEmbedding from '@/utils/generateEmbedding'
import deleteEmbedding from '@/utils/deleteEmbedding'

export const Hobbies: CollectionConfig = {
  slug: 'hobbies',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
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
