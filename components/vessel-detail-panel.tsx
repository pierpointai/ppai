"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Ship, Anchor, Navigation, Calendar, Clock, MapPin, Info, FileText, BarChart } from "lucide-react"
import { VesselHistoryChart } from "@/components/vessel-history-chart"

interface VesselDetailPanelProps {
  vessel: any
  onClose: () => void
  fullScreen?: boolean
}

export function VesselDetailPanel({ vessel, onClose, fullScreen = false }: VesselDetailPanelProps) {
  const vesselStatusColor = {
    underway: "bg-green-500 text-white",
    anchored: "bg-yellow-500 text-white",
    moored: "bg-blue-500 text-white",
    offline: "bg-gray-500 text-white",
  }

  const vesselStatusIcon = {
    underway: <Navigation className="h-4 w-4 mr-1" />,
    anchored: <Anchor className="h-4 w-4 mr-1" />,
    moored: <Ship className="h-4 w-4 mr-1" />,
    offline: <Ship className="h-4 w-4 mr-1" />,
  }

  return (
    <Card className={`${fullScreen ? "h-full rounded-none" : "shadow-lg"}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center">
            <CardTitle className="text-xl">{vessel.name}</CardTitle>
            <Badge className={`ml-2 ${vesselStatusColor[vessel.status]}`}>
              <div className="flex items-center">
                {vesselStatusIcon[vessel.status]}
                <span className="capitalize">{vessel.status}</span>
              </div>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {vessel.type} • IMO: {vessel.imo}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Info</span>
            </TabsTrigger>
            <TabsTrigger value="voyage" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Voyage</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Vessel Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Type</span>
                    <span>{vessel.type}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Flag</span>
                    <span>{vessel.flag}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">IMO</span>
                    <span>{vessel.imo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">MMSI</span>
                    <span>{vessel.mmsi}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Call Sign</span>
                    <span>{vessel.callSign}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Year Built</span>
                    <span>{vessel.yearBuilt}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Length</span>
                    <span>{vessel.length} m</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Beam</span>
                    <span>{vessel.beam} m</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Draught</span>
                    <span>{vessel.draught} m</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Gross Tonnage</span>
                    <span>{vessel.grossTonnage} t</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">DWT</span>
                    <span>{vessel.deadweight} t</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">TEU</span>
                    <span>{vessel.teu || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Owner/Operator</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Owner</span>
                    <span>{vessel.owner}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Operator</span>
                    <span>{vessel.operator}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voyage" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Current Voyage</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Current Location</span>
                    <span>{vessel.location}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Speed / Course</span>
                    <span>
                      {vessel.speed} knots / {vessel.course}°
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Destination</span>
                    <span>{vessel.destination || "Not reported"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">ETA</span>
                    <span>{vessel.eta || "Not reported"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Last Port Calls</h4>
                <div className="space-y-2">
                  {vessel.portCalls &&
                    vessel.portCalls.map((portCall, index) => (
                      <div key={index} className="flex items-start border-l-2 border-primary pl-3 py-1">
                        <div className="flex-1">
                          <div className="font-medium">{portCall.port}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {portCall.arrival} - {portCall.departure}
                            </span>
                          </div>
                          <div className="text-xs">{portCall.operation}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Speed History (Last 24 hours)</h4>
                <div className="h-48">
                  <VesselHistoryChart vessel={vessel} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Recent Events</h4>
                <div className="space-y-2">
                  {vessel.events &&
                    vessel.events.map((event, index) => (
                      <div key={index} className="flex items-start border-l-2 border-muted pl-3 py-1">
                        <div className="flex-1">
                          <div className="font-medium">{event.type}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{event.timestamp}</span>
                          </div>
                          <div className="text-xs">{event.details}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Documents</h4>
                <div className="space-y-2">
                  {vessel.documents &&
                    vessel.documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 border rounded-md">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{doc.name}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          View
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
