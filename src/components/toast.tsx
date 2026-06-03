import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ToastInput = Omit<Toast, 'id'>

type ToastContextValue = {
  showToast: (toast: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const toneClassNames = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-slate-200 bg-white text-slate-900',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID()

    setToasts((current) => [
      ...current,
      {
        id,
        ...toast,
      },
    ])
  }, [])

  useEffect(() => {
    if (toasts.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setToasts((current) => current.slice(1))
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toasts])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.tone]

          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_50px_rgba(148,163,184,0.22)] backdrop-blur-xl',
                toneClassNames[toast.tone],
              )}
              role="status"
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.description ? (
                  <div className="mt-1 text-xs leading-5 opacity-75">
                    {toast.description}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
