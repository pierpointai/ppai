"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Ship,
  Mail,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Package,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { useOfferStore } from "@/lib/offer-store"
import type { Offer } from "@/lib/types"
import { useCompareStore } from "@/lib/compare-store"
import { useFavoriteStore } from "@/lib/favorite-store"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { VesselTable } from "@/components/vessel-table"

interface ClientEmailMatcherProps {
  onSelectOffer: (offer: Offer) => void
  onClose: () => void
}

export function ClientEmailMatcher({ onSelectOffer, onClose }: ClientEmailMatcherProps) {
  const { offers } = useOfferStore()
  const [emailContent, setEmailContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const [matchedOffers, setMatchedOffers] = useState<Array<{ offer: Offer; matchScore: number }>>([])
  const [requirements, setRequirements] = useState<Record<string, any> | null>(null)
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set())
  const [emailMatchView, setEmailMatchView] = useState<"input" | "results">("input")
  const { toast } = useToast()
  const { compareOffers, toggleCompareOffer } = useCompareStore()
  const { toggleFavorite } = useFavoriteStore()

  // Sample client email for demo
  const sampleEmail = `From: client@example.com
Subject: Vessel Requirements

Hi,

We are looking for a Supramax vessel, around 55-60k DWT for a grain cargo.
Route: US Gulf to China
Laycan: June 15-25
Budget: Around $18-20k/day

Please let me know if you have any suitable vessels.

Thanks,
John`

  const handleUseSample = () => {
    setEmailContent(sampleEmail)
  }

  const simulateProcessing = async () => {
    setProcessingProgress(0)
    setProcessingStatus("Analyzing client email...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(20)
    setProcessingStatus("Extracting vessel requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(40)
    setProcessingStatus("Identifying route preferences...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(60)
    setProcessingStatus("Parsing date requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(80)
    setProcessingStatus("Analyzing budget constraints...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(100)
    setProcessingStatus("Finding matching offers...")
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const extractRequirements = (email: string) => {
    // In a real app, this would use NLP to extract requirements
    // For this demo, we'll use simple regex patterns

    // Extract vessel type
    const vesselTypeMatch = email.match(/(?:looking for|need|require|want).*?(\w+max|\w+size)(?:\s+vessel)?/i)
    const vesselType = vesselTypeMatch ? vesselTypeMatch[1] : null

    // Extract vessel size
    const vesselSizeMatch = email.match(/(\d+)(?:-(\d+))?\s*k\s*(?:DWT|dwt)/i)
    const vesselSizeMin = vesselSizeMatch ? Number.parseInt(vesselSizeMatch[1]) : null
    const vesselSizeMax =
      vesselSizeMatch && vesselSizeMatch[2]
        ? Number.parseInt(vesselSizeMatch[2])
        : vesselSizeMin
          ? vesselSizeMin + 10
          : null

    // Extract route
    const routeMatch = email.match(
      /(?:route|from|voyage)(?:\s*:\s*|\s+)([A-Za-z\s]+)(?:\s+to\s+|\s*-\s*|\s*\/\s*)([A-Za-z\s]+)/i,
    )
    const loadPort = routeMatch ? routeMatch[1].trim() : null
    const dischargePort = routeMatch ? routeMatch[2].trim() : null

    // Extract laycan
    const laycanMatch = email.match(
      /(?:laycan|dates|date|period)(?:\s*:\s*|\s+)(?:[A-Za-z]+\s+)?(\d+)(?:\s*-\s*|\s+to\s+)(?:[A-Za-z]+\s+)?(\d+)/i,
    )
    const laycanStart = laycanMatch ? Number.parseInt(laycanMatch[1]) : null
    const laycanEnd = laycanMatch ? Number.parseInt(laycanMatch[2]) : null

    // Extract month
    const monthMatch = email.match(
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)/i,
    )
    const month = monthMatch ? monthMatch[0] : "June" // Default to current month

    // Extract budget/rate
    const rateMatch = email.match(
      /(?:budget|rate|price)(?:\s*:\s*|\s+)(?:\$|USD)?\s*(\d+)(?:\.?\d*)?(?:\s*-\s*|\s+to\s+)(?:\$|USD)?\s*(\d+)(?:\.?\d*)?(?:\s*k)?(?:\/day)?/i,
    )
    const rateMin = rateMatch ? Number.parseFloat(rateMatch[1]) : null
    const rateMax = rateMatch ? Number.parseFloat(rateMatch[2]) : null

    // Extract cargo type
    const cargoMatch = email.match(/(?:cargo|commodity)(?:\s*:\s*|\s+)([A-Za-z\s]+)(?:,|\.|$)/i)
    const cargoType = cargoMatch ? cargoMatch[1].trim() : null

    return {
      vesselType,
      vesselSizeMin,
      vesselSizeMax,
      loadPort,
      dischargePort,
      laycanStart,
      laycanEnd,
      month,
      rateMin,
      rateMax,
      cargoType,
    }
  }

  const matchOffers = (requirements: Record<string, any>, availableOffers: Offer[]) => {
    // Calculate match score for each offer
    const matchedOffers = availableOffers.map((offer) => {
      let matchScore = 0
      let totalFactors = 0

      // Match vessel type (25%)
      if (requirements.vesselType && offer.vesselType) {
        totalFactors += 25
        if (offer.vesselType.toLowerCase().includes(requirements.vesselType.toLowerCase())) {
          matchScore += 25
        }
      }

      // Match vessel size (20%)
      if (requirements.vesselSizeMin && requirements.vesselSizeMax && offer.vesselSize) {
        totalFactors += 20
        if (offer.vesselSize >= requirements.vesselSizeMin && offer.vesselSize <= requirements.vesselSizeMax) {
          matchScore += 20
        } else if (
          offer.vesselSize >= requirements.vesselSizeMin * 0.9 &&
          offer.vesselSize <= requirements.vesselSizeMax * 1.1
        ) {
          // Close match
          matchScore += 10
        }
      }

      // Match route (20%)
      if (requirements.loadPort && requirements.dischargePort) {
        totalFactors += 20
        const loadPortMatch =
          offer.loadPort.toLowerCase().includes(requirements.loadPort.toLowerCase()) ||
          requirements.loadPort.toLowerCase().includes(offer.loadPort.toLowerCase())
        const dischargePortMatch =
          offer.dischargePort.toLowerCase().includes(requirements.dischargePort.toLowerCase()) ||
          requirements.dischargePort.toLowerCase().includes(offer.dischargePort.toLowerCase())

        if (loadPortMatch && dischargePortMatch) {
          matchScore += 20
        } else if (loadPortMatch || dischargePortMatch) {
          matchScore += 10
        }
      }

      // Match laycan (15%)
      if (requirements.laycanStart && requirements.laycanEnd && requirements.month) {
        totalFactors += 15

        // Convert requirements to dates
        const currentYear = new Date().getFullYear()
        const monthIndex = new Date(Date.parse(`${requirements.month} 1, ${currentYear}`)).getMonth()
        const reqLaycanStart = new Date(currentYear, monthIndex, requirements.laycanStart)
        const reqLaycanEnd = new Date(currentYear, monthIndex, requirements.laycanEnd)

        // Check if offer laycan overlaps with required laycan
        const laycanOverlap = !(offer.laycanEnd < reqLaycanStart || offer.laycanStart > reqLaycanEnd)

        if (laycanOverlap) {
          matchScore += 15
        } else {
          // Check if it's close (within 5 days)
          const daysBefore = (reqLaycanStart.getTime() - offer.laycanEnd.getTime()) / (1000 * 3600 * 24)
          const daysAfter = (offer.laycanStart.getTime() - reqLaycanEnd.getTime()) / (1000 * 3600 * 24)

          if ((daysBefore > 0 && daysBefore <= 5) || (daysAfter > 0 && daysAfter <= 5)) {
            matchScore += 7
          }
        }
      }

      // Match rate (20%)
      if (requirements.rateMin && requirements.rateMax && offer.freightRate) {
        totalFactors += 20
        if (offer.freightRate >= requirements.rateMin && offer.freightRate <= requirements.rateMax) {
          matchScore += 20
        } else if (offer.freightRate >= requirements.rateMin * 0.9 && offer.freightRate <= requirements.rateMax * 1.1) {
          // Close match
          matchScore += 10
        }
      }

      // Normalize score if we have requirements
      const normalizedScore = totalFactors > 0 ? (matchScore / totalFactors) * 100 : 0

      return {
        offer,
        matchScore: normalizedScore,
      }
    })

    // Sort by match score (descending)
    return matchedOffers.sort((a, b) => b.matchScore - a.matchScore)
  }

  // Fix the handleProcessEmail function to properly handle errors and state
  const handleProcessEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "No content to process",
        description: "Please enter client email content or use the sample.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setMatchedOffers([])
    setSelectedOffers(new Set())

    try {
      // Simulate AI processing with visual feedback
      await simulateProcessing()

      // Extract requirements from email
      const extractedRequirements = extractRequirements(emailContent)
      setRequirements(extractedRequirements)

      // Match offers against requirements
      const matches = matchOffers(extractedRequirements, offers)

      // Filter to show only reasonable matches (>30%)
      const goodMatches = matches.filter((match) => match.matchScore > 30)
      setMatchedOffers(goodMatches)

      if (goodMatches.length === 0) {
        toast({
          title: "No matching offers found",
          description: "Try adjusting the client requirements or adding more offers.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Matching complete",
          description: `Found ${goodMatches.length} matching offers for this client.`,
        })
        setEmailMatchView("results")
      }
    } catch (error) {
      console.error("Error processing email:", error)
      toast({
        title: "Error processing email",
        description: "An error occurred while analyzing the client email.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStatus("")
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 dark:text-green-400"
    if (score >= 60) return "text-amber-700 dark:text-amber-400"
    if (score >= 40) return "text-blue-700 dark:text-blue-400"
    return "text-gray-700 dark:text-gray-400"
  }

  const toggleOfferSelection = (offerId: string) => {
    const newSelected = new Set(selectedOffers)
    if (newSelected.has(offerId)) {
      newSelected.delete(offerId)
    } else {
      newSelected.add(offerId)
    }
    setSelectedOffers(newSelected)
  }

  const handleCopyOffer = (offer: Offer) => {
    // Format the offer details for copying in a broker-friendly format
    const offerText = `
VESSEL: ${offer.vesselName || offer.vesselType} ${offer.vesselSize}K DWT
ROUTE: ${offer.loadPort} - ${offer.dischargePort}
LAYCAN: ${new Date(offer.laycanStart).toLocaleDateString("en-US", { day: "2-digit", month: "short" })} - ${new Date(offer.laycanEnd).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
RATE: USD ${offer.freightRate}${offer.rateUnit}
`

    navigator.clipboard.writeText(offerText).then(() => {
      toast({
        title: "Offer copied",
        description: "The vessel details have been copied to your clipboard.",
      })
    })
  }

  const handleSendToClient = (offer: Offer) => {
    toast({
      title: "Offer sent",
      description: `Offer for ${offer.vesselType} ${offer.vesselSize}k DWT has been sent.`,
    })
  }

  const selectOffer = (offer: Offer) => {
    onSelectOffer(offer)
  }

  const handleSendOffer = (offer: Offer) => {
    toast({
      title: "Offer sent",
      description: `Offer for ${offer.vesselType} ${offer.vesselSize}k DWT has been sent.`,
    })
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header - fixed height */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Client Email Matcher</h2>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {emailMatchView === "input" ? (
          <div className="p-6 space-y-6">
            {/* Input view content */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Paste Client Email</h3>
              <Button variant="outline" size="sm" onClick={handleUseSample}>
                Use Sample Email
              </Button>
            </div>

            <div className="relative">
              <Textarea
                placeholder="Paste client email here..."
                className="min-h-[300px] font-mono text-sm resize-none border-dashed focus-visible:border-primary focus-visible:ring-primary/20"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{processingStatus}</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Results view content - scrollable */}

            {requirements && (
              <Card className="bg-primary/5 border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Extracted Requirements
                  </CardTitle>
                  <CardDescription>Requirements extracted from the client email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {requirements.vesselType && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Vessel Type:</span>
                        <span className="font-medium">{requirements.vesselType}</span>
                      </div>
                    )}
                    {requirements.vesselSizeMin && requirements.vesselSizeMax && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Size Range:</span>
                        <span className="font-medium">
                          {requirements.vesselSizeMin}k-{requirements.vesselSizeMax}k DWT
                        </span>
                      </div>
                    )}
                    {requirements.loadPort && requirements.dischargePort && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium">
                          {requirements.loadPort} to {requirements.dischargePort}
                        </span>
                      </div>
                    )}
                    {requirements.laycanStart && requirements.laycanEnd && requirements.month && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Laycan:</span>
                        <span className="font-medium">
                          {requirements.month} {requirements.laycanStart}-{requirements.laycanEnd}
                        </span>
                      </div>
                    )}
                    {requirements.rateMin && requirements.rateMax && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">
                          ${requirements.rateMin}k-${requirements.rateMax}k/day
                        </span>
                      </div>
                    )}
                    {requirements.cargoType && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Cargo:</span>
                        <span className="font-medium">{requirements.cargoType}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Matching Vessels ({matchedOffers.length})</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search matches..." className="pl-9 w-[200px]" />
                  </div>

                  {selectedOffers.size > 0 && (
                    <Badge variant="outline" className="bg-primary/10">
                      {selectedOffers.size} selected
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {matchedOffers.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <VesselTable
                    vessels={matchedOffers.map(({ offer }) => offer)}
                    selectedVessels={selectedOffers}
                    onSelectVessel={(id, selected) => {
                      if (selected) {
                        setSelectedOffers((prev) => new Set(prev).add(id))
                      } else {
                        const newSet = new Set(selectedOffers)
                        newSet.delete(id)
                        setSelectedOffers(newSet)
                      }
                    }}
                    onSelectAll={(selected) => {
                      if (selected) {
                        setSelectedOffers(new Set(matchedOffers.map(({ offer }) => offer.id)))
                      } else {
                        setSelectedOffers(new Set())
                      }
                    }}
                    onView={onSelectOffer}
                    onCopy={handleCopyOffer}
                    onSend={handleSendToClient}
                    onToggleFavorite={() => {}}
                    showRank={true}
                    showMatchScore={true}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No matching vessels found
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => setEmailMatchView("input")}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Different Email
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - fixed height */}
      <div className="p-4 border-t bg-muted/10 flex-shrink-0">
        {emailMatchView === "input" ? (
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleProcessEmail}
              disabled={isProcessing || !emailContent.trim()}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ship className="mr-2 h-5 w-5" />
                  Find Matching Vessels
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEmailMatchView("input")}>
              Match Another Email
            </Button>
            {selectedOffers.size > 0 && (
              <Button variant="outline" onClick={() => setSelectedOffers(new Set())}>
                Clear Selection
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
