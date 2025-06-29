"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, SlidersHorizontal, X } from "lucide-react"

interface MatchingWeightsEditorProps {
  weights: Record<string, number>
  onUpdate: (weights: Record<string, number>) => void
  onClose: () => void
}

export function MatchingWeightsEditor({ weights, onUpdate, onClose }: MatchingWeightsEditorProps) {
  const [editedWeights, setEditedWeights] = useState({ ...weights })
  const totalWeight = Object.values(editedWeights).reduce((sum, weight) => sum + weight, 0)

  const handleWeightChange = (key: string, value: number) => {
    setEditedWeights((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    onUpdate(editedWeights)
    onClose()
  }

  const resetWeights = () => {
    setEditedWeights({
      vesselType: 25,
      vesselSize: 20,
      route: 20,
      laycan: 15,
      rate: 20,
      age: 10,
      gear: 10,
      iceClass: 5,
      flag: 5,
      cargoType: 10,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Adjust Matching Weights
        </CardTitle>
        <CardDescription>Customize how different factors influence the matching score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between text-sm mb-4">
          <span>Total weight: {totalWeight}%</span>
          <Button variant="outline" size="sm" onClick={resetWeights}>
            Reset to Default
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vesselType">Vessel Type</Label>
              <span className="text-sm font-medium">{editedWeights.vesselType}%</span>
            </div>
            <Slider
              id="vesselType"
              min={0}
              max={50}
              step={5}
              value={[editedWeights.vesselType]}
              onValueChange={(value) => handleWeightChange("vesselType", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vesselSize">Vessel Size</Label>
              <span className="text-sm font-medium">{editedWeights.vesselSize}%</span>
            </div>
            <Slider
              id="vesselSize"
              min={0}
              max={50}
              step={5}
              value={[editedWeights.vesselSize]}
              onValueChange={(value) => handleWeightChange("vesselSize", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="route">Route (Ports)</Label>
              <span className="text-sm font-medium">{editedWeights.route}%</span>
            </div>
            <Slider
              id="route"
              min={0}
              max={50}
              step={5}
              value={[editedWeights.route]}
              onValueChange={(value) => handleWeightChange("route", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="laycan">Laycan</Label>
              <span className="text-sm font-medium">{editedWeights.laycan}%</span>
            </div>
            <Slider
              id="laycan"
              min={0}
              max={50}
              step={5}
              value={[editedWeights.laycan]}
              onValueChange={(value) => handleWeightChange("laycan", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rate">Freight Rate</Label>
              <span className="text-sm font-medium">{editedWeights.rate}%</span>
            </div>
            <Slider
              id="rate"
              min={0}
              max={50}
              step={5}
              value={[editedWeights.rate]}
              onValueChange={(value) => handleWeightChange("rate", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="age">Vessel Age</Label>
              <span className="text-sm font-medium">{editedWeights.age}%</span>
            </div>
            <Slider
              id="age"
              min={0}
              max={30}
              step={5}
              value={[editedWeights.age]}
              onValueChange={(value) => handleWeightChange("age", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gear">Gear Requirements</Label>
              <span className="text-sm font-medium">{editedWeights.gear}%</span>
            </div>
            <Slider
              id="gear"
              min={0}
              max={30}
              step={5}
              value={[editedWeights.gear]}
              onValueChange={(value) => handleWeightChange("gear", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="iceClass">Ice Class</Label>
              <span className="text-sm font-medium">{editedWeights.iceClass}%</span>
            </div>
            <Slider
              id="iceClass"
              min={0}
              max={20}
              step={5}
              value={[editedWeights.iceClass]}
              onValueChange={(value) => handleWeightChange("iceClass", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="flag">Flag Preference</Label>
              <span className="text-sm font-medium">{editedWeights.flag}%</span>
            </div>
            <Slider
              id="flag"
              min={0}
              max={20}
              step={5}
              value={[editedWeights.flag]}
              onValueChange={(value) => handleWeightChange("flag", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cargoType">Cargo Type</Label>
              <span className="text-sm font-medium">{editedWeights.cargoType}%</span>
            </div>
            <Slider
              id="cargoType"
              min={0}
              max={30}
              step={5}
              value={[editedWeights.cargoType]}
              onValueChange={(value) => handleWeightChange("cargoType", value[0])}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Apply Weights
        </Button>
      </CardFooter>
    </Card>
  )
}
