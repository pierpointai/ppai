import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { DEFAULT_RANKING_WEIGHTS, MOCK_OFFERS } from "@/lib/mock-data"
import { rankOffers, filterOffers } from "@/lib/offer-utils"
import type { Offer, RankingWeights, FilterOptions } from "@/lib/types"

/**
 * Debounce function to limit the frequency of function calls
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Memoize function to cache expensive function results
 * @param fn Function to memoize
 * @returns Memoized function
 */
const memoize = <F extends (...args: any[]) => any>(fn: F) => {
  const cache = new Map()

  return (...args: Parameters<F>): ReturnType<F> => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = fn(...args)
    cache.set(key, result)

    // Clear cache if it gets too large
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

interface OfferStore {
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

export const useOfferStore = create<OfferStore>()(
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

      /**
       * Adds a single offer to the store
       * @param offer Offer to add
       */
      addOffer: (offer) => {
        const startTime = performance.now()

        set((state) => {
          const newOffers = [...state.offers, offer]
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(newOffers, state.filters),
            state.rankingWeights,
          )

          const endTime = performance.now()

          return {
            offers: newOffers,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
            processingTime: endTime - startTime,
          }
        })
      },

      /**
       * Adds multiple offers to the store
       * @param newOffers Offers to add
       */
      addOffers: (newOffers) => {
        const startTime = performance.now()

        set((state) => {
          const updatedOffers = [...state.offers, ...newOffers]
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(updatedOffers, state.filters),
            state.rankingWeights,
          )

          const endTime = performance.now()

          return {
            offers: updatedOffers,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
            processingTime: endTime - startTime,
          }
        })
      },

      /**
       * Updates a single offer
       * @param id Offer ID
       * @param updates Partial offer updates
       */
      updateOffer: (id, updates) => {
        const startTime = performance.now()

        set((state) => {
          const offerIndex = state.offers.findIndex((o) => o.id === id)
          if (offerIndex === -1) return state

          const updatedOffers = [...state.offers]
          updatedOffers[offerIndex] = { ...updatedOffers[offerIndex], ...updates }

          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(updatedOffers, state.filters),
            state.rankingWeights,
          )

          // Update selected offer if it's the one being updated
          let updatedSelectedOffer = state.selectedOffer
          if (state.selectedOffer?.id === id) {
            updatedSelectedOffer = { ...state.selectedOffer, ...updates }
          }

          // Update compare offers if any are being updated
          const updatedCompareOffers = state.compareOffers.map((o) => (o.id === id ? { ...o, ...updates } : o))

          const endTime = performance.now()

          return {
            offers: updatedOffers,
            filteredOffers: newFilteredOffers,
            selectedOffer: updatedSelectedOffer,
            compareOffers: updatedCompareOffers,
            lastUpdated: new Date(),
            processingTime: endTime - startTime,
          }
        })
      },

      /**
       * Updates multiple offers in a single batch operation
       * @param updates Array of offer updates
       */
      batchUpdateOffers: (updates) => {
        const startTime = performance.now()

        set((state) => {
          const updatedOffers = [...state.offers]
          const updateMap = new Map(updates.map((update) => [update.id, update.updates]))

          // Apply all updates at once
          for (let i = 0; i < updatedOffers.length; i++) {
            const offer = updatedOffers[i]
            const offerUpdates = updateMap.get(offer.id)
            if (offerUpdates) {
              updatedOffers[i] = { ...offer, ...offerUpdates }
            }
          }

          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(updatedOffers, state.filters),
            state.rankingWeights,
          )

          // Update selected offer if needed
          let updatedSelectedOffer = state.selectedOffer
          if (state.selectedOffer && updateMap.has(state.selectedOffer.id)) {
            updatedSelectedOffer = {
              ...state.selectedOffer,
              ...updateMap.get(state.selectedOffer.id),
            }
          }

          // Update compare offers if needed
          const updatedCompareOffers = state.compareOffers.map((offer) => {
            const offerUpdates = updateMap.get(offer.id)
            return offerUpdates ? { ...offer, ...offerUpdates } : offer
          })

          const endTime = performance.now()

          return {
            offers: updatedOffers,
            filteredOffers: newFilteredOffers,
            selectedOffer: updatedSelectedOffer,
            compareOffers: updatedCompareOffers,
            lastUpdated: new Date(),
            processingTime: endTime - startTime,
          }
        })
      },

      /**
       * Removes an offer from the store
       * @param id Offer ID to remove
       */
      removeOffer: (id) => {
        set((state) => {
          const newOffers = state.offers.filter((o) => o.id !== id)
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(newOffers, state.filters),
            state.rankingWeights,
          )

          // Clear selected offer if it's the one being removed
          const newSelectedOffer = state.selectedOffer?.id === id ? null : state.selectedOffer

          // Remove from compare offers if present
          const newCompareOffers = state.compareOffers.filter((o) => o.id !== id)

          return {
            offers: newOffers,
            filteredOffers: newFilteredOffers,
            selectedOffer: newSelectedOffer,
            compareOffers: newCompareOffers,
            lastUpdated: new Date(),
          }
        })
      },

      /**
       * Clears all offers from the store
       */
      clearOffers: () => {
        set({
          offers: [],
          filteredOffers: [],
          selectedOffer: null,
          compareOffers: [],
          lastUpdated: new Date(),
        })
      },

      /**
       * Selects an offer for detailed view
       * @param offer Offer to select or null to deselect
       */
      selectOffer: (offer) => {
        set({ selectedOffer: offer })

        // If selecting an offer, mark it as viewed
        if (offer) {
          get().markOfferAsViewed(offer.id)
        }
      },

      /**
       * Toggles an offer for comparison
       * @param offer Offer to toggle in comparison view
       */
      toggleCompareOffer: (offer) => {
        set((state) => {
          const isAlreadyComparing = state.compareOffers.some((o) => o.id === offer.id)

          if (isAlreadyComparing) {
            return {
              compareOffers: state.compareOffers.filter((o) => o.id !== offer.id),
            }
          } else {
            // Limit to 4 offers for comparison to avoid performance issues
            const newCompareOffers = [...state.compareOffers]
            if (newCompareOffers.length >= 4) {
              newCompareOffers.pop() // Remove the last one
            }
            newCompareOffers.unshift(offer) // Add new one at the beginning

            return {
              compareOffers: newCompareOffers,
            }
          }
        })
      },

      /**
       * Clears all offers from comparison
       */
      clearCompare: () => {
        set({ compareOffers: [] })
      },

      /**
       * Sets ranking weights for offer sorting
       * @param weights Ranking weights
       */
      setRankingWeights: debounce((weights) => {
        set((state) => {
          const normalizedWeights = normalizeWeights(weights)
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(state.offers, state.filters),
            normalizedWeights,
          )

          return {
            rankingWeights: normalizedWeights,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
          }
        })
      }, 300),

      /**
       * Sets filters for offer filtering
       * @param filters Filter options
       */
      setFilters: debounce((filters) => {
        set((state) => {
          const newFilteredOffers = memoizedRankOffers(
            memoizedFilterOffers(state.offers, filters),
            state.rankingWeights,
          )

          return {
            filters,
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
          }
        })
      }, 300),

      /**
       * Resets all filters
       */
      resetFilters: () => {
        set((state) => {
          const newFilteredOffers = memoizedRankOffers(state.offers, state.rankingWeights)

          return {
            filters: {},
            filteredOffers: newFilteredOffers,
            lastUpdated: new Date(),
          }
        })
      },

      /**
       * Sets category for an offer
       * @param id Offer ID
       * @param category Category to set
       */
      setCategoryForOffer: (id, category) => {
        get().updateOffer(id, { category })
      },

      /**
       * Sets priority for an offer
       * @param id Offer ID
       * @param priority Priority to set
       */
      setPriorityForOffer: (id, priority) => {
        get().updateOffer(id, { priority })
      },

      /**
       * Marks an offer as viewed
       * @param id Offer ID
       */
      markOfferAsViewed: (id) => {
        // Update the lastViewed timestamp without triggering a full re-render
        set((state) => {
          const offerIndex = state.offers.findIndex((o) => o.id === id)
          if (offerIndex === -1) return state

          const updatedOffers = [...state.offers]
          updatedOffers[offerIndex] = {
            ...updatedOffers[offerIndex],
            lastViewed: new Date(),
          }

          return {
            offers: updatedOffers,
          }
        })
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
)

/**
 * Helper function to normalize weights to ensure they sum to 1
 * @param weights Ranking weights
 * @returns Normalized ranking weights
 */
function normalizeWeights(weights: RankingWeights): RankingWeights {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)

  // Prevent division by zero
  if (sum === 0) return DEFAULT_RANKING_WEIGHTS

  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / sum])) as RankingWeights
}

// Selector hooks for better performance
export const useFilteredOffers = () => useOfferStore((state) => state.filteredOffers)
export const useSelectedOffer = () => useOfferStore((state) => state.selectedOffer)
export const useCompareOffers = () => useOfferStore((state) => state.compareOffers)
export const useRankingWeights = () => useOfferStore((state) => state.rankingWeights)
export const useFilters = () => useOfferStore((state) => state.filters)
