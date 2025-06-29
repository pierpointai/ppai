"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Ship, TrendingUp, Clock, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoyageEstimate {
  grossRevenue: number
  totalCosts: number
  netProfit: number
  tceDaily: number
  profitMargin: number
  voyageDays: number
  breakdown: {
    bunkerCost: number
    portCosts: number
    canalCosts: number
    commissions: number
    dailyRunning: number
  }
}

interface EstimationInputs {
  vesselType: string
  dwt: number
  consumption: number
  dailyRunning: number
  vesselSpeed: number
  route: string
  loadPort: string
  dischargePort: string
  distance: number
  loadDays: number
  dischargeDays: number
  freightRate: number
  bunkerPrice: number
  portCosts: number
  commissionRate: number
  canalTransit: boolean
}

const VESSEL_PRESETS = {
  handysize: { dwt: 35000, consumption: 18, speed: 12, dailyRunning: 8500 },
  handymax: { dwt: 50000, consumption: 22, speed: 13, dailyRunning: 10000 },
  supramax: { dwt: 58000, consumption: 25, speed: 14, dailyRunning: 12000 },
  ultramax: { dwt: 65000, consumption: 28, speed: 14.5, dailyRunning: 13500 },
  panamax: { dwt: 82000, consumption: 32, speed: 14.5, dailyRunning: 16000 },
  kamsarmax: { dwt: 85000, consumption: 35, speed: 15, dailyRunning: 16500 },
  capesize: { dwt: 180000, consumption: 45, speed: 15, dailyRunning: 22000 },
}

const MAJOR_ROUTES = [
  { name: "Brazil-China (Iron Ore)", load: "Tubarao", discharge: "Qingdao", distance: 11200, canal: false },
  { name: "Australia-China (Iron Ore)", load: "Port Hedland", discharge: "Qingdao", distance: 3800, canal: false },
  { name: "Australia-Europe (Coal)", load: "Newcastle", discharge: "Rotterdam", distance: 11500, canal: true },
  { name: "US Gulf-Asia (Grain)", load: "New Orleans", discharge: "Shanghai", distance: 12800, canal: true },
  { name: "Black Sea-Asia (Grain)", load: "Constanta", discharge: "Shanghai", distance: 10200, canal: true },
  { name: "Indonesia-India (Coal)", load: "Samarinda", discharge: "Paradip", distance: 2800, canal: false },
  { name: "US Gulf-Europe (Grain)", load: "New Orleans", discharge: "Rotterdam", distance: 5500, canal: false },
  { name: "Brazil-Europe (Iron Ore)", load: "Tubarao", discharge: "Rotterdam", distance: 6000, canal: false },
]

export function VoyageEstimationCalculator() {
  const [inputs, setInputs] = useState<EstimationInputs>({
    vesselType: "",
    dwt: 58000,
    consumption: 25,
    dailyRunning: 12000,
    vesselSpeed: 14,
    route: "",
    loadPort: "Tubarao",
    dischargePort: "Qingdao",
    distance: 11200,
    loadDays: 2,
    dischargeDays: 3,
    freightRate: 25.5,
    bunkerPrice: 580,
    portCosts: 150000,
    commissionRate: 2.5,
    canalTransit: false,
  })

  const [estimate, setEstimate] = useState<VoyageEstimate | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const { toast } = useToast()

  // Auto-calculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateEstimate()
    }, 300)
    return () => clearTimeout(timer)
  }, [inputs])

  const calculateEstimate = () => {
    setIsCalculating(true)

    try {
      // Calculate voyage days
      const seaDays = inputs.distance / (inputs.vesselSpeed * 24)
      const voyageDays = seaDays + inputs.loadDays + inputs.dischargeDays

      // Revenue calculation
      // Use 95% of DWT as typical cargo capacity
      const cargoQuantity = inputs.dwt * 0.95
      const grossRevenue = inputs.freightRate * cargoQuantity

      // Cost calculations
      const bunkerCost = seaDays * inputs.consumption * inputs.bunkerPrice
      const portCosts = inputs.portCosts
      const canalCosts = inputs.canalTransit ? 250000 : 0
      const commissions = (grossRevenue * inputs.commissionRate) / 100
      const dailyRunning = inputs.dailyRunning * voyageDays

      const totalCosts = bunkerCost + portCosts + canalCosts + commissions + dailyRunning
      const netProfit = grossRevenue - totalCosts
      const tceDaily = netProfit / voyageDays
      const profitMargin = (netProfit / grossRevenue) * 100

      setEstimate({
        grossRevenue,
        totalCosts,
        netProfit,
        tceDaily,
        profitMargin,
        voyageDays,
        breakdown: {
          bunkerCost,
          portCosts,
          canalCosts,
          commissions,
          dailyRunning,
        },
      })
    } catch (error) {
      console.error("Calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const applyVesselPreset = (vesselType: keyof typeof VESSEL_PRESETS) => {
    const preset = VESSEL_PRESETS[vesselType]
    setInputs((prev) => ({
      ...prev,
      vesselType,
      dwt: preset.dwt,
      consumption: preset.consumption,
      vesselSpeed: preset.speed,
      dailyRunning: preset.dailyRunning,
    }))
  }

  const applyRoutePreset = (route: (typeof MAJOR_ROUTES)[0]) => {
    setInputs((prev) => ({
      ...prev,
      route: route.name,
      loadPort: route.load,
      dischargePort: route.discharge,
      distance: route.distance,
      canalTransit: route.canal,
    }))
  }

  const copyResults = () => {
    if (!estimate) return

    const cargoQuantity = Math.round(inputs.dwt * 0.95)
    const results = `VOYAGE ESTIMATION
Load: ${inputs.loadPort}
Discharge: ${inputs.dischargePort}
Vessel: ${inputs.dwt.toLocaleString()} DWT
Cargo: ${cargoQuantity.toLocaleString()} MT
Rate: $${inputs.freightRate}/MT

RESULTS:
Gross Revenue: $${estimate.grossRevenue.toLocaleString()}
Total Costs: $${estimate.totalCosts.toLocaleString()}
Net Profit: $${estimate.netProfit.toLocaleString()}
TCE: $${estimate.tceDaily.toLocaleString()}/day
Margin: ${estimate.profitMargin.toFixed(1)}%
Voyage Days: ${estimate.voyageDays.toFixed(1)}

Generated: ${new Date().toLocaleString()}`

    navigator.clipboard.writeText(results)
    toast({
      title: "Results copied",
      description: "Voyage estimate copied to clipboard",
    })
  }

  const getMarketAssessment = (tce: number) => {
    if (tce > 15000) return { text: "Strong Market", color: "bg-green-100 text-green-800" }
    if (tce > 10000) return { text: "Competitive", color: "bg-yellow-100 text-yellow-800" }
    return { text: "Below Market", color: "bg-red-100 text-red-800" }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 bg-slate-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Quick Voyage Estimation</h2>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Real-time
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {estimate && (
            <Button variant="outline" size="sm" onClick={copyResults}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Results
            </Button>
          )}
          {isCalculating && <RefreshCw className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Vessel Particulars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Vessel Particulars
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Vessel Type Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VESSEL_PRESETS).map(([type, preset]) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => applyVesselPreset(type as keyof typeof VESSEL_PRESETS)}
                      className={inputs.vesselType === type ? "bg-blue-50 border-blue-300" : ""}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dwt">DWT</Label>
                  <Input
                    id="dwt"
                    type="number"
                    value={inputs.dwt}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dwt: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="speed">Speed (knots)</Label>
                  <Input
                    id="speed"
                    type="number"
                    step="0.5"
                    value={inputs.vesselSpeed}
                    onChange={(e) => setInputs((prev) => ({ ...prev, vesselSpeed: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="consumption">Consumption (MT/day)</Label>
                  <Input
                    id="consumption"
                    type="number"
                    value={inputs.consumption}
                    onChange={(e) => setInputs((prev) => ({ ...prev, consumption: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyRunning">Daily Running ($)</Label>
                  <Input
                    id="dailyRunning"
                    type="number"
                    value={inputs.dailyRunning}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dailyRunning: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route & Cargo */}
          <Card>
            <CardHeader>
              <CardTitle>Route & Cargo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Common Routes</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {MAJOR_ROUTES.map((route, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyRoutePreset(route)}
                      className="justify-start text-left h-auto p-3"
                    >
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {route.load} → {route.discharge} ({route.distance.toLocaleString()} NM)
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loadPort">Load Port</Label>
                  <Input
                    id="loadPort"
                    value={inputs.loadPort}
                    onChange={(e) => setInputs((prev) => ({ ...prev, loadPort: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dischargePort">Discharge Port</Label>
                  <Input
                    id="dischargePort"
                    value={inputs.dischargePort}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dischargePort: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (NM)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={inputs.distance}
                    onChange={(e) => setInputs((prev) => ({ ...prev, distance: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="freightRate">Freight Rate ($/MT)</Label>
                  <Input
                    id="freightRate"
                    type="number"
                    step="0.1"
                    value={inputs.freightRate}
                    onChange={(e) => setInputs((prev) => ({ ...prev, freightRate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="loadDays">Load Days</Label>
                  <Input
                    id="loadDays"
                    type="number"
                    value={inputs.loadDays}
                    onChange={(e) => setInputs((prev) => ({ ...prev, loadDays: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dischargeDays">Discharge Days</Label>
                  <Input
                    id="dischargeDays"
                    type="number"
                    value={inputs.dischargeDays}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dischargeDays: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="canalTransit"
                  checked={inputs.canalTransit}
                  onChange={(e) => setInputs((prev) => ({ ...prev, canalTransit: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="canalTransit">Canal Transit (Panama/Suez)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Market Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Market Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bunkerPrice">Bunker Price ($/MT)</Label>
                  <Input
                    id="bunkerPrice"
                    type="number"
                    value={inputs.bunkerPrice}
                    onChange={(e) => setInputs((prev) => ({ ...prev, bunkerPrice: Number(e.target.value) }))}
                  />
                  <div className="text-xs text-muted-foreground mt-1">Singapore: $580 | Rotterdam: $575</div>
                </div>
                <div>
                  <Label htmlFor="commissionRate">Commission (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    value={inputs.commissionRate}
                    onChange={(e) => setInputs((prev) => ({ ...prev, commissionRate: Number(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="portCosts">Total Port Costs ($)</Label>
                  <Input
                    id="portCosts"
                    type="number"
                    value={inputs.portCosts}
                    onChange={(e) => setInputs((prev) => ({ ...prev, portCosts: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {estimate && (
            <>
              {/* Key Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estimation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">TCE Daily</div>
                      <div
                        className={`text-2xl font-bold ${estimate.tceDaily > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${estimate.tceDaily.toLocaleString()}
                      </div>
                      <Badge className={`mt-2 ${getMarketAssessment(estimate.tceDaily).color}`}>
                        {getMarketAssessment(estimate.tceDaily).text}
                      </Badge>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Profit Margin</div>
                      <div
                        className={`text-2xl font-bold ${estimate.profitMargin > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {estimate.profitMargin.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gross Revenue:</span>
                      <span className="font-semibold">${estimate.grossRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Costs:</span>
                      <span className="font-semibold">${estimate.totalCosts.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span>Net Profit:</span>
                      <span className={`font-bold ${estimate.netProfit > 0 ? "text-green-600" : "text-red-600"}`}>
                        ${estimate.netProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Bunker Costs:</span>
                      <span>${estimate.breakdown.bunkerCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Running:</span>
                      <span>${estimate.breakdown.dailyRunning.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Port Costs:</span>
                      <span>${estimate.breakdown.portCosts.toLocaleString()}</span>
                    </div>
                    {estimate.breakdown.canalCosts > 0 && (
                      <div className="flex justify-between">
                        <span>Canal Costs:</span>
                        <span>${estimate.breakdown.canalCosts.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Commissions:</span>
                      <span>${estimate.breakdown.commissions.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voyage Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Voyage Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-muted-foreground">Voyage Days</div>
                      <div className="font-bold">{estimate.voyageDays.toFixed(1)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-muted-foreground">Distance</div>
                      <div className="font-bold">{inputs.distance.toLocaleString()} NM</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-muted-foreground">Cargo Capacity</div>
                      <div className="font-bold">{inputs.dwt.toLocaleString()} MT</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-muted-foreground">Rate/MT</div>
                      <div className="font-bold">${inputs.freightRate}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-muted-foreground">Cargo Quantity</div>
                      <div className="font-bold">{Math.round(inputs.dwt * 0.95).toLocaleString()} MT</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
