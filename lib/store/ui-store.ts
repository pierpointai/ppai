import { create } from "zustand"
import { immer } from "@/lib/zustand-immer"
import { devtools } from "zustand/middleware"

interface UIState {
  sidebarOpen: boolean
  filterPanelOpen: boolean
  searchOpen: boolean
  currentView: "list" | "grid" | "kanban"
  theme: "light" | "dark" | "system"
  mobileMenuOpen: boolean
  activeTab: string
  notifications: {
    id: string
    title: string
    message: string
    read: boolean
    timestamp: Date
  }[]
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleFilterPanel: () => void
  setFilterPanelOpen: (open: boolean) => void
  toggleSearch: () => void
  setSearchOpen: (open: boolean) => void
  setCurrentView: (view: UIState["currentView"]) => void
  setTheme: (theme: UIState["theme"]) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
  addNotification: (notification: Omit<UIState["notifications"][0], "id" | "timestamp" | "read">) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set) => ({
      sidebarOpen: true,
      filterPanelOpen: false,
      searchOpen: false,
      currentView: "list",
      theme: "system",
      mobileMenuOpen: false,
      activeTab: "all",
      notifications: [],

      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        })
      },

      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open
        })
      },

      toggleFilterPanel: () => {
        set((state) => {
          state.filterPanelOpen = !state.filterPanelOpen
        })
      },

      setFilterPanelOpen: (open) => {
        set((state) => {
          state.filterPanelOpen = open
        })
      },

      toggleSearch: () => {
        set((state) => {
          state.searchOpen = !state.searchOpen
        })
      },

      setSearchOpen: (open) => {
        set((state) => {
          state.searchOpen = open
        })
      },

      setCurrentView: (view) => {
        set((state) => {
          state.currentView = view
        })
      },

      setTheme: (theme) => {
        set((state) => {
          state.theme = theme
        })
      },

      toggleMobileMenu: () => {
        set((state) => {
          state.mobileMenuOpen = !state.mobileMenuOpen
        })
      },

      setMobileMenuOpen: (open) => {
        set((state) => {
          state.mobileMenuOpen = open
        })
      },

      setActiveTab: (tab) => {
        set((state) => {
          state.activeTab = tab
        })
      },

      addNotification: (notification) => {
        set((state) => {
          state.notifications.unshift({
            id: Date.now().toString(),
            ...notification,
            read: false,
            timestamp: new Date(),
          })
        })
      },

      markNotificationAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (notification) {
            notification.read = true
          }
        })
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = []
        })
      },
    })),
    { name: "ui-store" },
  ),
)

export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)
export const useFilterPanelOpen = () => useUIStore((state) => state.filterPanelOpen)
export const useSearchOpen = () => useUIStore((state) => state.searchOpen)
export const useCurrentView = () => useUIStore((state) => state.currentView)
export const useTheme = () => useUIStore((state) => state.theme)
export const useMobileMenuOpen = () => useUIStore((state) => state.mobileMenuOpen)
export const useActiveTab = () => useUIStore((state) => state.activeTab)
export const useNotifications = () => useUIStore((state) => state.notifications)
