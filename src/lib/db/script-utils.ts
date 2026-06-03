import { promises as fs } from 'node:fs'
import path from 'node:path'

export const tracksDirectory = path.join(process.cwd(), 'tracks')
export const coversDirectory = path.join(process.cwd(), 'covers')

export function decodeTrackDisplayName(filename: string) {
  const stem = filename.replace(/\.(flac|mp3|wav|m4a|aac|ogg)$/i, '')

  return stem
    .replace(/^\d+([.\-_\s]|$)/, '')
    .replace(/^\d+\s*-\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function listTrackFiles() {
  const files = await fs.readdir(tracksDirectory)

  return files.filter((file) => /\.(flac|mp3|wav|m4a|aac|ogg)$/i.test(file))
}

export async function coverExists(filename: string) {
  const fullPath = path.join(coversDirectory, `${filename}.jpg`)

  try {
    await fs.access(fullPath)
    return true
  } catch {
    return false
  }
}

export function audioApiPath(filename: string) {
  return `/api/audio/${encodeURIComponent(filename)}`
}

export function coverApiPath(filename: string) {
  return `/api/cover/${encodeURIComponent(`${filename}.jpg`)}`
}
