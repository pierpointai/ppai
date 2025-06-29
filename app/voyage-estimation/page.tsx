import { PageLayout } from "@/components/page-layout"
import { VoyageEstimationCalculator } from "@/components/voyage-estimation-calculator"

export default function VoyageEstimationPage() {
  return (
    <PageLayout
      title="Voyage Estimation"
      description="Quick TCE calculator for rapid voyage assessment during negotiations"
      requireAuth={true}
    >
      <VoyageEstimationCalculator />
    </PageLayout>
  )
}
