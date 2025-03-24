import OpenAI from 'openai'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { embeddings } from '../../drizzle/schema'
import type { CollectionAfterChangeHook } from 'payload'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sqlClient = neon(process.env.EMBEDDINGS_POSTGRES_URL!)
const db = drizzle(sqlClient)

const generateEmbedding: CollectionAfterChangeHook = async ({ doc, collection }) => {
  try {
    if (!doc || typeof doc !== 'object') return doc

    let documentId = doc.id
    if (!documentId) return doc
    if (typeof documentId === 'number') {
      documentId = convertNumberToUUID(documentId)
    }

    const rawText = extractRelevantText(doc, collection.slug)
    const keywords = extractKeywords(doc)
    const chunks = chunkText(rawText, 300)

    // Delete old chunks
    await db
      .delete(embeddings)
      .where(
        sql`${embeddings.documentId} = ${documentId} AND ${embeddings.collectionSlug} = ${collection.slug}`,
      )
      .execute()

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      })

      const vector = embeddingResponse.data[0].embedding

      await db
        .insert(embeddings)
        .values({
          documentId,
          chunkIndex: i,
          title: doc.title ?? '',
          url: doc.url ?? '',
          timePeriod: doc.timePeriod ?? '',
          collectionSlug: collection.slug,
          embedding: vector,
          context: chunk,
          keywords,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute()
    }

    return doc
  } catch (error) {
    console.error('❌ Embedding generation error:', error)
    return doc
  }
}

function extractRelevantText(doc: Record<string, any>, slug: string): string {
  const segments: string[] = []
  const fields = {
    articles: ['title', 'content', 'keywords'],
    projects: ['title', 'content', 'keywords', 'url'],
    workExperience: ['title', 'content', 'keywords', 'url', 'timePeriod'],
    hobbies: ['title', 'description'],
    fineTuningPrompts: ['prompt', 'context'],
    qa: ['question', 'answer'],
    skills: ['title', 'description'],
  }[slug] || ['title', 'content']

  for (const field of fields) {
    const value = doc[field]
    if (typeof value === 'string') segments.push(value)
    if (field === 'keywords' && Array.isArray(value)) {
      const words = value.map((k: any) => k.keyword).join(', ')
      segments.push(`Keywords: ${words}`)
    }
    if (field === 'url' && value) segments.push(`URL: ${value}`)
    if (field === 'timePeriod' && value) segments.push(`Period: ${value}`)
    if (typeof value === 'object') segments.push(extractPlainText(value))
  }

  return segments.join(' ').trim()
}

function extractKeywords(doc: Record<string, any>): string[] {
  if (!Array.isArray(doc.keywords)) return []
  return doc.keywords.map((k: any) => k.keyword)
}

function extractPlainText(richText: any): string {
  try {
    if (!richText?.root?.children) return ''
    const output: string[] = []
    const walk = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.text) output.push(node.text)
        if (node.children) walk(node.children)
      }
    }
    walk(richText.root.children)
    return output.join(' ').trim()
  } catch {
    return ''
  }
}

function chunkText(text: string, chunkSize: number): string[] {
  const sentences = text.split(/(?<=[.?!])\s+/)
  const chunks: string[] = []
  let chunk: string[] = []
  let length = 0

  for (const sentence of sentences) {
    if (length + sentence.length > chunkSize) {
      chunks.push(chunk.join(' '))
      chunk = []
      length = 0
    }
    chunk.push(sentence)
    length += sentence.length
  }
  if (chunk.length > 0) chunks.push(chunk.join(' '))

  return chunks
}

function convertNumberToUUID(num: number): string {
  const hex = num.toString(16).padStart(32, '0')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export default generateEmbedding
