import { pgTable, uuid, text, vector, timestamp, integer } from 'drizzle-orm/pg-core'

export const embeddings = pgTable('embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id'),
  chunkIndex: integer('chunk_index'),
  title: text('title'),
  url: text('url'),
  timePeriod: text('time_period'),
  collectionSlug: text('collection_slug'),
  embedding: vector('embedding', { dimensions: 1536 }),
  context: text('context'),
  keywords: text('keywords').array(),
  roleLevel: integer('role_level'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
