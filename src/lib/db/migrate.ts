import dotenv from 'dotenv'
import path from 'node:path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { sql } from 'drizzle-orm'
import { getClient, getDb } from './drizzle'

dotenv.config()

async function main() {
  const db = getDb()
  const client = getClient()

  if (!db || !client) {
    console.log('POSTGRES_URL is not set, skipping migrations.')
    return
  }

  await db.execute(sql`
    create extension if not exists pg_trgm;
  `)

  console.log('Created extension for fuzzy searching')

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), './drizzle'),
  })

  console.log('Migrations complete')
  await client.end()
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
