import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Library } from 'lucide-react'
import { PaginationControls } from '@/components/pagination-controls'
import { SearchInput } from '@/components/search'
import { ScrollBar, ScrollArea } from '@/components/ui/scroll-area'
import { TrackTable } from '@/components/track-table'
import { musicKeys } from '@/lib/query-options'
import { getAllSongsServerFn, searchSongsServerFn } from '@/lib/server/music'

type IndexSearch = {
  q?: string
  page?: number
}

const TRACKS_PER_PAGE = 15

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    q: typeof search.q === 'string' && search.q.length > 0 ? search.q : undefined,
    page:
      typeof search.page === 'number' && Number.isFinite(search.page) && search.page > 1
        ? Math.floor(search.page)
        : typeof search.page === 'string' &&
            Number.isFinite(Number(search.page)) &&
            Number(search.page) > 1
          ? Math.floor(Number(search.page))
          : undefined,
  }),
  loader: ({ context, location }) => {
    const search = location.search as Record<string, unknown>
    const query = typeof search.q === 'string' ? search.q : ''

    if (query) {
      return context.queryClient.ensureQueryData({
        queryKey: musicKeys.searchSongs(query),
        queryFn: () => searchSongsServerFn({ data: { q: query } }),
      })
    }

    return context.queryClient.ensureQueryData({
      queryKey: musicKeys.songs(),
      queryFn: () => getAllSongsServerFn(),
    })
  },
  component: Home,
})

function Home() {
  const navigate = Route.useNavigate()
  const { q, page } = Route.useSearch()
  const songsQuery = useSuspenseQuery({
    queryKey: q ? musicKeys.searchSongs(q) : musicKeys.songs(),
    queryFn: () =>
      q ? searchSongsServerFn({ data: { q } }) : getAllSongsServerFn(),
  })
  const songs = songsQuery.data
  const totalPages = Math.max(1, Math.ceil(songs.length / TRACKS_PER_PAGE))
  const currentPage = Math.min(page ?? 1, totalPages)
  const pageStart = (currentPage - 1) * TRACKS_PER_PAGE
  const pageSongs = songs.slice(pageStart, pageStart + TRACKS_PER_PAGE)
  const isEmpty = songs.length === 0

  function setPage(nextPage: number) {
    const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages)

    navigate({
      search: {
        ...(q ? { q } : {}),
        ...(normalizedPage > 1 ? { page: normalizedPage } : {}),
      },
      replace: true,
    })
  }

  return (
    <div className="flex h-full flex-col">
      <section className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px]">
        <div className="border-b border-slate-200 px-5 py-5 md:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500/70">
                Library view
              </p>
              <h2 className="display-font mt-1 text-3xl text-slate-900">
                {q ? 'Search Results' : 'All Tracks'}
              </h2>          
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <HeaderPill
                icon={<Library className="size-4" />}
                label="Tracks"
                value={songs.length.toString()}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-2xl">
              <SearchInput
                value={q}
                inputClassName="h-12 rounded-[20px] bg-white/85 pl-11 text-sm"
                iconClassName="left-4 size-4"
                placeholder="Search tracks, artists, albums"
              />
            </div>
            <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-600">
              {songs.length} songs
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isEmpty ? (
            <div className="flex h-full min-h-[320px] items-center justify-center px-6 py-10">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-pink-500">
                  <Library className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No music</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {q
                    ? 'No tracks match your current search.'
                    : 'No tracks are available right now. Add music or connect a database to populate the library.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0 px-3 pb-4 pt-3 md:px-4">
              <TrackTable
                songs={pageSongs}
                playbackSongs={songs}
                query={q}
                startIndex={pageStart}
              />
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {!isEmpty ? (
          <PaginationControls
            page={currentPage}
            pageSize={TRACKS_PER_PAGE}
            totalItems={songs.length}
            onPageChange={setPage}
          />
        ) : null}
      </section>
    </div>
  )
}

function HeaderPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="glass-subtle flex items-center gap-3 rounded-2xl px-3.5 py-2">
      <span className="text-pink-500">{icon}</span>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </div>
        <div className="text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  )
}
