import { PageLayout } from "@/components/page-layout"
import { EmailInputForm } from "@/components/email-input-form"

export default function EmailInputPage() {
  return (
    <PageLayout title="Email Input" description="Submit email content for analysis and vessel matching">
      <EmailInputForm />
    </PageLayout>
  )
}
