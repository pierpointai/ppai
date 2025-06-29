"use client"

import { useOfferStore } from "@/lib/offer-store"
import { OfferCard } from "@/components/offer-card"
import { OfferTable } from "@/components/offer-table"
import { Button } from "@/components/ui/button"
import { getRandomOffer } from "@/lib/mock-data"
import { useToast } from "@/components/ui/use-toast"
import { FolderOpen } from "lucide-react"

interface OfferCategoryViewProps {
  category: string
  viewMode: "cards" | "table"
  onCopy: (id: string) => void
  onSend: (id: string) => void
  onView: (offer: any) => void
}

export function OfferCategoryView({ category, viewMode, onCopy, onSend, onView }: OfferCategoryViewProps) {
  const { offers, addOffer } = useOfferStore()
  const { toast } = useToast()

  // Get offers for this category
  const categoryOffers = offers.filter((offer) => offer.category === category)

  const handleAddSampleOffer = () => {
    const newOffer = {
      ...getRandomOffer(),
      category,
    }

    addOffer(newOffer)

    toast({
      title: "New offer added",
      description: `Added a sample offer to the ${category} category.`,
    })
  }

  if (categoryOffers.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No offers in this category</h3>
        <p className="text-muted-foreground mb-6">There are no offers in the {category} category yet.</p>
        <Button onClick={handleAddSampleOffer}>Add Sample Offer</Button>
      </div>
    )
  }

  return (
    <>
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryOffers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              rank={index + 1}
              onCopy={() => onCopy(offer.id)}
              onSend={() => onSend(offer.id)}
              onView={() => onView(offer)}
            />
          ))}
        </div>
      ) : (
        <OfferTable offers={categoryOffers} onCopy={onCopy} onSend={onSend} onView={onView} />
      )}
    </>
  )
}
