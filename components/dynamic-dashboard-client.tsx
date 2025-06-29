"use client"

import dynamic from "next/dynamic"
import { LoadingSpinner } from "./loading-spinner"

// Dynamically import the EnhancedDashboard component
export const DynamicDashboardClient = dynamic(
  () => import("./enhanced-dashboard").then((mod) => ({ default: mod.EnhancedDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // This is now in a client component, so it's allowed
  },
)
