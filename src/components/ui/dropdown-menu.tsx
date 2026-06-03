import * as React from 'react'
import { Menu } from '@base-ui/react'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ClassValue<State> = string | ((state: State) => string | undefined)

function mergeStateClassName<State>(
  className: ClassValue<State> | undefined,
  getBase: (state: State) => string,
) {
  return (state: State) =>
    cn(
      getBase(state),
      typeof className === 'function' ? className(state) : className,
    )
}

const DropdownMenu = Menu.Root
const DropdownMenuGroup = Menu.Group
const DropdownMenuPortal = Menu.Portal
const DropdownMenuSub = Menu.SubmenuRoot
const DropdownMenuRadioGroup = Menu.RadioGroup

type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<
  typeof Menu.Trigger
> & {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ asChild = false, children, ...props }, ref) => {
  const render =
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement)
      : undefined

  return (
    <Menu.Trigger
      ref={ref}
      render={render}
      nativeButton={!asChild}
      {...props}
    >
      {render ? undefined : children}
    </Menu.Trigger>
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof Menu.Popup
> & {
  align?: React.ComponentPropsWithoutRef<typeof Menu.Positioner>['align']
  sideOffset?: React.ComponentPropsWithoutRef<typeof Menu.Positioner>['sideOffset']
}

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Menu.Popup>,
  DropdownMenuContentProps
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <Menu.Portal>
    <Menu.Positioner align={align} sideOffset={sideOffset}>
      <Menu.Popup
        ref={ref}
        className={mergeStateClassName(className, () =>
          cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          ),
        )}
        {...props}
      />
    </Menu.Positioner>
  </Menu.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Menu.SubmenuTrigger>,
  React.ComponentPropsWithoutRef<typeof Menu.SubmenuTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <Menu.SubmenuTrigger
    ref={ref}
    openOnHover
    className={mergeStateClassName(className, (state) =>
      cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        state.highlighted && 'bg-accent text-accent-foreground',
        state.open && 'bg-accent text-accent-foreground',
        inset && 'pl-8',
      ),
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </Menu.SubmenuTrigger>
))
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Menu.Popup>,
  DropdownMenuContentProps
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <Menu.Portal>
    <Menu.Positioner align={align} sideOffset={sideOffset}>
      <Menu.Popup
        ref={ref}
        className={mergeStateClassName(className, () =>
          cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
          ),
        )}
        {...props}
      />
    </Menu.Positioner>
  </Menu.Portal>
))
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Menu.Item>,
  React.ComponentPropsWithoutRef<typeof Menu.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <Menu.Item
    ref={ref}
    className={mergeStateClassName(className, (state) =>
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        state.highlighted && 'bg-accent text-accent-foreground',
        state.disabled && 'pointer-events-none opacity-50',
        inset && 'pl-8',
      ),
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Menu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof Menu.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <Menu.CheckboxItem
    ref={ref}
    className={mergeStateClassName(className, (state) =>
      cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        state.highlighted && 'bg-accent text-accent-foreground',
        state.disabled && 'pointer-events-none opacity-50',
      ),
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Menu.CheckboxItemIndicator>
        <Check className="h-4 w-4" />
      </Menu.CheckboxItemIndicator>
    </span>
    {children}
  </Menu.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof Menu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof Menu.RadioItem>
>(({ className, children, ...props }, ref) => (
  <Menu.RadioItem
    ref={ref}
    className={mergeStateClassName(className, (state) =>
      cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        state.highlighted && 'bg-accent text-accent-foreground',
        state.disabled && 'pointer-events-none opacity-50',
      ),
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Menu.RadioItemIndicator>
        <Circle className="h-2.5 w-2.5 fill-current" />
      </Menu.RadioItemIndicator>
    </span>
    {children}
  </Menu.RadioItem>
))
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Menu.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof Menu.GroupLabel> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <Menu.GroupLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Menu.Separator>,
  React.ComponentPropsWithoutRef<typeof Menu.Separator>
>(({ className, ...props }, ref) => (
  <Menu.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
    {...props}
  />
)
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
