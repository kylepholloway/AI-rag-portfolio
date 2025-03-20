import OpenAI from 'openai'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { embeddings } from '../../drizzle/schema'
import type { CollectionAfterChangeHook } from 'payload'

// ✅ Initialize OpenAI & Drizzle Neon connection
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sqlClient = neon(process.env.EMBEDDINGS_POSTGRES_URL!)
const db = drizzle(sqlClient)

const generateEmbedding: CollectionAfterChangeHook = async ({ doc, collection }) => {
  try {
    console.log(`🛠️ Processing document for collection: "${collection.slug}"`)
    console.log(`📄 Received document:`, JSON.stringify(doc, null, 2))

    if (!doc || typeof doc !== 'object') {
      console.warn(`⚠️ No valid document provided for "${collection.slug}" – Skipping embedding.`)
      return doc
    }

    // ✅ Ensure documentId is valid
    let documentId = doc.id
    if (!documentId) {
      console.error(`❌ Missing document ID for "${collection.slug}" – Skipping embedding.`)
      return doc
    }

    if (typeof documentId === 'number') {
      console.warn(`⚠️ Document ID is a number. Converting to UUID format.`)
      documentId = convertNumberToUUID(documentId)
    }

    console.log(`✅ Final document ID (UUID format): ${documentId}`)

    // ✅ Extract all relevant text fields dynamically
    const rawText = extractRelevantText(doc, collection.slug)

    if (!rawText) {
      console.warn(`⚠️ No valid text content found for "${collection.slug}" – Skipping embedding.`)
      return doc
    }

    console.log(`🔍 Generating embedding for: "${collection.slug}" (${rawText.length} chars)...`)

    // ✅ Generate OpenAI embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: rawText,
    })

    const embeddingVector = embeddingResponse.data[0].embedding
    console.log(`✅ Embedding generated! (${embeddingVector.length} dimensions)`)

    console.log(`🛠️ Preparing to upsert into Neon DB...`)

    // ✅ Check if entry exists with BOTH `documentId` & `collectionSlug`
    const existingEntry = await db
      .select()
      .from(embeddings)
      .where(
        sql`${embeddings.documentId} = ${documentId} AND ${embeddings.collectionSlug} = ${collection.slug}`,
      )
      .execute()

    if (existingEntry.length > 0) {
      // ✅ If entry exists, update it
      await db
        .update(embeddings)
        .set({ embedding: embeddingVector, context: rawText, updatedAt: new Date() })
        .where(
          sql`${embeddings.documentId} = ${documentId} AND ${embeddings.collectionSlug} = ${collection.slug}`,
        )
        .execute()

      console.log(
        `✅ Updated embedding for document ID: ${documentId} in collection: "${collection.slug}"`,
      )
    } else {
      // ✅ If entry does not exist, insert a new one
      await db
        .insert(embeddings)
        .values({
          documentId,
          collectionSlug: collection.slug,
          embedding: embeddingVector,
          context: rawText,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute()

      console.log(
        `✅ Inserted new embedding for document ID: ${documentId} in collection: "${collection.slug}"`,
      )
    }

    return doc // ✅ Return original document
  } catch (error) {
    console.error('❌ Error generating embedding:', error)
    return doc // ✅ Prevent save failure
  }
}

/**
 * ✅ Extracts relevant text fields dynamically per collection type.
 */
const extractRelevantText = (doc: Record<string, unknown>, collectionSlug: string): string => {
  try {
    if (!doc || typeof doc !== 'object') {
      console.error(`❌ extractRelevantText received invalid document for "${collectionSlug}"`)
      return ''
    }

    const textSegments: string[] = []

    // ✅ Define collection-specific fields
    const collectionFields: Record<string, string[]> = {
      articles: ['title', 'content'],
      fineTuningPrompts: ['prompt', 'context'],
      hobbies: ['title', 'description'],
      projects: ['title', 'content'],
      skills: ['title', 'description'],
      workExperience: ['title', 'content'],
    }

    const textFields = collectionFields[collectionSlug] || ['title', 'content', 'description']

    textFields.forEach((field) => {
      if (typeof doc[field] === 'string') {
        textSegments.push(doc[field] as string) // ✅ Store plain strings
      } else if (doc[field] && typeof doc[field] === 'object') {
        textSegments.push(extractPlainText(doc[field])) // ✅ Extract Lexical Rich Text properly
      }
    })

    if (textSegments.length === 0) {
      console.warn(
        `⚠️ No valid text found for collection "${collectionSlug}" – Skipping embedding.`,
      )
    }

    return textSegments.join(' ').trim()
  } catch (error) {
    console.error(`❌ Failed to extract text for collection "${collectionSlug}":`, error)
    return ''
  }
}

/**
 * ✅ Extracts plain text from a Lexical Rich Text JSON structure.
 */
const extractPlainText = (richText: {
  root?: { children?: Array<{ type: string; text?: string; children?: unknown[] }> }
}): string => {
  try {
    if (!richText?.root?.children?.length) return ''

    const extractedText: string[] = []

    const traverseNodes = (nodes: Array<{ type: string; text?: string; children?: unknown[] }>) => {
      nodes.forEach((node) => {
        if (node.type === 'text' && node.text) {
          extractedText.push(node.text) // ✅ Extract text
        }
        if (node.children && Array.isArray(node.children)) {
          traverseNodes(
            node.children as Array<{ type: string; text?: string; children?: unknown[] }>,
          )
        }
      })
    }

    traverseNodes(richText.root.children)

    return extractedText.join(' ').trim()
  } catch (error) {
    console.error('❌ Failed to extract plain text:', error)
    return ''
  }
}

/**
 * ✅ Converts a number ID to a valid UUID format.
 */
const convertNumberToUUID = (num: number): string => {
  const hexString = num.toString(16).padStart(32, '0') // Convert number to hex and pad
  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}`
}

export default generateEmbedding
