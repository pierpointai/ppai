export interface Offer {
  id: string
  vesselName: string
  vesselType: string
  vesselSize: number // DWT in thousands
  vesselAge: number
  vesselFlag: string
  imo: string
  loadPort: string
  dischargePort: string
  laycanStart: Date
  laycanEnd: Date
  freightRate: number
  rateUnit: string
  score?: number
  rawEmail?: string
  cargoType?: string
  cargoQuantity?: number
  cargoUnit?: string
  charterer?: string
  status?: "available" | "pending" | "on_subs" | "fixed" | "failed" | "withdrawn"
  confidenceScore?: number
  category?: string
  priority?: "urgent" | "firm" | "indication" | "low"
  tags?: string[]
  notes?: string
  lastUpdated?: Date
  vesselCategory?: string
  contractType?: "voyage" | "time" | "coa" | "bareboat"
  duration?: number // For time charters, in days
  marketSegment?: string
  tradeLane?: string
  bdiComparison?: number // Percentage above/below relevant BDI
  freightTotal?: number // Total freight value for voyage charters
  demurrage?: number // Demurrage rate USD/day
  despatch?: number // Despatch rate USD/day (usually 50% of demurrage)
  loadRate?: number // Loading rate MT per day
  dischargeRate?: number // Discharge rate MT per day
  laydays?: number // Laytime in days
  cancelling?: Date // Cancelling date
  commissionRate?: number // Commission percentage
  etaLoadPort?: Date // ETA to load port
  terms?: string // Special terms
  subjects?: string[] // List of subjects

  // Enhanced vessel properties for real broking
  openPort?: string // Current open port
  openDates?: string // Open dates
  nextPort?: string // Next port destination
  lastCargo?: string // Last cargo carried
  ballast?: boolean // True if ballast, false if laden
  laden?: boolean // True if laden, false if ballast
  commission?: number // Commission rate
  brokerName?: string // Broker name
  company?: string // Broker company
  phoneNumber?: string // Contact phone number
  email?: string // Contact email

  // Real-world operational data
  gearType?: "geared" | "gearless" | "self_unloading"
  cranes?: string // Crane specifications
  holds?: number // Number of holds
  hatchCovers?: string // Hatch cover type
  grainFitted?: boolean
  iceClass?: string
  australianApproved?: boolean
  vetting?: "approved" | "pending" | "rejected" | "not_required"
  pi?: string // P&I Club
  classification?: string // Classification society
  manager?: string // Ship manager
  owner?: string // Vessel owner

  // Market intelligence
  lastFixture?: {
    date: Date
    route: string
    cargo: string
    rate: number
    charterer: string
  }
  marketPosition?: "firm" | "soft" | "steady" | "rising"
  competitiveRate?: number // What competitors are offering

  // Operational details
  fuelConsumption?: {
    laden: number // MT per day laden
    ballast: number // MT per day ballast
  }
  speed?: {
    laden: number // Knots laden
    ballast: number // Knots ballast
  }
  bunkerPrice?: number // Current bunker price
  portCharges?: number // Estimated port charges

  // Financial
  dailyRunningCost?: number // Daily OPEX
  tcEquivalent?: number // Time charter equivalent
  voyageResult?: number // Estimated voyage result
}

export interface RankingWeights {
  vesselSize: number
  laycan: number
  freightRate: number
  region: number
}

export interface EnhancedRankingWeights extends RankingWeights {
  vesselSize: number
  laycan: number
  freightRate: number
  region: number
  vesselAge: number
  cargoType: number
  chartererReputation: number
  portEfficiency: number
  historicalPerformance: number
  marketTrend: number
  geographicProximity: number
}

// Real dry bulk cargo types
export const CARGO_TYPES = [
  "Iron Ore",
  "Coal",
  "Grain",
  "Wheat",
  "Corn",
  "Soybeans",
  "Soybean Meal",
  "Barley",
  "Canola",
  "Rice",
  "Bauxite",
  "Alumina",
  "Fertilizer",
  "Urea",
  "DAP",
  "Phosphate Rock",
  "Potash",
  "Steel Products",
  "Steel Coils",
  "Steel Slabs",
  "Scrap Metal",
  "Cement",
  "Clinker",
  "Petcoke",
  "Sugar",
  "Taconite Pellets",
  "Limestone",
  "Salt",
  "Sand",
  "Aggregates",
  "Wood Pellets",
  "Wood Chips",
  "Logs",
  "Pulp",
  "Minerals",
  "Manganese Ore",
  "Chrome Ore",
  "Nickel Ore",
  "Copper Concentrate",
  "Zinc Concentrate",
  "Lead Concentrate",
]

export const CONTRACT_TYPES = ["Voyage Charter", "Time Charter", "Contract of Affreightment", "Bareboat Charter"]

export const MARKET_SEGMENTS = [
  "Major Bulks",
  "Minor Bulks",
  "Agricultural Products",
  "Fertilizers",
  "Metals & Minerals",
  "Steel Products",
  "Forest Products",
  "Industrial Minerals",
  "Project Cargo",
]

// Real major dry bulk trade routes
export const TRADE_LANES = [
  "Brazil-China (Iron Ore)",
  "Australia-China (Iron Ore)",
  "Australia-China (Coal)",
  "Australia-Japan (Coal)",
  "Australia-Korea (Coal)",
  "Australia-India (Coal)",
  "Indonesia-China (Coal)",
  "Indonesia-India (Coal)",
  "South Africa-India (Coal)",
  "Colombia-Europe (Coal)",
  "US East Coast-Europe (Coal)",
  "Russia-China (Coal)",
  "US Gulf-China (Grain)",
  "US Gulf-Japan (Grain)",
  "US Gulf-Southeast Asia (Grain)",
  "US Gulf-Europe (Grain)",
  "US Gulf-Middle East (Grain)",
  "US Gulf-North Africa (Grain)",
  "Argentina-China (Grain)",
  "Brazil-China (Grain)",
  "Brazil-Europe (Grain)",
  "Black Sea-China (Grain)",
  "Black Sea-Middle East (Grain)",
  "Black Sea-North Africa (Grain)",
  "Black Sea-Southeast Asia (Grain)",
  "Canada-China (Grain)",
  "Australia-China (Grain)",
  "Australia-Guinea (Bauxite)",
  "Jamaica-China (Bauxite)",
  "Brazil-China (Bauxite)",
  "West Africa-China (Bauxite)",
  "West Africa-Europe (Bauxite)",
  "Australia-China (Alumina)",
  "Brazil-Europe (Alumina)",
  "Middle East-India (Fertilizer)",
  "Baltic-Brazil (Fertilizer)",
  "Morocco-India (Phosphate)",
  "Jordan-India (Phosphate)",
  "Russia-Brazil (Fertilizer)",
  "Canada-Brazil (Potash)",
  "Russia-China (Fertilizer)",
  "Intra-Asia",
  "Intra-Europe",
  "Intra-Americas",
  "Transatlantic",
  "Transpacific",
  "Europe-Far East",
  "Middle East-Far East",
]

// Real vessel categories with proper DWT ranges
export const VESSEL_CATEGORIES = [
  "Small Handy",
  "Handysize",
  "Supramax",
  "Ultramax",
  "Panamax",
  "Kamsarmax",
  "Post-Panamax",
  "Capesize",
  "VLOC",
  "ULOC",
]

export const VESSEL_CATEGORY_RANGES = {
  "Small Handy": [10, 28],
  Handysize: [28, 40],
  Supramax: [50, 60],
  Ultramax: [60, 65],
  Panamax: [65, 80],
  Kamsarmax: [80, 85],
  "Post-Panamax": [85, 120],
  Capesize: [120, 210],
  VLOC: [210, 300],
  ULOC: [300, 400],
}

// Major dry bulk ports by region
export const MAJOR_PORTS = {
  China: [
    "Qingdao",
    "Rizhao",
    "Dalian",
    "Tianjin",
    "Tangshan",
    "Jingtang",
    "Caofeidian",
    "Shanghai",
    "Ningbo",
    "Zhoushan",
    "Guangzhou",
    "Shenzhen",
    "Zhanjiang",
  ],
  Japan: [
    "Kashima",
    "Chiba",
    "Tokyo",
    "Yokohama",
    "Nagoya",
    "Osaka",
    "Kobe",
    "Mizushima",
    "Fukuyama",
    "Oita",
    "Saganoseki",
  ],
  Korea: ["Pohang", "Gwangyang", "Busan", "Incheon", "Ulsan", "Daesan"],
  India: [
    "Paradip",
    "Visakhapatnam",
    "Chennai",
    "Tuticorin",
    "Cochin",
    "New Mangalore",
    "JNPT",
    "Mumbai",
    "Kandla",
    "Haldia",
    "Kolkata",
  ],
  Australia: [
    "Port Hedland",
    "Dampier",
    "Port Walcott",
    "Geraldton",
    "Esperance",
    "Newcastle",
    "Port Kembla",
    "Brisbane",
    "Gladstone",
    "Hay Point",
    "Abbot Point",
    "Mackay",
    "Bundaberg",
  ],
  Brazil: [
    "Tubarao",
    "Ponta da Madeira",
    "Itaqui",
    "Sepetiba",
    "Santos",
    "Paranagua",
    "Rio Grande",
    "Imbituba",
    "Vitoria",
  ],
  "US Gulf": ["New Orleans", "Baton Rouge", "Houston", "Galveston", "Beaumont", "Lake Charles", "Mobile", "Pascagoula"],
  "US East Coast": ["Norfolk", "Baltimore", "Philadelphia", "New York", "Boston", "Charleston"],
  "US West Coast": ["Los Angeles", "Long Beach", "Oakland", "Seattle", "Tacoma", "Portland"],
  Europe: [
    "Rotterdam",
    "Amsterdam",
    "Antwerp",
    "Hamburg",
    "Bremen",
    "Immingham",
    "Tees",
    "Gdansk",
    "Rostock",
    "Gothenburg",
    "Oxelosund",
  ],
  "Black Sea": ["Constanta", "Odessa", "Nikolaev", "Novorossiysk", "Tuapse", "Poti", "Batumi"],
  Mediterranean: [
    "Taranto",
    "Gioia Tauro",
    "Ravenna",
    "Trieste",
    "Thessaloniki",
    "Piraeus",
    "Iskenderun",
    "Mersin",
    "Alexandria",
    "Sfax",
  ],
  "Southeast Asia": [
    "Singapore",
    "Port Klang",
    "Tanjung Pelepas",
    "Jakarta",
    "Surabaya",
    "Taboneo",
    "Samarinda",
    "Banjarmasin",
    "Ho Chi Minh",
    "Cam Pha",
  ],
  "Middle East": ["Jebel Ali", "Fujairah", "Sohar", "Salalah", "Dammam", "Jubail", "Ras Tanura"],
  "West Africa": [
    "Kamsar",
    "Conakry",
    "Freetown",
    "Monrovia",
    "Buchanan",
    "Tema",
    "Takoradi",
    "Lagos",
    "Port Harcourt",
    "Douala",
    "Libreville",
    "Port Gentil",
  ],
  "South Africa": ["Durban", "Richards Bay", "East London", "Port Elizabeth", "Cape Town", "Saldanha"],
}

// Real charterer names in dry bulk
export const CHARTERERS = [
  "Cargill",
  "Bunge",
  "Louis Dreyfus",
  "ADM",
  "COFCO",
  "Viterra",
  "Glencore",
  "Trafigura",
  "Mercuria",
  "Gunvor",
  "Olam",
  "Wilmar",
  "Noble",
  "Marubeni",
  "Mitsui",
  "Mitsubishi",
  "Itochu",
  "Sumitomo",
  "Toyota Tsusho",
  "JFE",
  "Nippon Steel",
  "POSCO",
  "Baosteel",
  "Vale",
  "Rio Tinto",
  "BHP",
  "Fortescue",
  "Anglo American",
  "Glencore Xstrata",
  "Oldendorff",
  "Norden",
  "SwissMarine",
  "Klaveness",
  "Ultrabulk",
  "Lauritzen Bulkers",
  "Western Bulk",
  "Pangaea Logistics",
  "Pacific Basin",
  "Golden Ocean",
  "Star Bulk",
  "Eagle Bulk",
  "Genco",
  "Diana Shipping",
  "DryShips",
  "Seanergy",
  "Castor Maritime",
  "Himalaya Shipping",
  "Grindrod",
  "Bulk Carriers",
  "Jinhui Shipping",
  "China Cosco",
  "China Shipping",
  "CSSC",
  "Sinotrans",
]

// Real flag states
export const FLAGS = [
  "Panama",
  "Liberia",
  "Marshall Islands",
  "Hong Kong",
  "Singapore",
  "Malta",
  "Bahamas",
  "Cyprus",
  "Greece",
  "Japan",
  "Norway",
  "Denmark",
  "Germany",
  "Netherlands",
  "UK",
  "Italy",
  "China",
  "South Korea",
  "India",
  "Brazil",
]

// Vessel status options
export const VESSEL_STATUS = ["available", "pending", "on_subs", "fixed", "failed", "withdrawn", "ballast", "laden"]

// Subject types common in dry bulk
export const COMMON_SUBJECTS = [
  "Stem/Details",
  "Charterer's Approval",
  "Owner's Approval",
  "Vessel Inspection",
  "Cargo Survey",
  "Port Approval",
  "Berth Availability",
  "Laycan Confirmation",
  "Rate Confirmation",
  "Documentation",
  "Insurance",
  "P&I Approval",
  "Class Approval",
  "Flag State Approval",
  "Vetting Approval",
  "Clean BL",
  "Cargo Compatibility",
  "Loading/Discharge Facilities",
  "Weather Routing",
  "Bunker Prices",
]

// Market intelligence data
export const BDI_ROUTES = {
  C2: { route: "Tubarao-Qingdao (Iron Ore)", size: "Capesize", cargo: "Iron Ore" },
  C3: { route: "Tubarao-Qingdao (Iron Ore)", size: "Capesize", cargo: "Iron Ore" },
  C4: { route: "Richards Bay-Rotterdam (Coal)", size: "Capesize", cargo: "Coal" },
  C5: { route: "West Australia-Qingdao (Iron Ore)", size: "Capesize", cargo: "Iron Ore" },
  C7: { route: "Bolivar-Rotterdam (Coal)", size: "Capesize", cargo: "Coal" },
  P1A: { route: "Transatlantic RV", size: "Panamax", cargo: "Various" },
  P2A: { route: "Continent-Far East", size: "Panamax", cargo: "Various" },
  P3A: { route: "Transpacific RV", size: "Panamax", cargo: "Various" },
  P4: { route: "US Gulf-Japan (Grain)", size: "Panamax", cargo: "Grain" },
  S1A: { route: "US Gulf-Skaw-Passero", size: "Supramax", cargo: "Grain" },
  S1B: { route: "Canakkale-Far East", size: "Supramax", cargo: "Grain" },
  S2: { route: "Japan-Australia RV", size: "Supramax", cargo: "Coal" },
  S3: { route: "North China-West Africa", size: "Supramax", cargo: "Steel" },
  S4A: { route: "US Gulf-Skaw-Passero", size: "Supramax", cargo: "Grain" },
  S4B: { route: "Skaw-Passero-US Gulf", size: "Supramax", cargo: "Grain" },
}

// Real commission rates by region/charterer type
export const COMMISSION_RATES = {
  "Major Trader": 1.25,
  "Regional Trader": 2.5,
  "Steel Mill": 3.75,
  Utility: 3.75,
  Government: 5.0,
  Default: 2.5,
}

export interface FilterOptions {
  vesselType: string | null
  region: string | null
  laycanMonth: string | null
  category?: string | null
  priority?: string | null
  tags?: string[] | null
  vesselCategory?: string | null
  cargoType?: string | null
  contractType?: string | null
  tradeLane?: string | null
  marketSegment?: string | null
  loadPort?: string
  dischargePort?: string
  laycanStart?: Date
  laycanEnd?: Date
  minFreightRate?: number
  maxFreightRate?: number
  status?: string
  charterer?: string
  vetting?: string
  gearType?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
    borderWidth?: number
  }[]
}

// Deal pipeline stages
export const DEAL_STAGES = [
  "Inquiry",
  "Indication",
  "Firm Offer",
  "Negotiation",
  "On Subjects",
  "Subjects Lifted",
  "Fixed",
  "Failed",
  "Withdrawn",
]

// Priority levels for brokers
export const PRIORITY_LEVELS = ["urgent", "firm", "indication", "low"]

// Offer categories matching broker workflow
export const OFFER_CATEGORIES = [
  "New Inquiries",
  "Firm Offers",
  "Under Negotiation",
  "On Subjects",
  "Subjects Lifted",
  "Fixed",
  "Failed",
  "Withdrawn",
  "Follow Up",
  "Hot Prospects",
]

export const DEFAULT_TAGS = [
  "Prompt",
  "Flexible Dates",
  "Firm Offer",
  "Indication Only",
  "Spot Market",
  "Period Business",
  "COA Potential",
  "Repeat Client",
  "New Client",
  "Premium Charterer",
  "Difficult Terms",
  "Quick Decision",
  "Price Sensitive",
  "Quality Sensitive",
  "Eco Vessel Required",
  "Scrubber Fitted",
  "Ice Class Required",
  "Geared Required",
  "Gearless Required",
  "Australian Approved",
  "Grain Clean",
  "Self Trimming",
  "Grab Discharge",
  "Conveyor Discharge",
  "Backhaul",
  "Fronthaul",
  "Triangulation",
  "Bunker Sensitive",
  "Weather Routing",
  "Fast Vessel",
  "Fuel Efficient",
]

// Client-related types for real broker operations
export interface ClientRequest {
  id: string
  clientId: string
  date: Date
  emailSubject: string
  emailContent: string
  extractedData: {
    vesselType?: string
    vesselSize?: number
    loadPort?: string
    dischargePort?: string
    laycanStart?: Date
    laycanEnd?: Date
    targetRate?: number
    cargoType?: string
    cargoQuantity?: number
    maxAge?: number
    buildYear?: number
    gearRequirement?: string
    iceClassRequirement?: string
    flagPreference?: string
    specialClauses?: string
    chartererPreference?: string
    confidenceScores?: Record<string, number>
    urgency?: "urgent" | "normal" | "low"
    businessType?: "spot" | "period" | "coa"
    commission?: number
    subjects?: string[]
  }
  status: "new" | "processing" | "quoted" | "negotiating" | "fixed" | "failed" | "closed"
  matchedOffers?: string[]
  priority: "urgent" | "firm" | "indication" | "low"
  responseDeadline?: Date
  internalNotes?: string
  clientFeedback?: string
}

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  lastContact?: Date
  status: "active" | "inactive" | "prospect"
  requests?: ClientRequest[]
  clientType: "charterer" | "owner" | "operator" | "trader" | "broker"
  creditRating?: "A" | "B" | "C" | "D"
  paymentTerms?: string
  preferredPorts?: string[]
  typicalCargoes?: string[]
  averageVolume?: number
  relationship: "excellent" | "good" | "fair" | "poor"
  notes?: string
}

// Market intelligence types
export interface MarketData {
  route: string
  vesselSize: string
  cargo: string
  rate: number
  rateUnit: string
  date: Date
  charterer: string
  vessel: string
  source: "fixture" | "indication" | "rumor"
  confidence: number
}

export interface PortData {
  name: string
  country: string
  region: string
  coordinates: { lat: number; lng: number }
  facilities: {
    maxDraft: number
    maxLOA: number
    maxBeam: number
    berths: number
    storage: number
    loadRate: number
    dischargeRate: number
  }
  restrictions: string[]
  workingHours: string
  demurrage: number
  portCharges: number
  efficiency: number // 1-10 scale
}

// Priority levels for offers
export const OFFER_PRIORITIES = ["urgent", "firm", "indication", "low"] as const
