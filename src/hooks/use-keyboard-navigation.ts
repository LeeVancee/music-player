import { useEffect, type RefObject } from 'react'
import { usePlayback } from '@/hooks/playback-context'

type KeyboardNavigationOptions = {
  containerRef: RefObject<HTMLElement>
  itemSelector: string
  onNavigate?: (newIndex: number) => void
  onSelect?: (currentIndex: number) => void
  onExit?: (direction: 'left' | 'right') => void
}

export function useKeyboardNavigation({
  containerRef,
  itemSelector,
  onNavigate,
  onSelect,
  onExit,
}: KeyboardNavigationOptions) {
  const { activePanel } = usePlayback()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!containerRef.current) {
        return
      }

      const items = Array.from(containerRef.current.querySelectorAll(itemSelector))
      const currentFocusedItem = document.activeElement as HTMLElement
      const currentIndex = items.indexOf(currentFocusedItem)

      let newIndex: number

      switch (event.key) {
        case 'j':
        case 'ArrowDown':
          event.preventDefault()
          newIndex = Math.min(currentIndex + 1, items.length - 1)
          ;(items[newIndex] as HTMLElement)?.focus()
          onNavigate?.(newIndex)
          break
        case 'k':
        case 'ArrowUp':
          event.preventDefault()
          newIndex = Math.max(currentIndex - 1, 0)
          ;(items[newIndex] as HTMLElement)?.focus()
          onNavigate?.(newIndex)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          onSelect?.(currentIndex)
          break
        case 'h':
          event.preventDefault()
          onExit?.('left')
          break
        case 'l':
          event.preventDefault()
          onExit?.('right')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, itemSelector, onExit, onNavigate, onSelect])

  return activePanel
}
