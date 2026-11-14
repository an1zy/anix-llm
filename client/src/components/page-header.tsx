import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
  divider = true,
}: {
  title: string
  description?: string
  actions?: ReactNode
  divider?: boolean
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${divider ? 'pb-6 border-b' : ''}`}>
      <div className="min-w-0 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">{title}</h1>
        {description && (
          <p className="text-sm text-neutral-400 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
