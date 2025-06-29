import type { ClientRequest, Offer } from "./types"
import { MOCK_OFFERS } from "./mock-data"

// Cache for expensive operations to improve performance
const matchingCache = new Map<string, Offer[]>()

/**
 * Finds matching offers for a client request
 * @param request Client request to match
 * @param allOffers Array of all available offers
 * @returns Array of matching offers
 */
export function findMatchingOffers(request: ClientRequest, allOffers: Offer[] = MOCK_OFFERS): Offer[] {
  // Generate cache key
  const cacheKey = `${request.id}-${allOffers.length}`

  // Return cached result if available
  if (matchingCache.has(cacheKey)) {
    return [...matchingCache.get(cacheKey)!] // Return a copy to prevent mutations
  }

  console.log("Finding matches for request:", request.id)
  console.log("Extracted data:", request.extractedData)
  console.log("Available offers:", allOffers.length)

  // Early return if no extracted data
  if (!request.extractedData) {
    return []
  }

  // Filter offers based on extracted requirements with improved matching
  const matchingOffers = allOffers.filter((offer) => {
    // Only consider available or pending offers
    if (offer.status !== "available" && offer.status !== "pending") {
      return false
    }

    // Calculate match score for this offer
    let matchScore = 0
    let maxScore = 0

    // Match vessel type
    if (request.extractedData.vesselType) {
      maxScore += 10

      const requestType = request.extractedData.vesselType.toLowerCase()
      const offerType = offer.vesselType.toLowerCase()

      // Exact match
      if (offerType === requestType) {
        matchScore += 10
      }
      // Partial match
      else if (offerType.includes(requestType) || requestType.includes(offerType)) {
        matchScore += 7
      }
      // Category match (e.g., "max" in "Supramax" matches "Handymax")
      else if (
        (offerType.includes("max") && requestType.includes("max")) ||
        (offerType.includes("size") && requestType.includes("size"))
      ) {
        matchScore += 5
      }
    }

    // Match vessel size with flexibility (±20%)
    if (request.extractedData.vesselSize) {
      maxScore += 15

      const requestSize = request.extractedData.vesselSize
      const offerSize = offer.vesselSize * 1000

      // Exact match (within 5%)
      if (offerSize >= requestSize * 0.95 && offerSize <= requestSize * 1.05) {
        matchScore += 15
      }
      // Close match (within 10%)
      else if (offerSize >= requestSize * 0.9 && offerSize <= requestSize * 1.1) {
        matchScore += 12
      }
      // Acceptable match (within 20%)
      else if (offerSize >= requestSize * 0.8 && offerSize <= requestSize * 1.2) {
        matchScore += 8
      }
      // Reject if size is too far off
      else {
        return false
      }
    }

    // Match ports
    if (request.extractedData.loadPort) {
      maxScore += 10

      const requestPort = request.extractedData.loadPort.toLowerCase()
      const offerPort = offer.loadPort.toLowerCase()

      // Exact match
      if (offerPort === requestPort) {
        matchScore += 10
      }
      // Partial match
      else if (offerPort.includes(requestPort) || requestPort.includes(offerPort)) {
        matchScore += 7
      }
      // Region match
      else {
        const offerRegion = getRegionForPort(offer.loadPort)
        const requestRegion = getRegionForPort(request.extractedData.loadPort)
        if (offerRegion && requestRegion && offerRegion === requestRegion) {
          matchScore += 5
        }
      }
    }

    if (request.extractedData.dischargePort) {
      maxScore += 10

      const requestPort = request.extractedData.dischargePort.toLowerCase()
      const offerPort = offer.dischargePort.toLowerCase()

      // Exact match
      if (offerPort === requestPort) {
        matchScore += 10
      }
      // Partial match
      else if (offerPort.includes(requestPort) || requestPort.includes(offerPort)) {
        matchScore += 7
      }
      // Region match
      else {
        const offerRegion = getRegionForPort(offer.dischargePort)
        const requestRegion = getRegionForPort(request.extractedData.dischargePort)
        if (offerRegion && requestRegion && offerRegion === requestRegion) {
          matchScore += 5
        }
      }
    }

    // Match laycan with flexibility
    if (request.extractedData.laycanStart && request.extractedData.laycanEnd) {
      maxScore += 15

      const requestStart = new Date(request.extractedData.laycanStart)
      const requestEnd = new Date(request.extractedData.laycanEnd)
      const offerStart = new Date(offer.laycanStart)
      const offerEnd = new Date(offer.laycanEnd)

      // Add buffer days to the laycan period
      const bufferDays = 5
      const extendedRequestStart = new Date(requestStart)
      extendedRequestStart.setDate(extendedRequestStart.getDate() - bufferDays)

      const extendedRequestEnd = new Date(requestEnd)
      extendedRequestEnd.setDate(extendedRequestEnd.getDate() + bufferDays)

      // Perfect overlap
      if (offerStart >= requestStart && offerEnd <= requestEnd) {
        matchScore += 15
      }
      // Partial overlap
      else if (!(offerEnd < requestStart || offerStart > requestEnd)) {
        matchScore += 12
      }
      // Extended overlap
      else if (!(offerEnd < extendedRequestStart || offerStart > extendedRequestEnd)) {
        matchScore += 8
      }
      // Reject if dates are too far apart
      else {
        return false
      }
    }

    // Match rate with flexibility (±15%)
    if (request.extractedData.targetRate) {
      maxScore += 15

      const requestRate = request.extractedData.targetRate

      // Exact match (within 5%)
      if (offer.freightRate >= requestRate * 0.95 && offer.freightRate <= requestRate * 1.05) {
        matchScore += 15
      }
      // Close match (within 10%)
      else if (offer.freightRate >= requestRate * 0.9 && offer.freightRate <= requestRate * 1.1) {
        matchScore += 12
      }
      // Acceptable match (within 15%)
      else if (offer.freightRate >= requestRate * 0.85 && offer.freightRate <= requestRate * 1.15) {
        matchScore += 8
      }
      // Reject if rate is too far off
      else {
        return false
      }
    }

    // Match max age
    if (request.extractedData.maxAge) {
      maxScore += 10

      const requestMaxAge = request.extractedData.maxAge
      const offerAge = new Date().getFullYear() - offer.buildYear

      // Exact match
      if (offerAge <= requestMaxAge) {
        matchScore += 10
      }
      // Close match
      else if (offerAge <= requestMaxAge + 2) {
        matchScore += 7
      }
      // Acceptable match
      else if (offerAge <= requestMaxAge + 5) {
        matchScore += 5
      }
      // Reject if age is too old
      else {
        return false
      }
    }

    // Match gear requirement
    if (request.extractedData.gearRequirement) {
      maxScore += 10

      const requestGear = request.extractedData.gearRequirement.toLowerCase()
      const offerGear = offer.gearRequirement.toLowerCase()

      // Exact match
      if (offerGear === requestGear) {
        matchScore += 10
      }
      // Reject if gear requirement does not match
      else {
        return false
      }
    }

    // Match ice class requirement
    if (request.extractedData.iceClassRequirement) {
      maxScore += 10

      const requestIceClass = request.extractedData.iceClassRequirement.toLowerCase()
      const offerIceClass = offer.iceClassRequirement.toLowerCase()

      // Exact match
      if (offerIceClass === requestIceClass) {
        matchScore += 10
      }
      // Reject if ice class requirement does not match
      else {
        return false
      }
    }

    // Match flag preference
    if (request.extractedData.flagPreference) {
      maxScore += 10

      const requestFlag = request.extractedData.flagPreference.toLowerCase()
      const offerFlag = offer.flagPreference.toLowerCase()

      // Exact match
      if (offerFlag === requestFlag) {
        matchScore += 10
      }
      // Reject if flag preference does not match
      else {
        return false
      }
    }

    // Match special clauses
    if (request.extractedData.specialClauses) {
      maxScore += 10

      const requestClauses = request.extractedData.specialClauses.toLowerCase()
      const offerClauses = offer.specialClauses.toLowerCase()

      // Exact match
      if (offerClauses === requestClauses) {
        matchScore += 10
      }
      // Reject if special clauses do not match
      else {
        return false
      }
    }

    // Match charterer preference
    if (request.extractedData.chartererPreference) {
      maxScore += 10

      const requestCharterer = request.extractedData.chartererPreference.toLowerCase()
      const offerCharterer = offer.chartererPreference.toLowerCase()

      // Exact match
      if (offerCharterer === requestCharterer) {
        matchScore += 10
      }
      // Reject if charterer preference does not match
      else {
        return false
      }
    }

    // Match cargo quantity
    if (request.extractedData.cargoQuantity) {
      maxScore += 15

      const requestCargoQuantity = request.extractedData.cargoQuantity
      const offerCargoQuantity = offer.cargoQuantity

      // Exact match (within 5%)
      if (offerCargoQuantity >= requestCargoQuantity * 0.95 && offerCargoQuantity <= requestCargoQuantity * 1.05) {
        matchScore += 15
      }
      // Close match (within 10%)
      else if (offerCargoQuantity >= requestCargoQuantity * 0.9 && offerCargoQuantity <= requestCargoQuantity * 1.1) {
        matchScore += 12
      }
      // Acceptable match (within 15%)
      else if (offerCargoQuantity >= requestCargoQuantity * 0.85 && offerCargoQuantity <= requestCargoQuantity * 1.15) {
        matchScore += 8
      }
      // Reject if cargo quantity is too far off
      else {
        return false
      }
    }

    // Match cargo type
    if (request.extractedData.cargoType) {
      maxScore += 10

      const requestCargoType = request.extractedData.cargoType.toLowerCase()
      const offerCargoType = offer.cargoType.toLowerCase()

      // Exact match
      if (offerCargoType === requestCargoType) {
        matchScore += 10
      }
      // Partial match
      else if (offerCargoType.includes(requestCargoType) || requestCargoType.includes(offerCargoType)) {
        matchScore += 7
      }
      // Category match
      else if (
        (offerCargoType.includes("max") && requestCargoType.includes("max")) ||
        (offerCargoType.includes("size") && requestCargoType.includes("size"))
      ) {
        matchScore += 5
      }
    }

    // Calculate match percentage
    const matchPercentage = maxScore > 0 ? (matchScore / maxScore) * 100 : 0

    // Add score to the offer (will be used by the UI)
    offer.score = matchPercentage / 100

    // Only include offers with at least 60% match
    return matchPercentage >= 60
  })

  console.log(`Found ${matchingOffers.length} matching offers for request ${request.id}`)
  if (matchingOffers.length === 0) {
    console.log("No matches found. Check matching criteria.")
  }

  // Sort by best match (closest to target rate, if specified)
  if (request.extractedData.targetRate) {
    matchingOffers.sort((a, b) => {
      const aDiff = Math.abs(a.freightRate - request.extractedData.targetRate!)
      const bDiff = Math.abs(b.freightRate - request.extractedData.targetRate!)
      return aDiff - bDiff
    })
  }

  // Cache the result
  matchingCache.set(cacheKey, [...matchingOffers])

  // Clear cache if it gets too large
  if (matchingCache.size > 50) {
    const oldestKey = matchingCache.keys().next().value
    matchingCache.delete(oldestKey)
  }

  // Return all matches (up to 3)
  return matchingOffers.slice(0, 3)
}

/**
 * Helper function to get region for a port
 * @param port Port name
 * @returns Region name or null
 */
function getRegionForPort(port: string): string | null {
  // This would be implemented to look up the region for a given port
  // For now, return null as a placeholder
  return null
}

/**
 * Gets all matching offers for all requests
 * @param requests Array of client requests
 * @returns Record mapping request IDs to matching offers
 */
export function getAllMatchingOffers(requests: ClientRequest[]): Record<string, Offer[]> {
  const result: Record<string, Offer[]> = {}

  requests.forEach((request) => {
    result[request.id] = findMatchingOffers(request)
  })

  return result
}

/**
 * Extract vessel requirements from email content
 * Uses multiple patterns to extract different types of information
 */
export function extractVesselRequirements(emailContent: string): ClientRequest["extractedData"] {
  // Extract vessel type with multiple patterns
  const vesselType = extractWithPatterns(emailContent, [
    /(Handysize|Handymax|Supramax|Ultramax|Panamax|Kamsarmax|Post-Panamax|Capesize|VLOC)/i,
    /(?:looking|need|require|want).*?(Handysize|Handymax|Supramax|Ultramax|Panamax|Kamsarmax|Post-Panamax|Capesize|VLOC)/i,
    /vessel.*?(?:type|size).*?(Handysize|Handymax|Supramax|Ultramax|Panamax|Kamsarmax|Post-Panamax|Capesize|VLOC)/i,
  ])

  // Extract vessel size with multiple patterns
  let vesselSize
  const sizeMatch = extractWithPatterns(emailContent, [
    /(\d{2,3})k DWT/i,
    /(\d{2,3})k\s+(?:deadweight|dwt)/i,
    /(\d{2,3})[,\s]000\s+(?:deadweight|dwt|tons)/i,
    /(?:size|capacity).*?(\d{2,3})k/i,
  ])

  if (sizeMatch) {
    vesselSize = Number(sizeMatch) * 1000
  }

  // Extract ports with multiple patterns
  let loadPort, dischargePort
  const routeMatch = extractWithPatterns(
    emailContent,
    [
      /([\w\s]+)\s+(?:to|→)\s+([\w\s]+)/i,
      /(?:from|loading)\s+([\w\s]+)(?:\s+to|\s+discharging\s+at)\s+([\w\s]+)/i,
      /(?:route|voyage).*?([\w\s]+)(?:\s+to|\s*-\s*|\s*\/\s*)([\w\s]+)/i,
    ],
    true,
  )

  if (routeMatch && Array.isArray(routeMatch) && routeMatch.length >= 2) {
    loadPort = routeMatch[0].trim()
    dischargePort = routeMatch[1].trim()
  }

  // Fix the issue with date parsing in extractVesselRequirements
  // Extract laycan with multiple patterns
  let laycanStart, laycanEnd
  let laycanMonth = "June" // Default

  const laycanMatch = extractWithPatterns(
    emailContent,
    [
      /[Ll]aycan\s+(?:[Jj]une|[Jj]uly)\s+(\d{1,2})(?:-|\s+to\s+)(\d{1,2})/i,
      /(?:dates|period).*?(\d{1,2})(?:st|nd|rd|th)?(?:-|\s+to\s+)(\d{1,2})(?:st|nd|rd|th)?\s+(?:[Jj]une|[Jj]uly)/i,
      /(?:[Jj]une|[Jj]uly)\s+(\d{1,2})(?:st|nd|rd|th)?(?:-|\s+to\s+)(\d{1,2})(?:st|nd|rd|th)?/i,
    ],
    true,
  )

  if (laycanMatch && Array.isArray(laycanMatch) && laycanMatch.length >= 2) {
    // Extract month from the match if possible
    const monthMatch = emailContent.match(
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)/i,
    )
    if (monthMatch) {
      laycanMonth = monthMatch[0]
    }

    try {
      // Assuming the year is current year + 1 for future dates
      const currentYear = new Date().getFullYear()
      const monthIndex = getMonthIndex(laycanMonth)

      // Parse start and end dates, ensuring they're valid
      const startDay = Number.parseInt(laycanMatch[0], 10)
      const endDay = Number.parseInt(laycanMatch[1], 10)

      if (!isNaN(startDay) && !isNaN(endDay) && monthIndex >= 0) {
        laycanStart = new Date(currentYear, monthIndex, startDay)
        laycanEnd = new Date(currentYear, monthIndex, endDay)

        // If the dates are in the past, assume next year
        if (laycanStart < new Date()) {
          laycanStart = new Date(currentYear + 1, monthIndex, startDay)
          laycanEnd = new Date(currentYear + 1, monthIndex, endDay)
        }
      }
    } catch (error) {
      console.error("Error parsing laycan dates:", error)
      // Keep laycanStart and laycanEnd as undefined if parsing fails
    }
  }

  // Extract rate with multiple patterns
  let targetRate
  const rateMatch = extractWithPatterns(emailContent, [
    /\$?(\d{1,2}(?:\.\d{1,2})?)k\/day/i,
    /(?:rate|budget|price).*?\$?(\d{1,2}(?:\.\d{1,2})?)[k\s](?:\/day|per day)/i,
    /(\d{1,2}(?:\.\d{1,2})?)k\s+(?:USD|dollars)(?:\s+per|\s*\/\s*)day/i,
  ])

  if (rateMatch) {
    targetRate = Number(rateMatch)
  }

  // Extract advanced requirements
  const {
    maxAge,
    buildYear,
    gearRequirement,
    iceClassRequirement,
    flagPreference,
    specialClauses,
    chartererPreference,
    cargoQuantity,
    cargoType,
  } = extractAdvancedRequirements(emailContent)

  // Create confidence scores for each extraction
  const confidenceScores = {
    vesselType: vesselType ? 0.85 : 0,
    vesselSize: vesselSize ? 0.9 : 0,
    loadPort: loadPort ? 0.8 : 0,
    dischargePort: dischargePort ? 0.8 : 0,
    laycan: laycanStart && laycanEnd ? 0.75 : 0,
    targetRate: targetRate ? 0.7 : 0,
    maxAge: maxAge ? 0.65 : 0,
    gearRequirement: gearRequirement ? 0.8 : 0,
    iceClassRequirement: iceClassRequirement ? 0.9 : 0,
    flagPreference: flagPreference ? 0.7 : 0,
    specialClauses: specialClauses ? 0.6 : 0,
    chartererPreference: chartererPreference ? 0.75 : 0,
    cargoQuantity: cargoQuantity ? 0.85 : 0,
    cargoType: cargoType ? 0.8 : 0,
  }

  return {
    vesselType,
    vesselSize,
    loadPort,
    dischargePort,
    laycanStart,
    laycanEnd,
    targetRate,
    // Advanced requirements
    maxAge,
    buildYear,
    gearRequirement,
    iceClassRequirement,
    flagPreference,
    specialClauses,
    chartererPreference,
    cargoQuantity,
    cargoType,
    // Add confidence scores
    confidenceScores,
  }
}

/**
 * Extract advanced vessel requirements from email content
 */
function extractAdvancedRequirements(emailContent: string) {
  // Extract vessel age restrictions
  let maxAge = null
  let buildYear = null
  const ageMatch = extractWithPatterns(emailContent, [
    /(?:vessel|ship)\s+(?:age|built).*?(?:max|maximum|up to|under|below|not older than)\s+(\d{1,2})\s+(?:years|yrs)/i,
    /(?:max|maximum|up to|under|below|not older than)\s+(\d{1,2})\s+(?:years|yrs)(?:\s+old)?/i,
    /(?:built|constructed)\s+(?:after|from|since)\s+(\d{4})/i,
  ])

  if (ageMatch) {
    if (ageMatch.length === 4) {
      // It's a year
      buildYear = Number(ageMatch)
      maxAge = new Date().getFullYear() - buildYear
    } else {
      maxAge = Number(ageMatch)
      buildYear = new Date().getFullYear() - maxAge
    }
  }

  // Extract gear requirements
  const gearMatch = extractWithPatterns(emailContent, [
    /(?:vessel|ship).*?(?:must be|should be|needs to be|required to be)\s+(geared|gearless)/i,
    /(?:looking for|need|require|want).*?(geared|gearless)\s+(?:vessel|ship)/i,
    /(?:with|having)\s+(?:own\s+)?(cranes|gears|grabs)/i,
    /(?:cranes|gears|grabs).*?(?:required|needed|must|should)/i,
  ])

  let gearRequirement = null
  if (gearMatch) {
    const matchLower = gearMatch.toLowerCase()
    if (
      matchLower === "geared" ||
      matchLower.includes("crane") ||
      matchLower.includes("gear") ||
      matchLower.includes("grab")
    ) {
      gearRequirement = "geared"
    } else if (matchLower === "gearless") {
      gearRequirement = "gearless"
    }
  }

  // Extract ice class requirements
  const iceClassMatch = extractWithPatterns(emailContent, [
    /(?:ice class|ice-class|ice classed).*?(?:required|needed|must|should)/i,
    /(?:vessel|ship).*?(?:must be|should be|needs to be|required to be)\s+(?:ice class|ice-class|ice classed)/i,
    /(?:ice class|ice-class)\s+(1A|1B|1C|1D|1A Super)/i,
  ])

  const iceClassRequirement = iceClassMatch ? iceClassMatch : null

  // Extract flag preferences
  const flagMatch = extractWithPatterns(emailContent, [
    /(?:flag|registry).*?(?:must be|should be|needs to be|required to be)\s+([\w\s]+)(?:,|\.|$)/i,
    /(?:vessel|ship).*?(?:flagged|registered).*?([\w\s]+)(?:,|\.|$)/i,
  ])

  const flagPreference = flagMatch ? flagMatch.trim() : null

  // Extract special clauses or restrictions
  const specialClauseMatch = extractWithPatterns(emailContent, [
    /(?:special\s+clauses?|special\s+requirements?|restrictions?).*?(?::|include|are|is)\s+([\w\s,]+)(?:\.|\n|$)/i,
    /(?:subject to|conditional upon)\s+([\w\s,]+)(?:\.|\n|$)/i,
  ])

  const specialClauses = specialClauseMatch ? specialClauseMatch.trim() : null

  // Extract charterer preferences
  const chartererMatch = extractWithPatterns(emailContent, [
    /(?:charterer|client).*?(?:must be|should be|prefers|wants)\s+([\w\s]+)(?:,|\.|$)/i,
    /(?:only|exclusively)\s+for\s+([\w\s]+)(?:,|\.|$)/i,
  ])

  const chartererPreference = chartererMatch ? chartererMatch.trim() : null

  // Extract cargo quantity
  let cargoQuantity = null
  const cargoQuantityMatch = extractWithPatterns(emailContent, [
    /(?:cargo|quantity|amount).*?(\d{2,3}(?:,\d{3})?(?:\.\d+)?)\s*(?:k\s*)?(?:mt|tons?|tonnes)/i,
    /(\d{2,3}(?:,\d{3})?(?:\.\d+)?)\s*(?:k\s*)?(?:mt|tons?|tonnes).*?(?:of|cargo|quantity)/i,
  ])

  if (cargoQuantityMatch) {
    const cleanedMatch = cargoQuantityMatch.replace(/,/g, "")
    if (cargoQuantityMatch.toLowerCase().includes("k")) {
      cargoQuantity = Number(cleanedMatch) * 1000
    } else {
      cargoQuantity = Number(cleanedMatch)
    }
  }

  // Extract cargo type
  const cargoTypeMatch = extractWithPatterns(emailContent, [
    /(?:cargo|commodity).*?(?:is|of|:)\s+([\w\s]+)(?:,|\.|$)/i,
    /(?:carrying|transporting|shipping)\s+([\w\s]+)(?:cargo|commodity)?(?:,|\.|$)/i,
  ])

  const cargoType = cargoTypeMatch ? cargoTypeMatch.trim() : null

  return {
    maxAge,
    buildYear,
    gearRequirement,
    iceClassRequirement,
    flagPreference,
    specialClauses,
    chartererPreference,
    cargoQuantity,
    cargoType,
  }
}

/**
 * Helper function to extract data using multiple regex patterns
 * @param text Text to search in
 * @param patterns Array of regex patterns to try
 * @param returnGroups Whether to return all capture groups
 * @returns Extracted value or null
 */
function extractWithPatterns(text: string, patterns: RegExp[], returnGroups = false): string | string[] | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      if (returnGroups) {
        return match.slice(1) // Return all capture groups
      }
      return match[1] // Return first capture group
    }
  }
  return null
}

/**
 * Helper function to get month index from month name
 * @param monthName Month name
 * @returns Month index (0-11)
 */
function getMonthIndex(monthName: string): number {
  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  }

  const normalizedMonth = monthName.toLowerCase()

  // Direct match
  if (months[normalizedMonth] !== undefined) {
    return months[normalizedMonth]
  }

  // Fuzzy match
  for (const [month, index] of Object.entries(months)) {
    if (normalizedMonth.includes(month) || month.includes(normalizedMonth)) {
      return index
    }
  }

  // Default to current month
  return new Date().getMonth()
}
