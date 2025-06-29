"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, Search } from "lucide-react"
import { VesselTable } from "@/components/vessel-table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOfferStore } from "@/lib/store/offer-store"

export default function VesselsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Get vessels from the offer store
  const offers = useOfferStore((state) => state.offers)

  // Filter and search vessels
  const filteredVessels = useMemo(() => {
    let filtered = offers || []

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((vessel) => {
        switch (statusFilter) {
          case "available":
            return vessel.status === "available"
          case "on-hire":
            return vessel.status === "laden"
          case "maintenance":
            return vessel.status === "ballast"
          default:
            return true
        }
      })
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (vessel) =>
          vessel.vesselName?.toLowerCase().includes(term) ||
          vessel.vesselType?.toLowerCase().includes(term) ||
          vessel.openPort?.toLowerCase().includes(term) ||
          vessel.nextPort?.toLowerCase().includes(term) ||
          vessel.company?.toLowerCase().includes(term),
      )
    }

    return filtered
  }, [offers, statusFilter, searchTerm])

  const handleView = (vessel: any) => {
    console.log("View vessel:", vessel)
  }

  const handleCopy = (id: string) => {
    console.log("Copy vessel:", id)
  }

  const handleSend = (id: string) => {
    console.log("Send vessel:", id)
  }

  const handleToggleFavorite = (vessel: any) => {
    console.log("Toggle favorite:", vessel)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vessels</h1>
          <p className="text-muted-foreground">Track vessel positions and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vessel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vessels..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All Vessels</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="on-hire">On Hire</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">Showing {filteredVessels.length} vessels</div>

      {/* Vessel Table */}
      <VesselTable
        vessels={filteredVessels}
        onView={handleView}
        onCopy={handleCopy}
        onSend={handleSend}
        onToggleFavorite={handleToggleFavorite}
        showRank={false}
        showMatchScore={false}
      />
    </div>
  )
}
