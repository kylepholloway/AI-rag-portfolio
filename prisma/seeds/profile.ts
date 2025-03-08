import { storeEmbedding } from "../../src/utils/storeData";

export async function seedProfile() {
  const profileData = [
    {
      category: "Profile",
      title: "Kyle Holloway - Engineering & Design Systems Leader",
      content: "Engineering & product leader with 15+ years of experience specializing in design systems, frontend engineering, AI-driven development, and cross-functional leadership. Expert in React, Next.js, TypeScript, and systematic design implementation, with a proven track record of scaling teams, aligning engineering and business goals, and improving product development efficiency."
    }
  ];

  for (const entry of profileData) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Profile seeded!");
}
