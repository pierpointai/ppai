"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { sheetsAPI, transformSheetsDataToOffer } from "@/lib/sheety-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Offer } from "@/lib/types"
import { VesselSelectionPanel } from "@/components/vessel-selection-panel"
import { OfferComparison } from "@/components/offer-comparison"

export default function ComparisonPage() {
  const [vessels, setVessels] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([])
  const [dataSource, setDataSource] = useState<"sheets" | "mock">("mock")

  // Load vessels from Google Sheets or mock data
  const loadVessels = async () => {
    try {
      setLoading(true)
      console.log("Loading vessels...")

      const sheetsData = await sheetsAPI.fetchVessels()
      const transformedVessels = sheetsData.map(transformSheetsDataToOffer)

      setVessels(transformedVessels)
      setDataSource(sheetsData.length > 0 ? "sheets" : "mock")

      console.log(`Loaded ${transformedVessels.length} vessels`)
    } catch (error) {
      console.error("Error loading vessels:", error)
      // This shouldn't happen now since we handle errors in the API
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVessels()
  }, [])

  const handleVesselSelection = (vesselId: string, selected: boolean) => {
    if (selected) {
      setSelectedVesselIds((prev) => [...prev, vesselId])
    } else {
      setSelectedVesselIds((prev) => prev.filter((id) => id !== vesselId))
    }
  }

  const handleSelectAll = () => {
    setSelectedVesselIds(vessels.map((v) => v.id))
  }

  const handleClearSelection = () => {
    setSelectedVesselIds([])
  }

  const selectedVessels = vessels.filter((v) => selectedVesselIds.includes(v.id))

  return (
    <PageLayout title="Compare Vessels" description="Simple vessel comparison for brokers">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compare Vessels</h1>
            <p className="text-gray-600">
              Select vessels to compare rates and details
              {dataSource === "mock" && <span className="ml-2 text-sm text-orange-600">(Using sample data)</span>}
            </p>
          </div>
          <Button variant="outline" onClick={loadVessels} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Vessel Selection */}
        {!loading && vessels.length > 0 && (
          <VesselSelectionPanel
            vessels={vessels}
            selectedVesselIds={selectedVesselIds}
            onVesselSelection={handleVesselSelection}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          />
        )}

        {/* Comparison */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <OfferComparison vessels={selectedVessels} />
        )}
      </div>
    </PageLayout>
  )
}
