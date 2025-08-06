"use client"

import { useMemo } from "react"
import type { Offer } from "@/lib/types"

export function useOfferCalculations(offers: Offer[], activeCategory?: string) {
  const filteredOffers = useMemo(() => {
    if (!activeCategory) return offers
    return offers.filter((offer) => offer.category === activeCategory)
  }, [offers, activeCategory])

  const offerStats = useMemo(() => {
    return {
      total: offers.length,
      filtered: filteredOffers.length,
      favorites: offers.filter((offer) => offer.category === "Favorites").length,
      highPriority: offers.filter((offer) => offer.score && offer.score > 0.85).length,
    }
  }, [offers, filteredOffers])

  return {
    filteredOffers,
    offerStats,
  }
}

export function useMatchScore(offer: Offer, request?: any) {
  return useMemo(() => {
    if (!request) return { score: 0, matches: {} }

    const calculateMatch = (offerValue: any, requestValue: any) => {
      if (!requestValue) return { matches: true, exact: true }
      if (!offerValue) return { matches: false, exact: false }

      if (typeof offerValue === "string" && typeof requestValue === "string") {
        const exact = offerValue.toLowerCase() === requestValue.toLowerCase()
        const includes =
          offerValue.toLowerCase().includes(requestValue.toLowerCase()) ||
          requestValue.toLowerCase().includes(offerValue.toLowerCase())
        return { matches: exact || includes, exact }
      }

      if (typeof offerValue === "number" && typeof requestValue === "number") {
        const exact = offerValue === requestValue
        const within10Percent = offerValue >= requestValue * 0.9 && offerValue <= requestValue * 1.1
        return { matches: within10Percent, exact }
      }

      return { matches: false, exact: false }
    }

    const matches: Record<string, { matches: boolean; exact: boolean }> = {
      vesselType: calculateMatch(offer.vesselType, request.vesselType),
      vesselSize: calculateMatch(offer.vesselSize, request.vesselSize),
      loadPort: calculateMatch(offer.loadPort, request.loadPort),
      dischargePort: calculateMatch(offer.dischargePort, request.dischargePort),
      laycan: {
        matches:
          new Date(offer.laycanStart) <= new Date(request.laycanEnd || "2099-12-31") &&
          new Date(offer.laycanEnd) >= new Date(request.laycanStart || "1970-01-01"),
        exact: false,
      },
      rate: calculateMatch(offer.freightRate, request.targetRate),
    }

    const matchCount = Object.values(matches).filter((m) => m.matches).length
    const score = Math.round((matchCount / Object.keys(matches).length) * 100)

    return { score, matches }
  }, [offer, request])
}
