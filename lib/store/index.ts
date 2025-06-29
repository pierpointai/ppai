// Export all stores
export * from "./offer-store"
export * from "./favorite-store"
export * from "./ui-store"
export * from "./auth-store"

// Export a hook to access all stores
import { useOfferStore } from "./offer-store"
import { useFavoriteStore } from "./favorite-store"
import { useUIStore } from "./ui-store"
import { useAuthStore } from "./auth-store"

export const useStore = () => ({
  offer: useOfferStore(),
  favorite: useFavoriteStore(),
  ui: useUIStore(),
  auth: useAuthStore(),
})
