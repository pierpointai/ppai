import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createBaseStore } from "./core/base-store"
import { createFilter, createSearch } from "./core/simple-filters"
import type { Offer } from "./types"

// Simplified Offer Store
export const useSimpleOfferStore = create<{
  offers: Offer[]
  filters: Record<string, any>
  searchTerm: string
  setOffers: (offers: Offer[]) => void
  addOffer: (offer: Omit<Offer, "id" | "createdAt" | "updatedAt">) => void
  updateOffer: (id: string, updates: Partial<Offer>) => void
  removeOffer: (id: string) => void
  setFilter: (key: string, value: any) => void
  setSearch: (term: string) => void
  getFilteredOffers: () => Offer[]
  resetFilters: () => void
}>()(
  persist(
    (set, get) => {
      const baseStore = createBaseStore<Offer>("offer")

      const filterConfig = {
        vesselType: (offer: Offer, value: string) =>
          offer.vesselType?.toLowerCase().includes(value.toLowerCase()) ?? false,
        status: (offer: Offer, value: string) => offer.status === value,
        loadPort: (offer: Offer, value: string) => offer.loadPort?.toLowerCase().includes(value.toLowerCase()) ?? false,
      }

      return {
        offers: [],
        filters: {},
        searchTerm: "",

        setOffers: (offers) => set({ offers }),

        addOffer: (offer) =>
          set((state) => ({
            offers: [...state.offers, baseStore.add(offer)],
          })),

        updateOffer: (id, updates) =>
          set((state) => ({
            offers: baseStore.update(state.offers, id, updates),
          })),

        removeOffer: (id) =>
          set((state) => ({
            offers: baseStore.remove(state.offers, id),
          })),

        setFilter: (key, value) =>
          set((state) => ({
            filters: { ...state.filters, [key]: value },
          })),

        setSearch: (term) => set({ searchTerm: term }),

        getFilteredOffers: () => {
          const { offers, filters, searchTerm } = get()
          let filtered = createFilter(offers, filters, filterConfig)
          filtered = createSearch(filtered, searchTerm, ["vesselName", "vesselType", "loadPort", "dischargePort"])
          return filtered
        },

        resetFilters: () => set({ filters: {}, searchTerm: "" }),
      }
    },
    { name: "simple-offer-store" },
  ),
)
