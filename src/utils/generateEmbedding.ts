import OpenAI from 'openai'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { embeddings } from '../../drizzle/schema'
import type { CollectionAfterChangeHook } from 'payload'

// ✅ Initialize OpenAI & Drizzle Neon connection
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sqlClient = neon(process.env.EMBEDDINGS_DATABASE_URL!)
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

    // ✅ Extract relevant text fields dynamically
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

    // ✅ Use UPSERT to avoid duplicate rows
    await db
      .insert(embeddings)
      .values({
        documentId,
        collectionSlug: collection.slug,
        embedding: embeddingVector,
      })
      .onConflictDoUpdate({
        target: embeddings.documentId, // ✅ Now using a UNIQUE column
        set: { embedding: embeddingVector, updatedAt: new Date() },
      })

    console.log(`✅ Successfully upserted embedding for document ID: ${documentId}`)

    return doc // ✅ Return original document
  } catch (error) {
    console.error('❌ Error generating embedding:', error)
    return doc // ✅ Prevent save failure
  }
}

/**
 * ✅ Extracts relevant text fields from different collections dynamically.
 */
const extractRelevantText = (doc: any, collectionSlug: string): string => {
  try {
    if (!doc || typeof doc !== 'object') {
      console.error(`❌ extractRelevantText received invalid document for "${collectionSlug}"`)
      return ''
    }

    let textSegments: string[] = []

    // ✅ Common text fields across collections
    const textFields = ['title', 'content', 'description', 'question', 'answer', 'summary']

    textFields.forEach((field) => {
      if (doc[field] && typeof doc[field] === 'string') {
        textSegments.push(doc[field])
      } else if (doc[field] && typeof doc[field] === 'object') {
        textSegments.push(extractPlainText(doc[field])) // ✅ Extract from Lexical RichText
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
const extractPlainText = (richText: any): string => {
  try {
    if (!richText?.root?.children) return ''
    return richText.root.children.map((node: any) => (node.text ? node.text : '')).join(' ')
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
