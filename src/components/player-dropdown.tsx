import * as React from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type DropdownContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

function useDropdownContext(name: string) {
  const context = React.useContext(DropdownContext)

  if (!context) {
    throw new Error(`${name} must be used within PlayerDropdownMenu`)
  }

  return context
}

export function PlayerDropdownMenu({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null

      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return
      }

      setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      {children}
    </DropdownContext.Provider>
  )
}

export function PlayerDropdownTrigger({
  children,
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDropdownContext(
    'PlayerDropdownTrigger',
  )

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setOpen((current) => !current)
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

function getMenuPosition(
  rect: DOMRect,
  align: 'start' | 'end' = 'end',
): React.CSSProperties {
  return {
    position: 'fixed',
    top: rect.bottom + 6,
    left: align === 'start' ? rect.left : undefined,
    right: align === 'end' ? window.innerWidth - rect.right : undefined,
    zIndex: 60,
  }
}

export function PlayerDropdownContent({
  children,
  className,
  align = 'end',
}: {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'end'
}) {
  const { open, triggerRef, contentRef } = useDropdownContext(
    'PlayerDropdownContent',
  )
  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState<React.CSSProperties>()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()

      if (rect) {
        setPosition(getMenuPosition(rect, align))
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [align, open, triggerRef])

  if (!mounted || !open || !position) {
    return null
  }

  return createPortal(
    <div
      ref={contentRef}
      style={position}
      className={cn(
        'min-w-[10rem] overflow-hidden rounded-2xl border border-slate-200 bg-white/96 p-1.5 text-slate-700 shadow-[0_18px_50px_rgba(148,163,184,0.22)] backdrop-blur-xl',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {children}
    </div>,
    document.body,
  )
}

export function PlayerDropdownItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  const { setOpen } = useDropdownContext('PlayerDropdownItem')

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center rounded-xl px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-rose-50 hover:text-slate-900',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
        setOpen(false)
      }}
    >
      {children}
    </button>
  )
}

type SubmenuContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SubmenuContext = React.createContext<SubmenuContextValue | null>(null)

function useSubmenuContext(name: string) {
  const context = React.useContext(SubmenuContext)

  if (!context) {
    throw new Error(`${name} must be used within PlayerDropdownSub`)
  }

  return context
}

export function PlayerDropdownSub({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <SubmenuContext.Provider value={{ open, setOpen }}>
      <div
        className="relative"
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </SubmenuContext.Provider>
  )
}

export function PlayerDropdownSubTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen } = useSubmenuContext('PlayerDropdownSubTrigger')

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center rounded-xl px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-rose-50 hover:text-slate-900',
        className,
      )}
      onMouseEnter={() => setOpen(true)}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setOpen((current) => !current)
      }}
    >
      {children}
      <ChevronRight className={cn('ml-auto size-4', open && 'text-slate-900')} />
    </button>
  )
}

export function PlayerDropdownSubContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open } = useSubmenuContext('PlayerDropdownSubContent')

  if (!open) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute left-full top-0 ml-2 min-w-[10rem] overflow-hidden rounded-2xl border border-slate-200 bg-white/96 p-1.5 text-slate-700 shadow-[0_18px_50px_rgba(148,163,184,0.22)] backdrop-blur-xl',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}
