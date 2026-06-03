import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { AudioWaveform, ListMusic, Menu, MoreVertical, Pencil, Plus, Trash } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PlaylistNameDialog } from '@/components/playlist-name-dialog'
import {
  PlayerDropdownContent,
  PlayerDropdownItem,
  PlayerDropdownMenu,
  PlayerDropdownTrigger,
} from '@/components/player-dropdown'
import { SearchInput } from '@/components/search'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePlayback } from '@/hooks/playback-context'
import { usePlaylist } from '@/hooks/use-playlist'
import { cn } from '@/lib/utils'
import type { Playlist } from '@/lib/db/types'

function PlaylistRow({
  playlist,
  onNavigate,
}: {
  playlist: Playlist
  onNavigate?: () => void
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const {
    deletePlaylist,
    renamePlaylist,
    isDeletingPlaylist,
    isRenamingPlaylist,
  } = usePlaylist()
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  async function handleDeletePlaylist(id: string) {
    if (pathname === `/p/${id}`) {
      await navigate({ to: '/' })
    }

    await deletePlaylist(id)
  }

  return (
    <li className="group relative">
      <PlaylistNameDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        title="Rename playlist"
        description="Give this playlist a clearer name for browsing and playback."
        initialValue={playlist.name}
        submitLabel="Save"
        pending={isRenamingPlaylist}
        onSubmit={async (name) => {
          if (name !== playlist.name) {
            await renamePlaylist({ playlistId: playlist.id, name })
          }
        }}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete playlist?"
        description={`"${playlist.name}" will be removed from your library. This action cannot be undone.`}
        confirmLabel="Delete"
        pending={isDeletingPlaylist}
        destructive
        onConfirm={async () => {
          await handleDeletePlaylist(playlist.id)
        }}
      />
      <Link
        preload="intent"
        to="/p/$id"
        params={{ id: playlist.id }}
        className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 transition-all hover:bg-rose-50 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-400/40 ${
          pathname === `/p/${playlist.id}` ? 'bg-pink-50 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]' : ''
        }`}
        tabIndex={0}
        onClick={onNavigate}
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-white group-hover:text-pink-500">
          <ListMusic className="size-4" />
        </span>
        <span className="min-w-0 truncate">{playlist.name}</span>
      </Link>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <PlayerDropdownMenu>
          <PlayerDropdownTrigger
            className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-800 focus:bg-slate-100 focus:text-slate-800"
          >
            <MoreVertical className="size-4" />
            <span className="sr-only">Playlist options</span>
          </PlayerDropdownTrigger>
          <PlayerDropdownContent align="end" className="w-36">
            <PlayerDropdownItem
              onClick={() => {
                setIsRenameOpen(true)
              }}
              className="text-xs"
            >
              <Pencil className="mr-2 size-3" />
              Rename Playlist
            </PlayerDropdownItem>
            <PlayerDropdownItem
              onClick={() => {
                setIsDeleteOpen(true)
              }}
              className="text-xs"
            >
              <Trash className="mr-2 size-3" />
              Delete Playlist
            </PlayerDropdownItem>
          </PlayerDropdownContent>
        </PlayerDropdownMenu>
      </div>
    </li>
  )
}

export function OptimisticPlaylists({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
} = {}) {
  const { playlists, createPlaylist, isCreatingPlaylist } = usePlaylist()
  const playlistsContainerRef = useRef<HTMLUListElement>(null)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const { registerPanelRef, handleKeyNavigation, setActivePanel } = usePlayback()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    registerPanelRef('sidebar', playlistsContainerRef)
  }, [registerPanelRef])

  async function addPlaylist(name: string) {
    const id = crypto.randomUUID()
    await createPlaylist({ id, name })
    await navigate({ to: '/p/$id', params: { id } })
    onNavigate?.()
  }

  return (
    <div
      className={cn(
        'glass-panel hidden w-[300px] shrink-0 overflow-hidden rounded-[28px] md:block',
        className,
      )}
      onClick={() => setActivePanel('sidebar')}
    >
      <PlaylistNameDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create playlist"
        description="Start a new playlist with a name that matches the mood or use case."
        initialValue=""
        submitLabel="Create"
        pending={isCreatingPlaylist}
        onSubmit={async (name) => {
          await addPlaylist(name)
        }}
      />

      <div className="border-b border-slate-200 px-5 pb-5 pt-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-500 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                <AudioWaveform className="size-5" />
              </span>
              <div>
                <h1 className="display-font text-xl text-slate-900">LoveLive!  Music</h1>
                <p className="text-sm text-slate-500">Library Deck</p>
              </div>
            </div>
          </div>
        </div>

        <SearchInput className="mb-4" inputClassName="h-12 bg-white/85" />
      </div>

      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <button
          type="button"
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 transition-colors hover:text-slate-900"
          onClick={() => {
            navigate({ to: '/' })
            onNavigate?.()
          }}
        >
          Playlists
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full border border-slate-200 bg-white/90 text-slate-600 hover:bg-white"
          disabled={isCreatingPlaylist}
          onClick={() => {
            setIsCreateOpen(true)
          }}
        >
          <Plus className="size-4" />
          <span className="sr-only">Add new playlist</span>
        </Button>
      </div>

      <ScrollArea className="h-[calc(100dvh-250px)] px-3 pb-4">
        <ul
          ref={playlistsContainerRef}
          className="space-y-1.5 text-xs"
          onKeyDown={(event) => handleKeyNavigation(event, 'sidebar')}
        >
          <li>
            <Link
              to="/"
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all hover:bg-rose-50 focus:outline-none focus:ring-1 focus:ring-pink-400/40 ${
                pathname === '/' ? 'bg-pink-50 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]' : 'text-slate-600'
              }`}
              tabIndex={0}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <AudioWaveform className="size-4" />
              </span>
              <span className="min-w-0 truncate">All Tracks</span>
            </Link>
          </li>
          {playlists.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-sm text-slate-500">
              <div>No playlists</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 rounded-full border border-slate-200 bg-white/90 text-slate-700 hover:bg-white"
                disabled={isCreatingPlaylist}
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-3.5" />
                Create playlist
              </Button>
            </li>
          ) : (
            playlists.map((playlist) => (
              <PlaylistRow
                key={playlist.id}
                playlist={playlist}
                onNavigate={onNavigate}
              />
            ))
          )}
        </ul>
      </ScrollArea>
    </div>
  )
}

export function MobilePlaylists() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-3 md:hidden">
      <Button
        type="button"
        variant="ghost"
        className="h-11 rounded-full border border-slate-200 bg-white/90 px-4 text-slate-700 shadow-[0_12px_35px_rgba(148,163,184,0.16)] hover:bg-white"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" />
        Library
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[min(26rem,calc(100vw-2rem))] overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Library navigation</DialogTitle>
          </DialogHeader>
          <OptimisticPlaylists
            className="block max-h-[calc(100dvh-2rem)] w-full border-0 shadow-none md:hidden"
            onNavigate={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
