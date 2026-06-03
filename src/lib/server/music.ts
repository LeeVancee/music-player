import { promises as fs } from 'node:fs'
import path from 'node:path'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getAllSongs,
  getPlaylistWithSongs,
  searchSongs,
  updatePlaylist,
  updateSong,
} from '@/lib/db/queries'
import { hasDb } from '@/lib/db/drizzle'

type PlaylistInput = {
  id: string
  name: string
}

type PlaylistNameInput = {
  playlistId: string
  name: string
}

type PlaylistTrackInput = {
  playlistId: string
  songId: string
}

type PlaylistIdInput = {
  id: string
}

type TrackUpdateInput = {
  trackId: string
  field: 'name' | 'artist' | 'genre' | 'album' | 'bpm' | 'key'
  value: string
}

function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`)
  }

  return value.trim()
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function writeUploadedFile(file: File, prefix: string) {
  const coversDirectory = path.join(process.cwd(), 'covers')
  await fs.mkdir(coversDirectory, { recursive: true })

  const filename = `${prefix}-${sanitizeFilename(file.name)}`
  const filePath = path.join(coversDirectory, filename)
  const buffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(filePath, buffer)

  return `/api/cover/${encodeURIComponent(filename)}`
}

export const getAllPlaylistsServerFn = createServerFn({ method: 'GET' }).handler(
  async () => getAllPlaylists(),
)

export const getAllSongsServerFn = createServerFn({ method: 'GET' }).handler(
  async () => getAllSongs(),
)

export const searchSongsServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { q?: string }) => ({
    q: typeof data?.q === 'string' ? data.q : '',
  }))
  .handler(async ({ data }) => {
    const query = data.q.trim()

    if (!query) {
      return getAllSongs()
    }

    return searchSongs(query)
  })

export const getPlaylistServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { id?: string }) => ({
    id: requireString(data?.id, 'playlist id'),
  }))
  .handler(async ({ data }) => {
    const playlist = await getPlaylistWithSongs(data.id)

    if (!playlist) {
      throw notFound()
    }

    return playlist
  })

export const createPlaylistServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: PlaylistInput) => ({
    id: requireString(data?.id, 'playlist id'),
    name: requireString(data?.name, 'playlist name'),
  }))
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return {
        id: data.id,
        name: data.name,
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return createPlaylist(data.id, data.name)
  })

export const deletePlaylistServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: PlaylistIdInput) => ({
    id: requireString(data?.id, 'playlist id'),
  }))
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return { success: false }
    }

    await deletePlaylist(data.id)
    return { success: true }
  })

export const updatePlaylistNameServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: PlaylistNameInput) => ({
    playlistId: requireString(data?.playlistId, 'playlist id'),
    name: requireString(data?.name, 'playlist name'),
  }))
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return {
        id: data.playlistId,
        name: data.name,
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return updatePlaylist(data.playlistId, data.name)
  })

export const addToPlaylistServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: PlaylistTrackInput) => ({
    playlistId: requireString(data?.playlistId, 'playlist id'),
    songId: requireString(data?.songId, 'song id'),
  }))
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return { success: false, message: 'Database is not configured' }
    }

    return addSongToPlaylist(data.playlistId, data.songId)
  })

export const updateTrackServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: TrackUpdateInput) => ({
    trackId: requireString(data?.trackId, 'track id'),
    field: data?.field,
    value: typeof data?.value === 'string' ? data.value : '',
  }))
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return { success: false, error: 'Database is not configured' }
    }

    const { field, value } = data

    if (!['name', 'artist', 'genre', 'album', 'bpm', 'key'].includes(field)) {
      throw new Error('Unsupported track field')
    }

    if (field === 'bpm') {
      const bpm = Number.parseInt(value, 10)

      if (Number.isNaN(bpm)) {
        return { success: false, error: 'bpm should be a valid number' }
      }

      await updateSong(data.trackId, { bpm })
      return { success: true, error: '' }
    }

    await updateSong(data.trackId, { [field]: value || null })
    return { success: true, error: '' }
  })

export const uploadPlaylistCoverServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData')
    }

    const playlistId = requireString(data.get('playlistId'), 'playlist id')
    const file = data.get('file')

    if (!(file instanceof File)) {
      throw new Error('No file provided')
    }

    return { playlistId, file }
  })
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return { success: false, coverUrl: '', playlist: null }
    }

    const coverUrl = await writeUploadedFile(data.file, data.playlistId)
    const playlist = await updatePlaylist(data.playlistId, undefined, coverUrl)

    return { success: true, coverUrl, playlist }
  })

export const updateTrackImageServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData')
    }

    const trackId = requireString(data.get('trackId'), 'track id')
    const file = data.get('file')

    if (!(file instanceof File)) {
      throw new Error('No file provided')
    }

    return { trackId, file }
  })
  .handler(async ({ data }) => {
    if (!hasDb()) {
      return { success: false, imageUrl: '' }
    }

    const imageUrl = await writeUploadedFile(data.file, data.trackId)
    await updateSong(data.trackId, { imageUrl })
    return { success: true, imageUrl }
  })
