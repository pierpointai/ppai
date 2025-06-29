"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/offer-utils"
import { CheckCircle2, DollarSign, Calendar, Ship, Award, Lightbulb } from "lucide-react"
import type { Offer } from "@/lib/types"

interface ComparisonRecommendationProps {
  offers: Offer[]
}

export function ComparisonRecommendation({ offers }: ComparisonRecommendationProps) {
  // Calculate recommendations
  const recommendations = useMemo(() => {
    if (offers.length < 2) {
      return {
        bestValueOffer: null,
        bestScheduleOffer: null,
        bestSpecOffer: null,
        bestAIMatchOffer: null,
      }
    }

    // Best value recommendation
    const bestValueOffer = findBestValueOffer(offers)

    // Best schedule recommendation
    const bestScheduleOffer = findBestScheduleOffer(offers)

    // Best specification recommendation
    const bestSpecOffer = findBestSpecOffer(offers)

    // Best AI match recommendation
    const bestAIMatchOffer = findBestAIMatchOffer(offers)

    return {
      bestValueOffer,
      bestScheduleOffer,
      bestSpecOffer,
      bestAIMatchOffer,
    }
  }, [offers])

  // Skip recommendations if we don't have enough offers
  if (offers.length < 2) {
    return null
  }

  // Get the overall best recommendation
  const overallRecommendation = getOverallRecommendation(recommendations, offers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Our Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Best Choice */}
        {overallRecommendation.offer && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-medium flex items-center mb-2">
              <Award className="h-5 w-5 mr-2 text-amber-500" />
              Best Overall Choice
            </h3>

            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Ship className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium">
                  {overallRecommendation.offer.vesselName ||
                    `${overallRecommendation.offer.vesselType} ${overallRecommendation.offer.vesselSize}k`}
                </h4>
                <p className="text-sm text-gray-500">
                  ${overallRecommendation.offer.freightRate} {overallRecommendation.offer.rateUnit} •
                  {overallRecommendation.offer.loadPort} → {overallRecommendation.offer.dischargePort}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{overallRecommendation.explanation}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {overallRecommendation.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Value */}
          {recommendations.bestValueOffer && (
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                Best Value
              </h4>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {recommendations.bestValueOffer.vesselName ||
                    `${recommendations.bestValueOffer.vesselType} ${recommendations.bestValueOffer.vesselSize}k`}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                ${recommendations.bestValueOffer.freightRate} {recommendations.bestValueOffer.rateUnit}
              </p>

              <p className="text-xs text-gray-600">
                {recommendations.bestValueOffer.freightRate < getAverageRate(offers)
                  ? `Rate is ${Math.round((1 - recommendations.bestValueOffer.freightRate / getAverageRate(offers)) * 100)}% below average.`
                  : "Best combination of price and specifications."}
              </p>
            </div>
          )}

          {/* Best Schedule */}
          {recommendations.bestScheduleOffer && (
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                Best Schedule
              </h4>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {recommendations.bestScheduleOffer.vesselName ||
                    `${recommendations.bestScheduleOffer.vesselType} ${recommendations.bestScheduleOffer.vesselSize}k`}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                {formatDate(recommendations.bestScheduleOffer.laycanStart, true)} -{" "}
                {formatDate(recommendations.bestScheduleOffer.laycanEnd, true)}
              </p>

              <p className="text-xs text-gray-600">
                {isEarliestLaycan(recommendations.bestScheduleOffer, offers)
                  ? "Earliest available laycan start with good flexibility."
                  : `${getLaycanDays(recommendations.bestScheduleOffer)} day window offers good flexibility.`}
              </p>
            </div>
          )}

          {/* Best Specifications */}
          {recommendations.bestSpecOffer && (
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Ship className="h-4 w-4 mr-1 text-gray-500" />
                Best Specifications
              </h4>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {recommendations.bestSpecOffer.vesselName ||
                    `${recommendations.bestSpecOffer.vesselType} ${recommendations.bestSpecOffer.vesselSize}k`}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                {recommendations.bestSpecOffer.vesselType} {recommendations.bestSpecOffer.vesselSize}k DWT
                {recommendations.bestSpecOffer.vesselAge !== undefined &&
                  ` • ${recommendations.bestSpecOffer.vesselAge} years`}
              </p>

              <p className="text-xs text-gray-600">
                {recommendations.bestSpecOffer.vesselAge !== undefined &&
                recommendations.bestSpecOffer.vesselAge < getAverageAge(offers)
                  ? `${Math.round(getAverageAge(offers) - recommendations.bestSpecOffer.vesselAge)} years newer than average.`
                  : "Superior vessel specifications for your cargo."}
              </p>
            </div>
          )}

          {/* Best AI Match */}
          {recommendations.bestAIMatchOffer && recommendations.bestAIMatchOffer.score !== undefined && (
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Award className="h-4 w-4 mr-1 text-gray-500" />
                Best AI Match
              </h4>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {recommendations.bestAIMatchOffer.vesselName ||
                    `${recommendations.bestAIMatchOffer.vesselType} ${recommendations.bestAIMatchOffer.vesselSize}k`}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                {Math.round(recommendations.bestAIMatchOffer.score * 100)}% compatibility score
              </p>

              <p className="text-xs text-gray-600">
                AI analysis indicates this is the best overall match for your requirements.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function findBestValueOffer(offers: Offer[]): Offer | null {
  if (offers.length === 0) return null

  // Calculate a value score for each offer
  const scoredOffers = offers.map((offer) => {
    // Start with base score
    let score = 100

    // Adjust for rate (lower is better)
    const avgRate = getAverageRate(offers)
    const rateRatio = offer.freightRate / avgRate
    score -= (rateRatio - 1) * 50 // Penalize higher rates

    // Adjust for vessel age if available (lower is better)
    if (offer.vesselAge !== undefined) {
      const avgAge = getAverageAge(offers)
      if (avgAge > 0) {
        const ageRatio = offer.vesselAge / avgAge
        score -= (ageRatio - 1) * 20 // Penalize older vessels
      }
    }

    // Adjust for vessel size (higher is better within reason)
    const avgSize = getAverageSize(offers)
    const sizeRatio = offer.vesselSize / avgSize
    score += (sizeRatio - 1) * 15 // Reward larger vessels

    // Adjust for AI score if available
    if (offer.score !== undefined) {
      score += offer.score * 25 // Add up to 25 points for perfect AI score
    }

    return { offer, score }
  })

  // Sort by score (highest first) and return the best offer
  scoredOffers.sort((a, b) => b.score - a.score)
  return scoredOffers[0].offer
}

function findBestScheduleOffer(offers: Offer[]): Offer | null {
  if (offers.length === 0) return null

  // Calculate a schedule score for each offer
  const scoredOffers = offers.map((offer) => {
    // Start with base score
    let score = 100

    // Prefer earlier laycan starts
    const earliestStart = Math.min(...offers.map((o) => o.laycanStart.getTime()))
    const daysFromEarliest = (offer.laycanStart.getTime() - earliestStart) / (1000 * 60 * 60 * 24)
    score -= daysFromEarliest * 2 // Penalize later starts

    // Prefer reasonable laycan windows (not too short, not too long)
    const laycanDays = getLaycanDays(offer)
    if (laycanDays < 5) {
      score -= (5 - laycanDays) * 5 // Penalize very short windows
    } else if (laycanDays > 15) {
      score -= (laycanDays - 15) * 2 // Slightly penalize very long windows
    }

    return { offer, score }
  })

  // Sort by score (highest first) and return the best offer
  scoredOffers.sort((a, b) => b.score - a.score)
  return scoredOffers[0].offer
}

function findBestSpecOffer(offers: Offer[]): Offer | null {
  if (offers.length === 0) return null

  // Calculate a specifications score for each offer
  const scoredOffers = offers.map((offer) => {
    // Start with base score
    let score = 100

    // Adjust for vessel size (higher is better)
    const avgSize = getAverageSize(offers)
    const sizeRatio = offer.vesselSize / avgSize
    score += (sizeRatio - 1) * 25 // Reward larger vessels

    // Adjust for vessel age if available (lower is better)
    if (offer.vesselAge !== undefined) {
      const avgAge = getAverageAge(offers)
      if (avgAge > 0) {
        const ageRatio = offer.vesselAge / avgAge
        score -= (ageRatio - 1) * 30 // Penalize older vessels
      }
    }

    return { offer, score }
  })

  // Sort by score (highest first) and return the best offer
  scoredOffers.sort((a, b) => b.score - a.score)
  return scoredOffers[0].offer
}

function findBestAIMatchOffer(offers: Offer[]): Offer | null {
  // Filter offers that have an AI score
  const scoredOffers = offers.filter((o) => o.score !== undefined)
  if (scoredOffers.length === 0) return null

  // Sort by AI score (highest first) and return the best offer
  return [...scoredOffers].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
}

function getAverageRate(offers: Offer[]): number {
  if (offers.length === 0) return 0
  return offers.reduce((sum, offer) => sum + offer.freightRate, 0) / offers.length
}

function getAverageAge(offers: Offer[]): number {
  const ages = offers.map((o) => o.vesselAge).filter((age): age is number => age !== undefined)
  if (ages.length === 0) return 0
  return ages.reduce((sum, age) => sum + age, 0) / ages.length
}

function getAverageSize(offers: Offer[]): number {
  if (offers.length === 0) return 0
  return offers.reduce((sum, offer) => sum + offer.vesselSize, 0) / offers.length
}

function getLaycanDays(offer: Offer): number {
  return Math.round((offer.laycanEnd.getTime() - offer.laycanStart.getTime()) / (1000 * 60 * 60 * 24))
}

function isEarliestLaycan(offer: Offer, allOffers: Offer[]): boolean {
  const earliestStart = Math.min(...allOffers.map((o) => o.laycanStart.getTime()))
  return offer.laycanStart.getTime() === earliestStart
}

function getOverallRecommendation(
  recommendations: {
    bestValueOffer: Offer | null
    bestScheduleOffer: Offer | null
    bestSpecOffer: Offer | null
    bestAIMatchOffer: Offer | null
  },
  offers: Offer[],
): { offer: Offer | null; explanation: string; strengths: string[] } {
  // Count how many times each vessel is recommended
  const recommendationCounts: Record<string, number> = {}

  if (recommendations.bestValueOffer) {
    recommendationCounts[recommendations.bestValueOffer.id] =
      (recommendationCounts[recommendations.bestValueOffer.id] || 0) + 2 // Value gets double weight
  }

  if (recommendations.bestScheduleOffer) {
    recommendationCounts[recommendations.bestScheduleOffer.id] =
      (recommendationCounts[recommendations.bestScheduleOffer.id] || 0) + 1
  }

  if (recommendations.bestSpecOffer) {
    recommendationCounts[recommendations.bestSpecOffer.id] =
      (recommendationCounts[recommendations.bestSpecOffer.id] || 0) + 1
  }

  if (recommendations.bestAIMatchOffer) {
    recommendationCounts[recommendations.bestAIMatchOffer.id] =
      (recommendationCounts[recommendations.bestAIMatchOffer.id] || 0) + 2 // AI match gets double weight
  }

  // Find the most recommended vessel
  let mostRecommendedId = ""
  let highestCount = 0

  Object.entries(recommendationCounts).forEach(([id, count]) => {
    if (count > highestCount) {
      mostRecommendedId = id
      highestCount = count
    }
  })

  // Get the most recommended vessel
  const mostRecommended = offers.find((o) => o.id === mostRecommendedId)

  if (!mostRecommended) {
    return {
      offer: null,
      explanation:
        "Based on the analysis, all vessels have different strengths. Consider your specific priorities when making a decision.",
      strengths: [],
    }
  }

  // Generate strengths list
  const strengths: string[] = []

  if (mostRecommended.id === recommendations.bestValueOffer?.id) {
    if (mostRecommended.freightRate < getAverageRate(offers)) {
      strengths.push(
        `Price is ${Math.round((1 - mostRecommended.freightRate / getAverageRate(offers)) * 100)}% below average`,
      )
    } else {
      strengths.push("Best overall value for money")
    }
  }

  if (mostRecommended.id === recommendations.bestScheduleOffer?.id) {
    if (isEarliestLaycan(mostRecommended, offers)) {
      strengths.push("Earliest available departure date")
    } else {
      strengths.push(`Flexible ${getLaycanDays(mostRecommended)}-day schedule window`)
    }
  }

  if (mostRecommended.id === recommendations.bestSpecOffer?.id) {
    if (mostRecommended.vesselAge !== undefined && mostRecommended.vesselAge < getAverageAge(offers)) {
      strengths.push(`${Math.round(getAverageAge(offers) - mostRecommended.vesselAge)} years newer than average`)
    }
    if (mostRecommended.vesselSize > getAverageSize(offers)) {
      strengths.push(`${Math.round((mostRecommended.vesselSize / getAverageSize(offers) - 1) * 100)}% larger capacity`)
    }
  }

  if (mostRecommended.id === recommendations.bestAIMatchOffer?.id && mostRecommended.score !== undefined) {
    strengths.push(`${Math.round(mostRecommended.score * 100)}% AI compatibility score`)
  }

  // If we don't have enough strengths, add some generic ones
  if (strengths.length < 2) {
    if (!strengths.some((s) => s.includes("price") || s.includes("value"))) {
      strengths.push("Competitive pricing")
    }
    if (!strengths.some((s) => s.includes("schedule") || s.includes("departure"))) {
      strengths.push("Suitable schedule")
    }
  }

  // Generate explanation text
  const explanation = `We recommend the ${mostRecommended.vesselName || `${mostRecommended.vesselType} ${mostRecommended.vesselSize}k`} vessel as your best option based on our analysis of price, schedule, and specifications.`

  return {
    offer: mostRecommended,
    explanation,
    strengths,
  }
}
