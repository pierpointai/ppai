import type { Offer } from "@/lib/types"
import { parseEmailToOffer } from "@/lib/offer-utils"

export interface EmailConfig {
  server: string
  port: number
  username: string
  password: string
  folder?: string
  useSSL?: boolean
  scanInterval?: number
  maxEmailsPerScan?: number
  retryStrategy?: "exponential" | "linear" | "none"
}

export interface ScanStatus {
  lastScan: Date | null
  isScanning: boolean
  totalScanned: number
  offersFound: number
  error: string | null
  consecutiveErrors: number
  nextScanTime: Date | null
}

export class EmailScanner {
  private config: EmailConfig
  private status: ScanStatus = {
    lastScan: null,
    isScanning: false,
    totalScanned: 0,
    offersFound: 0,
    error: null,
    consecutiveErrors: 0,
    nextScanTime: null,
  }
  private scanIntervalId: NodeJS.Timeout | null = null
  private onNewOffersCallback: ((offers: Offer[]) => void) | null = null
  private emailCache = new Map<string, boolean>()
  private processingQueue: string[] = []
  private isProcessingQueue = false

  constructor(config: EmailConfig) {
    this.config = {
      ...config,
      folder: config.folder || "INBOX",
      useSSL: config.useSSL !== false,
      scanInterval: Math.max(1, config.scanInterval || 15), // Minimum 1 minute
      maxEmailsPerScan: Math.max(1, config.maxEmailsPerScan || 50), // Minimum 1 email
      retryStrategy: config.retryStrategy || "exponential",
    }
  }

  public getStatus(): ScanStatus {
    return { ...this.status }
  }

  public onNewOffers(callback: (offers: Offer[]) => void): void {
    this.onNewOffersCallback = callback
  }

  public startAutomaticScanning(): void {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId)
    }

    const intervalMs = this.config.scanInterval! * 60 * 1000

    this.scanEmails()

    this.scanIntervalId = setInterval(() => {
      if (this.status.isScanning) {
        console.log("Previous scan still in progress, skipping this interval")
        return
      }

      if (this.status.nextScanTime && this.status.nextScanTime > new Date()) {
        console.log(`Waiting for backoff period to end at ${this.status.nextScanTime.toLocaleTimeString()}`)
        return
      }

      this.scanEmails()
    }, intervalMs)

    console.log(`Automatic email scanning started. Interval: ${this.config.scanInterval} minutes`)
  }

  public stopAutomaticScanning(): void {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId)
      this.scanIntervalId = null
      console.log("Automatic email scanning stopped")
    }
  }

  public async scanEmails(): Promise<Offer[]> {
    if (this.status.isScanning) {
      console.log("Scan already in progress")
      return []
    }

    try {
      this.status.isScanning = true
      this.status.error = null

      console.log(`Scanning emails from ${this.config.server}:${this.config.port}...`)

      const newOffers = await this.simulateScanEmails()

      this.status.lastScan = new Date()
      this.status.totalScanned += this.processingQueue.length
      this.status.offersFound += newOffers.length
      this.status.isScanning = false
      this.status.consecutiveErrors = 0
      this.status.nextScanTime = null

      if (this.onNewOffersCallback && newOffers.length > 0) {
        this.onNewOffersCallback(newOffers)
      }

      return newOffers
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : "Unknown error during email scan"
      this.status.isScanning = false
      this.status.consecutiveErrors++
      console.error("Error scanning emails:", error)

      this.applyBackoffStrategy()
      return []
    }
  }

  private applyBackoffStrategy(): void {
    const now = new Date()
    let backoffMinutes = 1

    switch (this.config.retryStrategy) {
      case "exponential":
        backoffMinutes = Math.min(Math.pow(2, this.status.consecutiveErrors - 1), 60)
        break
      case "linear":
        backoffMinutes = Math.min(this.status.consecutiveErrors * 5, 30)
        break
      case "none":
        backoffMinutes = 0
        break
    }

    if (backoffMinutes > 0) {
      const nextScanTime = new Date(now.getTime() + backoffMinutes * 60 * 1000)
      this.status.nextScanTime = nextScanTime
      console.log(`Applying backoff: next scan in ${backoffMinutes} minutes at ${nextScanTime.toLocaleTimeString()}`)
    }
  }

  private async simulateScanEmails(): Promise<Offer[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const offers: Offer[] = []
      const emailsToProcess = Math.floor(Math.random() * 3) + 1
      const mockEmails = this.generateMockEmails(emailsToProcess)

      this.processingQueue.push(...mockEmails)
      await this.processEmailQueue(offers)

      return offers
    } catch (error) {
      console.error("Error in simulateScanEmails:", error)
      throw new Error("Failed to scan emails: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  private generateMockEmails(count: number): string[] {
    const vesselTypes = ["Handysize", "Supramax", "Panamax", "Kamsarmax", "Capesize", "VLOC"]
    const vesselSizes = [28, 32, 38, 52, 58, 64, 76, 82, 95, 180, 210]
    const loadPorts = ["US Gulf", "ECSA", "Black Sea", "North China", "Australia", "Indonesia", "South Africa"]
    const dischargePorts = ["Continent", "Far East", "Mediterranean", "USEC", "India", "SE Asia", "Japan"]
    const months = ["June", "July", "August", "September"]
    const rates = [14, 15, 16.5, 18, 19.5, 20, 22, 24, 26, 28]

    const emails: string[] = []

    for (let i = 0; i < count; i++) {
      const vesselType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)]
      const vesselSize = vesselSizes[Math.floor(Math.random() * vesselSizes.length)]
      const loadPort = loadPorts[Math.floor(Math.random() * loadPorts.length)]
      const dischargePort = dischargePorts[Math.floor(Math.random() * dischargePorts.length)]
      const month = months[Math.floor(Math.random() * months.length)]
      const startDay = Math.floor(Math.random() * 20) + 1
      const endDay = startDay + Math.floor(Math.random() * 10) + 3
      const rate = rates[Math.floor(Math.random() * rates.length)]

      const email = `From: broker${i + 1}@shipco.com
Subject: New Cargo Offer - ${vesselType} ${vesselSize}k
Date: ${month} ${Math.floor(Math.random() * 28) + 1}, 2025

Dear Shipbroker,

We are pleased to offer the following vessel:

${vesselType} ${vesselSize}k DWT, ${loadPort} → ${dischargePort}, ${month} ${startDay}–${endDay}, $${rate}k/day

Please let me know if you have any interest.

Best regards,
John Smith
ShipCo Brokers`

      emails.push(email)
    }

    return emails
  }

  private async processEmailQueue(offers: Offer[]): Promise<void> {
    if (this.isProcessingQueue) return

    this.isProcessingQueue = true

    try {
      const batchSize = 10

      while (this.processingQueue.length > 0) {
        const batch = this.processingQueue.splice(0, batchSize)

        const batchPromises = batch.map((emailBody) => {
          const emailHash = this.hashEmail(emailBody)
          if (this.emailCache.has(emailHash)) return null

          this.emailCache.set(emailHash, true)
          return this.extractOffersFromEmail(emailBody)
        })

        const batchResults = await Promise.all(batchPromises)
        const newOffers = batchResults.filter(Boolean).flat().filter(Boolean) as Offer[]

        offers.push(...newOffers)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } finally {
      this.isProcessingQueue = false

      if (this.emailCache.size > 1000) {
        const keysToDelete = Array.from(this.emailCache.keys()).slice(0, 500)
        keysToDelete.forEach((key) => this.emailCache.delete(key))
      }
    }
  }

  private hashEmail(email: string): string {
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  private extractOffersFromEmail(emailBody: string): Offer[] {
    const offers: Offer[] = []

    const patterns = [
      /(\w+)\s+(\d+)k\s+DWT,\s+([^→]+)→\s+([^,]+),\s+(\w+)\s+(\d+)–(\d+),\s+\$(\d+\.?\d*)k\/day/g,
      /(\w+)\s+(\d+)k\s+DWT,\s+([^-]+)-\s+([^,]+),\s+(\w+)\s+(\d+)[-–](\d+),\s+\$(\d+\.?\d*)k\/day/g,
      /(\w+)\s+(\d+)k\s+DWT,\s+([^to]+)to\s+([^,]+),\s+(\w+)\s+(\d+)[-–](\d+),\s+\$(\d+\.?\d*)k\/day/g,
      /(\w+)\s+(\d+)k\s+DWT\s+vessel.*?([^→]+)→\s+([^,]+).*?(\w+)\s+(\d+)[-–](\d+).*?\$(\d+\.?\d*)k\/day/g,
    ]

    for (const regex of patterns) {
      let match
      while ((match = regex.exec(emailBody)) !== null) {
        const offerText = match[0]
        const offer = parseEmailToOffer(offerText)

        if (offer) {
          offer.rawEmail = emailBody
          offers.push(offer)
        }
      }

      if (offers.length > 0) break
    }

    if (offers.length === 0) {
      const offer = parseEmailToOffer(emailBody)
      if (offer) {
        offer.rawEmail = emailBody
        offers.push(offer)
      }
    }

    return offers
  }
}

let emailScannerInstance: EmailScanner | null = null

export function getEmailScanner(config?: EmailConfig): EmailScanner {
  if (!emailScannerInstance && config) {
    emailScannerInstance = new EmailScanner(config)
  } else if (!emailScannerInstance) {
    throw new Error("Email scanner not initialized. Provide configuration first.")
  }

  return emailScannerInstance
}

export function resetEmailScanner(): void {
  if (emailScannerInstance) {
    emailScannerInstance.stopAutomaticScanning()
    emailScannerInstance = null
  }
}
