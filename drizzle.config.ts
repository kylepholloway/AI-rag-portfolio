import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

export default defineConfig({
  schema: './drizzle/schema.ts', // Update path if needed
  out: './migrations', // Where migrations will be stored
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.EMBEDDINGS_POSTGRES_URL!, // Use the correct environment variable
  },
})
