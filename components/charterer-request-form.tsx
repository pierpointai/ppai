"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ChartererRequest {
  vesselType?: string
  dwtMin?: number
  dwtMax?: number
  laycanStart?: Date
  laycanEnd?: Date
  loadPort?: string
  dischargePort?: string
  maxAge?: number
  cargoType?: string
  targetRate?: number
  gearRequirement?: string
}

interface ChartererRequestFormProps {
  onRequestChange: (request: ChartererRequest) => void
}

export function ChartererRequestForm({ onRequestChange }: ChartererRequestFormProps) {
  const [request, setRequest] = useState<ChartererRequest>({})

  const updateRequest = (field: keyof ChartererRequest, value: any) => {
    const newRequest = { ...request, [field]: value }
    setRequest(newRequest)
    onRequestChange(newRequest)
  }

  const clearRequest = () => {
    setRequest({})
    onRequestChange({})
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Vessel Type */}
      <div className="space-y-2">
        <Label htmlFor="vesselType">Vessel Type</Label>
        <Select onValueChange={(value) => updateRequest("vesselType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select vessel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="handysize">Handysize</SelectItem>
            <SelectItem value="handymax">Handymax</SelectItem>
            <SelectItem value="supramax">Supramax</SelectItem>
            <SelectItem value="panamax">Panamax</SelectItem>
            <SelectItem value="kamsarmax">Kamsarmax</SelectItem>
            <SelectItem value="capesize">Capesize</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DWT Range */}
      <div className="space-y-2">
        <Label htmlFor="dwtMin">DWT Min (tons)</Label>
        <Input
          id="dwtMin"
          type="number"
          placeholder="e.g. 50000"
          onChange={(e) => updateRequest("dwtMin", Number(e.target.value) || undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dwtMax">DWT Max (tons)</Label>
        <Input
          id="dwtMax"
          type="number"
          placeholder="e.g. 80000"
          onChange={(e) => updateRequest("dwtMax", Number(e.target.value) || undefined)}
        />
      </div>

      {/* Laycan Dates */}
      <div className="space-y-2">
        <Label>Laycan Start</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !request.laycanStart && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {request.laycanStart ? format(request.laycanStart, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={request.laycanStart}
              onSelect={(date) => updateRequest("laycanStart", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Laycan End</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !request.laycanEnd && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {request.laycanEnd ? format(request.laycanEnd, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={request.laycanEnd}
              onSelect={(date) => updateRequest("laycanEnd", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Ports */}
      <div className="space-y-2">
        <Label htmlFor="loadPort">Load Port</Label>
        <Input
          id="loadPort"
          placeholder="e.g. Houston"
          onChange={(e) => updateRequest("loadPort", e.target.value || undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dischargePort">Discharge Port</Label>
        <Input
          id="dischargePort"
          placeholder="e.g. Rotterdam"
          onChange={(e) => updateRequest("dischargePort", e.target.value || undefined)}
        />
      </div>

      {/* Max Age */}
      <div className="space-y-2">
        <Label htmlFor="maxAge">Max Age (years)</Label>
        <Input
          id="maxAge"
          type="number"
          placeholder="e.g. 15"
          onChange={(e) => updateRequest("maxAge", Number(e.target.value) || undefined)}
        />
      </div>

      {/* Target Rate */}
      <div className="space-y-2">
        <Label htmlFor="targetRate">Target Rate ($/day)</Label>
        <Input
          id="targetRate"
          type="number"
          placeholder="e.g. 25000"
          onChange={(e) => updateRequest("targetRate", Number(e.target.value) || undefined)}
        />
      </div>

      {/* Clear Button */}
      <div className="flex items-end">
        <Button variant="outline" onClick={clearRequest} className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  )
}
