import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config({ path: '.env' }) // Ensures environment variables are loaded

// Initialize Neon connection
const sql = neon(process.env.EMBEDDINGS_DATABASE_URL!)

// Export Drizzle ORM instance
export const db = drizzle(sql)
