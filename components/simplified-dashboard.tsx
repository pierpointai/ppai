"use client"

import { useMemo } from "react"
import { useOfferStore } from "@/lib/offer-store"
import { useCompareStore } from "@/lib/compare-store"
import { useToast } from "@/components/ui/use-toast"
import { useToggle, useSelection } from "@/hooks/use-simple-state"
import { SimpleCard } from "@/components/ui/simple-card"
import { SimpleTable } from "@/components/ui/simple-table"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { formatters } from "@/lib/utils/format"
import { getStatusColor } from "@/lib/utils/colors"

export function SimplifiedDashboard() {
  const { offers, addOffer } = useOfferStore()
  const { toggleCompareOffer } = useCompareStore()
  const { toast } = useToast()

  const { value: isLoading, setTrue: startLoading, setFalse: stopLoading } = useToggle()
  const { selected, toggle: toggleSelection, clear: clearSelection } = useSelection<string>()

  // Convert offers to simplified format
  const vessels = useMemo(
    () =>
      offers.map((offer) => ({
        id: offer.id,
        vesselName: offer.vesselName || "Unknown",
        vesselType: offer.vesselType,
        vesselSize: offer.vesselSize,
        route: `${offer.loadPort} → ${offer.dischargePort}`,
        laycan: formatters.dateRange(offer.laycanStart, offer.laycanEnd),
        rate: formatters.currency(offer.freightRate),
        status: offer.status || "Available",
      })),
    [offers],
  )

  const columns = [
    { key: "vesselName", label: "Vessel", sortable: true },
    { key: "vesselType", label: "Type", sortable: true },
    {
      key: "vesselSize",
      label: "Size",
      render: (vessel: any) => `${vessel.vesselSize}k DWT`,
      sortable: true,
    },
    { key: "route", label: "Route" },
    { key: "laycan", label: "Laycan" },
    { key: "rate", label: "Rate" },
    {
      key: "status",
      label: "Status",
      render: (vessel: any) => <span className={getStatusColor(vessel.status)}>{vessel.status}</span>,
    },
  ]

  const handleAddVessel = () => {
    startLoading()
    // Simulate adding vessel
    setTimeout(() => {
      // Add mock vessel logic here
      toast({ title: "Vessel added", description: "New vessel has been added to inventory" })
      stopLoading()
    }, 1000)
  }

  const handleRefresh = () => {
    startLoading()
    setTimeout(() => {
      toast({ title: "Data refreshed", description: "Vessel data has been updated" })
      stopLoading()
    }, 800)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vessel Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddVessel} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vessel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SimpleCard title="Total Vessels" badge={vessels.length}>
          <div className="text-2xl font-bold">{vessels.length}</div>
        </SimpleCard>
        <SimpleCard title="Available" badge={vessels.filter((v) => v.status === "Available").length}>
          <div className="text-2xl font-bold text-green-600">
            {vessels.filter((v) => v.status === "Available").length}
          </div>
        </SimpleCard>
        <SimpleCard title="On Subjects" badge={vessels.filter((v) => v.status === "On Subjects").length}>
          <div className="text-2xl font-bold text-amber-600">
            {vessels.filter((v) => v.status === "On Subjects").length}
          </div>
        </SimpleCard>
        <SimpleCard title="Fixed" badge={vessels.filter((v) => v.status === "Fixed").length}>
          <div className="text-2xl font-bold text-blue-600">{vessels.filter((v) => v.status === "Fixed").length}</div>
        </SimpleCard>
      </div>

      {/* Vessel Table */}
      <SimpleCard
        title="Vessel Inventory"
        subtitle="Manage your vessel positions"
        badge={vessels.length}
        actions={
          selected.size > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear ({selected.size})
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast({ title: "Added to comparison", description: `${selected.size} vessels added` })
                  clearSelection()
                }}
              >
                Compare
              </Button>
            </div>
          )
        }
      >
        <SimpleTable
          data={vessels}
          columns={columns}
          selectedItems={selected}
          onSelectItem={toggleSelection}
          loading={isLoading}
          emptyMessage="No vessels in inventory"
          onRowClick={(vessel) => {
            toast({ title: "Vessel selected", description: `Selected ${vessel.vesselName}` })
          }}
        />
      </SimpleCard>
    </div>
  )
}
