"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  Mail,
  Calendar,
  Ship,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
  Clock,
  Briefcase,
  Clipboard,
  User,
  Building,
  Phone,
  DollarSign,
  Edit,
  MoreHorizontal,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import type { Client, Offer } from "@/lib/types"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { OfferDetails } from "@/components/offer-details"
import { formatDate } from "@/lib/format-utils"
import { LoadingState } from "@/components/ui/loading-state"

interface ClientDetailsProps {
  client: Client
  matchedOffers: Record<string, Offer[]>
  onRefreshMatches: () => void
  isRefreshing: boolean
  onBack?: () => void
}

export function ClientDetails({ client, matchedOffers, onRefreshMatches, isRefreshing, onBack }: ClientDetailsProps) {
  const [activeTab, setActiveTab] = useState("inquiries")
  const [favoriteOffers, setFavoriteOffers] = useState<Set<string>>(new Set())
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isOfferDetailsOpen, setIsOfferDetailsOpen] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const [expandedStates, setExpandedStates] = useState({
    emails: {} as Record<string, boolean>,
    requests: {} as Record<string, boolean>,
    emailContent: {} as Record<string, boolean>,
  })

  const toggleExpansion = (type: "emails" | "requests" | "emailContent", id: string) => {
    setExpandedStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], [id]: !prev[type][id] },
    }))
  }

  const toggleEmailExpansion = (id: string) => toggleExpansion("emails", id)
  const toggleRequestExpansion = (id: string) => toggleExpansion("requests", id)
  const toggleEmailContent = (id: string) => toggleExpansion("emailContent", id)

  useEffect(() => {
    // Initialize expandedEmailContent state for all requests
    if (client.requests && client.requests.length > 0) {
      const initialState = client.requests.reduce((acc, request) => {
        acc[request.id] = false
        return acc
      }, {})
      setExpandedStates((prev) => ({
        ...prev,
        emailContent: initialState,
      }))
    }
  }, [client.requests])

  const toggleFavorite = (offerId: string) => {
    setFavoriteOffers((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(offerId)) {
        newFavorites.delete(offerId)
        toast({
          title: "Removed from favorites",
          description: "Vessel has been removed from favorites",
        })
      } else {
        newFavorites.add(offerId)
        toast({
          title: "Added to favorites",
          description: "Vessel has been added to favorites",
        })
      }
      return newFavorites
    })
  }

  const handleSendOffer = (clientEmail: string, offer: Offer) => {
    toast({
      title: "Offer sent",
      description: `Offer for ${offer.vesselType} ${offer.vesselSize}k DWT sent to ${clientEmail}`,
    })
  }

  const handleCopyOffer = (offer: Offer) => {
    // Format the offer details for copying in a broker-friendly format
    const offerText = `
VESSEL: ${offer.vesselName || offer.vesselType} ${offer.vesselSize}K DWT
ROUTE: ${offer.loadPort} - ${offer.dischargePort}
LAYCAN: ${format(new Date(offer.laycanStart), "dd MMM")} - ${format(new Date(offer.laycanEnd), "dd MMM")}
RATE: USD ${offer.freightRate}${offer.rateUnit}
`

    navigator.clipboard.writeText(offerText).then(() => {
      toast({
        title: "Offer copied",
        description: "The vessel details have been copied to your clipboard.",
      })
    })
  }

  const handleViewOfferDetails = (offer: Offer) => {
    setSelectedOffer(offer)
    setIsOfferDetailsOpen(true)
  }

  const calculateMatch = (offerValue: any, requestValue: any) => {
    if (!requestValue) return { matches: true, exact: true }
    if (!offerValue) return { matches: false, exact: false }

    if (typeof offerValue === "string" && typeof requestValue === "string") {
      const exact = offerValue.toLowerCase() === requestValue.toLowerCase()
      const includes =
        offerValue.toLowerCase().includes(requestValue.toLowerCase()) ||
        requestValue.toLowerCase().includes(offerValue.toLowerCase())
      return { matches: exact || includes, exact }
    }

    if (typeof offerValue === "number" && typeof requestValue === "number") {
      const exact = offerValue === requestValue
      const within10Percent = offerValue >= requestValue * 0.9 && offerValue <= requestValue * 1.1
      return { matches: within10Percent, exact }
    }

    return { matches: false, exact: false }
  }

  // Calculate days until laycan start
  const getDaysUntilLaycan = (start: Date) => {
    const today = new Date()
    const startDate = new Date(start)
    const diffTime = startDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get laycan urgency indicator
  const getLaycanUrgency = (start: Date) => {
    const daysUntil = getDaysUntilLaycan(start)
    if (daysUntil < 0) return "text-gray-500 dark:text-gray-400"
    if (daysUntil <= 7) return "text-red-600 dark:text-red-400"
    if (daysUntil <= 14) return "text-amber-600 dark:text-amber-400"
    return "text-green-600 dark:text-green-400"
  }

  // Render action buttons with tooltips
  const renderActionButtons = (offer: Offer) => {
    return (
      <div className="mt-4 flex justify-end gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 relative group"
                onClick={() => handleCopyOffer(offer)}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-50">
                  Copy
                </div>
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 relative group"
                onClick={() => handleSendOffer(client.email, offer)}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-50">
                  Send
                </div>
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 relative group"
                onClick={() => handleViewOfferDetails(offer)}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-50">
                  View
                </div>
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isMobile && onBack && (
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      )}

      <Card className="border shadow-sm">
        <div className="border-b">
          <div className="flex">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-semibold">{client.name}</CardTitle>
                  <Badge variant={client.status === "active" ? "default" : "secondary"} className="capitalize">
                    {client.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                  <Building className="h-3.5 w-3.5" />
                  {client.company}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Matches
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
        <CardContent className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.lastContact && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Last contact: {format(new Date(client.lastContact), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="flex">
            <TabsList className="bg-transparent h-10 p-0">
              <TabsTrigger
                value="inquiries"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-10 px-4 text-sm"
              >
                Inquiries
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-10 px-4"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="inquiries" className="mt-6 space-y-6">
          {client.requests && client.requests.length > 0 ? (
            client.requests.map((request) => {
              const hasMatches = matchedOffers[request.id] && matchedOffers[request.id].length > 0
              const isExpanded = expandedStates.requests[request.id] || false

              return (
                <Card key={request.id} className="overflow-hidden border shadow-sm">
                  <div className="py-3 px-4 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          {request.emailSubject}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          {formatDate(request.date)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEmailExpansion(request.id)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        {expandedStates.emails[request.id] ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Hide Email
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Show Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedStates.emails[request.id] && (
                    <CardContent className="pb-0 pt-0 px-4">
                      <div className="bg-muted/10 p-4 rounded-md text-sm font-mono normal-font whitespace-pre-wrap border border-muted">
                        <div>
                          {/* Email content with conditional height */}
                          <div
                            className={`whitespace-pre-wrap ${
                              expandedStates.emailContent[request.id] ? "" : "relative max-h-32 overflow-hidden"
                            }`}
                          >
                            {request.emailContent}

                            {/* Gradient overlay when collapsed */}
                            {!expandedStates.emailContent[request.id] && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
                            )}
                          </div>

                          {/* View More/Less button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full flex items-center justify-center gap-1 border-dashed"
                            onClick={() => toggleEmailContent(request.id)}
                          >
                            {expandedStates.emailContent[request.id] ? "View Less" : "View Full Email"}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedStates.emailContent[request.id] ? "rotate-180" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}

                  <CardContent className="p-4">
                    <div className="space-y-6">
                      {/* Client Requirements - Dashboard Style */}
                      <div>
                        <h3 className="text-base font-medium mb-4 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Requirements
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          {request.extractedData.vesselType && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md">
                              <Ship className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium truncate">{request.extractedData.vesselType}</span>
                                  {request.extractedData.vesselSize && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-sm ml-1.5">
                                      {(request.extractedData.vesselSize / 1000).toFixed(0)}K DWT
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {(request.extractedData.loadPort || request.extractedData.dischargePort) && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex-1 flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md">
                                {request.extractedData.loadPort && (
                                  <span className="font-medium">{request.extractedData.loadPort}</span>
                                )}
                                {request.extractedData.loadPort && request.extractedData.dischargePort && (
                                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground mx-1.5" />
                                )}
                                {request.extractedData.dischargePort && (
                                  <span className="font-medium">{request.extractedData.dischargePort}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {request.extractedData.laycanStart && (
                            <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md">
                              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate">
                                {format(new Date(request.extractedData.laycanStart), "MMM d")}
                                {request.extractedData.laycanEnd &&
                                  ` - ${format(new Date(request.extractedData.laycanEnd), "MMM d")}`}
                              </span>
                            </div>
                          )}

                          {request.extractedData.targetRate && (
                            <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md">
                              <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <div className="truncate">
                                <span className="font-medium">
                                  ${request.extractedData.targetRate}
                                  {request.extractedData.rateUnit || "/day"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button variant="outline" size="sm" onClick={onRefreshMatches} disabled={isRefreshing}>
                            {isRefreshing ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Finding Matches...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Find Matching Vessels
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Matching Offers - Dashboard Style */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium flex items-center gap-1.5">
                            <Ship className="h-4 w-4 text-primary" />
                            Matching Vessels
                          </h3>

                          <Badge variant={hasMatches ? "default" : "outline"} className="text-xs">
                            {hasMatches ? matchedOffers[request.id].length : "No"} matches
                          </Badge>
                        </div>

                        {isRefreshing ? (
                          <LoadingState message="Finding matching vessels..." />
                        ) : !isExpanded && hasMatches && matchedOffers[request.id].length > 0 ? (
                          matchedOffers[request.id].slice(0, 4).map((offer) => (
                            <div key={offer.id} className="border rounded-md overflow-hidden mb-4">
                              <div className="p-4">
                                <div className="flex items-center gap-2">
                                  <Ship className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{offer.vesselName || offer.vesselType}</span>
                                  <span className="text-sm px-1.5 py-0.5 rounded-sm ml-1.5">
                                    {(offer.vesselSize / 1000).toFixed(0)}K DWT
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 flex items-center gap-1">
                                    <span className="font-medium">{offer.loadPort}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium">{offer.dischargePort}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="truncate">
                                    {format(new Date(offer.laycanStart), "MMM d")}
                                    {offer.laycanEnd && ` - ${format(new Date(offer.laycanEnd), "MMM d")}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">
                                    ${offer.freightRate}
                                    {offer.rateUnit || "/day"}
                                  </span>
                                </div>
                              </div>
                              {renderActionButtons(offer)}
                            </div>
                          ))
                        ) : (
                          <LoadingState message="No matching vessels found" />
                        )}

                        {isExpanded && hasMatches && matchedOffers[request.id].length > 0 && (
                          <div className="mt-4 border rounded-md overflow-hidden">
                            {matchedOffers[request.id].map((offer) => (
                              <div key={offer.id} className="p-4">
                                <div className="flex items-center gap-2">
                                  <Ship className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{offer.vesselName || offer.vesselType}</span>
                                  <span className="text-sm px-1.5 py-0.5 rounded-sm ml-1.5">
                                    {(offer.vesselSize / 1000).toFixed(0)}K DWT
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 flex items-center gap-1">
                                    <span className="font-medium">{offer.loadPort}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium">{offer.dischargePort}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="truncate">
                                    {format(new Date(offer.laycanStart), "MMM d")}
                                    {offer.laycanEnd && ` - ${format(new Date(offer.laycanEnd), "MMM d")}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">
                                    ${offer.freightRate}
                                    {offer.rateUnit || "/day"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isExpanded && hasMatches && matchedOffers[request.id].length > 4 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs mt-4"
                            onClick={() => toggleRequestExpansion(request.id)}
                          >
                            Show {matchedOffers[request.id].length - 4} more vessels
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Mail className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No inquiries found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">History will be available soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Vessel Details Dialog */}
      <Dialog open={isOfferDetailsOpen} onOpenChange={setIsOfferDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOffer && (
            <OfferDetails
              offer={selectedOffer}
              onBack={() => setIsOfferDetailsOpen(false)}
              onCopy={() => handleCopyOffer(selectedOffer)}
              onSend={() => handleSendOffer(client.email, selectedOffer)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
