import { PageLayout } from "@/components/page-layout"

export default function PortsPage() {
  return (
    <PageLayout title="Ports" description="View port information and congestion data" requireAuth={false}>
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Port Database</h2>
        <p className="text-muted-foreground">
          This page will display port information, congestion data, and regional statistics.
        </p>
      </div>
    </PageLayout>
  )
}
