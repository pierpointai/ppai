import { PageLayout } from "@/components/page-layout"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <PageLayout title="Settings" description="Configure your application preferences and account settings">
      <SettingsForm />
    </PageLayout>
  )
}
