import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { vector } from 'drizzle-orm/pg-core'

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().unique(),
  collectionSlug: text('collection_slug'),
  embedding: vector('embedding', { dimensions: 1536 }),
  context: text('context'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
