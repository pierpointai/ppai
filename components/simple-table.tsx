"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

type Column<T> = {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

type Props<T> = {
  data: T[]
  columns: Column<T>[]
  onAction?: (action: string, item: T) => void
}

export function SimpleTable<T>({ data, columns, onAction }: Props<T>) {
  return (
    <div className="border rounded">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left p-3">
                {col.label}
              </th>
            ))}
            {onAction && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-t hover:bg-muted/50">
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {col.render ? col.render(item) : String(item[col.key] || "")}
                </td>
              ))}
              {onAction && (
                <td className="p-3">
                  <Button size="sm" onClick={() => onAction("view", item)}>
                    View
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
