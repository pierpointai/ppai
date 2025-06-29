import { PageLayout } from "@/components/page-layout"

export default function HistoricalDataPage() {
  return (
    <PageLayout title="Historical Data" description="View and analyze historical market data" requireAuth={false}>
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Historical Analysis</h2>
        <p className="text-muted-foreground">
          This page will provide access to historical freight rates, vessel positions, and market indices.
        </p>
      </div>
    </PageLayout>
  )
}
