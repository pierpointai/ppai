"use client"

import { useState, useMemo, useCallback, useEffect } from "react"

interface UsePaginationProps<T> {
  items: T[]
  initialPageSize?: number
}

export function usePagination<T>({ items, initialPageSize = 25 }: UsePaginationProps<T>) {
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
    }
  }, [items, currentPage, pageSize])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  return {
    ...paginationData,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  }
}
