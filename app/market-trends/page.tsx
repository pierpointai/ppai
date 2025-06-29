import { PageLayout } from "@/components/page-layout"

export default function MarketTrendsPage() {
  return (
    <PageLayout title="Market Trends" description="Analyze current market trends and forecasts" requireAuth={false}>
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
        <p className="text-muted-foreground">
          This page will display current market trends, forecasts, and analysis for different vessel categories and
          trade routes.
        </p>
      </div>
    </PageLayout>
  )
}
