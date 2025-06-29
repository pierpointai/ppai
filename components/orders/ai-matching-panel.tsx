"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Ship, Zap, DollarSign, Clock, MapPin, Target, BarChart3 } from "lucide-react"
import { useOrderStore, type LinkedVesselStatus } from "@/lib/store/order-store"
import { useOfferStore } from "@/lib/store/offer-store"
import { aiMatchingEngine, type VesselMatch } from "@/lib/ai-matching-engine"
import { calculateVesselProximity } from "@/lib/enhanced-matching"
import { OrderDetailsDialog } from "./order-details-dialog"
import { toast } from "@/components/ui/use-toast"

interface AIMatchingPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIMatchingPanel({ open, onOpenChange }: AIMatchingPanelProps) {
  const { getFilteredOrders, linkVessel, linkVesselsToOrder, orders } = useOrderStore()
  const { offers } = useOfferStore()
  const [matches, setMatches] = useState<VesselMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("matches")
  const [minMatchScore, setMinMatchScore] = useState(60)
  const [autoLinkThreshold, setAutoLinkThreshold] = useState(90)
  const [autoLinkEnabled, setAutoLinkEnabled] = useState(false)
  const [appliedMatches, setAppliedMatches] = useState<string[]>([])
  const [processingProgress, setProcessingProgress] = useState(0)
  const [proximityEnabled, setProximityEnabled] = useState(false)
  const [proximityRadius, setProximityRadius] = useState(100)
  const [preferExactMatch, setPreferExactMatch] = useState(true)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Get the current order from the store (this will have the updated linked vessels)
  const selectedOrder = selectedOrderId ? orders.find((order) => order.id === selectedOrderId) : null

  // Run matching when panel opens
  useEffect(() => {
    if (open) {
      runMatching()
    } else {
      setMatches([])
      setAppliedMatches([])
      setProcessingProgress(0)
    }
  }, [open])

  // Fix the runMatching function to properly handle errors and state
  const runMatching = async () => {
    setIsLoading(true)
    setAppliedMatches([])
    setProcessingProgress(0)

    try {
      // Simulate processing with progress updates
      const steps = [
        { progress: 25, message: "Analyzing vessel positions..." },
        { progress: 50, message: "Calculating route compatibility..." },
        { progress: 75, message: "Evaluating commercial terms..." },
        { progress: 100, message: "Generating recommendations..." },
      ]

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        setProcessingProgress(step.progress)
      }

      // Get active orders and available vessels
      const activeOrders = getFilteredOrders().filter((order) => order.status === "Active")
      if (activeOrders.length === 0) {
        toast({
          title: "No active orders",
          description: "Please create active orders to match with vessels.",
          variant: "destructive",
        })
        return
      }

      const availableVessels = offers.filter((offer) => offer.status === "available" || !offer.status)
      if (availableVessels.length === 0) {
        toast({
          title: "No available vessels",
          description: "Please add available vessels to match with orders.",
          variant: "destructive",
        })
        return
      }

      // Get matches from AI engine
      let matchResults = aiMatchingEngine.autoMatchAll(availableVessels, activeOrders)

      // Filter by minimum match score
      matchResults = matchResults.filter((match) => match.matchScore >= minMatchScore)

      // Apply proximity filter
      if (proximityEnabled) {
        matchResults = matchResults.filter((match) => {
          const vesselPort = match.vessel.openPort || match.vessel.loadPort || ""
          const loadPort = match.order.loadPort

          if (preferExactMatch) {
            // Check for exact port match first
            const exactMatch =
              vesselPort.toLowerCase().includes(loadPort.toLowerCase()) ||
              loadPort.toLowerCase().includes(vesselPort.toLowerCase())
            if (exactMatch) return true
          }

          // Check proximity distance
          const distance = calculateVesselProximity(vesselPort, loadPort)
          return distance !== null && distance <= proximityRadius
        })
      }

      // Auto-link high confidence matches if enabled
      if (autoLinkEnabled) {
        const highConfidenceMatches = matchResults.filter((match) => match.matchScore >= autoLinkThreshold)

        for (const match of highConfidenceMatches) {
          try {
            const linkedVessel = {
              id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: match.vessel.vesselName || "Unknown Vessel",
              dwt: (match.vessel.vesselSize || 0) * 1000,
              built: new Date().getFullYear() - (match.vessel.vesselAge || 0),
              flag: match.vessel.vesselFlag || "Unknown",
              matchScore: match.matchScore,
              vesselId: match.vessel.id,
              vesselName: match.vessel.vesselName,
              vesselType: match.vessel.vesselType || "Bulk Carrier",
              openPort: match.vessel.openPort || match.vessel.loadPort,
              laycanStart: new Date(match.vessel.laycanStart || new Date()),
              laycanEnd: new Date(match.vessel.laycanEnd || new Date()),
              status: "Shortlisted" as LinkedVesselStatus,
              linkedAt: new Date(),
              notes: `AI Match - ${match.matchScore}% confidence`,
            }

            linkVessel(match.order.id, linkedVessel)
            setAppliedMatches((prev) => [...prev, `${match.vessel.id}-${match.order.id}`])
          } catch (error) {
            console.error("Error auto-linking vessel:", error)
          }
        }
      }

      if (matchResults.length === 0) {
        toast({
          title: "No matches found",
          description: "Try adjusting your matching criteria or add more vessels/orders.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Matching complete",
          description: `Found ${matchResults.length} vessel-order matches.`,
        })
      }

      setMatches(matchResults)
    } catch (error) {
      console.error("Error running AI matching:", error)
      toast({
        title: "Matching error",
        description: "An error occurred while matching vessels to orders.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setProcessingProgress(0)
    }
  }

  // Fix the handleApplyMatch function to properly handle errors
  const handleApplyMatch = async (match: VesselMatch) => {
    const matchKey = `${match.vessel.id}-${match.order.id}`

    // Skip if already applied
    if (appliedMatches.includes(matchKey)) return

    try {
      // Create a properly formatted linked vessel object
      const linkedVessel = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: match.vessel.vesselName || "Unknown Vessel",
        dwt: (match.vessel.vesselSize || 0) * 1000,
        built: new Date().getFullYear() - (match.vessel.vesselAge || 0),
        flag: match.vessel.vesselFlag || "Unknown",
        matchScore: match.matchScore,
        vesselId: match.vessel.id,
        vesselName: match.vessel.vesselName,
        vesselType: match.vessel.vesselType || "Bulk Carrier",
        openPort: match.vessel.openPort || match.vessel.loadPort,
        laycanStart: new Date(match.vessel.laycanStart || new Date()),
        laycanEnd: new Date(match.vessel.laycanEnd || new Date()),
        status: "Shortlisted" as LinkedVesselStatus,
        linkedAt: new Date(),
        notes: `AI Match - ${match.matchScore}% confidence`,
      }

      // Link the vessel to the order using the store method
      linkVessel(match.order.id, linkedVessel)

      // Track that this match has been applied
      setAppliedMatches((prev) => [...prev, matchKey])

      // Wait a brief moment for the store to update, then show the order details popup
      setTimeout(() => {
        setSelectedOrderId(match.order.id)
        setShowOrderDetails(true)
      }, 100)

      toast({
        title: "Match applied",
        description: `${match.vessel.vesselName || "Vessel"} linked to order ${match.order.id}`,
      })
    } catch (error) {
      console.error("Error applying match:", error)
      toast({
        title: "Error",
        description: "Failed to apply match. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isMatchApplied = (match: VesselMatch) => {
    return appliedMatches.includes(`${match.vessel.id}-${match.order.id}`)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-700 bg-green-50 border-green-200"
      case "Medium":
        return "text-amber-700 bg-amber-50 border-amber-200"
      case "High":
        return "text-red-700 bg-red-50 border-red-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-600"
    if (score >= 75) return "bg-blue-600"
    if (score >= 60) return "bg-amber-600"
    return "bg-gray-400"
  }

  const getMatchQuality = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-700" }
    if (score >= 75) return { label: "Good", color: "text-blue-700" }
    if (score >= 60) return { label: "Fair", color: "text-amber-700" }
    return { label: "Poor", color: "text-gray-700" }
  }

  const totalMatches = matches.length
  const excellentMatches = matches.filter((m) => m.matchScore >= 90).length
  const goodMatches = matches.filter((m) => m.matchScore >= 75 && m.matchScore < 90).length
  const appliedCount = appliedMatches.length

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">AI Vessel Matching</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Intelligent matching of vessels to active orders</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {totalMatches > 0 && (
                  <>
                    <span>{excellentMatches} excellent</span>
                    <span>{goodMatches} good</span>
                    <span>{appliedCount} applied</span>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="matches">
                  Matches
                  {totalMatches > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {totalMatches}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <Button onClick={runMatching} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Run AI Matching
                  </>
                )}
              </Button>
            </div>

            {isLoading && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Analyzing matches...</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            <TabsContent value="matches" className="flex-1 overflow-auto mt-0">
              {!isLoading && matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
                  <Ship className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No matches found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Try adjusting your matching criteria or ensure you have active orders and available vessels
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => {
                    const quality = getMatchQuality(match.matchScore)
                    return (
                      <Card key={`${match.vessel.id}-${match.order.id}`} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <Ship className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-lg">{match.vessel.vesselName}</CardTitle>
                                  <Badge variant="outline" className="text-xs">
                                    {match.vessel.vesselType}
                                  </Badge>
                                </div>
                                <CardDescription className="text-sm">
                                  {match.vessel.vesselSize}k DWT • {match.vessel.vesselAge} years •{" "}
                                  {match.vessel.vesselFlag}
                                </CardDescription>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {match.vessel.openPort || match.vessel.loadPort}
                                    {(() => {
                                      const distance = calculateVesselProximity(
                                        match.vessel.openPort || match.vessel.loadPort || "",
                                        match.order.loadPort,
                                      )
                                      if (distance !== null && distance > 0) {
                                        return (
                                          <span
                                            className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                                              distance <= 50
                                                ? "bg-green-100 text-green-700"
                                                : distance <= 100
                                                  ? "bg-blue-100 text-blue-700"
                                                  : distance <= 200
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {Math.round(distance)} NM
                                          </span>
                                        )
                                      }
                                      return null
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {match.vessel.openDates || "Available now"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Match Score</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 ${getScoreColor(match.matchScore)}`}
                                      style={{ width: `${match.matchScore}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-lg">{match.matchScore}%</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge variant="outline" className={quality.color}>
                                  {quality.label}
                                </Badge>
                                <Badge variant="outline" className={getRiskColor(match.riskLevel)}>
                                  {match.riskLevel} Risk
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <div className="px-6 py-2 bg-muted/30">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4" />
                            <span className="font-medium">Order:</span>
                            <span>{match.order.cargoType}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>
                              {match.order.loadPort} → {match.order.dischargePort}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span>{match.order.charterer || "Unknown Charterer"}</span>
                          </div>
                        </div>

                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Strengths
                              </h4>
                              <ul className="space-y-1">
                                {match.reasons.slice(0, 3).map((reason, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                Considerations
                              </h4>
                              {match.warnings.length > 0 ? (
                                <ul className="space-y-1">
                                  {match.warnings.slice(0, 3).map((warning, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <div className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                                      <span>{warning}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">No significant concerns</p>
                              )}
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="flex justify-between items-center pt-4 bg-muted/20">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Est. Profit:</span>
                              <span className="text-sm font-medium">${match.estimatedProfit.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              <span className="text-sm">Confidence: {Math.round(match.confidence * 100)}%</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Button
                              onClick={() => handleApplyMatch(match)}
                              disabled={isMatchApplied(match)}
                              variant={isMatchApplied(match) ? "outline" : "default"}
                            >
                              {isMatchApplied(match) ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Applied
                                </>
                              ) : (
                                "Apply Match"
                              )}
                            </Button>
                            {isMatchApplied(match) && (
                              <span className="text-xs text-muted-foreground">Linked to Order {match.order.id}</span>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Matching Settings</CardTitle>
                  <CardDescription>Configure the matching algorithm parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="min-score" className="text-sm font-medium">
                        Minimum Match Score
                      </Label>
                      <Badge variant="outline">{minMatchScore}%</Badge>
                    </div>
                    <Slider
                      id="min-score"
                      min={0}
                      max={100}
                      step={5}
                      value={[minMatchScore]}
                      onValueChange={(value) => setMinMatchScore(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only show matches with a score at or above this threshold
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="auto-link" className="text-sm font-medium">
                          Auto-link High Confidence Matches
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically link vessels that exceed the threshold
                        </p>
                      </div>
                      <Switch id="auto-link" checked={autoLinkEnabled} onCheckedChange={setAutoLinkEnabled} />
                    </div>

                    {autoLinkEnabled && (
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-threshold">Auto-link Threshold</Label>
                          <Badge variant="outline">{autoLinkThreshold}%</Badge>
                        </div>
                        <Slider
                          id="auto-threshold"
                          min={70}
                          max={100}
                          step={5}
                          value={[autoLinkThreshold]}
                          onValueChange={(value) => setAutoLinkThreshold(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                          Matches above this score will be automatically applied
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="proximity-enabled" className="text-sm font-medium">
                          Enable Proximity Matching
                        </Label>
                        <p className="text-xs text-muted-foreground">Factor in vessel proximity to the load port</p>
                      </div>
                      <Switch id="proximity-enabled" checked={proximityEnabled} onCheckedChange={setProximityEnabled} />
                    </div>

                    {proximityEnabled && (
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="proximity-radius">Proximity Radius (NM)</Label>
                          <Badge variant="outline">{proximityRadius} NM</Badge>
                        </div>
                        <Slider
                          id="proximity-radius"
                          min={50}
                          max={500}
                          step={50}
                          value={[proximityRadius]}
                          onValueChange={(value) => setProximityRadius(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                          Only show vessels within this distance of the load port
                        </p>

                        <div className="flex items-center space-x-2">
                          <Switch id="prefer-exact" checked={preferExactMatch} onCheckedChange={setPreferExactMatch} />
                          <Label htmlFor="prefer-exact" className="text-sm">
                            Prefer Exact Port Match
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Order Details Popup after applying match - now gets fresh data from store */}
      {selectedOrder && (
        <OrderDetailsDialog
          open={showOrderDetails}
          onOpenChange={(open) => {
            setShowOrderDetails(open)
            if (!open) setSelectedOrderId(null)
          }}
          order={selectedOrder}
        />
      )}
    </>
  )
}
