"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calculator, DollarSign, TrendingUp, Ship, Clock, BarChart3, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoyageCalculation {
  revenue: number
  costs: {
    bunkers: number
    portCharges: number
    canal: number
    commission: number
    other: number
  }
  profit: number
  margin: number
  tcEquivalent: number
}

interface CommissionCalculation {
  freightAmount: number
  commissionRate: number
  commissionAmount: number
  netAmount: number
}

export function FinancialCalculators() {
  const [inputs, setInputs] = useState({
    voyage: {
      freightRate: 25000,
      cargoQuantity: 75000,
      distance: 8500,
      speed: 14,
      consumption: 25,
      bunkerPrice: 485,
      portCharges: 45000,
      canalFees: 0,
      commissionRate: 2.5,
      otherCosts: 15000,
    },
    commission: {
      freightAmount: 1875000,
      commissionRate: 2.5,
    },
    demurrage: {
      laytimeAllowed: 5,
      actualTime: 7.5,
      demurrageRate: 15000,
      despatchRate: 7500,
    },
    timeCharter: {
      dailyRate: 18500,
      period: 365,
      utilization: 95,
      offHire: 15,
    },
  })

  const updateInputs = (category: string, updates: any) => {
    setInputs((prev) => ({
      ...prev,
      [category]: { ...prev[category], ...updates },
    }))
  }

  const { toast } = useToast()

  const calculations = useMemo(() => {
    const { voyage, commission, demurrage, timeCharter } = inputs

    return {
      voyage: (() => {
        const revenue = (voyage.freightRate * voyage.cargoQuantity) / 1000
        const voyageTime = voyage.distance / voyage.speed / 24
        const bunkerCost = voyageTime * voyage.consumption * voyage.bunkerPrice
        const commissionCost = (revenue * voyage.commissionRate) / 100
        const totalCosts = bunkerCost + voyage.portCharges + voyage.canalFees + commissionCost + voyage.otherCosts
        const profit = revenue - totalCosts

        return {
          revenue,
          costs: {
            bunkers: bunkerCost,
            ports: voyage.portCharges,
            canal: voyage.canalFees,
            commission: commissionCost,
            other: voyage.otherCosts,
          },
          profit,
          margin: (profit / revenue) * 100,
          tcEquivalent: profit / voyageTime,
        }
      })(),

      commission: (() => {
        const commissionAmount = (commission.freightAmount * commission.commissionRate) / 100
        return {
          freightAmount: commission.freightAmount,
          commissionRate: commission.commissionRate,
          commissionAmount,
          netAmount: commission.freightAmount - commissionAmount,
        }
      })(),

      demurrage: (() => {
        const timeDifference = demurrage.actualTime - demurrage.laytimeAllowed

        if (timeDifference > 0) {
          // Demurrage
          return {
            type: "demurrage",
            amount: timeDifference * demurrage.demurrageRate,
            days: timeDifference,
            rate: demurrage.demurrageRate,
          }
        } else if (timeDifference < 0) {
          // Despatch
          return {
            type: "despatch",
            amount: Math.abs(timeDifference) * demurrage.despatchRate,
            days: Math.abs(timeDifference),
            rate: demurrage.despatchRate,
          }
        } else {
          return {
            type: "neutral",
            amount: 0,
            days: 0,
            rate: 0,
          }
        }
      })(),

      timeCharter: (() => {
        const grossRevenue = timeCharter.dailyRate * timeCharter.period
        const utilizationDays = (timeCharter.period * timeCharter.utilization) / 100
        const offHireDays = timeCharter.offHire
        const workingDays = utilizationDays - offHireDays
        const netRevenue = timeCharter.dailyRate * workingDays
        const efficiency = (workingDays / timeCharter.period) * 100

        return {
          grossRevenue,
          netRevenue,
          workingDays,
          offHireDays,
          efficiency,
          dailyAverage: netRevenue / timeCharter.period,
        }
      })(),
    }
  }, [inputs])

  const handleCopyResults = (results: any, type: string) => {
    const text = JSON.stringify(results, null, 2)
    navigator.clipboard.writeText(text)
    toast({
      title: "Results copied",
      description: `${type} calculation results copied to clipboard`,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Calculators</h2>
          <p className="text-muted-foreground">Professional shipping finance and voyage calculation tools</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Real-time Calculations
        </Badge>
      </div>

      <Tabs defaultValue="voyage" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="voyage">Voyage P&L</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="demurrage">Demurrage</TabsTrigger>
          <TabsTrigger value="timecharter">Time Charter</TabsTrigger>
        </TabsList>

        {/* Voyage P&L Calculator */}
        <TabsContent value="voyage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Voyage Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="freightRate">Freight Rate ($/MT)</Label>
                    <Input
                      id="freightRate"
                      type="number"
                      value={inputs.voyage.freightRate}
                      onChange={(e) => updateInputs("voyage", { freightRate: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargoQuantity">Cargo Quantity (MT)</Label>
                    <Input
                      id="cargoQuantity"
                      type="number"
                      value={inputs.voyage.cargoQuantity}
                      onChange={(e) => updateInputs("voyage", { cargoQuantity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distance">Distance (NM)</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={inputs.voyage.distance}
                      onChange={(e) => updateInputs("voyage", { distance: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="speed">Speed (knots)</Label>
                    <Input
                      id="speed"
                      type="number"
                      value={inputs.voyage.speed}
                      onChange={(e) => updateInputs("voyage", { speed: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consumption">Consumption (MT/day)</Label>
                    <Input
                      id="consumption"
                      type="number"
                      value={inputs.voyage.consumption}
                      onChange={(e) => updateInputs("voyage", { consumption: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bunkerPrice">Bunker Price ($/MT)</Label>
                    <Input
                      id="bunkerPrice"
                      type="number"
                      value={inputs.voyage.bunkerPrice}
                      onChange={(e) => updateInputs("voyage", { bunkerPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="portCharges">Port Charges ($)</Label>
                    <Input
                      id="portCharges"
                      type="number"
                      value={inputs.voyage.portCharges}
                      onChange={(e) => updateInputs("voyage", { portCharges: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="canalFees">Canal Fees ($)</Label>
                    <Input
                      id="canalFees"
                      type="number"
                      value={inputs.voyage.canalFees}
                      onChange={(e) => updateInputs("voyage", { canalFees: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commissionRate">Commission (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.1"
                      value={inputs.voyage.commissionRate}
                      onChange={(e) => updateInputs("voyage", { commissionRate: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherCosts">Other Costs ($)</Label>
                    <Input
                      id="otherCosts"
                      type="number"
                      value={inputs.voyage.otherCosts}
                      onChange={(e) => updateInputs("voyage", { otherCosts: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Voyage Results
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyResults(calculations.voyage, "Voyage P&L")}
                    className="ml-auto"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculations.voyage.revenue)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Cost Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Bunkers</span>
                        <span>{formatCurrency(calculations.voyage.costs.bunkers)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Port Charges</span>
                        <span>{formatCurrency(calculations.voyage.costs.ports)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Canal Fees</span>
                        <span>{formatCurrency(calculations.voyage.costs.canal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission</span>
                        <span>{formatCurrency(calculations.voyage.costs.commission)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Costs</span>
                        <span>{formatCurrency(calculations.voyage.costs.other)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Costs</span>
                        <span>
                          {formatCurrency(Object.values(calculations.voyage.costs).reduce((a, b) => a + b, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Net Profit</span>
                    <span
                      className={cn(
                        "text-lg font-bold",
                        calculations.voyage.profit > 0 ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {formatCurrency(calculations.voyage.profit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Margin</div>
                      <div className="font-bold">{formatNumber(calculations.voyage.margin, 1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">T/C Equivalent</div>
                      <div className="font-bold">{formatCurrency(calculations.voyage.tcEquivalent)}/day</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Voyage time: {formatNumber(inputs.voyage.distance / inputs.voyage.speed / 24, 1)} days
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commission Calculator */}
        <TabsContent value="commission" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Commission Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="freightAmount">Freight Amount ($)</Label>
                  <Input
                    id="freightAmount"
                    type="number"
                    value={inputs.commission.freightAmount}
                    onChange={(e) => updateInputs("commission", { freightAmount: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    value={inputs.commission.commissionRate}
                    onChange={(e) => updateInputs("commission", { commissionRate: Number(e.target.value) })}
                  />
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Common Commission Rates</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateInputs("commission", { commissionRate: 1.25 })}
                    >
                      1.25% (Major Trader)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateInputs("commission", { commissionRate: 2.5 })}
                    >
                      2.5% (Standard)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateInputs("commission", { commissionRate: 3.75 })}
                    >
                      3.75% (Steel Mill)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateInputs("commission", { commissionRate: 5.0 })}
                    >
                      5.0% (Government)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Commission Results
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyResults(calculations.commission, "Commission")}
                    className="ml-auto"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Gross Freight</span>
                    <span className="text-lg font-bold">{formatCurrency(calculations.commission.freightAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Commission ({calculations.commission.commissionRate}%)</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {formatCurrency(calculations.commission.commissionAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Net Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculations.commission.netAmount)}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Commission per MT:{" "}
                      {formatCurrency(calculations.commission.commissionAmount / (inputs.voyage.cargoQuantity || 1))}
                    </div>
                    <div>
                      Net rate per MT:{" "}
                      {formatCurrency(calculations.commission.netAmount / (inputs.voyage.cargoQuantity || 1))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demurrage/Despatch Calculator */}
        <TabsContent value="demurrage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Laytime Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="laytimeAllowed">Laytime Allowed (days)</Label>
                  <Input
                    id="laytimeAllowed"
                    type="number"
                    step="0.1"
                    value={inputs.demurrage.laytimeAllowed}
                    onChange={(e) => updateInputs("demurrage", { laytimeAllowed: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="actualTime">Actual Time Used (days)</Label>
                  <Input
                    id="actualTime"
                    type="number"
                    step="0.1"
                    value={inputs.demurrage.actualTime}
                    onChange={(e) => updateInputs("demurrage", { actualTime: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="demurrageRate">Demurrage Rate ($/day)</Label>
                  <Input
                    id="demurrageRate"
                    type="number"
                    value={inputs.demurrage.demurrageRate}
                    onChange={(e) => updateInputs("demurrage", { demurrageRate: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="despatchRate">Despatch Rate ($/day)</Label>
                  <Input
                    id="despatchRate"
                    type="number"
                    value={inputs.demurrage.despatchRate}
                    onChange={(e) => updateInputs("demurrage", { despatchRate: Number(e.target.value) })}
                  />
                  <div className="text-xs text-muted-foreground mt-1">Usually 50% of demurrage rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Calculation Results
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyResults(calculations.demurrage, "Demurrage/Despatch")}
                    className="ml-auto"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Allowed</div>
                      <div className="font-bold">{formatNumber(inputs.demurrage.laytimeAllowed, 1)} days</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Actual</div>
                      <div className="font-bold">{formatNumber(inputs.demurrage.actualTime, 1)} days</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Time Difference</span>
                    <span className="text-lg font-bold">
                      {formatNumber(Math.abs(calculations.demurrage.days), 1)} days
                    </span>
                  </div>

                  {calculations.demurrage.type === "demurrage" && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Demurrage Due</span>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(calculations.demurrage.amount)}
                      </span>
                    </div>
                  )}

                  {calculations.demurrage.type === "despatch" && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Despatch Earned</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(calculations.demurrage.amount)}
                      </span>
                    </div>
                  )}

                  {calculations.demurrage.type === "neutral" && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">No Demurrage/Despatch</span>
                      <span className="text-lg font-bold text-gray-600">{formatCurrency(0)}</span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {calculations.demurrage.type === "demurrage" &&
                      `Vessel exceeded laytime by ${formatNumber(calculations.demurrage.days, 1)} days`}
                    {calculations.demurrage.type === "despatch" &&
                      `Vessel saved ${formatNumber(calculations.demurrage.days, 1)} days of laytime`}
                    {calculations.demurrage.type === "neutral" && "Vessel used exactly the allowed laytime"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Charter Calculator */}
        <TabsContent value="timecharter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Time Charter Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dailyRate">Daily Rate ($/day)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={inputs.timeCharter.dailyRate}
                    onChange={(e) => updateInputs("timeCharter", { dailyRate: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="period">Charter Period (days)</Label>
                  <Input
                    id="period"
                    type="number"
                    value={inputs.timeCharter.period}
                    onChange={(e) => updateInputs("timeCharter", { period: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="utilization">Utilization (%)</Label>
                  <Input
                    id="utilization"
                    type="number"
                    value={inputs.timeCharter.utilization}
                    onChange={(e) => updateInputs("timeCharter", { utilization: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="offHire">Off-hire Days</Label>
                  <Input
                    id="offHire"
                    type="number"
                    value={inputs.timeCharter.offHire}
                    onChange={(e) => updateInputs("timeCharter", { offHire: Number(e.target.value) })}
                  />
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Quick Periods</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button variant="outline" size="sm" onClick={() => updateInputs("timeCharter", { period: 30 })}>
                      1 Month
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateInputs("timeCharter", { period: 90 })}>
                      3 Months
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateInputs("timeCharter", { period: 180 })}>
                      6 Months
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateInputs("timeCharter", { period: 365 })}>
                      1 Year
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Charter Results
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyResults(calculations.timeCharter, "Time Charter")}
                    className="ml-auto"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Gross Revenue</span>
                    <span className="text-lg font-bold">{formatCurrency(calculations.timeCharter.grossRevenue)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Net Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculations.timeCharter.netRevenue)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Working Days</div>
                      <div className="font-bold">{formatNumber(calculations.timeCharter.workingDays, 0)}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Off-hire Days</div>
                      <div className="font-bold">{formatNumber(calculations.timeCharter.offHireDays, 0)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Efficiency</div>
                      <div className="font-bold">{formatNumber(calculations.timeCharter.efficiency, 1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Daily Average</div>
                      <div className="font-bold">{formatCurrency(calculations.timeCharter.dailyAverage)}</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div>Charter period: {inputs.timeCharter.period} days</div>
                    <div>
                      Revenue lost to off-hire:{" "}
                      {formatCurrency(calculations.timeCharter.grossRevenue - calculations.timeCharter.netRevenue)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
