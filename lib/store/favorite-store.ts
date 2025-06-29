import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoriteState {
  favoriteOffers: Set<string>
  favoriteClients: Set<string>
  favoriteOrders: Set<string>

  addFavoriteOffer: (offerId: string) => void
  removeFavoriteOffer: (offerId: string) => void
  isFavoriteOffer: (offerId: string) => boolean

  addFavoriteClient: (clientId: string) => void
  removeFavoriteClient: (clientId: string) => void
  isFavoriteClient: (clientId: string) => boolean

  addFavoriteOrder: (orderId: string) => void
  removeFavoriteOrder: (orderId: string) => void
  isFavoriteOrder: (orderId: string) => boolean

  clearAllFavorites: () => void
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteOffers: new Set(),
      favoriteClients: new Set(),
      favoriteOrders: new Set(),

      addFavoriteOffer: (offerId: string) => {
        set((state) => ({
          favoriteOffers: new Set([...state.favoriteOffers, offerId]),
        }))
      },

      removeFavoriteOffer: (offerId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favoriteOffers)
          newFavorites.delete(offerId)
          return { favoriteOffers: newFavorites }
        })
      },

      isFavoriteOffer: (offerId: string) => {
        return get().favoriteOffers.has(offerId)
      },

      addFavoriteClient: (clientId: string) => {
        set((state) => ({
          favoriteClients: new Set([...state.favoriteClients, clientId]),
        }))
      },

      removeFavoriteClient: (clientId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favoriteClients)
          newFavorites.delete(clientId)
          return { favoriteClients: newFavorites }
        })
      },

      isFavoriteClient: (clientId: string) => {
        return get().favoriteClients.has(clientId)
      },

      addFavoriteOrder: (orderId: string) => {
        set((state) => ({
          favoriteOrders: new Set([...state.favoriteOrders, orderId]),
        }))
      },

      removeFavoriteOrder: (orderId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favoriteOrders)
          newFavorites.delete(orderId)
          return { favoriteOrders: newFavorites }
        })
      },

      isFavoriteOrder: (orderId: string) => {
        return get().favoriteOrders.has(orderId)
      },

      clearAllFavorites: () => {
        set({
          favoriteOffers: new Set(),
          favoriteClients: new Set(),
          favoriteOrders: new Set(),
        })
      },
    }),
    {
      name: "favorite-storage",
      serialize: (state) =>
        JSON.stringify({
          ...state,
          favoriteOffers: Array.from(state.favoriteOffers),
          favoriteClients: Array.from(state.favoriteClients),
          favoriteOrders: Array.from(state.favoriteOrders),
        }),
      deserialize: (str) => {
        const parsed = JSON.parse(str)
        return {
          ...parsed,
          favoriteOffers: new Set(parsed.favoriteOffers || []),
          favoriteClients: new Set(parsed.favoriteClients || []),
          favoriteOrders: new Set(parsed.favoriteOrders || []),
        }
      },
    },
  ),
)
