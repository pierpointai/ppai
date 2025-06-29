"use client"

import dynamic from "next/dynamic"
import { LoadingSpinner } from "./loading-spinner"
import type { Client, Offer } from "@/lib/types"

// Define props interface
interface ClientDetailsProps {
  client: Client
  matchedOffers: Record<string, Offer[]>
  onRefreshMatches: () => void
  isRefreshing: boolean
  onBack: () => void
}

// Dynamically import the ClientDetails component
export const DynamicClientDetails = dynamic<ClientDetailsProps>(
  () => import("./client-details").then((mod) => ({ default: mod.ClientDetails })),
  {
    loading: ({ client }) => <LoadingSpinner />,
    ssr: false,
  },
)
