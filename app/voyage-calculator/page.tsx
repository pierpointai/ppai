import { PageLayout } from "@/components/page-layout"
import { VoyageCalculator } from "@/components/voyage-calculator"

export default function VoyageCalculatorPage() {
  return (
    <PageLayout
      title="Voyage Calculator"
      description="Professional voyage estimation and P&L calculator for dry cargo vessels"
      requireAuth={true}
    >
      <VoyageCalculator />
    </PageLayout>
  )
}
