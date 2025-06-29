import { create } from "zustand"
import type { Offer } from "@/lib/types"

interface CompareState {
  compareOffers: Offer[]
  toggleCompareOffer: (offer: Offer) => void
  addCompareOffer: (offer: Offer) => void
  removeCompareOffer: (offerId: string) => void
  clearCompareOffers: () => void
}

export const useCompareStore = create<CompareState>((set) => ({
  compareOffers: [],

  toggleCompareOffer: (offer) =>
    set((state) => {
      const exists = state.compareOffers.some((o) => o.id === offer.id)

      if (exists) {
        return {
          compareOffers: state.compareOffers.filter((o) => o.id !== offer.id),
        }
      } else {
        // Limit to 4 offers for comparison
        const newOffers = [...state.compareOffers]
        if (newOffers.length >= 4) {
          newOffers.shift() // Remove the oldest offer if we already have 4
        }
        return {
          compareOffers: [...newOffers, offer],
        }
      }
    }),

  addCompareOffer: (offer) =>
    set((state) => {
      if (state.compareOffers.some((o) => o.id === offer.id)) {
        return state // Already in the list
      }

      // Limit to 4 offers for comparison
      const newOffers = [...state.compareOffers]
      if (newOffers.length >= 4) {
        newOffers.shift() // Remove the oldest offer if we already have 4
      }

      return {
        compareOffers: [...newOffers, offer],
      }
    }),

  removeCompareOffer: (offerId) =>
    set((state) => ({
      compareOffers: state.compareOffers.filter((o) => o.id !== offerId),
    })),

  clearCompareOffers: () => set({ compareOffers: [] }),
}))
