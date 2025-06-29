import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoriteState {
  favorites: string[] // Array of offer IDs
  toggleFavorite: (offerId: string) => void
  addFavorite: (offerId: string) => void
  removeFavorite: (offerId: string) => void
  clearFavorites: () => void
  isFavorite: (offerId: string) => boolean
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (offerId) =>
        set((state) => {
          const exists = state.favorites.includes(offerId)

          if (exists) {
            return {
              favorites: state.favorites.filter((id) => id !== offerId),
            }
          } else {
            return {
              favorites: [...state.favorites, offerId],
            }
          }
        }),

      addFavorite: (offerId) =>
        set((state) => {
          if (state.favorites.includes(offerId)) {
            return state // Already in favorites
          }
          return {
            favorites: [...state.favorites, offerId],
          }
        }),

      removeFavorite: (offerId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== offerId),
        })),

      clearFavorites: () => set({ favorites: [] }),

      isFavorite: (offerId) => get().favorites.includes(offerId),
    }),
    {
      name: "vessel-favorites", // Name for localStorage
    },
  ),
)
