"use client"

import { useEffect, useRef } from "react"

export function VesselHistoryChart({ vessel }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const dpr = window.devicePixelRatio || 1

    // Set canvas size accounting for device pixel ratio
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Generate mock speed data if not available
    const speedData = []
    const hours = 24

    // Start with current speed
    let lastSpeed = vessel.speed

    // Generate data for the last 24 hours
    for (let i = hours; i >= 0; i--) {
      // Add some random variation to create a realistic looking chart
      const variation = Math.random() * 2 - 1 // Random value between -1 and 1

      // Ensure speed doesn't go below 0 or above 30
      let newSpeed = Math.max(0, Math.min(30, lastSpeed + variation))

      // If vessel is anchored or moored, speed should be close to 0
      if (vessel.status === "anchored" || vessel.status === "moored") {
        newSpeed = Math.random() * 0.5
      }

      speedData.push({
        time: i,
        speed: newSpeed,
      })

      lastSpeed = newSpeed
    }

    // Find max speed for scaling
    const maxSpeed = Math.max(...speedData.map((d) => d.speed))
    const scaleFactor = (rect.height - 40) / (maxSpeed || 1)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw background
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid lines
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1

    // Draw horizontal grid lines
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = 20 + (rect.height - 40) * (i / gridLines)

      ctx.beginPath()
      ctx.moveTo(30, y)
      ctx.lineTo(rect.width - 10, y)
      ctx.stroke()

      // Draw speed labels
      const speedLabel = (((maxSpeed || 30) * (gridLines - i)) / gridLines).toFixed(1)
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(speedLabel, 25, y + 3)
    }

    // Draw time labels
    const timeLabels = [24, 18, 12, 6, 0]
    const timeStep = (rect.width - 40) / (timeLabels.length - 1)

    timeLabels.forEach((hour, i) => {
      const x = 30 + timeStep * i

      // Draw vertical grid line
      ctx.beginPath()
      ctx.moveTo(x, 20)
      ctx.lineTo(x, rect.height - 20)
      ctx.stroke()

      // Draw time label
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${hour}h`, x, rect.height - 8)
    })

    // Draw axis labels
    ctx.fillStyle = "#475569"
    ctx.font = "11px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Hours ago", rect.width / 2, rect.height - 5)

    ctx.save()
    ctx.translate(12, rect.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Speed (knots)", 0, 0)
    ctx.restore()

    // Draw speed line
    ctx.beginPath()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2

    speedData.forEach((d, i) => {
      const x = 30 + (rect.width - 40) * (1 - d.time / hours)
      const y = rect.height - 20 - d.speed * scaleFactor

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points on the line
    speedData.forEach((d, i) => {
      // Only draw every 4th point to avoid clutter
      if (i % 4 === 0) {
        const x = 30 + (rect.width - 40) * (1 - d.time / hours)
        const y = rect.height - 20 - d.speed * scaleFactor

        ctx.beginPath()
        ctx.fillStyle = "#ffffff"
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 1.5
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }, [vessel])

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
