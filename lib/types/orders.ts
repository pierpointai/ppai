export type OrderStatus = "Active" | "Matched" | "Fixed" | "Cancelled" | "Completed"
export type LinkedVesselStatus =
  | "Shortlisted"
  | "Contacted"
  | "Awaiting Response"
  | "Rate Received"
  | "Presented to Charterer"
  | "Negotiating"
  | "Fixed"
  | "Rejected"
  | "Nominated"

export interface LinkedVessel {
  id: string
  vesselId: string
  vesselName: string
  vesselType: string
  dwt: number
  openPort: string
  laycanStart: Date | string
  laycanEnd: Date | string
  matchScore: number
  status: LinkedVesselStatus
  linkedAt: Date | string
  notes?: string
  lastContactedAt?: Date | string
  rateReceived?: number
  rateReceivedUnit?: string
  statusHistory?: Array<{
    status: LinkedVesselStatus
    timestamp: Date | string
    notes?: string
  }>
}

export interface Order {
  id: string
  orderType: "TC" | "Voyage" | "COA"
  cargoType: string
  dwtMin: number
  dwtMax: number
  laycanStart: Date
  laycanEnd: Date
  loadPort: string
  dischargePort: string
  status: OrderStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
  linkedVessels: LinkedVessel[]

  // Dry cargo specific fields
  cargoQuantity?: number
  cargoUnit?: string
  loadRate?: number
  dischargeRate?: number
  freightIdea?: string
  maxAge?: number
  gearRequirement?: string
  iceClass?: boolean
  commissionRate?: number
  demurrage?: number
  despatch?: number
  charterer?: string
  tradeLane?: string
  priority?: "high" | "medium" | "low"
  specialRequirements?: string[]
}

export interface OrderFiltersType {
  search?: string
  orderType?: string
  cargoType?: string
  status?: string
  loadPort?: string
  dischargePort?: string
  tradeLane?: string
  charterer?: string
  priority?: string
}

export const CARGO_TYPES = [
  "Iron Ore",
  "Coal",
  "Grain",
  "Wheat",
  "Corn",
  "Soybeans",
  "Bauxite",
  "Alumina",
  "Fertilizer",
  "Steel Products",
  "Scrap Metal",
  "Cement",
  "Petcoke",
  "Sugar",
  "Rice",
  "Forest Products",
  "Minerals",
  "Salt",
]

export const SPECIAL_REQUIREMENTS = [
  "Geared Vessel",
  "Ice Class",
  "Logs Fitted",
  "Australian Approved",
  "Grain Fitted",
  "Self-Trimming",
  "CO2 Fitted",
  "Grab Discharge",
  "Double Hull",
  "Box Shaped",
  "Strengthened Hatches",
  "IMO Approved",
  "Aussie Ladders",
  "Grab Fitted",
]

export const TRADE_LANES = [
  "Brazil-China (Iron Ore)",
  "Australia-China (Coal/Iron Ore)",
  "US Gulf-China (Grain)",
  "US Gulf-Europe (Grain)",
  "Black Sea-Mediterranean (Grain)",
  "Indonesia-India (Coal)",
  "South Africa-India (Coal)",
  "West Africa-China (Bauxite)",
  "US-Europe (Scrap/Steel)",
  "Europe-Far East (General)",
  "Intra-Asia",
  "Intra-Europe",
  "Transatlantic",
  "Transpacific",
]

export const CHARTERERS = [
  "Cargill",
  "Bunge",
  "Louis Dreyfus",
  "Oldendorff",
  "Norden",
  "Trafigura",
  "SwissMarine",
  "Cofco",
  "Viterra",
  "Pacific Basin",
  "Golden Ocean",
  "Star Bulk",
  "Eagle Bulk",
  "Klaveness",
  "Lauritzen Bulkers",
  "Ultrabulk",
  "Western Bulk",
  "Pangaea Logistics",
  "Genco Shipping",
  "Diana Shipping",
]
