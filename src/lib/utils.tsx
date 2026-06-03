import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(durationInSeconds: number) {
  if (Number.isNaN(durationInSeconds) || durationInSeconds < 0) {
    return '0:00'
  }

  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = Math.floor(durationInSeconds % 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function highlightText(text: string, query: string | undefined) {
  if (!query) {
    return text
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'))

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 text-black">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
