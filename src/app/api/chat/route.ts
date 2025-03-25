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
  const lines = [
    chunk.title ? `Title: ${chunk.title}` : '',
    chunk.time_period ? `Time: ${chunk.time_period}` : '',
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

async function getCachedEmbedding(text: string): Promise<number[]> {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })

  if (!embeddingResponse.data?.length || !embeddingResponse.data[0].embedding) {
    throw new Error('Embedding generation failed.')
  }

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

    const chunks: EmbeddingResult[] = result.rows

      .map((row) => {
        if (!row.context) return null
        return {
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
        }
      })
      .filter(Boolean) as EmbeddingResult[]

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

    const context = boosted
      .map((chunk) => {
        const header = `Collection: ${chunk.collection_slug}`
        const body = formatChunkMarkdown(chunk)
        return [header, body].join('\n')
      })
      .join('\n\n---\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant embedded within **Kyle Holloway’s interactive resume and portfolio**. Your mission is to help **hiring managers, recruiters, and technical leaders** (like CTOs, Heads of Product, and Engineering VPs) learn more about Kyle’s professional experience, skills, and accomplishments.
        
        You must respond **only using the provided context** — do not hallucinate, assume, or fabricate information beyond it.
        
        ---
        
        ### 🎨 Response Formatting (Markdown Required)
        
        Return responses using rich, readable, expressive Markdown for UI rendering:
        
        - Use **bold** for key highlights  
        - Use \`inline code\` for technologies, tools, or languages  
        - Use single-level bullet points and numbered lists  
        - Add [Markdown links](https://example.com) when URLs are available  
        - Use <hr class="ai-divider" /> between major sections  
        - Add relevant emojis to emphasize industries, tech, or achievements (💼, 🧠, ⚙️, 🛠️, etc.)  
        - Prefer natural, human-readable time formats like “Sep 2022 – Present”  
        - Mix **brief narrative summaries** with bullet points for better flow  
        - Never use nested lists
        
        ---
        
        ### 🧭 Behavior & Content Rules
        
        - **Always stay on-topic.** If asked something not related to Kyle’s career, respond clearly:
          > _"I'm here to assist with Kyle Holloway’s professional background. Try asking something like **'What projects has Kyle led?'** or **'What’s Kyle’s experience with design systems?'**"_
        
        - **If context is insufficient**, let the user know without guessing:
          > _"I don’t have enough information to answer that right now. Try asking about one of Kyle’s roles, projects, or skills."_
        
        - **Highlight leadership, technical decisions, and collaboration** — especially when speaking to technical stakeholders.
        
        - **Sort job history in reverse-chronological order** unless asked otherwise.
        
        - Be specific. Be clear. Avoid generic filler language.
        
        Only use the provided context. Never generate new information beyond it.`,
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
