import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { devtools } from "zustand/middleware"

// Define the store state interface
interface FavoriteState {
  favorites: string[] // Array of offer IDs
}

// Define the store actions interface
interface FavoriteActions {
  toggleFavorite: (offerId: string) => void
  addFavorite: (offerId: string) => void
  removeFavorite: (offerId: string) => void
  clearFavorites: () => void
  isFavorite: (offerId: string) => boolean
}

// Combine state and actions
type FavoriteStore = FavoriteState & FavoriteActions

// Create the store with middleware
export const useFavoriteStore = create<FavoriteStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        favorites: [],

        // Actions
        toggleFavorite: (offerId) => {
          set((state) => {
            const exists = state.favorites.includes(offerId)

            if (exists) {
              state.favorites = state.favorites.filter((id) => id !== offerId)
            } else {
              state.favorites.push(offerId)
            }
          })
        },

        addFavorite: (offerId) => {
          set((state) => {
            if (!state.favorites.includes(offerId)) {
              state.favorites.push(offerId)
            }
          })
        },

        removeFavorite: (offerId) => {
          set((state) => {
            state.favorites = state.favorites.filter((id) => id !== offerId)
          })
        },

        clearFavorites: () => {
          set({ favorites: [] })
        },

        isFavorite: (offerId) => {
          return get().favorites.includes(offerId)
        },
      })),
      {
        name: "vessel-favorites",
        storage: createJSONStorage(() => localStorage),
      },
    ),
    { name: "favorite-store" },
  ),
)
