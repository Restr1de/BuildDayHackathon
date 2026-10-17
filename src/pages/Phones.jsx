import { useSearchParams } from 'react-router-dom'
import usePhones from '../hooks/usePhones.js'
import PhoneGrid from '../components/PhoneGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { CATEGORIES, applyFilters, readFilters } from '../lib/filters.js'

export default function Phones() {
  const { phones, loading, error } = usePhones()
  const [params] = useSearchParams()
  const filters = readFilters(params)
  const label = CATEGORIES.find((c) => c.key === filters.category).label

  const results = loading || error ? [] : applyFilters(phones, filters)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{label}</h1>
        <SearchBar className="w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Sidebar className="shrink-0 md:w-64" />

        <div className="min-w-0 flex-1">
          {loading && <p>Loading…</p>}
          {error && <p className="text-danger">Could not load {label.toLowerCase()}: {error.message}</p>}
          {!loading && !error && (
            <>
              <p className="mb-3 text-base text-muted">
                {results.length} {results.length === 1 ? label.toLowerCase().replace(/s$/, '') : label.toLowerCase()}
              </p>
              {results.length ? (
                <PhoneGrid phones={results} columns="grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]" />
              ) : (
                <p className="text-muted">Nothing matches your search or filters.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
