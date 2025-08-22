import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "@/lib/zustand-immer"
import { devtools } from "zustand/middleware"
import { DEFAULT_RANKING_WEIGHTS, MOCK_OFFERS } from "@/lib/mock-data"
import { rankOffers, filterOffers } from "@/lib/offer-utils"
import type { Offer, RankingWeights, FilterOptions } from "@/lib/types"

interface OfferState {
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

interface OfferActions {
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

type OfferStore = OfferState & OfferActions

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

const memoizedFilterOffers = memoize(filterOffers)
const memoizedRankOffers = memoize(rankOffers)

function normalizeWeights(weights: RankingWeights): RankingWeights {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  if (sum === 0) return DEFAULT_RANKING_WEIGHTS
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / sum])) as RankingWeights
}

export const useOfferStore = create<OfferStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        offers: [...MOCK_OFFERS],
        filteredOffers: rankOffers([...MOCK_OFFERS]),
        selectedOffer: null,
        compareOffers: [],
        rankingWeights: { ...DEFAULT_RANKING_WEIGHTS },
        filters: {},
        lastUpdated: new Date(),
        isLoading: false,
        processingTime: 0,

        addOffer: (offer) => {
          const startTime = performance.now()
          set((state) => {
            state.offers.push(offer)
            state.filteredOffers = memoizedRankOffers(
              memoizedFilterOffers(state.offers, state.filters),
              state.rankingWeights,
            )
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        addOffers: (newOffers) => {
          const startTime = performance.now()
          set((state) => {
            state.offers.push(...newOffers)
            state.filteredOffers = memoizedRankOffers(
              memoizedFilterOffers(state.offers, state.filters),
              state.rankingWeights,
            )
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        updateOffer: (id, updates) => {
          const startTime = performance.now()
          set((state) => {
            const offerIndex = state.offers.findIndex((o) => o.id === id)
            if (offerIndex === -1) return

            state.offers[offerIndex] = { ...state.offers[offerIndex], ...updates }
            state.filteredOffers = memoizedRankOffers(
              memoizedFilterOffers(state.offers, state.filters),
              state.rankingWeights,
            )

            if (state.selectedOffer?.id === id) {
              state.selectedOffer = { ...state.selectedOffer, ...updates }
            }

            state.compareOffers = state.compareOffers.map((o) => (o.id === id ? { ...o, ...updates } : o))
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        batchUpdateOffers: (updates) => {
          const startTime = performance.now()
          set((state) => {
            const updateMap = new Map(updates.map((update) => [update.id, update.updates]))

            for (let i = 0; i < state.offers.length; i++) {
              const offer = state.offers[i]
              const offerUpdates = updateMap.get(offer.id)
              if (offerUpdates) {
                state.offers[i] = { ...offer, ...offerUpdates }
              }
            }

            state.filteredOffers = memoizedRankOffers(
              memoizedFilterOffers(state.offers, state.filters),
              state.rankingWeights,
            )

            if (state.selectedOffer && updateMap.has(state.selectedOffer.id)) {
              state.selectedOffer = {
                ...state.selectedOffer,
                ...updateMap.get(state.selectedOffer.id),
              }
            }

            state.compareOffers = state.compareOffers.map((offer) => {
              const offerUpdates = updateMap.get(offer.id)
              return offerUpdates ? { ...offer, ...offerUpdates } : offer
            })

            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        removeOffer: (id) => {
          set((state) => {
            state.offers = state.offers.filter((o) => o.id !== id)
            state.filteredOffers = memoizedRankOffers(
              memoizedFilterOffers(state.offers, state.filters),
              state.rankingWeights,
            )

            if (state.selectedOffer?.id === id) {
              state.selectedOffer = null
            }

            state.compareOffers = state.compareOffers.filter((o) => o.id !== id)
            state.lastUpdated = new Date()
          })
        },

        clearOffers: () => {
          set((state) => {
            state.offers = []
            state.filteredOffers = []
            state.selectedOffer = null
            state.compareOffers = []
            state.lastUpdated = new Date()
          })
        },

        selectOffer: (offer) => {
          set((state) => {
            state.selectedOffer = offer
          })

          if (offer) {
            get().markOfferAsViewed(offer.id)
          }
        },

        toggleCompareOffer: (offer) => {
          set((state) => {
            const isAlreadyComparing = state.compareOffers.some((o) => o.id === offer.id)

            if (isAlreadyComparing) {
              state.compareOffers = state.compareOffers.filter((o) => o.id !== offer.id)
            } else {
              if (state.compareOffers.length >= 4) {
                state.compareOffers.pop()
              }
              state.compareOffers.unshift(offer)
            }
          })
        },

        clearCompare: () => {
          set((state) => {
            state.compareOffers = []
          })
        },

        setRankingWeights: (weights) => {
          set((state) => {
            const normalizedWeights = normalizeWeights(weights)
            state.rankingWeights = normalizedWeights
            state.filteredOffers = memoizedRankOffers(
              memoizedFilterOffers(state.offers, state.filters),
              normalizedWeights,
            )
            state.lastUpdated = new Date()
          })
        },

        setFilters: (filters) => {
          set((state) => {
            state.filters = filters
            state.filteredOffers = memoizedRankOffers(memoizedFilterOffers(state.offers, filters), state.rankingWeights)
            state.lastUpdated = new Date()
          })
        },

        resetFilters: () => {
          set((state) => {
            state.filters = {}
            state.filteredOffers = memoizedRankOffers(state.offers, state.rankingWeights)
            state.lastUpdated = new Date()
          })
        },

        setCategoryForOffer: (id, category) => {
          get().updateOffer(id, { category })
        },

        setPriorityForOffer: (id, priority) => {
          get().updateOffer(id, { priority })
        },

        markOfferAsViewed: (id) => {
          set((state) => {
            const offerIndex = state.offers.findIndex((o) => o.id === id)
            if (offerIndex === -1) return

            state.offers[offerIndex].lastViewed = new Date()
          })
        },
      })),
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

export const useFilteredOffers = () => useOfferStore((state) => state.filteredOffers)
export const useSelectedOffer = () => useOfferStore((state) => state.selectedOffer)
export const useCompareOffers = () => useOfferStore((state) => state.compareOffers)
export const useRankingWeights = () => useOfferStore((state) => state.rankingWeights)
export const useFilters = () => useOfferStore((state) => state.filters)
