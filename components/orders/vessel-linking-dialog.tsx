"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useOfferStore } from "@/lib/store/offer-store"
import { useOrderStore } from "@/lib/store/order-store"
import type { Order, LinkedVessel } from "@/lib/store/order-store"
import {
  Ship,
  Search,
  Plus,
  X,
  MapPin,
  Calendar,
  Anchor,
  CheckCircle,
  AlertTriangle,
  Zap,
  DollarSign,
  BarChart3,
  Filter,
  Loader2,
  ArrowUpDown,
  Flag,
  Clock,
  Info,
  CheckSquare,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { aiMatchingEngine, type VesselMatch } from "@/lib/ai-matching-engine"
import { calculateVesselProximity } from "@/lib/enhanced-matching"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VesselLinkingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function VesselLinkingDialog({ open, onOpenChange, order }: VesselLinkingDialogProps) {
  const { offers } = useOfferStore()
  const { linkVesselToOrder, unlinkVesselFromOrder, getOrderById } = useOrderStore()

  // Get the latest order data
  const currentOrder = getOrderById(order.id) || order

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVesselId, setSelectedVesselId] = useState<string>("")
  const [vesselStatus, setVesselStatus] = useState<string>("Shortlisted")
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("manual")
  const [aiRecommendations, setAiRecommendations] = useState<VesselMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [appliedMatches, setAppliedMatches] = useState<string[]>([])
  const [isLinking, setIsLinking] = useState(false)
  const [filters, setFilters] = useState({
    dwtMin: "",
    dwtMax: "",
    maxDistance: "",
    vesselType: "Any type",
    maxAge: "",
    flag: "Any flag",
    availableFrom: "",
    availableTo: "",
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState<string>("distance")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([])

  // Get available vessels (not already linked to this order)
  const linkedVesselIds = currentOrder.linkedVessels?.map((v) => v.vesselId) || []

  const availableVessels = useMemo(() => {
    console.log("Filtering vessels. Total offers:", offers.length, "Linked vessel IDs:", linkedVesselIds)

    const filteredVessels = offers.filter((vessel) => {
      // Skip already linked vessels
      if (linkedVesselIds.includes(vessel.id)) {
        return false
      }

      // Basic text search
      const matchesSearch =
        !searchTerm ||
        vessel.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.openPort?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.vesselType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.loadPort?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.dischargePort?.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // DWT filtering
      if (filters.dwtMin && vessel.vesselSize && vessel.vesselSize * 1000 < Number.parseInt(filters.dwtMin))
        return false
      if (filters.dwtMax && vessel.vesselSize && vessel.vesselSize * 1000 > Number.parseInt(filters.dwtMax))
        return false

      // Distance filtering
      if (filters.maxDistance && vessel.openPort && order.loadPort) {
        const distance = calculateVesselProximity(vessel.openPort, order.loadPort)
        if (distance && distance > Number.parseInt(filters.maxDistance)) return false
      }

      // Vessel type filtering
      if (filters.vesselType && filters.vesselType !== "Any type" && vessel.vesselType !== filters.vesselType)
        return false

      // Age filtering
      if (filters.maxAge && vessel.vesselAge && vessel.vesselAge > Number.parseInt(filters.maxAge)) return false

      // Flag filtering
      if (filters.flag && filters.flag !== "Any flag" && vessel.vesselFlag !== filters.flag) return false

      return true
    })

    // Sort vessels
    return filteredVessels.sort((a, b) => {
      if (sortBy === "distance") {
        const distanceA = calculateVesselProximity(a.openPort || a.loadPort || "", order.loadPort) || 9999
        const distanceB = calculateVesselProximity(b.openPort || b.loadPort || "", order.loadPort) || 9999
        return sortDirection === "asc" ? distanceA - distanceB : distanceB - distanceA
      } else if (sortBy === "dwt") {
        const dwtA = a.vesselSize || 0
        const dwtB = b.vesselSize || 0
        return sortDirection === "asc" ? dwtA - dwtB : dwtB - dwtA
      } else if (sortBy === "age") {
        const ageA = a.vesselAge || 0
        const ageB = b.vesselAge || 0
        return sortDirection === "asc" ? ageA - ageB : ageB - ageA
      } else if (sortBy === "name") {
        const nameA = a.vesselName || ""
        const nameB = b.vesselName || ""
        return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
      return 0
    })
  }, [offers, linkedVesselIds, searchTerm, filters, order.loadPort, sortBy, sortDirection])

  // Generate AI recommendations when the dialog opens
  useEffect(() => {
    if (open && activeTab === "ai") {
      generateAiRecommendations()
    }
  }, [open, activeTab, order.id])

  const generateAiRecommendations = async () => {
    setIsLoading(true)
    try {
      // Filter available vessels (not already linked)
      const availableVesselsForAI = offers.filter((vessel) => !linkedVesselIds.includes(vessel.id))

      // Generate matches for this specific order
      const matches: VesselMatch[] = []
      for (const vessel of availableVesselsForAI) {
        const match = aiMatchingEngine.matchVesselToOrder(vessel, order)
        if (match.matchScore >= 60) {
          // Only include matches above threshold
          matches.push(match)
        }
      }

      // Sort by match score descending
      const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore)
      setAiRecommendations(sortedMatches)

      if (sortedMatches.length === 0) {
        toast({
          title: "No AI recommendations found",
          description: "Try adding more vessels or adjusting order requirements",
        })
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      toast({
        title: "Error generating recommendations",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkVessel = async () => {
    if (!selectedVesselId) {
      toast({
        title: "No vessel selected",
        description: "Please select a vessel to link to this order.",
        variant: "destructive",
      })
      return
    }

    const vessel = offers.find((v) => v.id === selectedVesselId)
    if (!vessel) {
      toast({
        title: "Vessel not found",
        description: "The selected vessel could not be found.",
        variant: "destructive",
      })
      return
    }

    setIsLinking(true)
    try {
      const linkedVessel: LinkedVessel = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vesselId: vessel.id,
        vesselName: vessel.vesselName || "Unknown Vessel",
        name: vessel.vesselName || "Unknown Vessel",
        vesselType: vessel.vesselType || "Unknown Type",
        dwt: (vessel.vesselSize || 0) * 1000,
        built: vessel.buildYear || (vessel.vesselAge ? new Date().getFullYear() - vessel.vesselAge : undefined),
        flag: vessel.vesselFlag || "Unknown",
        openPort: vessel.openPort || vessel.loadPort || "Unknown",
        laycanStart: vessel.laycanStart ? vessel.laycanStart : undefined,
        laycanEnd: vessel.laycanEnd ? vessel.laycanEnd : undefined,
        status: vesselStatus as any,
        linkedAt: new Date().toISOString(),
        notes: notes,
        matchScore: Math.floor(Math.random() * 3) + 8, // Random score between 8-10
      }

      linkVesselToOrder(order.id, linkedVessel)

      // Reset form
      setSelectedVesselId("")
      setVesselStatus("Shortlisted")
      setNotes("")

      toast({
        title: "Vessel linked successfully",
        description: `${vessel.vesselName} has been linked to this order.`,
      })
    } catch (error) {
      console.error("Error linking vessel:", error)
      toast({
        title: "Error linking vessel",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleApplyMatch = (match: VesselMatch) => {
    const matchKey = `${match.vessel.id}-${match.order.id}`

    // Skip if already applied
    if (appliedMatches.includes(matchKey)) return

    try {
      // Create a properly formatted linked vessel object
      const linkedVessel: LinkedVessel = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vesselId: match.vessel.id,
        vesselName: match.vessel.vesselName || "Unknown Vessel",
        name: match.vessel.vesselName || "Unknown Vessel",
        vesselType: match.vessel.vesselType || "Bulk Carrier",
        dwt: (match.vessel.vesselSize || 0) * 1000,
        built: match.vessel.vesselAge ? new Date().getFullYear() - match.vessel.vesselAge : 2010,
        flag: match.vessel.vesselFlag || "Unknown",
        openPort: match.vessel.openPort || match.vessel.loadPort || "Unknown",
        laycanStart: match.vessel.laycanStart ? match.vessel.laycanStart : undefined,
        laycanEnd: match.vessel.laycanEnd ? match.vessel.laycanEnd : undefined,
        status: "Shortlisted",
        linkedAt: new Date().toISOString(),
        notes: `AI Match - ${match.matchScore}% confidence`,
        matchScore: Math.round(match.matchScore / 10),
      }

      linkVesselToOrder(order.id, linkedVessel)

      // Track that this match has been applied
      setAppliedMatches((prev) => [...prev, matchKey])

      toast({
        title: "Match applied",
        description: `${match.vessel.vesselName || "Vessel"} linked to this order`,
      })
    } catch (error) {
      console.error("Error applying match:", error)
      toast({
        title: "Error",
        description: "Failed to apply match. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUnlinkVessel = (vesselId: string) => {
    const vessel = currentOrder.linkedVessels?.find((v) => v.id === vesselId)

    try {
      unlinkVesselFromOrder(order.id, vesselId)

      toast({
        title: "Vessel unlinked",
        description: `${vessel?.vesselName || "Vessel"} has been removed from this order.`,
      })
    } catch (error) {
      console.error("Error unlinking vessel:", error)
      toast({
        title: "Error unlinking vessel",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilters({
      dwtMin: "",
      dwtMax: "",
      maxDistance: "",
      vesselType: "Any type",
      maxAge: "",
      flag: "Any flag",
      availableFrom: "",
      availableTo: "",
    })
    toast({
      title: "Filters cleared",
      description: "All filters have been reset",
    })
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Offered":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "Nominated":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-600"
    if (score >= 75) return "bg-blue-600"
    if (score >= 60) return "bg-amber-600"
    return "bg-gray-400"
  }

  const getMatchQuality = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-700" }
    if (score >= 75) return { label: "Good", color: "text-blue-700" }
    if (score >= 60) return { label: "Fair", color: "text-amber-700" }
    return { label: "Poor", color: "text-gray-700" }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-700 bg-green-50 border-green-200"
      case "Medium":
        return "text-amber-700 bg-amber-50 border-amber-200"
      case "High":
        return "text-red-700 bg-red-50 border-red-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const isMatchApplied = (match: VesselMatch) => {
    return appliedMatches.includes(`${match.vessel.id}-${match.order.id}`)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== "Any type" && v !== "Any flag") || searchTerm

  const getDistanceColor = (distance: number | null) => {
    if (distance === null) return "text-gray-500"
    if (distance <= 50) return "text-green-600"
    if (distance <= 100) return "text-blue-600"
    if (distance <= 200) return "text-amber-600"
    return "text-red-600"
  }

  const getDistanceBadgeColor = (distance: number | null) => {
    if (distance === null) return "bg-gray-100 text-gray-700"
    if (distance <= 50) return "bg-green-100 text-green-700"
    if (distance <= 100) return "bg-blue-100 text-blue-700"
    if (distance <= 200) return "bg-amber-100 text-amber-700"
    return "bg-red-100 text-red-700"
  }

  // Quick filter presets
  const dwtPresets = [
    { name: "Handysize", min: 10000, max: 40000 },
    { name: "Handymax", min: 40000, max: 65000 },
    { name: "Panamax", min: 65000, max: 100000 },
    { name: "Capesize", min: 100000, max: 400000 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Link Vessels to Order #{order.id.slice(-4)}
          </DialogTitle>
          <DialogDescription>
            Search and link vessels to this {order.cargoType} order from {order.loadPort} to {order.dischargePort}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="mb-4">
            <TabsTrigger value="manual">
              <Search className="h-4 w-4 mr-2" />
              Manual Selection
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Zap className="h-4 w-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Search & Filters */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">Available Vessels</h3>
                  <div className="text-sm text-muted-foreground">
                    {availableVessels.length} vessels available
                    {hasActiveFilters && (
                      <span className="text-blue-600 ml-1">
                        (filtered from {offers.filter((v) => !linkedVesselIds.includes(v.id)).length})
                      </span>
                    )}
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search vessels by name, port, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                      <Filter className="h-4 w-4" />
                    </Button>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Quick Size Filters */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground self-center">Quick filters:</span>
                    {dwtPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant={
                          filters.dwtMin === preset.min.toString() && filters.dwtMax === preset.max.toString()
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            dwtMin: preset.min.toString(),
                            dwtMax: preset.max.toString(),
                          }))
                        }
                      >
                        {preset.name}
                        <span className="ml-1 text-xs opacity-70">
                          ({(preset.min / 1000).toFixed(0)}-{(preset.max / 1000).toFixed(0)}k)
                        </span>
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          dwtMin: "",
                          dwtMax: "",
                        }))
                      }
                      className="text-muted-foreground"
                    >
                      Clear Size
                    </Button>
                  </div>

                  {showAdvancedFilters && (
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">DWT Range</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Min DWT"
                              value={filters.dwtMin}
                              onChange={(e) => setFilters((prev) => ({ ...prev, dwtMin: e.target.value }))}
                              type="number"
                            />
                            <Input
                              placeholder="Max DWT"
                              value={filters.dwtMax}
                              onChange={(e) => setFilters((prev) => ({ ...prev, dwtMax: e.target.value }))}
                              type="number"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Max Distance from Load Port</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nautical miles"
                              value={filters.maxDistance}
                              onChange={(e) => setFilters((prev) => ({ ...prev, maxDistance: e.target.value }))}
                              type="number"
                            />
                            <span className="text-sm text-muted-foreground self-center">NM</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Vessel Type</Label>
                          <Select
                            value={filters.vesselType}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, vesselType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Any type">Any type</SelectItem>
                              <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                              <SelectItem value="Container">Container</SelectItem>
                              <SelectItem value="Tanker">Tanker</SelectItem>
                              <SelectItem value="General Cargo">General Cargo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Max Age</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Years"
                              value={filters.maxAge}
                              onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: e.target.value }))}
                              type="number"
                            />
                            <span className="text-sm text-muted-foreground self-center">years</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Flag</Label>
                        <Select
                          value={filters.flag}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, flag: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any flag" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any flag">Any flag</SelectItem>
                            <SelectItem value="Panama">Panama</SelectItem>
                            <SelectItem value="Liberia">Liberia</SelectItem>
                            <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="Malta">Malta</SelectItem>
                            <SelectItem value="Bahamas">Bahamas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vessel List */}
                <div className="border rounded-lg overflow-hidden">
                  {/* Enhanced Table Header with better sorting */}
                  <div className="bg-muted/50 border-b px-4 py-2.5 grid grid-cols-12 gap-2 text-sm font-medium">
                    <div className="col-span-1">
                      <Checkbox
                        checked={
                          availableVessels.length > 0 && availableVessels.every((v) => selectedVesselIds.includes(v.id))
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedVesselIds(availableVessels.map((v) => v.id))
                          } else {
                            setSelectedVesselIds([])
                          }
                        }}
                      />
                    </div>
                    <div
                      className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-primary"
                      onClick={() => toggleSort("name")}
                    >
                      Vessel Details
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortBy === "name" ? "text-primary" : "text-muted-foreground"}`}
                      />
                      {sortBy === "name" && <span className="text-xs">{sortDirection === "asc" ? "A-Z" : "Z-A"}</span>}
                    </div>
                    <div
                      className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary"
                      onClick={() => toggleSort("dwt")}
                    >
                      Size & Age
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortBy === "dwt" ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div
                      className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary"
                      onClick={() => toggleSort("distance")}
                    >
                      Location
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortBy === "distance" ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div
                      className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary"
                      onClick={() => toggleSort("rate")}
                    >
                      Commercial
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortBy === "rate" ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Vessel Rows */}
                  <ScrollArea className="h-[400px]">
                    {/* Bulk Actions */}
                    {selectedVesselIds.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              {selectedVesselIds.length} vessel{selectedVesselIds.length !== 1 ? "s" : ""} selected
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                selectedVesselIds.forEach((vesselId) => {
                                  const vessel = offers.find((v) => v.id === vesselId)
                                  if (vessel) {
                                    const linkedVessel: LinkedVessel = {
                                      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                      vesselId: vessel.id,
                                      vesselName: vessel.vesselName || "Unknown Vessel",
                                      name: vessel.vesselName || "Unknown Vessel",
                                      vesselType: vessel.vesselType || "Unknown Type",
                                      dwt: (vessel.vesselSize || 0) * 1000,
                                      built:
                                        vessel.buildYear ||
                                        (vessel.vesselAge ? new Date().getFullYear() - vessel.vesselAge : undefined),
                                      flag: vessel.vesselFlag || "Unknown",
                                      openPort: vessel.openPort || vessel.loadPort || "Unknown",
                                      laycanStart: vessel.laycanStart ? vessel.laycanStart : undefined,
                                      laycanEnd: vessel.laycanEnd ? vessel.laycanEnd : undefined,
                                      status: "Shortlisted",
                                      linkedAt: new Date().toISOString(),
                                      notes: "Bulk linked",
                                      matchScore: Math.floor(Math.random() * 3) + 8,
                                    }
                                    linkVesselToOrder(order.id, linkedVessel)
                                  }
                                })
                                setSelectedVesselIds([])
                                toast({
                                  title: "Vessels linked",
                                  description: `${selectedVesselIds.length} vessels linked to this order`,
                                })
                              }}
                            >
                              Link All Selected
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedVesselIds([])}>
                              Clear Selection
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {availableVessels.length === 0 ? (
                      <div className="text-center py-8">
                        <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-muted-foreground">No vessels match your criteria</h3>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    ) : (
                      /* Enhanced Vessel Rows with more information */
                      availableVessels.map((vessel) => {
                        const distance = calculateVesselProximity(
                          vessel.openPort || vessel.loadPort || "",
                          order.loadPort,
                        )
                        const isSelected = selectedVesselIds.includes(vessel.id)

                        return (
                          <div
                            key={vessel.id}
                            className={`px-4 py-3 grid grid-cols-12 gap-2 border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                              isSelected ? "bg-blue-50 border-blue-200" : ""
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedVesselIds((prev) => prev.filter((id) => id !== vessel.id))
                              } else {
                                setSelectedVesselIds((prev) => [...prev, vessel.id])
                              }
                            }}
                          >
                            <div className="col-span-1 flex items-center">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}} // Handled by row click
                              />
                            </div>
                            <div className="col-span-3">
                              <div className="font-medium text-sm">{vessel.vesselName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{vessel.vesselType}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Flag className="h-3 w-3" />
                                  {vessel.vesselFlag || "Unknown"}
                                </span>
                              </div>
                              {vessel.imo && <div className="text-xs text-muted-foreground">IMO: {vessel.imo}</div>}
                            </div>
                            <div className="col-span-2">
                              <div className="text-sm font-medium">{vessel.vesselSize?.toLocaleString()}k DWT</div>
                              <div className="text-xs text-muted-foreground">
                                {vessel.vesselAge ? `${vessel.vesselAge} years` : "Age unknown"}
                              </div>
                              {vessel.buildYear && (
                                <div className="text-xs text-muted-foreground">Built {vessel.buildYear}</div>
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="text-sm">{vessel.openPort || vessel.loadPort || "Unknown"}</div>
                              {distance !== null && (
                                <Badge variant="outline" className={`text-xs ${getDistanceBadgeColor(distance)}`}>
                                  {Math.round(distance)} NM
                                </Badge>
                              )}
                              <div className="text-xs text-muted-foreground">{vessel.openDates || "Available now"}</div>
                            </div>
                            <div className="col-span-2">
                              {vessel.freightRate && (
                                <div className="text-sm font-medium">${vessel.freightRate.toLocaleString()}/day</div>
                              )}
                              {vessel.brokerName && (
                                <div className="text-xs text-muted-foreground">{vessel.brokerName}</div>
                              )}
                              {vessel.company && <div className="text-xs text-muted-foreground">{vessel.company}</div>}
                            </div>
                            <div className="col-span-2 flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-80">
                                    <div className="space-y-3">
                                      <div className="font-medium">{vessel.vesselName}</div>
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <div className="font-medium text-xs text-muted-foreground uppercase">
                                            Vessel
                                          </div>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Ship className="h-3 w-3" />
                                            <span>{vessel.vesselType}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Anchor className="h-3 w-3" />
                                            <span>{vessel.vesselSize}k DWT</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Flag className="h-3 w-3" />
                                            <span>{vessel.vesselFlag || "Unknown"}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <div className="font-medium text-xs text-muted-foreground uppercase">
                                            Position
                                          </div>
                                          <div className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{vessel.openPort || vessel.loadPort || "Unknown"}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{vessel.openDates || "Available now"}</span>
                                          </div>
                                          {distance && (
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">Distance: {Math.round(distance)} NM</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {vessel.lastCargo && (
                                        <div>
                                          <div className="font-medium text-xs text-muted-foreground uppercase">
                                            Last Cargo
                                          </div>
                                          <div className="text-sm">{vessel.lastCargo}</div>
                                        </div>
                                      )}
                                      {(vessel.brokerName || vessel.company) && (
                                        <div>
                                          <div className="font-medium text-xs text-muted-foreground uppercase">
                                            Contact
                                          </div>
                                          <div className="text-sm">
                                            {vessel.brokerName} {vessel.company && `(${vessel.company})`}
                                          </div>
                                          {vessel.email && (
                                            <div className="text-xs text-muted-foreground">{vessel.email}</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedVesselId(vessel.id)
                                  handleLinkVessel()
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Link
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </ScrollArea>
                </div>
              </div>

              {/* Right Panel - Selected Vessel & Linked Vessels */}
              <div className="space-y-4">
                {/* Selected Vessel */}
                {selectedVesselId && (
                  <div className="border rounded-lg p-4 space-y-4 bg-blue-50/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">Selected Vessel</h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedVesselId("")}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {(() => {
                      const vessel = offers.find((v) => v.id === selectedVesselId)
                      if (!vessel) return null

                      const distance = calculateVesselProximity(
                        vessel.openPort || vessel.loadPort || "",
                        order.loadPort,
                      )

                      return (
                        <div className="space-y-3">
                          <div>
                            <div className="text-lg font-medium">{vessel.vesselName}</div>
                            <div className="text-sm text-muted-foreground">{vessel.vesselType}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Anchor className="h-4 w-4 text-muted-foreground" />
                              <span>{vessel.vesselSize?.toLocaleString()}k DWT</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{vessel.openPort || vessel.loadPort || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{vessel.vesselAge ? `${vessel.vesselAge} years old` : "Age unknown"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flag className="h-4 w-4 text-muted-foreground" />
                              <span>{vessel.vesselFlag || "Unknown flag"}</span>
                            </div>
                          </div>

                          {distance !== null && (
                            <div
                              className={`text-sm font-medium ${getDistanceColor(distance)} flex items-center gap-1`}
                            >
                              <MapPin className="h-4 w-4" />
                              {Math.round(distance)} nautical miles from {order.loadPort}
                            </div>
                          )}

                          <div className="space-y-2 pt-2">
                            <Label>Status</Label>
                            <Select value={vesselStatus} onValueChange={setVesselStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="Contacted">Contacted</SelectItem>
                                <SelectItem value="Offered">Offered</SelectItem>
                                <SelectItem value="Nominated">Nominated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Input
                              placeholder="Add notes about this vessel..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>

                          <Button onClick={handleLinkVessel} disabled={isLinking} className="w-full">
                            {isLinking ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Linking...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Link Vessel to Order
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Linked Vessels */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">
                      Linked Vessels ({currentOrder.linkedVessels?.length || 0})
                    </h3>
                  </div>

                  <ScrollArea className="h-[400px] border rounded-md p-4">
                    {currentOrder.linkedVessels && currentOrder.linkedVessels.length > 0 ? (
                      <div className="space-y-3">
                        {currentOrder.linkedVessels.map((vessel) => (
                          <div key={vessel.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{vessel.vesselName}</div>
                                <div className="text-sm text-muted-foreground">{vessel.vesselType}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnlinkVessel(vessel.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Anchor className="h-3 w-3 text-muted-foreground" />
                                <span>{vessel.dwt?.toLocaleString() || "N/A"} DWT</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{vessel.openPort || "Unknown"}</span>
                              </div>
                              {vessel.built && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span>Built {vessel.built}</span>
                                </div>
                              )}
                              {vessel.matchScore && (
                                <div className="text-green-600 font-medium">Match: {vessel.matchScore}/10</div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={getStatusColor(vessel.status || "Shortlisted")}>
                                {vessel.status || "Shortlisted"}
                              </Badge>
                              {vessel.linkedAt && (
                                <span className="text-xs text-muted-foreground">
                                  Linked {new Date(vessel.linkedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {vessel.notes && (
                              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">{vessel.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-muted-foreground">No vessels linked</h3>
                        <p className="text-sm text-muted-foreground">Select vessels from the list to link them</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-3">Generating recommendations...</span>
              </div>
            ) : aiRecommendations.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium">No AI recommendations available</h3>
                <p className="text-sm text-muted-foreground">Try adding more vessels or adjusting order requirements</p>
                <Button onClick={generateAiRecommendations} className="mt-4">
                  <Zap className="h-4 w-4 mr-2" />
                  Regenerate Recommendations
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {aiRecommendations.length} vessel{aiRecommendations.length !== 1 ? "s" : ""} recommended for this
                    order
                  </h3>
                  <Button size="sm" variant="outline" onClick={generateAiRecommendations}>
                    <Zap className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {aiRecommendations.map((match) => {
                      const quality = getMatchQuality(match.matchScore)
                      return (
                        <Card key={`${match.vessel.id}`} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <Ship className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-medium">{match.vessel.vesselName}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {match.vessel.vesselType}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {match.vessel.vesselSize}k DWT • {match.vessel.vesselAge} years •{" "}
                                    {match.vessel.vesselFlag}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {match.vessel.openPort || match.vessel.loadPort}
                                      {(() => {
                                        const distance = calculateVesselProximity(
                                          match.vessel.openPort || match.vessel.loadPort || "",
                                          match.order.loadPort,
                                        )
                                        if (distance !== null && distance > 0) {
                                          return (
                                            <span
                                              className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                                                distance <= 50
                                                  ? "bg-green-100 text-green-700"
                                                  : distance <= 100
                                                    ? "bg-blue-100 text-blue-700"
                                                    : distance <= 200
                                                      ? "bg-amber-100 text-amber-700"
                                                      : "bg-red-100 text-red-700"
                                              }`}
                                            >
                                              {Math.round(distance)} NM
                                            </span>
                                          )
                                        }
                                        return null
                                      })()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {match.vessel.openDates || "Available now"}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Match Score</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${getScoreColor(match.matchScore)}`}
                                        style={{ width: `${match.matchScore}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-bold text-lg">{match.matchScore}%</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <Badge variant="outline" className={quality.color}>
                                    {quality.label}
                                  </Badge>
                                  <Badge variant="outline" className={getRiskColor(match.riskLevel)}>
                                    {match.riskLevel} Risk
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Strengths
                                </h4>
                                <ul className="space-y-1">
                                  {match.reasons.slice(0, 3).map((reason, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <div className="w-1 h-1 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                  Considerations
                                </h4>
                                {match.warnings.length > 0 ? (
                                  <ul className="space-y-1">
                                    {match.warnings.slice(0, 3).map((warning, i) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                                        <span>{warning}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No significant concerns</p>
                                )}
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="flex justify-between items-center pt-4 bg-muted/20">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Est. Profit:</span>
                                <span className="text-sm font-medium">${match.estimatedProfit.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="text-sm">Confidence: {Math.round(match.confidence * 100)}%</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Button
                                onClick={() => handleApplyMatch(match)}
                                disabled={isMatchApplied(match)}
                                variant={isMatchApplied(match) ? "outline" : "default"}
                              >
                                {isMatchApplied(match) ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Applied
                                  </>
                                ) : (
                                  "Apply Match"
                                )}
                              </Button>
                              {isMatchApplied(match) && (
                                <span className="text-xs text-muted-foreground">Linked to this order</span>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
