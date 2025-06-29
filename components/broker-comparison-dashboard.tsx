"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Ship,
  Calculator,
  Mail,
  MessageSquare,
  Download,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  FileText,
  Star,
  AlertTriangle,
  CheckCircle,
  Copy,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Offer } from "@/lib/types"
import {
  calculateTCE,
  calculateVoyageDetails,
  analyzeMarketPosition,
  generateFixtureRecap,
  generateCommercialOffer,
  generateWhatsAppMessage,
  COMMISSION_RATES,
} from "@/lib/broker-utils"

interface BrokerComparisonDashboardProps {
  vessels: Offer[]
  onRemoveVessel: (id: string) => void
}

export function BrokerComparisonDashboard({ vessels, onRemoveVessel }: BrokerComparisonDashboardProps) {
  const { toast } = useToast()
  const [selectedVessel, setSelectedVessel] = useState<Offer | null>(null)
  const [clientName, setClientName] = useState("")
  const [dischargePort, setDischargePort] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [cargoQuantity, setCargoQuantity] = useState("")
  const [marketRates, setMarketRates] = useState<number[]>([])
  const [notes, setNotes] = useState("")

  // Initialize with sample market rates
  useEffect(() => {
    const sampleRates = vessels.map((v) => v.freightRate || 0).filter((r) => r > 0)
    if (sampleRates.length > 0) {
      setMarketRates(sampleRates)
    }
  }, [vessels])

  // Select best vessel by default
  useEffect(() => {
    if (vessels.length > 0 && !selectedVessel) {
      const best = vessels.reduce((prev, current) =>
        (current.matchScore || 0) > (prev.matchScore || 0) ? current : prev,
      )
      setSelectedVessel(best)
    }
  }, [vessels, selectedVessel])

  if (!vessels || vessels.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Ship className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No vessels selected</h3>
          <p className="text-gray-500">Select vessels from the list above to start comparison</p>
        </CardContent>
      </Card>
    )
  }

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${type} copied successfully`,
    })
  }

  const handleSendEmail = (subject: string, body: string) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const handleDownloadRecap = (vessel: Offer) => {
    const voyage = calculateVoyageDetails(vessel.openPort || "", dischargePort)
    const recap = generateFixtureRecap(vessel, voyage, clientName)

    const blob = new Blob([recap], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${vessel.vesselName}_fixture_recap_${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Fixture recap downloaded",
      description: `${vessel.vesselName} fixture recap saved`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="discharge-port">Discharge Port</Label>
              <Input
                id="discharge-port"
                placeholder="Enter discharge port"
                value={dischargePort}
                onChange={(e) => setDischargePort(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="cargo-type">Cargo Type</Label>
              <Select value={cargoType} onValueChange={setCargoType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iron Ore">Iron Ore</SelectItem>
                  <SelectItem value="Coal">Coal</SelectItem>
                  <SelectItem value="Grain">Grain</SelectItem>
                  <SelectItem value="Bauxite">Bauxite</SelectItem>
                  <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="cargo-quantity">Cargo Quantity (MT)</Label>
              <Input
                id="cargo-quantity"
                placeholder="e.g. 170,000"
                value={cargoQuantity}
                onChange={(e) => setCargoQuantity(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vessel Comparison Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vessel Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Vessel</h3>
          {vessels.map((vessel) => (
            <Card
              key={vessel.id}
              className={`cursor-pointer transition-all ${
                selectedVessel?.id === vessel.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedVessel(vessel)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{vessel.vesselName}</h4>
                    <p className="text-sm text-gray-600">
                      {vessel.vesselType} • {vessel.vesselSize}k DWT
                    </p>
                  </div>
                  {vessel.matchScore && (
                    <Badge variant={vessel.matchScore >= 8 ? "default" : "secondary"}>{vessel.matchScore}/10</Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{vessel.openPort}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="font-medium">${vessel.freightRate?.toLocaleString()}/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{vessel.openDates}</span>
                  </div>
                </div>

                {/* Quick TCE Preview */}
                {dischargePort && (
                  <div className="mt-3 pt-3 border-t">
                    {(() => {
                      const voyage = calculateVoyageDetails(vessel.openPort || "", dischargePort)
                      const tce = calculateTCE(vessel, voyage)
                      return (
                        <div className="flex justify-between text-xs">
                          <span>TCE:</span>
                          <span className={`font-medium ${tce.tceDaily > 0 ? "text-green-600" : "text-red-600"}`}>
                            ${tce.tceDaily.toLocaleString()}/day
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2">
          {selectedVessel ? (
            <Tabs defaultValue="economics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="economics">Economics</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="communication">Comms</TabsTrigger>
                <TabsTrigger value="documentation">Docs</TabsTrigger>
              </TabsList>

              {/* Economics Tab */}
              <TabsContent value="economics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Voyage Economics - {selectedVessel.vesselName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dischargePort ? (
                      (() => {
                        const voyage = calculateVoyageDetails(selectedVessel.openPort || "", dischargePort)
                        const tce = calculateTCE(selectedVessel, voyage)
                        const commission =
                          ((selectedVessel.freightRate || 0) * voyage.totalDays * COMMISSION_RATES["Default"]) / 100

                        return (
                          <div className="space-y-6">
                            {/* Voyage Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{voyage.totalDays}</div>
                                <div className="text-sm text-blue-700">Total Days</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  ${tce.tceDaily.toLocaleString()}
                                </div>
                                <div className="text-sm text-green-700">TCE/Day</div>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{tce.profitMargin.toFixed(1)}%</div>
                                <div className="text-sm text-purple-700">Profit Margin</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">${commission.toLocaleString()}</div>
                                <div className="text-sm text-orange-700">Commission</div>
                              </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3">Revenue</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Daily Rate:</span>
                                    <span className="font-medium">
                                      ${selectedVessel.freightRate?.toLocaleString()}/day
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Voyage Days:</span>
                                    <span>{voyage.totalDays} days</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="font-medium">Gross Revenue:</span>
                                    <span className="font-bold text-green-600">
                                      ${tce.grossRevenue.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Costs</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Operating Costs:</span>
                                    <span>${tce.breakdown.opex.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Bunker Costs:</span>
                                    <span>${tce.breakdown.bunkers.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Port Costs:</span>
                                    <span>${tce.breakdown.ports.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="font-medium">Total Costs:</span>
                                    <span className="font-bold text-red-600">${tce.totalCosts.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Net Result */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Net Voyage Result:</span>
                                <span
                                  className={`text-2xl font-bold ${tce.netResult > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  ${tce.netResult.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                TCE: ${tce.tceDaily.toLocaleString()}/day • Margin: {tce.profitMargin.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calculator className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>Enter discharge port to calculate voyage economics</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Market Analysis Tab */}
              <TabsContent value="market">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {marketRates.length > 0 ? (
                      (() => {
                        const position = analyzeMarketPosition(selectedVessel, marketRates)
                        return (
                          <div className="space-y-6">
                            {/* Market Position */}
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-xl font-bold text-blue-600">
                                  ${position.vesselRate.toLocaleString()}
                                </div>
                                <div className="text-sm text-blue-700">Vessel Rate</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-xl font-bold text-gray-600">
                                  ${position.marketAverage.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-700">Market Average</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div
                                  className={`text-xl font-bold ${position.deviation > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {position.deviation > 0 ? "+" : ""}
                                  {position.deviation.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-700">vs Market</div>
                              </div>
                            </div>

                            {/* Position Indicator */}
                            <div
                              className={`p-4 rounded-lg border-l-4 ${
                                position.position === "strong"
                                  ? "bg-green-50 border-green-500"
                                  : position.position === "competitive"
                                    ? "bg-blue-50 border-blue-500"
                                    : "bg-red-50 border-red-500"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {position.position === "strong" ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : position.position === "competitive" ? (
                                  <Star className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                )}
                                <span className="font-semibold capitalize">{position.position} Position</span>
                              </div>
                              <p className="text-sm">{position.recommendation}</p>
                            </div>

                            {/* Competitive Analysis */}
                            <div>
                              <h4 className="font-semibold mb-3">Competitive Rates</h4>
                              <div className="space-y-2">
                                {vessels.slice(0, 5).map((vessel, index) => (
                                  <div
                                    key={vessel.id}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                  >
                                    <span className="text-sm">{vessel.vesselName}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">${vessel.freightRate?.toLocaleString()}/day</span>
                                      <Badge variant={vessel.id === selectedVessel.id ? "default" : "outline"}>
                                        {vessel.id === selectedVessel.id ? "Selected" : `#${index + 1}`}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>Market data will appear here when more vessels are available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Communication Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          const offer = generateCommercialOffer(selectedVessel, clientName)
                          handleSendEmail(`Commercial Offer - ${selectedVessel.vesselName}`, offer)
                        }}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">Send Commercial Offer</span>
                        </div>
                        <span className="text-xs opacity-80">Professional email template</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          const message = generateWhatsAppMessage(selectedVessel)
                          handleCopyToClipboard(message, "WhatsApp message")
                        }}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">Copy WhatsApp Message</span>
                        </div>
                        <span className="text-xs opacity-80">Quick mobile sharing</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          const phoneNumber = selectedVessel.phoneNumber?.replace(/\D/g, "") || ""
                          window.open(`tel:${phoneNumber}`)
                        }}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">Call Broker</span>
                        </div>
                        <span className="text-xs opacity-80">{selectedVessel.phoneNumber}</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDownloadRecap(selectedVessel)}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Download className="h-4 w-4" />
                          <span className="font-medium">Download Recap</span>
                        </div>
                        <span className="text-xs opacity-80">Fixture documentation</span>
                      </Button>
                    </div>

                    {/* Message Templates */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Quick Messages</h4>

                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Follow-up Message</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleCopyToClipboard(
                                `Hi ${selectedVessel.brokerName}, following up on ${selectedVessel.vesselName}. Any updates on availability?`,
                                "Follow-up message",
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">
                          Hi {selectedVessel.brokerName}, following up on {selectedVessel.vesselName}. Any updates on
                          availability?
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Rate Inquiry</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleCopyToClipboard(
                                `What's your best rate for ${selectedVessel.vesselName} ${dischargePort ? `to ${dischargePort}` : ""}? Need quick response.`,
                                "Rate inquiry",
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">
                          What's your best rate for {selectedVessel.vesselName}{" "}
                          {dischargePort ? `to ${dischargePort}` : ""}? Need quick response.
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Broker Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add private notes about this vessel or negotiation..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documentation Tab */}
              <TabsContent value="documentation">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentation & Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Document Generation */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleDownloadRecap(selectedVessel)}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">Fixture Recap</span>
                        </div>
                        <span className="text-xs opacity-80">Complete transaction summary</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          const comparison = vessels
                            .map((v) => {
                              const voyage = calculateVoyageDetails(v.openPort || "", dischargePort || "Discharge Port")
                              const tce = calculateTCE(v, voyage)
                              return `${v.vesselName}: $${v.freightRate?.toLocaleString()}/day (TCE: $${tce.tceDaily.toLocaleString()}/day)`
                            })
                            .join("\n")

                          const report = `VESSEL COMPARISON REPORT
Generated: ${new Date().toLocaleString()}
Client: ${clientName || "[CLIENT]"}
Cargo: ${cargoType || "[CARGO]"} ${cargoQuantity || "[QTY]"} MT
Route: ${selectedVessel.openPort} - ${dischargePort || "[DISCHARGE]"}

VESSELS COMPARED:
${comparison}

RECOMMENDATION:
${selectedVessel.vesselName} offers the best combination of rate and suitability.

Prepared by: ${selectedVessel.brokerName}`

                          const blob = new Blob([report], { type: "text/plain" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `vessel_comparison_${new Date().toISOString().split("T")[0]}.txt`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Download className="h-4 w-4" />
                          <span className="font-medium">Comparison Report</span>
                        </div>
                        <span className="text-xs opacity-80">Multi-vessel analysis</span>
                      </Button>
                    </div>

                    {/* Vessel Details Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Vessel Summary - {selectedVessel.vesselName}</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div>
                            <strong>Type:</strong> {selectedVessel.vesselType}
                          </div>
                          <div>
                            <strong>DWT:</strong> {selectedVessel.vesselSize}k MT
                          </div>
                          <div>
                            <strong>Built:</strong> {new Date().getFullYear() - (selectedVessel.vesselAge || 0)}
                          </div>
                          <div>
                            <strong>Flag:</strong> {selectedVessel.vesselFlag}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <strong>Open:</strong> {selectedVessel.openPort}
                          </div>
                          <div>
                            <strong>Laycan:</strong> {selectedVessel.openDates}
                          </div>
                          <div>
                            <strong>Rate:</strong> ${selectedVessel.freightRate?.toLocaleString()}/day
                          </div>
                          <div>
                            <strong>Broker:</strong> {selectedVessel.brokerName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const data = JSON.stringify(selectedVessel, null, 2)
                          handleCopyToClipboard(data, "Vessel data")
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const csv = `Vessel Name,Type,DWT,Built,Flag,Open Port,Rate,Broker\n${selectedVessel.vesselName},${selectedVessel.vesselType},${selectedVessel.vesselSize}k,${new Date().getFullYear() - (selectedVessel.vesselAge || 0)},${selectedVessel.vesselFlag},${selectedVessel.openPort},${selectedVessel.freightRate},${selectedVessel.brokerName}`
                          handleCopyToClipboard(csv, "CSV data")
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Ship className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Select a vessel to view detailed analysis</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
