import { buildConfig } from 'payload'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { WorkExperience } from './collections/WorkExperience'
import { Projects } from './collections/Projects'
import { Skills } from './collections/Skills'
import { Hobbies } from './collections/Hobbies'
import { Articles } from './collections/Articles'
import { QA } from './collections/QA'
import { FineTuningPrompts } from './collections/FineTuning'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    WorkExperience,
    Projects,
    Skills,
    Hobbies,
    Articles,
    QA,
    FineTuningPrompts,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  sharp,
  plugins: [payloadCloudPlugin()],
})
