import type React from "react"
export type Entity = {
  id: string
  [key: string]: any
}

export type Filter<T> = (item: T) => boolean
export type Sorter<T> = (a: T, b: T) => number
export type Mapper<T, U> = (item: T) => U

export type TableConfig<T> = {
  data: T[]
  columns: Array<{
    key: string
    label: string
    render?: (item: T) => React.ReactNode
  }>
  actions?: Array<{
    label: string
    onClick: (item: T) => void
    icon?: React.ReactNode
  }>
}

export type CardConfig = {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
}
