import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Offer } from "./types"

interface EnhancedOfferState {
  // Core offer data
  offers: Offer[]
  filteredOffers: Offer[]
  selectedOffer: Offer | null

  // Comparison functionality
  compareOffers: Offer[]
  maxCompareOffers: number

  // Search and filtering
  searchTerm: string
  activeFilters: {
    vesselType?: string[]
    cargoType?: string[]
    status?: string[]
    priority?: string[]
    dateRange?: { start: Date; end: Date }
    rateRange?: { min: number; max: number }
    sizeRange?: { min: number; max: number }
  }

  // Sorting and ranking
  sortBy: "score" | "rate" | "date" | "vessel" | "priority"
  sortOrder: "asc" | "desc"
  rankingWeights: {
    vesselSize: number
    laycan: number
    freightRate: number
    region: number
    vesselAge: number
    cargoType: number
  }

  // Performance tracking
  lastUpdated: Date
  processingTime: number
  isLoading: boolean

  // Actions
  addOffer: (offer: Offer) => void
  addOffers: (offers: Offer[]) => void
  updateOffer: (id: string, updates: Partial<Offer>) => void
  removeOffer: (id: string) => void
  clearOffers: () => void

  // Selection
  selectOffer: (offer: Offer | null) => void

  // Comparison
  toggleCompareOffer: (offer: Offer) => void
  clearCompareOffers: () => void
  isOfferInComparison: (offerId: string) => boolean

  // Search and filtering
  setSearchTerm: (term: string) => void
  setFilters: (filters: Partial<EnhancedOfferState["activeFilters"]>) => void
  clearFilters: () => void
  applyFilters: () => void

  // Sorting
  setSortBy: (sortBy: EnhancedOfferState["sortBy"]) => void
  setSortOrder: (order: EnhancedOfferState["sortOrder"]) => void
  setRankingWeights: (weights: Partial<EnhancedOfferState["rankingWeights"]>) => void

  // Bulk operations
  batchUpdateOffers: (updates: Array<{ id: string; updates: Partial<Offer> }>) => void
  markOffersAsViewed: (offerIds: string[]) => void

  // Categories and priorities
  setCategoryForOffer: (id: string, category: string) => void
  setPriorityForOffer: (id: string, priority: Offer["priority"]) => void

  // Utility functions
  getOffersByCategory: (category: string) => Offer[]
  getOffersByPriority: (priority: Offer["priority"]) => Offer[]
  getOffersByStatus: (status: Offer["status"]) => Offer[]
  searchOffers: (query: string) => Offer[]

  // Analytics
  getOfferStats: () => {
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    byVesselType: Record<string, number>
    averageRate: number
    averageScore: number
  }
}

export const useEnhancedOfferStore = create<EnhancedOfferState>()(
  persist(
    (set, get) => ({
      // Initial state
      offers: [],
      filteredOffers: [],
      selectedOffer: null,
      compareOffers: [],
      maxCompareOffers: 4,
      searchTerm: "",
      activeFilters: {},
      sortBy: "score",
      sortOrder: "desc",
      rankingWeights: {
        vesselSize: 0.25,
        laycan: 0.2,
        freightRate: 0.2,
        region: 0.15,
        vesselAge: 0.1,
        cargoType: 0.1,
      },
      lastUpdated: new Date(),
      processingTime: 0,
      isLoading: false,

      // Actions
      addOffer: (offer) => {
        const startTime = performance.now()

        set((state) => {
          const newOffers = [...state.offers, offer]
          const endTime = performance.now()

          return {
            offers: newOffers,
            lastUpdated: new Date(),
            processingTime: endTime - startTime,
          }
        })

        // Apply filters after adding
        get().applyFilters()
      },

      addOffers: (newOffers) => {
        const startTime = performance.now()

        set((state) => {
          const updatedOffers = [...state.offers, ...newOffers]
          const endTime = performance.now()

          return {
            offers: updatedOffers,
            lastUpdated: new Date(),
            processingTime: endTime - startTime,
          }
        })

        get().applyFilters()
      },

      updateOffer: (id, updates) => {
        set((state) => {
          const updatedOffers = state.offers.map((offer) => (offer.id === id ? { ...offer, ...updates } : offer))

          return {
            offers: updatedOffers,
            selectedOffer:
              state.selectedOffer?.id === id ? { ...state.selectedOffer, ...updates } : state.selectedOffer,
            compareOffers: state.compareOffers.map((offer) => (offer.id === id ? { ...offer, ...updates } : offer)),
            lastUpdated: new Date(),
          }
        })

        get().applyFilters()
      },

      removeOffer: (id) => {
        set((state) => ({
          offers: state.offers.filter((offer) => offer.id !== id),
          selectedOffer: state.selectedOffer?.id === id ? null : state.selectedOffer,
          compareOffers: state.compareOffers.filter((offer) => offer.id !== id),
          lastUpdated: new Date(),
        }))

        get().applyFilters()
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
      },

      toggleCompareOffer: (offer) => {
        set((state) => {
          const isAlreadyComparing = state.compareOffers.some((o) => o.id === offer.id)

          if (isAlreadyComparing) {
            return {
              compareOffers: state.compareOffers.filter((o) => o.id !== offer.id),
            }
          } else {
            if (state.compareOffers.length >= state.maxCompareOffers) {
              // Remove the oldest offer and add the new one
              const newCompareOffers = [...state.compareOffers.slice(1), offer]
              return { compareOffers: newCompareOffers }
            } else {
              return {
                compareOffers: [...state.compareOffers, offer],
              }
            }
          }
        })
      },

      clearCompareOffers: () => {
        set({ compareOffers: [] })
      },

      isOfferInComparison: (offerId) => {
        return get().compareOffers.some((offer) => offer.id === offerId)
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term })
        get().applyFilters()
      },

      setFilters: (filters) => {
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        }))
        get().applyFilters()
      },

      clearFilters: () => {
        set({ activeFilters: {}, searchTerm: "" })
        get().applyFilters()
      },

      applyFilters: () => {
        const state = get()
        let filtered = [...state.offers]

        // Apply search term
        if (state.searchTerm) {
          const term = state.searchTerm.toLowerCase()
          filtered = filtered.filter(
            (offer) =>
              offer.vesselName?.toLowerCase().includes(term) ||
              offer.vesselType.toLowerCase().includes(term) ||
              offer.loadPort.toLowerCase().includes(term) ||
              offer.dischargePort.toLowerCase().includes(term) ||
              offer.cargoType?.toLowerCase().includes(term) ||
              offer.charterer?.toLowerCase().includes(term),
          )
        }

        // Apply filters
        const { activeFilters } = state

        if (activeFilters.vesselType?.length) {
          filtered = filtered.filter((offer) => activeFilters.vesselType!.includes(offer.vesselType))
        }

        if (activeFilters.cargoType?.length) {
          filtered = filtered.filter((offer) => offer.cargoType && activeFilters.cargoType!.includes(offer.cargoType))
        }

        if (activeFilters.status?.length) {
          filtered = filtered.filter((offer) => offer.status && activeFilters.status!.includes(offer.status))
        }

        if (activeFilters.priority?.length) {
          filtered = filtered.filter((offer) => offer.priority && activeFilters.priority!.includes(offer.priority))
        }

        if (activeFilters.dateRange) {
          const { start, end } = activeFilters.dateRange
          filtered = filtered.filter((offer) => offer.laycanStart >= start && offer.laycanEnd <= end)
        }

        if (activeFilters.rateRange) {
          const { min, max } = activeFilters.rateRange
          filtered = filtered.filter((offer) => offer.freightRate >= min && offer.freightRate <= max)
        }

        if (activeFilters.sizeRange) {
          const { min, max } = activeFilters.sizeRange
          filtered = filtered.filter((offer) => offer.vesselSize >= min && offer.vesselSize <= max)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let comparison = 0

          switch (state.sortBy) {
            case "score":
              comparison = (b.score || 0) - (a.score || 0)
              break
            case "rate":
              comparison = b.freightRate - a.freightRate
              break
            case "date":
              comparison = a.laycanStart.getTime() - b.laycanStart.getTime()
              break
            case "vessel":
              comparison = a.vesselSize - b.vesselSize
              break
            case "priority":
              const priorityOrder = { urgent: 4, firm: 3, indication: 2, low: 1 }
              const aPriority = priorityOrder[a.priority || "low"]
              const bPriority = priorityOrder[b.priority || "low"]
              comparison = bPriority - aPriority
              break
          }

          return state.sortOrder === "desc" ? comparison : -comparison
        })

        set({ filteredOffers: filtered })
      },

      setSortBy: (sortBy) => {
        set({ sortBy })
        get().applyFilters()
      },

      setSortOrder: (order) => {
        set({ sortOrder: order })
        get().applyFilters()
      },

      setRankingWeights: (weights) => {
        set((state) => ({
          rankingWeights: { ...state.rankingWeights, ...weights },
        }))
        get().applyFilters()
      },

      batchUpdateOffers: (updates) => {
        const updateMap = new Map(updates.map(({ id, updates }) => [id, updates]))

        set((state) => ({
          offers: state.offers.map((offer) => {
            const offerUpdates = updateMap.get(offer.id)
            return offerUpdates ? { ...offer, ...offerUpdates } : offer
          }),
          lastUpdated: new Date(),
        }))

        get().applyFilters()
      },

      markOffersAsViewed: (offerIds) => {
        const updates = offerIds.map((id) => ({
          id,
          updates: { lastViewed: new Date() },
        }))
        get().batchUpdateOffers(updates)
      },

      setCategoryForOffer: (id, category) => {
        get().updateOffer(id, { category })
      },

      setPriorityForOffer: (id, priority) => {
        get().updateOffer(id, { priority })
      },

      getOffersByCategory: (category) => {
        return get().offers.filter((offer) => offer.category === category)
      },

      getOffersByPriority: (priority) => {
        return get().offers.filter((offer) => offer.priority === priority)
      },

      getOffersByStatus: (status) => {
        return get().offers.filter((offer) => offer.status === status)
      },

      searchOffers: (query) => {
        const term = query.toLowerCase()
        return get().offers.filter(
          (offer) =>
            offer.vesselName?.toLowerCase().includes(term) ||
            offer.vesselType.toLowerCase().includes(term) ||
            offer.loadPort.toLowerCase().includes(term) ||
            offer.dischargePort.toLowerCase().includes(term) ||
            offer.cargoType?.toLowerCase().includes(term) ||
            offer.charterer?.toLowerCase().includes(term),
        )
      },

      getOfferStats: () => {
        const { offers } = get()

        const stats = {
          total: offers.length,
          byStatus: {} as Record<string, number>,
          byPriority: {} as Record<string, number>,
          byVesselType: {} as Record<string, number>,
          averageRate: 0,
          averageScore: 0,
        }

        if (offers.length === 0) return stats

        // Calculate statistics
        let totalRate = 0
        let totalScore = 0

        offers.forEach((offer) => {
          // Status distribution
          const status = offer.status || "unknown"
          stats.byStatus[status] = (stats.byStatus[status] || 0) + 1

          // Priority distribution
          const priority = offer.priority || "unknown"
          stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1

          // Vessel type distribution
          stats.byVesselType[offer.vesselType] = (stats.byVesselType[offer.vesselType] || 0) + 1

          // Averages
          totalRate += offer.freightRate
          totalScore += offer.score || 0
        })

        stats.averageRate = totalRate / offers.length
        stats.averageScore = totalScore / offers.length

        return stats
      },
    }),
    {
      name: "enhanced-offer-storage",
      partialize: (state) => ({
        offers: state.offers,
        rankingWeights: state.rankingWeights,
        activeFilters: state.activeFilters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    },
  ),
)
