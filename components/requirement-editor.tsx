"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Ship, X } from "lucide-react"
import { VESSEL_CATEGORIES, FLAGS, CARGO_TYPES } from "@/lib/types"

interface RequirementEditorProps {
  requirements: any
  confidenceScores?: Record<string, number>
  onUpdate: (updatedRequirements: any) => void
  onSave: () => void
  onCancel: () => void
}

export function RequirementEditor({
  requirements,
  confidenceScores,
  onUpdate,
  onSave,
  onCancel,
}: RequirementEditorProps) {
  const [editedRequirements, setEditedRequirements] = useState({ ...requirements })

  const handleChange = (field: string, value: any) => {
    setEditedRequirements((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    onUpdate(editedRequirements)
    onSave()
  }

  const getConfidenceBadge = (field: string) => {
    if (!confidenceScores || confidenceScores[field] === undefined) return null

    const score = confidenceScores[field]
    let color = "bg-red-100 text-red-800"
    let label = "Low"

    if (score >= 0.8) {
      color = "bg-green-100 text-green-800"
      label = "High"
    } else if (score >= 0.6) {
      color = "bg-yellow-100 text-yellow-800"
      label = "Medium"
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`ml-2 ${color}`}>
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Confidence: {Math.round(score * 100)}%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Edit Extracted Requirements
        </CardTitle>
        <CardDescription>Review and refine the requirements extracted from the client email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vessel Type */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="vesselType">Vessel Type</Label>
              {getConfidenceBadge("vesselType")}
            </div>
            <Select
              value={editedRequirements.vesselType || ""}
              onValueChange={(value) => handleChange("vesselType", value)}
            >
              <SelectTrigger id="vesselType">
                <SelectValue placeholder="Select vessel type" />
              </SelectTrigger>
              <SelectContent>
                {VESSEL_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vessel Size */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="vesselSize">Vessel Size (DWT)</Label>
              {getConfidenceBadge("vesselSize")}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="vesselSize"
                type="number"
                value={editedRequirements.vesselSize || ""}
                onChange={(e) => handleChange("vesselSize", Number(e.target.value))}
                placeholder="e.g., 55000"
              />
              <span className="text-sm text-muted-foreground">DWT</span>
            </div>
          </div>

          {/* Load Port */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="loadPort">Load Port</Label>
              {getConfidenceBadge("loadPort")}
            </div>
            <Input
              id="loadPort"
              value={editedRequirements.loadPort || ""}
              onChange={(e) => handleChange("loadPort", e.target.value)}
              placeholder="e.g., Singapore"
            />
          </div>

          {/* Discharge Port */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="dischargePort">Discharge Port</Label>
              {getConfidenceBadge("dischargePort")}
            </div>
            <Input
              id="dischargePort"
              value={editedRequirements.dischargePort || ""}
              onChange={(e) => handleChange("dischargePort", e.target.value)}
              placeholder="e.g., Rotterdam"
            />
          </div>

          {/* Laycan Start */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="laycanStart">Laycan Start</Label>
              {getConfidenceBadge("laycan")}
            </div>
            <Input
              id="laycanStart"
              type="date"
              value={
                editedRequirements.laycanStart
                  ? new Date(editedRequirements.laycanStart).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleChange("laycanStart", e.target.value ? new Date(e.target.value) : null)}
            />
          </div>

          {/* Laycan End */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="laycanEnd">Laycan End</Label>
              {getConfidenceBadge("laycan")}
            </div>
            <Input
              id="laycanEnd"
              type="date"
              value={
                editedRequirements.laycanEnd ? new Date(editedRequirements.laycanEnd).toISOString().split("T")[0] : ""
              }
              onChange={(e) => handleChange("laycanEnd", e.target.value ? new Date(e.target.value) : null)}
            />
          </div>

          {/* Target Rate */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="targetRate">Target Rate (USD/day)</Label>
              {getConfidenceBadge("targetRate")}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="targetRate"
                type="number"
                value={editedRequirements.targetRate || ""}
                onChange={(e) => handleChange("targetRate", Number(e.target.value))}
                placeholder="e.g., 18000"
              />
              <span className="text-sm text-muted-foreground">USD/day</span>
            </div>
          </div>

          {/* Max Age */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="maxAge">Max Vessel Age (years)</Label>
              {getConfidenceBadge("maxAge")}
            </div>
            <Input
              id="maxAge"
              type="number"
              value={editedRequirements.maxAge || ""}
              onChange={(e) => handleChange("maxAge", Number(e.target.value))}
              placeholder="e.g., 15"
            />
          </div>

          {/* Gear Requirement */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="gearRequirement">Gear Requirement</Label>
              {getConfidenceBadge("gearRequirement")}
            </div>
            <Select
              value={editedRequirements.gearRequirement || ""}
              onValueChange={(value) => handleChange("gearRequirement", value)}
            >
              <SelectTrigger id="gearRequirement">
                <SelectValue placeholder="Select gear requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_preference">No preference</SelectItem>
                <SelectItem value="geared">Geared</SelectItem>
                <SelectItem value="gearless">Gearless</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ice Class Requirement */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="iceClassRequirement">Ice Class</Label>
              {getConfidenceBadge("iceClassRequirement")}
            </div>
            <Select
              value={editedRequirements.iceClassRequirement || ""}
              onValueChange={(value) => handleChange("iceClassRequirement", value)}
            >
              <SelectTrigger id="iceClassRequirement">
                <SelectValue placeholder="Select ice class requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_required">Not required</SelectItem>
                <SelectItem value="required">Required (any class)</SelectItem>
                <SelectItem value="1A Super">1A Super</SelectItem>
                <SelectItem value="1A">1A</SelectItem>
                <SelectItem value="1B">1B</SelectItem>
                <SelectItem value="1C">1C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Flag Preference */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="flagPreference">Flag Preference</Label>
              {getConfidenceBadge("flagPreference")}
            </div>
            <Select
              value={editedRequirements.flagPreference || ""}
              onValueChange={(value) => handleChange("flagPreference", value)}
            >
              <SelectTrigger id="flagPreference">
                <SelectValue placeholder="Select flag preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_preference">No preference</SelectItem>
                {FLAGS.map((flag) => (
                  <SelectItem key={flag} value={flag}>
                    {flag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cargo Type */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="cargoType">Cargo Type</Label>
              {getConfidenceBadge("cargoType")}
            </div>
            <Select
              value={editedRequirements.cargoType || ""}
              onValueChange={(value) => handleChange("cargoType", value)}
            >
              <SelectTrigger id="cargoType">
                <SelectValue placeholder="Select cargo type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_specified">Not specified</SelectItem>
                {CARGO_TYPES.map((cargo) => (
                  <SelectItem key={cargo} value={cargo}>
                    {cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cargo Quantity */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="cargoQuantity">Cargo Quantity (MT)</Label>
              {getConfidenceBadge("cargoQuantity")}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="cargoQuantity"
                type="number"
                value={editedRequirements.cargoQuantity || ""}
                onChange={(e) => handleChange("cargoQuantity", Number(e.target.value))}
                placeholder="e.g., 50000"
              />
              <span className="text-sm text-muted-foreground">MT</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Special Clauses */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="specialClauses">Special Clauses or Restrictions</Label>
            {getConfidenceBadge("specialClauses")}
          </div>
          <Textarea
            id="specialClauses"
            value={editedRequirements.specialClauses || ""}
            onChange={(e) => handleChange("specialClauses", e.target.value)}
            placeholder="Enter any special clauses or restrictions..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Save Requirements
        </Button>
      </CardFooter>
    </Card>
  )
}
