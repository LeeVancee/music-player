import { Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { usePlaylist } from '@/hooks/use-playlist'

export function CoverImage({
  url,
  playlistId,
}: {
  url: string | null
  playlistId: string
}) {
  const [currentUrl, setCurrentUrl] = useState(url)
  const { uploadPlaylistCover, isUploadingCover } = usePlaylist()

  if (currentUrl) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 p-2 shadow-[0_24px_60px_rgba(148,163,184,0.18)]">
        <img
          src={currentUrl}
          alt="Playlist cover"
          className="aspect-square h-full w-full rounded-[20px] object-cover lg:size-[208px]"
        />
      </div>
    )
  }

  return (
    <label
      htmlFor={`coverUpload-${playlistId}`}
      className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-pink-300/50 bg-white/75 p-6 text-slate-800 transition-colors hover:border-pink-400/70 hover:bg-white lg:size-[224px]"
    >
      <input
        id={`coverUpload-${playlistId}`}
        type="file"
        name="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]

          if (!file) {
            return
          }

          if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit')
            event.target.value = ''
            return
          }

          const formData = new FormData()
          formData.set('playlistId', playlistId)
          formData.set('file', file)

          void uploadPlaylistCover(formData).then((result) => {
            setCurrentUrl(result.coverUrl)
          })
        }}
      />
      {isUploadingCover ? (
        <Loader2 className="size-7 animate-spin text-pink-500" />
      ) : (
        <>
          <Upload className="mb-3 size-5 text-pink-500" />
          <span className="text-center text-sm font-medium">Upload artwork</span>
          <span className="mt-1 text-center text-xs text-slate-500">
            JPG or PNG up to 5MB
          </span>
        </>
      )}
    </label>
  )
}
