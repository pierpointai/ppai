import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "@/hooks/use-toast"

export type OrderStatus = "Active" | "Matched" | "Fixed" | "Cancelled"
export type OrderType = "Voyage" | "TC" | "COA"
export type OrderPriority = "High" | "Medium" | "Low"
export type LinkedVesselStatus =
  | "Shortlisted"
  | "Contacted"
  | "Awaiting Response"
  | "Rate Received"
  | "Offered"
  | "Presented to Charterer"
  | "Negotiating"
  | "Rejected"
  | "Nominated"
  | "Fixed"

export interface VesselStatusEvent {
  status: LinkedVesselStatus
  timestamp: string
  notes?: string
  rate?: number
  rateUnit?: string
}

export interface LinkedVessel {
  id: string
  name: string
  dwt: number
  built: number
  flag: string
  matchScore?: number
  vesselId?: string
  vesselName?: string
  vesselType?: string
  openPort?: string
  currentPort?: string
  loadPort?: string
  dischargePort?: string
  laycanStart?: string
  laycanEnd?: string
  status?: LinkedVesselStatus
  linkedAt?: string
  notes?: string
  statusHistory?: VesselStatusEvent[]
  lastContactedAt?: string
  rateReceived?: number
  rateReceivedUnit?: string
  updatedAt?: string
  distanceToLoadPort?: number
  etaToLoadPort?: string
}

export interface Order {
  id: string
  orderType: OrderType
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
  status: OrderStatus
  priority: OrderPriority
  notes?: string
  createdAt: string
  updatedAt: string
  linkedVessels?: LinkedVessel[]
  freightRate?: number
  freightRateUnit?: string
  demurrage?: number
  demurrageUnit?: string
  loadRate?: number
  loadRateUnit?: string
  dischargeRate?: number
  dischargeRateUnit?: string
  commission?: number
  geared?: boolean
  iceClass?: boolean
  australianApproved?: boolean
}

interface OrderFilters {
  status?: OrderStatus | "All"
  orderType?: OrderType | "All"
  priority?: OrderPriority | "All"
  search?: string
  cargoType?: string
  tradeLane?: string
  charterer?: string
  loadPort?: string
}

interface OrderStore {
  orders: Order[]
  filters: OrderFilters
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  getFilteredOrders: () => Order[]
  setFilter: (key: keyof OrderFilters, value: any) => void
  resetFilters: () => void
  resetStore: () => void
  linkVessel: (orderId: string, vessel: LinkedVessel) => void
  unlinkVessel: (orderId: string, vesselId: string) => void
  getOrderStats: () => { [key in OrderStatus | "Total"]: number }
  linkVesselToOrder: (orderId: string, vessel: LinkedVessel) => void
  unlinkVesselFromOrder: (orderId: string, vesselId: string) => void
  updateLinkedVesselStatus: (orderId: string, vesselId: string, status: LinkedVesselStatus) => void
  setFilters: (filters: Partial<OrderFilters>) => void
  isMatching: boolean
  setIsMatching: (isMatching: boolean) => void
  loadMoreSampleData: () => void
  getOrderById: (id: string) => Order | undefined
  advanceVesselStatus: (orderId: string, vesselId: string, newStatus: LinkedVesselStatus, notes?: string) => void
  recordVesselRate: (orderId: string, vesselId: string, rate: number, unit: string) => void
  markVesselContacted: (orderId: string, vesselId: string) => void
  getVesselStatusHistory: (orderId: string, vesselId: string) => VesselStatusEvent[] | undefined
}

// Enhanced sample data with realistic shipbroking scenarios
const createSampleOrders = (): Order[] => {
  console.log("Creating sample orders...")

  const getRandomDate = (daysFromNow: number, range = 10) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * range))
    return date.toISOString()
  }

  // Sample linked vessels for demonstration
  const sampleLinkedVessels: LinkedVessel[] = [
    {
      id: "vessel-001",
      vesselId: "v-001",
      vesselName: "Iron Duke",
      vesselType: "Capesize",
      name: "Iron Duke",
      dwt: 180000,
      built: 2018,
      flag: "Marshall Islands",
      openPort: "Port Hedland",
      status: "Shortlisted",
      matchScore: 92,
      laycanStart: getRandomDate(10),
      laycanEnd: getRandomDate(20),
      linkedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: "Shortlisted",
          timestamp: new Date().toISOString(),
          notes: "Initial shortlisting",
        },
      ],
    },
    {
      id: "vessel-002",
      vesselId: "v-002",
      vesselName: "Pacific Carrier",
      vesselType: "Capesize",
      name: "Pacific Carrier",
      dwt: 175000,
      built: 2015,
      flag: "Singapore",
      openPort: "Dampier",
      status: "Contacted",
      matchScore: 88,
      laycanStart: getRandomDate(12),
      laycanEnd: getRandomDate(22),
      linkedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: "Shortlisted",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          notes: "Initial shortlisting",
        },
        {
          status: "Contacted",
          timestamp: new Date().toISOString(),
          notes: "Initial contact made",
        },
      ],
      lastContactedAt: new Date().toISOString(),
    },
  ]

  // Create comprehensive sample orders with more variety
  const orders: Order[] = [
    // Iron Ore Orders
    {
      id: "ord-001",
      orderType: "Voyage",
      cargoType: "Iron Ore",
      cargoQuantity: 170000,
      cargoUnit: "MT",
      dwtMin: 170000,
      dwtMax: 200000,
      maxAge: 15,
      laycanStart: getRandomDate(10),
      laycanEnd: getRandomDate(20),
      loadPort: "Port Hedland",
      dischargePort: "Qingdao",
      tradeLane: "Australia-China (Iron Ore)",
      charterer: "Cargill",
      status: "Active",
      priority: "High",
      notes: "Charterer prefers vessels with good performance history in Australian ports",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 12.5,
      freightRateUnit: "USD/MT",
      demurrage: 25000,
      demurrageUnit: "USD/day",
      loadRate: 120000,
      loadRateUnit: "MT/day",
      dischargeRate: 35000,
      dischargeRateUnit: "MT/day",
      commission: 3.75,
      australianApproved: true,
      linkedVessels: [sampleLinkedVessels[0], sampleLinkedVessels[1]],
    },
    {
      id: "ord-002",
      orderType: "Voyage",
      cargoType: "Iron Ore",
      cargoQuantity: 180000,
      cargoUnit: "MT",
      dwtMin: 175000,
      dwtMax: 210000,
      maxAge: 12,
      laycanStart: getRandomDate(8),
      laycanEnd: getRandomDate(18),
      loadPort: "Dampier",
      dischargePort: "Rizhao",
      tradeLane: "Australia-China (Iron Ore)",
      charterer: "Vale",
      status: "Active",
      priority: "High",
      notes: "Urgent requirement. Charterer willing to pay premium for prompt tonnage.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 14.2,
      freightRateUnit: "USD/MT",
      demurrage: 28000,
      demurrageUnit: "USD/day",
      commission: 3.75,
      australianApproved: true,
      linkedVessels: [],
    },
    {
      id: "ord-003",
      orderType: "Voyage",
      cargoType: "Iron Ore",
      cargoQuantity: 160000,
      cargoUnit: "MT",
      dwtMin: 160000,
      dwtMax: 190000,
      maxAge: 18,
      laycanStart: getRandomDate(25),
      laycanEnd: getRandomDate(35),
      loadPort: "Tubarao",
      dischargePort: "Rotterdam",
      tradeLane: "Brazil-Europe (Iron Ore)",
      charterer: "ArcelorMittal",
      status: "Active",
      priority: "Medium",
      notes: "Brazilian iron ore. Flexible on dates.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 18.5,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      linkedVessels: [],
    },

    // Coal Orders
    {
      id: "ord-004",
      orderType: "Voyage",
      cargoType: "Coal",
      cargoQuantity: 150000,
      cargoUnit: "MT",
      dwtMin: 150000,
      dwtMax: 180000,
      maxAge: 15,
      laycanStart: getRandomDate(12),
      laycanEnd: getRandomDate(22),
      loadPort: "Newcastle",
      dischargePort: "Fangcheng",
      tradeLane: "Australia-China (Coal)",
      charterer: "Glencore",
      status: "Active",
      priority: "High",
      notes: "Thermal coal. Charterer is flexible on dates but firm on quality.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 16.5,
      freightRateUnit: "USD/MT",
      demurrage: 22000,
      demurrageUnit: "USD/day",
      commission: 2.5,
      australianApproved: true,
      linkedVessels: [],
    },
    {
      id: "ord-005",
      orderType: "Voyage",
      cargoType: "Coal",
      cargoQuantity: 75000,
      cargoUnit: "MT",
      dwtMin: 75000,
      dwtMax: 85000,
      maxAge: 20,
      laycanStart: getRandomDate(15),
      laycanEnd: getRandomDate(25),
      loadPort: "Richards Bay",
      dischargePort: "ARA",
      tradeLane: "South Africa-Europe (Coal)",
      charterer: "Vitol",
      status: "Active",
      priority: "Medium",
      notes: "South African thermal coal to ARA range.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 22.0,
      freightRateUnit: "USD/MT",
      commission: 3.0,
      linkedVessels: [],
    },
    {
      id: "ord-006",
      orderType: "Voyage",
      cargoType: "Coal",
      cargoQuantity: 65000,
      cargoUnit: "MT",
      dwtMin: 65000,
      dwtMax: 75000,
      maxAge: 15,
      laycanStart: getRandomDate(20),
      laycanEnd: getRandomDate(30),
      loadPort: "Gladstone",
      dischargePort: "Kaohsiung",
      tradeLane: "Australia-Taiwan (Coal)",
      charterer: "Trafigura",
      status: "Matched",
      priority: "Medium",
      notes: "Coking coal. Vessel nominated pending final terms.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 19.5,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      linkedVessels: [],
    },

    // Grain Orders
    {
      id: "ord-007",
      orderType: "Voyage",
      cargoType: "Wheat",
      cargoQuantity: 55000,
      cargoUnit: "MT",
      dwtMin: 55000,
      dwtMax: 65000,
      maxAge: 25,
      laycanStart: getRandomDate(18),
      laycanEnd: getRandomDate(28),
      loadPort: "Portland",
      dischargePort: "Jakarta",
      tradeLane: "Australia-Indonesia (Grain)",
      charterer: "ADM",
      status: "Active",
      priority: "Medium",
      notes: "Australian wheat. Geared vessel preferred.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 28.0,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      geared: true,
      linkedVessels: [],
    },
    {
      id: "ord-008",
      orderType: "Voyage",
      cargoType: "Corn",
      cargoQuantity: 60000,
      cargoUnit: "MT",
      dwtMin: 60000,
      dwtMax: 70000,
      maxAge: 20,
      laycanStart: getRandomDate(22),
      laycanEnd: getRandomDate(32),
      loadPort: "New Orleans",
      dischargePort: "Yokohama",
      tradeLane: "US Gulf-Japan (Grain)",
      charterer: "Cargill",
      status: "Active",
      priority: "Low",
      notes: "US corn. Standard grain charter terms.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 45.0,
      freightRateUnit: "USD/MT",
      commission: 3.75,
      linkedVessels: [],
    },
    {
      id: "ord-009",
      orderType: "Voyage",
      cargoType: "Soybeans",
      cargoQuantity: 65000,
      cargoUnit: "MT",
      dwtMin: 65000,
      dwtMax: 75000,
      maxAge: 15,
      laycanStart: getRandomDate(14),
      laycanEnd: getRandomDate(24),
      loadPort: "Santos",
      dischargePort: "Hamburg",
      tradeLane: "Brazil-Europe (Grain)",
      charterer: "Bunge",
      status: "Active",
      priority: "High",
      notes: "Brazilian soybeans. Fast discharge required.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 35.0,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      linkedVessels: [],
    },

    // Time Charter Orders
    {
      id: "ord-010",
      orderType: "TC",
      cargoType: "Various Dry Bulk",
      dwtMin: 175000,
      dwtMax: 210000,
      maxAge: 12,
      laycanStart: getRandomDate(15),
      laycanEnd: getRandomDate(25),
      loadPort: "Worldwide",
      dischargePort: "Worldwide",
      tradeLane: "Worldwide Trading",
      charterer: "Oldendorff",
      status: "Active",
      priority: "High",
      notes: "6-month time charter. Worldwide trading with reputable operator.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 22000,
      freightRateUnit: "USD/day",
      commission: 1.25,
      linkedVessels: [],
    },
    {
      id: "ord-011",
      orderType: "TC",
      cargoType: "Various Dry Bulk",
      dwtMin: 75000,
      dwtMax: 85000,
      maxAge: 15,
      laycanStart: getRandomDate(20),
      laycanEnd: getRandomDate(30),
      loadPort: "Far East",
      dischargePort: "Worldwide",
      tradeLane: "Pacific Trading",
      charterer: "Pacific Basin",
      status: "Active",
      priority: "Medium",
      notes: "3-month time charter. Pacific trading focus.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 14500,
      freightRateUnit: "USD/day",
      commission: 1.25,
      linkedVessels: [],
    },
    {
      id: "ord-012",
      orderType: "TC",
      cargoType: "Various Dry Bulk",
      dwtMin: 50000,
      dwtMax: 60000,
      maxAge: 18,
      laycanStart: getRandomDate(25),
      laycanEnd: getRandomDate(35),
      loadPort: "Atlantic",
      dischargePort: "Worldwide",
      tradeLane: "Atlantic Trading",
      charterer: "Klaveness",
      status: "Fixed",
      priority: "Medium",
      notes: "4-month time charter. Fixed at $12,500/day.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 12500,
      freightRateUnit: "USD/day",
      commission: 1.25,
      linkedVessels: [],
    },

    // COA Orders
    {
      id: "ord-013",
      orderType: "COA",
      cargoType: "Iron Ore",
      cargoQuantity: 2000000,
      cargoUnit: "MT",
      dwtMin: 170000,
      dwtMax: 210000,
      maxAge: 15,
      laycanStart: getRandomDate(30),
      laycanEnd: getRandomDate(365),
      loadPort: "Port Hedland",
      dischargePort: "Qingdao",
      tradeLane: "Australia-China (Iron Ore)",
      charterer: "COSCO",
      status: "Active",
      priority: "High",
      notes: "Annual COA for 2M MT iron ore. 12 shipments over 12 months.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 11.8,
      freightRateUnit: "USD/MT",
      commission: 1.25,
      linkedVessels: [],
    },
    {
      id: "ord-014",
      orderType: "COA",
      cargoType: "Coal",
      cargoQuantity: 1200000,
      cargoUnit: "MT",
      dwtMin: 150000,
      dwtMax: 180000,
      maxAge: 18,
      laycanStart: getRandomDate(45),
      laycanEnd: getRandomDate(365),
      loadPort: "Newcastle",
      dischargePort: "Various Japan",
      tradeLane: "Australia-Japan (Coal)",
      charterer: "JERA",
      status: "Active",
      priority: "Medium",
      notes: "Annual COA for thermal coal. 8 shipments to various Japanese ports.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 15.2,
      freightRateUnit: "USD/MT",
      commission: 1.25,
      linkedVessels: [],
    },

    // Specialty Cargo Orders
    {
      id: "ord-015",
      orderType: "Voyage",
      cargoType: "Bauxite",
      cargoQuantity: 55000,
      cargoUnit: "MT",
      dwtMin: 55000,
      dwtMax: 65000,
      maxAge: 20,
      laycanStart: getRandomDate(16),
      laycanEnd: getRandomDate(26),
      loadPort: "Kamsar",
      dischargePort: "Nikolaev",
      tradeLane: "West Africa-Black Sea (Bauxite)",
      charterer: "Rusal",
      status: "Active",
      priority: "Medium",
      notes: "Guinea bauxite. Geared vessel required.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 32.0,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      geared: true,
      linkedVessels: [],
    },
    {
      id: "ord-016",
      orderType: "Voyage",
      cargoType: "Fertilizer",
      cargoQuantity: 45000,
      cargoUnit: "MT",
      dwtMin: 45000,
      dwtMax: 55000,
      maxAge: 15,
      laycanStart: getRandomDate(12),
      laycanEnd: getRandomDate(22),
      loadPort: "Yuzhny",
      dischargePort: "Santos",
      tradeLane: "Black Sea-Brazil (Fertilizer)",
      charterer: "PhosAgro",
      status: "Active",
      priority: "High",
      notes: "Phosphate fertilizer. Special cargo handling required.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 42.0,
      freightRateUnit: "USD/MT",
      commission: 3.75,
      linkedVessels: [],
    },
    {
      id: "ord-017",
      orderType: "Voyage",
      cargoType: "Steel Products",
      cargoQuantity: 35000,
      cargoUnit: "MT",
      dwtMin: 35000,
      dwtMax: 45000,
      maxAge: 12,
      laycanStart: getRandomDate(8),
      laycanEnd: getRandomDate(18),
      loadPort: "Dalian",
      dischargePort: "Long Beach",
      tradeLane: "China-US West Coast (Steel)",
      charterer: "POSCO",
      status: "Active",
      priority: "High",
      notes: "Steel coils. Careful handling and weather protection required.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 65.0,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      geared: true,
      linkedVessels: [],
    },
    {
      id: "ord-018",
      orderType: "Voyage",
      cargoType: "Salt",
      cargoQuantity: 25000,
      cargoUnit: "MT",
      dwtMin: 25000,
      dwtMax: 35000,
      maxAge: 25,
      laycanStart: getRandomDate(30),
      laycanEnd: getRandomDate(40),
      loadPort: "Dampier",
      dischargePort: "Osaka",
      tradeLane: "Australia-Japan (Salt)",
      charterer: "Mitsubishi",
      status: "Active",
      priority: "Low",
      notes: "Industrial salt. Standard dry bulk terms.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 38.0,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      linkedVessels: [],
    },

    // Additional Urgent Orders
    {
      id: "ord-019",
      orderType: "Voyage",
      cargoType: "Iron Ore",
      cargoQuantity: 175000,
      cargoUnit: "MT",
      dwtMin: 170000,
      dwtMax: 200000,
      maxAge: 12,
      laycanStart: getRandomDate(3),
      laycanEnd: getRandomDate(8),
      loadPort: "Saldanha",
      dischargePort: "Qingdao",
      tradeLane: "South Africa-China (Iron Ore)",
      charterer: "China Steel",
      status: "Active",
      priority: "High",
      notes: "URGENT! Charterer needs immediate tonnage. Premium rates available.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 24.5,
      freightRateUnit: "USD/MT",
      commission: 3.75,
      linkedVessels: [],
    },
    {
      id: "ord-020",
      orderType: "Voyage",
      cargoType: "Grain",
      cargoQuantity: 50000,
      cargoUnit: "MT",
      dwtMin: 50000,
      dwtMax: 60000,
      maxAge: 20,
      laycanStart: getRandomDate(5),
      laycanEnd: getRandomDate(10),
      loadPort: "Constanta",
      dischargePort: "Alexandria",
      tradeLane: "Black Sea-Egypt (Grain)",
      charterer: "GASC",
      status: "Active",
      priority: "High",
      notes: "Wheat tender. Quick decision required.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 28.0,
      freightRateUnit: "USD/MT",
      commission: 2.5,
      linkedVessels: [],
    },
  ]

  console.log(`Sample orders created: ${orders.length} orders`)
  return orders
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      filters: {
        status: "All",
        orderType: "All",
        priority: "All",
        search: "",
      },
      isMatching: false,
      addOrder: (order) => {
        const { orders } = get()
        const getNextOrderNumber = () => {
          const existingNumbers = orders
            .map((o) => o.id)
            .filter((id) => id.startsWith("ord-"))
            .map((id) => {
              const num = id.replace("ord-", "")
              return isNaN(Number(num)) ? 0 : Number(num)
            })
          const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
          return maxNumber + 1
        }
        const orderNumber = getNextOrderNumber().toString().padStart(3, "0")
        const newOrder: Order = {
          ...order,
          id: `ord-${orderNumber}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          linkedVessels: order.linkedVessels || [],
        }
        set((state) => ({ orders: [...state.orders, newOrder] }))
        console.log("Order added:", newOrder)
      },
      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }))
        toast({
          title: "Order updated successfully",
          description: "The order has been updated.",
        })
      },
      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        }))
        toast({
          title: "Order deleted successfully",
          description: "The order has been removed.",
        })
      },
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }))
        toast({
          title: `Order status updated to ${status}`,
          description: "The order status has been changed.",
        })
      },
      getFilteredOrders: () => {
        const { orders, filters } = get()
        return orders.filter((order) => {
          if (filters.status && filters.status !== "All" && order.status !== filters.status) {
            return false
          }
          if (filters.orderType && filters.orderType !== "All" && order.orderType !== filters.orderType) {
            return false
          }
          if (filters.priority && filters.priority !== "All" && order.priority !== filters.priority) {
            return false
          }
          if (filters.cargoType && filters.cargoType !== "all" && order.cargoType !== filters.cargoType) {
            return false
          }
          if (filters.tradeLane && filters.tradeLane !== "all" && order.tradeLane !== filters.tradeLane) {
            return false
          }
          if (filters.charterer && filters.charterer !== "all" && order.charterer !== filters.charterer) {
            return false
          }
          if (filters.loadPort && !order.loadPort.toLowerCase().includes(filters.loadPort.toLowerCase())) {
            return false
          }
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            return (
              order.cargoType.toLowerCase().includes(searchTerm) ||
              order.loadPort.toLowerCase().includes(searchTerm) ||
              order.dischargePort.toLowerCase().includes(searchTerm) ||
              (order.charterer && order.charterer.toLowerCase().includes(searchTerm)) ||
              (order.tradeLane && order.tradeLane.toLowerCase().includes(searchTerm))
            )
          }
          return true
        })
      },
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }))
      },
      resetFilters: () => {
        set({
          filters: {
            status: "All",
            orderType: "All",
            priority: "All",
            search: "",
          },
        })
      },
      resetStore: () => {
        console.log("Resetting store...")
        const sampleOrders = createSampleOrders()
        set({
          orders: sampleOrders,
          filters: {
            status: "All",
            orderType: "All",
            priority: "All",
            search: "",
          },
        })
        toast({
          title: "Store reset successfully",
          description: "Sample data has been loaded.",
        })
      },
      linkVessel: (orderId, vessel) => {
        set((state) => {
          const updatedOrders = state.orders.map((order) => {
            if (order.id === orderId) {
              const linkedVessels = order.linkedVessels || []
              if (!linkedVessels.some((v) => v.id === vessel.id || v.vesselId === vessel.vesselId)) {
                const updatedOrder = {
                  ...order,
                  linkedVessels: [...linkedVessels, vessel],
                  updatedAt: new Date().toISOString(),
                }
                console.log(`Vessel ${vessel.name || vessel.vesselName} linked to order ${orderId}`)
                return updatedOrder
              } else {
                console.log(`Vessel ${vessel.name || vessel.vesselName} already linked to order ${orderId}`)
              }
            }
            return order
          })
          return { orders: updatedOrders }
        })
        toast({
          title: `Vessel ${vessel.name || vessel.vesselName} linked successfully`,
          description: "The vessel has been linked to the order.",
        })
      },
      unlinkVessel: (orderId, vesselId) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId && order.linkedVessels) {
              return {
                ...order,
                linkedVessels: order.linkedVessels.filter((v) => v.id !== vesselId),
                updatedAt: new Date().toISOString(),
              }
            }
            return order
          }),
        }))
        toast({
          title: "Vessel unlinked successfully",
          description: "The vessel has been removed from the order.",
        })
      },
      getOrderStats: () => {
        const { orders } = get()
        const stats = {
          Active: 0,
          Matched: 0,
          Fixed: 0,
          Cancelled: 0,
          Total: orders.length,
        }
        orders.forEach((order) => {
          if (stats[order.status] !== undefined) {
            stats[order.status]++
          }
        })
        return stats
      },
      linkVesselToOrder: (orderId: string, vessel: LinkedVessel) => {
        set((state) => {
          const updatedOrders = state.orders.map((order) => {
            if (order.id === orderId) {
              const linkedVessels = order.linkedVessels || []
              if (!linkedVessels.some((v) => v.id === vessel.id || v.vesselId === vessel.vesselId)) {
                const updatedOrder = {
                  ...order,
                  linkedVessels: [...linkedVessels, vessel],
                  updatedAt: new Date().toISOString(),
                }
                console.log(`Vessel ${vessel.name || vessel.vesselName} linked to order ${orderId}`)
                return updatedOrder
              } else {
                console.log(`Vessel ${vessel.name || vessel.vesselName} already linked to order ${orderId}`)
              }
            }
            return order
          })
          return { orders: updatedOrders }
        })
        toast({
          title: `Vessel ${vessel.name || vessel.vesselName} linked successfully`,
          description: "The vessel has been linked to the order.",
        })
      },
      unlinkVesselFromOrder: (orderId: string, vesselId: string) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                linkedVessels: (order.linkedVessels || []).filter((v) => v.id !== vesselId && v.vesselId !== vesselId),
                updatedAt: new Date().toISOString(),
              }
            }
            return order
          }),
        }))
        toast({
          title: "Vessel unlinked successfully",
          description: "The vessel has been removed from the order.",
        })
      },
      updateLinkedVesselStatus: (orderId, vesselId, status) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                linkedVessels: (order.linkedVessels || []).map((v) => {
                  if (v.vesselId === vesselId) {
                    const now = new Date().toISOString()
                    const statusHistory = v.statusHistory || []
                    return {
                      ...v,
                      status,
                      statusHistory: [
                        ...statusHistory,
                        {
                          status,
                          timestamp: now,
                          notes: `Status changed to ${status}`,
                        },
                      ],
                      updatedAt: now,
                    }
                  }
                  return v
                }),
                updatedAt: new Date().toISOString(),
              }
            }
            return order
          }),
        }))
        toast({
          title: `Vessel status updated to ${status}`,
          description: "The vessel status has been changed.",
        })
      },
      setFilters: (newFilters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        }))
      },
      setIsMatching: (isMatching) => {
        set({ isMatching })
      },
      loadMoreSampleData: () => {
        const additionalOrders = createSampleOrders()
        set((state) => ({
          orders: [...state.orders, ...additionalOrders],
        }))
        toast({
          title: "Additional sample data loaded",
          description: "More sample orders have been added.",
        })
      },
      getOrderById: (id) => {
        const { orders } = get()
        return orders.find((order) => order.id === id)
      },
      advanceVesselStatus: (orderId, vesselId, newStatus, notes) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                linkedVessels: (order.linkedVessels || []).map((v) => {
                  if (v.vesselId === vesselId) {
                    const statusHistory = v.statusHistory || []
                    return {
                      ...v,
                      status: newStatus,
                      statusHistory: [
                        ...statusHistory,
                        {
                          status: newStatus,
                          timestamp: new Date().toISOString(),
                          notes: notes || `Status changed to ${newStatus}`,
                        },
                      ],
                      updatedAt: new Date().toISOString(),
                    }
                  }
                  return v
                }),
                updatedAt: new Date().toISOString(),
              }
            }
            return order
          }),
        }))
        toast({
          title: `Vessel status updated to ${newStatus}`,
          description: "The vessel status has been advanced.",
        })
      },
      recordVesselRate: (orderId, vesselId, rate, unit) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                linkedVessels: (order.linkedVessels || []).map((v) => {
                  if (v.vesselId === vesselId) {
                    return {
                      ...v,
                      rateReceived: rate,
                      rateReceivedUnit: unit,
                      status: "Rate Received" as LinkedVesselStatus,
                      statusHistory: [
                        ...(v.statusHistory || []),
                        {
                          status: "Rate Received",
                          timestamp: new Date().toISOString(),
                          notes: `Rate of ${rate} ${unit} received`,
                          rate,
                          rateUnit: unit,
                        },
                      ],
                      updatedAt: new Date().toISOString(),
                    }
                  }
                  return v
                }),
                updatedAt: new Date().toISOString(),
              }
            }
            return order
          }),
        }))
        toast({
          title: `Rate of ${rate} ${unit} recorded`,
          description: "The vessel rate has been recorded.",
        })
      },
      markVesselContacted: (orderId, vesselId) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                linkedVessels: (order.linkedVessels || []).map((v) => {
                  if (v.vesselId === vesselId) {
                    const now = new Date().toISOString()
                    return {
                      ...v,
                      lastContactedAt: now,
                      status: "Contacted" as LinkedVesselStatus,
                      statusHistory: [
                        ...(v.statusHistory || []),
                        {
                          status: "Contacted",
                          timestamp: now,
                          notes: "Initial contact made",
                        },
                      ],
                      updatedAt: now,
                    }
                  }
                  return v
                }),
                updatedAt: new Date().toISOString(),
              }
            }
            return order
          }),
        }))
        toast({
          title: "Vessel marked as contacted",
          description: "The vessel has been marked as contacted.",
        })
      },
      getVesselStatusHistory: (orderId, vesselId) => {
        const { orders } = get()
        const order = orders.find((o) => o.id === orderId)
        if (!order) return undefined
        const vessel = (order.linkedVessels || []).find((v) => v.vesselId === vesselId)
        return vessel?.statusHistory
      },
    }),
    {
      name: "order-storage",
      version: 6,
      onRehydrateStorage: () => (state) => {
        if (state && state.orders.length === 0) {
          console.log("No orders found after rehydration, initializing with sample data")
          state.resetStore()
        }
      },
    },
  ),
)

// Force initialization with sample data
const initializeStore = () => {
  const state = useOrderStore.getState()
  console.log("Initializing store, current orders:", state.orders.length)
  if (state.orders.length === 0) {
    console.log("No orders found, resetting store...")
    state.resetStore()
  }
}

// Initialize on module load
if (typeof window !== "undefined") {
  setTimeout(initializeStore, 100)
}
