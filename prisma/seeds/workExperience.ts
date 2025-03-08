import { storeEmbedding } from "../../src/utils/storeData";

export async function seedWorkExperience() {
  const workExperience = [
    {
      category: "Work Experience",
      title: "Director of Engineering – Frontend & Design Systems, BRINK Interactive",
      content: "Scaled and led a 10-person engineering team, optimizing collaboration between CX, product, and UX teams while implementing hiring and mentorship best practices. Developed enterprise-scale, componentized design systems ensuring consistent cross-platform experiences. Built an ADA-compliant UI framework using React, TypeScript, and Web Performance Optimization techniques."
    },
    {
      category: "Work Experience",
      title: "Frontend Architect, Bounteous",
      content: "Designed and implemented Angular-based digital platforms for enterprise clients, enhancing performance and scalability. Led multiple teams and projects simultaneously, ensuring seamless execution while managing client relationships."
    },
    {
      category: "Work Experience",
      title: "Senior Frontend Engineer, Hathway (Acquired by Bounteous)",
      content: "Built a high-performance, ADA-compliant UI framework, used by 20+ national brands. Managed engineering teams across multiple projects, overseeing code reviews, deployments, and performance evaluations."
    }
  ];

  for (const entry of workExperience) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Work experience seeded!");
}
