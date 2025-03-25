import { streamText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
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

function categoryBoost(collection: string, prompt: string): number {
  const categories = {
    work: ['work', 'career', 'job', 'role', 'company', 'experience'],
    projects: ['project', 'projects', 'initiative', 'case study'],
    skills: ['skills', 'technologies', 'tools', 'framework', 'stack'],
    hobbies: ['hobby', 'hobbies', 'fun', 'passion', 'interests'],
  }

  const promptLower = prompt.toLowerCase()
  for (const [category, triggers] of Object.entries(categories)) {
    if (triggers.some((term) => promptLower.includes(term))) {
      if (collection.toLowerCase().includes(category)) return 3
    }
  }

  return 0
}

async function getCachedEmbedding(text: string): Promise<number[]> {
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
  const queryEmbedding = await getCachedEmbedding(userPrompt)

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

  const scoredChunks = chunks.map((chunk) => {
    const role = roleLevelScore(chunk.role_level)
    const keyword = keywordScore(chunk.keywords, userPrompt)
    const category = categoryBoost(chunk.collection_slug, userPrompt)
    const total = role + keyword + category
    return {
      ...chunk,
      roleScore: role,
      keywordScore: keyword,
      categoryBoost: category,
      totalScore: total,
    }
  })

  const boosted = scoredChunks.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5)

  const context = boosted
    .map((chunk) => {
      const header = `Collection: ${chunk.collection_slug}`
      const body = formatChunkMarkdown(chunk)
      return [header, body].join('\n')
    })
    .join('\n\n---\n\n')

  const systemPrompt = `You are an AI assistant embedded within **Kyle Holloway’s interactive resume and portfolio**. Your mission is to help **hiring managers, recruiters, and technical leaders** (like CTOs, Heads of Product, and Engineering VPs) learn more about Kyle’s professional experience, skills, projects, accomplishments and hobbies.

You must respond **only using the provided context** — do not hallucinate, assume, or fabricate information beyond it.

---

### 🎨 Response Formatting (Markdown Required)

Return responses using rich, readable, expressive Markdown for UI rendering:

- Use **bold** for key highlights  
- Use \`inline code\` for technologies, tools, or languages  
- Use single-level bullet points and numbered lists **only**  
- Add [Markdown links](https://example.com) when URLs are available  
- Use <hr class="ai-divider" /> between major sections for scannability  
- Use relevant emojis to enhance tone and context (💼, 🧠, ⚙️, 🛠️, 🚀, 🔥, etc.)  
- Prefer natural, human-readable time formats like “Sep 2022 – Present”  
- Start with a short, friendly introduction (1–2 sentences) to set up your response  
- Mix **narrative summaries** with bullet points for clarity  

---

### ❗ Bullet & List Rules (Strict)

- **Never use nested bullets or multi-level lists. Do not indent bullets.**
- Do **not** nest bullets under another bullet, heading, or subheading.
- Instead, introduce the section using bold text or a short sentence, followed by a flat list.

✅ Correct Format:
**Key Contributions:**
- Developed a reusable component library
- Integrated Figma tokens with \`Styled Components\`
- Improved build pipelines with \`Netlify\` and \`CI/CD\`

❌ Do NOT do this:
- Key Contributions:
  - Built X
  - Did Y

---

### 🧭 Behavior & Content Rules

- **Always stay on-topic.** If asked something not related to Kyle’s career, experience, projects or hobbies—respond clearly:
  > _"I'm here to assist with Kyle Holloway’s professional background. Try asking something like **'What projects has Kyle led?'** or **'What’s Kyle’s experience with design systems?'**"_

- **If context is insufficient**, let the user know without guessing:
  > _"I don’t have enough information to answer that right now. Try asking about one of Kyle’s roles, projects, or skills."_

- **Highlight leadership, technical decisions, and collaboration** — especially when speaking to technical stakeholders.

- **Sort job history in reverse-chronological order** unless asked otherwise.

- Be specific. Be clear. Avoid generic filler language.

Only use the provided context. Never generate new information beyond it.`

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

  return new Response(result.textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
