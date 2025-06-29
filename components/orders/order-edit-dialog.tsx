"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, Save, X } from "lucide-react"
import { useOrderStore } from "@/lib/store/order-store"
import { CARGO_TYPES, SPECIAL_REQUIREMENTS, TRADE_LANES, CHARTERERS } from "@/lib/types/orders"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Order, OrderStatus } from "@/lib/types/orders"
import { toast } from "@/components/ui/use-toast"

interface OrderEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrderEditDialog({ open, onOpenChange, order }: OrderEditDialogProps) {
  const { updateOrder } = useOrderStore()

  const [formData, setFormData] = useState({
    orderType: order.orderType || "Voyage",
    cargoType: order.cargoType || "",
    cargoQuantity: order.cargoQuantity?.toString() || "",
    cargoUnit: "MT",
    dwtMin: order.dwtMin?.toString() || "",
    dwtMax: order.dwtMax?.toString() || "",
    laycanStart: order.laycanStart ? new Date(order.laycanStart).toISOString().split("T")[0] : "",
    laycanEnd: order.laycanEnd ? new Date(order.laycanEnd).toISOString().split("T")[0] : "",
    loadPort: order.loadPort || "",
    dischargePort: order.dischargePort || "",
    loadRate: order.loadRate?.toString() || "",
    dischargeRate: order.dischargeRate?.toString() || "",
    freightIdea: order.freightIdea || "",
    maxAge: order.maxAge?.toString() || "",
    gearRequirement: order.gearRequirement || "",
    iceClass: order.iceClass || false,
    commissionRate: order.commissionRate?.toString() || "3.75",
    demurrage: order.demurrage?.toString() || "",
    despatch: order.despatch?.toString() || "",
    charterer: order.charterer || "",
    tradeLane: order.tradeLane || "",
    priority: order.priority || "medium",
    notes: order.notes || "",
    specialRequirements: order.specialRequirements || [],
    status: order.status || "Active",
    rate: order.rate || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        orderType: order.orderType || "Voyage",
        cargoType: order.cargoType || "",
        cargoQuantity: order.cargoQuantity?.toString() || "",
        cargoUnit: "MT",
        dwtMin: order.dwtMin?.toString() || "",
        dwtMax: order.dwtMax?.toString() || "",
        laycanStart: order.laycanStart ? new Date(order.laycanStart).toISOString().split("T")[0] : "",
        laycanEnd: order.laycanEnd ? new Date(order.laycanEnd).toISOString().split("T")[0] : "",
        loadPort: order.loadPort || "",
        dischargePort: order.dischargePort || "",
        loadRate: order.loadRate?.toString() || "",
        dischargeRate: order.dischargeRate?.toString() || "",
        freightIdea: order.freightIdea || "",
        maxAge: order.maxAge?.toString() || "",
        gearRequirement: order.gearRequirement || "",
        iceClass: order.iceClass || false,
        commissionRate: order.commissionRate?.toString() || "3.75",
        demurrage: order.demurrage?.toString() || "",
        despatch: order.despatch?.toString() || "",
        charterer: order.charterer || "",
        tradeLane: order.tradeLane || "",
        priority: order.priority || "medium",
        notes: order.notes || "",
        specialRequirements: order.specialRequirements || [],
        status: order.status || "Active",
        rate: order.rate || "",
      })
      setErrors({})
    }
  }, [order])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cargoType) newErrors.cargoType = "Cargo type is required"
    if (!formData.dwtMin) newErrors.dwtMin = "Minimum DWT is required"
    if (!formData.dwtMax) newErrors.dwtMax = "Maximum DWT is required"
    if (!formData.laycanStart) newErrors.laycanStart = "Laycan start date is required"
    if (!formData.laycanEnd) newErrors.laycanEnd = "Laycan end date is required"
    if (!formData.loadPort) newErrors.loadPort = "Load port is required"
    if (!formData.dischargePort) newErrors.dischargePort = "Discharge port is required"

    if (formData.dwtMin && formData.dwtMax) {
      const min = Number.parseInt(formData.dwtMin)
      const max = Number.parseInt(formData.dwtMax)

      if (isNaN(min) || min <= 0) {
        newErrors.dwtMin = "Minimum DWT must be a valid positive number"
      }
      if (isNaN(max) || max <= 0) {
        newErrors.dwtMax = "Maximum DWT must be a valid positive number"
      }
      if (!isNaN(min) && !isNaN(max) && min >= max) {
        newErrors.dwtMax = "Maximum DWT must be greater than minimum DWT"
      }
    }

    if (formData.laycanStart && formData.laycanEnd) {
      try {
        const start = new Date(formData.laycanStart)
        const end = new Date(formData.laycanEnd)

        if (isNaN(start.getTime())) {
          newErrors.laycanStart = "Invalid start date"
        }
        if (isNaN(end.getTime())) {
          newErrors.laycanEnd = "Invalid end date"
        }
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
          newErrors.laycanEnd = "End date must be after start date"
        }
      } catch (error) {
        console.error("Date validation error:", error)
        newErrors.laycanStart = "Date validation error"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const updatedOrder: Order = {
        ...order,
        orderType: formData.orderType as "TC" | "Voyage" | "COA",
        cargoType: formData.cargoType,
        cargoQuantity: formData.cargoQuantity ? Number.parseInt(formData.cargoQuantity) : undefined,
        dwtMin: Number.parseInt(formData.dwtMin),
        dwtMax: Number.parseInt(formData.dwtMax),
        laycanStart: new Date(formData.laycanStart).toISOString(),
        laycanEnd: new Date(formData.laycanEnd).toISOString(),
        loadPort: formData.loadPort,
        dischargePort: formData.dischargePort,
        loadRate: formData.loadRate ? Number.parseInt(formData.loadRate) : undefined,
        dischargeRate: formData.dischargeRate ? Number.parseInt(formData.dischargeRate) : undefined,
        freightIdea: formData.freightIdea || undefined,
        maxAge: formData.maxAge ? Number.parseInt(formData.maxAge) : undefined,
        gearRequirement: formData.gearRequirement || undefined,
        iceClass: formData.iceClass,
        commissionRate: formData.commissionRate ? Number.parseFloat(formData.commissionRate) : undefined,
        demurrage: formData.demurrage ? Number.parseInt(formData.demurrage) : undefined,
        despatch: formData.despatch ? Number.parseInt(formData.despatch) : undefined,
        charterer: formData.charterer || undefined,
        tradeLane: formData.tradeLane || undefined,
        priority: formData.priority as "high" | "medium" | "low",
        notes: formData.notes || undefined,
        specialRequirements: formData.specialRequirements.length > 0 ? formData.specialRequirements : undefined,
        status: formData.status as OrderStatus,
        rate: formData.rate || undefined,
        updatedAt: new Date().toISOString(),
      }

      updateOrder(order.id, updatedOrder)

      toast({
        title: "Order Updated",
        description: "The order has been successfully updated.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update order:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSpecialRequirement = (requirement: string) => {
    setFormData((prev) => {
      const current = [...prev.specialRequirements]
      if (current.includes(requirement)) {
        return { ...prev, specialRequirements: current.filter((r) => r !== requirement) }
      } else {
        return { ...prev, specialRequirements: [...current, requirement] }
      }
    })
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Order Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type */}
          <div className="space-y-3">
            <Label>Order Type</Label>
            <RadioGroup
              value={formData.orderType}
              onValueChange={(value: "TC" | "Voyage" | "COA") => setFormData({ ...formData, orderType: value })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Voyage" id="voyage" />
                <Label htmlFor="voyage">Voyage Charter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TC" id="tc" />
                <Label htmlFor="tc">Time Charter (TC)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COA" id="coa" />
                <Label htmlFor="coa">Contract of Affreightment (COA)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-4">
              <div
                className={`px-4 py-2 rounded-md cursor-pointer border ${
                  formData.priority === "high"
                    ? "bg-red-100 border-red-300 text-red-800"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
                onClick={() => setFormData({ ...formData, priority: "high" })}
              >
                High
              </div>
              <div
                className={`px-4 py-2 rounded-md cursor-pointer border ${
                  formData.priority === "medium"
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
                onClick={() => setFormData({ ...formData, priority: "medium" })}
              >
                Medium
              </div>
              <div
                className={`px-4 py-2 rounded-md cursor-pointer border ${
                  formData.priority === "low"
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
                onClick={() => setFormData({ ...formData, priority: "low" })}
              >
                Low
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cargo Details</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Cargo Type */}
              <div className="space-y-2">
                <Label htmlFor="cargoType">Cargo Type</Label>
                <Select
                  value={formData.cargoType}
                  onValueChange={(value) => setFormData({ ...formData, cargoType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGO_TYPES.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>
                        {cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cargoType && <p className="text-sm text-destructive">{errors.cargoType}</p>}
              </div>

              {/* Cargo Quantity */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cargoQuantity">Cargo Quantity</Label>
                  <Input
                    id="cargoQuantity"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.cargoQuantity}
                    onChange={(e) => setFormData({ ...formData, cargoQuantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargoUnit">Unit</Label>
                  <Select
                    value={formData.cargoUnit}
                    onValueChange={(value) => setFormData({ ...formData, cargoUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="MT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="KMT">KMT</SelectItem>
                      <SelectItem value="MMT">MMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Vessel Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vessel Requirements</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dwtMin">Minimum DWT (MT)</Label>
                <Input
                  id="dwtMin"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.dwtMin}
                  onChange={(e) => setFormData({ ...formData, dwtMin: e.target.value })}
                />
                {errors.dwtMin && <p className="text-sm text-destructive">{errors.dwtMin}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dwtMax">Maximum DWT (MT)</Label>
                <Input
                  id="dwtMax"
                  type="number"
                  placeholder="e.g., 80000"
                  value={formData.dwtMax}
                  onChange={(e) => setFormData({ ...formData, dwtMax: e.target.value })}
                />
                {errors.dwtMax && <p className="text-sm text-destructive">{errors.dwtMax}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAge">Maximum Age (years)</Label>
                <Input
                  id="maxAge"
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.maxAge}
                  onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gearRequirement">Gear Requirement</Label>
                <Input
                  id="gearRequirement"
                  placeholder="e.g., 4x25MT cranes"
                  value={formData.gearRequirement}
                  onChange={(e) => setFormData({ ...formData, gearRequirement: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_REQUIREMENTS.map((req) => (
                  <Badge
                    key={req}
                    variant={formData.specialRequirements.includes(req) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSpecialRequirement(req)}
                  >
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="iceClass"
                checked={formData.iceClass}
                onCheckedChange={(checked) => setFormData({ ...formData, iceClass: !!checked })}
              />
              <Label htmlFor="iceClass">Ice Class Required</Label>
            </div>
          </div>

          {/* Laycan Window */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Laycan Window</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laycanStart">Laycan Start</Label>
                <Input
                  id="laycanStart"
                  type="date"
                  min={today}
                  value={formData.laycanStart}
                  onChange={(e) => setFormData({ ...formData, laycanStart: e.target.value })}
                  className="w-full"
                />
                {errors.laycanStart && <p className="text-sm text-destructive">{errors.laycanStart}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="laycanEnd">Laycan End</Label>
                <Input
                  id="laycanEnd"
                  type="date"
                  min={formData.laycanStart || today}
                  value={formData.laycanEnd}
                  onChange={(e) => setFormData({ ...formData, laycanEnd: e.target.value })}
                  className="w-full"
                />
                {errors.laycanEnd && <p className="text-sm text-destructive">{errors.laycanEnd}</p>}
              </div>
            </div>
          </div>

          {/* Ports */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ports & Route</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loadPort">Load Port</Label>
                <Input
                  id="loadPort"
                  placeholder="e.g., Rotterdam"
                  value={formData.loadPort}
                  onChange={(e) => setFormData({ ...formData, loadPort: e.target.value })}
                />
                {errors.loadPort && <p className="text-sm text-destructive">{errors.loadPort}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dischargePort">Discharge Port</Label>
                <Input
                  id="dischargePort"
                  placeholder="e.g., Singapore"
                  value={formData.dischargePort}
                  onChange={(e) => setFormData({ ...formData, dischargePort: e.target.value })}
                />
                {errors.dischargePort && <p className="text-sm text-destructive">{errors.dischargePort}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeLane">Trade Lane</Label>
              <Select
                value={formData.tradeLane}
                onValueChange={(value) => setFormData({ ...formData, tradeLane: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trade lane" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_LANES.map((lane) => (
                    <SelectItem key={lane} value={lane}>
                      {lane}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Advanced Options
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Advanced Options
              </>
            )}
          </Button>

          {/* Advanced Options */}
          {showAdvanced && (
            <>
              <Separator />

              {/* Commercial Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Commercial Terms</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freightIdea">Freight Idea</Label>
                    <Input
                      id="freightIdea"
                      placeholder="e.g., $15.50 pmt or $18,000 pd"
                      value={formData.freightIdea}
                      onChange={(e) => setFormData({ ...formData, freightIdea: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 3.75"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="demurrage">Demurrage (USD/day)</Label>
                    <Input
                      id="demurrage"
                      type="number"
                      placeholder="e.g., 25000"
                      value={formData.demurrage}
                      onChange={(e) => setFormData({ ...formData, demurrage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="despatch">Despatch (USD/day)</Label>
                    <Input
                      id="despatch"
                      type="number"
                      placeholder="e.g., 12500"
                      value={formData.despatch}
                      onChange={(e) => setFormData({ ...formData, despatch: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loadRate">Load Rate (MT/day)</Label>
                    <Input
                      id="loadRate"
                      type="number"
                      placeholder="e.g., 15000"
                      value={formData.loadRate}
                      onChange={(e) => setFormData({ ...formData, loadRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dischargeRate">Discharge Rate (MT/day)</Label>
                    <Input
                      id="dischargeRate"
                      type="number"
                      placeholder="e.g., 20000"
                      value={formData.dischargeRate}
                      onChange={(e) => setFormData({ ...formData, dischargeRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="charterer">Charterer</Label>
                  <Select
                    value={formData.charterer}
                    onValueChange={(value) => setFormData({ ...formData, charterer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select charterer" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARTERERS.map((charterer) => (
                        <SelectItem key={charterer} value={charterer}>
                          {charterer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Status and Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Matched">Matched</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (optional)</Label>
              <Input
                id="rate"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g., $25,000/day"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
