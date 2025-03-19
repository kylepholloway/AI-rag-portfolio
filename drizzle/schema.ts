import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { vector } from 'drizzle-orm/pg-core'

export const embeddings = pgTable(
  'embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id').notNull(),
    collectionSlug: text('collection_slug').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    context: text('context').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_document_per_collection').on(table.documentId, table.collectionSlug), // ✅ Composite uniqueness constraint
  ],
)
