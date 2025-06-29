"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, CheckSquare, Square } from "lucide-react"
import { useState } from "react"
import type { Offer } from "@/lib/types"

interface VesselSelectionPanelProps {
  vessels: Offer[]
  selectedVesselIds: string[]
  onVesselSelection: (vesselId: string, selected: boolean) => void
  onSelectAll: () => void
  onClearSelection: () => void
}

export function VesselSelectionPanel({
  vessels,
  selectedVesselIds,
  onVesselSelection,
  onSelectAll,
  onClearSelection,
}: VesselSelectionPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  // Filter and sort vessels
  const filteredVessels = vessels
    .filter((vessel) => {
      const matchesSearch =
        vessel.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.vesselType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.openPort?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.brokerName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === "all" || vessel.vesselType?.toLowerCase().includes(filterType.toLowerCase())

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.vesselName || "").localeCompare(b.vesselName || "")
        case "type":
          return (a.vesselType || "").localeCompare(b.vesselType || "")
        case "dwt":
          return (b.vesselSize || 0) - (a.vesselSize || 0)
        case "score":
          return (b.matchScore || 0) - (a.matchScore || 0)
        case "rate":
          return (a.freightRate || 0) - (b.freightRate || 0)
        default:
          return 0
      }
    })

  const vesselTypes = Array.from(new Set(vessels.map((v) => v.vesselType).filter(Boolean)))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Vessels to Compare</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              <Square className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {selectedVesselIds.length} of {vessels.length} vessels selected
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vessels, ports, brokers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {vesselTypes.map((type) => (
                <SelectItem key={type} value={type || ""}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Vessel Name</SelectItem>
              <SelectItem value="type">Vessel Type</SelectItem>
              <SelectItem value="dwt">DWT (High to Low)</SelectItem>
              <SelectItem value="score">Match Score</SelectItem>
              <SelectItem value="rate">Freight Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vessel List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredVessels.map((vessel) => (
            <div key={vessel.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                checked={selectedVesselIds.includes(vessel.id)}
                onCheckedChange={(checked) => onVesselSelection(vessel.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{vessel.vesselName || "Unknown"}</span>
                  {vessel.matchScore !== undefined && (
                    <Badge
                      variant={vessel.matchScore >= 7 ? "default" : vessel.matchScore >= 5 ? "secondary" : "outline"}
                    >
                      {vessel.matchScore}/10
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {vessel.vesselType} • {vessel.vesselSize}k DWT • {vessel.openPort}
                </div>
                <div className="text-xs text-gray-500">
                  {vessel.brokerName} ({vessel.company}) • ${vessel.freightRate?.toLocaleString()}/day
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVessels.length === 0 && (
          <div className="text-center py-8 text-gray-500">No vessels found matching your criteria</div>
        )}

        {selectedVesselIds.length > 5 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <strong>Note:</strong> Only the first 5 selected vessels will be shown in the comparison table for optimal
              viewing.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
