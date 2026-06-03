# Start Music Player

A local music player rebuilt with TanStack Start, TanStack Router, TanStack Query, Drizzle, and PostgreSQL.

This app plays audio from a local `tracks/` folder, stores music and playlist data in Postgres, serves album/playlist artwork from a local `covers/` folder, and provides a desktop-style library UI for browsing, searching, playback, and playlist management.

## Getting Started

Start the full app stack with Docker Compose:

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000).

The default Compose stack builds the production app image, starts PostgreSQL,
runs database migrations, and mounts local music/artwork folders from the project
root:

- `tracks/`: local audio files
- `covers/`: extracted and uploaded cover images

PostgreSQL is available from the host at:

```bash
postgresql://postgres:postgres@localhost:54322/music
```

Docker images default to a Huawei Cloud SWR mirror to avoid Docker Hub pull
timeouts. Override them with `NODE_IMAGE` or `POSTGRES_IMAGE` if your network
uses a different mirror. Docker builds also default to `registry.npmmirror.com`;
override it with `NPM_CONFIG_REGISTRY` when needed. The default platform is
`linux/amd64` for mirror compatibility; override `DOCKER_PLATFORM` if your
mirror provides another architecture.

View service status and logs:

```bash
docker compose ps
docker compose logs app
```

Stop the stack:

```bash
docker compose down
```

## Add Local Music

Add audio files to a top-level `tracks/` folder:

```bash
mkdir -p tracks
```

Supported seed formats:

- `.mp3`
- `.flac`

One way to download a YouTube playlist into local files is `yt-dlp`:

```bash
yt-dlp -x --audio-format mp3 --add-metadata --embed-thumbnail "https://www.youtube.com/playlist?list=..."
```

Embedded cover art is extracted during seeding and written to `covers/`.

## Database

Docker runs migrations automatically when the app container starts. To import
music from `tracks/`, run the seed command manually after the stack is up:

```bash
docker compose exec app pnpm db:seed
```

The seed command clears existing songs and playlists before scanning `tracks/`,
so only run it when you want to rebuild the library from local files.

For non-Docker local development, install dependencies:

```bash
pnpm install
```

Then create a `.env` file:

```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:54322/music
```

Run the local dev server:

```bash
pnpm db:migrate
pnpm dev
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

Useful database commands:

- `pnpm db:generate`: generate migrations from `src/lib/db/schema.ts`
- `pnpm db:migrate`: run migrations and enable `pg_trgm` for fuzzy search
- `pnpm db:seed`: clear songs/playlists, then scan `tracks/` and insert songs
- `pnpm db:enhance`: enhance existing metadata
- `pnpm db:truncate`: clear song and playlist data
- `pnpm db:push`: push schema changes directly
- `pnpm db:drop`: drop Drizzle-managed database objects

If `POSTGRES_URL` is not set, the app still starts with empty library states.

## Running Locally

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000).

## Production

Build the app:

```bash
pnpm build
```

Run the built Nitro server:

```bash
pnpm preview
```

The production server entry is `.output/server/index.mjs`.

## Features

- Local music library backed by PostgreSQL
- File-based routing with TanStack Router
- Server functions and API routes with TanStack Start
- TanStack Query for playlists, songs, mutations, and cache refresh
- MediaSession API support for system playback controls
- All tracks view
- Playlist detail pages
- Create, rename, delete, and browse playlists
- Add tracks to playlists
- Upload playlist covers to local `covers/`
- Serve audio from local `tracks/`
- Basic search across tracks, artists, and albums
- Keyboard navigation for track list and sidebar
- Spacebar play/pause shortcut
- Progress bar seeking
- Volume controls
- Mobile library drawer
- Empty states for no music and no playlists

## Project Structure

```txt
src/routes/                 File-based routes and API routes
src/components/             Player, playlist, dialog, and table components
src/hooks/                  Playback and playlist hooks
src/lib/db/                 Drizzle schema, queries, migrations, and seed scripts
src/lib/server/             TanStack Start server functions
tracks/                     Local audio files, git ignored
covers/                     Local cover images, git ignored
```

## Notes

- This project does not use Vercel Blob.
- Local audio is served through `/api/audio/$filename`.
- Local cover images are served through `/api/cover/$filename`.
- Search uses Postgres `pg_trgm`, which is enabled during `pnpm db:migrate`.
