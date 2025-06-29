"use client"

import dynamic from "next/dynamic"
import { LoadingSpinner } from "./loading-spinner"

// Dynamically import the OfferComparison component
export const DynamicOfferComparison = dynamic(
  () => import("./offer-comparison").then((mod) => ({ default: mod.OfferComparison })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR for this component if it's client-heavy
  },
)
