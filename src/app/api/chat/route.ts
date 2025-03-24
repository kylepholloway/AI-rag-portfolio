// app/api/chat/route.ts
import { openai } from '@/utils/openai'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import crypto from 'crypto'

const sqlClient = neon(process.env.EMBEDDINGS_POSTGRES_URL!)
const db = drizzle(sqlClient)

interface EmbeddingResult {
  document_id: string
  chunk_index: number
  collection_slug: string
  title: string
  context: string
  keywords: string[]
  url?: string
  time_period?: string
  role_level?: number
}

function formatChunkMarkdown(chunk: EmbeddingResult): string {
  const title = chunk.title ?? ''
  const date = chunk.time_period ? ` <span class="ai-date">${chunk.time_period}</span>` : ''
  const url = chunk.url ? `\n\n[${title}](${chunk.url})` : ''
  const context = chunk.context?.slice(0, 500).trim()
  return `### ${title}${date}\n\n${context}${url}`
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

async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = crypto.createHash('sha256').update(text).digest('hex')
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })
  return embeddingResponse.data[0].embedding
}

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()
    if (!Array.isArray(messages)) {
      return Response.json({ error: 'Messages array is required.' }, { status: 400 })
    }

    const userPrompt = messages.at(-1)?.content || ''
    const queryEmbedding = await getCachedEmbedding(userPrompt)

    const vectorQuery = sql`
    SELECT document_id, chunk_index, collection_slug, title, context, keywords, url, time_period, role_level
    FROM embeddings
    ORDER BY embedding <-> ${sql.raw(`'${JSON.stringify(queryEmbedding)}'::vector(1536)`)}
    LIMIT 25;
  `

    const result = await db.execute(vectorQuery)

    const chunks: EmbeddingResult[] = result.rows.map((row) => ({
      document_id: String(row.document_id ?? ''),
      chunk_index: Number(row.chunk_index ?? 0),
      collection_slug: String(row.collection_slug ?? ''),
      title: String(row.title ?? ''),
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
    }))

    const scoredChunks = chunks.map((chunk) => {
      const role = roleLevelScore(chunk.role_level)
      const keyword = keywordScore(chunk.keywords, userPrompt)
      const total = role + keyword
      return { ...chunk, roleScore: role, keywordScore: keyword, totalScore: total }
    })

    // Log all scoring
    console.log('\n🔎 Chunk Scores:')
    scoredChunks.forEach((c, i) =>
      console.log(
        `#${i + 1} → [${c.title}] (${c.collection_slug}) → Role: ${c.roleScore}, Keyword: ${c.keywordScore}, Total: ${c.totalScore}`,
      ),
    )

    const boosted = scoredChunks.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3)

    console.log('\n✅ Final Selected Chunks:')
    boosted.forEach((c, i) =>
      console.log(`#${i + 1} → [${c.title}] (${c.collection_slug}) → Total: ${c.totalScore}`),
    )

    const context = boosted.map(formatChunkMarkdown).join('\n\n---\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant embedded within Kyle Holloway's AI-based portfolio.
Only answer questions that pertain directly to Kyle Holloway’s career, skills, projects, and experience.
Only use the provided context chunks — do not hallucinate or assume facts.

Format responses with rich, **flexible** Markdown:
- Use **bold**, bullet points, inline code, numbered lists, and links.
- Use semantic spans like <span class="ai-date">date</span> when they enhance clarity.
- Use <hr class="ai-divider" /> to visually break sections.
- Let structure emerge naturally based on the content, not rigid templates.
- Use tasteful emojis to highlight technologies, brands, or achievements.

Technical content should be prioritized over design content unless the question specifically refers to design or visual topics.
If the context is not sufficient, clearly state that rather than assuming or generating unsupported details.`,
        },
        {
          role: 'system',
          content: `Context:\n${context}`,
        },
        ...messages,
      ],
      user: userId,
    })

    const reply = response.choices[0]?.message?.content ?? 'No response.'
    return Response.json({ reply })
  } catch (error) {
    console.error('❌ Chat error:', error)
    return Response.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
