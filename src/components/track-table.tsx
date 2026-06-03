import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pause, Play, Plus } from 'lucide-react'
import { AddToPlaylistDialog } from '@/components/add-to-playlist-dialog'
import { PlaylistNameDialog } from '@/components/playlist-name-dialog'
import {
  PlayerDropdownContent,
  PlayerDropdownItem,
  PlayerDropdownMenu,
  PlayerDropdownTrigger,
} from '@/components/player-dropdown'
import { usePlayback } from '@/hooks/playback-context'
import { usePlaylist } from '@/hooks/use-playlist'
import type { Song } from '@/lib/db/types'
import { formatDuration, highlightText } from '@/lib/utils'

function TrackRow({
  track,
  index,
  query,
  isSelected,
  onSelect,
}: {
  track: Song
  index: number
  query?: string
  isSelected: boolean
  onSelect: () => void
}) {
  const {
    currentTrack,
    playTrack,
    togglePlayPause,
    isPlaying,
    setActivePanel,
    handleKeyNavigation,
  } = usePlayback()
  const {
    playlists,
    addToPlaylist,
    createPlaylist,
    isAddingToPlaylist,
    isCreatingPlaylist,
  } = usePlaylist()
  const [isFocused, setIsFocused] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false)
  const isCurrentTrack = currentTrack?.id === track.id

  function playOrToggle() {
    if (isCurrentTrack) {
      togglePlayPause()
    } else {
      playTrack(track)
    }
  }

  return (
    <>
      <AddToPlaylistDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        track={track}
        playlists={playlists}
        pending={isAddingToPlaylist}
        onSelect={async (playlistId) => {
          await addToPlaylist({ playlistId, songId: track.id })
        }}
        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />
      <PlaylistNameDialog
        open={isCreatePlaylistOpen}
        onOpenChange={setIsCreatePlaylistOpen}
        title="Create playlist"
        description="Start a playlist, then add tracks from the library."
        initialValue=""
        submitLabel="Create"
        pending={isCreatingPlaylist}
        onSubmit={async (name) => {
          await createPlaylist({ id: crypto.randomUUID(), name })
        }}
      />
      <tr
        className={`group relative cursor-pointer select-none border-b border-slate-200/90 transition-colors hover:bg-rose-50/70 ${
          isCurrentTrack ? 'bg-pink-50' : ''
        } ${
          isSelected || isFocused
            ? 'outline outline-1 outline-pink-400/50 outline-offset-[-1px]'
            : ''
        }`}
        tabIndex={0}
        onClick={(event) => {
          event.preventDefault()
          setActivePanel('tracklist')
          onSelect()
          playOrToggle()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect()
            playOrToggle()
          } else {
            handleKeyNavigation(event, 'tracklist')
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <td className="w-14 py-2.5 pl-4 pr-2 text-center tabular-nums">
          {isCurrentTrack && isPlaying ? (
            <div className="mx-auto flex size-[0.65rem] items-end justify-center space-x-[2px]">
              <div className="animate-now-playing-1 w-1 rounded-full bg-pink-500" />
              <div className="animate-now-playing-2 w-1 rounded-full bg-pink-500 [animation-delay:0.2s]" />
              <div className="animate-now-playing-3 w-1 rounded-full bg-pink-500 [animation-delay:0.4s]" />
            </div>
          ) : (
            <span className="text-slate-400">{index + 1}</span>
          )}
        </td>
        <td className="max-w-0 px-2 py-2.5">
          <div className="flex items-center">
            <div className="relative mr-3 size-11 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(148,163,184,0.14)]">
              <img
                src={track.imageUrl || '/placeholder.svg'}
                alt={`${track.album || track.name} cover`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 truncate font-medium text-slate-800">
              {highlightText(track.name, query)}
              <span className="ml-1 text-slate-400 sm:hidden">
                • {highlightText(track.artist, query)}
              </span>
            </div>
          </div>
        </td>
        <td className="hidden w-[200px] max-w-[200px] px-2 py-2.5 text-slate-500 sm:table-cell lg:w-[210px] lg:max-w-[210px]">
          <div className="truncate">
            {highlightText(track.artist, query)}
          </div>
        </td>
        <td className="hidden w-[220px] max-w-[220px] px-2 py-2.5 text-slate-500 md:table-cell lg:w-[260px] lg:max-w-[260px] xl:w-[300px] xl:max-w-[300px]">
          <div className="truncate">
            {highlightText(track.album || '', query)}
          </div>
        </td>
        <td className="w-[58px] px-2 py-2.5 text-right tabular-nums text-slate-500">
          {formatDuration(track.duration)}
        </td>
        <td className="w-[60px] py-2.5 pl-2 pr-4">
          <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <PlayerDropdownMenu>
              <PlayerDropdownTrigger
                className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-800 focus:bg-slate-100 focus:text-slate-800"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Track options</span>
              </PlayerDropdownTrigger>
              <PlayerDropdownContent align="end" className="w-52">
                <PlayerDropdownItem
                  className="text-xs"
                  onClick={(event) => {
                    event.stopPropagation()
                    playOrToggle()
                  }}
                >
                  {isCurrentTrack && isPlaying ? (
                    <>
                      <Pause className="mr-2 size-3 stroke-[1.5]" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 size-3 stroke-[1.5]" />
                      Play
                    </>
                  )}
                </PlayerDropdownItem>
                <PlayerDropdownItem
                  className="text-xs"
                  onClick={(event) => {
                    event.stopPropagation()
                    setIsAddDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 size-3" />
                  Add to Playlist
                </PlayerDropdownItem>
              </PlayerDropdownContent>
            </PlayerDropdownMenu>
          </div>
        </td>
      </tr>
    </>
  )
}

export function TrackTable({
  songs,
  playbackSongs,
  query,
  startIndex = 0,
}: {
  songs: Song[]
  playbackSongs?: Song[]
  query?: string
  startIndex?: number
}) {
  const tableRef = useRef<HTMLTableElement>(null)
  const { registerPanelRef, setActivePanel, setPlaylist } = usePlayback()
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  useEffect(() => {
    registerPanelRef('tracklist', tableRef)
  }, [registerPanelRef])

  useEffect(() => {
    setPlaylist(playbackSongs ?? songs)
  }, [playbackSongs, setPlaylist, songs])

  return (
    <table
      ref={tableRef}
      className="w-full table-fixed border-separate border-spacing-y-0 text-sm"
      onClick={() => setActivePanel('tracklist')}
    >
      <thead className="sticky top-0 z-10">
        <tr className="glass-subtle text-left text-[11px] uppercase tracking-[0.22em] text-slate-400">
          <th className="w-14 rounded-l-2xl py-3 pl-4 pr-2 font-semibold">#</th>
          <th className="px-2 py-3 font-semibold">Title</th>
          <th className="hidden w-[200px] px-2 py-3 font-semibold sm:table-cell lg:w-[210px]">Artist</th>
          <th className="hidden w-[220px] px-2 py-3 font-semibold md:table-cell lg:w-[260px] xl:w-[300px]">Album</th>
          <th className="w-[58px] px-2 py-3 text-right font-semibold">Length</th>
          <th className="w-[60px] rounded-r-2xl py-2 pl-2 pr-4 font-medium" />
        </tr>
      </thead>
      <tbody>
        {songs.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={startIndex + index}
            query={query}
            isSelected={selectedTrackId === track.id}
            onSelect={() => setSelectedTrackId(track.id)}
          />
        ))}
      </tbody>
    </table>
  )
}
