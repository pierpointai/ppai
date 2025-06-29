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
  Edit,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react"
import { useOfferStore } from "@/lib/offer-store"
import type { Offer } from "@/lib/types"
import { VesselCard } from "@/components/vessel-card"
import { useCompareStore } from "@/lib/compare-store"
import { useFavoriteStore } from "@/lib/favorite-store"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { extractVesselRequirements } from "@/lib/client-utils"
import { RequirementEditor } from "@/components/requirement-editor"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedClientEmailMatcherProps {
  onSelectOffer: (offer: Offer) => void
  onClose: () => void
}

export function EnhancedClientEmailMatcher({ onSelectOffer, onClose }: EnhancedClientEmailMatcherProps) {
  const { offers } = useOfferStore()
  const [emailContent, setEmailContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const [matchedOffers, setMatchedOffers] = useState<Array<{ offer: Offer; matchScore: number }>>([])
  const [requirements, setRequirements] = useState<Record<string, any> | null>(null)
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number> | null>(null)
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set())
  const [emailMatchView, setEmailMatchView] = useState<"input" | "results" | "edit-requirements">("input")
  const { toast } = useToast()
  const { compareOffers, toggleCompareOffer } = useCompareStore()
  const { toggleFavorite } = useFavoriteStore()
  const [matchingWeights, setMatchingWeights] = useState({
    vesselType: 25,
    vesselSize: 20,
    route: 20,
    laycan: 15,
    rate: 20,
    age: 10,
    gear: 10,
    iceClass: 5,
    flag: 5,
    cargoType: 10,
  })

  // Sample client email for demo with advanced requirements
  const sampleEmail = `From: client@example.com
Subject: Vessel Requirements for Grain Cargo

Hi,

We are looking for a Supramax vessel, around 55-60k DWT for a grain cargo.
Route: US Gulf to China
Laycan: June 15-25
Budget: Around $18-20k/day

Additional requirements:
- Vessel age: maximum 15 years old
- Must be geared with grabs suitable for grain
- Cargo quantity: approximately 54,000 MT of wheat
- Prefer vessels with Panama flag
- No ice class required

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

    setProcessingProgress(15)
    setProcessingStatus("Extracting vessel requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(30)
    setProcessingStatus("Identifying route preferences...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(45)
    setProcessingStatus("Parsing date requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(60)
    setProcessingStatus("Analyzing budget constraints...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(75)
    setProcessingStatus("Extracting advanced requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(90)
    setProcessingStatus("Finding matching offers...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(100)
    setProcessingStatus("Ranking matches...")
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

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
      const extractedData = extractVesselRequirements(emailContent)
      if (!extractedData) {
        throw new Error("Failed to extract requirements from email")
      }

      setRequirements(extractedData)
      setConfidenceScores(extractedData.confidenceScores || {})

      // Match offers against requirements
      const matches = matchOffers(extractedData, offers)

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

  const matchOffers = (requirements: Record<string, any>, availableOffers: Offer[]) => {
    // Calculate match score for each offer
    const matchedOffers = availableOffers.map((offer) => {
      let matchScore = 0
      let totalFactors = 0

      // Match vessel type (weight: matchingWeights.vesselType)
      if (requirements.vesselType && offer.vesselType) {
        totalFactors += matchingWeights.vesselType
        if (offer.vesselType.toLowerCase().includes(requirements.vesselType.toLowerCase())) {
          matchScore += matchingWeights.vesselType
        } else if (requirements.vesselType.toLowerCase().includes(offer.vesselType.toLowerCase())) {
          matchScore += matchingWeights.vesselType * 0.8
        }
      }

      // Match vessel size (weight: matchingWeights.vesselSize)
      if (requirements.vesselSize && offer.vesselSize) {
        totalFactors += matchingWeights.vesselSize
        const reqSize = requirements.vesselSize
        const offerSize = offer.vesselSize * 1000

        if (offerSize >= reqSize * 0.95 && offerSize <= reqSize * 1.05) {
          // Within 5%
          matchScore += matchingWeights.vesselSize
        } else if (offerSize >= reqSize * 0.9 && offerSize <= reqSize * 1.1) {
          // Within 10%
          matchScore += matchingWeights.vesselSize * 0.8
        } else if (offerSize >= reqSize * 0.8 && offerSize <= reqSize * 1.2) {
          // Within 20%
          matchScore += matchingWeights.vesselSize * 0.6
        }
      }

      // Match route (weight: matchingWeights.route)
      if (requirements.loadPort && requirements.dischargePort) {
        totalFactors += matchingWeights.route
        const loadPortMatch =
          offer.loadPort.toLowerCase().includes(requirements.loadPort.toLowerCase()) ||
          requirements.loadPort.toLowerCase().includes(offer.loadPort.toLowerCase())
        const dischargePortMatch =
          offer.dischargePort.toLowerCase().includes(requirements.dischargePort.toLowerCase()) ||
          requirements.dischargePort.toLowerCase().includes(offer.dischargePort.toLowerCase())

        if (loadPortMatch && dischargePortMatch) {
          matchScore += matchingWeights.route
        } else if (loadPortMatch || dischargePortMatch) {
          matchScore += matchingWeights.route * 0.5
        }
      }

      // Match laycan (weight: matchingWeights.laycan)
      if (requirements.laycanStart && requirements.laycanEnd) {
        totalFactors += matchingWeights.laycan

        // Check if offer laycan overlaps with required laycan
        const laycanOverlap = !(
          offer.laycanEnd < requirements.laycanStart || offer.laycanStart > requirements.laycanEnd
        )

        if (laycanOverlap) {
          matchScore += matchingWeights.laycan
        } else {
          // Check if it's close (within 5 days)
          const daysBefore = (requirements.laycanStart.getTime() - offer.laycanEnd.getTime()) / (1000 * 3600 * 24)
          const daysAfter = (offer.laycanStart.getTime() - requirements.laycanEnd.getTime()) / (1000 * 3600 * 24)

          if ((daysBefore > 0 && daysBefore <= 5) || (daysAfter > 0 && daysAfter <= 5)) {
            matchScore += matchingWeights.laycan * 0.5
          }
        }
      }

      // Match rate (weight: matchingWeights.rate)
      if (requirements.targetRate && offer.freightRate) {
        totalFactors += matchingWeights.rate
        const targetRate = requirements.targetRate

        if (offer.freightRate >= targetRate * 0.95 && offer.freightRate <= targetRate * 1.05) {
          // Within 5%
          matchScore += matchingWeights.rate
        } else if (offer.freightRate >= targetRate * 0.9 && offer.freightRate <= targetRate * 1.1) {
          // Within 10%
          matchScore += matchingWeights.rate * 0.8
        } else if (offer.freightRate >= targetRate * 0.8 && offer.freightRate <= targetRate * 1.2) {
          // Within 20%
          matchScore += matchingWeights.rate * 0.6
        }
      }

      // Match vessel age (weight: matchingWeights.age)
      if (requirements.maxAge && offer.vesselAge) {
        totalFactors += matchingWeights.age
        if (offer.vesselAge <= requirements.maxAge) {
          matchScore += matchingWeights.age
        } else if (offer.vesselAge <= requirements.maxAge * 1.2) {
          // Allow 20% older
          matchScore += matchingWeights.age * 0.5
        }
      }

      // Match gear requirements (weight: matchingWeights.gear)
      if (requirements.gearRequirement && offer.vesselType) {
        totalFactors += matchingWeights.gear
        const isGeared =
          offer.vesselType.toLowerCase().includes("geared") ||
          (offer.tags && offer.tags.some((tag) => tag.toLowerCase() === "geared"))

        if (
          (requirements.gearRequirement === "geared" && isGeared) ||
          (requirements.gearRequirement === "gearless" && !isGeared)
        ) {
          matchScore += matchingWeights.gear
        }
      }

      // Match ice class requirements (weight: matchingWeights.iceClass)
      if (requirements.iceClassRequirement && offer.tags) {
        totalFactors += matchingWeights.iceClass
        const hasIceClass = offer.tags.some((tag) => tag.toLowerCase().includes("ice class"))

        if (
          (requirements.iceClassRequirement !== "required" && requirements.iceClassRequirement !== "") ||
          hasIceClass
        ) {
          matchScore += matchingWeights.iceClass
        }
      }

      // Match flag preference (weight: matchingWeights.flag)
      if (requirements.flagPreference && offer.vesselFlag) {
        totalFactors += matchingWeights.flag
        if (offer.vesselFlag.toLowerCase() === requirements.flagPreference.toLowerCase()) {
          matchScore += matchingWeights.flag
        }
      }

      // Match cargo type (weight: matchingWeights.cargoType)
      if (requirements.cargoType && offer.cargoType) {
        totalFactors += matchingWeights.cargoType
        if (
          offer.cargoType.toLowerCase().includes(requirements.cargoType.toLowerCase()) ||
          requirements.cargoType.toLowerCase().includes(offer.cargoType.toLowerCase())
        ) {
          matchScore += matchingWeights.cargoType
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

  const handleUpdateRequirements = (updatedRequirements: any) => {
    setRequirements(updatedRequirements)

    // Re-match offers with updated requirements
    const matches = matchOffers(updatedRequirements, offers)
    const goodMatches = matches.filter((match) => match.matchScore > 30)
    setMatchedOffers(goodMatches)

    toast({
      title: "Requirements updated",
      description: `Found ${goodMatches.length} matching offers with updated requirements.`,
    })
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

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 dark:text-green-400"
    if (score >= 60) return "text-amber-700 dark:text-amber-400"
    if (score >= 40) return "text-blue-700 dark:text-blue-400"
    return "text-gray-700 dark:text-gray-400"
  }

  const getConfidenceIndicator = (field: string) => {
    if (!confidenceScores || !confidenceScores[field]) return null

    const score = confidenceScores[field]
    let color = "text-red-500"
    let icon = <AlertCircle className="h-4 w-4" />

    if (score >= 0.8) {
      color = "text-green-500"
      icon = <CheckCircle2 className="h-4 w-4" />
    } else if (score >= 0.6) {
      color = "text-amber-500"
      icon = <AlertCircle className="h-4 w-4" />
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={color}>{icon}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Confidence: {Math.round(score * 100)}%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header - fixed height */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Advanced Client Email Matcher</h2>
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
        ) : emailMatchView === "edit-requirements" ? (
          <div className="p-6">
            <RequirementEditor
              requirements={requirements || {}}
              confidenceScores={confidenceScores || {}}
              onUpdate={handleUpdateRequirements}
              onSave={() => setEmailMatchView("results")}
              onCancel={() => setEmailMatchView("results")}
            />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Results view content - scrollable */}

            {requirements && (
              <Card className="bg-primary/5 border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Extracted Requirements
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setEmailMatchView("edit-requirements")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Requirements
                    </Button>
                  </div>
                  <CardDescription>Requirements extracted from the client email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {requirements.vesselType && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Vessel Type:</span>
                        <span className="font-medium">{requirements.vesselType}</span>
                        {getConfidenceIndicator("vesselType")}
                      </div>
                    )}
                    {requirements.vesselSize && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{requirements.vesselSize.toLocaleString()} DWT</span>
                        {getConfidenceIndicator("vesselSize")}
                      </div>
                    )}
                    {requirements.loadPort && requirements.dischargePort && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium">
                          {requirements.loadPort} to {requirements.dischargePort}
                        </span>
                        {getConfidenceIndicator("loadPort")}
                      </div>
                    )}
                    {requirements.laycanStart && requirements.laycanEnd && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Laycan:</span>
                        <span className="font-medium">
                          {new Date(requirements.laycanStart).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {new Date(requirements.laycanEnd).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        {getConfidenceIndicator("laycan")}
                      </div>
                    )}
                    {requirements.targetRate && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">${requirements.targetRate}k/day</span>
                        {getConfidenceIndicator("targetRate")}
                      </div>
                    )}
                    {requirements.maxAge && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Max Age:</span>
                        <span className="font-medium">{requirements.maxAge} years</span>
                        {getConfidenceIndicator("maxAge")}
                      </div>
                    )}
                    {requirements.gearRequirement && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Gear:</span>
                        <span className="font-medium capitalize">{requirements.gearRequirement}</span>
                        {getConfidenceIndicator("gearRequirement")}
                      </div>
                    )}
                    {requirements.cargoType && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Cargo:</span>
                        <span className="font-medium">{requirements.cargoType}</span>
                        {getConfidenceIndicator("cargoType")}
                      </div>
                    )}
                    {requirements.cargoQuantity && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{requirements.cargoQuantity.toLocaleString()} MT</span>
                        {getConfidenceIndicator("cargoQuantity")}
                      </div>
                    )}
                    {requirements.flagPreference && (
                      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Flag:</span>
                        <span className="font-medium">{requirements.flagPreference}</span>
                        {getConfidenceIndicator("flagPreference")}
                      </div>
                    )}
                  </div>

                  {requirements.specialClauses && (
                    <div className="mt-4 bg-muted/30 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Special Clauses:</span>
                        {getConfidenceIndicator("specialClauses")}
                      </div>
                      <p className="text-sm">{requirements.specialClauses}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Matching Vessels ({matchedOffers.length})</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEmailMatchView("edit-requirements")}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Adjust Matching
                  </Button>

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
                <div className="space-y-4">
                  {matchedOffers.map(({ offer, matchScore }) => (
                    <div key={offer.id} className="border rounded-md p-4">
                      <VesselCard
                        offer={offer}
                        isComparing={compareOffers.some((o) => o.id === offer.id)}
                        isFavorite={offer.category === "Favorites"}
                        isHighPriority={matchScore > 80}
                        onCopy={() => handleCopyOffer(offer)}
                        onSend={() => handleSendToClient(offer)}
                        onView={() => selectOffer(offer)}
                        onToggleFavorite={toggleFavorite}
                        onToggleCompare={toggleCompareOffer}
                        compact={true}
                      />

                      {/* Match score details */}
                      <div className="mt-2 pl-4 border-l-4 border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Match Score:</span>
                          <span className={`text-sm font-bold ${getMatchScoreColor(matchScore)}`}>
                            {Math.round(matchScore)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {requirements?.vesselType && (
                            <div className="flex items-center gap-1">
                              <span>Type:</span>
                              <span
                                className={
                                  offer.vesselType.toLowerCase().includes(requirements.vesselType.toLowerCase())
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }
                              >
                                {offer.vesselType}
                              </span>
                            </div>
                          )}
                          {requirements?.vesselSize && (
                            <div className="flex items-center gap-1">
                              <span>Size:</span>
                              <span
                                className={
                                  Math.abs(offer.vesselSize * 1000 - requirements.vesselSize) /
                                    requirements.vesselSize <=
                                  0.05
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }
                              >
                                {offer.vesselSize}k DWT
                              </span>
                            </div>
                          )}
                          {requirements?.maxAge && offer.vesselAge && (
                            <div className="flex items-center gap-1">
                              <span>Age:</span>
                              <span
                                className={offer.vesselAge <= requirements.maxAge ? "text-green-600" : "text-red-600"}
                              >
                                {offer.vesselAge} years
                              </span>
                            </div>
                          )}
                          {requirements?.gearRequirement && (
                            <div className="flex items-center gap-1">
                              <span>Gear:</span>
                              <span
                                className={
                                  requirements.gearRequirement === "geared" &&
                                  (offer.vesselType.toLowerCase().includes("geared") ||
                                    (offer.tags && offer.tags.some((tag) => tag.toLowerCase() === "geared")))
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }
                              >
                                {offer.vesselType.toLowerCase().includes("geared") ||
                                (offer.tags && offer.tags.some((tag) => tag.toLowerCase() === "geared"))
                                  ? "Geared"
                                  : "Gearless"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
        ) : emailMatchView === "edit-requirements" ? (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEmailMatchView("results")}>
              Cancel
            </Button>
            <Button onClick={() => setEmailMatchView("results")}>Save Requirements</Button>
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
