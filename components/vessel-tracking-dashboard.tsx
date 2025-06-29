"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Map,
  List,
  Info,
  Plus,
  Ship,
  Anchor,
  FilterIcon,
  ChevronDown,
  BarChart3,
  Globe,
  Layers,
  Compass,
  MapPin,
} from "lucide-react"
import { mockVesselData } from "@/lib/mock-vessel-data"
import { VesselMap } from "@/components/vessel-map"
import { VesselDetailPanel } from "@/components/vessel-detail-panel"
import { VesselTableNew } from "@/components/vessel-table-new"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export function VesselTrackingDashboard() {
  const { toast } = useToast()
  const [selectedVessel, setSelectedVessel] = useState(mockVesselData[0])
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"map" | "list" | "table">("table")
  const isMobile = useIsMobile()

  const handleVesselSelect = (vessel) => {
    setSelectedVessel(vessel)
    setShowDetailPanel(true)
  }

  const handleEdit = (vessel) => {
    toast({
      title: "Editing vessel",
      description: `${vessel.name || vessel.vesselName || vessel.vesselType}`,
    })
  }

  const handleDelete = (id) => {
    toast({
      title: "Deleting vessel",
      description: `Vessel ID: ${id}`,
    })
  }

  const vesselStatusColor = {
    underway: "bg-green-500",
    anchored: "bg-yellow-500",
    moored: "bg-blue-500",
    offline: "bg-gray-500",
  }

  return (
    <div className="container px-4 md:px-6 max-w-screen-2xl">
      <div className="flex flex-col space-y-4">
        {/* Dashboard Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Ship className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Vessel Tracking
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                Track and manage your fleet with real-time vessel positions, status updates, and detailed information.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FilterIcon className="h-4 w-4 mr-2 text-slate-500" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-1 text-slate-400 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              </Button>

              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Vessel
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <Ship className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Vessels</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mockVesselData.length}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <Anchor className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Available</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {mockVesselData.filter((v) => v.status === "available" || v.status === "clean").length}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <Globe className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Regions</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">5</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Utilization</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">87%</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {filterOpen && (
          <Card className="mb-4 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <FilterIcon className="h-5 w-5 mr-2 text-slate-500" />
                Filter Vessels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Vessel Type
                </label>
                <Select defaultValue="all">
                  <SelectTrigger className="border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cargo">Cargo</SelectItem>
                    <SelectItem value="tanker">Tanker</SelectItem>
                    <SelectItem value="passenger">Passenger</SelectItem>
                    <SelectItem value="fishing">Fishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger className="border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="underway">Underway</SelectItem>
                    <SelectItem value="anchored">Anchored</SelectItem>
                    <SelectItem value="moored">Moored</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">Region</label>
                <Select defaultValue="all">
                  <SelectTrigger className="border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north_atlantic">North Atlantic</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="pacific">Pacific</SelectItem>
                    <SelectItem value="indian">Indian Ocean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Speed Range (knots)
                </label>
                <Slider defaultValue={[0, 30]} min={0} max={30} step={1} className="mt-6" />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-slate-500">0 kn</span>
                  <span className="text-xs text-slate-500">30 kn</span>
                </div>
              </div>
              <div className="md:col-span-4 flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700">
                  Reset
                </Button>
                <Button size="sm">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode Selector */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Vessel List</h3>
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            >
              {mockVesselData.length} vessels
            </Badge>
          </div>

          <Tabs value={viewMode} className="w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger
                value="table"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                  "data-[state=active]:shadow-sm",
                )}
              >
                <Layers className="h-4 w-4" />
                <span className="hidden md:inline">Table View</span>
              </TabsTrigger>
              <TabsTrigger
                value="map"
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                  "data-[state=active]:shadow-sm",
                )}
              >
                <Map className="h-4 w-4" />
                <span className="hidden md:inline">Map View</span>
              </TabsTrigger>
              <TabsTrigger
                value="list"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                  "data-[state=active]:shadow-sm",
                )}
              >
                <List className="h-4 w-4" />
                <span className="hidden md:inline">List View</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {viewMode === "table" && (
            <VesselTableNew
              vessels={mockVesselData}
              onView={handleVesselSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {viewMode === "map" && (
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-slate-500" />
                  Vessel Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[600px]">
                  <VesselMap vessels={mockVesselData} onVesselSelect={handleVesselSelect} />

                  {!isMobile && showDetailPanel && (
                    <div className="absolute top-4 right-4 w-96 z-10">
                      <VesselDetailPanel vessel={selectedVessel} onClose={() => setShowDetailPanel(false)} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "list" && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4">
                <CardTitle className="text-lg font-medium flex items-center">
                  <List className="h-5 w-5 mr-2 text-slate-500" />
                  Vessel List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          Vessel Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          IMO
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          Speed
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          Location
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockVesselData.map((vessel, index) => (
                        <tr
                          key={vessel.id}
                          className={cn(
                            "border-b border-slate-200 dark:border-slate-700",
                            index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/20",
                            "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
                          )}
                        >
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{vessel.name}</td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700"
                            >
                              {vessel.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{vessel.imo}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${vesselStatusColor[vessel.status]}`}></div>
                              <span className="capitalize text-slate-700 dark:text-slate-300">{vessel.status}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{vessel.speed} kn</td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                              {vessel.location}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => handleVesselSelect(vessel)}
                            >
                              <Info className="h-4 w-4 mr-2 text-blue-500" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isMobile && showDetailPanel && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <VesselDetailPanel vessel={selectedVessel} onClose={() => setShowDetailPanel(false)} fullScreen={true} />
        </div>
      )}
    </div>
  )
}
