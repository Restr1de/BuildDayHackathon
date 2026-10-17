import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY, countryByKey } from '../lib/countries.js'

const STORAGE_KEY = 'country'
const CountryContext = createContext(null)

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return COUNTRIES.some((c) => c.key === saved) ? saved : DEFAULT_COUNTRY
  } catch {
    return DEFAULT_COUNTRY
  }
}

// The chosen country, remembered in this browser. Everything that shows a price reads it from here.
export function CountryProvider({ children }) {
  const [key, setKey] = useState(load)

  const setCountry = useCallback((next) => {
    setKey(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable: the choice just won't be remembered */
    }
  }, [])

  const value = useMemo(() => ({ country: countryByKey(key), setCountry }), [key, setCountry])
  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
}

export function useCountry() {
  const ctx = useContext(CountryContext)
  if (!ctx) throw new Error('useCountry must be used inside <CountryProvider>')
  return ctx
}
