import type { Offer } from "@/lib/types"

// Define the standard property mapping for vessel data
export interface VesselDataMapping {
  // Vessel basic info
  vesselName: string[]
  vesselType: string[]
  vesselSize: string[]
  vesselAge: string[]
  vesselFlag: string[]
  imo: string[]

  // Location and dates
  openPort: string[]
  openDates: string[]
  nextPort: string[]
  lastCargo: string[]

  // Commercial terms
  freightRate: string[]
  commission: string[]

  // Contact info
  brokerName: string[]
  company: string[]
  phoneNumber: string[]
  email: string[]

  // Status
  ballast: string[]
  laden: string[]
  status: string[]
}

// Property mapping for different data sources
export const VESSEL_PROPERTY_MAPPING: VesselDataMapping = {
  vesselName: ["vesselName", "vesselname", "vessel_name", "name"],
  vesselType: ["vesselType", "type", "vessel_type", "vesseltype"],
  vesselSize: ["vesselSize", "dwt", "vessel_size", "size"],
  vesselAge: ["vesselAge", "age", "vessel_age", "built"],
  vesselFlag: ["vesselFlag", "flag", "vessel_flag", "vesselFlag"],
  imo: ["imo", "IMO", "imoNumber", "imo_number"],

  openPort: ["openPort", "openport", "open_port", "loadPort", "loadport", "load_port"],
  openDates: ["openDates", "opendates", "open_dates", "laycanStart", "laycan_start"],
  nextPort: ["nextPort", "nextport", "next_port", "dischargePort", "dischargeport", "discharge_port"],
  lastCargo: ["lastCargo", "lastcargo", "last_cargo", "cargoType", "cargo_type"],

  freightRate: ["freightRate", "freightrate", "freight_rate", "rate"],
  commission: ["commission", "comm", "commissionRate", "commission_rate"],

  brokerName: ["brokerName", "brokername", "broker_name", "broker"],
  company: ["company", "brokerCompany", "broker_company"],
  phoneNumber: ["phoneNumber", "phonenumber", "phone_number", "phone", "tel"],
  email: ["email", "emailAddress", "email_address", "brokerEmail", "broker_email"],

  ballast: ["ballast", "isBallast", "is_ballast"],
  laden: ["laden", "isLaden", "is_laden"],
  status: ["status", "vesselStatus", "vessel_status"],
}

/**
 * Safely extracts a value from an object using multiple possible property names
 */
export function safeExtract(obj: any, propertyNames: string[], defaultValue: any = null): any {
  if (!obj || typeof obj !== "object") {
    return defaultValue
  }

  for (const propName of propertyNames) {
    if (obj.hasOwnProperty(propName) && obj[propName] !== null && obj[propName] !== undefined && obj[propName] !== "") {
      return obj[propName]
    }
  }

  return defaultValue
}

/**
 * Safely extracts a string value and ensures it's not empty
 */
export function safeExtractString(obj: any, propertyNames: string[], defaultValue = ""): string {
  const value = safeExtract(obj, propertyNames, defaultValue)

  if (typeof value === "string" && value.trim() !== "") {
    return value.trim()
  }

  if (typeof value === "number") {
    return value.toString()
  }

  return defaultValue
}

/**
 * Safely extracts a numeric value
 */
export function safeExtractNumber(obj: any, propertyNames: string[], defaultValue = 0): number {
  const value = safeExtract(obj, propertyNames, defaultValue)

  if (typeof value === "number" && !isNaN(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (!isNaN(parsed)) {
      return parsed
    }
  }

  return defaultValue
}

/**
 * Safely extracts a boolean value
 */
export function safeExtractBoolean(obj: any, propertyNames: string[], defaultValue = false): boolean {
  const value = safeExtract(obj, propertyNames, defaultValue)

  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const lowerValue = value.toLowerCase().trim()
    return lowerValue === "true" || lowerValue === "yes" || lowerValue === "1"
  }

  if (typeof value === "number") {
    return value === 1
  }

  return defaultValue
}

/**
 * Normalizes vessel data to ensure consistent property names and values
 */
export function normalizeVesselData(rawData: any): Partial<Offer> {
  if (!rawData || typeof rawData !== "object") {
    return {}
  }

  // Extract and normalize all vessel properties
  const normalized: Partial<Offer> = {
    // Basic vessel info
    vesselName: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.vesselName, "Unknown Vessel"),
    vesselType: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.vesselType, "Bulk Carrier"),
    vesselSize: safeExtractNumber(rawData, VESSEL_PROPERTY_MAPPING.vesselSize, 0),
    vesselAge: safeExtractNumber(rawData, VESSEL_PROPERTY_MAPPING.vesselAge, 0),
    vesselFlag: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.vesselFlag, "Unknown"),
    imo: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.imo, ""),

    // Location and operational data
    openPort: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.openPort, ""),
    openDates: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.openDates, ""),
    nextPort: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.nextPort, ""),
    lastCargo: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.lastCargo, ""),

    // Commercial terms
    freightRate: safeExtractNumber(rawData, VESSEL_PROPERTY_MAPPING.freightRate, 0),
    commission: safeExtractNumber(rawData, VESSEL_PROPERTY_MAPPING.commission, 0),

    // Contact information
    brokerName: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.brokerName, ""),
    company: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.company, ""),
    phoneNumber: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.phoneNumber, ""),
    email: safeExtractString(rawData, VESSEL_PROPERTY_MAPPING.email, ""),

    // Status information
    ballast: safeExtractBoolean(rawData, VESSEL_PROPERTY_MAPPING.ballast, false),
    laden: safeExtractBoolean(rawData, VESSEL_PROPERTY_MAPPING.laden, false),
  }

  // Derive additional properties
  if (normalized.vesselSize && normalized.vesselSize > 1000) {
    // Convert from full tons to thousands if needed
    normalized.vesselSize = Math.round(normalized.vesselSize / 1000)
  }

  // Calculate vessel age from build year if age not provided
  if (!normalized.vesselAge && rawData.built) {
    const buildYear = safeExtractNumber(rawData, ["built", "buildYear", "build_year"], 0)
    if (buildYear > 1900 && buildYear <= new Date().getFullYear()) {
      normalized.vesselAge = new Date().getFullYear() - buildYear
    }
  }

  // Set load/discharge ports from open/next ports if not already set
  if (!rawData.loadPort && normalized.openPort) {
    normalized.loadPort = normalized.openPort
  }
  if (!rawData.dischargePort && normalized.nextPort) {
    normalized.dischargePort = normalized.nextPort
  }

  // Determine status from ballast/laden if not explicitly set
  if (!rawData.status) {
    if (normalized.ballast) {
      normalized.status = "ballast"
    } else if (normalized.laden) {
      normalized.status = "laden"
    } else {
      normalized.status = "available"
    }
  }

  // Set rate unit if not provided
  if (!normalized.rateUnit && normalized.freightRate && normalized.freightRate > 0) {
    normalized.rateUnit = "/day"
  }

  return normalized
}

/**
 * Batch normalize multiple vessel records
 */
export function normalizeVesselDataBatch(rawDataArray: any[]): Partial<Offer>[] {
  if (!Array.isArray(rawDataArray)) {
    return []
  }

  return rawDataArray
    .map(normalizeVesselData)
    .filter((vessel) => vessel.vesselName && vessel.vesselName !== "Unknown Vessel")
}

/**
 * Validates that required vessel data is present
 */
export function validateVesselData(vessel: Partial<Offer>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!vessel.vesselName || vessel.vesselName.trim() === "" || vessel.vesselName === "Unknown Vessel") {
    errors.push("Vessel name is required")
  }

  if (!vessel.vesselSize || vessel.vesselSize <= 0) {
    errors.push("Valid vessel size (DWT) is required")
  }

  if (!vessel.openPort || vessel.openPort.trim() === "") {
    errors.push("Open port is required")
  }

  // Validate numeric fields
  if (vessel.vesselAge && (vessel.vesselAge < 0 || vessel.vesselAge > 50)) {
    errors.push("Vessel age must be between 0 and 50 years")
  }

  if (vessel.freightRate && vessel.freightRate < 0) {
    errors.push("Freight rate cannot be negative")
  }

  if (vessel.commission && (vessel.commission < 0 || vessel.commission > 10)) {
    errors.push("Commission must be between 0 and 10 percent")
  }

  // Validate email format if provided
  if (vessel.email && vessel.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(vessel.email)) {
      errors.push("Invalid email format")
    }
  }

  // Validate IMO format if provided
  if (vessel.imo && vessel.imo.trim() !== "") {
    const imoRegex = /^[0-9]{7}$/
    if (!imoRegex.test(vessel.imo)) {
      errors.push("IMO number must be 7 digits")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Creates a display-friendly version of vessel data with fallbacks
 */
export function createDisplayVessel(vessel: any): Record<string, string> {
  const normalized = normalizeVesselData(vessel)

  return {
    vesselName: normalized.vesselName || "N/A",
    vesselType: normalized.vesselType || "N/A",
    vesselSize: normalized.vesselSize ? `${normalized.vesselSize}k DWT` : "N/A",
    vesselAge: normalized.vesselAge ? `${normalized.vesselAge} years` : "N/A",
    vesselFlag: normalized.vesselFlag || "N/A",
    imo: normalized.imo || "N/A",
    openPort: normalized.openPort || "N/A",
    openDates: normalized.openDates || "N/A",
    nextPort: normalized.nextPort || "N/A",
    lastCargo: normalized.lastCargo || "N/A",
    freightRate: normalized.freightRate ? `$${normalized.freightRate}${normalized.rateUnit || ""}` : "N/A",
    commission: normalized.commission ? `${normalized.commission}%` : "N/A",
    brokerName: normalized.brokerName || "N/A",
    company: normalized.company || "N/A",
    phoneNumber: normalized.phoneNumber || "N/A",
    email: normalized.email || "N/A",
    status: normalized.status || "N/A",
  }
}

/**
 * Categorizes vessels by size (DWT)
 */
export function getVesselCategoryBySize(dwt: number): string {
  if (dwt < 10000) return "Small Vessel"
  if (dwt < 40000) return "Handysize"
  if (dwt < 65000) return "Handymax"
  if (dwt < 100000) return "Panamax"
  if (dwt < 180000) return "Capesize"
  return "VLOC" // Very Large Ore Carrier
}

/**
 * Gets vessel size category from vessel data
 */
export function getVesselCategory(vessel: any): string {
  const normalized = normalizeVesselData(vessel)
  const dwt = (normalized.vesselSize || 0) * 1000 // Convert from thousands to actual DWT
  return getVesselCategoryBySize(dwt)
}

/**
 * Gets all available vessel categories
 */
export function getVesselCategories(): string[] {
  return ["Small Vessel", "Handysize", "Handymax", "Panamax", "Capesize", "VLOC"]
}

/**
 * Gets DWT range for a vessel category
 */
export function getDwtRangeForCategory(category: string): { min: number; max: number } {
  switch (category) {
    case "Small Vessel":
      return { min: 0, max: 9999 }
    case "Handysize":
      return { min: 10000, max: 39999 }
    case "Handymax":
      return { min: 40000, max: 64999 }
    case "Panamax":
      return { min: 65000, max: 99999 }
    case "Capesize":
      return { min: 100000, max: 179999 }
    case "VLOC":
      return { min: 180000, max: 999999 }
    default:
      return { min: 0, max: 999999 }
  }
}
