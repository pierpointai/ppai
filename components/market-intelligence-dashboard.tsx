"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Ship,
  Fuel,
  Clock,
  RefreshCw,
  MapPin,
  Anchor,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface MarketData {
  bdi: number
  bdiChange: number
  bci: number
  bciChange: number
  bpi: number
  bpiChange: number
  bsi: number
  bsiChange: number
  lastUpdated: Date
}

interface RouteRate {
  route: string
  vesselType: string
  rate: number
  unit: string
  change: number
  trend: "up" | "down" | "stable"
  volume: number
}

interface PortCongestion {
  port: string
  region: string
  vessels: number
  avgWaitTime: number
  status: "normal" | "congested" | "severe"
  trend: "improving" | "worsening" | "stable"
}

interface BunkerPrice {
  port: string
  ifo380: number
  mgo: number
  change380: number
  changeMGO: number
  lastUpdated: Date
}

export function MarketIntelligenceDashboard() {
  const [marketData, setMarketData] = useState<MarketData>({
    bdi: 1823,
    bdiChange: 2.5,
    bci: 2156,
    bciChange: 3.2,
    bpi: 1654,
    bpiChange: 1.8,
    bsi: 1432,
    bsiChange: 2.1,
    lastUpdated: new Date(),
  })

  const [routeRates] = useState<RouteRate[]>([
    {
      route: "C5 (W Australia-China)",
      vesselType: "Capesize",
      rate: 9.85,
      unit: "/mt",
      change: 1.8,
      trend: "up",
      volume: 156,
    },
    {
      route: "P2A (Skaw-Gibraltar/Far East)",
      vesselType: "Panamax",
      rate: 22750,
      unit: "/day",
      change: -0.5,
      trend: "down",
      volume: 89,
    },
    {
      route: "S10 (S China-Indonesia/ECSA)",
      vesselType: "Supramax",
      rate: 16250,
      unit: "/day",
      change: 2.3,
      trend: "up",
      volume: 124,
    },
    {
      route: "C3 (Tubarao-Qingdao)",
      vesselType: "Capesize",
      rate: 12.45,
      unit: "/mt",
      change: 0.8,
      trend: "up",
      volume: 203,
    },
    {
      route: "P4 (US Gulf-Japan)",
      vesselType: "Panamax",
      rate: 28500,
      unit: "/day",
      change: 1.2,
      trend: "up",
      volume: 67,
    },
  ])

  const [portCongestion] = useState<PortCongestion[]>([
    {
      port: "Qingdao",
      region: "China",
      vessels: 45,
      avgWaitTime: 3.2,
      status: "normal",
      trend: "stable",
    },
    {
      port: "Newcastle",
      region: "Australia",
      vessels: 28,
      avgWaitTime: 5.8,
      status: "congested",
      trend: "worsening",
    },
    {
      port: "Santos",
      region: "Brazil",
      vessels: 67,
      avgWaitTime: 8.5,
      status: "severe",
      trend: "improving",
    },
    {
      port: "Rotterdam",
      region: "Europe",
      vessels: 23,
      avgWaitTime: 2.1,
      status: "normal",
      trend: "stable",
    },
    {
      port: "Richards Bay",
      region: "South Africa",
      vessels: 34,
      avgWaitTime: 4.7,
      status: "congested",
      trend: "stable",
    },
  ])

  const [bunkerPrices] = useState<BunkerPrice[]>([
    {
      port: "Singapore",
      ifo380: 485,
      mgo: 720,
      change380: 2.5,
      changeMGO: 1.8,
      lastUpdated: new Date(),
    },
    {
      port: "Rotterdam",
      ifo380: 492,
      mgo: 735,
      change380: 1.2,
      changeMGO: 0.8,
      lastUpdated: new Date(),
    },
    {
      port: "Fujairah",
      ifo380: 478,
      mgo: 715,
      change380: 3.1,
      changeMGO: 2.2,
      lastUpdated: new Date(),
    },
    {
      port: "Houston",
      ifo380: 495,
      mgo: 740,
      change380: 0.9,
      changeMGO: 1.5,
      lastUpdated: new Date(),
    },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Simulate API call
    setTimeout(() => {
      setMarketData((prev) => ({
        ...prev,
        bdi: prev.bdi + Math.floor(Math.random() * 20) - 10,
        bdiChange: Math.random() * 6 - 3,
        lastUpdated: new Date(),
      }))
      setIsRefreshing(false)
    }, 1500)
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400"
    if (change < 0) return "text-red-600 dark:text-red-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const getCongestionColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-300"
      case "congested":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "severe":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600"
      case "worsening":
        return "text-red-600"
      case "stable":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Intelligence</h2>
          <p className="text-muted-foreground">Real-time dry bulk market data and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Live Data
          </Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="indices" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="indices">Baltic Indices</TabsTrigger>
          <TabsTrigger value="routes">Route Rates</TabsTrigger>
          <TabsTrigger value="ports">Port Status</TabsTrigger>
          <TabsTrigger value="bunkers">Bunker Prices</TabsTrigger>
        </TabsList>

        {/* Baltic Indices */}
        <TabsContent value="indices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Baltic Dry Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{marketData.bdi}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon("up", marketData.bdiChange)}
                      <span className={cn("text-sm font-medium", getChangeColor(marketData.bdiChange))}>
                        {marketData.bdiChange > 0 ? "+" : ""}
                        {marketData.bdiChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {marketData.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Capesize Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{marketData.bci}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon("up", marketData.bciChange)}
                      <span className={cn("text-sm font-medium", getChangeColor(marketData.bciChange))}>
                        {marketData.bciChange > 0 ? "+" : ""}
                        {marketData.bciChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Avg T/C: $20,300/day</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Panamax Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{marketData.bpi}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon("up", marketData.bpiChange)}
                      <span className={cn("text-sm font-medium", getChangeColor(marketData.bpiChange))}>
                        {marketData.bpiChange > 0 ? "+" : ""}
                        {marketData.bpiChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Avg T/C: $15,800/day</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Supramax Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{marketData.bsi}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon("up", marketData.bsiChange)}
                      <span className={cn("text-sm font-medium", getChangeColor(marketData.bsiChange))}>
                        {marketData.bsiChange > 0 ? "+" : ""}
                        {marketData.bsiChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Avg T/C: $13,200/day</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Key Drivers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Strong Chinese steel production</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>ECSA grain export season</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>Port congestion in key regions</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Regional Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pacific</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Atlantic</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Moderate
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Indian Ocean</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Strong
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Outlook</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Market sentiment remains positive with strong fundamentals supporting rates. Expect continued
                      strength in Q3 driven by seasonal grain exports and steady iron ore demand.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route Rates */}
        <TabsContent value="routes" className="space-y-6">
          <div className="grid gap-4">
            {routeRates.map((route, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{route.route}</h3>
                        <Badge variant="outline" className="text-xs">
                          {route.vesselType}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Volume: {route.volume} fixtures this month</div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          ${route.rate.toLocaleString()}
                          {route.unit}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(route.trend, route.change)}
                          <span className={cn("text-sm font-medium", getChangeColor(route.change))}>
                            {route.change > 0 ? "+" : ""}
                            {route.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">vs last week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Port Status */}
        <TabsContent value="ports" className="space-y-6">
          <div className="grid gap-4">
            {portCongestion.map((port, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{port.port}</h3>
                        <span className="text-sm text-muted-foreground">({port.region})</span>
                        <Badge variant="outline" className={getCongestionColor(port.status)}>
                          {port.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Anchor className="h-3 w-3" />
                          <span>{port.vessels} vessels waiting</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{port.avgWaitTime} days avg wait</span>
                        </div>
                        <div className={cn("flex items-center gap-1", getTrendColor(port.trend))}>
                          {port.trend === "improving" && <TrendingUp className="h-3 w-3" />}
                          {port.trend === "worsening" && <TrendingDown className="h-3 w-3" />}
                          {port.trend === "stable" && <Activity className="h-3 w-3" />}
                          <span className="capitalize">{port.trend}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-2">Congestion Level</div>
                      <Progress
                        value={port.status === "normal" ? 25 : port.status === "congested" ? 65 : 90}
                        className="w-24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bunker Prices */}
        <TabsContent value="bunkers" className="space-y-6">
          <div className="grid gap-4">
            {bunkerPrices.map((bunker, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{bunker.port}</h3>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {bunker.lastUpdated.toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-right">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">IFO 380</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">${bunker.ifo380}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon("up", bunker.change380)}
                            <span className={cn("text-xs", getChangeColor(bunker.change380))}>
                              {bunker.change380 > 0 ? "+" : ""}
                              {bunker.change380.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">MGO</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">${bunker.mgo}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon("up", bunker.changeMGO)}
                            <span className={cn("text-xs", getChangeColor(bunker.changeMGO))}>
                              {bunker.changeMGO > 0 ? "+" : ""}
                              {bunker.changeMGO.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bunker Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Bunker Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Price Drivers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span>Crude oil price volatility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>Refinery maintenance season</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>IMO 2020 compliance stable</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Regional Spreads</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Singapore vs Rotterdam</span>
                      <span className="font-medium">-$7/mt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fujairah vs Singapore</span>
                      <span className="font-medium">-$7/mt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Houston vs Rotterdam</span>
                      <span className="font-medium">+$3/mt</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
