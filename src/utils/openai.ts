import OpenAI from 'openai'

// ✅ Initialize OpenAI with API Key from environment variables
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in .env
})
