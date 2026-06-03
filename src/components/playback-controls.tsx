import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlayback } from '@/hooks/playback-context'

function TrackInfo() {
  const { currentTrack } = usePlayback()

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {currentTrack && (
        <>
          <img
            src={currentTrack.imageUrl || '/placeholder.svg'}
            alt="Now playing"
            className="size-12 rounded-2xl border border-slate-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800">
              {currentTrack.name}
            </div>
            <div className="truncate text-xs text-slate-500">
              {currentTrack.artist}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-full border border-slate-200 bg-white/90 text-slate-600 hover:bg-white sm:flex"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

function PlaybackButtons() {
  const {
    isPlaying,
    togglePlayPause,
    playPreviousTrack,
    playNextTrack,
    currentTrack,
  } = usePlayback()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-slate-200 bg-white/90 text-slate-600 hover:bg-white"
        onClick={playPreviousTrack}
        disabled={!currentTrack}
      >
        <SkipBack className="h-4 w-4 stroke-[1.5]" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-full bg-pink-500 text-white shadow-[0_12px_32px_rgba(244,114,182,0.24)] hover:bg-pink-400"
        onClick={togglePlayPause}
        disabled={!currentTrack}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 stroke-[1.5]" />
        ) : (
          <Play className="h-5 w-5 fill-current stroke-[1.5]" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-slate-200 bg-white/90 text-slate-600 hover:bg-white"
        onClick={playNextTrack}
        disabled={!currentTrack}
      >
        <SkipForward className="h-4 w-4 stroke-[1.5]" />
      </Button>
    </div>
  )
}

function ProgressBar() {
  const { currentTime, duration, seekTo } = usePlayback()
  const progressBarRef = useRef<HTMLDivElement>(null)

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function handleProgressChange(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!progressBarRef.current || duration <= 0) {
      return
    }

    const rect = progressBarRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const newTime = (percentage / 100) * duration
    seekTo(newTime)
  }

  return (
    <div className="mt-3 flex w-full items-center">
      <span className="text-xs tabular-nums text-slate-400">{formatTime(currentTime)}</span>
      <div
        ref={progressBarRef}
        className="relative mx-3 h-1.5 flex-grow cursor-pointer rounded-full bg-slate-200"
        onClick={handleProgressChange}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-400">{formatTime(duration)}</span>
    </div>
  )
}

function Volume() {
  const { audioRef, currentTrack } = usePlayback()
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const volumeBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [audioRef, isMuted, volume])

  function handleVolumeChange(event: React.MouseEvent<HTMLDivElement>) {
    if (!volumeBarRef.current || !audioRef.current) {
      return
    }

    const rect = volumeBarRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setVolume(percentage)
    audioRef.current.volume = percentage / 100
    setIsMuted(percentage === 0)
  }

  function toggleMute() {
    if (!audioRef.current) {
      return
    }

    if (isMuted) {
      audioRef.current.volume = volume / 100
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-slate-200 bg-white/90 text-slate-600 hover:bg-white"
        onClick={toggleMute}
        disabled={!currentTrack}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-slate-500" />
        ) : (
          <Volume2 className="h-4 w-4 text-slate-500" />
        )}
      </Button>
      <div
        ref={volumeBarRef}
        className="relative h-1.5 w-28 max-w-[42vw] flex-1 cursor-pointer rounded-full bg-slate-200 md:w-36"
        onClick={handleVolumeChange}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(isMuted ? 0 : volume)}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
          style={{ width: `${isMuted ? 0 : volume}%` }}
        />
      </div>
    </div>
  )
}

export function PlaybackControls() {
  const {
    currentTrack,
    audioRef,
    setCurrentTime,
    setDuration,
    seekTo,
    playPreviousTrack,
    playNextTrack,
    togglePlayPause,
  } = usePlayback()

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [audioRef, setCurrentTime, setDuration])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) {
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name,
      artist: currentTrack.artist,
      album: currentTrack.album || undefined,
      artwork: currentTrack.imageUrl
        ? [{ src: currentTrack.imageUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    })

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play()
      togglePlayPause()
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
      togglePlayPause()
    })

    navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack)
    navigator.mediaSession.setActionHandler('nexttrack', playNextTrack)
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seekTo(details.seekTime)
      }
    })

    const updatePositionState = () => {
      if (audioRef.current && !Number.isNaN(audioRef.current.duration)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audioRef.current.duration,
            playbackRate: audioRef.current.playbackRate,
            position: audioRef.current.currentTime,
          })
        } catch (error) {
          console.error('Error updating position state:', error)
        }
      }
    }

    audioRef.current?.addEventListener('timeupdate', updatePositionState)
    audioRef.current?.addEventListener('loadedmetadata', updatePositionState)

    return () => {
      audioRef.current?.removeEventListener('timeupdate', updatePositionState)
      audioRef.current?.removeEventListener('loadedmetadata', updatePositionState)
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekto', null)
    }
  }, [
    audioRef,
    currentTrack,
    playNextTrack,
    playPreviousTrack,
    seekTo,
    setCurrentTime,
    togglePlayPause,
  ])

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <audio ref={audioRef} />
      <div className="glass-panel mx-auto flex max-w-[1400px] flex-col gap-4 rounded-[28px] px-4 py-4 md:px-5 lg:grid lg:grid-cols-[minmax(260px,1fr)_minmax(420px,560px)_minmax(260px,1fr)] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <TrackInfo />
        </div>
        <div className="flex min-w-0 flex-col items-center justify-center">
          <PlaybackButtons />
          <div className="w-full max-w-xl">
            <ProgressBar />
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <Volume />
        </div>
      </div>
    </div>
  )
}
