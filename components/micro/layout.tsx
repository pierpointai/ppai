import type { ReactNode } from "react"

type MicroLayoutProps = {
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function MicroLayout({ title, children, actions }: MicroLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  )
}
