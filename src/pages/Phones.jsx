import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useDevicePage } from '../hooks/useDevices.js'
import PhoneGrid from '../components/PhoneGrid.jsx'
import Logo from '../components/Logo.jsx'
import Pagination from '../components/Pagination.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import useCategory from '../hooks/useCategory.js'
import { CATEGORIES, pathFor, readFilters } from '../lib/filters.js'

const PAGE_SIZE = 24

export default function Phones() {
  const [params, setParams] = useSearchParams()
  const category = useCategory()
  const filters = readFilters(params, category)
  const label = CATEGORIES.find((c) => c.key === filters.category).label

  // The page number lives in the URL (?page=2). Changing search, category, filters or sort rebuilds
  // the URL without it, so those always start again at page 1.
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { devices, total, loading, error } = useDevicePage(filters, page, PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const goToPage = (n, replace = false) => {
    const next = new URLSearchParams(params)
    if (n <= 1) next.delete('page')
    else next.set('page', String(n))
    setParams(next, { replace })
    window.scrollTo({ top: 0 })
  }

  // A saved ?page=99 that no longer exists (fewer results now) moves to the last real page.
  useEffect(() => {
    if (!loading && !error && total > 0 && page > pageCount) goToPage(pageCount, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, total, page, pageCount])

  // Old links such as /phones?cat=tablet move to the page of that category (/tablets).
  const oldCat = CATEGORIES.find((c) => c.key === params.get('cat'))
  if (oldCat) {
    const rest = new URLSearchParams(params)
    rest.delete('cat')
    const query = rest.toString()
    return <Navigate to={`${oldCat.path}${query ? `?${query}` : ''}`} replace />
  }

  const noun = label.toLowerCase()
  const first = (page - 1) * PAGE_SIZE + 1

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Logo />
        {/* The page heading stays for screen readers and search engines. */}
        <h1 className="sr-only">{label}</h1>
        <SearchBar className="w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Sidebar className="shrink-0 md:w-64" />

        <div className="min-w-0 flex-1">
          {error && <p className="text-danger">Could not load {noun}: {error.message}</p>}
          {!error && devices.length === 0 && loading && <p>Loading…</p>}
          {!error && !(devices.length === 0 && loading) && (
            <>
              <p className="mb-3 text-base text-muted">
                {total} {total === 1 ? noun.replace(/s$/, '') : noun}
                {total > PAGE_SIZE && devices.length > 0 && ` · showing ${first}–${first + devices.length - 1}`}
              </p>
              {devices.length ? (
                <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`} aria-busy={loading}>
                  <PhoneGrid phones={devices} columns="grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]" />
                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    onChange={goToPage}
                    className="mt-6 justify-end"
                  />
                </div>
              ) : (
                !loading && <p className="text-muted">Nothing matches your search or filters.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
