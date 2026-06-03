import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createFileRoute } from '@tanstack/react-router'

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase()

  if (extension === '.png') {
    return 'image/png'
  }

  if (extension === '.webp') {
    return 'image/webp'
  }

  if (extension === '.gif') {
    return 'image/gif'
  }

  return 'image/jpeg'
}

export const Route = createFileRoute('/api/cover/$filename')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const filename = decodeURIComponent(params.filename)
        const coverDirectory = path.join(process.cwd(), 'covers')
        const filePath = path.join(coverDirectory, filename)

        try {
          const imageBuffer = await fs.readFile(filePath)

          return new Response(imageBuffer, {
            headers: {
              'Content-Type': getContentType(filename),
              'Content-Length': imageBuffer.byteLength.toString(),
            },
          })
        } catch {
          return new Response('File not found', { status: 404 })
        }
      },
    },
  },
})
