import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
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
      (set, get) => ({
        // Initial state
        favorites: [],

        // Actions
        toggleFavorite: (offerId) => {
          const currentFavorites = get().favorites
          const exists = currentFavorites.includes(offerId)

          if (exists) {
            set({
              favorites: currentFavorites.filter((id) => id !== offerId),
            })
          } else {
            set({
              favorites: [...currentFavorites, offerId],
            })
          }
        },

        addFavorite: (offerId) => {
          const currentFavorites = get().favorites
          if (!currentFavorites.includes(offerId)) {
            set({
              favorites: [...currentFavorites, offerId],
            })
          }
        },

        removeFavorite: (offerId) => {
          set({
            favorites: get().favorites.filter((id) => id !== offerId),
          })
        },

        clearFavorites: () => {
          set({ favorites: [] })
        },

        isFavorite: (offerId) => {
          return get().favorites.includes(offerId)
        },
      }),
      {
        name: "vessel-favorites",
        storage: createJSONStorage(() => localStorage),
      },
    ),
    { name: "favorite-store" },
  ),
)
