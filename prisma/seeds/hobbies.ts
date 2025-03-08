import { storeEmbedding } from "../../src/utils/storeData";

export async function seedHobbies() {
  const hobbies = [
    {
      category: "Hobbies & Interests",
      title: "Fishing Enthusiast",
      content: "Passionate about bass fishing and exploring remote waters."
    },
    {
      category: "Hobbies & Interests",
      title: "Carpentry",
      content: "Enjoys building custom furniture and working on woodworking projects."
    }
  ];

  for (const entry of hobbies) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Hobbies seeded!");
}
