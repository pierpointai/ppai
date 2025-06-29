"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Ship, Calendar, DollarSign, Trash2, FileText, Clock, AlertCircle, MapPin } from "lucide-react"
import { useOrderStore, type LinkedVesselStatus } from "@/lib/store/order-store"
import { EmailComposerDialog } from "./email-composer-dialog"

interface LinkedVesselsTableProps {
  orderId: string
  onUnlinkVessel?: (vesselId: string) => void
}

export function LinkedVesselsTable({ orderId, onUnlinkVessel }: LinkedVesselsTableProps) {
  const [showRateDialog, setShowRateDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<any>(null)
  const [rateValue, setRateValue] = useState("")
  const [rateUnit, setRateUnit] = useState("USD/MT")
  const [notes, setNotes] = useState("")

  const { orders, updateLinkedVesselStatus, unlinkVesselFromOrder, recordVesselRate, getOrderById } = useOrderStore()

  const order = getOrderById(orderId)
  const linkedVessels = order?.linkedVessels || []

  const handleStatusChange = (vesselId: string, status: string) => {
    updateLinkedVesselStatus(orderId, vesselId, status as LinkedVesselStatus)
  }

  const handleUnlinkVessel = (vesselId: string) => {
    if (onUnlinkVessel) {
      onUnlinkVessel(vesselId)
    } else {
      unlinkVesselFromOrder(orderId, vesselId)
    }
  }

  const handleOpenRateDialog = (vessel: any) => {
    setSelectedVessel(vessel)
    setRateValue(vessel.rateReceived?.toString() || "")
    setRateUnit(vessel.rateReceivedUnit || "USD/MT")
    setShowRateDialog(true)
  }

  const handleOpenEmailDialog = (vessel: any) => {
    if (!vessel) {
      console.warn("Cannot open email dialog: vessel is null or undefined")
      return
    }
    setSelectedVessel(vessel)
    setShowEmailDialog(true)
  }

  const handleOpenNotesDialog = (vessel: any) => {
    setSelectedVessel(vessel)
    setNotes(vessel.notes || "")
    setShowNotesDialog(true)
  }

  const handleSaveRate = () => {
    if (selectedVessel && rateValue) {
      recordVesselRate(orderId, selectedVessel.vesselId, Number.parseFloat(rateValue), rateUnit)
      setShowRateDialog(false)
    }
  }

  const handleSaveNotes = () => {
    if (selectedVessel) {
      updateLinkedVesselStatus(orderId, selectedVessel.vesselId, selectedVessel.status || "Shortlisted", notes)
      setShowNotesDialog(false)
    }
  }

  const formatSafeDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A"

    try {
      let date: Date

      // Handle different input types
      if (dateString instanceof Date) {
        date = dateString
      } else if (typeof dateString === "string") {
        // Handle various string formats
        if (dateString.includes("T") || dateString.includes("Z")) {
          // ISO format
          date = new Date(dateString)
        } else if (dateString.includes("/")) {
          // MM/DD/YYYY or DD/MM/YYYY format
          date = new Date(dateString)
        } else if (dateString.includes("-")) {
          // YYYY-MM-DD format
          date = new Date(dateString)
        } else {
          // Try parsing as-is
          date = new Date(dateString)
        }
      } else {
        return "N/A"
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }

      // Format the date consistently
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.warn("Date formatting error:", error, "Input:", dateString)
      return "Invalid Date"
    }
  }

  const getStatusColor = (status?: LinkedVesselStatus) => {
    switch (status) {
      case "Shortlisted":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "Contacted":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Awaiting Response":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Rate Received":
        return "bg-green-100 text-green-800 border-green-300"
      case "Offered":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "Presented to Charterer":
        return "bg-indigo-100 text-indigo-800 border-indigo-300"
      case "Negotiating":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "Nominated":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "Fixed":
        return "bg-teal-100 text-teal-800 border-teal-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getVesselPort = (vessel: any) => {
    return vessel.openPort || vessel.currentPort || vessel.loadPort || "Port Unknown"
  }

  if (linkedVessels.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Ship className="mx-auto h-12 w-12 opacity-20 mb-2" />
        <p>No vessels linked to this order yet</p>
        <p className="text-sm">Use the AI matching feature to find suitable vessels</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vessel</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedVessels.map((vessel) => (
              <TableRow key={vessel.id || vessel.vesselId}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{vessel.vesselName || vessel.name}</div>
                    <div className="text-sm text-muted-foreground">{vessel.vesselType}</div>
                    {/* Add closest port information */}
                    <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getVesselPort(vessel)}
                    </div>
                    {vessel.matchScore && (
                      <Badge variant="outline" className="mt-1 bg-blue-50">
                        {vessel.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">{vessel.dwt?.toLocaleString() || "N/A"}</span> DWT
                    </div>
                    <div>Built: {vessel.built || vessel.buildYear || "N/A"}</div>
                    <div className="inline-flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Laycan: {formatSafeDate(vessel.laycanStart)}
                      {vessel.laycanEnd && vessel.laycanEnd !== vessel.laycanStart && (
                        <span> - {formatSafeDate(vessel.laycanEnd)}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={vessel.status || "Shortlisted"}
                    onValueChange={(value) => handleStatusChange(vessel.vesselId || vessel.id, value)}
                  >
                    <SelectTrigger className={`w-[160px] ${getStatusColor(vessel.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Awaiting Response">Awaiting Response</SelectItem>
                      <SelectItem value="Rate Received">Rate Received</SelectItem>
                      <SelectItem value="Offered">Offered</SelectItem>
                      <SelectItem value="Presented to Charterer">Presented to Charterer</SelectItem>
                      <SelectItem value="Negotiating">Negotiating</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Nominated">Nominated</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                  {vessel.lastContactedAt && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Last contact: {formatSafeDate(vessel.lastContactedAt)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {vessel.rateReceived ? (
                    <div className="font-medium text-green-600">
                      {vessel.rateReceived} {vessel.rateReceivedUnit}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No rate yet</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEmailDialog(vessel)}
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenRateDialog(vessel)}
                      title="Record Rate"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenNotesDialog(vessel)} title="Add Notes">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnlinkVessel(vessel.vesselId || vessel.id)}
                      title="Unlink Vessel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rate Dialog */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Record Rate for {selectedVessel?.vesselName || selectedVessel?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="rate">Rate Value</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  placeholder="e.g. 12.50"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={rateUnit} onValueChange={setRateUnit}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD/MT">USD/MT</SelectItem>
                    <SelectItem value="USD/day">USD/day</SelectItem>
                    <SelectItem value="USD/ton">USD/ton</SelectItem>
                    <SelectItem value="EUR/MT">EUR/MT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Recording a rate will automatically update the vessel status to "Rate Received"
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate}>Save Rate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes for {selectedVessel?.vesselName || selectedVessel?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this vessel, communications, or special requirements..."
                className="h-32"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      {selectedVessel && order && (
        <EmailComposerDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          order={order}
          vessel={selectedVessel}
        />
      )}
    </>
  )
}
