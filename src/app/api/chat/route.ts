export const runtime = 'nodejs'

import { streamText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { serverLogger } from '@/utils/logger'
import { systemPrompt } from '@/utils/systemPrompt'

const sqlClient = neon(process.env.EMBEDDINGS_POSTGRES_URL!)
const db = drizzle(sqlClient)

interface EmbeddingResult {
  document_id: string
  chunk_index: number
  collection_slug: string
  title: string
  job_title?: string
  context: string
  keywords: string[]
  url?: string
  time_period?: string
  role_level?: number
}

function formatChunkMarkdown(chunk: EmbeddingResult): string {
  const roleLine =
    chunk.job_title && chunk.title
      ? `Job Title: ${chunk.job_title} at ${chunk.title}`
      : chunk.title
        ? `Title: ${chunk.title}`
        : ''

  const cleanTime = chunk.time_period?.replace(/^_+|_+$/g, '')

  const lines = [
    roleLine,
    cleanTime ? `Time: ${cleanTime}` : '',
    chunk.url ? `URL: ${chunk.url}` : '',
    chunk.context?.slice(0, 500).trim() ?? '',
  ]

  return lines.filter(Boolean).join('\n')
}

function roleLevelScore(level?: number): number {
  return typeof level === 'number' ? level : 3
}

function keywordScore(keywords: string[], prompt: string): number {
  const promptLower = prompt.toLowerCase()
  return keywords
    .filter((k): k is string => typeof k === 'string')
    .filter((k) => promptLower.includes(k.toLowerCase())).length
}

const boostValue = 3

function categoryBoost(collection: string, prompt: string): { value: number; keyword?: string } {
  const categories = {
    work: ['work', 'career', 'job', 'role', 'company', 'experience'],
    projects: ['project', 'projects', 'initiative', 'case study'],
    skills: ['skills', 'technologies', 'tools', 'framework', 'stack'],
    hobbies: ['hobby', 'hobbies', 'fun', 'passion', 'interests'],
  }

  const promptLower = prompt.toLowerCase()
  for (const [category, triggers] of Object.entries(categories)) {
    const match = triggers.find((term) => promptLower.includes(term))
    if (match && collection.toLowerCase().includes(category)) {
      return { value: boostValue, keyword: match }
    }
  }

  return { value: 0 }
}

async function getCachedEmbedding(text: string): Promise<number[]> {
  await serverLogger.proxy('Generating embedding vector (1536-dim)', 'embedding')
  const response = await embed({
    model: openai.embedding('text-embedding-ada-002'),
    value: text,
  })

  if (!response.embedding) {
    throw new Error('Embedding generation failed.')
  }

  return response.embedding
}

export async function POST(req: Request) {
  const { messages, userId } = await req.json()
  const userPrompt = messages.at(-1)?.content || ''
  await serverLogger.proxy(`Prompt received: “${userPrompt}”`, 'prompt')

  const queryEmbedding = await getCachedEmbedding(userPrompt)

  await serverLogger.proxy('Searching vector database for top 25 chunks', 'rag')
  const vectorQuery = sql`
    SELECT document_id, chunk_index, collection_slug, title, job_title, context, keywords, url, time_period, role_level
    FROM embeddings
    ORDER BY embedding <-> ${sql.raw(`'${JSON.stringify(queryEmbedding)}'::vector(1536)`)}
    LIMIT 25;
  `
  const dbResult = await db.execute(vectorQuery)

  const chunks: EmbeddingResult[] = dbResult.rows
    .map((row) => {
      if (!row.context) return null
      return {
        document_id: String(row.document_id ?? ''),
        chunk_index: Number(row.chunk_index ?? 0),
        collection_slug: String(row.collection_slug ?? ''),
        title: String(row.title ?? ''),
        job_title: row.job_title ? String(row.job_title) : undefined,
        context: String(row.context ?? ''),
        keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
        url: row.url ? String(row.url) : undefined,
        time_period: row.time_period ? String(row.time_period) : undefined,
        role_level:
          typeof row.role_level === 'number'
            ? row.role_level
            : row.role_level
              ? Number(row.role_level)
              : undefined,
      }
    })
    .filter(Boolean) as EmbeddingResult[]

  const boostLogSet = new Set<string>()

  const scoredChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const role = roleLevelScore(chunk.role_level)
      const keyword = keywordScore(chunk.keywords, userPrompt)
      const boostResult = categoryBoost(chunk.collection_slug, userPrompt)

      if (boostResult.value > 0 && !boostLogSet.has(chunk.collection_slug)) {
        boostLogSet.add(chunk.collection_slug)

        await serverLogger.proxy(
          `<div>⚙️ <strong>Category Boost Applied:</strong><br/>
             Detected keyword: <code>${boostResult.keyword}</code><br/>
             Boosting '<code>${chunk.collection_slug}</code>' collection → +${boostResult.value} weight</div>`,
          'boosting',
        )
      }

      const total = role + keyword + boostResult.value
      return {
        ...chunk,
        roleScore: role,
        keywordScore: keyword,
        categoryBoost: boostResult.value,
        totalScore: total,
      }
    }),
  )

  const boosted = scoredChunks.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5)

  const scoredListHTML = boosted
    .map(
      (chunk) =>
        `<li>"${chunk.title}" (${chunk.collection_slug}) – Score: ${chunk.totalScore}</li>`,
    )
    .join('')

  await serverLogger.proxy(`🎯 Top Scored Chunks:<ul>${scoredListHTML}</ul>`, 'scoring')

  const context = boosted
    .map((chunk) => {
      const header = `Collection: ${chunk.collection_slug}`
      const body = formatChunkMarkdown(chunk)
      return [header, body].join('\n')
    })
    .join('\n\n---\n\n')

  const estimatedTokens = Math.ceil(context.split(' ').length * 1.3)
  await serverLogger.proxy(`Estimated token count: ${estimatedTokens}`, 'tokens')
  await serverLogger.proxy('Compiled context and user prompt', 'context')
  await serverLogger.proxy('Sending to GPT-4.5-preview (streaming)', 'llm')

  const result = await streamText({
    model: openai.chat('gpt-4.5-preview'),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `Context:\n${context}` },
      ...messages,
    ],
    // @ts-expect-error Vercel SDK user field mismatch
    user: userId,
  })

  await serverLogger.proxy('Response streaming started', 'stream')

  return new Response(result.textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
