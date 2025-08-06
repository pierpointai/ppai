import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { devtools } from "zustand/middleware"
import { DEFAULT_RANKING_WEIGHTS, MOCK_OFFERS } from "@/lib/mock-data"
import { rankOffers, filterOffers } from "@/lib/offer-utils"
import type { Offer, RankingWeights, FilterOptions } from "@/lib/types"

// Define the store state interface
interface OfferState {
  // State
  offers: Offer[]
  filteredOffers: Offer[]
  selectedOffer: Offer | null
  compareOffers: Offer[]
  rankingWeights: RankingWeights
  filters: FilterOptions
  lastUpdated: Date
  isLoading: boolean
  processingTime: number
}

// Define the store actions interface
interface OfferActions {
  // Actions
  addOffer: (offer: Offer) => void
  addOffers: (offers: Offer[]) => void
  updateOffer: (id: string, updates: Partial<Offer>) => void
  removeOffer: (id: string) => void
  clearOffers: () => void
  selectOffer: (offer: Offer | null) => void
  toggleCompareOffer: (offer: Offer) => void
  clearCompare: () => void
  setRankingWeights: (weights: RankingWeights) => void
  setFilters: (filters: FilterOptions) => void
  resetFilters: () => void
  setCategoryForOffer: (id: string, category: string) => void
  setPriorityForOffer: (id: string, priority: "high" | "medium" | "low") => void
  markOfferAsViewed: (id: string) => void
  batchUpdateOffers: (updates: Array<{ id: string; updates: Partial<Offer> }>) => void
}

// Combine state and actions
type OfferStore = OfferState & OfferActions

// Memoize expensive operations
const memoize = <F extends (...args: any[]) => any>(fn: F) => {
  const cache = new Map()
  return (...args: Parameters<F>): ReturnType<F> => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    return result
  }
}

// Memoized filter and rank functions
const memoizedFilterOffers = memoize(filterOffers)
const memoizedRankOffers = memoize(rankOffers)

// Helper function to normalize weights
function normalizeWeights(weights: RankingWeights): RankingWeights {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  if (sum === 0) return DEFAULT_RANKING_WEIGHTS
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / sum])) as RankingWeights
}

// Create the store with middleware
export const useOfferStore = create<OfferStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        offers: [...MOCK_OFFERS],
        filteredOffers: rankOffers([...MOCK_OFFERS]),
        selectedOffer: null,
        compareOffers: [],
        rankingWeights: { ...DEFAULT_RANKING_WEIGHTS },
        filters: {},
        lastUpdated: new Date(),
        isLoading: false,
        processingTime: 0,

        // Actions
        addOffer: (offer) => {
          const startTime = performance.now()
          const currentState = get()
          const newOffers = [...currentState.offers, offer]
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(newOffers, currentState.filters),
            currentState.rankingWeights,
          )

          set({
            offers: newOffers,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        addOffers: (newOffers) => {
          const startTime = performance.now()
          const currentState = get()
          const updatedOffers = [...currentState.offers, ...newOffers]
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(updatedOffers, currentState.filters),
            currentState.rankingWeights,
          )

          set({
            offers: updatedOffers,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        updateOffer: (id, updates) => {
          const startTime = performance.now()
          const currentState = get()
          const offerIndex = currentState.offers.findIndex((o) => o.id === id)
          if (offerIndex === -1) return

          const updatedOffers = [...currentState.offers]
          updatedOffers[offerIndex] = { ...updatedOffers[offerIndex], ...updates }

          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(updatedOffers, currentState.filters),
            currentState.rankingWeights,
          )

          // Update selected offer if it's the one being updated
          let updatedSelectedOffer = currentState.selectedOffer
          if (currentState.selectedOffer?.id === id) {
            updatedSelectedOffer = { ...currentState.selectedOffer, ...updates }
          }

          // Update compare offers if any are being updated
          const updatedCompareOffers = currentState.compareOffers.map((o) => 
            o.id === id ? { ...o, ...updates } : o
          )

          set({
            offers: updatedOffers,
            filteredOffers: newFilteredOffers,
            selectedOffer: updatedSelectedOffer,
            compareOffers: updatedCompareOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        batchUpdateOffers: (updates) => {
          const startTime = performance.now()
          const currentState = get()
          const updateMap = new Map(updates.map((update) => [update.id, update.updates]))

          const updatedOffers = currentState.offers.map((offer) => {
            const offerUpdates = updateMap.get(offer.id)
            return offerUpdates ? { ...offer, ...offerUpdates } : offer
          })

          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(updatedOffers, currentState.filters),
            currentState.rankingWeights,
          )

          // Update selected offer if needed
          let updatedSelectedOffer = currentState.selectedOffer
          if (currentState.selectedOffer && updateMap.has(currentState.selectedOffer.id)) {
            updatedSelectedOffer = {
              ...currentState.selectedOffer,
              ...updateMap.get(currentState.selectedOffer.id),
            }
          }

          // Update compare offers if needed
          const updatedCompareOffers = currentState.compareOffers.map((offer) => {
            const offerUpdates = updateMap.get(offer.id)
            return offerUpdates ? { ...offer, ...offerUpdates } : offer
          })

          set({
            offers: updatedOffers,
            filteredOffers: newFilteredOffers,
            selectedOffer: updatedSelectedOffer,
            compareOffers: updatedCompareOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        removeOffer: (id) => {
          const currentState = get()
          const newOffers = currentState.offers.filter((o) => o.id !== id)
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(newOffers, currentState.filters),
            currentState.rankingWeights,
          )

          // Clear selected offer if it's the one being removed
          const newSelectedOffer = currentState.selectedOffer?.id === id ? null : currentState.selectedOffer

          // Remove from compare offers if present
          const newCompareOffers = currentState.compareOffers.filter((o) => o.id !== id)

          set({
            offers: newOffers,
            filteredOffers: newFilteredOffers,
            selectedOffer: newSelectedOffer,
            compareOffers: newCompareOffers,
            lastUpdated: new Date(),
          })
        },

        clearOffers: () => {
          set({
            offers: [],
            filteredOffers: [],
            selectedOffer: null,
            compareOffers: [],
            lastUpdated: new Date(),
          })
        },

        selectOffer: (offer) => {
          set({ selectedOffer: offer })

          // If selecting an offer, mark it as viewed
          if (offer) {
            get().markOfferAsViewed(offer.id)
          }
        },

        toggleCompareOffer: (offer) => {
          const currentState = get()
          const isAlreadyComparing = currentState.compareOffers.some((o) => o.id === offer.id)

          if (isAlreadyComparing) {
            set({
              compareOffers: currentState.compareOffers.filter((o) => o.id !== offer.id),
            })
          } else {
            // Limit to 4 offers for comparison to avoid performance issues
            const newCompareOffers = [...currentState.compareOffers]
            if (newCompareOffers.length >= 4) {
              newCompareOffers.pop() // Remove the last one
            }
            newCompareOffers.unshift(offer) // Add new one at the beginning

            set({
              compareOffers: newCompareOffers,
            })
          }
        },

        clearCompare: () => {
          set({ compareOffers: [] })
        },

        setRankingWeights: (weights) => {
          const currentState = get()
          const normalizedWeights = normalizeWeights(weights)
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(currentState.offers, currentState.filters),
            normalizedWeights,
          )

          set({
            rankingWeights: normalizedWeights,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
          })
        },

        setFilters: (filters) => {
          const currentState = get()
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(currentState.offers, filters),
            currentState.rankingWeights,
          )

          set({
            filters,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
          })
        },

        resetFilters: () => {
          const currentState = get()
          const newFilteredOffers = memoizedRankOffers(currentState.offers, currentState.rankingWeights)

          set({
            filters: {},
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
          })
        },

        setCategoryForOffer: (id, category) => {
          get().updateOffer(id, { category })
        },

        setPriorityForOffer: (id, priority) => {
          get().updateOffer(id, { priority })
        },

        markOfferAsViewed: (id) => {
          const currentState = get()
          const offerIndex = currentState.offers.findIndex((o) => o.id === id)
          if (offerIndex === -1) return

          const updatedOffers = [...currentState.offers]
          updatedOffers[offerIndex] = {
            ...updatedOffers[offerIndex],
            lastViewed: new Date(),
          }

          set({ offers: updatedOffers })
        },
      }),
      {
        name: "offer-store",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          offers: state.offers,
          rankingWeights: state.rankingWeights,
          filters: state.filters,
        }),
      },
    ),
    { name: "offer-store" },
  ),
)

// Selector hooks for better performance
export const useFilteredOffers = () => useOfferStore((state) => state.filteredOffers)
export const useSelectedOffer = () => useOfferStore((state) => state.selectedOffer)
export const useCompareOffers = () => useOfferStore((state) => state.compareOffers)
export const useRankingWeights = () => useOfferStore((state) => state.rankingWeights)
export const useFilters = () => useOfferStore((state) => state.filters)
