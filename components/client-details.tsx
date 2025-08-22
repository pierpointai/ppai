"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Mail, Calendar, Ship, User, Building, Phone } from "lucide-react"
import type { Client, Offer } from "@/lib/types"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { VesselTable } from "@/components/vessel-table"

interface ClientDetailsProps {
  client: Client
  matchedOffers: Record<string, Offer[]>
  onRefreshMatches: () => void
  isRefreshing: boolean
  onBack?: () => void
}

export function ClientDetails({ client, matchedOffers, onRefreshMatches, isRefreshing, onBack }: ClientDetailsProps) {
  const [activeTab, setActiveTab] = useState("inquiries")
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleSendOffer = (clientEmail: string, offer: Offer) => {
    toast({
      title: "Offer sent",
      description: `Offer for ${offer.vesselType} ${offer.vesselSize}k DWT sent to ${clientEmail}`,
    })
  }

  const handleCopyOffer = (offer: Offer) => {
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

  return (
    <div className="space-y-6">
      {isMobile && onBack && (
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4 bg-transparent">
          Back to Clients
        </Button>
      )}

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5" />
                  {client.company}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
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
          <TabsList className="bg-transparent h-10 p-0">
            <TabsTrigger
              value="inquiries"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4 text-sm"
            >
              Inquiries
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4"
            >
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inquiries" className="mt-6 space-y-6">
          {client.requests && client.requests.length > 0 ? (
            client.requests.map((request) => {
              const hasMatches = matchedOffers[request.id] && matchedOffers[request.id].length > 0

              return (
                <Card key={request.id} className="overflow-hidden border shadow-sm">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {request.emailSubject}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium mb-4 flex items-center gap-1.5">
                          <Ship className="h-4 w-4 text-primary" />
                          Requirements
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          {request.extractedData.vesselType && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md">
                              <Ship className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="font-medium">{request.extractedData.vesselType}</span>
                              {request.extractedData.vesselSize && (
                                <span className="text-xs px-1.5 py-0.5 rounded-sm ml-1.5">
                                  {(request.extractedData.vesselSize / 1000).toFixed(0)}K DWT
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button variant="outline" size="sm" onClick={onRefreshMatches} disabled={isRefreshing}>
                            {isRefreshing ? "Finding Matches..." : "Find Matching Vessels"}
                          </Button>
                        </div>
                      </div>

                      <Separator />

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

                        {hasMatches ? (
                          <div className="border rounded-md overflow-hidden">
                            <VesselTable
                              vessels={matchedOffers[request.id]}
                              onView={() => {}}
                              onCopy={(id) => handleCopyOffer(matchedOffers[request.id].find((o) => o.id === id)!)}
                              onSend={(id) =>
                                handleSendOffer(client.email, matchedOffers[request.id].find((o) => o.id === id)!)
                              }
                              onToggleFavorite={() => {}}
                              showRank={true}
                              showMatchScore={true}
                            />
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed rounded-md">
                            <p className="text-sm text-muted-foreground">No matching vessels found</p>
                          </div>
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
    </div>
  )
}
