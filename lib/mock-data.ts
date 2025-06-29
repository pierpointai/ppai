import type { Offer, Client, ClientRequest, MarketData } from "./types"
import { CARGO_TYPES, CHARTERERS, FLAGS, MAJOR_PORTS, TRADE_LANES, VESSEL_CATEGORIES, BDI_ROUTES } from "./types"

export const REGIONS = [
  {
    name: "US Gulf",
    ports: ["Houston", "New Orleans", "Mobile", "Galveston", "Beaumont"],
  },
  {
    name: "US East Coast",
    ports: ["Norfolk", "Baltimore", "New York", "Charleston", "Savannah"],
  },
  {
    name: "US West Coast",
    ports: ["Long Beach", "Los Angeles", "Oakland", "Seattle", "Portland"],
  },
  {
    name: "ECSA",
    ports: ["Santos", "Buenos Aires", "Rosario", "Paranagua", "Rio Grande"],
  },
  {
    name: "Europe",
    ports: ["Rotterdam", "Hamburg", "Antwerp", "Amsterdam", "Bremen"],
  },
  {
    name: "Mediterranean",
    ports: ["Barcelona", "Valencia", "Genoa", "Piraeus", "Tarragona"],
  },
  {
    name: "Black Sea",
    ports: ["Constanta", "Odessa", "Novorossiysk", "Poti", "Batumi"],
  },
  {
    name: "Baltic",
    ports: ["Gdansk", "Stockholm", "Helsinki", "Riga", "Klaipeda"],
  },
  {
    name: "Far East",
    ports: ["Shanghai", "Qingdao", "Dalian", "Tianjin", "Ningbo"],
  },
  {
    name: "Southeast Asia",
    ports: ["Singapore", "Port Klang", "Jakarta", "Ho Chi Minh", "Bangkok"],
  },
  {
    name: "Japan",
    ports: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Kobe"],
  },
  {
    name: "Korea",
    ports: ["Busan", "Incheon", "Ulsan", "Pohang", "Gwangyang"],
  },
  {
    name: "India",
    ports: ["Mumbai", "Chennai", "Kandla", "Kolkata", "Cochin"],
  },
  {
    name: "Australia",
    ports: ["Port Hedland", "Newcastle", "Gladstone", "Dampier", "Port Kembla"],
  },
  {
    name: "Brazil",
    ports: ["Tubarao", "Vitoria", "Ponta da Madeira", "Itaqui", "Sepetiba"],
  },
  {
    name: "South Africa",
    ports: ["Durban", "Cape Town", "Port Elizabeth", "East London", "Saldanha"],
  },
  {
    name: "Middle East",
    ports: ["Jebel Ali", "Kuwait", "Dammam", "Doha", "Abu Dhabi"],
  },
  {
    name: "West Africa",
    ports: ["Lagos", "Tema", "Abidjan", "Dakar", "Conakry"],
  },
]

// Expanded vessel names for more variety
const VESSEL_NAMES = [
  // Capesize vessels
  "Iron Duke",
  "Ore Master",
  "Cape Glory",
  "Mineral Star",
  "Bulk Carrier",
  "Ocean Giant",
  "Steel Voyager",
  "Iron Maiden",
  "Ore Princess",
  "Cape Victory",
  "Mineral Queen",
  "Bulk Champion",
  "Iron Explorer",
  "Ore Navigator",
  "Cape Triumph",

  // Panamax vessels
  "Pacific Trader",
  "Atlantic Voyager",
  "Grain Master",
  "Coal Carrier",
  "Bulk Pioneer",
  "Ocean Trader",
  "Cargo Star",
  "Pacific Glory",
  "Atlantic Spirit",
  "Grain Princess",
  "Coal Navigator",
  "Bulk Explorer",
  "Ocean Pioneer",
  "Cargo Queen",

  // Supramax/Ultramax vessels
  "Nordic Star",
  "Baltic Explorer",
  "Mediterranean Pearl",
  "Aegean Spirit",
  "Adriatic Wind",
  "Caspian Dream",
  "Black Sea Glory",
  "Red Sea Navigator",
  "Arabian Gulf",
  "Persian Jewel",
  "Indian Ocean",
  "Bay of Bengal",
  "South China Sea",
  "East China Sea",

  // Handysize vessels
  "Coastal Trader",
  "Regional Star",
  "Port Explorer",
  "Bay Navigator",
  "River Queen",
  "Coastal Pioneer",
  "Regional Glory",
  "Port Master",
  "Bay Princess",
  "River Explorer",
  "Coastal Spirit",
  "Regional Voyager",
  "Port Champion",
  "Bay Triumph",

  // More general names
  "Yellow Sea",
  "Bohai Bay",
  "Yangtze River",
  "Amazon Explorer",
  "Orinoco Star",
  "Rio Grande",
  "Parana River",
  "La Plata",
  "Great Lakes",
  "St. Lawrence",
  "Hudson Bay",
  "Mackenzie River",
  "Columbia River",
  "Danube Star",
  "Rhine Trader",
  "Elbe Navigator",
  "Thames Explorer",
  "Seine Pearl",
  "Volga Spirit",
  "Don River",
  "Dnieper Wind",
  "Vistula Dream",
  "Oder Glory",
  "Nile Voyager",
  "Congo Pioneer",
  "Niger Trader",
  "Zambezi Explorer",
  "Orange River",
  "Murray Star",
  "Darling Spirit",
  "Brisbane Wind",
  "Sydney Dream",
  "Melbourne Glory",
  "Auckland Navigator",
  "Wellington Star",
  "Christchurch Spirit",
  "Dunedin Wind",
  "Invercargill Dream",
  "Tasman Explorer",
  "Coral Sea",
  "Timor Navigator",

  // Additional realistic names
  "Global Harmony",
  "World Unity",
  "Ocean Prosperity",
  "Maritime Success",
  "Shipping Excellence",
  "Cargo Efficiency",
  "Bulk Reliability",
  "Trade Confidence",
  "Commercial Victory",
  "Industrial Progress",
  "Economic Growth",
  "Market Leader",
  "Business Partner",
  "Strategic Alliance",
  "Operational Excellence",
  "Performance Leader",
  "Quality Assurance",
  "Service Excellence",
  "Customer Focus",
  "Innovation Leader",
  "Technology Pioneer",
  "Digital Future",
  "Smart Shipping",
  "Green Horizon",
  "Sustainable Future",
  "Clean Energy",
  "Eco Friendly",
  "Environmental Leader",
  "Carbon Neutral",
  "Zero Emission",
]

const SHIP_MANAGERS = [
  "V.Ships",
  "Anglo-Eastern",
  "Wilhelmsen Ship Management",
  "Columbia Shipmanagement",
  "Bernhard Schulte",
  "Thome Group",
  "Fleet Management",
  "Synergy Marine",
  "OSM Maritime",
  "Marlow Navigation",
  "Wallem Group",
  "Hanseatic Lloyd",
  "Eurasia Group",
  "Univan Ship Management",
  "Zodiac Maritime",
  "Schulte Group",
  "Executive Ship Management",
  "Interorient Navigation",
  "Barber International",
  "Danaos Shipping",
]

const OWNERS = [
  "Golden Ocean Group",
  "Star Bulk Carriers",
  "Eagle Bulk Shipping",
  "Genco Shipping",
  "Diana Shipping",
  "Safe Bulkers",
  "Seanergy Maritime",
  "Castor Maritime",
  "Himalaya Shipping",
  "Grindrod Shipping",
  "Jinhui Shipping",
  "Pacific Basin",
  "Oldendorff Carriers",
  "Norden",
  "Klaveness",
  "Western Bulk",
  "Ultrabulk",
  "SwissMarine",
  "Lauritzen Bulkers",
  "Pangaea Logistics",
  "Dry Ships",
  "Bulk Carriers",
  "Ocean Yield",
  "2020 Bulkers",
  "Scorpio Bulkers",
  "Navios Maritime",
  "Costamare",
  "Capital Maritime",
]

const PI_CLUBS = [
  "Gard",
  "Skuld",
  "West of England",
  "Britannia",
  "Standard Club",
  "North of England",
  "Steamship Mutual",
  "London P&I",
  "American Club",
  "UK Club",
  "Swedish Club",
  "Shipowners' Club",
]

const CLASS_SOCIETIES = [
  "DNV GL",
  "Lloyd's Register",
  "ABS",
  "Bureau Veritas",
  "ClassNK",
  "RINA",
  "CCS",
  "KR",
  "RS",
  "IRS",
  "PRS",
  "Croatian Register",
]

export const MOCK_EMAILS = [
  "Handysize 32k DWT, US Gulf → Continent, June 10–15, $15k/day",
  "Panamax 76k DWT, ECSA → Far East, June 12–18, $20.5k/day",
  "Supramax 58k DWT, Black Sea → SE Asia, June 15–20, $18k/day",
  "Ultramax 64k DWT, India → China, June 11–17, $19k/day",
  "Handymax 45k DWT, US Gulf → Med, June 14–19, $16k/day",
  "Kamsarmax 82k DWT, Australia → Japan, June 18–22, $22k/day",
  "Supramax 56k DWT, ECSA → Med, June 20–25, $17.5k/day",
  "Handysize 28k DWT, Baltic → Med, June 16–20, $14.2k/day",
]

export const VESSEL_TYPES = [
  "Handysize",
  "Handymax",
  "Supramax",
  "Ultramax",
  "Panamax",
  "Kamsarmax",
  "Post-Panamax",
  "Capesize",
  "VLOC",
]

export const DEFAULT_RANKING_WEIGHTS = {
  vesselSize: 0.3,
  laycan: 0.25,
  freightRate: 0.35,
  region: 0.1,
}

export const BROKER_NAMES = [
  "John Smith",
  "Sarah Johnson",
  "Michael Chen",
  "David Wong",
  "Elena Rossi",
  "Lars Andersen",
  "Carlos Rodriguez",
  "Priya Sharma",
  "Ahmed Hassan",
  "Maria Santos",
  "James Wilson",
  "Anna Kowalski",
  "Roberto Silva",
  "Yuki Tanaka",
  "Sophie Martin",
  "Hans Mueller",
  "Isabella Garcia",
  "Raj Patel",
  "Emma Thompson",
  "Dimitri Petrov",
  "Andreas Petersen",
  "Francesca Romano",
  "Takeshi Yamamoto",
  "Olaf Kristensen",
  "Carmen Delgado",
  "Wei Zhang",
  "Nikolai Volkov",
  "Fatima Al-Rashid",
  "Giovanni Bianchi",
  "Ingrid Larsson",
  "Pierre Dubois",
  "Kenji Nakamura",
]

export const COMPANIES = [
  "Maritime Solutions Ltd",
  "Global Shipping Partners",
  "Atlantic Brokers Inc",
  "Asia Pacific Shipping",
  "Mediterranean Maritime",
  "Nordic Shipping Solutions",
  "Caribbean Maritime Group",
  "Indian Ocean Shipping",
  "Pacific Trade Services",
  "European Vessel Agency",
  "American Bulk Carriers",
  "International Maritime Co",
  "Oceanic Trading House",
  "Continental Shipping Ltd",
  "Eastern Maritime Group",
  "Western Bulk Solutions",
  "Northern Shipping Co",
  "Southern Cross Maritime",
  "Central Pacific Lines",
  "Global Ocean Services",
  "Baltic Shipping Agency",
  "Adriatic Maritime Services",
  "Aegean Shipping Solutions",
  "Caspian Sea Trading",
  "Red Sea Maritime",
  "Persian Gulf Shipping",
  "Arabian Maritime Group",
  "Indian Subcontinent Shipping",
  "Southeast Asian Maritime",
  "Far East Shipping Solutions",
  "Australasian Maritime Services",
  "Pacific Rim Trading",
]

// Generate realistic vessel data with better variety and match scores
export function getRandomOffer(): Offer {
  const vesselCategory = VESSEL_CATEGORIES[Math.floor(Math.random() * VESSEL_CATEGORIES.length)]
  const vesselName = VESSEL_NAMES[Math.floor(Math.random() * VESSEL_NAMES.length)]
  const flag = FLAGS[Math.floor(Math.random() * FLAGS.length)]
  const cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
  const tradeLane = TRADE_LANES[Math.floor(Math.random() * TRADE_LANES.length)]

  // Get realistic DWT based on vessel category
  const getDWTRange = (category: string) => {
    switch (category) {
      case "Small Handy":
        return [15, 28]
      case "Handysize":
        return [28, 40]
      case "Supramax":
        return [50, 60]
      case "Ultramax":
        return [60, 65]
      case "Panamax":
        return [65, 80]
      case "Kamsarmax":
        return [80, 85]
      case "Post-Panamax":
        return [85, 120]
      case "Capesize":
        return [120, 210]
      case "VLOC":
        return [210, 300]
      default:
        return [50, 80]
    }
  }

  const [minDWT, maxDWT] = getDWTRange(vesselCategory)
  const vesselSize = Math.floor(Math.random() * (maxDWT - minDWT) + minDWT)
  const vesselAge = Math.floor(Math.random() * 20) + 3

  // Get realistic ports based on trade lane
  const getPortsFromTradeLane = (lane: string) => {
    if (lane.includes("Brazil-China")) return ["Tubarao", "Qingdao"]
    if (lane.includes("Australia-China")) return ["Port Hedland", "Qingdao"]
    if (lane.includes("US Gulf-China")) return ["New Orleans", "Shanghai"]
    if (lane.includes("Black Sea-")) return ["Constanta", "Iskenderun"]
    if (lane.includes("Indonesia-")) return ["Samarinda", "Visakhapatnam"]
    return ["Santos", "Rotterdam"]
  }

  const [loadPort, dischargePort] = getPortsFromTradeLane(tradeLane)

  // Generate realistic rates based on vessel size and route with more variation
  const getBaseRate = (size: number, route: string) => {
    if (route.includes("China")) {
      if (size > 100) return 15 + Math.random() * 10 // Capesize
      if (size > 60) return 18 + Math.random() * 12 // Panamax/Kamsarmax
      return 20 + Math.random() * 15 // Supramax/Handysize
    }
    return 12 + Math.random() * 8
  }

  const baseRate = getBaseRate(vesselSize, tradeLane)
  const freightRate = Math.round(baseRate * 100) / 100

  // Generate laycan dates (next 30-60 days) with more spread
  const laycanStart = new Date()
  laycanStart.setDate(laycanStart.getDate() + Math.floor(Math.random() * 60) + 5)
  const laycanEnd = new Date(laycanStart)
  laycanEnd.setDate(laycanEnd.getDate() + Math.floor(Math.random() * 10) + 3)

  // Generate IMO number (7 digits starting with 9)
  const imo = `9${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`

  const isGeared = Math.random() > 0.6
  const isIceClass = Math.random() > 0.9
  const isAustralianApproved = Math.random() > 0.7

  // Generate varying match scores for more realistic broker experience
  const generateMatchScore = () => {
    const rand = Math.random()
    if (rand < 0.1) return Math.floor(Math.random() * 20) + 95 // 10% excellent matches (95-100)
    if (rand < 0.3) return Math.floor(Math.random() * 15) + 80 // 20% good matches (80-94)
    if (rand < 0.6) return Math.floor(Math.random() * 20) + 60 // 30% decent matches (60-79)
    if (rand < 0.85) return Math.floor(Math.random() * 20) + 40 // 25% poor matches (40-59)
    return Math.floor(Math.random() * 20) + 20 // 15% very poor matches (20-39)
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    vesselName,
    vesselType: vesselCategory,
    vesselSize,
    vesselAge,
    vesselFlag: flag,
    imo,
    loadPort,
    dischargePort,
    laycanStart,
    laycanEnd,
    freightRate,
    rateUnit: "k/day",
    cargoType,
    cargoQuantity: Math.floor(vesselSize * 1000 * (0.85 + Math.random() * 0.1)),
    cargoUnit: "MT",
    charterer: CHARTERERS[Math.floor(Math.random() * CHARTERERS.length)],
    status: ["available", "pending", "on_subs"][Math.floor(Math.random() * 3)] as any,
    vesselCategory,
    contractType: "voyage" as any,
    tradeLane,
    marketSegment: cargoType.includes("Iron Ore") || cargoType.includes("Coal") ? "Major Bulks" : "Minor Bulks",

    // Enhanced vessel data
    openPort: loadPort,
    openDates: `${laycanStart.getDate()}-${laycanEnd.getDate()} ${laycanStart.toLocaleDateString("en", { month: "short" })}`,
    lastCargo: CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)],
    ballast: Math.random() > 0.5,
    laden: Math.random() > 0.5,
    commission: [1.25, 2.5, 3.75, 5.0][Math.floor(Math.random() * 4)],
    brokerName: BROKER_NAMES[Math.floor(Math.random() * BROKER_NAMES.length)],
    company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
    phoneNumber: `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
    email: `broker${Math.floor(Math.random() * 100)}@maritime-services.com`,

    // Operational details
    gearType: isGeared ? "geared" : "gearless",
    cranes: isGeared ? `4 x ${Math.floor(Math.random() * 20) + 15}MT` : undefined,
    holds: Math.floor(Math.random() * 3) + 5,
    hatchCovers: ["Steel", "MacGregor", "Pontoon"][Math.floor(Math.random() * 3)],
    grainFitted: Math.random() > 0.6,
    iceClass: isIceClass ? ["1A", "1B", "1C"][Math.floor(Math.random() * 3)] : undefined,
    australianApproved: isAustralianApproved,
    vetting: ["approved", "pending", "not_required"][Math.floor(Math.random() * 3)] as any,

    // Commercial details
    demurrage: Math.floor(freightRate * 1000 * 0.8),
    despatch: Math.floor(freightRate * 1000 * 0.4),
    loadRate: Math.floor(Math.random() * 10000) + 8000,
    dischargeRate: Math.floor(Math.random() * 15000) + 10000,
    laydays: Math.floor(Math.random() * 5) + 3,

    // Market data
    bdiComparison: Math.floor(Math.random() * 40) - 20,
    competitiveRate: freightRate + (Math.random() - 0.5) * 2,
    marketPosition: ["firm", "soft", "steady", "rising"][Math.floor(Math.random() * 4)] as any,

    // Technical details
    manager: SHIP_MANAGERS[Math.floor(Math.random() * SHIP_MANAGERS.length)],
    owner: OWNERS[Math.floor(Math.random() * OWNERS.length)],
    pi: PI_CLUBS[Math.floor(Math.random() * PI_CLUBS.length)],
    classification: CLASS_SOCIETIES[Math.floor(Math.random() * CLASS_SOCIETIES.length)],

    // Financial
    dailyRunningCost: Math.floor(Math.random() * 2000) + 4000,
    tcEquivalent: Math.floor(freightRate * 1000 * 0.85),

    // Subjects and terms
    subjects:
      Math.random() > 0.5
        ? ["Stem/Details", "Charterer's Approval", Math.random() > 0.5 ? "Vessel Inspection" : "Port Approval"].filter(
            Boolean,
          )
        : [],

    terms: Math.random() > 0.7 ? "As per NYPE form" : "As per Gencon form",

    // Metadata with realistic match scoring
    score: generateMatchScore() / 100,
    confidenceScore: Math.random() * 0.3 + 0.7,
    priority: ["urgent", "firm", "indication", "low"][Math.floor(Math.random() * 4)] as any,
    category: ["New Inquiries", "Firm Offers", "Under Negotiation", "On Subjects"][Math.floor(Math.random() * 4)],
    lastUpdated: new Date(),

    // Tags based on vessel characteristics
    tags: [
      isGeared ? "Geared" : "Gearless",
      isIceClass ? "Ice Class" : null,
      isAustralianApproved ? "Australian Approved" : null,
      Math.random() > 0.8 ? "Eco Vessel" : null,
      Math.random() > 0.7 ? "Scrubber Fitted" : null,
      Math.random() > 0.9 ? "Prompt" : null,
    ].filter(Boolean) as string[],
  }
}

// Generate realistic client data
export function getRandomClient(): Client {
  const companies = [
    "Cargill International",
    "Bunge Trading",
    "Louis Dreyfus Company",
    "ADM Trading",
    "COFCO International",
    "Viterra Inc",
    "Glencore Agriculture",
    "Trafigura Pte Ltd",
    "Mercuria Energy Trading",
    "Gunvor Group",
    "Olam International",
    "Wilmar Trading",
    "Noble Resources",
    "Marubeni Corporation",
    "Mitsui & Co",
    "Mitsubishi Corporation",
    "Vale Trading",
    "Rio Tinto Marketing",
    "BHP Billiton Marketing",
    "Fortescue Metals",
    "Oldendorff Carriers",
    "Norden A/S",
    "Pacific Basin Shipping",
    "Golden Ocean Group",
  ]

  const firstName = ["John", "Mike", "David", "Chris", "Alex", "Tom", "James", "Robert", "Paul", "Mark"][
    Math.floor(Math.random() * 10)
  ]
  const lastName = [
    "Smith",
    "Johnson",
    "Brown",
    "Davis",
    "Wilson",
    "Miller",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
  ][Math.floor(Math.random() * 10)]
  const company = companies[Math.floor(Math.random() * companies.length)]

  return {
    id: Math.random().toString(36).substring(2, 9),
    name: `${firstName} ${lastName}`,
    company,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "")}.com`,
    phone: `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    status: ["active", "inactive", "prospect"][Math.floor(Math.random() * 3)] as any,
    clientType: ["charterer", "owner", "operator", "trader"][Math.floor(Math.random() * 4)] as any,
    creditRating: ["A", "B", "C"][Math.floor(Math.random() * 3)] as any,
    paymentTerms: ["30 days", "45 days", "60 days", "LC at sight"][Math.floor(Math.random() * 4)],
    relationship: ["excellent", "good", "fair"][Math.floor(Math.random() * 3)] as any,
    preferredPorts: [
      MAJOR_PORTS.China[Math.floor(Math.random() * MAJOR_PORTS.China.length)],
      MAJOR_PORTS.Europe[Math.floor(Math.random() * MAJOR_PORTS.Europe.length)],
    ],
    typicalCargoes: [
      CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)],
      CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)],
    ],
    averageVolume: Math.floor(Math.random() * 500000) + 100000,
    notes: "Regular client with good payment history. Prefers modern tonnage.",
  }
}

// Generate realistic client requests
export function getRandomClientRequest(clientId: string): ClientRequest {
  const cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
  const tradeLane = TRADE_LANES[Math.floor(Math.random() * TRADE_LANES.length)]
  const [loadPort, dischargePort] = tradeLane.split("-").map((p) =>
    p
      .trim()
      .replace(/$$[^)]*$$/g, "")
      .trim(),
  )

  const laycanStart = new Date()
  laycanStart.setDate(laycanStart.getDate() + Math.floor(Math.random() * 45) + 5)
  const laycanEnd = new Date(laycanStart)
  laycanEnd.setDate(laycanEnd.getDate() + Math.floor(Math.random() * 10) + 5)

  const vesselSize = [35, 55, 75, 180][Math.floor(Math.random() * 4)]
  const targetRate = Math.floor((15 + Math.random() * 15) * 100) / 100

  return {
    id: Math.random().toString(36).substring(2, 9),
    clientId,
    date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
    emailSubject: `Vessel Requirement - ${cargoType} ${loadPort} to ${dischargePort}`,
    emailContent: `Dear Broker,

We are looking for a suitable vessel for the following cargo:

Cargo: ${cargoType}
Quantity: ${Math.floor(vesselSize * 1000 * 0.9).toLocaleString()} MT
Loading: ${loadPort}
Discharging: ${dischargePort}
Laycan: ${laycanStart.getDate()}-${laycanEnd.getDate()} ${laycanStart.toLocaleDateString("en", { month: "long" })}
Vessel Size: ${vesselSize}k DWT +/- 10%
Max Age: ${Math.floor(Math.random() * 10) + 10} years
Rate Idea: USD ${targetRate}k per day

Please advise suitable tonnage.

Best regards,
${["John", "Mike", "David", "Chris"][Math.floor(Math.random() * 4)]}`,

    extractedData: {
      vesselType: vesselSize > 100 ? "Capesize" : vesselSize > 60 ? "Panamax" : "Supramax",
      vesselSize: vesselSize * 1000,
      loadPort,
      dischargePort,
      laycanStart,
      laycanEnd,
      targetRate,
      cargoType,
      cargoQuantity: Math.floor(vesselSize * 1000 * 0.9),
      maxAge: Math.floor(Math.random() * 10) + 10,
      urgency: ["urgent", "normal", "low"][Math.floor(Math.random() * 3)] as any,
      businessType: ["spot", "period", "coa"][Math.floor(Math.random() * 3)] as any,
      commission: [1.25, 2.5, 3.75][Math.floor(Math.random() * 3)],
      subjects: ["Stem/Details", "Charterer's Approval"],
      confidenceScores: {
        vesselType: 0.9,
        vesselSize: 0.85,
        ports: 0.95,
        laycan: 0.8,
        rate: 0.7,
      },
    },

    status: ["new", "processing", "quoted", "negotiating"][Math.floor(Math.random() * 4)] as any,
    priority: ["urgent", "firm", "indication", "low"][Math.floor(Math.random() * 4)] as any,
    responseDeadline: new Date(Date.now() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
    internalNotes: "Good client, quick decision maker. Prefers modern tonnage.",
  }
}

// Generate market intelligence data
export function getRandomMarketData(): MarketData {
  const routes = Object.values(BDI_ROUTES)
  const route = routes[Math.floor(Math.random() * routes.length)]

  return {
    route: route.route,
    vesselSize: route.size,
    cargo: route.cargo,
    rate: Math.floor((10 + Math.random() * 20) * 100) / 100,
    rateUnit: "k/day",
    date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
    charterer: CHARTERERS[Math.floor(Math.random() * CHARTERERS.length)],
    vessel: VESSEL_NAMES[Math.floor(Math.random() * VESSEL_NAMES.length)],
    source: ["fixture", "indication", "rumor"][Math.floor(Math.random() * 3)] as any,
    confidence: Math.random() * 0.4 + 0.6,
  }
}

// Export sample data for specific vessel categories
export function getRandomOfferForCategory(category: string): Offer {
  const offer = getRandomOffer()
  offer.vesselCategory = category
  offer.vesselType = category

  // Adjust DWT based on category
  const dwtRanges: Record<string, [number, number]> = {
    "Small Handy": [15, 28],
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

  const [minDWT, maxDWT] = dwtRanges[category] || [50, 80]
  offer.vesselSize = Math.floor(Math.random() * (maxDWT - minDWT) + minDWT)

  // Adjust cargo and routes based on vessel size
  if (offer.vesselSize > 100) {
    offer.cargoType = ["Iron Ore", "Coal"][Math.floor(Math.random() * 2)]
    offer.tradeLane = ["Brazil-China (Iron Ore)", "Australia-China (Coal)", "Australia-China (Iron Ore)"][
      Math.floor(Math.random() * 3)
    ]
  } else if (offer.vesselSize > 60) {
    offer.cargoType = ["Grain", "Coal", "Fertilizer"][Math.floor(Math.random() * 3)]
    offer.tradeLane = ["US Gulf-China (Grain)", "Black Sea-China (Grain)", "Indonesia-India (Coal)"][
      Math.floor(Math.random() * 3)
    ]
  } else {
    offer.cargoType = ["Grain", "Steel Products", "Fertilizer", "Sugar"][Math.floor(Math.random() * 4)]
    offer.tradeLane = ["US Gulf-Europe (Grain)", "Black Sea-Mediterranean (Grain)", "Intra-Asia"][
      Math.floor(Math.random() * 3)
    ]
  }

  return offer
}

// Reduce from 150 to 50 vessels for better initial performance
export const MOCK_OFFERS: Offer[] = Array.from({ length: 50 }, () => getRandomOffer())
export function generateAdditionalOffers(count = 50): Offer[] {
  return Array.from({ length: count }, () => getRandomOffer())
}
export const MOCK_CLIENTS: Client[] = Array.from({ length: 20 }, () => getRandomClient())
export const MOCK_MARKET_DATA: MarketData[] = Array.from({ length: 100 }, () => getRandomMarketData())

// Add client requests to clients
MOCK_CLIENTS.forEach((client) => {
  client.requests = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => getRandomClientRequest(client.id))
})
