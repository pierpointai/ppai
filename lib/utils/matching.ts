import type { BaseVessel, BaseOrder, MatchResult } from "@/lib/types/common"

const MATCH_WEIGHTS = {
  vesselType: 0.25,
  vesselSize: 0.2,
  route: 0.2,
  laycan: 0.15,
  rate: 0.2,
} as const

export function calculateMatch(vessel: BaseVessel, order: BaseOrder): MatchResult {
  const scores = {
    vesselType: matchVesselType(vessel, order),
    vesselSize: matchVesselSize(vessel, order),
    route: matchRoute(vessel, order),
    laycan: matchLaycan(vessel, order),
    rate: matchRate(vessel, order),
  }

  const matchScore = Object.entries(scores).reduce((total, [key, score]) => {
    return total + score.value * MATCH_WEIGHTS[key as keyof typeof MATCH_WEIGHTS]
  }, 0)

  const reasons = Object.values(scores)
    .map((s) => s.reason)
    .filter(Boolean)
  const warnings = Object.values(scores)
    .map((s) => s.warning)
    .filter(Boolean)

  return {
    vessel,
    order,
    matchScore: Math.round(matchScore),
    reasons,
    warnings,
  }
}

function matchVesselType(vessel: BaseVessel, order: BaseOrder) {
  if (!vessel.vesselType || !order.cargoType) {
    return { value: 50, reason: "Type compatibility needs verification" }
  }

  const isMatch = vessel.vesselType.toLowerCase().includes(order.cargoType.toLowerCase())
  return {
    value: isMatch ? 100 : 30,
    reason: isMatch ? "Perfect vessel type match" : "Vessel type mismatch",
  }
}

function matchVesselSize(vessel: BaseVessel, order: BaseOrder) {
  if (!order.cargoQuantity) {
    return { value: 50, reason: "Size verification needed" }
  }

  const vesselCapacity = vessel.vesselSize * 1000
  const cargoSize = order.cargoQuantity
  const ratio = cargoSize / vesselCapacity

  if (ratio >= 0.8 && ratio <= 1.0) {
    return { value: 100, reason: "Perfect size match" }
  } else if (ratio >= 0.6 && ratio <= 1.2) {
    return { value: 70, reason: "Good size match" }
  } else {
    return { value: 30, reason: "Size mismatch", warning: "Cargo size not optimal for vessel" }
  }
}

function matchRoute(vessel: BaseVessel, order: BaseOrder) {
  const loadMatch = vessel.loadPort.toLowerCase().includes(order.loadPort.toLowerCase())
  const dischargeMatch = vessel.dischargePort.toLowerCase().includes(order.dischargePort.toLowerCase())

  if (loadMatch && dischargeMatch) {
    return { value: 100, reason: "Perfect route match" }
  } else if (loadMatch || dischargeMatch) {
    return { value: 60, reason: "Partial route match" }
  } else {
    return { value: 20, reason: "Route mismatch", warning: "Different trade route" }
  }
}

function matchLaycan(vessel: BaseVessel, order: BaseOrder) {
  const vesselStart = vessel.laycanStart
  const orderStart = new Date(order.laycanStart)
  const daysDiff = Math.abs((vesselStart.getTime() - orderStart.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 3) {
    return { value: 100, reason: "Perfect laycan match" }
  } else if (daysDiff <= 7) {
    return { value: 70, reason: "Good laycan proximity" }
  } else {
    return { value: 30, reason: "Laycan mismatch", warning: `${Math.round(daysDiff)} days difference` }
  }
}

function matchRate(vessel: BaseVessel, order: BaseOrder) {
  // Simplified rate matching - in real app would have budget data
  return { value: 70, reason: "Rate within market range" }
}
