import { create } from "zustand"

interface NavigationState {
  ordersPageContext: {
    filter?: string
    openAIMatching?: boolean
    targetOrderId?: string
  }
  dashboardAlerts: Array<{
    id: string
    type: "urgent" | "unmatched" | "market" | "email"
    title: string
    message: string
    action?: () => void
    timestamp: Date
  }>
}

interface NavigationActions {
  setOrdersPageContext: (context: NavigationState["ordersPageContext"]) => void
  clearOrdersPageContext: () => void
  addDashboardAlert: (alert: Omit<NavigationState["dashboardAlerts"][0], "id" | "timestamp">) => void
  removeDashboardAlert: (id: string) => void
  clearDashboardAlerts: () => void
}

export const useNavigationStore = create<NavigationState & NavigationActions>((set) => ({
  ordersPageContext: {},
  dashboardAlerts: [],

  setOrdersPageContext: (context) =>
    set((state) => ({ ordersPageContext: { ...state.ordersPageContext, ...context } })),

  clearOrdersPageContext: () => set({ ordersPageContext: {} }),

  addDashboardAlert: (alert) =>
    set((state) => ({
      dashboardAlerts: [
        {
          ...alert,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
        ...state.dashboardAlerts,
      ],
    })),

  removeDashboardAlert: (id) =>
    set((state) => ({
      dashboardAlerts: state.dashboardAlerts.filter((alert) => alert.id !== id),
    })),

  clearDashboardAlerts: () => set({ dashboardAlerts: [] }),
}))
