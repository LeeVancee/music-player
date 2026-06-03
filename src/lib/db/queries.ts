import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { getDb, hasDb } from './drizzle'
import { playlists, playlistSongs, songs } from './schema'

export async function getAllSongs() {
  const db = getDb()
  if (!db || !hasDb()) return []
  return db.select().from(songs).orderBy(asc(songs.name))
}

export async function getSongById(id: string) {
  const db = getDb()
  if (!db || !hasDb()) return null
  return db.query.songs.findFirst({
    where: eq(songs.id, id),
  })
}

export async function getAllPlaylists() {
  const db = getDb()
  if (!db || !hasDb()) return []
  return db.select().from(playlists).orderBy(desc(playlists.createdAt))
}

export async function getPlaylistWithSongs(id: string) {
  const db = getDb()
  if (!db || !hasDb()) return null

  const result = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    with: {
      playlistSongs: {
        columns: {
          order: true,
        },
        with: {
          song: true,
        },
        orderBy: asc(playlistSongs.order),
      },
    },
  })

  if (!result) {
    return null
  }

  const playlistSongsWithOrder = result.playlistSongs.map((playlistSong) => ({
    ...playlistSong.song,
    order: playlistSong.order,
  }))

  return {
    ...result,
    songs: playlistSongsWithOrder,
    trackCount: playlistSongsWithOrder.length,
    duration: playlistSongsWithOrder.reduce(
      (total, song) => total + song.duration,
      0,
    ),
  }
}

export async function createPlaylist(id: string, name: string, coverUrl?: string) {
  const db = getDb()
  if (!db || !hasDb()) {
    return {
      id,
      name,
      coverUrl: coverUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  const result = await db
    .insert(playlists)
    .values({ id, name, coverUrl })
    .returning()

  return result[0]
}

export async function updatePlaylist(
  id: string,
  name?: string,
  coverUrl?: string,
) {
  const db = getDb()
  const payload: {
    name?: string
    coverUrl?: string
    updatedAt: Date
  } = {
    updatedAt: new Date(),
  }

  if (typeof name === 'string') {
    payload.name = name
  }

  if (typeof coverUrl === 'string') {
    payload.coverUrl = coverUrl
  }

  if (!db || !hasDb()) {
    return {
      id,
      name: payload.name ?? '',
      coverUrl: payload.coverUrl ?? null,
      createdAt: new Date(),
      updatedAt: payload.updatedAt,
    }
  }

  const result = await db
    .update(playlists)
    .set(payload)
    .where(eq(playlists.id, id))
    .returning()

  return result[0]
}

export async function deletePlaylist(id: string) {
  const db = getDb()
  if (!db || !hasDb()) return { success: false }
  await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, id))
  return db.delete(playlists).where(eq(playlists.id, id))
}

export async function searchSongs(searchTerm: string) {
  const db = getDb()
  if (!db || !hasDb()) return []

  const similarityExpression = sql`GREATEST(
    similarity(${songs.name}, ${searchTerm}),
    similarity(${songs.artist}, ${searchTerm}),
    similarity(COALESCE(${songs.album}, ''), ${searchTerm})
  )`

  return db
    .select({
      id: songs.id,
      name: songs.name,
      artist: songs.artist,
      album: songs.album,
      duration: songs.duration,
      imageUrl: songs.imageUrl,
      audioUrl: songs.audioUrl,
      genre: songs.genre,
      bpm: songs.bpm,
      key: songs.key,
      isLocal: songs.isLocal,
      createdAt: songs.createdAt,
      updatedAt: songs.updatedAt,
      similarity: sql`${similarityExpression}::float`,
    })
    .from(songs)
    .orderBy(desc(similarityExpression), asc(songs.name))
    .limit(50)
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  const db = getDb()
  if (!db || !hasDb()) {
    return { success: false, message: 'Database is not configured' }
  }

  const existingEntry = await db
    .select()
    .from(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId),
      ),
    )
    .execute()

  if (existingEntry.length > 0) {
    return { success: false, message: 'Song is already in the playlist' }
  }

  const maxOrderResult = await db
    .select({ maxOrder: sql<number>`MAX(${playlistSongs.order})` })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .execute()

  const newOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1

  await db
    .insert(playlistSongs)
    .values({
      playlistId,
      songId,
      order: newOrder,
    })
    .execute()

  return { success: true, message: 'Song added to playlist successfully' }
}

export async function updateSong(
  trackId: string,
  data: Partial<typeof songs.$inferInsert>,
) {
  const db = getDb()
  if (!db || !hasDb()) return
  await db.update(songs).set(data).where(eq(songs.id, trackId))
}
