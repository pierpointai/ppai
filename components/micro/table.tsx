"use client"

import { Button } from "@/components/ui/button"
import type { TableConfig } from "@/lib/micro/types"

export function MicroTable<T>({ data, columns, actions }: TableConfig<T>) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left p-3 font-medium">
                {col.label}
              </th>
            ))}
            {actions && <th className="text-left p-3 font-medium">Actions</th>}
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
              {actions && (
                <td className="p-3">
                  <div className="flex gap-1">
                    {actions.map((action, j) => (
                      <Button key={j} variant="ghost" size="sm" onClick={() => action.onClick(item)}>
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
