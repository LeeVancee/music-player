import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function SearchInput({
  value: initialValue,
  className,
  inputClassName,
  iconClassName,
  placeholder = 'Search your library',
}: {
  value?: string
  className?: string
  inputClassName?: string
  iconClassName?: string
  placeholder?: string
}) {
  const navigate = useNavigate({ from: '/' })
  const [value, setValue] = useState(initialValue ?? '')

  useEffect(() => {
    setValue(initialValue ?? '')
  }, [initialValue])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate({
        to: '/',
        search: value ? { q: value } : {},
        replace: true,
      })
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, value])

  return (
    <div className={cn('relative', className)}>
      <Input
        type="search"
        className={cn(
          'h-11 rounded-2xl border-slate-200 bg-white/80 pl-11 pr-10 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-slate-400 focus-visible:border-pink-400/70 focus-visible:ring-pink-400/20 [&::-webkit-search-cancel-button]:appearance-none',
          inputClassName,
        )}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <Search
        className={cn(
          'pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400',
          iconClassName,
        )}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setValue('')}
        >
          <X className="size-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      ) : (
        <div className="absolute right-3 top-1/2 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-semibold tracking-[0.16em] text-slate-400">
          /
        </div>
      )}
    </div>
  )
}
