"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useOrderStore } from "@/lib/store/order-store"
import { toast } from "@/hooks/use-toast"

interface OrderFormProps {
  onSuccess: () => void
}

const CARGO_TYPES = [
  "Iron Ore",
  "Coal",
  "Grain",
  "Wheat",
  "Corn",
  "Soybeans",
  "Bauxite",
  "Fertilizer",
  "Steel Products",
  "Cement",
  "Salt",
]

const CHARTERERS = [
  "Cargill",
  "Bunge",
  "Trafigura",
  "Oldendorff",
  "Vale",
  "Rio Tinto",
  "BHP",
  "Norden",
  "SwissMarine",
  "Klaveness",
]

export function OrderForm({ onSuccess }: OrderFormProps) {
  const { addOrder } = useOrderStore()
  const [formData, setFormData] = useState({
    orderType: "Voyage" as "TC" | "Voyage" | "COA",
    cargoType: "",
    cargoQuantity: "",
    dwtMin: "",
    dwtMax: "",
    laycanStart: "",
    laycanEnd: "",
    loadPort: "",
    dischargePort: "",
    charterer: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      if (min >= max) {
        newErrors.dwtMax = "Maximum DWT must be greater than minimum DWT"
      }
    }

    if (formData.laycanStart && formData.laycanEnd) {
      const start = new Date(formData.laycanStart)
      const end = new Date(formData.laycanEnd)
      if (start >= end) {
        newErrors.laycanEnd = "End date must be after start date"
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

    setIsSubmitting(true)

    try {
      const newOrder = {
        orderType: formData.orderType,
        cargoType: formData.cargoType,
        cargoQuantity: formData.cargoQuantity ? Number.parseInt(formData.cargoQuantity) : undefined,
        cargoUnit: "MT",
        dwtMin: Number.parseInt(formData.dwtMin),
        dwtMax: Number.parseInt(formData.dwtMax),
        laycanStart: new Date(formData.laycanStart).toISOString(),
        laycanEnd: new Date(formData.laycanEnd).toISOString(),
        loadPort: formData.loadPort,
        dischargePort: formData.dischargePort,
        charterer: formData.charterer || undefined,
        priority: formData.priority,
        notes: formData.notes || undefined,
        linkedVessels: [],
      }

      addOrder(newOrder)

      toast({
        title: "Order Created",
        description: "Your new order has been created successfully.",
      })

      onSuccess()
    } catch (error) {
      console.error("Failed to create order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
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
            <Label htmlFor="tc">Time Charter</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="COA" id="coa" />
            <Label htmlFor="coa">Contract of Affreightment</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <div className="flex gap-4">
          {["High", "Medium", "Low"].map((priority) => (
            <div
              key={priority}
              className={`px-4 py-2 rounded-md cursor-pointer border ${
                formData.priority === priority
                  ? priority === "High"
                    ? "bg-red-100 border-red-300 text-red-800"
                    : priority === "Medium"
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "bg-green-100 border-green-300 text-green-800"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }`}
              onClick={() => setFormData({ ...formData, priority: priority as "High" | "Medium" | "Low" })}
            >
              {priority}
            </div>
          ))}
        </div>
      </div>

      {/* Cargo Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cargoType">Cargo Type</Label>
          <Select value={formData.cargoType} onValueChange={(value) => setFormData({ ...formData, cargoType: value })}>
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

        <div className="space-y-2">
          <Label htmlFor="cargoQuantity">Cargo Quantity (MT)</Label>
          <Input
            id="cargoQuantity"
            type="number"
            placeholder="e.g., 50000"
            value={formData.cargoQuantity}
            onChange={(e) => setFormData({ ...formData, cargoQuantity: e.target.value })}
          />
        </div>
      </div>

      {/* Vessel Requirements */}
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

      {/* Laycan Window */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="laycanStart">Laycan Start</Label>
          <Input
            id="laycanStart"
            type="date"
            min={today}
            value={formData.laycanStart}
            onChange={(e) => setFormData({ ...formData, laycanStart: e.target.value })}
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
          />
          {errors.laycanEnd && <p className="text-sm text-destructive">{errors.laycanEnd}</p>}
        </div>
      </div>

      {/* Ports */}
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

      {/* Charterer */}
      <div className="space-y-2">
        <Label htmlFor="charterer">Charterer (Optional)</Label>
        <Select value={formData.charterer} onValueChange={(value) => setFormData({ ...formData, charterer: value })}>
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

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  )
}
