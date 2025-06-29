"use client"

import { useState, useMemo, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Columns,
  Filter,
  Download,
  Phone,
  Mail,
  Copy,
  MapPin,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateVesselProximity } from "@/lib/enhanced-matching"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { normalizeVesselData, createDisplayVessel } from "@/lib/data-normalization"

interface VesselTableProps {
  vessels: any[]
  onEdit?: (vessel: any) => void
  onDelete?: (id: string) => void
  onView?: (vessel: any) => void
}

export function VesselTableNew({ vessels, onEdit, onDelete, onView }: VesselTableProps) {
  const [selectedVessels, setSelectedVessels] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [proximityPort, setProximityPort] = useState("")
  const [maxDistance, setMaxDistance] = useState<number | null>(null)

  // Normalize all vessels data for consistent property access
  const normalizedVessels = useMemo(() => {
    return vessels.map((vessel) => {
      const normalized = normalizeVesselData(vessel)
      const display = createDisplayVessel(vessel)

      return {
        ...vessel,
        ...normalized,
        display,
        // Keep original ID
        id: vessel.id || Math.random().toString(36).substring(2, 9),
      }
    })
  }, [vessels])

  // Memoized distance calculation with error handling
  const getVesselDistance = useCallback(
    (vessel: any) => {
      if (!proximityPort) return null

      try {
        const vesselPort = vessel.openPort || vessel.loadPort || ""
        if (!vesselPort) return null
        return calculateVesselProximity(vesselPort, proximityPort)
      } catch (error) {
        console.warn("Error calculating vessel proximity:", error)
        return null
      }
    },
    [proximityPort],
  )

  // Handle sorting with proper data access
  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        setSortColumn(column)
        setSortDirection("asc")
      }
    },
    [sortColumn, sortDirection],
  )

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedVessels(normalizedVessels.map((v) => v.id))
      } else {
        setSelectedVessels([])
      }
    },
    [normalizedVessels],
  )

  // Handle select one
  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedVessels((prev) => [...prev, id])
    } else {
      setSelectedVessels((prev) => prev.filter((v) => v !== id))
    }
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback(
    (vesselId: string) => {
      const newFavorites = new Set(favorites)
      if (newFavorites.has(vesselId)) {
        newFavorites.delete(vesselId)
      } else {
        newFavorites.add(vesselId)
      }
      setFavorites(newFavorites)
    },
    [favorites],
  )

  // Quick actions with proper data handling
  const handleCall = useCallback((phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== "N/A") {
      window.open(`tel:${phoneNumber}`, "_self")
    }
  }, [])

  const handleEmail = useCallback((email: string) => {
    if (email && email !== "N/A") {
      window.open(`mailto:${email}`, "_self")
    }
  }, [])

  const handleCopy = useCallback((vessel: any) => {
    const display = vessel.display || createDisplayVessel(vessel)

    const vesselInfo = `${display.vesselName} - ${display.vesselType} ${display.vesselSize}
Open: ${display.openPort} (${display.openDates})
Contact: ${display.brokerName} - ${display.company}
Phone: ${display.phoneNumber}
Email: ${display.email}`

    navigator.clipboard.writeText(vesselInfo)
  }, [])

  // Get distance badge styling with error handling
  const getDistanceBadge = useCallback((distance: number | null) => {
    if (distance === null) return null

    let colorClass = ""
    let label = ""

    if (distance <= 50) {
      colorClass = "bg-green-100 text-green-800 border-green-200"
      label = "Very Close"
    } else if (distance <= 100) {
      colorClass = "bg-blue-100 text-blue-800 border-blue-200"
      label = "Close"
    } else if (distance <= 200) {
      colorClass = "bg-amber-100 text-amber-800 border-amber-200"
      label = "Moderate"
    } else if (distance <= 500) {
      colorClass = "bg-orange-100 text-orange-800 border-orange-200"
      label = "Far"
    } else {
      colorClass = "bg-red-100 text-red-800 border-red-200"
      label = "Very Far"
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <Badge variant="outline" className={`text-xs ${colorClass}`}>
          {Math.round(distance)} NM
        </Badge>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    )
  }, [])

  // Filter vessels with improved search and proximity handling
  const filteredVessels = useMemo(() => {
    return normalizedVessels.filter((vessel) => {
      // Search filter with normalized data
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const display = vessel.display || createDisplayVessel(vessel)

        const matchesSearch = Object.values(display).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchLower),
        )

        if (!matchesSearch) return false
      }

      // Proximity filter with error handling
      if (proximityPort && maxDistance !== null) {
        const distance = getVesselDistance(vessel)
        if (distance === null || distance > maxDistance) return false
      }

      return true
    })
  }, [normalizedVessels, searchQuery, proximityPort, maxDistance, getVesselDistance])

  // Sort vessels with proper data access
  const sortedVessels = useMemo(() => {
    const sorted = [...filteredVessels].sort((a, b) => {
      if (!sortColumn) {
        // Default sort by proximity if proximity port is set
        if (proximityPort) {
          const distanceA = getVesselDistance(a) || 999999
          const distanceB = getVesselDistance(b) || 999999
          return distanceA - distanceB
        }
        return 0
      }

      let valueA: any
      let valueB: any

      switch (sortColumn) {
        case "name":
          valueA = a.vesselName || ""
          valueB = b.vesselName || ""
          break
        case "proximity":
          valueA = getVesselDistance(a) || 999999
          valueB = getVesselDistance(b) || 999999
          break
        case "openDate":
          valueA = a.openDates || a.laycanStart || ""
          valueB = b.openDates || b.laycanStart || ""
          break
        case "dwt":
          valueA = a.vesselSize || 0
          valueB = b.vesselSize || 0
          break
        case "buildYear":
          valueA = a.vesselAge ? new Date().getFullYear() - a.vesselAge : 0
          valueB = b.vesselAge ? new Date().getFullYear() - b.vesselAge : 0
          break
        case "openLoc":
          valueA = a.openPort || ""
          valueB = b.openPort || ""
          break
        case "operator":
          valueA = a.brokerName || a.company || ""
          valueB = b.brokerName || b.company || ""
          break
        default:
          return 0
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredVessels, sortColumn, sortDirection, proximityPort, getVesselDistance])

  // Get freight rate display with proper formatting
  const getFreightRate = useCallback((vessel: any) => {
    const rate = vessel.freightRate

    if (!rate || rate <= 0) {
      return <span className="text-slate-400 text-sm">N/A</span>
    }

    return (
      <div className="space-y-1">
        <div className="font-medium text-green-600 dark:text-green-400">${Number(rate).toLocaleString()}</div>
        <div className="text-xs text-slate-500">/day</div>
      </div>
    )
  }, [])

  // Bulk actions
  const handleBulkAction = useCallback(
    (action: string) => {
      console.log(`Bulk action: ${action} on vessels:`, selectedVessels)
    },
    [selectedVessels],
  )

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Enhanced Toolbar with Proximity Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Left side buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Columns className="h-4 w-4 mr-2 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">COLUMNS</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9 px-3">
              <Filter className="h-4 w-4 mr-2 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">FILTERS</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9 px-3">
              <Download className="h-4 w-4 mr-2 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">EXPORT</span>
            </Button>

            {/* Bulk actions */}
            {selectedVessels.length > 0 && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-slate-600">{selectedVessels.length} selected</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("export")}>Export Selected</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("favorite")}>Add to Favorites</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("compare")}>Compare Vessels</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedVessels([])}>Clear Selection</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Right side search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search vessels, ports, brokers..."
              className="pl-10 h-9 w-[300px] border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Proximity Controls - Prominent Position */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Proximity Search</span>
            </div>

            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Enter load port (e.g., Santos, Singapore)"
                  className="pl-10 h-9 border-slate-200 dark:border-slate-700"
                  value={proximityPort}
                  onChange={(e) => setProximityPort(e.target.value)}
                />
              </div>

              <Select
                value={maxDistance?.toString() || "none"}
                onValueChange={(value) => setMaxDistance(value ? Number.parseInt(value) : null)}
              >
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Max Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Limit</SelectItem>
                  <SelectItem value="50">Within 50 NM</SelectItem>
                  <SelectItem value="100">Within 100 NM</SelectItem>
                  <SelectItem value="200">Within 200 NM</SelectItem>
                  <SelectItem value="500">Within 500 NM</SelectItem>
                </SelectContent>
              </Select>

              {proximityPort && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProximityPort("")
                    setMaxDistance(null)
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {proximityPort && (
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {filteredVessels.length} vessels found
                {maxDistance && ` within ${maxDistance} NM`}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
                <th className="w-10 p-3 text-left">
                  <Checkbox
                    checked={selectedVessels.length === normalizedVessels.length && normalizedVessels.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all vessels"
                    className="border-slate-300 dark:border-slate-600"
                  />
                </th>
                <th className="w-8 p-3 text-left">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ★
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("name")}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    Vessel Name {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                </th>
                {proximityPort && (
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("proximity")}>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:text-blue-700 dark:hover:text-blue-300">
                      Distance to {proximityPort} {sortColumn === "proximity" && (sortDirection === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                )}
                <th className="p-3 text-left">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Freight Rate
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("openDate")}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    Open Date {sortColumn === "openDate" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("dwt")}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    DWT (t) {sortColumn === "dwt" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("buildYear")}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    Built {sortColumn === "buildYear" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("openLoc")}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    Open Location {sortColumn === "openLoc" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                </th>
                <th className="p-3 text-left">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Last Cargo
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("operator")}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    Broker {sortColumn === "operator" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                </th>
                <th className="p-3 text-left">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quick Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVessels.map((vessel, index) => {
                const isSelected = selectedVessels.includes(vessel.id)
                const isFavorite = favorites.has(vessel.id)
                const display = vessel.display || createDisplayVessel(vessel)
                const distance = getVesselDistance(vessel)

                return (
                  <tr
                    key={vessel.id}
                    className={cn(
                      "border-b border-slate-200 dark:border-slate-700 transition-colors",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : index % 2 === 0
                          ? "bg-white dark:bg-slate-900"
                          : "bg-slate-50/50 dark:bg-slate-800/20",
                      "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
                      // Highlight very close vessels
                      distance !== null && distance <= 50 && "ring-1 ring-green-200 bg-green-50/30",
                    )}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(vessel.id, !!checked)}
                        aria-label={`Select ${display.vesselName}`}
                        className="border-slate-300 dark:border-slate-600"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleFavorite(vessel.id)}
                        className={cn(
                          "text-lg transition-colors",
                          isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-slate-300 hover:text-yellow-400",
                        )}
                      >
                        {isFavorite ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                          onClick={() => onView && onView(vessel)}
                        >
                          {display.vesselName}
                        </div>
                        <div className="text-xs text-slate-500">{display.vesselType}</div>
                      </div>
                    </td>
                    {proximityPort && <td className="p-3">{getDistanceBadge(distance)}</td>}
                    <td className="p-3">{getFreightRate(vessel)}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{display.openDates}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                      {vessel.vesselSize ? (vessel.vesselSize * 1000).toLocaleString() : "N/A"}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {vessel.vesselAge ? new Date().getFullYear() - vessel.vesselAge : "N/A"}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{display.openPort}</td>
                    <td className="p-3">
                      {display.lastCargo !== "N/A" ? (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700 text-xs"
                        >
                          {display.lastCargo}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                          {display.brokerName}
                        </div>
                        {display.company !== "N/A" && <div className="text-xs text-slate-500">{display.company}</div>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {display.phoneNumber !== "N/A" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleCall(display.phoneNumber)}
                            title={`Call ${display.phoneNumber}`}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {display.email !== "N/A" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEmail(display.email)}
                            title={`Email ${display.email}`}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopy(vessel)}
                          title="Copy vessel details"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              Rows per page:
              <Select defaultValue="50">
                <SelectTrigger className="w-16 h-8 ml-2 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing {sortedVessels.length} of {normalizedVessels.length} vessels
              {proximityPort && maxDistance && ` within ${maxDistance} NM of ${proximityPort}`}
            </div>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            1-{sortedVessels.length} of {normalizedVessels.length}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 dark:border-slate-700" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 dark:border-slate-700" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
