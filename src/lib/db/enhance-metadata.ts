import { desc, eq } from 'drizzle-orm'
import { getClient, getDb } from './drizzle'
import { songs } from './schema'

function normalizeTitle(title: string) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\s+\(\s*/g, ' (')
    .trim()
}

async function main() {
  const db = getDb()
  const client = getClient()

  if (!db || !client) {
    console.log('POSTGRES_URL is not set, skipping metadata enhancement.')
    return
  }

  const allSongs = await db.select().from(songs).orderBy(desc(songs.createdAt))

  console.log(`Processing ${allSongs.length} songs...`)

  for (const song of allSongs) {
    const nextTitle = normalizeTitle(song.name)

    if (nextTitle === song.name) {
      continue
    }

    await db.update(songs).set({ name: nextTitle }).where(eq(songs.id, song.id))
    console.log(`Updated metadata for: ${nextTitle}`)
  }

  await client.end()
  console.log('Metadata enhancement completed.')
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
