"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Ship, Clock, TrendingUp } from "lucide-react"
import { calculateVesselProximity } from "@/lib/enhanced-matching"
import { useOfferStore } from "@/lib/store/offer-store"

export function ProximityDashboard() {
  const { offers } = useOfferStore()
  const [targetPort, setTargetPort] = useState("")
  const [proximityData, setProximityData] = useState<any[]>([])
  const [selectedRadius, setSelectedRadius] = useState("100")

  useEffect(() => {
    if (targetPort && offers.length > 0) {
      const radius = Number.parseInt(selectedRadius)
      const vesselsWithDistance = offers
        .map((vessel) => {
          const vesselPort = vessel.openPort || vessel.loadPort || ""
          const distance = calculateVesselProximity(vesselPort, targetPort)
          return {
            ...vessel,
            distance,
            isWithinRadius: distance !== null && distance <= radius,
          }
        })
        .filter((vessel) => vessel.distance !== null)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))

      setProximityData(vesselsWithDistance)
    } else {
      setProximityData([])
    }
  }, [targetPort, selectedRadius, offers])

  const getDistanceColor = (distance: number) => {
    if (distance <= 50) return "text-green-600 bg-green-50"
    if (distance <= 100) return "text-blue-600 bg-blue-50"
    if (distance <= 200) return "text-amber-600 bg-amber-50"
    if (distance <= 500) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const withinRadius = proximityData.filter((v) => v.isWithinRadius)
  const averageDistance =
    proximityData.length > 0 ? proximityData.reduce((sum, v) => sum + (v.distance || 0), 0) / proximityData.length : 0

  return (
    <div className="space-y-6">
      {/* Proximity Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Vessel Proximity Analysis
          </CardTitle>
          <CardDescription>Find vessels near your target load port to minimize repositioning costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Enter load port (e.g., Santos, Singapore, Rotterdam)"
                  className="pl-10"
                  value={targetPort}
                  onChange={(e) => setTargetPort(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedRadius} onValueChange={setSelectedRadius}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">Within 50 NM</SelectItem>
                <SelectItem value="100">Within 100 NM</SelectItem>
                <SelectItem value="200">Within 200 NM</SelectItem>
                <SelectItem value="500">Within 500 NM</SelectItem>
                <SelectItem value="1000">Within 1000 NM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proximity Stats */}
      {targetPort && proximityData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{withinRadius.length}</div>
                  <div className="text-sm text-muted-foreground">Within {selectedRadius} NM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(averageDistance)}</div>
                  <div className="text-sm text-muted-foreground">Avg Distance (NM)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {proximityData.filter((v) => (v.distance || 0) <= 50).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Very Close (≤50 NM)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{proximityData.length}</div>
                  <div className="text-sm text-muted-foreground">Total Vessels</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Closest Vessels */}
      {targetPort && proximityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Closest Vessels to {targetPort}</CardTitle>
            <CardDescription>Vessels sorted by distance - closest first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximityData.slice(0, 10).map((vessel) => (
                <div
                  key={vessel.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <Ship className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{vessel.vesselName}</div>
                      <div className="text-sm text-muted-foreground">
                        {vessel.vesselType} • {vessel.vesselSize}k DWT • {vessel.vesselAge} years
                      </div>
                      <div className="text-xs text-muted-foreground">Open: {vessel.openPort || vessel.loadPort}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {vessel.freightRate && (
                      <div className="text-right">
                        <div className="font-medium text-green-600">${vessel.freightRate.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">/day</div>
                      </div>
                    )}

                    <Badge variant="outline" className={`${getDistanceColor(vessel.distance || 0)} border-0`}>
                      {Math.round(vessel.distance || 0)} NM
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!targetPort && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Enter a Load Port</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Enter a load port above to see vessels sorted by proximity. This helps you find the closest vessels to
              minimize repositioning costs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
