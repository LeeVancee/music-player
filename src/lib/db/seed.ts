import fs from 'node:fs/promises'
import path from 'node:path'
import { parseBuffer } from 'music-metadata'
import { sql } from 'drizzle-orm'
import { getClient, getDb } from './drizzle'
import { songs } from './schema'

const SUPPORTED_AUDIO_EXTENSIONS = new Set(['.mp3', '.flac'])
const LOCAL_COVERS_DIR = path.join(process.cwd(), 'covers')
const TRACKS_DIR = path.join(process.cwd(), 'tracks')

function getMimeType(extension: string) {
  switch (extension) {
    case '.flac':
      return 'audio/flac'
    case '.mp3':
    default:
      return 'audio/mpeg'
  }
}

function getImageExtension(format: string | undefined) {
  switch (format) {
    case 'image/png':
      return '.png'
    case 'image/webp':
      return '.webp'
    case 'image/jpeg':
    case 'image/jpg':
    default:
      return '.jpg'
  }
}

async function clearSeedData() {
  const db = getDb()
  if (!db) {
    return
  }

  await db.execute(sql`
    TRUNCATE TABLE playlist_songs, playlists, songs RESTART IDENTITY CASCADE;
  `)

  try {
    await fs.rm(LOCAL_COVERS_DIR, { recursive: true, force: true })
  } catch {
    // covers/ may not exist yet
  }

  console.log('Cleared songs, playlists, and local covers.')
}

async function seedSongs() {
  const db = getDb()
  if (!db) {
    console.log('POSTGRES_URL is not set, skipping song seeding.')
    return
  }

  const files = await fs.readdir(TRACKS_DIR)

  await fs.mkdir(LOCAL_COVERS_DIR, { recursive: true })

  for (const file of files.filter((item) =>
    SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(item).toLowerCase()),
  )) {
    const extension = path.extname(file).toLowerCase()
    const filePath = path.join(TRACKS_DIR, file)
    const buffer = await fs.readFile(filePath)
    const metadata = await parseBuffer(buffer, { mimeType: getMimeType(extension) })

    let imageUrl: string | undefined

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0]
      const coverFileName = `${file}${getImageExtension(picture.format)}`

      await fs.writeFile(
        path.join(LOCAL_COVERS_DIR, coverFileName),
        Buffer.from(picture.data),
      )

      imageUrl = `/api/cover/${encodeURIComponent(coverFileName)}`
    }

    const songData = {
      name: metadata.common.title || path.parse(file).name,
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      duration: Math.round(metadata.format.duration || 0),
      genre: metadata.common.genre?.[0] || null,
      bpm: metadata.common.bpm ? Math.round(metadata.common.bpm) : null,
      key: metadata.common.key || null,
      imageUrl,
      audioUrl: `/api/audio/${encodeURIComponent(file)}`,
      isLocal: true,
    }

    await db.insert(songs).values(songData)
    console.log(`Seeded song: ${songData.name}`)
  }
}

async function main() {
  const client = getClient()

  if (!client) {
    console.log('POSTGRES_URL is not set, skipping seed process.')
    return
  }

  console.log('Starting seed process...')
  await clearSeedData()
  await seedSongs()
  console.log('Seed process completed successfully.')
  await client.end()
}

void main().catch((error) => {
  console.error('Seed process failed:', error)
  process.exit(1)
})
