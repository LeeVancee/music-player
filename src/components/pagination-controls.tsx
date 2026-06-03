import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  label = 'tracks',
  onPageChange,
}: {
  page: number
  pageSize: number
  totalItems: number
  label?: string
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5 lg:px-6">
      <div className="text-sm text-slate-500">
        {start}-{end} of {totalItems} {label}
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full border border-slate-200 bg-white/85 px-3 text-slate-600 hover:bg-white"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>

        <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {page} / {totalPages}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full border border-slate-200 bg-white/85 px-3 text-slate-600 hover:bg-white"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
