import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
  allPlaylistsQueryOptions,
  musicKeys,
  playlistQueryOptions,
} from '@/lib/query-options'
import {
  addToPlaylistServerFn,
  createPlaylistServerFn,
  deletePlaylistServerFn,
  updatePlaylistNameServerFn,
  uploadPlaylistCoverServerFn,
} from '@/lib/server/music'
import { useToast } from '@/components/toast'
import type { Playlist } from '@/lib/db/types'

function invalidateSongsAndPlaylists(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: musicKeys.playlists() }),
    queryClient.invalidateQueries({ queryKey: musicKeys.songs() }),
  ])
}

export function usePlaylist() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const playlistsQuery = useSuspenseQuery(allPlaylistsQueryOptions())

  const createPlaylistMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      createPlaylistServerFn({ data: { id, name } }),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: musicKeys.playlists() })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(
        musicKeys.playlists(),
      )

      queryClient.setQueryData<Playlist[]>(musicKeys.playlists(), (current = []) => [
        {
          id,
          name,
          coverUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...current,
      ])

      return { previousPlaylists }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlaylists) {
        queryClient.setQueryData(musicKeys.playlists(), context.previousPlaylists)
      }
      showToast({
        title: 'Could not create playlist',
        tone: 'error',
      })
    },
    onSuccess: () => {
      showToast({
        title: 'Playlist created',
        tone: 'success',
      })
    },
    onSettled: () => invalidateSongsAndPlaylists(queryClient),
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: (id: string) => deletePlaylistServerFn({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: musicKeys.playlists() })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(
        musicKeys.playlists(),
      )

      queryClient.setQueryData<Playlist[]>(musicKeys.playlists(), (current = []) =>
        current.filter((playlist) => playlist.id !== id),
      )

      return { previousPlaylists }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlaylists) {
        queryClient.setQueryData(musicKeys.playlists(), context.previousPlaylists)
      }
      showToast({
        title: 'Could not delete playlist',
        tone: 'error',
      })
    },
    onSuccess: () => {
      showToast({
        title: 'Playlist deleted',
        tone: 'success',
      })
    },
    onSettled: (_data, _error, id) =>
      Promise.all([
        invalidateSongsAndPlaylists(queryClient),
        queryClient.removeQueries({ queryKey: musicKeys.playlist(id) }),
      ]),
  })

  const renamePlaylistMutation = useMutation({
    mutationFn: ({
      playlistId,
      name,
    }: {
      playlistId: string
      name: string
    }) => updatePlaylistNameServerFn({ data: { playlistId, name } }),
    onSuccess: (playlist) => {
      queryClient.setQueryData<Playlist[]>(musicKeys.playlists(), (current = []) =>
        current.map((item) => (item.id === playlist.id ? playlist : item)),
      )
      queryClient.setQueryData(playlistQueryOptions(playlist.id).queryKey, (current: any) =>
        current ? { ...current, ...playlist } : current,
      )
      showToast({
        title: 'Playlist renamed',
        tone: 'success',
      })
    },
    onError: () => {
      showToast({
        title: 'Could not rename playlist',
        tone: 'error',
      })
    },
  })

  const uploadPlaylistCoverMutation = useMutation({
    mutationFn: (formData: FormData) => uploadPlaylistCoverServerFn({ data: formData }),
    onSuccess: ({ playlist }) => {
      if (!playlist) {
        return
      }

      queryClient.setQueryData<Playlist[]>(musicKeys.playlists(), (current = []) =>
        current.map((item) => (item.id === playlist.id ? playlist : item)),
      )
      queryClient.invalidateQueries({ queryKey: musicKeys.playlist(playlist.id) })
      showToast({
        title: 'Cover updated',
        tone: 'success',
      })
    },
    onError: () => {
      showToast({
        title: 'Could not update cover',
        tone: 'error',
      })
    },
  })

  const addToPlaylistMutation = useMutation({
    mutationFn: ({
      playlistId,
      songId,
    }: {
      playlistId: string
      songId: string
    }) => addToPlaylistServerFn({ data: { playlistId, songId } }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: musicKeys.playlist(variables.playlistId),
      })
      showToast({
        title: result.success ? 'Added to playlist' : 'Could not add track',
        description: result.message,
        tone: result.success ? 'success' : 'error',
      })
    },
    onError: () => {
      showToast({
        title: 'Could not add track',
        tone: 'error',
      })
    },
  })

  return {
    playlists: playlistsQuery.data,
    createPlaylist: createPlaylistMutation.mutateAsync,
    deletePlaylist: deletePlaylistMutation.mutateAsync,
    renamePlaylist: renamePlaylistMutation.mutateAsync,
    uploadPlaylistCover: uploadPlaylistCoverMutation.mutateAsync,
    addToPlaylist: addToPlaylistMutation.mutateAsync,
    isCreatingPlaylist: createPlaylistMutation.isPending,
    isDeletingPlaylist: deletePlaylistMutation.isPending,
    isRenamingPlaylist: renamePlaylistMutation.isPending,
    isUploadingCover: uploadPlaylistCoverMutation.isPending,
    isAddingToPlaylist: addToPlaylistMutation.isPending,
  }
}
