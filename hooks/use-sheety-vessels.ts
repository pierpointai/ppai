"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useOfferStore } from "@/lib/offer-store"
import { sheetsAPI, transformSheetsDataToOffer } from "@/lib/sheety-api"

export function useSheetsVessels() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { addOffer, clearOffers } = useOfferStore()

  const syncFromSheets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      toast({
        title: "Syncing from Google Sheets",
        description: "Fetching vessel data from your spreadsheet...",
      })

      const sheetsData = await sheetsAPI.fetchVessels()

      if (sheetsData.length === 0) {
        toast({
          title: "No data found",
          description: "Your Google Sheet appears to be empty or has no valid vessel data.",
          variant: "destructive",
        })
        return
      }

      // Clear existing offers before adding new ones
      clearOffers()

      // Transform and add each vessel
      let successCount = 0
      let errorCount = 0

      for (const vessel of sheetsData) {
        try {
          const transformedOffer = transformSheetsDataToOffer(vessel)
          addOffer(transformedOffer)
          successCount++
        } catch (transformError) {
          console.error("Error transforming vessel:", vessel, transformError)
          errorCount++
        }
      }

      setLastSync(new Date())

      if (successCount > 0) {
        toast({
          title: "Sync successful!",
          description: `Successfully loaded ${successCount} vessels from Google Sheets.${errorCount > 0 ? ` ${errorCount} vessels had errors.` : ""}`,
        })
      } else {
        toast({
          title: "Sync failed",
          description: "No vessels could be loaded from your Google Sheet. Please check your data format.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error syncing from Sheets:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")

      toast({
        title: "Sync failed",
        description: "Failed to connect to Google Sheets. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      toast({
        title: "Testing connection",
        description: "Checking connection to Google Sheets...",
      })

      const sheetsData = await sheetsAPI.fetchVessels()

      toast({
        title: "Connection successful!",
        description: `Found ${sheetsData.length} vessels in your Google Sheet.`,
      })

      return true
    } catch (error) {
      console.error("Connection test failed:", error)
      setError(error instanceof Error ? error.message : "Connection failed")

      toast({
        title: "Connection failed",
        description: "Could not connect to Google Sheets. Please check your setup.",
        variant: "destructive",
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-sync on mount if no vessels exist
  useEffect(() => {
    const { offers } = useOfferStore.getState()
    if (offers.length === 0) {
      // Auto-sync after a short delay
      const timer = setTimeout(() => {
        syncFromSheets()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  return {
    isLoading,
    lastSync,
    error,
    syncFromSheets,
    testConnection,
  }
}
