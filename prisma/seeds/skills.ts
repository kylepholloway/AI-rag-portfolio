import { storeEmbedding } from "../../src/utils/storeData";

export async function seedSkills() {
  const skills = [
    {
      category: "Skills",
      title: "Frontend Development & Design Systems",
      content: "Angular, React, Next.js, Gatsby, Ionic, TypeScript, JavaScript (ES6+), Redux, Storybook, Atomic Design Systems, Scalable Component Libraries, Systematic UI Architecture, Design Tokens, Web Performance Optimization."
    },
    {
      category: "Skills",
      title: "Backend & API Development",
      content: "Node.js, Nest.js, Express.js, REST APIs, GraphQL, MySQL, Postgres, Firebase."
    },
    {
      category: "Skills",
      title: "AI & Automation Tools",
      content: "Custom GPT for Development Ticketing, RAG Architecture, GitHub Copilot, ChatGPT, AI-driven Unit Testing, Storybook Story Generation, AI-based Linting, ADA Compliance Automation."
    },
    {
      category: "Skills",
      title: "DevOps & Infrastructure",
      content: "AWS, Vercel, Netlify, CI/CD Pipelines, Docker, Kubernetes, Microservices, MACH Architecture."
    },
    {
      category: "Skills",
      title: "Design & Product Strategy",
      content: "Figma, Adobe Suite (Photoshop, Illustrator, XD), UI/UX, Product Design, User Research, Accessibility (WCAG Compliance), Brand Strategy."
    }
  ];

  for (const entry of skills) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Skills seeded!");
}
