import { create } from "zustand"
import { immer } from "@/lib/zustand-immer"

interface NavigationState {
  currentPage: string
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  setCurrentPage: (page: string) => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useNavigationStore = create<NavigationState>()(
  immer((set) => ({
    currentPage: "dashboard",
    sidebarOpen: true,
    mobileMenuOpen: false,

    setCurrentPage: (page: string) => {
      set((state) => {
        state.currentPage = page
      })
    },

    toggleSidebar: () => {
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen
      })
    },

    toggleMobileMenu: () => {
      set((state) => {
        state.mobileMenuOpen = !state.mobileMenuOpen
      })
    },

    setSidebarOpen: (open: boolean) => {
      set((state) => {
        state.sidebarOpen = open
      })
    },
  })),
)
