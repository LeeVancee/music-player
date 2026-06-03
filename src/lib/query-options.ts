import { queryOptions } from '@tanstack/react-query'
import {
  getAllPlaylistsServerFn,
  getAllSongsServerFn,
  getPlaylistServerFn,
  searchSongsServerFn,
} from '@/lib/server/music'

export const musicKeys = {
  playlists: () => ['playlists'] as const,
  songs: () => ['songs'] as const,
  searchSongs: (query: string) => ['songs', 'search', query] as const,
  playlist: (id: string) => ['playlist', id] as const,
}

export function allPlaylistsQueryOptions() {
  return queryOptions({
    queryKey: musicKeys.playlists(),
    queryFn: () => getAllPlaylistsServerFn(),
  })
}

export function allSongsQueryOptions() {
  return queryOptions({
    queryKey: musicKeys.songs(),
    queryFn: () => getAllSongsServerFn(),
  })
}

export function searchSongsQueryOptions(query: string) {
  return queryOptions({
    queryKey: musicKeys.searchSongs(query),
    queryFn: () => searchSongsServerFn({ data: { q: query } }),
  })
}

export function playlistQueryOptions(id: string) {
  return queryOptions({
    queryKey: musicKeys.playlist(id),
    queryFn: () => getPlaylistServerFn({ data: { id } }),
  })
}
