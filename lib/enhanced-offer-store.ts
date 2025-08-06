import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
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
      (set, get) => ({
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
          const currentState = get()

          const filteredOffers = enhancedRankOffers(
            currentState.offers,
            weights,
            currentState.clientRequirements,
            currentState.geographicRadius,
          )

          set({
            enhancedWeights: weights,
            filteredOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        setGeographicRadius: (radius) => {
          const startTime = performance.now()
          const currentState = get()

          const filteredOffers = enhancedRankOffers(
            currentState.offers,
            currentState.enhancedWeights,
            currentState.clientRequirements,
            radius,
          )

          set({
            geographicRadius: radius,
            filteredOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        setClientRequirements: (requirements) => {
          const startTime = performance.now()
          const currentState = get()

          const filteredOffers = enhancedRankOffers(
            currentState.offers,
            currentState.enhancedWeights,
            requirements,
            currentState.geographicRadius,
          )

          set({
            clientRequirements: requirements,
            filteredOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        reRankOffers: () => {
          const startTime = performance.now()
          const currentState = get()

          const filteredOffers = enhancedRankOffers(
            currentState.offers,
            currentState.enhancedWeights,
            currentState.clientRequirements,
            currentState.geographicRadius,
          )

          set({
            filteredOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        addOffer: (offer) => {
          const startTime = performance.now()
          const currentState = get()
          const newOffers = [...currentState.offers, offer]

          const filteredOffers = enhancedRankOffers(
            newOffers,
            currentState.enhancedWeights,
            currentState.clientRequirements,
            currentState.geographicRadius,
          )

          set({
            offers: newOffers,
            filteredOffers,
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

          const filteredOffers = enhancedRankOffers(
            updatedOffers,
            currentState.enhancedWeights,
            currentState.clientRequirements,
            currentState.geographicRadius,
          )

          let updatedSelectedOffer = currentState.selectedOffer
          if (currentState.selectedOffer?.id === id) {
            updatedSelectedOffer = { ...currentState.selectedOffer, ...updates }
          }

          const updatedCompareOffers = currentState.compareOffers.map((o) => 
            o.id === id ? { ...o, ...updates } : o
          )

          set({
            offers: updatedOffers,
            filteredOffers,
            selectedOffer: updatedSelectedOffer,
            compareOffers: updatedCompareOffers,
            lastUpdated: new Date(),
            processingTime: performance.now() - startTime,
          })
        },

        removeOffer: (id) => {
          const currentState = get()
          const newOffers = currentState.offers.filter((o) => o.id !== id)

          const filteredOffers = enhancedRankOffers(
            newOffers,
            currentState.enhancedWeights,
            currentState.clientRequirements,
            currentState.geographicRadius,
          )

          const newSelectedOffer = currentState.selectedOffer?.id === id ? null : currentState.selectedOffer
          const newCompareOffers = currentState.compareOffers.filter((o) => o.id !== id)

          set({
            offers: newOffers,
            filteredOffers,
            selectedOffer: newSelectedOffer,
            compareOffers: newCompareOffers,
            lastUpdated: new Date(),
          })
        },

        selectOffer: (offer) => {
          set({ selectedOffer: offer })
        },

        toggleCompareOffer: (offer) => {
          const currentState = get()
          const isAlreadyComparing = currentState.compareOffers.some((o) => o.id === offer.id)

          if (isAlreadyComparing) {
            set({
              compareOffers: currentState.compareOffers.filter((o) => o.id !== offer.id),
            })
          } else {
            const newCompareOffers = [...currentState.compareOffers]
            if (newCompareOffers.length >= 4) {
              newCompareOffers.pop()
            }
            newCompareOffers.unshift(offer)

            set({
              compareOffers: newCompareOffers,
            })
          }
        },

        clearCompare: () => {
          set({ compareOffers: [] })
        },
      }),
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
