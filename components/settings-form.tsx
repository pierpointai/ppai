"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REGIONS } from "@/lib/mock-data"
import { useOfferStore } from "@/lib/offer-store"
import { useToast } from "@/components/ui/use-toast"

interface GeographicRadius {
  enabled: boolean
  radiusKm: number
  preferExactMatch: boolean
}

export function SettingsForm() {
  const { rankingWeights, setRankingWeights } = useOfferStore()
  const [weights, setWeights] = useState({ ...rankingWeights })
  const [preferredRegions, setPreferredRegions] = useState<string[]>([])
  const [emailSettings, setEmailSettings] = useState({
    autoProcess: true,
    sendNotifications: true,
    emailAddress: "",
  })
  const { toast } = useToast()

  const [geographicRadius, setGeographicRadius] = useState<GeographicRadius>({
    enabled: false,
    radiusKm: 200,
    preferExactMatch: true,
  })

  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value[0],
    }))
  }

  const handleSaveSettings = () => {
    // Normalize weights to ensure they sum to 1
    const sum = Object.values(weights).reduce((a, b) => a + b, 0)

    // Prevent division by zero
    if (sum === 0) {
      toast({
        title: "Invalid weights",
        description: "At least one weight must be greater than zero.",
        variant: "destructive",
      })
      return
    }

    const normalizedWeights = Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / sum]))

    setRankingWeights(normalizedWeights as any)

    toast({
      title: "Settings saved",
      description: "Your ranking preferences have been updated.",
    })
  }

  const handleResetSettings = () => {
    setWeights({ ...rankingWeights })
    setPreferredRegions([])
    setEmailSettings({
      autoProcess: true,
      sendNotifications: true,
      emailAddress: "",
    })

    toast({
      title: "Settings reset",
      description: "Your preferences have been reset.",
    })
  }

  const handleAddRegion = (region: string) => {
    if (!region) return

    if (preferredRegions.includes(region)) {
      toast({
        title: "Region already added",
        description: `${region} is already in your preferred regions.`,
        variant: "destructive",
      })
      return
    }

    setPreferredRegions([...preferredRegions, region])

    toast({
      title: "Region added",
      description: `${region} has been added to your preferred regions.`,
    })
  }

  const handleRemoveRegion = (region: string) => {
    setPreferredRegions(preferredRegions.filter((r) => r !== region))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="ranking">
        <TabsList className="mb-4">
          <TabsTrigger value="ranking">Ranking Preferences</TabsTrigger>
          <TabsTrigger value="regions">Region Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email Management</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Preferences</CardTitle>
              <CardDescription>Adjust how offers are ranked based on your priorities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Core Matching Criteria */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Core Matching Criteria</h4>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Vessel Size Importance</label>
                        <span className="text-sm">{Math.round(weights.vesselSize * 100)}%</span>
                      </div>
                      <Slider
                        value={[weights.vesselSize]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("vesselSize", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values prioritize exact vessel size matches
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Laycan Timing</label>
                        <span className="text-sm">{Math.round(weights.laycan * 100)}%</span>
                      </div>
                      <Slider
                        value={[weights.laycan]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("laycan", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values prioritize closer laycan matches
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Freight Rate</label>
                        <span className="text-sm">{Math.round(weights.freightRate * 100)}%</span>
                      </div>
                      <Slider
                        value={[weights.freightRate]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("freightRate", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values prioritize competitive freight rates
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Geographic Proximity</label>
                        <span className="text-sm">{Math.round((weights as any).geographicProximity * 100 || 0)}%</span>
                      </div>
                      <Slider
                        value={[(weights as any).geographicProximity || 0]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("geographicProximity", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values prioritize exact or nearby port matches
                      </p>
                    </div>
                  </div>

                  {/* Advanced Criteria */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Advanced Criteria</h4>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Vessel Age</label>
                        <span className="text-sm">{Math.round((weights as any).vesselAge * 100 || 0)}%</span>
                      </div>
                      <Slider
                        value={[(weights as any).vesselAge || 0]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("vesselAge", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Higher values prioritize younger vessels</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Cargo Type Match</label>
                        <span className="text-sm">{Math.round((weights as any).cargoType * 100 || 0)}%</span>
                      </div>
                      <Slider
                        value={[(weights as any).cargoType || 0]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("cargoType", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values prioritize exact cargo type matches
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Historical Performance</label>
                        <span className="text-sm">
                          {Math.round((weights as any).historicalPerformance * 100 || 0)}%
                        </span>
                      </div>
                      <Slider
                        value={[(weights as any).historicalPerformance || 0]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("historicalPerformance", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Factor in historical rate trends and market data
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Port Efficiency</label>
                        <span className="text-sm">{Math.round((weights as any).portEfficiency * 100 || 0)}%</span>
                      </div>
                      <Slider
                        value={[(weights as any).portEfficiency || 0]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("portEfficiency", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Higher values prioritize efficient ports</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Charterer Reputation</label>
                        <span className="text-sm">{Math.round((weights as any).chartererReputation * 100 || 0)}%</span>
                      </div>
                      <Slider
                        value={[(weights as any).chartererReputation || 0]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => handleWeightChange("chartererReputation", value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values prioritize reputable charterers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Geographic Radius Settings */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-medium text-sm mb-4">Geographic Radius Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="geographic-radius"
                        checked={geographicRadius.enabled}
                        onCheckedChange={(checked) => setGeographicRadius((prev) => ({ ...prev, enabled: checked }))}
                      />
                      <Label htmlFor="geographic-radius">Enable radius search</Label>
                    </div>

                    {geographicRadius.enabled && (
                      <>
                        <div>
                          <Label className="text-sm">Search radius (km)</Label>
                          <Slider
                            value={[geographicRadius.radiusKm]}
                            min={50}
                            max={500}
                            step={25}
                            onValueChange={(value) => setGeographicRadius((prev) => ({ ...prev, radiusKm: value[0] }))}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{geographicRadius.radiusKm}km radius</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="prefer-exact"
                            checked={geographicRadius.preferExactMatch}
                            onCheckedChange={(checked) =>
                              setGeographicRadius((prev) => ({ ...prev, preferExactMatch: checked }))
                            }
                          />
                          <Label htmlFor="prefer-exact">Prefer exact matches</Label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Current Ranking Formula</h3>
                <p className="text-sm text-muted-foreground">
                  Score = (Vessel Size × {Math.round(weights.vesselSize * 100)}%) + (Laycan ×{" "}
                  {Math.round(weights.laycan * 100)}%) + (Freight Rate × {Math.round(weights.freightRate * 100)}%) +
                  (Region Match × {Math.round((weights as any).region * 100 || 0)}%) + (Geographic Proximity ×{" "}
                  {Math.round((weights as any).geographicProximity * 100 || 0)}%) + (Vessel Age ×{" "}
                  {Math.round((weights as any).vesselAge * 100 || 0)}%) + (Cargo Type Match ×{" "}
                  {Math.round((weights as any).cargoType * 100 || 0)}%) + (Historical Performance ×{" "}
                  {Math.round((weights as any).historicalPerformance * 100 || 0)}%) + (Port Efficiency ×{" "}
                  {Math.round((weights as any).portEfficiency * 100 || 0)}%) + (Charterer Reputation ×{" "}
                  {Math.round((weights as any).chartererReputation * 100 || 0)}%)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSaveSettings}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Region Preferences</CardTitle>
              <CardDescription>Set your preferred regions for cargo routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Add Preferred Region</label>
                  <div className="flex gap-2">
                    <Select onValueChange={handleAddRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region.name} value={region.name}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="secondary" type="button">
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Your Preferred Regions</h3>
                {preferredRegions.length > 0 ? (
                  <div className="space-y-2">
                    {preferredRegions.map((region) => (
                      <div key={region} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{region}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveRegion(region)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No preferred regions set. Add regions to prioritize offers from those areas.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setPreferredRegions([])}>
                Clear All
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Region preferences saved",
                    description: "Your region preferences have been updated.",
                  })
                }}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive updates about new offers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-process">Auto-process new emails</Label>
                    <p className="text-sm text-muted-foreground">Automatically process new emails as they arrive</p>
                  </div>
                  <Switch
                    id="auto-process"
                    checked={emailSettings.autoProcess}
                    onCheckedChange={(checked) => setEmailSettings((prev) => ({ ...prev, autoProcess: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="send-notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for new offers</p>
                  </div>
                  <Switch
                    id="send-notifications"
                    checked={emailSettings.sendNotifications}
                    onCheckedChange={(checked) => setEmailSettings((prev) => ({ ...prev, sendNotifications: checked }))}
                  />
                </div>

                {emailSettings.sendNotifications && (
                  <div>
                    <Label htmlFor="email-address">Email address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="your@email.com"
                      value={emailSettings.emailAddress}
                      onChange={(e) => setEmailSettings((prev) => ({ ...prev, emailAddress: e.target.value }))}
                      className="mt-1"
                      required={emailSettings.sendNotifications}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                    {emailSettings.sendNotifications && !emailSettings.emailAddress && (
                      <p className="text-xs text-red-500 mt-1">Email address is required for notifications</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Defaults
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Notification settings saved",
                    description: "Your notification preferences have been updated.",
                  })
                }}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Management</CardTitle>
              <CardDescription>Configure email scanning and input settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Email Scanner Setup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure automatic email scanning for vessel offers
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="scanner-enabled">Enable Email Scanner</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically scan incoming emails for vessel offers
                        </p>
                      </div>
                      <Switch id="scanner-enabled" />
                    </div>
                    <div>
                      <Label htmlFor="scanner-email">Scanner Email Address</Label>
                      <Input id="scanner-email" type="email" placeholder="scanner@yourcompany.com" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="scan-frequency">Scan Frequency</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="5min">Every 5 minutes</SelectItem>
                          <SelectItem value="15min">Every 15 minutes</SelectItem>
                          <SelectItem value="30min">Every 30 minutes</SelectItem>
                          <SelectItem value="1hour">Every hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Manual Email Input</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manually submit email content for analysis and vessel matching
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-content">Email Content</Label>
                      <textarea
                        id="email-content"
                        className="w-full mt-1 p-3 border rounded-md min-h-[120px] text-sm"
                        placeholder="Paste email content here for analysis..."
                      />
                    </div>
                    <Button className="w-full">Analyze Email Content</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset Email Settings</Button>
              <Button>Save Email Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
