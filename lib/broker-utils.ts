import type { Offer } from "./types"

// Real bunker prices by region (updated daily in real systems)
export const BUNKER_PRICES = {
  Singapore: { VLSFO: 580, MGO: 720 },
  Rotterdam: { VLSFO: 575, MGO: 715 },
  Fujairah: { VLSFO: 585, MGO: 725 },
  Houston: { VLSFO: 590, MGO: 730 },
  Gibraltar: { VLSFO: 570, MGO: 710 },
  Piraeus: { VLSFO: 575, MGO: 715 },
  Default: { VLSFO: 580, MGO: 720 },
}

// Port distances (nautical miles) - simplified matrix
export const PORT_DISTANCES = {
  "Singapore-Rotterdam": 8500,
  "Singapore-Houston": 9800,
  "Rotterdam-Houston": 4800,
  "Tubarao-Qingdao": 11200,
  "Richards Bay-Rotterdam": 6800,
  "Newcastle-Qingdao": 4200,
  Default: 5000,
}

// Commission rates by client type
export const COMMISSION_RATES = {
  "Major Trader": 1.25,
  "Steel Mill": 3.75,
  Utility: 3.75,
  "Regional Trader": 2.5,
  Government: 5.0,
  Default: 2.5,
}

// Calculate realistic TCE
export function calculateTCE(vessel: Offer, voyage: VoyageDetails): TCECalculation {
  const dailyRate = vessel.freightRate || 0
  const voyageDays = voyage.totalDays
  const grossRevenue = dailyRate * voyageDays

  // Operating costs
  const dailyOpex = getVesselOpex(vessel.vesselSize || 0, vessel.vesselAge || 0)
  const totalOpex = dailyOpex * voyageDays

  // Bunker costs
  const bunkerCost = calculateBunkerCost(vessel, voyage)

  // Port costs
  const portCosts = calculatePortCosts(voyage)

  // Total voyage costs
  const totalCosts = totalOpex + bunkerCost + portCosts

  // Net result
  const netResult = grossRevenue - totalCosts
  const tceDaily = netResult / voyageDays

  return {
    grossRevenue,
    totalCosts,
    netResult,
    tceDaily,
    profitMargin: grossRevenue > 0 ? (netResult / grossRevenue) * 100 : 0,
    breakdown: {
      opex: totalOpex,
      bunkers: bunkerCost,
      ports: portCosts,
    },
  }
}

// Get vessel operating expenses
function getVesselOpex(dwt: number, age: number): number {
  let baseOpex = 6000 // Base daily opex

  // Size factor
  if (dwt > 180)
    baseOpex = 8500 // Capesize
  else if (dwt > 80)
    baseOpex = 7500 // Panamax
  else if (dwt > 60)
    baseOpex = 7000 // Supramax
  else if (dwt > 40) baseOpex = 6500 // Handymax

  // Age factor
  const ageFactor = 1 + age * 0.02 // 2% increase per year

  return Math.round(baseOpex * ageFactor)
}

// Calculate bunker consumption and costs
export function calculateBunkerCost(vessel: Offer, voyage: VoyageDetails): number {
  const vesselSize = vessel.vesselSize || 50

  // Consumption rates based on vessel size (MT/day)
  let ladenConsumption = 25
  let ballastConsumption = 22

  if (vesselSize > 180) {
    ladenConsumption = 45
    ballastConsumption = 40
  } else if (vesselSize > 80) {
    ladenConsumption = 35
    ballastConsumption = 30
  } else if (vesselSize > 60) {
    ladenConsumption = 30
    ballastConsumption = 25
  }

  const totalConsumption = ladenConsumption * voyage.ladenDays + ballastConsumption * voyage.ballastDays
  const bunkerPrice = BUNKER_PRICES["Default"].VLSFO

  return totalConsumption * bunkerPrice
}

// Calculate port costs
function calculatePortCosts(voyage: VoyageDetails): number {
  const loadPortCosts = 15000 // Typical load port costs
  const dischargePortCosts = 18000 // Typical discharge port costs
  const canalCosts = voyage.canalTransit ? 250000 : 0 // Panama/Suez

  return loadPortCosts + dischargePortCosts + canalCosts
}

// Calculate voyage details
export function calculateVoyageDetails(loadPort: string, dischargePort: string, vesselSpeed = 14): VoyageDetails {
  const routeKey = `${loadPort}-${dischargePort}`
  const distance = PORT_DISTANCES[routeKey] || PORT_DISTANCES["Default"]

  const seaDays = Math.ceil(distance / (vesselSpeed * 24))
  const portDays = 4 // 2 days each port
  const totalDays = seaDays + portDays

  // Assume 70% laden, 30% ballast for typical voyage
  const ladenDays = Math.ceil(seaDays * 0.7)
  const ballastDays = seaDays - ladenDays

  return {
    distance,
    seaDays,
    portDays,
    totalDays,
    ladenDays,
    ballastDays,
    canalTransit: distance > 8000, // Assume canal for long routes
  }
}

// Market position analysis
export function analyzeMarketPosition(vessel: Offer, marketRates: number[]): MarketPosition {
  const vesselRate = vessel.freightRate || 0
  const avgMarketRate = marketRates.reduce((a, b) => a + b, 0) / marketRates.length
  const deviation = ((vesselRate - avgMarketRate) / avgMarketRate) * 100

  let position: "strong" | "competitive" | "weak"
  if (deviation > 10) position = "strong"
  else if (deviation > -5) position = "competitive"
  else position = "weak"

  return {
    vesselRate,
    marketAverage: avgMarketRate,
    deviation,
    position,
    recommendation: getPositionRecommendation(position, deviation),
  }
}

function getPositionRecommendation(position: string, deviation: number): string {
  switch (position) {
    case "strong":
      return `Rate is ${Math.abs(deviation).toFixed(1)}% above market. Strong negotiating position.`
    case "competitive":
      return `Rate is competitive with market. Good positioning for quick fixture.`
    case "weak":
      return `Rate is ${Math.abs(deviation).toFixed(1)}% below market. Consider counter-offer.`
    default:
      return "Market position unclear."
  }
}

// Generate professional fixture recap
export function generateFixtureRecap(vessel: Offer, voyage: VoyageDetails, charterer = "[CHARTERER]"): string {
  const tce = calculateTCE(vessel, voyage)

  return `FIXTURE RECAP

VESSEL: ${vessel.vesselName?.toUpperCase()}
OWNERS: ${vessel.company}
CHARTERERS: ${charterer}
CARGO: [CARGO TYPE] [QUANTITY] MT
LOAD PORT: ${vessel.openPort}
DISCHARGE PORT: [DISCHARGE PORT]
LAYCAN: ${vessel.openDates}
RATE: USD ${vessel.freightRate?.toLocaleString()}/DAY
COMMISSION: ${COMMISSION_RATES["Default"]}%
TOTAL COMMISSION: USD ${(((vessel.freightRate || 0) * voyage.totalDays * COMMISSION_RATES["Default"]) / 100).toLocaleString()}

VOYAGE ECONOMICS:
- Gross Revenue: USD ${tce.grossRevenue.toLocaleString()}
- Total Costs: USD ${tce.totalCosts.toLocaleString()}
- Net Result: USD ${tce.netResult.toLocaleString()}
- TCE: USD ${tce.tceDaily.toLocaleString()}/DAY

SUBJECTS:
- Owners' approval
- Charterers' approval
- Vessel inspection
- Clean BL

BROKER: ${vessel.brokerName}
DATE: ${new Date().toLocaleDateString()}
TIME: ${new Date().toLocaleTimeString()}

This fixture is subject to details and mutual agreement.`
}

// Generate commercial offer email
export function generateCommercialOffer(vessel: Offer, clientName = "[CLIENT]"): string {
  const voyage = calculateVoyageDetails(vessel.openPort || "", "Discharge Port")
  const tce = calculateTCE(vessel, voyage)

  return `Subject: Commercial Offer - ${vessel.vesselName}

Dear ${clientName},

We are pleased to offer the following vessel for your consideration:

VESSEL PARTICULARS:
- Name: ${vessel.vesselName}
- Type: ${vessel.vesselType}
- DWT: ${vessel.vesselSize}k MT
- Built: ${new Date().getFullYear() - (vessel.vesselAge || 0)}
- Flag: ${vessel.vesselFlag}
- Classification: [CLASS]
- P&I: [P&I CLUB]

COMMERCIAL TERMS:
- Rate: USD ${vessel.freightRate?.toLocaleString()}/DAY
- Open: ${vessel.openPort}
- Laycan: ${vessel.openDates}
- Commission: ${COMMISSION_RATES["Default"]}%

TECHNICAL:
- Holds: [NUMBER] holds
- Cranes: [CRANE DETAILS]
- Grain fitted: [YES/NO]

ESTIMATED VOYAGE RESULT:
- TCE: USD ${tce.tceDaily.toLocaleString()}/DAY
- Profit Margin: ${tce.profitMargin.toFixed(1)}%

This offer is subject to:
- Owners' approval
- Vessel inspection
- Details to be mutually agreed

Please revert with your requirements.

Best regards,
${vessel.brokerName}
${vessel.company}
Tel: ${vessel.phoneNumber}
Email: ${vessel.email}`
}

// Generate WhatsApp message (common in shipping)
export function generateWhatsAppMessage(vessel: Offer): string {
  return `🚢 *${vessel.vesselName}*
${vessel.vesselType} ${vessel.vesselSize}k DWT
Built: ${new Date().getFullYear() - (vessel.vesselAge || 0)}
Open: ${vessel.openPort}
Rate: $${vessel.freightRate?.toLocaleString()}/day
Contact: ${vessel.brokerName}
${vessel.phoneNumber}`
}

// Types
export interface VoyageDetails {
  distance: number
  seaDays: number
  portDays: number
  totalDays: number
  ladenDays: number
  ballastDays: number
  canalTransit: boolean
}

export interface TCECalculation {
  grossRevenue: number
  totalCosts: number
  netResult: number
  tceDaily: number
  profitMargin: number
  breakdown: {
    opex: number
    bunkers: number
    ports: number
  }
}

export interface MarketPosition {
  vesselRate: number
  marketAverage: number
  deviation: number
  position: "strong" | "competitive" | "weak"
  recommendation: string
}
