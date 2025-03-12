import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function storeEmbedding(category: string, title: string, content: string) {
  try {
    // ✅ Generate OpenAI Embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding; // ✅ This is a number[]

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
      throw new Error("❌ Invalid embedding received from OpenAI.");
    }

    console.log(`🧠 Generated Embedding (${embedding.length} dimensions)`);

    // ✅ Use UPSERT to update if the title exists, otherwise insert a new record
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeBase" (id, category, title, content, embedding, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW())
       ON CONFLICT (title) DO UPDATE 
       SET category = $1, content = $3, embedding = $4::vector, "createdAt" = NOW()`,
      category,
      title,
      content,
      embedding
    );

    console.log(`✅ Upserted embedding for "${title}" in category "${category}"`);

  } catch (error) {
    console.error("❌ Error storing embedding:", error);
    throw error; // Ensure calling function knows if storage failed
  }
}
