"use client"

import { useEffect, useRef } from "react"

export function VesselMap({ vessels, onVesselSelect }) {
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

    // Draw map background
    ctx.fillStyle = "#e5f6fd"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid lines
    ctx.strokeStyle = "#cce5ee"
    ctx.lineWidth = 1

    // Draw horizontal grid lines
    for (let y = 0; y < rect.height; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw vertical grid lines
    for (let x = 0; x < rect.width; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    // Draw some landmasses (simplified)
    ctx.fillStyle = "#d4e6c3"

    // Draw a continent
    ctx.beginPath()
    ctx.moveTo(rect.width * 0.1, rect.height * 0.2)
    ctx.lineTo(rect.width * 0.3, rect.height * 0.1)
    ctx.lineTo(rect.width * 0.4, rect.height * 0.3)
    ctx.lineTo(rect.width * 0.3, rect.height * 0.5)
    ctx.lineTo(rect.width * 0.1, rect.height * 0.4)
    ctx.closePath()
    ctx.fill()

    // Draw an island
    ctx.beginPath()
    ctx.arc(rect.width * 0.7, rect.height * 0.3, 30, 0, Math.PI * 2)
    ctx.fill()

    // Draw another landmass
    ctx.beginPath()
    ctx.moveTo(rect.width * 0.6, rect.height * 0.7)
    ctx.lineTo(rect.width * 0.8, rect.height * 0.6)
    ctx.lineTo(rect.width * 0.9, rect.height * 0.8)
    ctx.lineTo(rect.width * 0.7, rect.height * 0.9)
    ctx.closePath()
    ctx.fill()

    // Draw vessels
    vessels.forEach((vessel, index) => {
      // Calculate position based on vessel coordinates
      // This is a simplified mapping - in a real app, you'd use proper geo mapping
      const x = (vessel.longitude + 180) * (rect.width / 360)
      const y = (90 - vessel.latitude) * (rect.height / 180)

      // Skip vessels with 0,0 coordinates (offline)
      if (vessel.latitude === 0 && vessel.longitude === 0) return

      // Draw vessel
      ctx.beginPath()

      // Different colors based on vessel status
      switch (vessel.status) {
        case "underway":
          ctx.fillStyle = "#22c55e" // green
          break
        case "anchored":
          ctx.fillStyle = "#eab308" // yellow
          break
        case "moored":
          ctx.fillStyle = "#3b82f6" // blue
          break
        default:
          ctx.fillStyle = "#6b7280" // gray
      }

      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Draw vessel name
      ctx.fillStyle = "#000000"
      ctx.font = "10px sans-serif"
      ctx.fillText(vessel.name, x + 10, y + 4)
    })

    // Handle click events
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr

      // Check if a vessel was clicked
      vessels.forEach((vessel) => {
        const vesselX = (vessel.longitude + 180) * (rect.width / 360) * dpr
        const vesselY = (90 - vessel.latitude) * (rect.height / 180) * dpr

        // Skip vessels with 0,0 coordinates (offline)
        if (vessel.latitude === 0 && vessel.longitude === 0) return

        // Calculate distance between click and vessel
        const distance = Math.sqrt(Math.pow(vesselX - x, 2) + Math.pow(vesselY - y, 2))

        // If click is close enough to vessel, select it
        if (distance < 10 * dpr) {
          onVesselSelect(vessel)
        }
      })
    }

    canvas.addEventListener("click", handleClick)

    return () => {
      canvas.removeEventListener("click", handleClick)
    }
  }, [vessels, onVesselSelect])

  return (
    <div className="relative w-full h-[600px] bg-slate-100 dark:bg-slate-800">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" style={{ width: "100%", height: "100%" }} />
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 p-3 rounded-md shadow-md text-xs">
        <div className="font-medium mb-2">Vessel Status</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Underway</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span>Anchored</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Moored</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
          <span>Offline</span>
        </div>
      </div>
    </div>
  )
}
