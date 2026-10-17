import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const MAX_COMPARE = 4
const STORAGE_KEY = 'compare-ids'

const CompareContext = createContext(null)

function load() {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(ids) ? ids.slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      /* storage unavailable: selection just won't persist */
    }
  }, [ids])

  const toggle = useCallback(
    (id) =>
      setIds((cur) => {
        if (cur.includes(id)) return cur.filter((x) => x !== id)
        return cur.length >= MAX_COMPARE ? cur : [...cur, id]
      }),
    [],
  )
  const remove = useCallback((id) => setIds((cur) => cur.filter((x) => x !== id)), [])
  const clear = useCallback(() => setIds([]), [])
  // Drops ids that no longer exist in the database (for example after the data was re-imported).
  const retain = useCallback(
    (found) => setIds((cur) => (cur.every((id) => found.includes(id)) ? cur : cur.filter((id) => found.includes(id)))),
    [],
  )

  const value = useMemo(
    () => ({ ids, toggle, remove, clear, retain, has: (id) => ids.includes(id), isFull: ids.length >= MAX_COMPARE }),
    [ids, toggle, remove, clear, retain],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used inside <CompareProvider>')
  return ctx
}
