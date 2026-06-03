import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ChevronLeft, Disc3, ListMusic, Play, Shuffle } from 'lucide-react'
import { CoverImage } from '@/components/cover-image'
import { EditableTitle } from '@/components/editable-title'
import { PaginationControls } from '@/components/pagination-controls'
import { TrackTable } from '@/components/track-table'
import { Button } from '@/components/ui/button'
import { ScrollBar, ScrollArea } from '@/components/ui/scroll-area'
import { usePlayback } from '@/hooks/playback-context'
import { playlistQueryOptions } from '@/lib/query-options'
import { formatDuration } from '@/lib/utils'

type PlaylistSearch = {
  page?: number
}

const TRACKS_PER_PAGE = 15

export const Route = createFileRoute('/p/$id')({
  validateSearch: (search: Record<string, unknown>): PlaylistSearch => ({
    page:
      typeof search.page === 'number' && Number.isFinite(search.page) && search.page > 1
        ? Math.floor(search.page)
        : typeof search.page === 'string' &&
            Number.isFinite(Number(search.page)) &&
            Number(search.page) > 1
          ? Math.floor(Number(search.page))
          : undefined,
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(playlistQueryOptions(params.id)),
  component: PlaylistPage,
})

function PlaylistPage() {
  const { id } = Route.useParams()
  const navigate = Route.useNavigate()
  const { page } = Route.useSearch()
  const { playQueue } = usePlayback()
  const playlistQuery = useSuspenseQuery(playlistQueryOptions(id))
  const playlist = playlistQuery.data
  const averageLength =
    playlist.trackCount > 0 ? Math.round(playlist.duration / playlist.trackCount) : 0
  const totalPages = Math.max(1, Math.ceil(playlist.songs.length / TRACKS_PER_PAGE))
  const currentPage = Math.min(page ?? 1, totalPages)
  const pageStart = (currentPage - 1) * TRACKS_PER_PAGE
  const pageSongs = playlist.songs.slice(pageStart, pageStart + TRACKS_PER_PAGE)

  function setPage(nextPage: number) {
    const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages)

    navigate({
      search: normalizedPage > 1 ? { page: normalizedPage } : {},
      replace: true,
    })
  }

  function playAll() {
    playQueue(playlist.songs)
  }

  function shufflePlaylist() {
    playQueue([...playlist.songs].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <section className="glass-panel overflow-hidden rounded-[32px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-pink-500/70">
              Playlist
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-600">
              {playlist.trackCount} songs
            </span>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-6 md:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-end">
          <div className="relative">
            <div className="absolute -inset-5 rounded-[32px] bg-pink-200/40 blur-3xl" />
            <div className="relative">
              <CoverImage url={playlist.coverUrl} playlistId={playlist.id} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <EditableTitle playlistId={playlist.id} initialName={playlist.name} />           
            </div>

            <div className="flex flex-wrap gap-3">
              <MetaCard icon={<ListMusic className="size-4" />} label="Tracks" value={playlist.trackCount.toString()} />
              <MetaCard icon={<Disc3 className="size-4" />} label="Duration" value={formatDuration(playlist.duration)} />
              <MetaCard icon={<Play className="size-4" />} label="Avg Track" value={formatDuration(averageLength)} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="h-11 rounded-full bg-pink-500 text-white hover:bg-pink-400"
                disabled={playlist.songs.length === 0}
                onClick={playAll}
              >
                <Play className="size-4 fill-current" />
                Play All
              </Button>
              <Button
                variant="ghost"
                className="h-11 rounded-full border border-slate-200 bg-white/90 px-5 text-slate-700 hover:bg-white"
                disabled={playlist.songs.length === 0}
                onClick={shufflePlaylist}
              >
                <Shuffle className="size-4" />
                Shuffle
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500/70">
              Playlist tracks
            </p>
            <h2 className="display-font mt-1 text-2xl text-slate-900">{playlist.name}</h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-600">
            Queue view
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="min-w-0 px-2 pb-3 md:px-3">
            <TrackTable
              songs={pageSongs}
              playbackSongs={playlist.songs}
              startIndex={pageStart}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <PaginationControls
          page={currentPage}
          pageSize={TRACKS_PER_PAGE}
          totalItems={playlist.songs.length}
          onPageChange={setPage}
        />
      </section>
    </div>
  )
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="glass-subtle rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2 text-pink-500">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {label}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}
