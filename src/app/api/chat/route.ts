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

    // Step 1: Fetch top 10 most similar chunks
    const vectorQuery = sql`
      SELECT document_id, chunk_index, collection_slug, title, context, keywords, url, time_period
      FROM embeddings
      ORDER BY embedding <-> ${sql.raw(`'${JSON.stringify(queryEmbedding)}'::vector(1536)`)}
      LIMIT 10;
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

    // Step 2: Keyword boost: simple string matching to reorder
    const boosted = chunks.sort((a, b) => {
      const aMatch = keywordScore(a.keywords, userPrompt)
      const bMatch = keywordScore(b.keywords, userPrompt)
      return bMatch - aMatch
    })

    // Step 3: Limit context to top 5 chunks
    const selectedChunks = boosted.slice(0, 5)
    const context = selectedChunks
      .map((chunk) => {
        const urlLine = chunk.url ? `URL: ${chunk.url}` : ''
        const periodLine = chunk.time_period ? `Period: ${chunk.time_period}` : ''
        return `[${chunk.collection_slug.toUpperCase()} - ${chunk.title}]
Chunk: ${chunk.chunk_index}
${periodLine}
Keywords: ${chunk.keywords.join(', ')}
${urlLine}
Content: ${chunk.context}`
      })
      .join('\n\n')

    // Step 4: Query GPT-4
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant embedded within Kyle Holloway's AI-based portfolio.
Only answer questions that pertain directly to Kyle Holloway’s career, skills, projects, experience and hobbies.
Only use the provided context chunks — do not hallucinate or assume facts.
Always cite collection titles (e.g., 'BRINK Interactive') where possible to add clarity.
If a URL is provided, format it as a Markdown link or button.
Format responses with rich Markdown — use **bold**, bullet points, and lists to improve readability.
Include any available time period if mentioned.`,
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
