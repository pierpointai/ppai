"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send, Copy, FileText, Ship, MapPin, Calendar, DollarSign, Clock, Building, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Order, LinkedVessel } from "@/lib/store/order-store"
import { useOrderStore } from "@/lib/store/order-store"

interface EmailComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  vessel: LinkedVessel
  onEmailSent?: () => void
}

const EMAIL_TEMPLATES = {
  initial_inquiry: {
    subject: "Vessel Inquiry - {vesselName} for {cargoType} Shipment",
    body: `Dear Sir/Madam,

We are pleased to inquire about the availability of your vessel {vesselName} for the following cargo opportunity:

CARGO DETAILS:
- Commodity: {cargoType}
- Quantity: {cargoQuantity}
- Load Port: {loadPort}
- Discharge Port: {dischargePort}
- Laycan: {laycanStart} - {laycanEnd}
- Charterer: {charterer}

VESSEL REQUIREMENTS:
- DWT: {dwtMin} - {dwtMax} MT
- Age: Max {maxAge} years

We would appreciate your best freight indication and vessel particulars at your earliest convenience.

Best regards,`,
  },
  rate_request: {
    subject: "Rate Request - {vesselName} for {loadPort}/{dischargePort}",
    body: `Dear Sir/Madam,

Further to our previous correspondence, we would like to request your best freight rate for the following fixture:

VOYAGE DETAILS:
- Vessel: {vesselName}
- Cargo: {cargoType} ({cargoQuantity})
- Route: {loadPort} to {dischargePort}
- Laycan: {laycanStart} - {laycanEnd}
- Charterer: {charterer}

Please provide:
1. Freight rate (USD/MT or lumpsum)
2. Demurrage/Despatch rates
3. Commission details
4. Any special terms

We look forward to your prompt response.

Best regards,`,
  },
  presentation: {
    subject: "Vessel Presentation - {vesselName} for {charterer}",
    body: `Dear {charterer},

We are pleased to present the following vessel for your consideration:

VESSEL PARTICULARS:
- Name: {vesselName}
- Type: {vesselType}
- DWT: {dwt} MT
- Built: {built}
- Flag: {flag}
- Open: {openPort}

CARGO OPPORTUNITY:
- Commodity: {cargoType}
- Quantity: {cargoQuantity}
- Load Port: {loadPort}
- Discharge Port: {dischargePort}
- Laycan: {laycanStart} - {laycanEnd}

The vessel is well-maintained and has an excellent track record. We believe this would be an ideal match for your requirements.

Please let us know if you require any additional information.

Best regards,`,
  },
}

export function EmailComposerDialog({ open, onOpenChange, order, vessel, onEmailSent }: EmailComposerDialogProps) {
  const [emailData, setEmailData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    template: "initial_inquiry",
  })
  const [includeAttachments, setIncludeAttachments] = useState({
    vesselParticulars: true,
    cargoDetails: true,
    termsConditions: false,
  })
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  const { markVesselContacted } = useOrderStore.getState()

  // Add null check for vessel
  if (!vessel) {
    return null
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const populateTemplate = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateKey]

    const replacements = {
      vesselName: vessel?.vesselName || vessel?.name || "N/A",
      vesselType: vessel?.vesselType || "N/A",
      dwt: vessel?.dwt?.toLocaleString() || "N/A",
      built: vessel?.built?.toString() || "N/A",
      flag: vessel?.flag || "N/A",
      openPort: vessel?.openPort || "N/A",
      cargoType: order?.cargoType || "N/A",
      cargoQuantity: order?.cargoQuantity
        ? `${order.cargoQuantity.toLocaleString()} ${order.cargoUnit || "MT"}`
        : "N/A",
      loadPort: order?.loadPort || "N/A",
      dischargePort: order?.dischargePort || "N/A",
      laycanStart: order?.laycanStart ? formatDate(order.laycanStart) : "N/A",
      laycanEnd: order?.laycanEnd ? formatDate(order.laycanEnd) : "N/A",
      charterer: order?.charterer || "Charterer",
      dwtMin: order?.dwtMin?.toLocaleString() || "N/A",
      dwtMax: order?.dwtMax?.toLocaleString() || "N/A",
      maxAge: order?.maxAge?.toString() || "N/A",
    }

    let subject = template.subject
    let body = template.body

    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      subject = subject.replace(new RegExp(placeholder, "g"), value)
      body = body.replace(new RegExp(placeholder, "g"), value)
    })

    setEmailData((prev) => ({
      ...prev,
      subject,
      body,
      template: templateKey,
    }))
  }

  const handleTemplateChange = (templateKey: string) => {
    populateTemplate(templateKey as keyof typeof EMAIL_TEMPLATES)
  }

  // Update the handleSendEmail function to mark the vessel as contacted
  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient, subject, and message body.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mark the vessel as contacted in the store
      if (order?.id && (vessel?.vesselId || vessel?.id)) {
        markVesselContacted(order.id, vessel.vesselId || vessel.id)
      }

      toast({
        title: "Email Sent Successfully",
        description: `Email sent to ${emailData.to} regarding ${vessel.vesselName}`,
      })

      onEmailSent?.()
      onOpenChange(false)

      // Reset form
      setEmailData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
        template: "initial_inquiry",
      })
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Email content copied successfully.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Email - {vessel?.vesselName || vessel?.name || "Unknown Vessel"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select value={emailData.template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial_inquiry">Initial Inquiry</SelectItem>
                  <SelectItem value="rate_request">Rate Request</SelectItem>
                  <SelectItem value="presentation">Vessel Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailData.to}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  type="email"
                  placeholder="cc@example.com"
                  value={emailData.cc}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, cc: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  type="email"
                  placeholder="bcc@example.com"
                  value={emailData.bcc}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, bcc: e.target.value }))}
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Message *</Label>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(emailData.body)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                id="body"
                placeholder="Email message"
                value={emailData.body}
                onChange={(e) => setEmailData((prev) => ({ ...prev, body: e.target.value }))}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <Label>Attachments</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vessel-particulars"
                    checked={includeAttachments.vesselParticulars}
                    onCheckedChange={(checked) =>
                      setIncludeAttachments((prev) => ({ ...prev, vesselParticulars: checked }))
                    }
                  />
                  <Label htmlFor="vessel-particulars" className="text-sm">
                    Vessel Particulars
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cargo-details"
                    checked={includeAttachments.cargoDetails}
                    onCheckedChange={(checked) => setIncludeAttachments((prev) => ({ ...prev, cargoDetails: checked }))}
                  />
                  <Label htmlFor="cargo-details" className="text-sm">
                    Cargo Details
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="terms-conditions"
                    checked={includeAttachments.termsConditions}
                    onCheckedChange={(checked) =>
                      setIncludeAttachments((prev) => ({ ...prev, termsConditions: checked }))
                    }
                  />
                  <Label htmlFor="terms-conditions" className="text-sm">
                    Terms & Conditions
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="space-y-4">
            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{order.cargoType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {order.loadPort} → {order.dischargePort}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {formatDate(order.laycanStart)} - {formatDate(order.laycanEnd)}
                  </span>
                </div>
                {order.charterer && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span>{order.charterer}</span>
                  </div>
                )}
                {order.cargoQuantity && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {order.cargoQuantity.toLocaleString()} {order.cargoUnit || "MT"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vessel Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Vessel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">{vessel?.vesselName || vessel?.name || "Unknown Vessel"}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {vessel?.vesselType || "Unknown Type"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">DWT:</span>
                    <br />
                    <span className="font-medium">{vessel?.dwt?.toLocaleString() || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Built:</span>
                    <br />
                    <span className="font-medium">{vessel?.built || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flag:</span>
                    <br />
                    <span className="font-medium">{vessel?.flag || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Open:</span>
                    <br />
                    <span className="font-medium">{vessel?.openPort || "N/A"}</span>
                  </div>
                </div>
                {vessel?.matchScore && (
                  <div className="pt-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-300">
                      Match Score: {vessel.matchScore}/10
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
