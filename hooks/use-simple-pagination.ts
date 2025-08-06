"use client"

import { useState, useMemo } from "react"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

export function useSimplePagination<T>(items: T[], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = items.slice(startIndex, endIndex)
    const totalPages = Math.ceil(items.length / pageSize)

    return {
      paginatedItems,
      totalPages,
      totalItems: items.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, items.length),
      currentPage,
      pageSize,
    }
  }, [items, currentPage, pageSize])

  const actions = {
    setPage: setCurrentPage,
    setPageSize: (size: number) => {
      setPageSize(size)
      setCurrentPage(1)
    },
  }

  return { ...paginationData, ...actions }
}
