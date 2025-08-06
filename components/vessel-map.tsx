"use client"

import { useEffect, useRef } from "react"

interface VesselMapProps {
  vessels: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    status: string
  }>
  onVesselSelect: (vessel: any) => void
}

export function VesselMap({ vessels, onVesselSelect }: VesselMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    // Simple drawing logic
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      ctx.fillStyle = "#e5f6fd"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Vessels
      vessels.forEach((vessel) => {
        if (vessel.latitude === 0 && vessel.longitude === 0) return

        const x = (vessel.longitude + 180) * (canvas.width / 360)
        const y = (90 - vessel.latitude) * (canvas.height / 180)

        // Bounds checking
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return

        ctx.fillStyle = vessel.status === "underway" ? "#22c55e" : "#6b7280"
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    canvas.width = rect.width
    canvas.height = rect.height
    draw()

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Find clicked vessel
      const clicked = vessels.find((vessel) => {
        if (vessel.latitude === 0 && vessel.longitude === 0) return false

        const vx = (vessel.longitude + 180) * (canvas.width / 360)
        const vy = (90 - vessel.latitude) * (canvas.height / 180)
        const distance = Math.sqrt((x - vx) ** 2 + (y - vy) ** 2)
        return distance < 10
      })

      if (clicked) onVesselSelect(clicked)
    }

    canvas.addEventListener("click", handleClick)
    return () => canvas.removeEventListener("click", handleClick)
  }, [vessels, onVesselSelect])

  return (
    <div className="relative w-full h-[400px]">
      <canvas ref={canvasRef} className="w-full h-full border rounded" />
    </div>
  )
}
