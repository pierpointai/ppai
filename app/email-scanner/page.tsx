import { PageLayout } from "@/components/page-layout"
import { EmailScannerSetup } from "@/components/email-scanner-setup"

export default function EmailScannerPage() {
  return (
    <PageLayout title="Email Scanner Setup" description="Configure automatic email scanning for vessel offers">
      <EmailScannerSetup />
    </PageLayout>
  )
}
