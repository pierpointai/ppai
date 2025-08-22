import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { devtools } from "zustand/middleware"
import { MOCK_OFFERS } from "@/lib/mock-data"
import { enhancedRankOffers } from "@/lib/enhanced-matching"
import type { Offer, EnhancedRankingWeights, GeographicRadius } from "@/lib/types"

// Default enhanced ranking weights
const DEFAULT_ENHANCED_WEIGHTS: EnhancedRankingWeights = {
  vesselSize: 0.25,
  laycan: 0.2,
  freightRate: 0.2,
  region: 0.1,
  vesselAge: 0.05,
  cargoType: 0.05,
  chartererReputation: 0.05,
  portEfficiency: 0.03,
  historicalPerformance: 0.04,
  marketTrend: 0.02,
  geographicProximity: 0.01,
}

interface EnhancedOfferState {
  offers: Offer[]
  filteredOffers: Offer[]
  selectedOffer: Offer | null
  compareOffers: Offer[]
  enhancedWeights: EnhancedRankingWeights
  geographicRadius: GeographicRadius
  clientRequirements: any
  lastUpdated: Date
  isLoading: boolean
  processingTime: number
}

interface EnhancedOfferActions {
  setEnhancedWeights: (weights: EnhancedRankingWeights) => void
  setGeographicRadius: (radius: GeographicRadius) => void
  setClientRequirements: (requirements: any) => void
  reRankOffers: () => void
  addOffer: (offer: Offer) => void
  updateOffer: (id: string, updates: Partial<Offer>) => void
  removeOffer: (id: string) => void
  selectOffer: (offer: Offer | null) => void
  toggleCompareOffer: (offer: Offer) => void
  clearCompare: () => void
}

type EnhancedOfferStore = EnhancedOfferState & EnhancedOfferActions

export const useEnhancedOfferStore = create<EnhancedOfferStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        offers: [...MOCK_OFFERS],
        filteredOffers: enhancedRankOffers([...MOCK_OFFERS], DEFAULT_ENHANCED_WEIGHTS),
        selectedOffer: null,
        compareOffers: [],
        enhancedWeights: { ...DEFAULT_ENHANCED_WEIGHTS },
        geographicRadius: { enabled: false, radiusKm: 200, preferExactMatch: true },
        clientRequirements: {},
        lastUpdated: new Date(),
        isLoading: false,
        processingTime: 0,

        // Actions
        setEnhancedWeights: (weights) => {
          const startTime = performance.now()

          set((state) => {
            state.enhancedWeights = weights
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              weights,
              state.clientRequirements,
              state.geographicRadius,
            )
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        setGeographicRadius: (radius) => {
          const startTime = performance.now()

          set((state) => {
            state.geographicRadius = radius
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              state.enhancedWeights,
              state.clientRequirements,
              radius,
            )
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        setClientRequirements: (requirements) => {
          const startTime = performance.now()

          set((state) => {
            state.clientRequirements = requirements
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              state.enhancedWeights,
              requirements,
              state.geographicRadius,
            )
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        reRankOffers: () => {
          const startTime = performance.now()

          set((state) => {
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              state.enhancedWeights,
              state.clientRequirements,
              state.geographicRadius,
            )
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        addOffer: (offer) => {
          const startTime = performance.now()

          set((state) => {
            state.offers.push(offer)
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              state.enhancedWeights,
              state.clientRequirements,
              state.geographicRadius,
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
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              state.enhancedWeights,
              state.clientRequirements,
              state.geographicRadius,
            )

            if (state.selectedOffer?.id === id) {
              state.selectedOffer = { ...state.selectedOffer, ...updates }
            }

            state.compareOffers = state.compareOffers.map((o) => (o.id === id ? { ...o, ...updates } : o))
            state.lastUpdated = new Date()
            state.processingTime = performance.now() - startTime
          })
        },

        removeOffer: (id) => {
          set((state) => {
            state.offers = state.offers.filter((o) => o.id !== id)
            state.filteredOffers = enhancedRankOffers(
              state.offers,
              state.enhancedWeights,
              state.clientRequirements,
              state.geographicRadius,
            )

            if (state.selectedOffer?.id === id) {
              state.selectedOffer = null
            }

            state.compareOffers = state.compareOffers.filter((o) => o.id !== id)
            state.lastUpdated = new Date()
          })
        },

        selectOffer: (offer) => {
          set((state) => {
            state.selectedOffer = offer
          })
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
      })),
      {
        name: "enhanced-offer-store",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          offers: state.offers,
          enhancedWeights: state.enhancedWeights,
          geographicRadius: state.geographicRadius,
          clientRequirements: state.clientRequirements,
        }),
      },
    ),
    { name: "enhanced-offer-store" },
  ),
)

// Selector hooks
export const useEnhancedFilteredOffers = () => useEnhancedOfferStore((state) => state.filteredOffers)
export const useEnhancedWeights = () => useEnhancedOfferStore((state) => state.enhancedWeights)
export const useGeographicRadius = () => useEnhancedOfferStore((state) => state.geographicRadius)
export const useClientRequirements = () => useEnhancedOfferStore((state) => state.clientRequirements)
