"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Ship,
  MessageSquare,
  BarChart3,
  Calculator,
  Navigation,
  TrendingUp,
  Users,
  Zap,
  Bell,
  Settings,
  Search,
  Plus,
  Phone,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrokerCommunicationHub } from "./broker-communication-hub"
import { MarketIntelligenceDashboard } from "./market-intelligence-dashboard"
import { EnhancedVesselTracking } from "./enhanced-vessel-tracking"
import { FinancialCalculators } from "./financial-calculators"
import { EnhancedDashboard } from "./enhanced-dashboard"

interface DashboardMetrics {
  activeDeals: number
  todayFixtures: number
  pendingOffers: number
  marketTrend: "up" | "down" | "stable"
  bdiIndex: number
  bdiChange: number
}

export function EnhancedDashboardV2() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics] = useState<DashboardMetrics>({
    activeDeals: 23,
    todayFixtures: 4,
    pendingOffers: 67,
    marketTrend: "up",
    bdiIndex: 1823,
    bdiChange: 2.5,
  })
  const { toast } = useToast()

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} initiated`,
      description: `${action} feature has been activated`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Ship className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">PierPoint AI</span>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Live Market Data
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Deals</p>
                  <p className="text-2xl font-bold">{metrics.activeDeals}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Fixtures</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.todayFixtures}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Offers</p>
                  <p className="text-2xl font-bold text-amber-600">{metrics.pendingOffers}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">BDI Index</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{metrics.bdiIndex}</p>
                    <span
                      className={cn("text-sm font-medium", metrics.bdiChange > 0 ? "text-green-600" : "text-red-600")}
                    >
                      {metrics.bdiChange > 0 ? "+" : ""}
                      {metrics.bdiChange}%
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Market Intel
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Vessel Tracking
            </TabsTrigger>
            <TabsTrigger value="calculators" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculators
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Enhanced Dashboard */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Broker Dashboard</h2>
                <p className="text-muted-foreground">Complete dry cargo vessel and order management platform</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleQuickAction("AI Match")}>
                  <Zap className="h-4 w-4 mr-2" />
                  AI Match
                </Button>
                <Button variant="outline" onClick={() => handleQuickAction("Add Vessel")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vessel
                </Button>
              </div>
            </div>
            <EnhancedDashboard />
          </TabsContent>

          {/* Communication Hub */}
          <TabsContent value="communication" className="space-y-6">
            <BrokerCommunicationHub />
          </TabsContent>

          {/* Market Intelligence */}
          <TabsContent value="market" className="space-y-6">
            <MarketIntelligenceDashboard />
          </TabsContent>

          {/* Vessel Tracking */}
          <TabsContent value="tracking" className="space-y-6">
            <EnhancedVesselTracking />
          </TabsContent>

          {/* Financial Calculators */}
          <TabsContent value="calculators" className="space-y-6">
            <FinancialCalculators />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Fixtures Closed This Month</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        12 deals
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Deal Size</span>
                      <span className="font-medium">$1.2M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Commission Earned</span>
                      <span className="font-medium text-green-600">$45,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <span className="font-medium">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Vessel Inventory</span>
                      <span className="font-medium">156 vessels</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Client Relationships</span>
                      <span className="font-medium">89 active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Market Coverage</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Global
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Specialization</span>
                      <span className="font-medium">Dry Bulk</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium">MV Ocean Pioneer fixed</div>
                        <div className="text-sm text-muted-foreground">Panamax 76k DWT • $19.5k/day • 2 hours ago</div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Fixed
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">New inquiry from COSCO</div>
                        <div className="text-sm text-muted-foreground">Supramax grain USG-China • 4 hours ago</div>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        New
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Ship className="h-5 w-5 text-purple-500" />
                      <div className="flex-1">
                        <div className="font-medium">MV Atlantic Carrier position update</div>
                        <div className="text-sm text-muted-foreground">Now underway to New Orleans • 6 hours ago</div>
                      </div>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Update
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-amber-500" />
                      <div className="flex-1">
                        <div className="font-medium">BDI increased to 1,823</div>
                        <div className="text-sm text-muted-foreground">+2.5% from yesterday • 8 hours ago</div>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Market
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Action Floating Panel */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <Button size="lg" className="rounded-full shadow-lg" onClick={() => handleQuickAction("Emergency Contact")}>
            <Phone className="h-5 w-5 mr-2" />
            Quick Call
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full shadow-lg bg-background"
            onClick={() => handleQuickAction("Send Email")}
          >
            <Mail className="h-5 w-5 mr-2" />
            Quick Email
          </Button>
        </div>
      </div>
    </div>
  )
}
