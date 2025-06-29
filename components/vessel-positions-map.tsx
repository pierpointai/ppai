"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Ship,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Anchor,
  Navigation,
  Clock,
  Globe,
  Search,
  Truck,
} from "lucide-react"

interface VesselPositionsMapProps {
  height?: string
  onVesselClick?: (vessel: any) => void
  showControls?: boolean
  proximityPort?: string
  proximityRadius?: number
  onProximityPortChange?: (port: string) => void
  onProximityRadiusChange?: (radius: number) => void
  onProximitySearch?: () => void
  proximityMatches?: any[]
  showProximityResults?: boolean
  onClearProximityResults?: () => void
  marketView?: string
  onMarketViewChange?: (view: string) => void
  getDistanceColor?: (distance: number) => string
  getUrgencyColor?: (days: number) => string
  onToast?: (toast: any) => void
}

export function VesselPositionsMap({
  height = "400px",
  onVesselClick,
  showControls = true,
  proximityPort = "",
  proximityRadius = 200,
  onProximityPortChange,
  onProximityRadiusChange,
  onProximitySearch,
  proximityMatches = [],
  showProximityResults = false,
  onClearProximityResults,
  marketView = "positions",
  onMarketViewChange,
  getDistanceColor,
  getUrgencyColor,
  onToast,
}: VesselPositionsMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [vesselFilter, setVesselFilter] = useState("all")
  const [region, setRegion] = useState("asia-pacific")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Mock vessel statistics based on the map
  const vesselStats = {
    total: 2847,
    cargo: 1523,
    tanker: 892,
    container: 432,
    moving: 2156,
    anchored: 691,
  }

  const handleRefresh = () => {
    setLastUpdated(new Date())
    // In a real implementation, this would refresh the vessel data
  }

  const mapHeight = isFullscreen ? "80vh" : height

  return (
    <Card className={`${isFullscreen ? "fixed inset-4 z-50 bg-white" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Live Vessel Positions & Search
            </CardTitle>
            <CardDescription>
              Real-time vessel tracking and proximity search • Asia-Pacific region •{" "}
              {vesselStats.total.toLocaleString()} vessels
            </CardDescription>
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Updated {lastUpdated.toLocaleTimeString()}
              </Badge>

              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {/* Vessel Position Search Controls */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Find vessels near loading ports</span>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="proximity-port" className="text-xs text-slate-600">
                Load port or region
              </Label>
              <Input
                id="proximity-port"
                placeholder="e.g., Santos, Newcastle, US Gulf..."
                value={proximityPort}
                onChange={(e) => onProximityPortChange?.(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onProximitySearch?.()}
                className="mt-1"
              />
            </div>
            <div className="w-40">
              <Label htmlFor="proximity-radius" className="text-xs text-slate-600">
                Search radius
              </Label>
              <Select
                value={proximityRadius.toString()}
                onValueChange={(value) => onProximityRadiusChange?.(Number(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 NM</SelectItem>
                  <SelectItem value="200">200 NM</SelectItem>
                  <SelectItem value="500">500 NM</SelectItem>
                  <SelectItem value="1000">1000 NM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onProximitySearch} disabled={!proximityPort.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  <SelectItem value="cargo">Dry Cargo</SelectItem>
                  <SelectItem value="tanker">Tankers</SelectItem>
                  <SelectItem value="container">Containers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="americas">Americas</SelectItem>
                  <SelectItem value="middle-east">Middle East</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Status Legend */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Moving ({vesselStats.moving.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  Anchored ({vesselStats.anchored.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative bg-slate-50 border-t overflow-hidden cursor-crosshair" style={{ height: mapHeight }}>
          {/* Map Image */}
          <img
            src="/images/vessel-positions-map.png"
            alt="Vessel positions in Asia-Pacific region"
            className="w-full h-full object-cover"
            style={{
              filter: vesselFilter !== "all" ? "brightness(0.9)" : "none",
            }}
          />

          {/* Interactive Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

          {/* Region Labels */}
          <div className="absolute top-4 left-4 space-y-2">
            <Badge variant="secondary" className="bg-white/90 text-slate-700">
              <Ship className="h-3 w-3 mr-1" />
              {vesselStats.cargo.toLocaleString()} Dry Cargo
            </Badge>
            <Badge variant="secondary" className="bg-white/90 text-slate-700">
              <Anchor className="h-3 w-3 mr-1" />
              Major Shipping Lanes
            </Badge>
          </div>

          {/* Key Ports Overlay */}
          <div className="absolute top-4 right-4 space-y-1">
            <div className="bg-white/95 rounded-lg p-2 text-xs space-y-1">
              <div className="font-medium text-slate-900">Key Regions</div>
              <div className="text-slate-600">• Singapore Strait</div>
              <div className="text-slate-600">• South China Sea</div>
              <div className="text-slate-600">• Japanese Ports</div>
              <div className="text-slate-600">• Indonesian Waters</div>
            </div>
          </div>

          {/* Vessel Density Indicators */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 rounded-lg p-3 text-xs">
              <div className="font-medium text-slate-900 mb-2">Vessel Density</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-slate-600">High Traffic (Singapore, Hong Kong)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-600">Medium Traffic (Regional Ports)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600">Transit Routes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Click Instructions */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-blue-600/90 text-white rounded-lg p-2 text-xs">
              <Navigation className="h-3 w-3 inline mr-1" />
              Click vessels for details
            </div>
          </div>
        </div>
      </CardContent>

      {/* Proximity Search Results */}
      {showProximityResults && (
        <CardContent className="border-t bg-slate-50/50">
          {proximityMatches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">
                  Found {proximityMatches.length} matches near {proximityPort}
                </h3>
                <div className="flex gap-2">
                  <Select value={marketView} onValueChange={onMarketViewChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positions">By Position</SelectItem>
                      <SelectItem value="urgency">By Urgency</SelectItem>
                      <SelectItem value="size">By Size</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={onClearProximityResults}>
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {proximityMatches.slice(0, 15).map((match, index) => (
                  <div
                    key={`${match.vessel.id}-${match.order.id}`}
                    className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Ship className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-lg text-slate-900">{match.vessel.vesselName}</div>
                          <div className="text-sm text-slate-600">
                            {match.vessel.vesselType || "Bulk Carrier"} • {match.vessel.vesselSize}k DWT • Built{" "}
                            {match.vessel.built || new Date().getFullYear() - (match.vessel.vesselAge || 10)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDistanceColor?.(match.distance) || ""}>
                          {Math.round(match.distance)} NM
                        </Badge>
                        {match.isUrgent && <Badge variant="destructive">{match.daysToLaycan}d urgent</Badge>}
                      </div>
                    </div>

                    {/* Vessel Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs uppercase tracking-wide">Current Position</div>
                        <div className="font-medium text-slate-900">
                          {match.vessel.openPort || match.vessel.loadPort || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-600">
                          {match.vessel.openDates || match.vessel.laycanStart
                            ? `Open: ${match.vessel.openDates || new Date(match.vessel.laycanStart).toLocaleDateString()}`
                            : "Open dates TBC"}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-500 text-xs uppercase tracking-wide">Last Cargo</div>
                        <div className="font-medium text-slate-900">
                          {match.vessel.lastCargo || match.vessel.cargoType || "Clean"}
                        </div>
                        <div className="text-xs text-slate-600">
                          {match.vessel.ballast ? "Ballast" : match.vessel.laden ? "Laden" : "Status unknown"}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-500 text-xs uppercase tracking-wide">Rate Indication</div>
                        <div className="font-medium text-green-600">
                          {match.vessel.freightRate
                            ? `$${match.vessel.freightRate.toLocaleString()}/day`
                            : "Rate on application"}
                        </div>
                        <div className="text-xs text-slate-600">{match.vessel.rateUnit || "Time Charter"}</div>
                      </div>

                      <div>
                        <div className="text-slate-500 text-xs uppercase tracking-wide">Vessel Specs</div>
                        <div className="font-medium text-slate-900">{match.vessel.vesselFlag || "Panama"} Flag</div>
                        <div className="text-xs text-slate-600">
                          {match.vessel.gearType || "Geared"} • {match.vessel.holds || "5"} Holds
                        </div>
                      </div>
                    </div>

                    {/* Order Match Details */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="text-xs text-blue-700 font-medium mb-1">MATCHING ORDER</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="font-medium text-blue-900">{match.order.cargoType}</div>
                          <div className="text-xs text-blue-700">
                            {match.order.cargoQuantity?.toLocaleString() || "50,000"} MT
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">
                            {match.order.loadPort} → {match.order.dischargePort}
                          </div>
                          <div className="text-xs text-blue-700">
                            Laycan: {new Date(match.order.laycanStart).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">
                            {match.order.dwtMin?.toLocaleString()}-{match.order.dwtMax?.toLocaleString()} DWT
                          </div>
                          <div className="text-xs text-blue-700">
                            {match.sizeMatch ? "✓ Size match" : "⚠ Size check needed"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Broker Contact & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{match.vessel.brokerName || "John Smith"}</div>
                          <div className="text-xs text-slate-600">{match.vessel.company || "Maritime Brokers Ltd"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${match.vessel.phoneNumber || "+1234567890"}`, "_self")}
                          className="h-8 px-3"
                        >
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `mailto:${match.vessel.email || "broker@example.com"}?subject=Vessel Inquiry - ${match.vessel.vesselName}`,
                              "_self",
                            )
                          }
                          className="h-8 px-3"
                        >
                          Email
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            onToast?.({
                              title: "Opening vessel details",
                              description: `Loading full details for ${match.vessel.vesselName}`,
                            })
                          }}
                          className="h-8 px-3"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg text-center">
              <Truck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">
                No vessels found within {proximityRadius} NM of {proximityPort}
              </p>
              <p className="text-xs text-muted-foreground">Try expanding the search radius</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
