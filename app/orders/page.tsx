"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Ship,
  MapPin,
  Zap,
  Brain,
  RefreshCw,
  Loader2,
  Anchor,
  Calendar,
  DollarSign,
  Globe,
  Search,
  X,
  Clock,
  TrendingUp,
  Package,
} from "lucide-react"
import { OrderTable } from "@/components/orders/order-table"
import { OrderForm } from "@/components/orders/order-form"
import { AIMatchingPanel } from "@/components/orders/ai-matching-panel"
import { useOrderStore } from "@/lib/store/order-store"
import { useOfferStore } from "@/lib/store/offer-store"
import { calculateVesselProximity } from "@/lib/enhanced-matching"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { VesselPositionsMap } from "@/components/vessel-positions-map"

export default function OrdersPage() {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showAIMatching, setShowAIMatching] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [cargoFilter, setCargoFilter] = useState("all")
  const [sizeFilter, setSizeFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [proximityPort, setProximityPort] = useState("")
  const [proximityRadius, setProximityRadius] = useState(200)
  const [showProximityResults, setShowProximityResults] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [marketView, setMarketView] = useState("positions")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showVesselMap, setShowVesselMap] = useState(true)

  const { getFilteredOrders, isMatching, filters, setFilter, resetStore, getOrderStats } = useOrderStore()
  const { offers, refreshOffers } = useOfferStore()
  const isMobile = useIsMobile()
  const { toast } = useToast()

  // Get all orders and apply tab-specific filtering
  const allOrders = getFilteredOrders()

  // Memoized filtered orders based on all filters
  const filteredOrders = useMemo(() => {
    let orders = allOrders

    // Filter by order type (tab)
    switch (activeTab) {
      case "voyage":
        orders = orders.filter((order) => order.orderType === "Voyage")
        break
      case "tc":
        orders = orders.filter((order) => order.orderType === "TC")
        break
      case "coa":
        orders = orders.filter((order) => order.orderType === "COA")
        break
      case "all":
      default:
        // No filtering by type
        break
    }

    // Filter by status
    switch (statusFilter) {
      case "active":
        orders = orders.filter((order) => order.status === "Active")
        break
      case "urgent":
        orders = orders.filter((order) => {
          if (order.status !== "Active") return false
          const laycanStart = new Date(order.laycanStart)
          const daysToLaycan = Math.ceil((laycanStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          return daysToLaycan <= 7 && daysToLaycan >= 0
        })
        break
      case "matched":
        orders = orders.filter((order) => order.status === "Matched")
        break
      case "fixed":
        orders = orders.filter((order) => order.status === "Fixed")
        break
      case "all":
      default:
        // No status filtering
        break
    }

    // Filter by cargo type
    if (cargoFilter !== "all") {
      orders = orders.filter((order) => order.cargoType === cargoFilter)
    }

    // Filter by vessel size
    if (sizeFilter !== "all") {
      switch (sizeFilter) {
        case "handysize":
          orders = orders.filter((order) => (order.dwtMax || 0) <= 40000)
          break
        case "handymax":
          orders = orders.filter((order) => (order.dwtMin || 0) >= 40000 && (order.dwtMax || 0) <= 65000)
          break
        case "panamax":
          orders = orders.filter((order) => (order.dwtMin || 0) >= 65000 && (order.dwtMax || 0) <= 100000)
          break
        case "capesize":
          orders = orders.filter((order) => (order.dwtMin || 0) >= 100000)
          break
      }
    }

    // Filter by urgency
    if (urgencyFilter !== "all") {
      orders = orders.filter((order) => {
        const laycanStart = new Date(order.laycanStart)
        const daysToLaycan = Math.ceil((laycanStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        switch (urgencyFilter) {
          case "immediate":
            return daysToLaycan <= 3
          case "urgent":
            return daysToLaycan <= 7
          case "soon":
            return daysToLaycan <= 14
          case "future":
            return daysToLaycan > 14
          default:
            return true
        }
      })
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      orders = orders.filter(
        (order) =>
          order.cargoType.toLowerCase().includes(search) ||
          order.loadPort.toLowerCase().includes(search) ||
          order.dischargePort.toLowerCase().includes(search) ||
          (order.charterer && order.charterer.toLowerCase().includes(search)) ||
          (order.tradeLane && order.tradeLane.toLowerCase().includes(search)),
      )
    }

    return orders
  }, [allOrders, activeTab, statusFilter, cargoFilter, sizeFilter, urgencyFilter, searchTerm])

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredOrders.slice(startIndex, endIndex)
  }, [filteredOrders, currentPage, pageSize])

  const totalPages = Math.ceil(filteredOrders.length / pageSize)

  // Memoized order statistics
  const orderStats = useMemo(() => getOrderStats(), [getOrderStats])

  const activeOrders = useMemo(() => allOrders.filter((order) => order.status === "Active"), [allOrders])

  const urgentOrders = useMemo(
    () =>
      activeOrders.filter((order) => {
        const laycanStart = new Date(order.laycanStart)
        const daysToLaycan = Math.ceil((laycanStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return daysToLaycan <= 7 && daysToLaycan >= 0
      }),
    [activeOrders],
  )

  const availableVessels = useMemo(
    () => offers.filter((offer) => offer.status === "available" || !offer.status),
    [offers],
  )

  // Order type counts
  const orderTypeCounts = useMemo(() => {
    return {
      all: allOrders.length,
      voyage: allOrders.filter((o) => o.orderType === "Voyage").length,
      tc: allOrders.filter((o) => o.orderType === "TC").length,
      coa: allOrders.filter((o) => o.orderType === "COA").length,
    }
  }, [allOrders])

  // Dry cargo specific metrics
  const dryCargoMetrics = useMemo(() => {
    const totalCargo = activeOrders.reduce((sum, order) => sum + (order.cargoQuantity || 0), 0)
    const avgVesselSize =
      activeOrders.reduce((sum, order) => sum + ((order.dwtMin || 0) + (order.dwtMax || 0)) / 2, 0) /
        activeOrders.length || 0

    const tradeRoutes = activeOrders.reduce(
      (routes, order) => {
        const route = `${order.loadPort} → ${order.dischargePort}`
        routes[route] = (routes[route] || 0) + 1
        return routes
      },
      {} as Record<string, number>,
    )

    const topRoute = Object.entries(tradeRoutes).sort(([, a], [, b]) => b - a)[0]

    return {
      totalCargo: Math.round(totalCargo / 1000), // Convert to KMT
      avgVesselSize: Math.round(avgVesselSize / 1000), // Convert to K DWT
      topRoute: topRoute ? topRoute[0] : "No active routes",
      routeCount: topRoute ? topRoute[1] : 0,
    }
  }, [activeOrders])

  // Calculate proximity matches for active orders
  const proximityMatches = useMemo(() => {
    if (!proximityPort) return []

    const matches = []
    for (const order of activeOrders) {
      for (const vessel of availableVessels) {
        const vesselPort = vessel.openPort || vessel.loadPort || ""
        const distance = calculateVesselProximity(vesselPort, order.loadPort)

        if (distance !== null && distance <= proximityRadius) {
          const laycanStart = new Date(order.laycanStart)
          const daysToLaycan = Math.ceil((laycanStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

          matches.push({
            order,
            vessel,
            distance,
            daysToLaycan,
            isUrgent: daysToLaycan <= 7 && daysToLaycan >= 0,
            loadPortMatch: order.loadPort.toLowerCase().includes(proximityPort.toLowerCase()),
            sizeMatch:
              vessel.vesselSize &&
              vessel.vesselSize * 1000 >= (order.dwtMin || 0) &&
              vessel.vesselSize * 1000 <= (order.dwtMax || 999999),
          })
        }
      }
    }

    // Sort based on market view
    return matches.sort((a, b) => {
      switch (marketView) {
        case "urgency":
          if (a.isUrgent && !b.isUrgent) return -1
          if (!a.isUrgent && b.isUrgent) return 1
          return a.daysToLaycan - b.daysToLaycan
        case "size":
          return (b.vessel.vesselSize || 0) - (a.vessel.vesselSize || 0)
        case "positions":
        default:
          // Prioritize urgent orders, then distance
          if (a.isUrgent && !b.isUrgent) return -1
          if (!a.isUrgent && b.isUrgent) return 1
          return a.distance - b.distance
      }
    })
  }, [proximityPort, proximityRadius, activeOrders, availableVessels, marketView])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("")
    setCargoFilter("all")
    setSizeFilter("all")
    setUrgencyFilter("all")
    setStatusFilter("all")
    setActiveTab("all")
  }

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchTerm) count++
    if (cargoFilter !== "all") count++
    if (sizeFilter !== "all") count++
    if (urgencyFilter !== "all") count++
    if (statusFilter !== "all") count++
    if (activeTab !== "all") count++
    return count
  }, [searchTerm, cargoFilter, sizeFilter, urgencyFilter, statusFilter, activeTab])

  // Initialize with sample data if empty
  useEffect(() => {
    if (allOrders.length === 0) {
      resetStore()
    }
  }, [allOrders.length, resetStore])

  const handleProximitySearch = () => {
    if (proximityPort.trim()) {
      setShowProximityResults(true)
      toast({
        title: "Proximity search completed",
        description: `Found ${proximityMatches.length} potential matches near ${proximityPort}`,
      })
    } else {
      toast({
        title: "Please enter a port name",
        description: "Enter a port or region to search for nearby vessels",
        variant: "destructive",
      })
    }
  }

  const getDistanceColor = (distance: number) => {
    if (distance <= 100) return "bg-green-100 text-green-800 border-green-300"
    if (distance <= 200) return "bg-blue-100 text-blue-800 border-blue-300"
    if (distance <= 500) return "bg-amber-100 text-amber-800 border-amber-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return "bg-red-100 text-red-800 border-red-300"
    if (days <= 7) return "bg-amber-100 text-amber-800 border-amber-300"
    if (days <= 14) return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const handleAIMatch = () => {
    if (activeOrders.length === 0) {
      toast({
        title: "No active orders",
        description: "Create some active orders first to run AI matching",
        variant: "destructive",
      })
      return
    }
    setShowAIMatching(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    try {
      // Refresh offers data
      if (refreshOffers) {
        await refreshOffers()
      }

      // Reset proximity results to force recalculation
      setShowProximityResults(false)

      setTimeout(() => {
        setIsRefreshing(false)
        toast({
          title: "Market data refreshed",
          description: "Vessel positions and order status updated from latest market feeds.",
        })
      }, 1500)
    } catch (error) {
      setIsRefreshing(false)
      toast({
        title: "Refresh failed",
        description: "Unable to refresh market data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setCurrentPage(1) // Reset to first page when changing tabs
    setShowProximityResults(false)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleOrderFormSuccess = () => {
    setShowOrderForm(false)
    toast({
      title: "Order created successfully",
      description: "New charter order has been added to your active orders.",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dry Cargo Orders</h1>
          <p className="text-muted-foreground">
            Manage charter orders by type and status • {activeOrders.length} active orders •{" "}
            {dryCargoMetrics.totalCargo}K MT total cargo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowVesselMap(!showVesselMap)}>
            <MapPin className="h-4 w-4 mr-2" />
            {showVesselMap ? "Hide" : "Show"} Vessel Map
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {!isMobile && (isRefreshing ? "Refreshing..." : "Refresh")}
          </Button>
          <Button onClick={() => setShowOrderForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Combined Vessel Positions Map & Search */}
      {showVesselMap && (
        <VesselPositionsMap
          height="500px"
          onVesselClick={(vessel) => {
            toast({
              title: "Vessel Selected",
              description: `Viewing details for vessel in ${vessel?.region || "selected area"}`,
            })
          }}
          proximityPort={proximityPort}
          proximityRadius={proximityRadius}
          onProximityPortChange={setProximityPort}
          onProximityRadiusChange={setProximityRadius}
          onProximitySearch={handleProximitySearch}
          proximityMatches={proximityMatches}
          showProximityResults={showProximityResults}
          onClearProximityResults={() => setShowProximityResults(false)}
          marketView={marketView}
          onMarketViewChange={setMarketView}
          getDistanceColor={getDistanceColor}
          getUrgencyColor={getUrgencyColor}
          onToast={toast}
        />
      )}

      {/* AI Matching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Vessel Matching
          </CardTitle>
          <CardDescription>Advanced algorithms for optimal dry cargo vessel-order matching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Anchor className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">DWT Matching</div>
                <div className="text-xs text-muted-foreground">Size optimization</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Globe className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Route Analysis</div>
                <div className="text-xs text-muted-foreground">Trade lanes</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium">Rate Analysis</div>
                <div className="text-xs text-muted-foreground">Market pricing</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-sm font-medium">Laycan Sync</div>
                <div className="text-xs text-muted-foreground">Timing</div>
              </div>
            </div>
          </div>
          <Button onClick={handleAIMatch} disabled={isMatching || activeOrders.length === 0} className="w-full">
            {isMatching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run AI Matching ({activeOrders.length} orders)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Redesigned Order Management Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Order Management
              </CardTitle>
              <CardDescription>Professional dry cargo charter order management</CardDescription>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => resetStore()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Data
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Primary Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cargo, ports, charterers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Cargo Type Filter */}
            <div className="lg:col-span-2">
              <Select value={cargoFilter} onValueChange={setCargoFilter}>
                <SelectTrigger>
                  <Package className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Cargo Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cargo</SelectItem>
                  <SelectItem value="Iron Ore">Iron Ore</SelectItem>
                  <SelectItem value="Coal">Coal</SelectItem>
                  <SelectItem value="Grain">Grain</SelectItem>
                  <SelectItem value="Wheat">Wheat</SelectItem>
                  <SelectItem value="Corn">Corn</SelectItem>
                  <SelectItem value="Soybeans">Soybeans</SelectItem>
                  <SelectItem value="Bauxite">Bauxite</SelectItem>
                  <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                  <SelectItem value="Steel Products">Steel Products</SelectItem>
                  <SelectItem value="Salt">Salt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Size Filter */}
            <div className="lg:col-span-2">
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger>
                  <Ship className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Vessel Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="handysize">Handysize (&lt;=40K)</SelectItem>
                  <SelectItem value="handymax">Handymax (40-65K)</SelectItem>
                  <SelectItem value="panamax">Panamax (65-100K)</SelectItem>
                  <SelectItem value="capesize">Capesize (&gt;=100K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Filter */}
            <div className="lg:col-span-2">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="immediate">Immediate (&lt;=3 days)</SelectItem>
                  <SelectItem value="urgent">Urgent (&lt;=7 days)</SelectItem>
                  <SelectItem value="soon">Soon (&lt;=14 days)</SelectItem>
                  <SelectItem value="future">Future (&gt;14 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Type Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All Orders
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {orderTypeCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="voyage" className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-900 border-blue-300 mr-1 text-xs">
                    V
                  </Badge>
                  Voyage
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {orderTypeCounts.voyage}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="tc" className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-900 border-purple-300 mr-1 text-xs">
                    TC
                  </Badge>
                  Time Charter
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {orderTypeCounts.tc}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="coa" className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-900 border-emerald-300 mr-1 text-xs"
                  >
                    COA
                  </Badge>
                  Contract
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {orderTypeCounts.coa}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Results Summary */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {allOrders.length} orders
              </div>
            </div>

            <div className="mt-6">
              <TabsContent value="all" className="mt-0">
                <OrderTable orders={paginatedOrders} onAIMatch={handleAIMatch} />
              </TabsContent>
              <TabsContent value="voyage" className="mt-0">
                <OrderTable orders={paginatedOrders} onAIMatch={handleAIMatch} />
              </TabsContent>
              <TabsContent value="tc" className="mt-0">
                <OrderTable orders={paginatedOrders} onAIMatch={handleAIMatch} />
              </TabsContent>
              <TabsContent value="coa" className="mt-0">
                <OrderTable orders={paginatedOrders} onAIMatch={handleAIMatch} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredOrders.length)}{" "}
                of {filteredOrders.length} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Matching Panel */}
      <AIMatchingPanel open={showAIMatching} onOpenChange={setShowAIMatching} />

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Charter Order</DialogTitle>
          </DialogHeader>
          <OrderForm onSuccess={handleOrderFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
