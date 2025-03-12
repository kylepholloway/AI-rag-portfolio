import { storeEmbedding } from "../../src/utils/storeEmbedding";

export async function seedProjects() {
  const projects = [
    {
      category: "Projects",
      title: "Quick Service Restaurants (QSR)",
      content: "Wingstop, Raising Cane’s, Panda Express, Denny’s, Red Robin, Peet’s Coffee, Blaze Pizza, Qdoba, California Pizza Kitchen, Cheesecake Factory, Carl’s Jr & Hardee’s, Noodles & Company."
    },
    {
      category: "Projects",
      title: "Non-Profits",
      content: "Focus on the Family, The Rockefeller Foundation, World Challenge, Ark Encounter, BigLife, Home to Home."
    },
    {
      category: "Projects",
      title: "Tech & Enterprise",
      content: "RE/MAX, BleacherReport, DynaEnergetics, FORM Technologies, Gigaphoton."
    }
  ];

  for (const entry of projects) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Projects seeded!");
}
