import { create } from "zustand"
import { devtools } from "zustand/middleware"

// Define the store state interface
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

// Define the store actions interface
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

// Combine state and actions
type UIStore = UIState & UIActions

// Create the store with middleware
export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      filterPanelOpen: false,
      searchOpen: false,
      currentView: "list",
      theme: "system",
      mobileMenuOpen: false,
      activeTab: "all",
      notifications: [],

      // Actions
      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen })
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      toggleFilterPanel: () => {
        set({ filterPanelOpen: !get().filterPanelOpen })
      },

      setFilterPanelOpen: (open) => {
        set({ filterPanelOpen: open })
      },

      toggleSearch: () => {
        set({ searchOpen: !get().searchOpen })
      },

      setSearchOpen: (open) => {
        set({ searchOpen: open })
      },

      setCurrentView: (view) => {
        set({ currentView: view })
      },

      setTheme: (theme) => {
        set({ theme })
      },

      toggleMobileMenu: () => {
        set({ mobileMenuOpen: !get().mobileMenuOpen })
      },

      setMobileMenuOpen: (open) => {
        set({ mobileMenuOpen: open })
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab })
      },

      addNotification: (notification) => {
        const currentNotifications = get().notifications
        set({
          notifications: [
            {
              id: Date.now().toString(),
              ...notification,
              read: false,
              timestamp: new Date(),
            },
            ...currentNotifications,
          ],
        })
      },

      markNotificationAsRead: (id) => {
        const currentNotifications = get().notifications
        set({
          notifications: currentNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },
    }),
    { name: "ui-store" },
  ),
)

// Selector hooks for better performance
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)
export const useFilterPanelOpen = () => useUIStore((state) => state.filterPanelOpen)
export const useSearchOpen = () => useUIStore((state) => state.searchOpen)
export const useCurrentView = () => useUIStore((state) => state.currentView)
export const useTheme = () => useUIStore((state) => state.theme)
export const useMobileMenuOpen = () => useUIStore((state) => state.mobileMenuOpen)
export const useActiveTab = () => useUIStore((state) => state.activeTab)
export const useNotifications = () => useUIStore((state) => state.notifications)
