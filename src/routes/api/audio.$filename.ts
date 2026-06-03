import { createReadStream } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/audio/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const audioDirectory = path.join(process.cwd(), 'tracks')
        const filePath = path.join(
          audioDirectory,
          decodeURIComponent(params.filename),
        )

        try {
          const stat = await fs.stat(filePath)
          const rangeHeader = request.headers.get('range')

          if (!rangeHeader) {
            const fileBuffer = await fs.readFile(filePath)

            return new Response(fileBuffer, {
              headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': fileBuffer.byteLength.toString(),
                'Accept-Ranges': 'bytes',
              },
            })
          }

          const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader)

          if (!match) {
            return new Response('Invalid range header', { status: 416 })
          }

          const start = match[1] ? Number.parseInt(match[1], 10) : 0
          const end = match[2]
            ? Number.parseInt(match[2], 10)
            : stat.size - 1

          if (
            Number.isNaN(start) ||
            Number.isNaN(end) ||
            start < 0 ||
            end >= stat.size ||
            start > end
          ) {
            return new Response('Requested range not satisfiable', {
              status: 416,
              headers: {
                'Content-Range': `bytes */${stat.size}`,
              },
            })
          }

          const stream = createReadStream(filePath, { start, end })
          const webStream = Readable.toWeb(stream) as ReadableStream
          const chunkSize = end - start + 1

          return new Response(webStream, {
            status: 206,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': chunkSize.toString(),
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
            },
          })
        } catch {
          return new Response('File not found', { status: 404 })
        }
      },
    },
  },
})
