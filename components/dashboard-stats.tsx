"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ship, Anchor } from "lucide-react"
import type { Offer } from "@/lib/types"
import { useEffect, useState } from "react"
import { Chart } from "@/components/chart"
import type { ChartData } from "@/lib/types"

interface DashboardStatsProps {
  offers: Offer[]
}

export function DashboardStats({ offers }: DashboardStatsProps) {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Freight Rates",
        data: [],
        backgroundColor: [],
      },
    ],
  })

  const [vesselCategoryData, setVesselCategoryData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Vessel Categories",
        data: [],
        backgroundColor: [],
      },
    ],
  })

  useEffect(() => {
    if (offers.length === 0) {
      // Set empty chart data to prevent errors
      setChartData({
        labels: ["No data"],
        datasets: [
          {
            label: "Freight Rates",
            data: [0],
            backgroundColor: ["#e5e7eb"],
          },
        ],
      })

      setVesselCategoryData({
        labels: ["No data"],
        datasets: [
          {
            label: "Vessel Categories",
            data: [0],
            backgroundColor: ["#e5e7eb"],
          },
        ],
      })
      return
    }

    // Prepare data for freight rates chart
    const vesselTypes = offers.map((o) => `${o.vesselType} ${o.vesselSize}k`)
    const freightRates = offers.map((o) => o.freightRate)

    // Use a consistent color palette
    const colors = [
      "hsl(210, 70%, 60%)",
      "hsl(220, 70%, 60%)",
      "hsl(230, 70%, 60%)",
      "hsl(240, 70%, 60%)",
      "hsl(250, 70%, 60%)",
      "hsl(260, 70%, 60%)",
      "hsl(270, 70%, 60%)",
      "hsl(280, 70%, 60%)",
      "hsl(290, 70%, 60%)",
      "hsl(300, 70%, 60%)",
    ]

    // Ensure we have enough colors by repeating the palette
    const chartColors = vesselTypes.map((_, i) => colors[i % colors.length])

    setChartData({
      labels: vesselTypes,
      datasets: [
        {
          label: "Freight Rates (k/day)",
          data: freightRates,
          backgroundColor: chartColors,
        },
      ],
    })

    // Prepare data for vessel categories chart
    const vesselCategoryCounts: Record<string, number> = {}
    offers.forEach((offer) => {
      if (offer.vesselCategory) {
        vesselCategoryCounts[offer.vesselCategory] = (vesselCategoryCounts[offer.vesselCategory] || 0) + 1
      } else {
        vesselCategoryCounts["Uncategorized"] = (vesselCategoryCounts["Uncategorized"] || 0) + 1
      }
    })

    // Use predefined colors for vessel categories
    const categoryColors = [
      "hsl(210, 70%, 60%)", // blue
      "hsl(150, 70%, 60%)", // green
      "hsl(140, 70%, 60%)", // emerald
      "hsl(40, 70%, 60%)", // amber
      "hsl(30, 70%, 60%)", // orange
      "hsl(0, 70%, 60%)", // red
      "hsl(0, 0%, 60%)", // gray (for uncategorized)
    ]

    setVesselCategoryData({
      labels: Object.keys(vesselCategoryCounts),
      datasets: [
        {
          label: "Vessel Categories",
          data: Object.values(vesselCategoryCounts),
          backgroundColor: categoryColors.slice(0, Object.keys(vesselCategoryCounts).length),
        },
      ],
    })
  }, [offers])

  // Calculate statistics
  const avgFreightRate = offers.length ? offers.reduce((sum, offer) => sum + offer.freightRate, 0) / offers.length : 0

  const availableOffers = offers.filter((o) => o.status === "available").length

  // Calculate vessel category distribution
  const vesselCategoryDistribution = offers.reduce(
    (acc, offer) => {
      if (offer.vesselCategory) {
        acc[offer.vesselCategory] = (acc[offer.vesselCategory] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Find the most common vessel category
  let mostCommonCategory = "None"
  let maxCount = 0
  Object.entries(vesselCategoryDistribution).forEach(([category, count]) => {
    if (count > maxCount) {
      mostCommonCategory = category
      maxCount = count
    }
  })

  return (
    <>
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Freight Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${avgFreightRate.toFixed(1)}k/day</div>
          <p className="text-xs text-muted-foreground">Across {offers.length} offers</p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Vessels</CardTitle>
          <Ship className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{availableOffers}</div>
          <p className="text-xs text-muted-foreground">Out of {offers.length} total offers</p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Vessel Category</CardTitle>
          <Anchor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostCommonCategory}</div>
          <p className="text-xs text-muted-foreground">
            {maxCount} vessels ({Math.round((maxCount / offers.length) * 100) || 0}% of total)
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-3 mt-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories">
            <TabsList>
              <TabsTrigger value="categories" className="text-sm">
                Vessel Categories
              </TabsTrigger>
              <TabsTrigger value="rates" className="text-sm">
                Freight Rates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="h-[300px]">
              {vesselCategoryData.labels.length > 0 ? (
                <Chart type="pie" data={vesselCategoryData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No vessel category data available</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="rates" className="h-[300px]">
              {chartData.labels.length > 0 ? (
                <Chart type="bar" data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No freight rate data available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
