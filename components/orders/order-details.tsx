"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useOrderStore } from "@/lib/store/order-store"
import { Calendar, MapPin, Package, Ship } from "lucide-react"
import { LinkedVesselsTable } from "./linked-vessels-table"

export function OrderDetails() {
  const { selectedOrder } = useOrderStore()

  if (!selectedOrder) return null

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

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Order Details</DialogTitle>
          <Badge variant="outline" className="text-xs">
            {selectedOrder.orderType} Order
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          #{selectedOrder.id.substring(0, 8)} • Created {format(selectedOrder.createdAt, "MMM dd, yyyy")}
        </p>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
          {selectedOrder.linkedVessels && selectedOrder.linkedVessels.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Ship className="h-4 w-4" />
              {selectedOrder.linkedVessels.length} vessel{selectedOrder.linkedVessels.length !== 1 ? "s" : ""} linked
            </div>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cargo Type</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.cargoType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ship className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">DWT Range</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.dwtMin.toLocaleString()} - {selectedOrder.dwtMax.toLocaleString()} MT
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Laycan Window</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedOrder.laycanStart, "MMM dd, yyyy")} -{" "}
                  {format(selectedOrder.laycanEnd, "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Route</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.loadPort} → {selectedOrder.dischargePort}
                </p>
              </div>
            </div>
          </div>
        </div>

        {selectedOrder.notes && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Notes</p>
              <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
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
            <Button variant="outline" size="sm" onClick={() => {}}>
              Link Vessels
            </Button>
          </div>
          <LinkedVesselsTable orderId={selectedOrder.id} linkedVessels={selectedOrder.linkedVessels || []} />
        </div>
      </div>
    </>
  )
}
