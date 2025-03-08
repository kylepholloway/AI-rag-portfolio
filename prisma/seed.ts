import { seedProfile } from "./seeds/profile";
import { seedSkills } from "./seeds/skills";
import { seedWorkExperience } from "./seeds/workExperience";
import { seedProjects } from "./seeds/projects";
import { seedHobbies } from "./seeds/hobbies";

async function main() {
  console.log("🌱 Starting database seeding...");
  
  await seedProfile();
  await seedSkills();
  await seedWorkExperience();
  await seedProjects();
  await seedHobbies();

  console.log("✅ All seeds completed!");
}

main()
  .catch((e) => {
    console.error("Error while seeding:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
