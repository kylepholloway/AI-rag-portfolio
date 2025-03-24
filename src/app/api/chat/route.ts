// app/api/chat/route.ts
import { openai } from '@/utils/openai'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'

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
}

function formatChunkMarkdown(chunk: EmbeddingResult): string {
  const title = chunk.title ?? 'Untitled'
  const date = chunk.time_period ? `\n<span class="ai-date">${chunk.time_period}</span>` : ''
  const url = chunk.url && title ? `\n\n[${title}](${chunk.url})` : ''
  return `### ${title}${date}\n\n${chunk.context}${url}`
}

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = messages[messages.length - 1]?.content || ''
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: userPrompt,
    })

    const queryEmbedding = embeddingResponse?.data?.[0]?.embedding ?? []
    if (queryEmbedding.length !== 1536) {
      return new Response(JSON.stringify({ error: 'Invalid embedding generated.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const vectorQuery = sql`
      SELECT document_id, chunk_index, collection_slug, title, context, keywords, url, time_period
      FROM embeddings
      ORDER BY embedding <-> ${sql.raw(`'${JSON.stringify(queryEmbedding)}'::vector(1536)`)}
      LIMIT 50;
    `

    const result = await db.execute(vectorQuery)
    const chunks: EmbeddingResult[] = result.rows.map((row) => ({
      document_id: row.document_id as string,
      chunk_index: row.chunk_index as number,
      collection_slug: row.collection_slug as string,
      title: row.title as string,
      context: row.context as string,
      keywords: row.keywords as string[],
      url: row.url as string,
      time_period: row.time_period as string,
    }))

    const boosted = chunks.sort((a, b) => {
      const aMatch = keywordScore(a.keywords, userPrompt)
      const bMatch = keywordScore(b.keywords, userPrompt)
      return bMatch - aMatch
    })

    const selectedChunks = boosted.slice(0, 5)

    const context = selectedChunks.map(formatChunkMarkdown).join('\n\n---\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant embedded within Kyle Holloway's AI-based portfolio.

Only answer questions that pertain directly to Kyle Holloway’s career, skills, projects, and experience.
Only use the provided context chunks — do not hallucinate or assume facts.

Format responses with rich, **flexible** Markdown:
- Use **bold**, bullet points, inline code, numbered lists.
- Place all external links at the **end of each chunk**, never inline or inside lists.
- Format links as [Label](https://url) where Label is the client or project name — not the raw URL.
- Use <span class="ai-date">date</span> for time references if useful.
- Use <hr class="ai-divider" /> to visually separate sections.
- Let structure emerge naturally based on content. Don't force a template.
- Use tasteful emojis to emphasize technologies, brands, or achievements.`,
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
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Chat error:', error)
    return new Response(JSON.stringify({ error: 'Unexpected error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function keywordScore(keywords: string[], prompt: string): number {
  const promptLower = prompt.toLowerCase()
  return keywords.filter((k) => promptLower.includes(k.toLowerCase())).length
}
