import { usePlayback } from '@/hooks/playback-context'
import { cn } from '@/lib/utils'

export function NowPlaying() {
  const { currentTrack } = usePlayback()

  if (!currentTrack) {
    return (
      <aside className="glass-panel hidden w-[320px] shrink-0 self-start overflow-hidden rounded-[32px] lg:sticky lg:top-3 lg:flex lg:max-h-[calc(100dvh-8.5rem)] lg:flex-col xl:w-[340px]">
        <div className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500/70">
            Now Playing
          </p>
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-6 text-center">
            <div className="display-font text-2xl text-slate-900">Nothing is playing</div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Album art and current track details will appear here once playback starts.
            </p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="glass-panel hidden w-[320px] shrink-0 self-start overflow-hidden rounded-[32px] lg:sticky lg:top-3 lg:flex lg:max-h-[calc(100dvh-8.5rem)] lg:flex-col xl:w-[340px]">
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500/70">
              Now Playing
            </p>
            <h2 className="display-font mt-1 text-2xl text-slate-900">Track Focus</h2>
          </div>
        </div>

        <div className="group relative mb-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 p-2 shadow-[0_20px_45px_rgba(148,163,184,0.18)]">
          <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="relative aspect-square w-full overflow-hidden rounded-[22px]">
            <img
              src={currentTrack.imageUrl || '/placeholder.svg'}
              alt={`Cover art for ${currentTrack.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="display-font text-2xl text-slate-900">{currentTrack.name}</div>
          <div className="mt-2 text-sm text-slate-500">{currentTrack.artist}</div>
        </div>

        <div className="max-h-[calc(100dvh-35rem)] min-h-0 w-full space-y-3 overflow-auto pr-1">
          <TrackMeta label="Title" value={currentTrack.name} />
          <TrackMeta label="Artist" value={currentTrack.artist} />
          <TrackMeta label="Genre" value={currentTrack.genre} />
          <TrackMeta label="Album" value={currentTrack.album} />
          <TrackMeta label="BPM" value={currentTrack.bpm?.toString()} />
          <TrackMeta label="Key" value={currentTrack.key} />
        </div>
      </div>
    </aside>
  )
}

function TrackMeta({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="glass-subtle rounded-2xl p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 min-h-7 text-sm text-slate-800">
        <span className={cn(value ? '' : 'text-slate-400')}>{value || '-'}</span>
      </div>
    </div>
  )
}
