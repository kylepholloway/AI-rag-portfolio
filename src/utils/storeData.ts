import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function storeEmbedding(category: string, title: string, content: string) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: content,
  });

  const embedding = embeddingResponse.data[0].embedding;

  await prisma.knowledgeBase.create({
    data: {
      category,
      title,
      content,
      embedding,
    },
  });

  console.log(`✅ Stored embedding for ${title}`);
}
