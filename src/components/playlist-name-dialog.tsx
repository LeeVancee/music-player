import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function PlaylistNameDialog({
  open,
  onOpenChange,
  title,
  description,
  initialValue,
  submitLabel,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  initialValue: string
  submitLabel: string
  pending?: boolean
  onSubmit: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(initialValue)
    }
  }, [initialValue, open])

  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [open])

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      inputRef.current?.focus()
      return
    }

    await onSubmit(trimmedName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <label
              htmlFor="playlist-name"
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400"
            >
              Playlist name
            </label>
            <Input
              ref={inputRef}
              id="playlist-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Late Night Drive"
              className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-slate-800 focus-visible:border-pink-400/70 focus-visible:ring-pink-400/20"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-slate-200 bg-white/90 px-5 text-slate-700 hover:bg-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="h-11 rounded-full bg-pink-500 px-5 text-white hover:bg-pink-400"
              disabled={pending}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
