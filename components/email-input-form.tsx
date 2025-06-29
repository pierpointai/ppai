"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_EMAILS } from "@/lib/mock-data"
import { parseEmailToOffer, rankOffers } from "@/lib/offer-utils"
import { useOfferStore } from "@/lib/offer-store"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Upload, FileText, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function EmailInputForm() {
  const [emailContent, setEmailContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const { setOffers } = useOfferStore()

  const handleUseMockData = () => {
    setEmailContent(MOCK_EMAILS.join("\n\n"))
  }

  const simulateProcessing = async () => {
    setProcessingProgress(0)
    setProcessingStatus("Analyzing email content...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(20)
    setProcessingStatus("Extracting vessel details...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(40)
    setProcessingStatus("Identifying cargo information...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(60)
    setProcessingStatus("Parsing laycan dates...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(80)
    setProcessingStatus("Calculating freight rates...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(100)
    setProcessingStatus("Ranking offers...")
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const handleProcessEmails = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "No content to process",
        description: "Please enter email content or use mock data.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate AI processing with visual feedback
      await simulateProcessing()

      // Split the content by double newlines to separate emails
      const emails = emailContent.split(/\n\n+/).filter((email) => email.trim())
      const parsedOffers = []

      for (const email of emails) {
        const offer = parseEmailToOffer(email)
        if (offer) {
          // Add the raw email to the offer
          offer.rawEmail = email
          parsedOffers.push(offer)
        }
      }

      if (parsedOffers.length === 0) {
        toast({
          title: "No valid offers found",
          description: "Could not extract any valid offers from the provided content. Check the format and try again.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Rank the offers
      const rankedOffers = rankOffers(parsedOffers)

      // Update the store
      setOffers(rankedOffers)

      toast({
        title: "Offers processed successfully",
        description: `Extracted ${rankedOffers.length} offer${rankedOffers.length === 1 ? "" : "s"} from your emails.`,
      })

      // Redirect to dashboard
      router.push("/")
    } catch (error) {
      console.error("Error processing emails:", error)
      toast({
        title: "Error processing emails",
        description: "An error occurred while processing your emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStatus("")
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Email Input</CardTitle>
        <CardDescription>Paste email content or use mock data to extract cargo offers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste">
          <TabsList className="mb-4">
            <TabsTrigger value="paste">Paste Emails</TabsTrigger>
            <TabsTrigger value="mock">Use Mock Data</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>
          <TabsContent value="paste">
            <Textarea
              placeholder="Paste email content here..."
              className="min-h-[300px] font-mono text-sm"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="mock">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use our sample data to test the AI extraction capabilities.
              </p>
              <div className="bg-muted/10 p-4 rounded-md text-sm font-mono normal-font whitespace-pre-wrap border border-muted">
                <div className="whitespace-pre-wrap">{MOCK_EMAILS.join("\n\n")}</div>
              </div>
              <Button onClick={handleUseMockData}>Use This Mock Data</Button>
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Upload Email Files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop email files (.eml, .txt) or click to browse
              </p>
              <input
                type="file"
                id="email-file"
                accept=".eml,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setEmailContent(event.target.result.toString())
                      }
                    }
                    reader.readAsText(file)
                  }
                }}
              />
              <Button onClick={() => document.getElementById("email-file")?.click()}>
                <FileText className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{processingStatus}</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setEmailContent("")} disabled={isProcessing}>
          Clear
        </Button>
        <Button onClick={handleProcessEmails} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Process Emails
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
