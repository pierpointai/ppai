"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const BrokerComparisonTools = () => {
  const [vessels, setVessels] = useState([])
  const [selectedVessel, setSelectedVessel] = useState(null)

  // Combine all calculation functions into a single utility object
  const calculations = useMemo(
    () => ({
      tce: (vessel) => vessel.revenue / vessel.daysInService,
      voyageCosts: (vessel) => vessel.bunkerConsumption * vessel.bunkerPrice,
      profitMargins: (vessel) => (vessel.revenue - calculations.voyageCosts(vessel)) / vessel.revenue,
      distance: (port1, port2) =>
        Math.sqrt(Math.pow(port2.latitude - port1.latitude, 2) + Math.pow(port2.longitude - port1.longitude, 2)),
      bunkerConsumption: (vessel, distance) => distance * vessel.fuelConsumptionRate,
      transitTime: (vessel, distance) => distance / vessel.speed,
      commission: (vessel, rate) => vessel.revenue * rate,
    }),
    [],
  )

  // Simplify vessel operations
  const vesselOperations = {
    generateOffer: (vessel) => `Offer for ${vessel.name}: TCE - ${calculations.tce(vessel)}`,
    generateRecap: (vessel) => `Fixture Recap for ${vessel.name}: Revenue - ${vessel.revenue}`,
    generateEmail: (vessel) => `Dear Client,\n\nVessel ${vessel.name} details.\n\nBest regards`,
    compare: (v1, v2) => ({
      tceDifference: calculations.tce(v1) - calculations.tce(v2),
      voyageCostDifference: calculations.voyageCosts(v1) - calculations.voyageCosts(v2),
      profitMarginDifference: calculations.profitMargins(v1) - calculations.profitMargins(v2),
    }),
    identifyBest: (vessels) =>
      vessels.reduce((best, current) => (calculations.tce(current) > calculations.tce(best) ? current : best)),
    negotiationInsights: (vessel) => `Position strength for ${vessel.name}: Strong`,
    generateReport: (vessel) => `Report for ${vessel.name}: TCE - ${calculations.tce(vessel)}`,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Broker Comparison Tools</h1>
          <p className="text-muted-foreground">Professional shipping finance and voyage calculation tools</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Real-time Calculations
        </Badge>
      </div>

      <div className="grid gap-6">
        {vessels.map((vessel) => (
          <Card key={vessel.id}>
            <CardHeader>
              <CardTitle>{vessel.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">TCE</p>
                  <p className="font-semibold">{calculations.tce(vessel)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voyage Costs</p>
                  <p className="font-semibold">{calculations.voyageCosts(vessel)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margins</p>
                  <p className="font-semibold">{calculations.profitMargins(vessel)}</p>
                </div>
                <div>
                  <Button size="sm" onClick={() => setSelectedVessel(vessel)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BrokerComparisonTools
