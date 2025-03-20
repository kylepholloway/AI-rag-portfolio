import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { embeddings } from '../../drizzle/schema'
import type { CollectionAfterDeleteHook } from 'payload'

// ✅ Initialize Drizzle Neon connection
const sqlClient = neon(process.env.EMBEDDINGS_POSTGRES_URL!)
const db = drizzle(sqlClient)

const deleteEmbedding: CollectionAfterDeleteHook = async ({ doc, collection }) => {
  try {
    console.log(`🗑️ Processing deletion for collection: "${collection.slug}"`)
    console.log(`📄 Deleted document:`, JSON.stringify(doc, null, 2))

    if (!doc || typeof doc !== 'object') {
      console.warn(`⚠️ No valid document provided for deletion – Skipping.`)
      return
    }

    // ✅ Ensure documentId is valid
    let documentId = doc.id
    if (!documentId) {
      console.error(`❌ Missing document ID for deletion – Skipping.`)
      return
    }

    if (typeof documentId === 'number') {
      console.warn(`⚠️ Document ID is a number. Converting to UUID format.`)
      documentId = convertNumberToUUID(documentId)
    }

    console.log(`✅ Final document ID (UUID format): ${documentId}`)

    // ✅ Delete embedding from Neon DB if both documentId and collectionSlug match
    const deletedRows = await db
      .delete(embeddings)
      .where(
        sql`${embeddings.documentId} = ${documentId} AND ${embeddings.collectionSlug} = ${collection.slug}`,
      )
      .execute()

    if (deletedRows.rowCount > 0) {
      console.log(
        `✅ Successfully deleted embedding for document ID: ${documentId} in collection: "${collection.slug}"`,
      )
    } else {
      console.warn(
        `⚠️ No embedding found for document ID: ${documentId} in collection: "${collection.slug}"`,
      )
    }
  } catch (error) {
    console.error('❌ Error deleting embedding:', error)
  }
}

/**
 * ✅ Converts a number ID to a valid UUID format.
 */
const convertNumberToUUID = (num: number): string => {
  const hexString = num.toString(16).padStart(32, '0') // Convert number to hex and pad
  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}`
}

export default deleteEmbedding
