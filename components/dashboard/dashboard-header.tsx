"use client"

import type React from "react"

interface DashboardHeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div>
          {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}
