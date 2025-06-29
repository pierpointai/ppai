"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw, Database, CheckCircle, AlertCircle, ExternalLink, Settings, Ship } from "lucide-react"
import { useSheetsVessels } from "@/hooks/use-sheety-vessels"
import { useOfferStore } from "@/lib/offer-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SheetsSyncPanelProps {
  onAddVessel?: () => void
  isAddingVessel?: boolean
}

export function SheetsSyncPanel({ onAddVessel, isAddingVessel = false }: SheetsSyncPanelProps) {
  const { isLoading, lastSync, error, syncFromSheets, testConnection } = useSheetsVessels()
  const { offers } = useOfferStore()
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  // Simulate progress during sync
  const handleSync = async () => {
    setSyncProgress(0)
    const progressInterval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await syncFromSheets()
      setSyncProgress(100)
      setTimeout(() => setSyncProgress(0), 1000)
    } catch (error) {
      setSyncProgress(0)
    } finally {
      clearInterval(progressInterval)
    }
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never synced"
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getSyncStatus = () => {
    if (error) return { color: "destructive", icon: AlertCircle, text: "Error" }
    if (lastSync) return { color: "default", icon: CheckCircle, text: "Connected" }
    return { color: "secondary", icon: Database, text: "Not synced" }
  }

  const status = getSyncStatus()

  return (
    <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-sm">Data Integration</span>
            </div>
            <Badge variant={status.color as any} className="flex items-center gap-1 text-xs px-2 py-0.5">
              <status.icon className="h-3 w-3" />
              {status.text}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Google Sheets Integration Setup</DialogTitle>
                  <DialogDescription>
                    Your vessel data is connected to Google Sheets for real-time updates.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Sheet Configuration</h3>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      https://api.sheety.co/de478b090979d21f75845c3c7fd62e47/testPpai/sheet1
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Required Column Headers</h3>
                    <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                      <p>
                        <strong>Vesselname</strong> - Name of the vessel
                      </p>
                      <p>
                        <strong>Type</strong> - Vessel type (Handysize, Panamax, etc.)
                      </p>
                      <p>
                        <strong>DWT</strong> - Deadweight tonnage in thousands
                      </p>
                      <p>
                        <strong>Built</strong> - Year built
                      </p>
                      <p>
                        <strong>flag</strong> - Flag state
                      </p>
                      <p>
                        <strong>openport</strong> - Current/open port
                      </p>
                      <p>
                        <strong>opendates</strong> - Available dates (e.g., "15-20 Jun")
                      </p>
                      <p>
                        <strong>nextport</strong> - Next port/destination
                      </p>
                      <p>
                        <strong>lastcargo</strong> - Last cargo carried
                      </p>
                      <p>
                        <strong>ballast</strong> - Ballast status (yes/no)
                      </p>
                      <p>
                        <strong>laden</strong> - Laden status
                      </p>
                      <p>
                        <strong>freightrate</strong> - Freight rate
                      </p>
                      <p>
                        <strong>commission</strong> - Commission percentage
                      </p>
                      <p>
                        <strong>imo</strong> - IMO number
                      </p>
                      <p>
                        <strong>brokername</strong> - Broker name
                      </p>
                      <p>
                        <strong>company</strong> - Company name
                      </p>
                      <p>
                        <strong>phonenumber</strong> - Contact phone
                      </p>
                      <p>
                        <strong>email</strong> - Contact email
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testConnection} disabled={isLoading} variant="outline" className="flex-1">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                    <Button
                      onClick={() => window.open("https://docs.google.com/spreadsheets", "_blank")}
                      variant="outline"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Sheets
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress bar when syncing */}
        {isLoading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span>Syncing vessel data...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-1.5" />
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">Sync Error</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error}</p>
          </div>
        )}

        {/* Stats and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{offers.length}</span>
              <span className="ml-1">vessels</span>
            </div>
            <div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formatLastSync(lastSync)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAddVessel && (
              <Button
                onClick={onAddVessel}
                disabled={isAddingVessel}
                size="sm"
                variant="outline"
                className="h-7 px-3 text-xs"
              >
                {isAddingVessel ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Adding
                  </>
                ) : (
                  <>
                    <Ship className="mr-1.5 h-3 w-3" />
                    Add Vessel Manually
                  </>
                )}
              </Button>
            )}

            <Button onClick={handleSync} disabled={isLoading} size="sm" className="h-7 px-3 text-xs">
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Syncing
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3 w-3" />
                  Sync
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
