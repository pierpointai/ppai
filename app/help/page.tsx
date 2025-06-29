import { PageLayout } from "@/components/page-layout"

export default function HelpPage() {
  return (
    <PageLayout title="Help & Support" description="Get assistance with using the platform" requireAuth={false}>
      <div className="rounded-lg border bg-card p-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">How do I scan emails for offers?</h3>
            <p className="text-muted-foreground mt-1">
              Navigate to the Email Scanner page and follow the instructions to connect your email account or manually
              paste email content.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I compare multiple offers?</h3>
            <p className="text-muted-foreground mt-1">
              Select multiple offers from the dashboard or email scanner, then click the "Compare" button to see a
              side-by-side comparison.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I add a new client?</h3>
            <p className="text-muted-foreground mt-1">
              Go to the Clients page and click the "Add Client" button. Fill in the required information and save.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Contact Support</h2>
        <p className="text-muted-foreground mb-4">Need additional help? Our support team is available to assist you.</p>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="font-medium w-24">Email:</span>
            <span>support@pierpointai.com</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium w-24">Phone:</span>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium w-24">Hours:</span>
            <span>Monday - Friday, 9:00 AM - 6:00 PM EST</span>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
