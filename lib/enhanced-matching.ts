// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065 // Earth's radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Port coordinates database (major dry bulk ports)
export const PORT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // China
  Qingdao: { lat: 36.0986, lng: 120.3719 },
  Rizhao: { lat: 35.4164, lng: 119.4611 },
  Dalian: { lat: 38.914, lng: 121.6147 },
  Tianjin: { lat: 39.1422, lng: 117.1767 },
  Shanghai: { lat: 31.2304, lng: 121.4737 },
  Ningbo: { lat: 29.8683, lng: 121.544 },
  Zhoushan: { lat: 30.0164, lng: 122.2072 },
  Guangzhou: { lat: 23.1291, lng: 113.2644 },

  // Japan
  Kashima: { lat: 35.9667, lng: 140.65 },
  Chiba: { lat: 35.6074, lng: 140.1065 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Nagoya: { lat: 35.1815, lng: 136.9066 },
  Osaka: { lat: 34.6937, lng: 135.5023 },
  Kobe: { lat: 34.6901, lng: 135.1956 },

  // Korea
  Pohang: { lat: 36.019, lng: 129.3435 },
  Gwangyang: { lat: 34.9406, lng: 127.7011 },
  Busan: { lat: 35.1796, lng: 129.0756 },
  Incheon: { lat: 37.4563, lng: 126.7052 },

  // Australia
  "Port Hedland": { lat: -20.31, lng: 118.5717 },
  Dampier: { lat: -20.6617, lng: 116.7106 },
  Newcastle: { lat: -32.9283, lng: 151.7817 },
  "Port Kembla": { lat: -34.4775, lng: 150.9025 },
  Brisbane: { lat: -27.4698, lng: 153.0251 },
  Gladstone: { lat: -23.8393, lng: 151.2578 },
  "Hay Point": { lat: -21.2833, lng: 149.3 },

  // Brazil
  Tubarao: { lat: -20.2976, lng: -40.2958 },
  "Ponta da Madeira": { lat: -2.5297, lng: -44.3028 },
  Itaqui: { lat: -2.5833, lng: -44.3667 },
  Santos: { lat: -23.9608, lng: -46.3331 },
  Paranagua: { lat: -25.5163, lng: -48.5081 },
  "Rio Grande": { lat: -32.035, lng: -52.0986 },

  // US Gulf
  "New Orleans": { lat: 29.9511, lng: -90.0715 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  Galveston: { lat: 29.3013, lng: -94.7977 },
  Mobile: { lat: 30.6954, lng: -88.0399 },

  // US East Coast
  Norfolk: { lat: 36.8468, lng: -76.2852 },
  Baltimore: { lat: 39.2904, lng: -76.6122 },
  Philadelphia: { lat: 39.9526, lng: -75.1652 },
  "New York": { lat: 40.7128, lng: -74.006 },

  // Europe
  Rotterdam: { lat: 51.9244, lng: 4.4777 },
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Antwerp: { lat: 51.2194, lng: 4.4025 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Bremen: { lat: 53.0793, lng: 8.8017 },

  // Southeast Asia
  Singapore: { lat: 1.3521, lng: 103.8198 },
  "Port Klang": { lat: 3.0044, lng: 101.3997 },
  Jakarta: { lat: -6.2088, lng: 106.8456 },
  Surabaya: { lat: -7.2575, lng: 112.7521 },

  // India
  Paradip: { lat: 20.2648, lng: 86.6947 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Kandla: { lat: 23.0333, lng: 70.2167 },

  // Black Sea
  Constanta: { lat: 44.1598, lng: 28.6348 },
  Odessa: { lat: 46.4825, lng: 30.7233 },
  Novorossiysk: { lat: 44.723, lng: 37.7686 },

  // South Africa
  Durban: { lat: -29.8587, lng: 31.0218 },
  "Richards Bay": { lat: -28.7831, lng: 32.0378 },
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  Saldanha: { lat: -33.0117, lng: 17.9442 },
}

// Get coordinates for a port (with fuzzy matching)
export function getPortCoordinates(portName: string): { lat: number; lng: number } | null {
  if (!portName || typeof portName !== "string") {
    return null
  }

  // Direct match
  if (PORT_COORDINATES[portName]) {
    return PORT_COORDINATES[portName]
  }

  // Fuzzy matching - find port that contains the search term
  const normalizedSearch = portName.toLowerCase().trim()

  // First try exact substring matches
  for (const [port, coords] of Object.entries(PORT_COORDINATES)) {
    if (port.toLowerCase().includes(normalizedSearch) || normalizedSearch.includes(port.toLowerCase())) {
      return coords
    }
  }

  // Then try word-by-word matching for complex port names
  const searchWords = normalizedSearch.split(/\s+/)
  for (const [port, coords] of Object.entries(PORT_COORDINATES)) {
    const portWords = port.toLowerCase().split(/\s+/)
    // If any word matches between the port names, consider it a match
    if (searchWords.some((word) => portWords.some((portWord) => portWord.includes(word) || word.includes(portWord)))) {
      return coords
    }
  }

  return null
}

// Calculate vessel proximity to load port
export function calculateVesselProximity(vesselPort: string, loadPort: string): number | null {
  if (!vesselPort || !loadPort) {
    return null
  }

  const vesselCoords = getPortCoordinates(vesselPort)
  const loadCoords = getPortCoordinates(loadPort)

  if (!vesselCoords || !loadCoords) {
    return null
  }

  return calculateDistance(vesselCoords.lat, vesselCoords.lng, loadCoords.lat, loadCoords.lng)
}

// Check if vessel is within proximity radius
export function isVesselInProximity(vesselPort: string, loadPort: string, radiusNM: number): boolean {
  const distance = calculateVesselProximity(vesselPort, loadPort)
  return distance !== null && distance <= radiusNM
}

// Get proximity score (0-100, higher is better)
export function getProximityScore(vesselPort: string, loadPort: string, maxDistanceNM = 500): number {
  // Exact port match gets 100
  if (vesselPort.toLowerCase().trim() === loadPort.toLowerCase().trim()) {
    return 100
  }

  const distance = calculateVesselProximity(vesselPort, loadPort)

  if (distance === null) {
    return 50 // Unknown distance gets neutral score
  }

  if (distance === 0) {
    return 100 // Same port
  }

  if (distance > maxDistanceNM) {
    return 0 // Too far
  }

  // Linear scoring: closer = higher score
  return Math.max(0, Math.round(100 - (distance / maxDistanceNM) * 100))
}

import type { Offer, EnhancedRankingWeights } from "./types"

// Enhanced ranking function that considers multiple factors
export function enhancedRankOffers(
  offers: Offer[],
  weights: EnhancedRankingWeights,
  clientRequirements?: {
    preferredPorts?: string[]
    maxVesselAge?: number
    minVesselSize?: number
    maxVesselSize?: number
    preferredCharterers?: string[]
    targetLaycan?: Date
    budgetRange?: { min: number; max: number }
  },
): Offer[] {
  return offers
    .map((offer) => {
      let score = 0
      let maxScore = 0

      // Vessel size scoring
      if (clientRequirements?.minVesselSize || clientRequirements?.maxVesselSize) {
        const min = clientRequirements.minVesselSize || 0
        const max = clientRequirements.maxVesselSize || 400
        if (offer.vesselSize >= min && offer.vesselSize <= max) {
          score += weights.vesselSize * 100
        } else {
          // Partial score based on how close it is
          const distance = Math.min(Math.abs(offer.vesselSize - min), Math.abs(offer.vesselSize - max))
          score += weights.vesselSize * Math.max(0, 100 - distance * 2)
        }
      } else {
        score += weights.vesselSize * 50 // Neutral score
      }
      maxScore += weights.vesselSize * 100

      // Laycan scoring
      if (clientRequirements?.targetLaycan && offer.laycanStart) {
        const daysDiff = Math.abs(
          (clientRequirements.targetLaycan.getTime() - offer.laycanStart.getTime()) / (1000 * 60 * 60 * 24),
        )
        const laycanScore = Math.max(0, 100 - daysDiff * 2) // 2 points per day difference
        score += weights.laycan * laycanScore
      } else {
        score += weights.laycan * 50 // Neutral score
      }
      maxScore += weights.laycan * 100

      // Freight rate scoring (lower is better for charterers)
      if (clientRequirements?.budgetRange) {
        const { min, max } = clientRequirements.budgetRange
        if (offer.freightRate >= min && offer.freightRate <= max) {
          score += weights.freightRate * 100
        } else if (offer.freightRate < min) {
          score += weights.freightRate * 100 // Below budget is good
        } else {
          // Above budget - score decreases with distance
          const excess = ((offer.freightRate - max) / max) * 100
          score += weights.freightRate * Math.max(0, 100 - excess)
        }
      } else {
        score += weights.freightRate * 50 // Neutral score
      }
      maxScore += weights.freightRate * 100

      // Region/port proximity scoring
      if (clientRequirements?.preferredPorts && offer.loadPort) {
        const isPreferredPort = clientRequirements.preferredPorts.some(
          (port) =>
            port.toLowerCase().includes(offer.loadPort!.toLowerCase()) ||
            offer.loadPort!.toLowerCase().includes(port.toLowerCase()),
        )
        score += weights.region * (isPreferredPort ? 100 : 20)
      } else {
        score += weights.region * 50 // Neutral score
      }
      maxScore += weights.region * 100

      // Vessel age scoring
      if (clientRequirements?.maxVesselAge && offer.vesselAge) {
        if (offer.vesselAge <= clientRequirements.maxVesselAge) {
          score += weights.vesselAge * 100
        } else {
          const ageExcess = offer.vesselAge - clientRequirements.maxVesselAge
          score += weights.vesselAge * Math.max(0, 100 - ageExcess * 10)
        }
      } else {
        score += weights.vesselAge * 50 // Neutral score
      }
      maxScore += weights.vesselAge * 100

      // Charterer reputation scoring
      if (clientRequirements?.preferredCharterers && offer.charterer) {
        const isPreferredCharterer = clientRequirements.preferredCharterers.includes(offer.charterer)
        score += weights.chartererReputation * (isPreferredCharterer ? 100 : 50)
      } else {
        score += weights.chartererReputation * 50 // Neutral score
      }
      maxScore += weights.chartererReputation * 100

      // Additional factors with neutral scoring for now
      score += weights.cargoType * 50
      score += weights.portEfficiency * 50
      score += weights.historicalPerformance * 50
      score += weights.marketTrend * 50
      score += weights.geographicProximity * 50

      maxScore += weights.cargoType * 100
      maxScore += weights.portEfficiency * 100
      maxScore += weights.historicalPerformance * 100
      maxScore += weights.marketTrend * 100
      maxScore += weights.geographicProximity * 100

      // Calculate final score as percentage
      const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 50

      return {
        ...offer,
        score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
      }
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
}
