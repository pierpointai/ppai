"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DynamicDashboard } from "@/components/dynamic-dashboard"
import { ProximityDashboard } from "@/components/proximity-dashboard"
import { Navigation, BarChart3, Ship } from "lucide-react"
import { SimpleDashboard } from "@/components/simple-dashboard"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your cargo offers, vessel positions, and market insights</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="proximity" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Proximity
          </TabsTrigger>
          <TabsTrigger value="vessels" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Vessels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DynamicDashboard />
        </TabsContent>

        <TabsContent value="proximity">
          <ProximityDashboard />
        </TabsContent>

        <TabsContent value="vessels">
          <SimpleDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
