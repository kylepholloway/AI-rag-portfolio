import { storeEmbedding } from "../../app/utils/storeEmbedding";

export async function seedWorkExperience() {
  const workExperience = [
    {
      category: "Work Experience",
      title: "Director of Engineering – Frontend & Design Systems, BRINK Interactive",
      content: "Scaled and led a 10-person engineering team, optimizing collaboration between CX, product, and UX teams while implementing hiring and mentorship best practices. Developed enterprise-scale, componentized design systems using React, Next.js, Angular, Ionic, and scalable component architecture, ensuring consistent cross-platform experiences. Built a scalable, ADA-compliant UI framework using React, TypeScript, and Web Performance Optimization techniques, enhancing accessibility and performance. Integrated and customized PayloadCMS, Contentful, and ContentStack, streamlining content workflows for enterprise clients. Implemented RAG Architecture for a high-profile real estate client, enhancing AI-driven content retrieval and system intelligence. Developed a custom GPT-powered AI tool for automated development ticket creation, ensuring tickets include consistent AC, requirements, test cases, and summaries for stories, bugs, and spikes. Leveraged GitHub Copilot for AI-assisted pair programming, improving unit testing, Storybook stories, linting, and ADA compliance automation. Contributed to $5M in secured sales by participating in engineering and CX sales cycles, demonstrating technical vision and product strategy to clients."
    },
    {
      category: "Work Experience",
      title: "Frontend Architect, Bounteous",
      content: "Designed and implemented Angular-based digital platforms for enterprise clients, enhancing performance and scalability. Led multiple teams and projects simultaneously, ensuring seamless execution while managing client relationships, stakeholder communications, and team performance. Standardized component libraries and design tokens, improving UI/UX and cross-platform consistency across Angular builds, hybrid apps, native apps, and martech stacks. Spearheaded frontend architecture for high-traffic hybrid SaaS applications in the QSR space, improving product scalability and user experience."
    },
    {
      category: "Work Experience",
      title: "Senior Frontend Engineer, Hathway (Acquired by Bounteous)",
      content: "Built a high-performance, ADA-compliant UI framework, used by 20+ national brands. Managed engineering teams across multiple projects, overseeing code reviews, deployments, and performance evaluations. Improved time-to-market by refining design-to-development handoff processes, accelerating release cycles. Led initiatives to improve frontend performance through optimizations in Angular, Ionic, and TypeScript. Developed and integrated loyalty program features within large-scale QSR digital experiences."
    },
    {
      category: "Work Experience",
      title: "Frontend Developer & UX Designer, The Moore Agency",
      content: "Designed and developed responsive websites using Drupal, WordPress, and custom React components. Enhanced site performance using Google Analytics & Tag Manager. Created UI prototypes and design mockups, improving stakeholder approval cycles."
    },
    {
      category: "Work Experience",
      title: "Designer / Developer, World Challenge",
      content: "Responsible for art direction, branding, web design and maintenance, user interaction and experience, social media, print production, print buying and general design of outreaches, campaigns and strategic objectives of World Challenge, INC. Communicating with internal departments and vendors to meet tight deadlines and stay within budget. Designing within brand standards for small and large print formats as well as web, video and social media. Working on several projects simultaneously to provide strategic, distinct, successful design always keeping the user in mind."
    },
    {
      category: "Work Experience",
      title: "Graphic Designer, Diverge Branding (Acquired by JDA Worldwide)",
      content: "Branding, UI design, graphic design and marketing strategy. Communicating with marketing managers and clients to achieve tight deadlines and provide target specific design comps. Presenting concepts and explanation of design work to clients. Juggling multiple clients and projects simultaneously."
    },
    {
      category: "Work Experience",
      title: "Web Designer / Developer, JDA Worldwide",
      content: "After Diverge Branding was acquired—I stepped into a hybrid role where I was responsible for UI/UX design, web design and web development. Communicating and collaborating with directors for best results. Client pitches and presentations of concepts and prototypes. Responsible for developing client websites, maintaining client email signatures, WordPress installations/updates, and website content updates."
    },
    {
      category: "Work Experience",
      title: "Early Career Experience",
      content: "Prior roles include UX/UI and web design positions at JDA Worldwide, Diverge Branding, and World Challenge, Inc. Focused on brand development, UX strategy, and digital product design across web and print platforms."
    }
  ];

  for (const entry of workExperience) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Work experience seeded!");
}
