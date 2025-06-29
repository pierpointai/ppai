"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Ship, MapPin, Calendar, DollarSign, Package } from "lucide-react"
import { LinkedVesselsTable } from "./linked-vessels-table"
import type { Order } from "@/lib/store/order-store"

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-300"
      case "Matched":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Fixed":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300"
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "Low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Order Details - {order.name || `#${order.id.slice(-4)}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              {order.priority && (
                <Badge variant="outline" className={getPriorityColor(order.priority)}>
                  {order.priority} Priority
                </Badge>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                {order.orderType}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Created {formatDate(order.createdAt)}</div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cargo Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Cargo Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cargo Type:</span>
                  <span className="font-medium">{order.cargoType}</span>
                </div>
                {order.cargoQuantity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">
                      {order.cargoQuantity.toLocaleString()} {order.cargoUnit || "MT"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DWT Range:</span>
                  <span className="font-medium">
                    {order.dwtMin?.toLocaleString() || "N/A"} - {order.dwtMax?.toLocaleString() || "N/A"} MT
                  </span>
                </div>
                {order.maxAge && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Age:</span>
                    <span className="font-medium">{order.maxAge} years</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Load Port:</span>
                  <span className="font-medium">{order.loadPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discharge Port:</span>
                  <span className="font-medium">{order.dischargePort}</span>
                </div>
                {order.tradeLane && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade Lane:</span>
                    <span className="font-medium">{order.tradeLane}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Laycan Start:</span>
                  <span className="font-medium">{formatDate(order.laycanStart)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Laycan End:</span>
                  <span className="font-medium">{formatDate(order.laycanEnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {Math.ceil(
                      (new Date(order.laycanEnd).getTime() - new Date(order.laycanStart).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Commercial Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Commercial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.charterer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charterer:</span>
                    <span className="font-medium">{order.charterer}</span>
                  </div>
                )}
                {order.freightRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Freight Rate:</span>
                    <span className="font-medium">
                      ${order.freightRate.toLocaleString()} {order.freightRateUnit || ""}
                    </span>
                  </div>
                )}
                {order.commission && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission:</span>
                    <span className="font-medium">{order.commission}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Linked Vessels */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Linked Vessels ({order.linkedVessels?.length || 0})
            </h3>
            <LinkedVesselsTable orderId={order.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
