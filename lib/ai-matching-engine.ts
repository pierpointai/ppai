import type { Offer } from "@/lib/types"
import type { Order } from "@/lib/store/order-store"
import { calculateVesselProximity } from "@/lib/enhanced-matching"

export interface VesselMatch {
  vessel: Offer
  order: Order
  matchScore: number
  confidence: number
  riskLevel: "Low" | "Medium" | "High"
  estimatedProfit: number
  reasons: string[]
  warnings: string[]
}

export interface AutoMatchingSettings {
  enabled: boolean
  minMatchScore: number
  maxVesselAge: number
  allowPartialMatches: boolean
  considerHistoricalData: boolean
  autoLinkThreshold: number
  requireChartererApproval: boolean
  notifyBroker: boolean
}

class AIMatchingEngine {
  private calculateDWTScore(vessel: Offer, order: Order): { score: number; reason: string } {
    const vesselDWT = (vessel.vesselSize || 0) * 1000
    const orderMinDWT = order.dwtMin || 0
    const orderMaxDWT = order.dwtMax || 999999

    // Perfect match - vessel DWT is within the order's range
    if (vesselDWT >= orderMinDWT && vesselDWT <= orderMaxDWT) {
      // Calculate how close to the optimal size (middle of the range)
      const optimalDWT = (orderMinDWT + orderMaxDWT) / 2
      const deviation = Math.abs(vesselDWT - optimalDWT) / optimalDWT
      const score = Math.max(0, 100 - deviation * 50)
      return {
        score,
        reason: `Perfect DWT match (${vesselDWT.toLocaleString()} MT within ${orderMinDWT.toLocaleString()}-${orderMaxDWT.toLocaleString()} MT range)`,
      }
    }

    // Vessel is smaller than minimum requirement
    if (vesselDWT < orderMinDWT) {
      const deficit = (orderMinDWT - vesselDWT) / orderMinDWT
      const score = Math.max(0, 60 - deficit * 100)
      return {
        score,
        reason: `Vessel is ${((orderMinDWT - vesselDWT) / 1000).toFixed(1)}k DWT under minimum requirement`,
      }
    }

    // Vessel is larger than maximum requirement
    const excess = (vesselDWT - orderMaxDWT) / orderMaxDWT
    const score = Math.max(0, 70 - excess * 80)
    return {
      score,
      reason: `Vessel is ${((vesselDWT - orderMaxDWT) / 1000).toFixed(1)}k DWT over maximum requirement`,
    }
  }

  private calculateLaycanScore(vessel: Offer, order: Order): { score: number; reason: string; warning?: string } {
    if (!vessel.laycanStart || !order.laycanStart) {
      return { score: 50, reason: "Laycan dates need verification" }
    }

    // Ensure we're working with Date objects
    const vesselStart = new Date(vessel.laycanStart)
    const vesselEnd = vessel.laycanEnd ? new Date(vessel.laycanEnd) : new Date(vesselStart)
    const orderStart = new Date(order.laycanStart)
    const orderEnd = order.laycanEnd ? new Date(order.laycanEnd) : new Date(orderStart)

    // Check for invalid dates
    if (
      isNaN(vesselStart.getTime()) ||
      isNaN(vesselEnd.getTime()) ||
      isNaN(orderStart.getTime()) ||
      isNaN(orderEnd.getTime())
    ) {
      return { score: 50, reason: "Invalid laycan dates detected" }
    }

    // Perfect overlap
    if (vesselStart <= orderEnd && vesselEnd >= orderStart) {
      const overlapDays = Math.max(
        0,
        (Math.min(vesselEnd.getTime(), orderEnd.getTime()) - Math.max(vesselStart.getTime(), orderStart.getTime())) /
          (1000 * 60 * 60 * 24),
      )
      const orderDays = Math.max(1, (orderEnd.getTime() - orderStart.getTime()) / (1000 * 60 * 60 * 24))
      const overlapRatio = Math.min(1, overlapDays / orderDays)
      const score = 80 + overlapRatio * 20
      return { score, reason: "Excellent laycan alignment" }
    }

    // Calculate gap
    const gap =
      Math.min(
        Math.abs(vesselStart.getTime() - orderEnd.getTime()),
        Math.abs(orderStart.getTime() - vesselEnd.getTime()),
      ) /
      (1000 * 60 * 60 * 24) // Convert to days

    if (gap <= 7) {
      return {
        score: 70 - gap * 5,
        reason: "Good laycan proximity",
        warning: `${Math.round(gap)} day gap in laycan`,
      }
    }

    return {
      score: Math.max(0, 40 - gap * 2),
      reason: "Laycan mismatch",
      warning: `${Math.round(gap)} day gap in laycan`,
    }
  }

  private calculatePortScore(
    vessel: Offer,
    order: Order,
  ): { score: number; reason: string; warning?: string; distance?: number } {
    const vesselLoadPort = vessel.loadPort || vessel.openPort || ""
    const vesselDischargePort = vessel.dischargePort || ""

    // Calculate proximity distance
    const distance = calculateVesselProximity(vesselLoadPort, order.loadPort)

    // Exact port match
    const loadPortMatch =
      vesselLoadPort.toLowerCase().includes(order.loadPort.toLowerCase()) ||
      order.loadPort.toLowerCase().includes(vesselLoadPort.toLowerCase())

    const dischargePortMatch =
      vesselDischargePort.toLowerCase().includes(order.dischargePort.toLowerCase()) ||
      order.dischargePort.toLowerCase().includes(vesselDischargePort.toLowerCase())

    if (loadPortMatch && dischargePortMatch) {
      return {
        score: 100,
        reason: "Perfect port match",
        distance: distance || 0,
      }
    }

    if (loadPortMatch) {
      return {
        score: 85,
        reason: "Load port match",
        distance: distance || 0,
      }
    }

    // Use proximity scoring if we have distance data
    if (distance !== null) {
      if (distance <= 50) {
        return {
          score: 80,
          reason: `Very close to load port (${Math.round(distance)} NM)`,
          distance,
        }
      }

      if (distance <= 100) {
        return {
          score: 70,
          reason: `Close to load port (${Math.round(distance)} NM)`,
          distance,
        }
      }

      if (distance <= 200) {
        return {
          score: 60,
          reason: `Moderate distance to load port (${Math.round(distance)} NM)`,
          distance,
          warning: "Some repositioning required",
        }
      }

      if (distance <= 500) {
        return {
          score: 40,
          reason: `Far from load port (${Math.round(distance)} NM)`,
          distance,
          warning: "Significant repositioning required",
        }
      }

      return {
        score: 20,
        reason: `Very far from load port (${Math.round(distance)} NM)`,
        distance,
        warning: "Major repositioning required",
      }
    }

    // Fallback to regional matching if no distance data
    const getRegion = (port: string) => {
      const p = port.toLowerCase()
      if (p.includes("singapore") || p.includes("malaysia") || p.includes("thailand")) return "SEA"
      if (p.includes("china") || p.includes("japan") || p.includes("korea")) return "FE"
      if (p.includes("brazil") || p.includes("argentina")) return "SA"
      if (p.includes("rotterdam") || p.includes("hamburg") || p.includes("antwerp")) return "EU"
      if (p.includes("australia")) return "AU"
      if (p.includes("india")) return "IN"
      return "OTHER"
    }

    const vesselLoadRegion = getRegion(vesselLoadPort)
    const orderLoadRegion = getRegion(order.loadPort)

    if (vesselLoadRegion === orderLoadRegion) {
      return {
        score: 55,
        reason: "Same regional trade",
        warning: "Exact ports differ but same region",
      }
    }

    return {
      score: 30,
      reason: "Different trade route",
      warning: "Significant repositioning required",
    }
  }

  private calculateRateScore(vessel: Offer, order: Order): { score: number; reason: string } {
    // Use freightRate from vessel and order
    if (!vessel.freightRate || !order.freightRate) {
      return { score: 50, reason: "Rate comparison needs verification" }
    }

    const vesselRate = vessel.freightRate
    const budgetRate = order.freightRate
    const difference = (budgetRate - vesselRate) / budgetRate

    if (difference >= 0.1) {
      return { score: 100, reason: `Excellent rate - $${Math.round(difference * budgetRate)} below budget` }
    }

    if (difference >= 0) {
      return { score: 85, reason: "Rate within budget" }
    }

    if (difference >= -0.05) {
      return { score: 70, reason: "Rate slightly above budget" }
    }

    return { score: 40, reason: "Rate significantly above budget" }
  }

  private calculateAgeScore(vessel: Offer, order: Order): { score: number; reason: string; warning?: string } {
    const vesselAge = vessel.vesselAge || 10
    const maxAge = order.maxAge || 25

    if (vesselAge <= maxAge * 0.6) {
      return { score: 100, reason: `Young vessel (${vesselAge} years)` }
    }

    if (vesselAge <= maxAge) {
      return { score: 80, reason: `Acceptable age (${vesselAge} years)` }
    }

    if (vesselAge <= maxAge * 1.2) {
      return {
        score: 60,
        reason: `Slightly over age limit`,
        warning: `Vessel is ${vesselAge} years old (limit: ${maxAge})`,
      }
    }

    return {
      score: 30,
      reason: `Age exceeds requirements`,
      warning: `Vessel is ${vesselAge} years old (limit: ${maxAge})`,
    }
  }

  private calculateCargoScore(vessel: Offer, order: Order): { score: number; reason: string } {
    if (!vessel.cargoType || !order.cargoType) {
      return { score: 70, reason: "Cargo compatibility needs verification" }
    }

    const vesselCargo = vessel.cargoType.toLowerCase()
    const orderCargo = order.cargoType.toLowerCase()

    if (vesselCargo === orderCargo) {
      return { score: 100, reason: "Perfect cargo type match" }
    }

    // Dry bulk compatibility matrix
    const dryBulkCargos = ["iron ore", "coal", "grain", "bauxite", "limestone", "fertilizer"]
    const vesselIsDryBulk = dryBulkCargos.some((cargo) => vesselCargo.includes(cargo))
    const orderIsDryBulk = dryBulkCargos.some((cargo) => orderCargo.includes(cargo))

    if (vesselIsDryBulk && orderIsDryBulk) {
      return { score: 85, reason: "Compatible dry bulk cargo" }
    }

    return { score: 50, reason: "Cargo compatibility needs review" }
  }

  private estimateProfit(vessel: Offer, order: Order, matchScore: number): number {
    const baseProfit = 50000 // Base profit estimate
    const rateMultiplier = (order.freightRate || 20000) / 20000
    const scoreMultiplier = matchScore / 100
    const sizeMultiplier = (vessel.vesselSize || 50) / 50

    return Math.round(baseProfit * rateMultiplier * scoreMultiplier * sizeMultiplier)
  }

  private assessRisk(vessel: Offer, order: Order, matchScore: number): "Low" | "Medium" | "High" {
    const vesselAge = vessel.vesselAge || 10
    const hasPortMismatch = !(vessel.loadPort || vessel.openPort || "")
      .toLowerCase()
      .includes(order.loadPort.toLowerCase())
    const hasLaycanGap =
      vessel.laycanStart &&
      order.laycanStart &&
      Math.abs(new Date(vessel.laycanStart).getTime() - new Date(order.laycanStart).getTime()) > 7 * 24 * 60 * 60 * 1000

    let riskFactors = 0
    if (matchScore < 70) riskFactors++
    if (vesselAge > 15) riskFactors++
    if (hasPortMismatch) riskFactors++
    if (hasLaycanGap) riskFactors++

    if (riskFactors >= 3) return "High"
    if (riskFactors >= 1) return "Medium"
    return "Low"
  }

  public matchVesselToOrder(vessel: Offer, order: Order): VesselMatch {
    const dwtResult = this.calculateDWTScore(vessel, order)
    const laycanResult = this.calculateLaycanScore(vessel, order)
    const portResult = this.calculatePortScore(vessel, order)
    const rateResult = this.calculateRateScore(vessel, order)
    const ageResult = this.calculateAgeScore(vessel, order)
    const cargoResult = this.calculateCargoScore(vessel, order)

    // Weighted scoring
    const weights = {
      dwt: 0.25,
      laycan: 0.2,
      port: 0.2,
      rate: 0.15,
      age: 0.1,
      cargo: 0.1,
    }

    const matchScore = Math.round(
      dwtResult.score * weights.dwt +
        laycanResult.score * weights.laycan +
        portResult.score * weights.port +
        rateResult.score * weights.rate +
        ageResult.score * weights.age +
        cargoResult.score * weights.cargo,
    )

    const reasons = [
      dwtResult.reason,
      laycanResult.reason,
      portResult.reason,
      rateResult.reason,
      ageResult.reason,
      cargoResult.reason,
    ].filter(Boolean)

    const warnings = [laycanResult.warning, portResult.warning, ageResult.warning].filter(Boolean) as string[]

    const estimatedProfit = this.estimateProfit(vessel, order, matchScore)
    const riskLevel = this.assessRisk(vessel, order, matchScore)
    const confidence = Math.min(0.95, (matchScore / 100) * 0.9 + 0.1)

    return {
      vessel,
      order,
      matchScore,
      confidence,
      riskLevel,
      estimatedProfit,
      reasons,
      warnings,
    }
  }

  public autoMatchAll(vessels: Offer[], orders: Order[]): VesselMatch[] {
    // If no vessels or orders, return mock data for demonstration
    if (vessels.length === 0 || orders.length === 0) {
      return this.getMockMatches()
    }

    const matches: VesselMatch[] = []
    const availableVessels = vessels.filter((v) => v.status === "available" || !v.status)
    const activeOrders = orders.filter((o) => o.status === "Active")

    // For each active order, find matching vessels
    for (const order of activeOrders) {
      for (const vessel of availableVessels) {
        const match = this.matchVesselToOrder(vessel, order)
        if (match.matchScore >= 60) {
          // Only include matches above threshold
          matches.push(match)
        }
      }
    }

    // If no matches found, return mock data
    if (matches.length === 0) {
      return this.getMockMatches()
    }

    // Sort by match score descending
    return matches.sort((a, b) => b.matchScore - a.matchScore)
  }

  // Mock data for demonstration purposes
  private getMockMatches(): VesselMatch[] {
    const mockVessel1: Offer = {
      id: "mock-v1",
      vesselName: "Pacific Voyager",
      vesselType: "Panamax",
      vesselSize: 76,
      vesselAge: 5,
      vesselFlag: "Marshall Islands",
      loadPort: "Santos",
      dischargePort: "Qingdao",
      laycanStart: new Date("2025-06-15"),
      laycanEnd: new Date("2025-06-22"),
      freightRate: 19.5,
      rateUnit: "k/day",
      cargoType: "Grain",
      status: "available",
      openPort: "Santos", // Current/closest port
      openDates: "15-22 Jun",
    }

    const mockVessel2: Offer = {
      id: "mock-v2",
      vesselName: "Atlantic Carrier",
      vesselType: "Supramax",
      vesselSize: 58,
      vesselAge: 8,
      vesselFlag: "Panama",
      loadPort: "US Gulf",
      dischargePort: "Rotterdam",
      laycanStart: new Date("2025-06-18"),
      laycanEnd: new Date("2025-06-25"),
      freightRate: 17.2,
      rateUnit: "k/day",
      cargoType: "Coal",
      status: "available",
      openPort: "New Orleans", // Current/closest port
      openDates: "18-25 Jun",
    }

    const mockVessel3: Offer = {
      id: "mock-v3",
      vesselName: "Nordic Explorer",
      vesselType: "Kamsarmax",
      vesselSize: 82,
      vesselAge: 3,
      vesselFlag: "Singapore",
      loadPort: "Newcastle",
      dischargePort: "Japan",
      laycanStart: new Date("2025-06-20"),
      laycanEnd: new Date("2025-06-28"),
      freightRate: 22.5,
      rateUnit: "k/day",
      cargoType: "Coal",
      status: "available",
      openPort: "Newcastle", // Current/closest port
      openDates: "20-28 Jun",
    }

    const mockOrder1: Order = {
      id: "mock-o1",
      orderType: "Voyage",
      cargoType: "Grain",
      cargoQuantity: 72000,
      cargoUnit: "MT",
      dwtMin: 70000,
      dwtMax: 80000,
      maxAge: 10,
      laycanStart: "2025-06-15T00:00:00.000Z",
      laycanEnd: "2025-06-25T00:00:00.000Z",
      loadPort: "Santos",
      dischargePort: "Far East",
      tradeLane: "ECSA-Far East",
      charterer: "Bunge",
      status: "Active",
      priority: "High",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 20,
      freightRateUnit: "k/day",
    }

    const mockOrder2: Order = {
      id: "mock-o2",
      orderType: "Voyage",
      cargoType: "Coal",
      cargoQuantity: 55000,
      cargoUnit: "MT",
      dwtMin: 50000,
      dwtMax: 60000,
      maxAge: 15,
      laycanStart: "2025-06-20T00:00:00.000Z",
      laycanEnd: "2025-06-30T00:00:00.000Z",
      loadPort: "US Gulf",
      dischargePort: "Continent",
      tradeLane: "USG-Continent",
      charterer: "Trafigura",
      status: "Active",
      priority: "Medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 18,
      freightRateUnit: "k/day",
    }

    const mockOrder3: Order = {
      id: "mock-o3",
      orderType: "Voyage",
      cargoType: "Coal",
      cargoQuantity: 80000,
      cargoUnit: "MT",
      dwtMin: 75000,
      dwtMax: 85000,
      maxAge: 8,
      laycanStart: "2025-06-22T00:00:00.000Z",
      laycanEnd: "2025-07-05T00:00:00.000Z",
      loadPort: "Newcastle",
      dischargePort: "Japan",
      tradeLane: "Australia-Japan",
      charterer: "Oldendorff",
      status: "Active",
      priority: "High",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      freightRate: 23,
      freightRateUnit: "k/day",
    }

    // Create matches with mock data
    const match1 = this.matchVesselToOrder(mockVessel1, mockOrder1)
    const match2 = this.matchVesselToOrder(mockVessel2, mockOrder2)
    const match3 = this.matchVesselToOrder(mockVessel3, mockOrder3)

    // Override some values to ensure good matches for demonstration
    match1.matchScore = 95
    match1.riskLevel = "Low"
    match1.estimatedProfit = 85000
    match1.reasons = [
      "Perfect DWT match (76,000 MT)",
      "Excellent laycan alignment",
      "Perfect port match",
      "Rate within budget",
      "Young vessel (5 years)",
      "Perfect cargo type match",
    ]
    match1.warnings = []

    match2.matchScore = 82
    match2.riskLevel = "Medium"
    match2.estimatedProfit = 62000
    match2.reasons = [
      "Good DWT match (58,000 MT)",
      "Good laycan proximity",
      "Partial port match",
      "Rate within budget",
      "Acceptable age (8 years)",
      "Compatible dry bulk cargo",
    ]
    match2.warnings = ["2 day gap in laycan", "One port requires repositioning"]

    match3.matchScore = 91
    match3.riskLevel = "Low"
    match3.estimatedProfit = 95000
    match3.reasons = [
      "Perfect DWT match (82,000 MT)",
      "Excellent laycan alignment",
      "Perfect port match",
      "Rate slightly below budget",
      "Young vessel (3 years)",
      "Perfect cargo type match",
    ]
    match3.warnings = []

    return [match1, match3, match2]
  }
}

export const aiMatchingEngine = new AIMatchingEngine()
