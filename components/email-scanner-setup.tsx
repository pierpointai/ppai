"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, Save, Server, Clock, Lock, Folder, CheckCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { EmailConfig } from "@/lib/email-scanner"
import { getEmailScanner } from "@/lib/email-scanner"
import { useOfferStore } from "@/lib/offer-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { ResponsiveCard } from "@/components/responsive-card"
import { PageContainer } from "@/components/page-container"
import { ResponsiveTabs } from "@/components/responsive-tabs"

export function EmailScannerSetup() {
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionSuccess, setConnectionSuccess] = useState(false)
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    server: "",
    port: 993,
    username: "",
    password: "",
    folder: "INBOX",
    useSSL: true,
    scanInterval: 15,
  })
  const [useMockData, setUseMockData] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { addOffer } = useOfferStore()
  const isMobile = useIsMobile()

  const handleConfigChange = (key: keyof EmailConfig, value: any) => {
    setEmailConfig((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Reset connection success when config changes
    if (connectionSuccess) {
      setConnectionSuccess(false)
    }
  }

  const handleTestConnection = async () => {
    if (useMockData) {
      // Use mock data for demonstration
      setIsTestingConnection(true)

      try {
        // Simulate connection test
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setConnectionSuccess(true)

        toast({
          title: "Connection successful",
          description: "Successfully connected to the PierPoint AI mock email server.",
        })
      } catch (error) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to the mock email server.",
          variant: "destructive",
        })
      } finally {
        setIsTestingConnection(false)
      }
      return
    }

    // In a real app, this would test the actual connection
    if (!emailConfig.server || !emailConfig.username || !emailConfig.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields: server, username, and password.",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionSuccess(false)

    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setConnectionSuccess(true)

      toast({
        title: "Connection successful",
        description: `Successfully connected to ${emailConfig.server} as ${emailConfig.username}.`,
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsConfiguring(true)

    try {
      // In a real app, this would save the configuration to a database
      // For this demo, we'll just initialize the email scanner

      // Use mock data for demonstration
      const config: EmailConfig = useMockData
        ? {
            server: "mail.pierpointai.com",
            port: 993,
            username: "scanner@pierpointai.com",
            password: "password",
            folder: "INBOX",
            useSSL: true,
            scanInterval: 15,
          }
        : emailConfig

      const scanner = getEmailScanner(config)

      // Set up callback for new offers
      scanner.onNewOffers((offers) => {
        offers.forEach((offer) => {
          addOffer(offer)

          toast({
            title: "New offer found",
            description: `${offer.vesselType} ${offer.vesselSize}k from ${offer.loadPort} to ${offer.dischargePort}`,
          })
        })
      })

      // Start automatic scanning
      scanner.startAutomaticScanning()

      toast({
        title: "Email scanner configured",
        description: `Automatic scanning set up. Checking every ${config.scanInterval} minutes.`,
      })

      // Navigate to dashboard
      router.push("/")
    } catch (error) {
      toast({
        title: "Configuration failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsConfiguring(false)
    }
  }

  const tabs = [
    {
      id: "config",
      label: "Email Configuration",
      icon: <Server className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Server Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="server" className="text-sm font-medium">
                  Email Server
                </Label>
                <Input
                  id="server"
                  placeholder="mail.pierpointai.com"
                  value={emailConfig.server}
                  onChange={(e) => handleConfigChange("server", e.target.value)}
                  aria-required="true"
                  aria-invalid={isConfiguring && !emailConfig.server ? "true" : "false"}
                />
                {isConfiguring && !emailConfig.server && (
                  <p className="text-xs text-red-500">Server address is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="993"
                  value={emailConfig.port}
                  onChange={(e) => handleConfigChange("port", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Authentication
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email Address</Label>
                <Input
                  id="username"
                  placeholder="scanner@pierpointai.com"
                  value={emailConfig.username}
                  onChange={(e) => handleConfigChange("username", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={emailConfig.password}
                  onChange={(e) => handleConfigChange("password", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Scanning Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="folder">Folder to Scan</Label>
                <div className="flex gap-2">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="folder"
                    placeholder="INBOX"
                    value={emailConfig.folder}
                    onChange={(e) => handleConfigChange("folder", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">Scan Interval</Label>
                <Select
                  value={emailConfig.scanInterval?.toString()}
                  onValueChange={(value) => handleConfigChange("scanInterval", Number.parseInt(value))}
                >
                  <SelectTrigger id="interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="useSSL"
                checked={emailConfig.useSSL}
                onCheckedChange={(checked) => handleConfigChange("useSSL", checked)}
              />
              <Label htmlFor="useSSL">Use SSL/TLS encryption</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              variant={connectionSuccess ? "outline" : "secondary"}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : connectionSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Connection Verified
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "mock",
      label: "Use Mock Data",
      icon: <Mail className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="rounded-md border-2 border-primary/20 p-4 md:p-6 bg-primary/5">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <Mail className="h-10 w-10 md:h-12 md:w-12 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-lg md:text-xl mb-3">Use Mock Email Scanner</h3>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  For demonstration purposes, you can use our mock email scanner that simulates connecting to an email
                  server and finding cargo offers in emails.
                </p>
                <p className="text-muted-foreground text-sm md:text-base">
                  The mock scanner will periodically "find" new cargo offers and add them to your dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Simulation Settings
            </h3>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="mockInterval">Simulation Interval</Label>
              <Select
                value={emailConfig.scanInterval?.toString()}
                onValueChange={(value) => handleConfigChange("scanInterval", Number.parseInt(value))}
              >
                <SelectTrigger id="mockInterval">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute (for demo)</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This controls how often the mock scanner will simulate finding new offers.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              variant={connectionSuccess ? "outline" : "secondary"}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : connectionSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Connection Verified
                </>
              ) : (
                "Test Mock Connection"
              )}
            </Button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <PageContainer withHeader padding={isMobile ? "sm" : "md"}>
      <div className="w-full max-w-3xl mx-auto">
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        <ResponsiveCard
          title={
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>Email Scanner Setup</span>
            </div>
          }
          description="Configure automatic scanning of emails for cargo offers"
          mobileClassName="rounded-xl shadow-sm"
          mobilePadding="sm"
          desktopPadding="md"
        >
          <ResponsiveTabs
            tabs={tabs}
            defaultValue={useMockData ? "mock" : "config"}
            onValueChange={(value) => setUseMockData(value === "mock")}
            fullWidthTabs
            tabsListClassName="mb-6"
          />
        </ResponsiveCard>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.push("/")} className={isMobile ? "px-3" : ""}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={isConfiguring || (!connectionSuccess && !useMockData)}
            className={isMobile ? "px-3" : ""}
          >
            {isConfiguring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save & Activate
              </>
            )}
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
