import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface LayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
  className?: string
}

export const SimpleLayout = ({ children, title, actions, className = "" }: LayoutProps) => (
  <div className={`space-y-4 ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
)

export const SimpleGrid = ({ children, cols = 1 }: { children: ReactNode; cols?: number }) => (
  <div className={`grid gap-4 grid-cols-1 ${cols > 1 ? `md:grid-cols-${cols}` : ""}`}>{children}</div>
)

export const SimpleSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </Card>
)
