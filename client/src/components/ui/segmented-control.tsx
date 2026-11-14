import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: {
  value: T
  onValueChange: (value: T) => void
  options: SegmentOption<T>[]
  ariaLabel?: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-neutral-950 p-1.5 shadow-inner [&>button]:shrink-0',
        className
      )}
    >
      {options.map(o => {
        const isSelected = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onValueChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-150 cursor-pointer',
              isSelected
                ? 'btn-volumetric-primary font-semibold'
                : 'btn-volumetric text-neutral-300 hover:text-white'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
