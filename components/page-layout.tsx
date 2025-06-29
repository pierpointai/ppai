import type { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface PageLayoutProps {
  children: ReactNode
  title: string
  description: string
  actions?: ReactNode
  requireAuth?: boolean
}

export function PageLayout({ children, title, description, actions, requireAuth = true }: PageLayoutProps) {
  const content = (
    <div className="flex flex-col min-h-screen">
      <PageHeader title={title} description={description} actions={actions} />
      <div className="flex-1 container mx-auto py-6 px-4 md:px-6">{children}</div>
    </div>
  )

  return requireAuth ? <ProtectedRoute>{content}</ProtectedRoute> : content
}
