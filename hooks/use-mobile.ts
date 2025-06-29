"use client"

import React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px) and (max-width: 1023px)")
    const onChange = () => {
      setIsTablet(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setIsTablet(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isTablet
}
