import { pgTable, uuid, text, vector, timestamp, integer } from 'drizzle-orm/pg-core'

export const embeddings = pgTable('embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id'),
  chunkIndex: integer('chunk_index'),
  collectionSlug: text('collection_slug'),
  embedding: vector('embedding', { dimensions: 1536 }),
  context: text('context'),
  keywords: text('keywords').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
