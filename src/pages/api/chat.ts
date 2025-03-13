import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { messages, userId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    console.log("🔹 Received Messages:", messages);

    const userPrompt = messages[messages.length - 1]?.content || "Unknown query";

    // ✅ Step 1: Generate an embedding for the latest user query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: userPrompt,
    });

    const embedding = embeddingResponse?.data?.[0]?.embedding ?? null;
    if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
      return res.status(500).json({ error: "Invalid embedding generated by OpenAI." });
    }

    console.log("✅ Embedding Generated:", embedding.slice(0, 5), "... (truncated)");

    // ✅ Step 2: Perform vector similarity search using the retrieved embedding
    let results: { title: string; content: string }[] = [];

    try {
      console.log("🔍 Running Vector Search Query...");
      results = await prisma.$queryRawUnsafe<
        { title: string; content: string }[]
      >(
        `SELECT title, content FROM "KnowledgeBase" WHERE embedding IS NOT NULL ORDER BY embedding <-> CAST($1 AS vector) LIMIT 3`,
        embedding
      );
    } catch (dbError) {
      console.error("❌ Database Query Failed:", dbError); // ✅ Now dbError is used
      return res.status(500).json({ error: "Database query failed." });
    }


    const context = results
      .map((entry) => `Title: ${entry.title}\nContent: ${entry.content}`)
      .join("\n\n");

    console.log("📄 Retrieved Context for AI:", context);

    // ✅ Step 3: Pass full chat history & retrieved context to OpenAI (With Logging)
    console.log("🤖 Sending Full Conversation to GPT...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI assistant helping answer questions about Kyle Holloway's career and expertise. Use the provided context when available." },
        { role: "system", content: `Context:\n${context}` },
        ...messages
      ],
      user: userId, // ✅ Tracks user messages in OpenAI dashboard
    });

    const aiResponse = response.choices[0].message.content ?? "No response received"; // ✅ Ensure it’s always a string

    // ✅ Step 4: Store user queries & AI responses in your DB
    await prisma.userQueries.create({
      data: {
        query: userPrompt,
        response: aiResponse, // ✅ Fixed potential null issue
        createdAt: new Date(),
      },
    });

    console.log("✅ Stored User Query & AI Response in DB");

    console.log("✅ OpenAI Response Received!");
    res.status(200).json({ reply: aiResponse });

  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
