"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { PageHeader } from "@/components/page-header"
import { DynamicDashboard } from "@/components/dynamic-dashboard"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Dashboard" description="Manage and analyze vessel offers across all categories" />
        <div className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <DynamicDashboard />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  )
}
