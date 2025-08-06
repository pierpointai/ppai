"use client"

import { useState, useCallback } from "react"

export function useSimpleState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue)

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue)
  }, [])

  const resetValue = useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return [value, updateValue, resetValue] as const
}

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue((prev) => !prev), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse } as const
}

export function useSelection<T extends string | number>() {
  const [selected, setSelected] = useState<Set<T>>(new Set())

  const toggle = useCallback((item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(item)) {
        newSet.delete(item)
      } else {
        newSet.add(item)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((items: T[]) => {
    setSelected(new Set(items))
  }, [])

  const clear = useCallback(() => {
    setSelected(new Set())
  }, [])

  return { selected, toggle, selectAll, clear } as const
}
