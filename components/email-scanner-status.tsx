"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw, AlertCircle, CheckCircle, PauseCircle, PlayCircle, Mail, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getEmailScanner, type ScanStatus } from "@/lib/email-scanner"
import { useOfferStore } from "@/lib/offer-store"
import { cn } from "@/lib/utils"

export function EmailScannerStatus() {
  const [status, setStatus] = useState<ScanStatus>({
    lastScan: null,
    isScanning: false,
    totalScanned: 0,
    offersFound: 0,
    error: null,
  })
  const [isActive, setIsActive] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const { addOffer } = useOfferStore()

  // Update status periodically
  useEffect(() => {
    try {
      const scanner = getEmailScanner()
      setStatus(scanner.getStatus())

      const interval = setInterval(() => {
        setStatus(scanner.getStatus())
      }, 5000)

      return () => clearInterval(interval)
    } catch (error) {
      // Scanner not initialized yet
      console.log("Email scanner not initialized")
    }
  }, [])

  const handleManualScan = async () => {
    try {
      setRefreshing(true)
      const scanner = getEmailScanner()
      const newOffers = await scanner.scanEmails()

      setStatus(scanner.getStatus())

      if (newOffers.length > 0) {
        toast({
          title: "Scan complete",
          description: `Found ${newOffers.length} new offer(s)`,
        })

        // Add offers to store
        newOffers.forEach((offer) => addOffer(offer))
      } else {
        toast({
          title: "Scan complete",
          description: "No new offers found",
        })
      }
    } catch (error) {
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const toggleScanner = () => {
    try {
      const scanner = getEmailScanner()

      if (isActive) {
        scanner.stopAutomaticScanning()
        toast({
          title: "Scanner paused",
          description: "Automatic email scanning has been paused",
        })
      } else {
        scanner.startAutomaticScanning()
        toast({
          title: "Scanner activated",
          description: "Automatic email scanning has been started",
        })
      }

      setIsActive(!isActive)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const getTimeAgo = (date: Date | null) => {
    if (!date) return "Never"

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)

    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`
  }

  return (
    <Card className="border-l-4 border-l-primary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="tracking-tight">Email Scanner</CardTitle>
              <CardDescription>Automatic scanning for cargo offers in emails</CardDescription>
            </div>
          </div>
          <Badge
            variant={isActive ? "default" : "outline"}
            className={cn(
              "px-3 py-1 rounded-full transition-all",
              isActive ? "bg-green-500/20 text-green-700 hover:bg-green-500/20 dark:text-green-400" : "",
            )}
          >
            {isActive ? (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </span>
            ) : (
              "Paused"
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.error && (
          <Alert variant="destructive" className="rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {status.error}
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  try {
                    const scanner = getEmailScanner()
                    scanner.scanEmails()
                    toast({
                      title: "Retry initiated",
                      description: "Attempting to scan emails again.",
                    })
                  } catch (error) {
                    toast({
                      title: "Retry failed",
                      description: "Could not restart the scanner. Please check your configuration.",
                      variant: "destructive",
                    })
                  }
                }}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {status.isScanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scanning emails...</span>
              <span className="font-medium">In progress</span>
            </div>
            <div className="relative">
              <Progress value={45} className="h-2 rounded-full" />
              <div
                className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full animate-pulse"
                style={{ animationDuration: "1.5s" }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Last Scan</span>
            </div>
            <p className="font-medium">{status.lastScan ? getTimeAgo(status.lastScan) : "Never"}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1 hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>Emails Scanned</span>
            </div>
            <p className="font-medium">{status.totalScanned}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1 hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Offers Found</span>
            </div>
            <p className="font-medium">{status.offersFound}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1 hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span>Status</span>
            </div>
            <div className="flex items-center gap-2">
              {status.isScanning ? (
                <p className="font-medium text-amber-600 dark:text-amber-400">Scanning</p>
              ) : (
                <p className="font-medium text-green-600 dark:text-green-400">Ready</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-sm border border-border/50 backdrop-blur-sm">
          <p className="text-muted-foreground">
            {isActive
              ? "The email scanner is actively monitoring your inbox for new cargo offers. Any offers found will be automatically added to your dashboard."
              : "The email scanner is currently paused. No new emails will be scanned until you resume the scanner."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-muted/10">
        <Button
          variant="outline"
          onClick={toggleScanner}
          className={!isActive ? "border-green-500 text-green-600" : ""}
        >
          {isActive ? (
            <>
              <PauseCircle className="mr-2 h-4 w-4" />
              Pause Scanner
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Resume Scanner
            </>
          )}
        </Button>

        <Button
          onClick={handleManualScan}
          disabled={refreshing || status.isScanning}
          className="relative overflow-hidden"
        >
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Now
            </>
          )}
          {(refreshing || status.isScanning) && (
            <span className="absolute bottom-0 left-0 h-1 bg-white/20 animate-progress"></span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
