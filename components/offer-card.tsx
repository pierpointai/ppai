"use client"

import { VesselCard } from "@/components/vessel-card"
import type { Offer } from "@/lib/types"
import { useOfferStore } from "@/lib/offer-store"

interface OfferCardProps {
  offer: Offer
  rank: number
  onCopy: (id: string) => void
  onSend: (id: string) => void
  onView: (offer: Offer) => void
}

/**
 * OfferCard is a wrapper around VesselCard that connects it to the offer store
 * and provides the necessary callbacks for interacting with offers
 */
export function OfferCard({ offer, rank, onCopy, onSend, onView }: OfferCardProps) {
  // Get store actions and state
  const { toggleCompareOffer, compareOffers, setCategoryForOffer } = useOfferStore()

  // Derived state
  const isComparing = compareOffers.some((o) => o.id === offer.id)
  const isFavorite = offer.category === "Favorites"
  const isHighPriority = offer.score && offer.score > 0.85

  // Handle favorite toggle
  const handleToggleFavorite = (offer: Offer) => {
    setCategoryForOffer(offer.id, isFavorite ? "New Opportunities" : "Favorites")
  }

  return (
    <VesselCard
      offer={offer}
      rank={rank}
      isComparing={isComparing}
      isFavorite={isFavorite}
      isHighPriority={isHighPriority}
      onCopy={() => onCopy(offer.id)}
      onSend={() => onSend(offer.id)}
      onView={() => onView(offer)}
      onToggleFavorite={handleToggleFavorite}
      onToggleCompare={toggleCompareOffer}
    />
  )
}
