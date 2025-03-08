import { storeEmbedding } from "../../src/utils/storeData";

export async function seedProjects() {
  const projects = [
    {
      category: "Projects",
      title: "Nessi Fishing Supply",
      content: "Built an AI-driven marketplace for custom fishing gear using Next.js and AWS."
    },
    {
      category: "Projects",
      title: "AI Portfolio Chatbot",
      content: "Developed an AI-powered resume assistant using RAG and PostgreSQL."
    }
  ];

  for (const entry of projects) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Projects seeded!");
}
