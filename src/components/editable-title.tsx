import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { PlaylistNameDialog } from '@/components/playlist-name-dialog'
import { usePlaylist } from '@/hooks/use-playlist'

export function EditableTitle({
  playlistId,
  initialName,
}: {
  playlistId: string
  initialName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { renamePlaylist, isRenamingPlaylist } = usePlaylist()

  return (
    <>
      <PlaylistNameDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Edit playlist name"
        description="Rename this playlist without leaving the current view."
        initialValue={initialName}
        submitLabel="Save"
        pending={isRenamingPlaylist}
        onSubmit={async (name) => {
          if (name !== initialName) {
            await renamePlaylist({ playlistId, name })
          }
        }}
      />

      <button
        type="button"
        className="group inline-flex items-center gap-3 text-left"
        onClick={() => setIsOpen(true)}
      >
        <span className="display-font text-3xl font-bold text-slate-900 sm:text-4xl">
          {initialName}
        </span>
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 transition-colors group-hover:bg-white group-hover:text-slate-700">
          <Pencil className="size-4" />
        </span>
      </button>
    </>
  )
}
