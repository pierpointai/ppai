"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, ArrowRight, Ship, DollarSign } from "lucide-react"
import type { Offer } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface MarketInsightsProps {
  offers: Offer[]
}

interface Insights {
  averageRate: number
  rateChange: number
  topRoutes: string[]
  vesselDemand: { category: string; demand: number }[]
  marketTrend: "up" | "down" | "stable"
}

export function MarketInsights({ offers }: MarketInsightsProps) {
  const [insights, setInsights] = useState<Insights>({
    averageRate: 0,
    rateChange: 0,
    topRoutes: [],
    vesselDemand: [],
    marketTrend: "stable",
  })

  useEffect(() => {
    if (offers.length === 0) {
      setInsights({
        averageRate: 0,
        rateChange: 0,
        topRoutes: [],
        vesselDemand: [],
        marketTrend: "stable",
      })
      return
    }

    try {
      // Calculate average rate
      const avgRate = offers.reduce((sum, offer) => sum + offer.freightRate, 0) / offers.length

      // Calculate rate change (simulated)
      // In a real app, this would compare to historical data
      const rateChange = Math.random() * 10 - 5 // Random value between -5 and 5

      // Calculate top routes by volume
      const routeCounts: Record<string, number> = {}
      offers.forEach((offer) => {
        const route = `${offer.loadPort} → ${offer.dischargePort}`
        routeCounts[route] = (routeCounts[route] || 0) + 1
      })

      const topRoutes = Object.entries(routeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route, _]) => route)

      // Calculate vessel demand (simulated)
      const vesselDemand: { category: string; demand: number }[] = []
      const vesselCategories: Record<string, number> = {}
      offers.forEach((offer) => {
        if (offer.vesselCategory) {
          vesselCategories[offer.vesselCategory] = (vesselCategories[offer.vesselCategory] || 0) + 1
        }
      })

      Object.entries(vesselCategories).forEach(([category, count]) => {
        vesselDemand.push({ category, demand: count })
      })

      // Determine market trend
      let marketTrend: "up" | "down" | "stable" = "stable"
      if (rateChange > 2) {
        marketTrend = "up"
      } else if (rateChange < -2) {
        marketTrend = "down"
      }

      setInsights({
        averageRate: avgRate,
        rateChange: rateChange,
        topRoutes: topRoutes,
        vesselDemand: vesselDemand,
        marketTrend: marketTrend,
      })
    } catch (error) {
      console.error("Error calculating market insights:", error)
      setInsights({
        averageRate: 0,
        rateChange: 0,
        topRoutes: [],
        vesselDemand: [],
        marketTrend: "stable",
      })
    }
  }, [offers])

  // Calculate market trends (simplified - in a real app this would use historical data)
  const marketTrends = [
    { route: "US Gulf → China", change: 5.2, direction: "up" },
    { route: "Brazil → Japan", change: -2.1, direction: "down" },
    { route: "Black Sea → Mediterranean", change: 0.8, direction: "up" },
    { route: "Australia → India", change: -1.5, direction: "down" },
    { route: "North Europe → US East Coast", change: 0.3, direction: "up" },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hot-deals">
          <TabsList className="mb-4">
            <TabsTrigger value="hot-deals">Hot Deals</TabsTrigger>
            <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
            <TabsTrigger value="top-routes">Top Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="hot-deals">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offers
                .filter((o) => o.score && o.score > 0.9)
                .slice(0, 3)
                .map((offer) => (
                  <div key={offer.id} className="p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Top Deal
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                        {offer.vesselCategory}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 font-medium mb-1">
                      <Ship className="h-4 w-4 text-primary" />
                      {offer.vesselType} {offer.vesselSize}k
                    </div>
                    <div className="text-sm text-muted-foreground mb-2 flex items-center">
                      <span>{offer.loadPort}</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <span>{offer.dischargePort}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">
                        <DollarSign className="h-3 w-3 inline" />
                        {offer.freightRate}k/day
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {offer.laycanStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–
                        {offer.laycanEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="market-trends">
            <div className="space-y-3">
              {marketTrends.map((trend, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {trend.direction === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{trend.route}</span>
                    </div>
                  </div>
                  <div
                    className={cn("text-sm font-medium", trend.direction === "up" ? "text-green-600" : "text-red-600")}
                  >
                    {trend.direction === "up" ? "+" : ""}
                    {trend.change}%
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top-routes">
            <div className="space-y-3">
              {insights.topRoutes.map((route, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </div>
                    <span className="font-medium">{route}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {offers.filter((offer) => `${offer.loadPort} → ${offer.dischargePort}` === route).length} offers
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
