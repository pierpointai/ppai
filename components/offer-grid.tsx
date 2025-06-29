"use client"

import type { Offer } from "@/lib/types"
import { OfferCard } from "@/components/offer-card"

interface OfferGridProps {
  offers: Offer[]
  onView: (offer: Offer) => void
}

export function OfferGrid({ offers, onView }: OfferGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {offers.map((offer, index) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          rank={index + 1}
          onCopy={() => {}} // Placeholder, functionality handled in parent
          onSend={() => {}} // Placeholder, functionality handled in parent
          onView={() => onView(offer)}
        />
      ))}
    </div>
  )
}
