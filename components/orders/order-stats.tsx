"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useOrderStore } from "@/lib/store/order-store"
import { Clock, CheckCircle, AlertTriangle, Ship, Package } from "lucide-react"

export function OrderStats() {
  const { orders } = useOrderStore()

  // Calculate stats
  const activeOrders = orders.filter((order) => order.status === "Active").length
  const matchedOrders = orders.filter((order) => order.status === "Matched").length
  const fixedOrders = orders.filter((order) => order.status === "Fixed").length
  const cancelledOrders = orders.filter((order) => order.status === "Cancelled").length

  // Calculate linked vessels
  const totalLinkedVessels = orders.reduce((total, order) => total + (order.linkedVessels?.length || 0), 0)

  // Calculate cargo types
  const cargoTypes = new Set(orders.map((order) => order.cargoType))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Active Orders</div>
            <div className="text-2xl font-bold">{activeOrders}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Matched Orders</div>
            <div className="text-2xl font-bold">{matchedOrders}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Fixed Orders</div>
            <div className="text-2xl font-bold">{fixedOrders}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Ship className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Linked Vessels</div>
            <div className="text-2xl font-bold">{totalLinkedVessels}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Package className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Cargo Types</div>
            <div className="text-2xl font-bold">{cargoTypes.size}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
