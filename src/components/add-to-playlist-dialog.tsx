import { ListMusic, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Playlist, Song } from '@/lib/db/types'

export function AddToPlaylistDialog({
  open,
  onOpenChange,
  track,
  playlists,
  pending,
  onSelect,
  onCreatePlaylist,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  track: Song
  playlists: Playlist[]
  pending?: boolean
  onSelect: (playlistId: string) => Promise<void>
  onCreatePlaylist?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Choose where to place <span className="font-medium text-slate-700">{track.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-2">
          {playlists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
                <ListMusic className="size-5" />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-800">
                No playlists yet
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-500">
                Create a playlist before adding this track.
              </div>
              {onCreatePlaylist ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4 rounded-full border border-slate-200 bg-white/90 px-4 text-slate-700 hover:bg-white"
                  onClick={() => {
                    onOpenChange(false)
                    onCreatePlaylist()
                  }}
                >
                  <Plus className="size-4" />
                  Create playlist
                </Button>
              ) : null}
            </div>
          ) : (
            playlists.map((playlist) => (
              <Button
                key={playlist.id}
                type="button"
                variant="outline"
                className="flex h-auto w-full items-center justify-start gap-3 rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-left text-slate-700 hover:bg-rose-50"
                disabled={pending}
                onClick={() => {
                  void onSelect(playlist.id).then(() => onOpenChange(false))
                }}
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-pink-100 text-pink-500">
                  <ListMusic className="size-4" />
                </span>
                <span className="min-w-0 truncate">{playlist.name}</span>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
