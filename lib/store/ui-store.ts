import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Theme and appearance
  isDarkMode: boolean
  sidebarCollapsed: boolean
  compactMode: boolean

  // Layout preferences
  dashboardLayout: "grid" | "list" | "kanban"
  vesselTableView: "detailed" | "compact" | "cards"

  // Filters and search
  globalSearchTerm: string
  activeFilters: Record<string, any>

  // Modal and dialog states
  modals: {
    vesselDetails: boolean
    clientMatcher: boolean
    orderForm: boolean
    settings: boolean
    help: boolean
  }

  // Notification preferences
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    email: boolean
  }

  // Actions
  toggleDarkMode: () => void
  toggleSidebar: () => void
  toggleCompactMode: () => void
  setDashboardLayout: (layout: "grid" | "list" | "kanban") => void
  setVesselTableView: (view: "detailed" | "compact" | "cards") => void
  setGlobalSearchTerm: (term: string) => void
  setActiveFilters: (filters: Record<string, any>) => void
  openModal: (modal: keyof UIState["modals"]) => void
  closeModal: (modal: keyof UIState["modals"]) => void
  closeAllModals: () => void
  updateNotificationSettings: (settings: Partial<UIState["notifications"]>) => void
  resetUISettings: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isDarkMode: false,
      sidebarCollapsed: false,
      compactMode: false,
      dashboardLayout: "grid",
      vesselTableView: "detailed",
      globalSearchTerm: "",
      activeFilters: {},
      modals: {
        vesselDetails: false,
        clientMatcher: false,
        orderForm: false,
        settings: false,
        help: false,
      },
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        email: false,
      },

      // Actions
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      toggleCompactMode: () => {
        set((state) => ({ compactMode: !state.compactMode }))
      },

      setDashboardLayout: (layout) => {
        set({ dashboardLayout: layout })
      },

      setVesselTableView: (view) => {
        set({ vesselTableView: view })
      },

      setGlobalSearchTerm: (term) => {
        set({ globalSearchTerm: term })
      },

      setActiveFilters: (filters) => {
        set({ activeFilters: filters })
      },

      openModal: (modal) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        }))
      },

      closeModal: (modal) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        }))
      },

      closeAllModals: () => {
        set({
          modals: {
            vesselDetails: false,
            clientMatcher: false,
            orderForm: false,
            settings: false,
            help: false,
          },
        })
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        }))
      },

      resetUISettings: () => {
        set({
          isDarkMode: false,
          sidebarCollapsed: false,
          compactMode: false,
          dashboardLayout: "grid",
          vesselTableView: "detailed",
          globalSearchTerm: "",
          activeFilters: {},
          notifications: {
            enabled: true,
            sound: true,
            desktop: true,
            email: false,
          },
        })
      },
    }),
    {
      name: "ui-storage",
    },
  ),
)
