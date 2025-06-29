import { PageLayout } from "@/components/page-layout"

export default function ReportsPage() {
  return (
    <PageLayout title="Reports" description="Generate and view market reports" requireAuth={false}>
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Market Reports</h2>
        <p className="text-muted-foreground">
          This page will allow you to generate custom reports on market conditions, vessel availability, and freight
          rates.
        </p>
      </div>
    </PageLayout>
  )
}
