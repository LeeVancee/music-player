import dotenv from 'dotenv'
import { sql } from 'drizzle-orm'
import { getClient, getDb } from './drizzle'

dotenv.config()

async function main() {
  const db = getDb()
  const client = getClient()

  if (!db || !client) {
    console.log('POSTGRES_URL is not set, skipping truncate.')
    return
  }

  await db.execute(sql`
    TRUNCATE TABLE playlist_songs, playlists, songs RESTART IDENTITY CASCADE;
  `)

  console.log('All playlist and song data has been cleared.')
  await client.end()
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
