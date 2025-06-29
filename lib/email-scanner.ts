import type { Offer } from "@/lib/types"
import { parseEmailToOffer } from "@/lib/offer-utils"

/**
 * Email connection configuration
 */
export interface EmailConfig {
  server: string
  port: number
  username: string
  password: string
  folder?: string
  useSSL?: boolean
  scanInterval?: number // in minutes
  maxEmailsPerScan?: number // limit emails per scan for performance
  retryStrategy?: "exponential" | "linear" | "none" // retry strategy for failed scans
}

/**
 * Email scanning status
 */
export interface ScanStatus {
  lastScan: Date | null
  isScanning: boolean
  totalScanned: number
  offersFound: number
  error: string | null
  consecutiveErrors: number
  nextScanTime: Date | null
}

/**
 * Enhanced email scanner with performance optimizations and error handling
 */
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
  private emailCache = new Map<string, boolean>() // Cache to avoid processing the same email twice
  private processingQueue: string[] = [] // Queue for processing emails
  private isProcessingQueue = false // Flag to prevent concurrent queue processing

  /**
   * Creates a new EmailScanner instance
   * @param config Email configuration
   */
  constructor(config: EmailConfig) {
    this.config = {
      ...config,
      folder: config.folder || "INBOX",
      useSSL: config.useSSL !== false,
      scanInterval: config.scanInterval || 15, // Default to 15 minutes
      maxEmailsPerScan: config.maxEmailsPerScan || 50, // Default to 50 emails per scan
      retryStrategy: config.retryStrategy || "exponential", // Default to exponential backoff
    }
  }

  /**
   * Gets the current scan status
   * @returns Current scan status
   */
  public getStatus(): ScanStatus {
    return { ...this.status }
  }

  /**
   * Sets callback for new offers
   * @param callback Callback function
   */
  public onNewOffers(callback: (offers: Offer[]) => void): void {
    this.onNewOffersCallback = callback
  }

  /**
   * Starts automatic scanning with improved scheduling
   */
  public startAutomaticScanning(): void {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId)
    }

    // Convert minutes to milliseconds
    const intervalMs = this.config.scanInterval! * 60 * 1000

    // Initial scan
    this.scanEmails()

    // Set up recurring scans with dynamic interval
    this.scanIntervalId = setInterval(() => {
      // Skip scan if we're still processing the previous one
      if (this.status.isScanning) {
        console.log("Previous scan still in progress, skipping this interval")
        return
      }

      // Skip scan if we're in a backoff period after errors
      if (this.status.nextScanTime && this.status.nextScanTime > new Date()) {
        console.log(`Waiting for backoff period to end at ${this.status.nextScanTime.toLocaleTimeString()}`)
        return
      }

      this.scanEmails()
    }, intervalMs)

    console.log(`Automatic email scanning started. Interval: ${this.config.scanInterval} minutes`)
  }

  /**
   * Stops automatic scanning
   */
  public stopAutomaticScanning(): void {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId)
      this.scanIntervalId = null
      console.log("Automatic email scanning stopped")
    }
  }

  /**
   * Manually triggers a scan with improved error handling and performance
   * @returns Array of new offers found
   */
  public async scanEmails(): Promise<Offer[]> {
    if (this.status.isScanning) {
      console.log("Scan already in progress")
      return []
    }

    try {
      this.status.isScanning = true
      this.status.error = null

      console.log(`Scanning emails from ${this.config.server}:${this.config.port}...`)

      // In a real implementation, this would connect to the email server
      // and fetch new emails. For this demo, we'll simulate the process.
      const newOffers = await this.simulateScanEmails()

      this.status.lastScan = new Date()
      this.status.totalScanned += this.processingQueue.length
      this.status.offersFound += newOffers.length
      this.status.isScanning = false
      this.status.consecutiveErrors = 0 // Reset error count on success
      this.status.nextScanTime = null // Clear backoff time

      // Notify through callback if set
      if (this.onNewOffersCallback && newOffers.length > 0) {
        this.onNewOffersCallback(newOffers)
      }

      return newOffers
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : "Unknown error during email scan"
      this.status.isScanning = false
      this.status.consecutiveErrors++
      console.error("Error scanning emails:", error)

      // Apply backoff strategy based on consecutive errors
      this.applyBackoffStrategy()

      return []
    }
  }

  /**
   * Applies backoff strategy based on configuration
   */
  private applyBackoffStrategy(): void {
    const now = new Date()
    let backoffMinutes = 1 // Default 1 minute

    switch (this.config.retryStrategy) {
      case "exponential":
        // Exponential backoff: 2^errors minutes (capped at 60 minutes)
        backoffMinutes = Math.min(Math.pow(2, this.status.consecutiveErrors - 1), 60)
        break
      case "linear":
        // Linear backoff: errors * 5 minutes (capped at 30 minutes)
        backoffMinutes = Math.min(this.status.consecutiveErrors * 5, 30)
        break
      case "none":
        // No backoff
        backoffMinutes = 0
        break
    }

    if (backoffMinutes > 0) {
      const nextScanTime = new Date(now.getTime() + backoffMinutes * 60 * 1000)
      this.status.nextScanTime = nextScanTime
      console.log(`Applying backoff: next scan in ${backoffMinutes} minutes at ${nextScanTime.toLocaleTimeString()}`)
    }
  }

  /**
   * Simulates scanning emails with improved performance
   * @returns Array of offers found in emails
   */
  private async simulateScanEmails(): Promise<Offer[]> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Process each email body
      const offers: Offer[] = []

      // Randomly select 1-3 emails to process
      const emailsToProcess = Math.floor(Math.random() * 3) + 1

      // Generate mock emails with more variety
      const mockEmails = this.generateMockEmails(emailsToProcess)

      // Add emails to processing queue
      this.processingQueue.push(...mockEmails)

      // Process queue in batches for better performance
      await this.processEmailQueue(offers)

      return offers
    } catch (error) {
      console.error("Error in simulateScanEmails:", error)
      throw new Error("Failed to scan emails: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  /**
   * Generates mock emails for testing
   * @param count Number of emails to generate
   * @returns Array of email strings
   */
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

  /**
   * Processes email queue in batches for better performance
   * @param offers Array to store found offers
   */
  private async processEmailQueue(offers: Offer[]): Promise<void> {
    if (this.isProcessingQueue) return

    this.isProcessingQueue = true

    try {
      // Process in batches of 10 for better performance
      const batchSize = 10

      while (this.processingQueue.length > 0) {
        const batch = this.processingQueue.splice(0, batchSize)

        // Process batch in parallel
        const batchPromises = batch.map((emailBody) => {
          // Skip if already processed (using cache)
          const emailHash = this.hashEmail(emailBody)
          if (this.emailCache.has(emailHash)) return null

          // Mark as processed
          this.emailCache.set(emailHash, true)

          // Extract offers
          return this.extractOffersFromEmail(emailBody)
        })

        const batchResults = await Promise.all(batchPromises)

        // Flatten results and filter out nulls
        const newOffers = batchResults.filter(Boolean).flat().filter(Boolean) as Offer[]

        offers.push(...newOffers)

        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } finally {
      this.isProcessingQueue = false

      // Clean up cache if it gets too large
      if (this.emailCache.size > 1000) {
        const keysToDelete = Array.from(this.emailCache.keys()).slice(0, 500)
        keysToDelete.forEach((key) => this.emailCache.delete(key))
      }
    }
  }

  /**
   * Simple hash function for emails
   * @param email Email content
   * @returns Hash string
   */
  private hashEmail(email: string): string {
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  /**
   * Extracts offers from email content with improved parsing
   * @param emailBody Email content
   * @returns Array of offers found in email
   */
  private extractOffersFromEmail(emailBody: string): Offer[] {
    const offers: Offer[] = []

    // Try multiple regex patterns for better extraction
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
          // Add the raw email as context
          offer.rawEmail = emailBody
          offers.push(offer)
        }
      }

      // If we found offers with this pattern, no need to try others
      if (offers.length > 0) break
    }

    // If no offers found with regex patterns, try the full email
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

// Singleton instance for the app with lazy initialization
let emailScannerInstance: EmailScanner | null = null

/**
 * Gets or creates the email scanner instance
 * @param config Email configuration (required for first call)
 * @returns EmailScanner instance
 */
export function getEmailScanner(config?: EmailConfig): EmailScanner {
  if (!emailScannerInstance && config) {
    emailScannerInstance = new EmailScanner(config)
  } else if (!emailScannerInstance) {
    throw new Error("Email scanner not initialized. Provide configuration first.")
  }

  return emailScannerInstance
}

/**
 * Resets the email scanner instance
 */
export function resetEmailScanner(): void {
  if (emailScannerInstance) {
    emailScannerInstance.stopAutomaticScanning()
    emailScannerInstance = null
  }
}
