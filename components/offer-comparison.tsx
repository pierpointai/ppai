"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ship, MapPin, Calendar, Mail, Phone, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Offer } from "@/lib/types"

interface OfferComparisonProps {
  vessels: Offer[]
  request?: any
  bestVessel?: Offer | null
}

export function OfferComparison({ vessels }: OfferComparisonProps) {
  const { toast } = useToast()

  if (!vessels || vessels.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Ship className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No vessels selected</h3>
          <p className="text-gray-500">Select vessels above to compare them</p>
        </CardContent>
      </Card>
    )
  }

  // Simple email generation
  const sendOffer = (vessel: Offer) => {
    const subject = `Vessel Offer - ${vessel.vesselName}`
    const body = `Dear Charterer,

We offer:

${vessel.vesselName}
${vessel.vesselType} ${vessel.vesselSize}k DWT
Built: ${new Date().getFullYear() - (vessel.vesselAge || 0)}
Open: ${vessel.openPort}
Rate: $${vessel.freightRate?.toLocaleString()}/day

Contact: ${vessel.brokerName}
Phone: ${vessel.phoneNumber}

Best regards`

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  // Simple recap download
  const downloadRecap = (vessel: Offer) => {
    const recap = `VESSEL: ${vessel.vesselName}
TYPE: ${vessel.vesselType}
DWT: ${vessel.vesselSize}k
RATE: $${vessel.freightRate?.toLocaleString()}/day
OPEN: ${vessel.openPort}
BROKER: ${vessel.brokerName}
PHONE: ${vessel.phoneNumber}
DATE: ${new Date().toLocaleDateString()}`

    const blob = new Blob([recap], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${vessel.vesselName}_recap.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: `${vessel.vesselName} recap saved`,
    })
  }

  // Calculate rate statistics
  const rates = vessels.map((v) => v.freightRate || 0).filter((rate) => rate > 0)
  const minRate = rates.length > 0 ? Math.min(...rates) : 0
  const maxRate = rates.length > 0 ? Math.max(...rates) : 0
  const avgRate = rates.length > 0 ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0

  return (
    <div className="space-y-6">
      {/* Simple comparison table */}
      <Card>
        <CardHeader>
          <CardTitle>Vessel Comparison ({vessels.length} vessels)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Vessel</th>
                  <th className="text-left p-3">Type & Size</th>
                  <th className="text-left p-3">Rate</th>
                  <th className="text-left p-3">Open</th>
                  <th className="text-left p-3">Broker</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((vessel) => (
                  <tr key={vessel.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{vessel.vesselName}</div>
                        <div className="text-sm text-gray-500">
                          Built {new Date().getFullYear() - (vessel.vesselAge || 0)}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{vessel.vesselType}</div>
                      <div className="text-sm text-gray-500">{vessel.vesselSize}k DWT</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-green-600">
                        ${(vessel.freightRate || 0).toLocaleString()}/day
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vessel.openPort}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {vessel.openDates}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="font-medium">{vessel.brokerName}</div>
                        <div className="text-gray-500">{vessel.company}</div>
                        <div className="text-gray-500">{vessel.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => sendOffer(vessel)}>
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadRecap(vessel)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${vessel.phoneNumber?.replace(/\D/g, "")}`)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">${minRate.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Lowest Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${avgRate.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Average Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${maxRate.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Highest Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
