import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { PlaybackControls } from '@/components/playback-controls'
import { MobilePlaylists, OptimisticPlaylists } from '@/components/optimistic-playlists'
import { NowPlaying } from '@/components/now-playing'
import { ToastProvider } from '@/components/toast'
import { PlaybackProvider } from '@/hooks/playback-context'
import { allPlaylistsQueryOptions } from '@/lib/query-options'
import type { RouterContext } from '@/router'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Start Music Player' },
      {
        name: 'description',
        content: 'A local music player rebuilt on TanStack Start.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap',
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(allPlaylistsQueryOptions()),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <PlaybackProvider>
      <ToastProvider>
        <div className="app-shell dark text-slate-900">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-10%] top-[-12%] h-72 w-72 rounded-full bg-pink-300/35 blur-3xl" />
            <div className="absolute bottom-[18%] right-[-8%] h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
            <div className="absolute left-[42%] top-[14%] h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
          </div>

          <div className="relative flex min-h-[100dvh] flex-col px-3 pb-28 pt-3 md:px-4 lg:px-5">
            <MobilePlaylists />
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-start">
              <OptimisticPlaylists />
              <main className="min-h-0 flex-1">
                <Outlet />
              </main>
              <NowPlaying />
            </div>
          </div>
          <PlaybackControls />
        </div>
      </ToastProvider>
    </PlaybackProvider>
  )
}
