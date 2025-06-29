// Sheety API integration for Google Sheets
export interface SheetsVesselData {
  id: number
  vesselname: string
  type: string
  dwt: number
  built: number
  flag: string
  openport: string
  opendates: string
  nextport: string
  lastcargo: string
  ballast: string
  laden: string
  freightrate: number
  commission: number
  imo: string
  brokername: string
  company: string
  phonenumber: string
  email: string
}

export interface SheetsResponse {
  sheet1: SheetsVesselData[]
}

class SheetsAPI {
  private baseUrl = "https://api.sheety.co/de478b090979d21f75845c3c7fd62e47/testPpai/sheet1"

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    }
  }

  async fetchVessels(): Promise<SheetsVesselData[]> {
    try {
      console.log("Attempting to fetch from Sheety API...")
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        console.warn(`Sheety API error: ${response.status}. Using mock data instead.`)
        return this.getMockData()
      }

      const data: SheetsResponse = await response.json()
      console.log("Successfully fetched from Sheety:", data.sheet1?.length, "vessels")
      return data.sheet1 || []
    } catch (error) {
      console.warn("Sheety API unavailable, using mock data:", error)
      return this.getMockData()
    }
  }

  private getMockData(): SheetsVesselData[] {
    return [
      {
        id: 1,
        vesselname: "Arctic Light",
        type: "Capesize",
        dwt: 180,
        built: 2015,
        flag: "Panama",
        openport: "Tubarao",
        opendates: "15-20 Jun",
        nextport: "Qingdao",
        lastcargo: "Iron Ore",
        ballast: "no",
        laden: "yes",
        freightrate: 28500,
        commission: 1.25,
        imo: "9123456",
        brokername: "Ella Torres",
        company: "Pacific Dawn Shipping",
        phonenumber: "+65 9123 4567",
        email: "ella.torres@pacificdawn.com",
      },
      {
        id: 2,
        vesselname: "Arctic Spirit",
        type: "Supramax",
        dwt: 58,
        built: 2018,
        flag: "Marshall Islands",
        openport: "Rotterdam",
        opendates: "12-18 Jun",
        nextport: "Hamburg",
        lastcargo: "Steel Products",
        ballast: "yes",
        laden: "no",
        freightrate: 19750,
        commission: 1.25,
        imo: "9234567",
        brokername: "Ali Khan",
        company: "Oceanic Shipping",
        phonenumber: "+31 20 123 4567",
        email: "ali.khan@oceanic.com",
      },
      {
        id: 3,
        vesselname: "Baltic Trader",
        type: "Panamax",
        dwt: 75,
        built: 2012,
        flag: "Liberia",
        openport: "New Orleans",
        opendates: "18-25 Jun",
        nextport: "Santos",
        lastcargo: "Grain",
        ballast: "no",
        laden: "yes",
        freightrate: 22300,
        commission: 1.25,
        imo: "9345678",
        brokername: "Mike Johnson",
        company: "Atlantic Maritime",
        phonenumber: "+1 504 123 4567",
        email: "mike.johnson@atlantic.com",
      },
      {
        id: 4,
        vesselname: "Nordic Star",
        type: "Handymax",
        dwt: 45,
        built: 2020,
        flag: "Norway",
        openport: "Gdansk",
        opendates: "20-28 Jun",
        nextport: "Riga",
        lastcargo: "Fertilizer",
        ballast: "yes",
        laden: "no",
        freightrate: 17800,
        commission: 1.25,
        imo: "9456789",
        brokername: "Lars Andersen",
        company: "Nordic Shipping",
        phonenumber: "+47 22 123 456",
        email: "lars.andersen@nordic.com",
      },
      {
        id: 5,
        vesselname: "Pacific Dawn",
        type: "Ultramax",
        dwt: 63,
        built: 2019,
        flag: "Singapore",
        openport: "Singapore",
        opendates: "14-22 Jun",
        nextport: "Busan",
        lastcargo: "Coal",
        ballast: "no",
        laden: "yes",
        freightrate: 21200,
        commission: 1.25,
        imo: "9567890",
        brokername: "Sarah Chen",
        company: "Asia Pacific Lines",
        phonenumber: "+65 6123 4567",
        email: "sarah.chen@aplines.com",
      },
      {
        id: 6,
        vesselname: "Mediterranean Star",
        type: "Handysize",
        dwt: 35,
        built: 2017,
        flag: "Malta",
        openport: "Piraeus",
        opendates: "22-30 Jun",
        nextport: "Algeciras",
        lastcargo: "Cement",
        ballast: "yes",
        laden: "no",
        freightrate: 15600,
        commission: 1.25,
        imo: "9678901",
        brokername: "Maria Rossi",
        company: "Mediterranean Shipping",
        phonenumber: "+30 210 123 4567",
        email: "maria.rossi@medshipping.com",
      },
    ]
  }

  async addVessel(vessel: Partial<SheetsVesselData>): Promise<SheetsVesselData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ sheet1: vessel }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.sheet1
    } catch (error) {
      console.error("Error adding vessel to Sheety:", error)
      throw error
    }
  }

  async updateVessel(id: number, vessel: Partial<SheetsVesselData>): Promise<SheetsVesselData> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ sheet1: vessel }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.sheet1
    } catch (error) {
      console.error("Error updating vessel in Sheety:", error)
      throw error
    }
  }

  async deleteVessel(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting vessel from Sheety:", error)
      throw error
    }
  }
}

// Transform Sheety data to our internal Offer format using the new normalization utilities
import { normalizeVesselData, validateVesselData, getVesselCategoryBySize } from "./data-normalization"

export function transformSheetsDataToOffer(sheetsData: SheetsVesselData): import("./types").Offer {
  console.log("Transforming vessel:", sheetsData.vesselname, "Rate:", sheetsData.freightrate)

  // Use the new normalization function to handle all property mapping
  const normalized = normalizeVesselData(sheetsData)

  // Validate the normalized data
  const validation = validateVesselData(normalized)
  if (!validation.isValid) {
    console.warn("Vessel data validation failed:", validation.errors)
  }

  // Parse open dates (assuming format like "15-20 Jun" or similar)
  const parseOpenDates = (opendates: string) => {
    if (!opendates || opendates === "") {
      return {
        laycanStart: new Date(),
        laycanEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    }

    // Try to parse various date formats
    const currentYear = new Date().getFullYear()

    // Handle formats like "15-20 Jun", "Jun 15-20", etc.
    const dateMatch = opendates.match(/(\d{1,2})[-\s]*(\d{1,2})?\s*([A-Za-z]{3,})/i)
    if (dateMatch) {
      const [, start, end, month] = dateMatch
      const monthIndex = new Date(Date.parse(`${month} 1, ${currentYear}`)).getMonth()

      const laycanStart = new Date(currentYear, monthIndex, Number.parseInt(start))
      const laycanEnd = end
        ? new Date(currentYear, monthIndex, Number.parseInt(end))
        : new Date(laycanStart.getTime() + 5 * 24 * 60 * 60 * 1000)

      return { laycanStart, laycanEnd }
    }

    // Default fallback
    return {
      laycanStart: new Date(),
      laycanEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  }

  const { laycanStart, laycanEnd } = parseOpenDates(normalized.openDates || "")

  // Calculate the correct vessel category for internal use
  const vesselCategory = getVesselCategoryBySize(normalized.vesselSize || 50)

  const transformedOffer = {
    id: sheetsData.id.toString(),

    // Use normalized data with consistent property names
    vesselName: normalized.vesselName || "Unknown Vessel",
    vesselType: normalized.vesselType || "Bulk Carrier",
    vesselSize: normalized.vesselSize || 50,
    vesselAge: normalized.vesselAge || 0,
    vesselFlag: normalized.vesselFlag || "Unknown",
    openPort: normalized.openPort || "",
    openDates: normalized.openDates || "",
    nextPort: normalized.nextPort || "",
    lastCargo: normalized.lastCargo || "",
    freightRate: normalized.freightRate || 0,
    commission: normalized.commission || 1.25,
    imo: normalized.imo || "",
    brokerName: normalized.brokerName || "",
    company: normalized.company || "",
    phoneNumber: normalized.phoneNumber || "",
    email: normalized.email || "",

    // Status derived from ballast/laden
    status: normalized.status || "available",
    ballast: normalized.ballast || false,
    laden: normalized.laden || false,

    // Use consistent property names for load/discharge
    loadPort: normalized.openPort || "",
    dischargePort: normalized.nextPort || "",

    // Dates
    laycanStart,
    laycanEnd,

    // Default values for required fields
    rateUnit: normalized.rateUnit || "/day",
    cargoType: normalized.lastCargo || "",

    // Set defaults for fields not in sheets
    score: Math.random() * 0.3 + 0.7,
    confidenceScore: 1,
    vesselCategory: vesselCategory,
    contractType: "voyage",
    tradeLane: `${normalized.openPort || ""} - ${normalized.nextPort || ""}`,
    marketSegment: "Major Bulks",
    category: "New Inquiries",
    priority: "medium",
    lastUpdated: new Date(),

    // Additional fields that might be missing - set to defaults
    charterer: "",
    bdiComparison: 0,
    freightTotal: (normalized.freightRate || 0) * (normalized.vesselSize || 50) * 1000,
    demurrage: (normalized.freightRate || 0) * 0.8,
    loadRate: 10000,
    dischargeRate: 12000,
    laydays: 5,
    duration: 30,
    cargoQuantity: (normalized.vesselSize || 50) * 1000,
  }

  console.log("Transformed offer for", transformedOffer.vesselName, "with rate:", transformedOffer.freightRate)

  return transformedOffer
}

// Create and export the API instance
export const sheetsAPI = new SheetsAPI()
