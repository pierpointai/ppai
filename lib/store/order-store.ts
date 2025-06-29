import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface LinkedVessel {
  id: string
  name: string
  vesselName?: string
  vesselId?: string
  vesselType?: string
  dwt?: number
  built?: number
  flag?: string
  openPort?: string
  laycanStart?: Date | string
  laycanEnd?: Date | string
  status: "Shortlisted" | "Contacted" | "Offered" | "Rejected" | "Nominated"
  matchScore?: number
  notes?: string
  linkedAt?: string
  lastContactedAt?: string
  rateReceived?: number
  rateReceivedUnit?: string
}

export interface Order {
  id: string
  name?: string
  description?: string
  orderType: "Voyage" | "TC" | "COA"
  cargoType: string
  cargoQuantity?: number
  cargoUnit?: string
  dwtMin?: number
  dwtMax?: number
  maxAge?: number
  laycanStart: string
  laycanEnd: string
  loadPort: string
  dischargePort: string
  tradeLane?: string
  charterer?: string
  status: "Active" | "Matched" | "Fixed" | "Cancelled" | "Completed"
  priority?: "High" | "Medium" | "Low"
  createdAt: string
  updatedAt: string
  linkedVessels?: LinkedVessel[]
  notes?: string
  freightRate?: number
  freightRateUnit?: string
  commission?: number
  brokerage?: number
}

export type LinkedVesselStatus = LinkedVessel["status"]

interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  isLoading: boolean
  filters: {
    status: string
    cargoType: string
    orderType: string
    searchTerm: string
  }
  isMatching: boolean

  // Core actions
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
  selectOrder: (order: Order | null) => void

  // Vessel linking
  linkVesselToOrder: (orderId: string, vessel: LinkedVessel) => void
  updateLinkedVessel: (orderId: string, vesselId: string, updates: Partial<LinkedVessel>) => void
  removeLinkedVessel: (orderId: string, vesselId: string) => void

  // Utility methods
  getOrdersByStatus: (status: Order["status"]) => Order[]
  searchOrders: (query: string) => Order[]
  resetStore: () => void

  // UI helpers
  setFilter: (name: keyof OrderState["filters"], value: string) => void
  getFilteredOrders: () => Order[]
  getOrderStats: () => { total: number; active: number; matched: number; fixed: number }
  setIsMatching: (val: boolean) => void

  // Aliases for compatibility
  linkVessel: (orderId: string, vessel: LinkedVessel) => void
  linkVesselsToOrder: (orderId: string, vessels: LinkedVessel[]) => void
  unlinkVesselFromOrder: (orderId: string, vesselId: string) => void
  getOrderById: (id: string) => Order | undefined
  updateLinkedVesselStatus: (orderId: string, vesselId: string, status: LinkedVesselStatus, notes?: string) => void
  recordVesselRate: (orderId: string, vesselId: string, rate: number, unit: string) => void
  markVesselContacted: (orderId: string, vesselId: string) => void
}

const mockOrders: Order[] = [
  {
    id: "ord-001",
    name: "Brazil → China Iron-ore",
    orderType: "Voyage",
    cargoType: "Iron Ore",
    cargoQuantity: 170000,
    cargoUnit: "MT",
    dwtMin: 150000,
    dwtMax: 200000,
    maxAge: 15,
    laycanStart: "2024-07-15T00:00:00.000Z",
    laycanEnd: "2024-07-25T00:00:00.000Z",
    loadPort: "Tubarao",
    dischargePort: "Qingdao",
    tradeLane: "Brazil-China",
    charterer: "Vale",
    status: "Active",
    priority: "High",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    freightRate: 28500,
    freightRateUnit: "USD/day",
    linkedVessels: [
      {
        id: "vessel-001",
        name: "Pacific Voyager",
        vesselName: "Pacific Voyager",
        dwt: 180000,
        openPort: "Santos",
        status: "Shortlisted",
        matchScore: 95,
        notes: "Perfect match for cargo and route",
      },
    ],
    commission: 1.25,
    brokerage: 1.25,
  },
]

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,
      selectedOrder: null,
      isLoading: false,
      filters: { status: "all", cargoType: "all", orderType: "all", searchTerm: "" },
      isMatching: false,

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `ord-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "Active",
        }
        set((state) => ({ orders: [...state.orders, newOrder] }))
      },

      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order,
          ),
          selectedOrder:
            state.selectedOrder?.id === id
              ? { ...state.selectedOrder, ...updates, updatedAt: new Date().toISOString() }
              : state.selectedOrder,
        }))
      },

      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
          selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
        }))
      },

      selectOrder: (order) => set({ selectedOrder: order }),

      linkVesselToOrder: (orderId, vessel) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  linkedVessels: [...(order.linkedVessels || []), vessel],
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }))
      },

      updateLinkedVessel: (orderId, vesselId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  linkedVessels: (order.linkedVessels || []).map((vessel) =>
                    vessel.id === vesselId || vessel.vesselId === vesselId ? { ...vessel, ...updates } : vessel,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }))
      },

      removeLinkedVessel: (orderId, vesselId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  linkedVessels: (order.linkedVessels || []).filter(
                    (vessel) => vessel.id !== vesselId && vessel.vesselId !== vesselId,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }))
      },

      getOrdersByStatus: (status) => get().orders.filter((order) => order.status === status),

      searchOrders: (query) => {
        const lowercaseQuery = query.toLowerCase()
        return get().orders.filter(
          (order) =>
            order.charterer?.toLowerCase().includes(lowercaseQuery) ||
            order.cargoType.toLowerCase().includes(lowercaseQuery) ||
            order.loadPort.toLowerCase().includes(lowercaseQuery) ||
            order.dischargePort.toLowerCase().includes(lowercaseQuery) ||
            order.tradeLane?.toLowerCase().includes(lowercaseQuery),
        )
      },

      resetStore: () => set({ orders: mockOrders, selectedOrder: null, isLoading: false }),

      setFilter: (name, value) =>
        set((state) => ({
          filters: { ...state.filters, [name]: value },
        })),

      getFilteredOrders: () => {
        const { orders, filters } = get()
        return orders.filter((order) => {
          if (filters.status !== "all" && order.status !== filters.status) return false
          if (filters.cargoType !== "all" && order.cargoType !== filters.cargoType) return false
          if (filters.orderType !== "all" && order.orderType !== filters.orderType) return false
          if (
            filters.searchTerm &&
            !`${order.cargoType} ${order.loadPort} ${order.dischargePort} ${order.charterer || ""}`
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
          )
            return false
          return true
        })
      },

      getOrderStats: () => {
        const orders = get().orders
        return {
          total: orders.length,
          active: orders.filter((o) => o.status === "Active").length,
          matched: orders.filter((o) => o.status === "Matched").length,
          fixed: orders.filter((o) => o.status === "Fixed").length,
        }
      },

      setIsMatching: (val: boolean) => set({ isMatching: val }),

      // Aliases for compatibility
      linkVessel: (orderId, vessel) => get().linkVesselToOrder(orderId, vessel),
      linkVesselsToOrder: (orderId, vessels) => vessels.forEach((v) => get().linkVesselToOrder(orderId, v)),
      unlinkVesselFromOrder: (orderId, vesselId) => get().removeLinkedVessel(orderId, vesselId),
      getOrderById: (id) => get().orders.find((o) => o.id === id),

      updateLinkedVesselStatus: (orderId, vesselId, status, notes) => {
        get().updateLinkedVessel(orderId, vesselId, { status, notes, lastContactedAt: new Date().toISOString() })
      },

      recordVesselRate: (orderId, vesselId, rate, unit) => {
        get().updateLinkedVessel(orderId, vesselId, {
          rateReceived: rate,
          rateReceivedUnit: unit,
          status: "Contacted",
        })
      },

      markVesselContacted: (orderId, vesselId) => {
        get().updateLinkedVessel(orderId, vesselId, {
          status: "Contacted",
          lastContactedAt: new Date().toISOString(),
        })
      },
    }),
    { name: "order-storage" },
  ),
)
