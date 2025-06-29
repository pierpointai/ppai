"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Anchor, Search, Ship, MapPin, Navigation, Clock, Info, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useOfferStore } from "@/lib/offer-store"
import { cn } from "@/lib/utils"
import type { Offer } from "@/lib/types"

interface VesselPosition {
  id: string
  vesselName: string
  latitude: number
  longitude: number
  speed: number
  course: number
  destination: string
  eta: string
  lastReport: string
  status: "underway" | "anchored" | "moored" | "unknown"
}

export function VesselPositionTracking() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("map")
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null)
  const [vesselPositions, setVesselPositions] = useState<VesselPosition[]>([])
  const { offers } = useOfferStore()
  const { toast } = useToast()

  // Fetch vessel positions on component mount
  useEffect(() => {
    fetchVesselPositions()
  }, [])

  // Mock function to fetch vessel positions
  // In a real app, this would call a maritime API like MarineTraffic, VesselFinder, etc.
  const fetchVesselPositions = async () => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock vessel positions based on offers
      const positions: VesselPosition[] = offers
        .filter((offer) => offer.vesselName) // Only use offers with vessel names
        .slice(0, 15) // Limit to 15 vessels for demo
        .map((offer) => generateMockPosition(offer))

      setVesselPositions(positions)

      toast({
        title: "Vessel positions updated",
        description: `Tracking ${positions.length} vessels in your fleet`,
      })
    } catch (error) {
      toast({
        title: "Failed to update positions",
        description: "Could not retrieve the latest vessel positions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate mock position data for a vessel
  const generateMockPosition = (offer: Offer): VesselPosition => {
    // Generate random coordinates near the load port or discharge port
    // In a real app, these would come from AIS data
    const isNearLoadPort = Math.random() > 0.5

    // Base coordinates (simplified for demo)
    let baseLat = 0,
      baseLon = 0

    // Very simplified mapping of some regions to coordinates
    if (offer.loadPort.includes("US Gulf")) {
      baseLat = 29.7 + (Math.random() * 2 - 1)
      baseLon = -95.3 + (Math.random() * 2 - 1)
    } else if (offer.loadPort.includes("China") || offer.dischargePort.includes("China")) {
      baseLat = 31.2 + (Math.random() * 2 - 1)
      baseLon = 121.5 + (Math.random() * 2 - 1)
    } else if (offer.loadPort.includes("Australia") || offer.dischargePort.includes("Australia")) {
      baseLat = -33.8 + (Math.random() * 2 - 1)
      baseLon = 151.2 + (Math.random() * 2 - 1)
    } else if (offer.loadPort.includes("Brazil") || offer.dischargePort.includes("Brazil")) {
      baseLat = -23.5 + (Math.random() * 2 - 1)
      baseLon = -46.6 + (Math.random() * 2 - 1)
    } else {
      // Default random position
      baseLat = Math.random() * 60 - 30
      baseLon = Math.random() * 360 - 180
    }

    // Random status
    const statuses: ("underway" | "anchored" | "moored" | "unknown")[] = ["underway", "anchored", "moored", "unknown"]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    // Random speed based on status
    let speed = 0
    if (status === "underway") {
      speed = 10 + Math.random() * 5
    } else if (status === "anchored") {
      speed = Math.random() * 0.5
    } else if (status === "moored") {
      speed = 0
    } else {
      speed = Math.random() * 2
    }

    // Generate a random date in the next 10-30 days for ETA
    const etaDate = new Date()
    etaDate.setDate(etaDate.getDate() + 10 + Math.floor(Math.random() * 20))

    // Random last report time in the last 24 hours
    const lastReportDate = new Date()
    lastReportDate.setHours(lastReportDate.getHours() - Math.floor(Math.random() * 24))

    return {
      id: offer.id,
      vesselName: offer.vesselName || `Unknown Vessel ${offer.id.substring(0, 4)}`,
      latitude: baseLat,
      longitude: baseLon,
      speed: Number.parseFloat(speed.toFixed(1)),
      course: Math.floor(Math.random() * 360),
      destination: isNearLoadPort ? offer.dischargePort : offer.loadPort,
      eta: etaDate.toLocaleDateString(),
      lastReport: lastReportDate.toLocaleString(),
      status,
    }
  }

  // Filter vessels based on search term
  const filteredVessels = vesselPositions.filter((vessel) =>
    vessel.vesselName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "underway":
        return "bg-green-500/20 text-green-700 hover:bg-green-500/20 dark:text-green-400"
      case "anchored":
        return "bg-amber-500/20 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
      case "moored":
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20 dark:text-gray-400"
    }
  }

  return (
    <Card className="border-l-4 border-l-primary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="tracking-tight">Vessel Position Tracking</CardTitle>
              <CardDescription>Real-time vessel positions and movement data</CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 rounded-full transition-all",
              isLoading
                ? "bg-amber-500/20 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                : "bg-green-500/20 text-green-700 hover:bg-green-500/20 dark:text-green-400",
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vessels..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchVesselPositions} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          </Button>
        </div>

        <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="space-y-4">
            <div className="relative w-full h-[300px] bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Interactive map would display here with vessel positions
                </p>
              </div>

              {/* This would be replaced with an actual map component like react-leaflet or Google Maps */}
              <div className="absolute inset-0">
                {filteredVessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className="absolute w-3 h-3 bg-primary rounded-full cursor-pointer hover:scale-150 transition-transform"
                    style={{
                      left: `${((vessel.longitude + 180) / 360) * 100}%`,
                      top: `${((90 - vessel.latitude) / 180) * 100}%`,
                    }}
                    onClick={() => setSelectedVessel(vessel)}
                    title={vessel.vesselName}
                  />
                ))}
              </div>
            </div>

            {selectedVessel && (
              <Card>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{selectedVessel.vesselName}</CardTitle>
                    <Badge variant="outline" className={cn("px-2 py-0.5", getStatusColor(selectedVessel.status))}>
                      {selectedVessel.status.charAt(0).toUpperCase() + selectedVessel.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium">
                          {selectedVessel.latitude.toFixed(4)}°, {selectedVessel.longitude.toFixed(4)}°
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Speed / Course</p>
                        <p className="font-medium">
                          {selectedVessel.speed} knots / {selectedVessel.course}°
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Anchor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Destination</p>
                        <p className="font-medium">{selectedVessel.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">ETA</p>
                        <p className="font-medium">{selectedVessel.eta}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="list">
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredVessels.length > 0 ? (
                filteredVessels.map((vessel) => (
                  <Card
                    key={vessel.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedVessel(vessel)
                      setActiveTab("map")
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{vessel.vesselName}</div>
                        <Badge variant="outline" className={cn("px-2 py-0.5", getStatusColor(vessel.status))}>
                          {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {vessel.latitude.toFixed(2)}°, {vessel.longitude.toFixed(2)}°
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{vessel.speed} knots</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Anchor className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground truncate max-w-[150px]" title={vessel.destination}>
                            {vessel.destination}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">ETA: {vessel.eta}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Ship className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No vessels found</p>
                  <p className="text-sm text-muted-foreground/70">Try adjusting your search or add more vessels</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-muted/10">
        <Button variant="outline" size="sm" onClick={() => setSelectedVessel(null)}>
          <Info className="mr-2 h-4 w-4" />
          Vessel Details
        </Button>
        <Button size="sm" onClick={fetchVesselPositions} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Refresh Positions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
