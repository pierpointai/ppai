"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Package, Ship, User, DollarSign, Navigation } from "lucide-react"
import { LinkedVesselsTable } from "./linked-vessels-table"
import { useState, useEffect } from "react"
import { VesselLinkingDialog } from "./vessel-linking-dialog"
import { useOfferStore } from "@/lib/store/offer-store"
import { calculateVesselProximity } from "@/lib/enhanced-matching"
import { useOrderStore } from "@/lib/store/order-store"
import type { Order } from "@/lib/types/orders"
import { toast } from "@/components/ui/use-toast"

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  const [showVesselLinking, setShowVesselLinking] = useState(false)
  const { offers } = useOfferStore()
  const { updateOrder, linkVesselToOrder } = useOrderStore()
  const [nearbyVessels, setNearbyVessels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchNearbyVessels = async () => {
      setLoading(true)
      const availableVessels = offers.filter((offer) => offer.status === "available" || !offer.status)
      const vessels = []

      for (const vessel of availableVessels) {
        const vesselPort = vessel.openPort || vessel.loadPort || ""
        const distance = calculateVesselProximity(vesselPort, order.loadPort)

        if (distance !== null && distance <= 200) {
          // Within 200 NM
          vessels.push({
            ...vessel,
            distance,
          })
        }
      }

      setNearbyVessels(vessels.sort((a, b) => a.distance - b.distance).slice(0, 5))
      setLoading(false)
    }

    fetchNearbyVessels()
  }, [offers, order, open])

  // Add this effect after the existing useEffect for fetchNearbyVessels
  useEffect(() => {
    if (open) {
      // Force a refresh of the order data from the store
      const { orders } = useOrderStore.getState()
      const updatedOrder = orders.find((o) => o.id === order.id)
      if (updatedOrder && updatedOrder.linkedVessels !== order.linkedVessels) {
        // The order has been updated, we should refresh
        console.log("Order updated, refreshing dialog")
      }
    }
  }, [open, order.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Matched":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Fixed":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getDistanceColor = (distance: number) => {
    if (distance <= 50) return "bg-green-100 text-green-800 border-green-300"
    if (distance <= 100) return "bg-blue-100 text-blue-800 border-blue-300"
    if (distance <= 200) return "bg-amber-100 text-amber-800 border-amber-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const handleLinkVessels = () => {
    console.log("Opening vessel linking dialog for order:", order.id)
    setShowVesselLinking(true)
  }

  const handleCloseLinking = (linkedVessels: any[]) => {
    console.log("Closing vessel linking dialog with linked vessels:", linkedVessels)
    setShowVesselLinking(false)
    if (linkedVessels.length > 0) {
      // Link each vessel individually since the store function handles one vessel at a time
      linkedVessels.forEach((vessel) => {
        linkVesselToOrder(order.id, vessel)
      })
      toast({
        title: "Success",
        description: "Vessels linked successfully.",
        variant: "default",
      })
    }
  }

  const handleAddNearbyVessel = (vessel: any) => {
    // Convert the nearby vessel to the format expected by linkVesselToOrder
    const vesselToLink = {
      id: vessel.id,
      vesselName: vessel.vesselName,
      vesselType: vessel.vesselType || "Bulk Carrier",
      vesselSize: vessel.vesselSize,
      openPort: vessel.openPort || vessel.loadPort,
      laycanStart: vessel.laycanStart || new Date().toISOString(),
      laycanEnd: vessel.laycanEnd || new Date().toISOString(),
      matchScore: Math.round(95 - vessel.distance * 0.2), // Higher score for closer vessels
    }

    linkVesselToOrder(order.id, vesselToLink)

    toast({
      title: "Vessel Added",
      description: `${vessel.vesselName} has been linked to this order.`,
      variant: "default",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Order Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {order.orderType} Order
                </Badge>
                <Badge variant="outline" className={getPriorityColor(order.priority)}>
                  {order.priority} Priority
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              #{order.id.substring(0, 8)} • Created {format(new Date(order.createdAt), "MMM dd, yyyy")}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              {order.linkedVessels && order.linkedVessels.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Ship className="h-4 w-4" />
                  {order.linkedVessels.length} vessel{order.linkedVessels.length !== 1 ? "s" : ""} linked
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cargo Type</p>
                    <p className="text-sm text-muted-foreground">{order.cargoType}</p>
                    {order.cargoQuantity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.cargoQuantity.toLocaleString()} {order.cargoUnit || "MT"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ship className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">DWT Range</p>
                    <p className="text-sm text-muted-foreground">
                      {order.dwtMin.toLocaleString()} - {order.dwtMax.toLocaleString()} MT
                    </p>
                    {order.maxAge && (
                      <p className="text-xs text-muted-foreground mt-1">Max vessel age: {order.maxAge} years</p>
                    )}
                    {order.gearRequirement && (
                      <p className="text-xs text-muted-foreground mt-1">Gear: {order.gearRequirement}</p>
                    )}
                  </div>
                </div>

                {order.charterer && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Charterer</p>
                      <p className="text-sm text-muted-foreground">{order.charterer}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Laycan Window</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.laycanStart), "MMM dd, yyyy")} -{" "}
                      {format(new Date(order.laycanEnd), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Route</p>
                    <p className="text-sm text-muted-foreground">
                      {order.loadPort} → {order.dischargePort}
                    </p>
                    {order.tradeLane && (
                      <p className="text-xs text-muted-foreground mt-1">Trade Lane: {order.tradeLane}</p>
                    )}
                  </div>
                </div>

                {(order.freightRate || order.commissionRate) && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commercial Terms</p>
                      {order.freightRate && (
                        <p className="text-sm text-muted-foreground">
                          Rate: {order.freightRate} {order.freightRateUnit || "USD"}
                        </p>
                      )}
                      {order.commissionRate && (
                        <p className="text-xs text-muted-foreground mt-1">Commission: {order.commissionRate}%</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Vessels Section */}
            {nearbyVessels.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-medium">Nearby Vessels</h3>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {nearbyVessels.length} within 200 NM
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {nearbyVessels.map((vessel) => (
                      <div
                        key={vessel.id}
                        className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                            <Ship className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{vessel.vesselName}</div>
                            <div className="text-xs text-muted-foreground">
                              {vessel.vesselSize}k DWT • {vessel.vesselAge} years • {vessel.vesselFlag}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Open: {vessel.openPort || vessel.loadPort}</div>
                            <div>{vessel.openDates || "Available now"}</div>
                          </div>
                          <Badge variant="outline" className={getDistanceColor(vessel.distance)}>
                            {Math.round(vessel.distance)} NM
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 h-7 px-2 text-xs bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                            onClick={() => handleAddNearbyVessel(vessel)}
                            disabled={order.linkedVessels?.some((lv) => lv.vesselId === vessel.id)}
                          >
                            {order.linkedVessels?.some((lv) => lv.vesselId === vessel.id) ? "Added" : "Add"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {order.specialRequirements && order.specialRequirements.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Special Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {order.specialRequirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Linked Vessels
                </h3>
                <Button variant="outline" size="sm" onClick={handleLinkVessels}>
                  Link Vessels
                </Button>
              </div>
              <LinkedVesselsTable orderId={order.id} linkedVessels={order.linkedVessels || []} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vessel Linking Dialog */}
      {showVesselLinking && (
        <VesselLinkingDialog open={showVesselLinking} onOpenChange={handleCloseLinking} order={order} />
      )}
    </>
  )
}
