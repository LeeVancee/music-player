import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const url = process.env.POSTGRES_URL

if (!url) {
  throw new Error('POSTGRES_URL environment variable is required for drizzle-kit')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url,
  },
  verbose: true,
  strict: true,
})
