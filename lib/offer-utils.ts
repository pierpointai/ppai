import type { Offer, FilterOptions } from "./types"

/**
 * Formats a date for display
 * @param date The date to format
 * @param includeYear Whether to include the year in the formatted date
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined, includeYear = false): string {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }

    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined,
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

/**
 * Formats a relative time (time ago) for display
 * @param date The date to format
 * @returns Formatted time ago string
 */
export function formatTimeAgo(date: Date): string {
  if (!date) return "N/A"

  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
  }

  return "just now"
}

/**
 * Determines vessel category based on vessel size
 * @param size Vessel size in DWT
 * @returns Vessel category string
 */
export function getVesselCategoryBySize(size: number): string {
  if (size <= 40) return "Handysize"
  if (size <= 60) return "Handymax/Supramax"
  if (size <= 75) return "Panamax"
  if (size <= 85) return "Kamsarmax"
  if (size <= 120) return "Post-Panamax"
  if (size <= 210) return "Capesize"
  return "VLOC"
}

/**
 * Gets the appropriate CSS class for a vessel category
 * @param category Vessel category
 * @returns CSS class string
 */
export function getVesselCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    Handysize: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Handymax/Supramax": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Panamax: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Kamsarmax: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    "Post-Panamax": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Capesize: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    VLOC: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  }

  return colorMap[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
}

/**
 * Gets the appropriate CSS class for a vessel age
 * @param age Vessel age in years
 * @returns CSS class string
 */
export function getAgeColor(age: number): string {
  if (age <= 5) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  if (age <= 10) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  if (age <= 15) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
}

/**
 * Filters offers based on specified criteria
 * @param offers Array of offers to filter
 * @param filters Filter criteria
 * @returns Filtered array of offers
 */
export function filterOffers(offers: Offer[], filters: FilterOptions): Offer[] {
  if (!filters || Object.keys(filters).length === 0) {
    return offers
  }

  return offers.filter((offer) => {
    // Simple string equality filters
    const stringFilters: Array<keyof FilterOptions> = [
      "vesselType",
      "vesselCategory",
      "cargoType",
      "status",
      "category",
      "priority",
      "contractType",
      "tradeLane",
      "marketSegment",
    ]

    for (const filter of stringFilters) {
      const filterValue = filters[filter]
      if (filterValue && offer[filter as keyof Offer] !== filterValue) {
        return false
      }
    }

    // String inclusion filters
    if (filters.loadPort && !offer.loadPort.includes(filters.loadPort)) {
      return false
    }

    if (filters.dischargePort && !offer.dischargePort.includes(filters.dischargePort)) {
      return false
    }

    // Date range filter
    if (filters.laycanStart && filters.laycanEnd) {
      const offerLaycanStart = new Date(offer.laycanStart)
      const offerLaycanEnd = new Date(offer.laycanEnd)
      const filterLaycanStart = new Date(filters.laycanStart)
      const filterLaycanEnd = new Date(filters.laycanEnd)

      // Check if there's any overlap between the date ranges
      if (offerLaycanEnd < filterLaycanStart || offerLaycanStart > filterLaycanEnd) {
        return false
      }
    }

    // Numeric range filters
    if (filters.minFreightRate && offer.freightRate < filters.minFreightRate) {
      return false
    }

    if (filters.maxFreightRate && offer.freightRate > filters.maxFreightRate) {
      return false
    }

    // If all filters pass, include the offer
    return true
  })
}

/**
 * Parses email content to extract offer details
 * @param email Email content string
 * @returns Offer object or null if parsing fails
 */
export function parseEmailToOffer(email: string): Offer | null {
  try {
    // Define regex patterns for extracting offer details
    const patterns = {
      vesselType: /(Handysize|Panamax|Supramax|Ultramax|Kamsarmax|Capesize)\s+(\d+k)/i,
      loadPort: /([A-Za-z\s]+)\s+(?:→|to|-)/i,
      dischargePort: /(?:→|to|-)\s+([A-Za-z\s]+)/i,
      laycan:
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+)[–-](\d+)/i,
      rate: /\$(\d+\.?\d*)k\/day/i,
    }

    // Extract data using patterns
    const vesselTypeMatch = email.match(patterns.vesselType)
    const loadPortMatch = email.match(patterns.loadPort)
    const dischargePortMatch = email.match(patterns.dischargePort)
    const laycanMatch = email.match(patterns.laycan)
    const rateMatch = email.match(patterns.rate)

    // Ensure all required data was extracted
    if (vesselTypeMatch && loadPortMatch && dischargePortMatch && laycanMatch && rateMatch) {
      const currentYear = new Date().getFullYear()
      const month = laycanMatch[1]
      const startDay = Number.parseInt(laycanMatch[2], 10)
      const endDay = Number.parseInt(laycanMatch[3], 10)

      // Create dates safely
      let laycanStart, laycanEnd
      try {
        laycanStart = new Date(`${month} ${startDay}, ${currentYear}`)
        laycanEnd = new Date(`${month} ${endDay}, ${currentYear}`)

        // If dates are in the past, assume next year
        if (laycanStart < new Date()) {
          laycanStart = new Date(`${month} ${startDay}, ${currentYear + 1}`)
          laycanEnd = new Date(`${month} ${endDay}, ${currentYear + 1}`)
        }

        // Validate dates
        if (isNaN(laycanStart.getTime()) || isNaN(laycanEnd.getTime())) {
          throw new Error("Invalid dates")
        }
      } catch (error) {
        console.error("Error parsing laycan dates:", error)
        // Use current date + some days as fallback
        laycanStart = new Date()
        laycanStart.setDate(laycanStart.getDate() + 7)
        laycanEnd = new Date(laycanStart)
        laycanEnd.setDate(laycanEnd.getDate() + 7)
      }

      return {
        id: Math.random().toString(36).substring(2, 9), // Generate a random ID
        vesselType: vesselTypeMatch[1],
        vesselSize: Number.parseInt(vesselTypeMatch[2], 10) || 0,
        loadPort: loadPortMatch[1].trim(),
        dischargePort: dischargePortMatch[1].trim(),
        laycanStart,
        laycanEnd,
        freightRate: Number.parseFloat(rateMatch[1]) || 0,
        rateUnit: "k/day",
        status: "available",
        confidenceScore: 0.8,
        category: "New Opportunities",
        priority: "medium",
      }
    }

    return null
  } catch (error) {
    console.error("Error parsing email:", error)
    return null
  }
}

/**
 * Ranks offers based on freight rate
 * @param offers Array of offers to rank
 * @returns Sorted array of offers
 */
export function rankOffers(offers: Offer[]): Offer[] {
  return [...offers].sort((a, b) => b.freightRate - a.freightRate)
}

/**
 * Gets the appropriate CSS class for an offer category
 * @param category Offer category
 * @returns CSS class string
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    "New Inquiries": "bg-blue-500",
    "Active Negotiations": "bg-green-500",
    Countered: "bg-amber-500",
    "Subject Lifted": "bg-orange-500",
    "On Subs": "bg-purple-500",
    Fixed: "bg-teal-500",
    Failed: "bg-red-500",
    Archived: "bg-gray-500",
    Favorites: "bg-yellow-500",
  }

  return colorMap[category] || "bg-gray-500"
}

/**
 * Gets the appropriate CSS class for an offer priority
 * @param priority Offer priority
 * @returns CSS class string
 */
export function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-green-500",
  }

  return colorMap[priority] || "bg-gray-500"
}

/**
 * Determines if a freight rate is above, below, or average compared to benchmarks
 * @param vesselCategory Vessel category
 * @param freightRate Freight rate
 * @returns Rate indicator string
 */
export function getRateIndicator(vesselCategory: string, freightRate: number): "above" | "below" | "average" | null {
  // In a real application, this would compare against actual benchmarks
  if (freightRate > 25) {
    return "above"
  } else if (freightRate < 15) {
    return "below"
  }

  return "average"
}
