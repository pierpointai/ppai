interface AuthState {
  isLoggedIn: boolean
  user: any | null
  login: (user: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    isLoggedIn: false,
    user: null,
    login: (user) =>
      set((state) => {
        state.isLoggedIn = true
        state.user = user
      }),
    logout: () =>
      set((state) => {
        state.isLoggedIn = false
        state.user = null
      }),
  })),
)

interface NavigationState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useNavigationStore = create<NavigationState>()(
  immer((set) => ({
    isSidebarOpen: false,
    toggleSidebar: () =>
      set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen
      }),
  })),
)

interface OrderState {
  orders: any[]
  addOrder: (order: any) => void
  removeOrder: (orderId: string) => void
}

export const useOrderStore = create<OrderState>()(
  immer((set) => ({
    orders: [],
    addOrder: (order) =>
      set((state) => {
        state.orders.push(order)
      }),
    removeOrder: (orderId) =>
      set((state) => {
        state.orders = state.orders.filter((order) => order.id !== orderId)
      }),
  })),
)

interface UIState {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    isLoading: false,
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),
    modalOpen: false,
    setModalOpen: (open) =>
      set((state) => {
        state.modalOpen = open
      }),
  })),
)

// lib/store/offer-store.ts
import { create } from "zustand"
import { immer } from "@/lib/zustand-immer"

interface OfferState {
  offers: any[]
  addOffer: (offer: any) => void
  removeOffer: (offerId: string) => void
}

export const useOfferStore = create<OfferState>()(
  immer((set) => ({
    offers: [],
    addOffer: (offer) =>
      set((state) => {
        state.offers.push(offer)
      }),
    removeOffer: (offerId) =>
      set((state) => {
        state.offers = state.offers.filter((offer) => offer.id !== offerId)
      }),
  })),
)
