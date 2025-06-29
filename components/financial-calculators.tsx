"use client"

import { useState } from "react"
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
  const [voyageInputs, setVoyageInputs] = useState({
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
  })

  const [commissionInputs, setCommissionInputs] = useState({
    freightAmount: 1875000,
    commissionRate: 2.5,
  })

  const [demurrageInputs, setDemurrageInputs] = useState({
    laytimeAllowed: 5,
    actualTime: 7.5,
    demurrageRate: 15000,
    despatchRate: 7500,
  })

  const [tcInputs, setTcInputs] = useState({
    dailyRate: 18500,
    period: 365,
    utilization: 95,
    offHire: 15,
  })

  const { toast } = useToast()

  // Voyage P&L Calculator
  const calculateVoyage = (): VoyageCalculation => {
    const revenue = (voyageInputs.freightRate * voyageInputs.cargoQuantity) / 1000
    const voyageTime = voyageInputs.distance / voyageInputs.speed / 24
    const bunkerCost = voyageTime * voyageInputs.consumption * voyageInputs.bunkerPrice
    const commission = (revenue * voyageInputs.commissionRate) / 100

    const costs = {
      bunkers: bunkerCost,
      portCharges: voyageInputs.portCharges,
      canal: voyageInputs.canalFees,
      commission: commission,
      other: voyageInputs.otherCosts,
    }

    const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
    const profit = revenue - totalCosts
    const margin = (profit / revenue) * 100
    const tcEquivalent = profit / voyageTime

    return {
      revenue,
      costs,
      profit,
      margin,
      tcEquivalent,
    }
  }

  // Commission Calculator
  const calculateCommission = (): CommissionCalculation => {
    const commissionAmount = (commissionInputs.freightAmount * commissionInputs.commissionRate) / 100
    const netAmount = commissionInputs.freightAmount - commissionAmount

    return {
      freightAmount: commissionInputs.freightAmount,
      commissionRate: commissionInputs.commissionRate,
      commissionAmount,
      netAmount,
    }
  }

  // Demurrage/Despatch Calculator
  const calculateDemurrage = () => {
    const timeDifference = demurrageInputs.actualTime - demurrageInputs.laytimeAllowed

    if (timeDifference > 0) {
      // Demurrage
      return {
        type: "demurrage",
        amount: timeDifference * demurrageInputs.demurrageRate,
        days: timeDifference,
        rate: demurrageInputs.demurrageRate,
      }
    } else if (timeDifference < 0) {
      // Despatch
      return {
        type: "despatch",
        amount: Math.abs(timeDifference) * demurrageInputs.despatchRate,
        days: Math.abs(timeDifference),
        rate: demurrageInputs.despatchRate,
      }
    } else {
      return {
        type: "neutral",
        amount: 0,
        days: 0,
        rate: 0,
      }
    }
  }

  // Time Charter Calculator
  const calculateTimeCharter = () => {
    const grossRevenue = tcInputs.dailyRate * tcInputs.period
    const utilizationDays = (tcInputs.period * tcInputs.utilization) / 100
    const offHireDays = tcInputs.offHire
    const workingDays = utilizationDays - offHireDays
    const netRevenue = tcInputs.dailyRate * workingDays
    const efficiency = (workingDays / tcInputs.period) * 100

    return {
      grossRevenue,
      netRevenue,
      workingDays,
      offHireDays,
      efficiency,
      dailyAverage: netRevenue / tcInputs.period,
    }
  }

  const voyageResult = calculateVoyage()
  const commissionResult = calculateCommission()
  const demurrageResult = calculateDemurrage()
  const tcResult = calculateTimeCharter()

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
                      value={voyageInputs.freightRate}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          freightRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargoQuantity">Cargo Quantity (MT)</Label>
                    <Input
                      id="cargoQuantity"
                      type="number"
                      value={voyageInputs.cargoQuantity}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          cargoQuantity: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distance">Distance (NM)</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={voyageInputs.distance}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          distance: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="speed">Speed (knots)</Label>
                    <Input
                      id="speed"
                      type="number"
                      value={voyageInputs.speed}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          speed: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consumption">Consumption (MT/day)</Label>
                    <Input
                      id="consumption"
                      type="number"
                      value={voyageInputs.consumption}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          consumption: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bunkerPrice">Bunker Price ($/MT)</Label>
                    <Input
                      id="bunkerPrice"
                      type="number"
                      value={voyageInputs.bunkerPrice}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          bunkerPrice: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="portCharges">Port Charges ($)</Label>
                    <Input
                      id="portCharges"
                      type="number"
                      value={voyageInputs.portCharges}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          portCharges: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="canalFees">Canal Fees ($)</Label>
                    <Input
                      id="canalFees"
                      type="number"
                      value={voyageInputs.canalFees}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          canalFees: Number(e.target.value),
                        }))
                      }
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
                      value={voyageInputs.commissionRate}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          commissionRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherCosts">Other Costs ($)</Label>
                    <Input
                      id="otherCosts"
                      type="number"
                      value={voyageInputs.otherCosts}
                      onChange={(e) =>
                        setVoyageInputs((prev) => ({
                          ...prev,
                          otherCosts: Number(e.target.value),
                        }))
                      }
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
                    onClick={() => handleCopyResults(voyageResult, "Voyage P&L")}
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
                    <span className="text-lg font-bold text-green-600">{formatCurrency(voyageResult.revenue)}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Cost Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Bunkers</span>
                        <span>{formatCurrency(voyageResult.costs.bunkers)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Port Charges</span>
                        <span>{formatCurrency(voyageResult.costs.portCharges)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Canal Fees</span>
                        <span>{formatCurrency(voyageResult.costs.canal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission</span>
                        <span>{formatCurrency(voyageResult.costs.commission)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Costs</span>
                        <span>{formatCurrency(voyageResult.costs.other)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Costs</span>
                        <span>{formatCurrency(Object.values(voyageResult.costs).reduce((a, b) => a + b, 0))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Net Profit</span>
                    <span
                      className={cn("text-lg font-bold", voyageResult.profit > 0 ? "text-green-600" : "text-red-600")}
                    >
                      {formatCurrency(voyageResult.profit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Margin</div>
                      <div className="font-bold">{formatNumber(voyageResult.margin, 1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">T/C Equivalent</div>
                      <div className="font-bold">{formatCurrency(voyageResult.tcEquivalent)}/day</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Voyage time: {formatNumber(voyageInputs.distance / voyageInputs.speed / 24, 1)} days
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
                    value={commissionInputs.freightAmount}
                    onChange={(e) =>
                      setCommissionInputs((prev) => ({
                        ...prev,
                        freightAmount: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    value={commissionInputs.commissionRate}
                    onChange={(e) =>
                      setCommissionInputs((prev) => ({
                        ...prev,
                        commissionRate: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Common Commission Rates</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommissionInputs((prev) => ({ ...prev, commissionRate: 1.25 }))}
                    >
                      1.25% (Major Trader)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommissionInputs((prev) => ({ ...prev, commissionRate: 2.5 }))}
                    >
                      2.5% (Standard)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommissionInputs((prev) => ({ ...prev, commissionRate: 3.75 }))}
                    >
                      3.75% (Steel Mill)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommissionInputs((prev) => ({ ...prev, commissionRate: 5.0 }))}
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
                    onClick={() => handleCopyResults(commissionResult, "Commission")}
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
                    <span className="text-lg font-bold">{formatCurrency(commissionResult.freightAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Commission ({commissionResult.commissionRate}%)</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {formatCurrency(commissionResult.commissionAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Net Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(commissionResult.netAmount)}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Commission per MT:{" "}
                      {formatCurrency(commissionResult.commissionAmount / (voyageInputs.cargoQuantity || 1))}
                    </div>
                    <div>
                      Net rate per MT: {formatCurrency(commissionResult.netAmount / (voyageInputs.cargoQuantity || 1))}
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
                    value={demurrageInputs.laytimeAllowed}
                    onChange={(e) =>
                      setDemurrageInputs((prev) => ({
                        ...prev,
                        laytimeAllowed: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="actualTime">Actual Time Used (days)</Label>
                  <Input
                    id="actualTime"
                    type="number"
                    step="0.1"
                    value={demurrageInputs.actualTime}
                    onChange={(e) =>
                      setDemurrageInputs((prev) => ({
                        ...prev,
                        actualTime: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="demurrageRate">Demurrage Rate ($/day)</Label>
                  <Input
                    id="demurrageRate"
                    type="number"
                    value={demurrageInputs.demurrageRate}
                    onChange={(e) =>
                      setDemurrageInputs((prev) => ({
                        ...prev,
                        demurrageRate: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="despatchRate">Despatch Rate ($/day)</Label>
                  <Input
                    id="despatchRate"
                    type="number"
                    value={demurrageInputs.despatchRate}
                    onChange={(e) =>
                      setDemurrageInputs((prev) => ({
                        ...prev,
                        despatchRate: Number(e.target.value),
                      }))
                    }
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
                    onClick={() => handleCopyResults(demurrageResult, "Demurrage/Despatch")}
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
                      <div className="font-bold">{formatNumber(demurrageInputs.laytimeAllowed, 1)} days</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Actual</div>
                      <div className="font-bold">{formatNumber(demurrageInputs.actualTime, 1)} days</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Time Difference</span>
                    <span className="text-lg font-bold">{formatNumber(Math.abs(demurrageResult.days), 1)} days</span>
                  </div>

                  {demurrageResult.type === "demurrage" && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Demurrage Due</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(demurrageResult.amount)}</span>
                    </div>
                  )}

                  {demurrageResult.type === "despatch" && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Despatch Earned</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(demurrageResult.amount)}</span>
                    </div>
                  )}

                  {demurrageResult.type === "neutral" && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">No Demurrage/Despatch</span>
                      <span className="text-lg font-bold text-gray-600">{formatCurrency(0)}</span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {demurrageResult.type === "demurrage" &&
                      `Vessel exceeded laytime by ${formatNumber(demurrageResult.days, 1)} days`}
                    {demurrageResult.type === "despatch" &&
                      `Vessel saved ${formatNumber(demurrageResult.days, 1)} days of laytime`}
                    {demurrageResult.type === "neutral" && "Vessel used exactly the allowed laytime"}
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
                    value={tcInputs.dailyRate}
                    onChange={(e) =>
                      setTcInputs((prev) => ({
                        ...prev,
                        dailyRate: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="period">Charter Period (days)</Label>
                  <Input
                    id="period"
                    type="number"
                    value={tcInputs.period}
                    onChange={(e) =>
                      setTcInputs((prev) => ({
                        ...prev,
                        period: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="utilization">Utilization (%)</Label>
                  <Input
                    id="utilization"
                    type="number"
                    value={tcInputs.utilization}
                    onChange={(e) =>
                      setTcInputs((prev) => ({
                        ...prev,
                        utilization: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="offHire">Off-hire Days</Label>
                  <Input
                    id="offHire"
                    type="number"
                    value={tcInputs.offHire}
                    onChange={(e) =>
                      setTcInputs((prev) => ({
                        ...prev,
                        offHire: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Quick Periods</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTcInputs((prev) => ({ ...prev, period: 30 }))}
                    >
                      1 Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTcInputs((prev) => ({ ...prev, period: 90 }))}
                    >
                      3 Months
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTcInputs((prev) => ({ ...prev, period: 180 }))}
                    >
                      6 Months
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTcInputs((prev) => ({ ...prev, period: 365 }))}
                    >
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
                    onClick={() => handleCopyResults(tcResult, "Time Charter")}
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
                    <span className="text-lg font-bold">{formatCurrency(tcResult.grossRevenue)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Net Revenue</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(tcResult.netRevenue)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Working Days</div>
                      <div className="font-bold">{formatNumber(tcResult.workingDays, 0)}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Off-hire Days</div>
                      <div className="font-bold">{formatNumber(tcResult.offHireDays, 0)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Efficiency</div>
                      <div className="font-bold">{formatNumber(tcResult.efficiency, 1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Daily Average</div>
                      <div className="font-bold">{formatCurrency(tcResult.dailyAverage)}</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div>Charter period: {tcInputs.period} days</div>
                    <div>Revenue lost to off-hire: {formatCurrency(tcResult.grossRevenue - tcResult.netRevenue)}</div>
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
