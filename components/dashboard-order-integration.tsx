"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/store/order-store"
import { AlertTriangle, Zap, Ship, Clock, ArrowRight } from "lucide-react"

export function DashboardOrderIntegration() {
  const router = useRouter()
  const { getFilteredOrders, getOrderStats } = useOrderStore()

  const allOrders = getFilteredOrders()
  const stats = getOrderStats()

  // Calculate urgent orders (laycan within 7 days)
  const urgentOrders = allOrders.filter((order) => {
    if (order.status !== "Active") return false
    const laycanStart = new Date(order.laycanStart)
    const daysToLaycan = Math.ceil((laycanStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysToLaycan <= 7 && daysToLaycan >= 0
  })

  // Calculate unmatched orders (active orders with no linked vessels)
  const unmatchedOrders = allOrders.filter(
    (order) => order.status === "Active" && (!order.linkedVessels || order.linkedVessels.length === 0),
  )

  const handleNavigateToOrders = (filter?: string, openAI?: boolean) => {
    // Store navigation context for orders page
    if (filter) {
      localStorage.setItem("ordersPageFilter", filter)
    }
    if (openAI) {
      localStorage.setItem("openAIMatching", "true")
    }
    router.push("/orders")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Urgent Orders Card */}
      {urgentOrders.length > 0 && (
        <Card
          className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          onClick={() => handleNavigateToOrders("urgent")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Urgent Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-900">{urgentOrders.length}</div>
                <p className="text-xs text-red-700">Laycan within 7 days</p>
              </div>
              <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-200">
                View Orders <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unmatched Orders Card */}
      {unmatchedOrders.length > 0 && (
        <Card
          className="border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
          onClick={() => handleNavigateToOrders("unmatched", true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Unmatched Orders</CardTitle>
            <Ship className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-900">{unmatchedOrders.length}</div>
                <p className="text-xs text-amber-700">Ready for AI matching</p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-200">
                <Zap className="h-3 w-3 mr-1" />
                AI Match
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Orders Summary */}
      <Card
        className="hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => handleNavigateToOrders("active")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.Active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.Matched} matched, {stats.Fixed} fixed
              </p>
            </div>
            <Button size="sm" variant="outline">
              Manage <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
