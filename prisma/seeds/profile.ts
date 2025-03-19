import { storeEmbedding } from "../../app/utils/storeEmbedding";

export async function seedProfile() {
  const profileData = [
    {
      category: "Profile",
      title: "Kyle Holloway - Engineering & Design Systems Leader",
      content: "Engineering & product leader with 15+ years of experience specializing in design systems, frontend engineering, AI-driven development, and cross-functional leadership. Proven ability to discern technical requirements from non-technical stakeholders and bridge gaps between engineering, product, and business teams. Expert in JavaScript with 12 years of experience, including leveraging frontend frameworks like Angular, React, and Next.js, as well as server-side implementations. Strong track record in sales activities, client engagement, and securing new business. Passionate about scalable UI/UX solutions, front-end performance optimization, and technical leadership. Adept at hiring, mentoring, and aligning engineering and design strategies with business objectives."
    }
  ];

  for (const entry of profileData) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Profile seeded!");
}
