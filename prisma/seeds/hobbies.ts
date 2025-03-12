import { storeEmbedding } from "../../src/utils/storeEmbedding";

export async function seedHobbies() {
  const hobbies = [
    {
      category: "Hobbies & Interests",
      title: "Fishing Enthusiast",
      content: "Passionate about bass fishing and exploring remote waters. Bass, walleye, trout, pike and everything in between. I fish off of a bass tracker and get out whenever I can."
    },
    {
      category: "Hobbies & Interests",
      title: "Carpentry",
      content: "Enjoys building custom furniture and working on woodworking projects."
    },
    {
      category: "Hobbies & Interests",
      title: "Automotive Enthusiast",
      content: "Love working on my cars. Lifted vehicles for offroad with custom suspensions and lights. I have a full auto shop in my back yard and love taking care of my vehicles and making upgrades and modifications."
    },
    {
      category: "Hobbies & Interests",
      title: "Softball Player",
      content: "Play softball frequently. Played baseball all my life and now play softball league and tournament events and really enjoy the sport."
    },
    {
      category: "Hobbies & Interests",
      title: "Weight Lifting",
      content: "Really like weight lifting as well. I try to go every morning."
    }
  ];

  for (const entry of hobbies) {
    await storeEmbedding(entry.category, entry.title, entry.content);
  }
  console.log("✅ Hobbies seeded!");
}
