"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin,
  Navigation,
  Clock,
  Anchor,
  Ship,
  Route,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  Calendar,
  Gauge,
  Waves,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface VesselPosition {
  id: string
  vesselName: string
  imo: string
  vesselType: string
  dwt: number
  flag: string
  currentPort?: string
  coordinates: {
    lat: number
    lng: number
  }
  status: "underway" | "at_anchor" | "in_port" | "loading" | "discharging"
  speed: number
  course: number
  destination?: string
  eta?: Date
  etd?: Date
  lastUpdate: Date
  cargo?: string
  draft: {
    fore: number
    aft: number
  }
  weather: {
    windSpeed: number
    waveHeight: number
    visibility: number
  }
  nextPort?: string
  distance?: number
  fuelConsumption: number
  efficiency: number
}

interface PortCall {
  port: string
  arrival: Date
  departure?: Date
  purpose: "loading" | "discharging" | "bunkers" | "repairs" | "waiting"
  cargo?: string
  quantity?: number
}

export function EnhancedVesselTracking() {
  const [vessels, setVessels] = useState<VesselPosition[]>([])
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Mock vessel data
  useEffect(() => {
    const mockVessels: VesselPosition[] = [
      {
        id: "1",
        vesselName: "MV Ocean Pioneer",
        imo: "9123456",
        vesselType: "Panamax",
        dwt: 76000,
        flag: "Marshall Islands",
        currentPort: "Santos",
        coordinates: { lat: -23.9608, lng: -46.3331 },
        status: "loading",
        speed: 0,
        course: 0,
        destination: "Qingdao",
        eta: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(),
        cargo: "Soybeans",
        draft: { fore: 12.5, aft: 13.2 },
        weather: { windSpeed: 15, waveHeight: 1.2, visibility: 8 },
        nextPort: "Qingdao",
        distance: 11250,
        fuelConsumption: 22.5,
        efficiency: 95,
      },
      {
        id: "2",
        vesselName: "MV Atlantic Carrier",
        imo: "9234567",
        vesselType: "Supramax",
        dwt: 58000,
        flag: "Panama",
        coordinates: { lat: 51.9225, lng: 4.4792 },
        status: "underway",
        speed: 13.2,
        course: 285,
        destination: "New Orleans",
        eta: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
        cargo: "Ballast",
        draft: { fore: 6.8, aft: 7.2 },
        weather: { windSpeed: 22, waveHeight: 2.1, visibility: 6 },
        nextPort: "New Orleans",
        distance: 4850,
        fuelConsumption: 18.3,
        efficiency: 88,
      },
      {
        id: "3",
        vesselName: "MV Nordic Explorer",
        imo: "9345678",
        vesselType: "Kamsarmax",
        dwt: 82000,
        flag: "Singapore",
        currentPort: "Newcastle",
        coordinates: { lat: -32.9283, lng: 151.7817 },
        status: "at_anchor",
        speed: 0,
        course: 0,
        destination: "Yokohama",
        eta: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        etd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
        cargo: "Coal",
        draft: { fore: 14.1, aft: 14.8 },
        weather: { windSpeed: 12, waveHeight: 0.8, visibility: 10 },
        nextPort: "Yokohama",
        distance: 4920,
        fuelConsumption: 0,
        efficiency: 92,
      },
      {
        id: "4",
        vesselName: "MV Global Trader",
        imo: "9456789",
        vesselType: "Capesize",
        dwt: 180000,
        flag: "Liberia",
        coordinates: { lat: 36.1408, lng: 120.3844 },
        status: "underway",
        speed: 14.8,
        course: 195,
        destination: "Port Hedland",
        eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 8 * 60 * 1000),
        cargo: "Ballast",
        draft: { fore: 8.2, aft: 8.9 },
        weather: { windSpeed: 18, waveHeight: 1.5, visibility: 9 },
        nextPort: "Port Hedland",
        distance: 6750,
        fuelConsumption: 28.7,
        efficiency: 91,
      },
      {
        id: "5",
        vesselName: "MV Pacific Star",
        imo: "9567890",
        vesselType: "Handysize",
        dwt: 35000,
        flag: "Hong Kong",
        currentPort: "Houston",
        coordinates: { lat: 29.7604, lng: -95.3698 },
        status: "discharging",
        speed: 0,
        course: 0,
        destination: "Antwerp",
        eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        etd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
        cargo: "Steel Products",
        draft: { fore: 9.8, aft: 10.2 },
        weather: { windSpeed: 8, waveHeight: 0.5, visibility: 12 },
        nextPort: "Antwerp",
        distance: 5200,
        fuelConsumption: 0,
        efficiency: 89,
      },
    ]
    setVessels(mockVessels)
  }, [])

  const filteredVessels = vessels.filter((vessel) => {
    const matchesSearch =
      vessel.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.imo.includes(searchTerm) ||
      vessel.vesselType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vessel.status === statusFilter

    // Simple region matching based on coordinates
    const matchesRegion =
      regionFilter === "all" ||
      (regionFilter === "pacific" && (vessel.coordinates.lng > 100 || vessel.coordinates.lng < -100)) ||
      (regionFilter === "atlantic" && vessel.coordinates.lng >= -100 && vessel.coordinates.lng <= 20) ||
      (regionFilter === "indian" && vessel.coordinates.lng > 20 && vessel.coordinates.lng <= 100)

    return matchesSearch && matchesStatus && matchesRegion
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Simulate AIS data refresh
    setTimeout(() => {
      setVessels((prev) =>
        prev.map((vessel) => ({
          ...vessel,
          lastUpdate: new Date(),
          speed: vessel.status === "underway" ? vessel.speed + (Math.random() - 0.5) * 2 : 0,
          course: vessel.status === "underway" ? vessel.course + (Math.random() - 0.5) * 10 : vessel.course,
          coordinates:
            vessel.status === "underway"
              ? {
                  lat: vessel.coordinates.lat + (Math.random() - 0.5) * 0.1,
                  lng: vessel.coordinates.lng + (Math.random() - 0.5) * 0.1,
                }
              : vessel.coordinates,
        })),
      )
      setIsRefreshing(false)
      toast({
        title: "Vessel positions updated",
        description: "Latest AIS data has been synchronized",
      })
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "underway":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "at_anchor":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "in_port":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "loading":
        return "bg-green-100 text-green-800 border-green-300"
      case "discharging":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "underway":
        return <Navigation className="h-4 w-4" />
      case "at_anchor":
        return <Anchor className="h-4 w-4" />
      case "in_port":
        return <MapPin className="h-4 w-4" />
      case "loading":
        return <CheckCircle2 className="h-4 w-4" />
      case "discharging":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Ship className="h-4 w-4" />
    }
  }

  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? "N" : "S"
    const lngDir = lng >= 0 ? "E" : "W"
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
  }

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString()} nm`
  }

  const formatETA = (eta: Date) => {
    const now = new Date()
    const diffHours = Math.round((eta.getTime() - now.getTime()) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    const remainingHours = diffHours % 24

    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`
    }
    return `${diffHours}h`
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "text-green-600"
    if (efficiency >= 90) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vessel Tracking</h2>
          <p className="text-muted-foreground">Real-time vessel positions and movement data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {vessels.length} vessels tracked
          </Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh AIS
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vessels, IMO, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="underway">Underway</SelectItem>
                <SelectItem value="at_anchor">At Anchor</SelectItem>
                <SelectItem value="in_port">In Port</SelectItem>
                <SelectItem value="loading">Loading</SelectItem>
                <SelectItem value="discharging">Discharging</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="pacific">Pacific</SelectItem>
                <SelectItem value="atlantic">Atlantic</SelectItem>
                <SelectItem value="indian">Indian Ocean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredVessels.map((vessel) => (
            <Card
              key={vessel.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedVessel?.id === vessel.id && "ring-2 ring-primary",
              )}
              onClick={() => setSelectedVessel(vessel)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{vessel.vesselName}</h3>
                      <Badge variant="outline" className={getStatusColor(vessel.status)}>
                        {getStatusIcon(vessel.status)}
                        <span className="ml-1 capitalize">{vessel.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vessel.vesselType} • {vessel.dwt.toLocaleString()} DWT • {vessel.flag}
                    </div>
                    <div className="text-sm text-muted-foreground">IMO: {vessel.imo}</div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">{vessel.speed.toFixed(1)} kts</div>
                    <div className="text-xs text-muted-foreground">Course: {vessel.course}°</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Position</div>
                    <div className="font-medium">
                      {vessel.currentPort || formatCoordinates(vessel.coordinates.lat, vessel.coordinates.lng)}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Destination</div>
                    <div className="font-medium">{vessel.destination || "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">ETA</div>
                    <div className="font-medium">{vessel.eta ? formatETA(vessel.eta) : "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Cargo</div>
                    <div className="font-medium">{vessel.cargo || "N/A"}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated {vessel.lastUpdate.toLocaleTimeString()}</span>
                    </div>
                    {vessel.distance && (
                      <div className="flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        <span>{formatDistance(vessel.distance)} to destination</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      AIS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVessels.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No vessels found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vessel Details Panel */}
        <div className="space-y-4">
          {selectedVessel ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {selectedVessel.vesselName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-medium">{selectedVessel.vesselType}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">DWT</div>
                      <div className="font-medium">{selectedVessel.dwt.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Flag</div>
                      <div className="font-medium">{selectedVessel.flag}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">IMO</div>
                      <div className="font-medium">{selectedVessel.imo}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-muted-foreground text-sm">Current Status</div>
                      <Badge variant="outline" className={getStatusColor(selectedVessel.status)}>
                        {getStatusIcon(selectedVessel.status)}
                        <span className="ml-1 capitalize">{selectedVessel.status.replace("_", " ")}</span>
                      </Badge>
                    </div>

                    <div>
                      <div className="text-muted-foreground text-sm">Position</div>
                      <div className="font-medium">
                        {selectedVessel.currentPort ||
                          formatCoordinates(selectedVessel.coordinates.lat, selectedVessel.coordinates.lng)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground text-sm">Speed</div>
                        <div className="font-medium">{selectedVessel.speed.toFixed(1)} kts</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">Course</div>
                        <div className="font-medium">{selectedVessel.course}°</div>
                      </div>
                    </div>

                    {selectedVessel.destination && (
                      <div>
                        <div className="text-muted-foreground text-sm">Destination</div>
                        <div className="font-medium">{selectedVessel.destination}</div>
                        {selectedVessel.eta && (
                          <div className="text-sm text-muted-foreground">
                            ETA: {selectedVessel.eta.toLocaleDateString()} ({formatETA(selectedVessel.eta)})
                          </div>
                        )}
                      </div>
                    )}

                    {selectedVessel.cargo && (
                      <div>
                        <div className="text-muted-foreground text-sm">Cargo</div>
                        <div className="font-medium">{selectedVessel.cargo}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fuel Efficiency</span>
                      <span className={getEfficiencyColor(selectedVessel.efficiency)}>
                        {selectedVessel.efficiency}%
                      </span>
                    </div>
                    <Progress value={selectedVessel.efficiency} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Consumption</div>
                      <div className="font-medium">{selectedVessel.fuelConsumption} MT/day</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Draft</div>
                      <div className="font-medium">
                        F: {selectedVessel.draft.fore}m / A: {selectedVessel.draft.aft}m
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5" />
                    Weather
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Wind Speed</div>
                      <div className="font-medium">{selectedVessel.weather.windSpeed} kts</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Wave Height</div>
                      <div className="font-medium">{selectedVessel.weather.waveHeight}m</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Visibility</div>
                      <div className="font-medium">{selectedVessel.weather.visibility} nm</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Vessel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a vessel</h3>
                <p className="text-muted-foreground">
                  Click on a vessel from the list to view detailed tracking information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
