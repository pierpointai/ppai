"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, RefreshCw } from "lucide-react"
import { VesselCard } from "@/components/vessel-card"
import { cn } from "@/lib/utils"
import { designTokens } from "@/lib/design-tokens"
import { useOfferStore } from "@/lib/offer-store"
import { useCompareStore } from "@/lib/compare-store"
import { getRandomOfferForCategory } from "@/lib/mock-data"
import { CARGO_TYPES, TRADE_LANES, MARKET_SEGMENTS } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface VesselCategoryViewProps {
  category: string
  vessels: any[]
  isExpanded: boolean
  onToggleExpand: (category: string) => void
  onCopy: (id: string) => void
  onSend: (id: string) => void
  onView: (offer: any) => void
  onToggleFavorite: (offer: any) => void
  compareOffers: any[]
}

export function VesselCategoryView({
  category,
  vessels,
  isExpanded,
  onToggleExpand,
  onCopy,
  onSend,
  onView,
  onToggleFavorite,
  compareOffers,
}: VesselCategoryViewProps) {
  const { addOffer } = useOfferStore()
  const { toggleCompareOffer } = useCompareStore()
  const { toast } = useToast()
  const [expandAllCards, setExpandAllCards] = useState(false)
  const isMobile = useIsMobile()
  const vesselCount = vessels.length

  const toggleExpandAllCards = () => {
    setExpandAllCards(!expandAllCards)
  }

  return (
    <Card key={category} className={cn("overflow-hidden border-2", isMobile && "rounded-xl shadow-sm")}>
      <div
        className={cn(
          "p-4 flex items-center justify-between cursor-pointer",
          designTokens.vesselCategoryColors[category as keyof typeof designTokens.vesselCategoryColors],
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        )}
        onClick={() => onToggleExpand(category)}
      >
        <h3 className="text-lg font-medium">
          {category}{" "}
          <span className="text-sm font-normal">
            ({vessels.length} {vessels.length === 1 ? "vessel" : "vessels"})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300">
            {vessels.length}
          </Badge>
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-sm">
            <ChevronDown
              className={cn(
                "h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform duration-200",
                isExpanded ? "transform rotate-180" : "",
              )}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-950 border-t">
              {vessels.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {vessels.length} {vessels.length === 1 ? "vessel" : "vessels"} available
                    </h4>
                    <Button variant="outline" size="sm" onClick={toggleExpandAllCards}>
                      {expandAllCards ? "Collapse All" : "Expand All"}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {vessels.map((offer, index) => (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <VesselCard
                          offer={offer}
                          isComparing={compareOffers.some((o) => o.id === offer.id)}
                          isFavorite={offer.category === "Favorites"}
                          isHighPriority={offer.score && offer.score > 0.85}
                          onCopy={onCopy}
                          onSend={onSend}
                          onView={onView}
                          onToggleFavorite={onToggleFavorite}
                          onToggleCompare={toggleCompareOffer}
                          matchScore={offer.confidenceScore ? offer.confidenceScore * 100 : undefined}
                          defaultExpanded={expandAllCards}
                          isMobile={isMobile}
                        />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No {category} vessels available
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOffer = getRandomOfferForCategory(category)

                        // Ensure vessel type matches category
                        newOffer.vesselType = category

                        // Add dry cargo specific fields
                        newOffer.contractType = ["voyage", "time", "coa"][Math.floor(Math.random() * 3)] as any
                        newOffer.cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
                        newOffer.tradeLane = TRADE_LANES[Math.floor(Math.random() * TRADE_LANES.length)]
                        newOffer.marketSegment = MARKET_SEGMENTS[Math.floor(Math.random() * MARKET_SEGMENTS.length)]
                        newOffer.bdiComparison = Math.floor(Math.random() * 40) - 20 // -20% to +20%

                        addOffer(newOffer)

                        toast({
                          title: "New offer added",
                          description: `Added a ${category} vessel to your dashboard.`,
                        })
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Add {category} Vessel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
          {isMobile ? "Tap" : "Click"} to view {vessels.length} {vessels.length === 1 ? "vessel" : "vessels"} in{" "}
          {category}
        </div>
      )}
    </Card>
  )
}
