"use client"

import { useEffect, useRef } from "react"
import { Chart as ChartJS, registerables } from "chart.js"
import type { ChartData } from "@/lib/types"
import { useTheme } from "next-themes"

ChartJS.register(...registerables)

interface ChartProps {
  type: "bar" | "line" | "pie" | "doughnut"
  data: ChartData
  options?: any
}

export function Chart({ type, data, options = {} }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Set chart colors based on theme
    const textColor = theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
    const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    // Create new chart
    chartInstance.current = new ChartJS(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales:
          type !== "pie" && type !== "doughnut"
            ? {
                x: {
                  grid: {
                    color: gridColor,
                  },
                  ticks: {
                    color: textColor,
                  },
                },
                y: {
                  grid: {
                    color: gridColor,
                  },
                  ticks: {
                    color: textColor,
                  },
                },
              }
            : undefined,
        ...options,
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [type, data, options, theme])

  return <canvas ref={chartRef} />
}
