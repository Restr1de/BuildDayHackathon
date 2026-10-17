import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useDevicePage } from '../hooks/useDevices.js'
import PhoneGrid from '../components/PhoneGrid.jsx'
import ComingSoonCard from '../components/ComingSoonCard.jsx'
import Logo from '../components/Logo.jsx'
import Pagination from '../components/Pagination.jsx'
import CompareButton from '../components/CompareButton.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import useCategory from '../hooks/useCategory.js'
import { useCountry } from '../context/CountryContext.jsx'
import { CATEGORIES, pathFor, readFilters } from '../lib/filters.js'

// How many devices to show per page. The choice is remembered in this browser.
const PER_PAGE_OPTIONS = [12, 24, 48, 96]
const DEFAULT_PER_PAGE = 24
const PER_PAGE_KEY = 'per-page'

function loadPerPage() {
  try {
    const saved = Number(localStorage.getItem(PER_PAGE_KEY))
    return PER_PAGE_OPTIONS.includes(saved) ? saved : DEFAULT_PER_PAGE
  } catch {
    return DEFAULT_PER_PAGE
  }
}

export default function Phones() {
  const [params, setParams] = useSearchParams()
  const category = useCategory()
  const { country } = useCountry()
  // The chosen country decides which launch price is shown, filtered and sorted.
  const filters = { ...readFilters(params, category), country: country.key }
  const [pageSize, setPageSize] = useState(loadPerPage)
  const current = CATEGORIES.find((c) => c.key === filters.category)
  const label = current.label

  // The page number lives in the URL (?page=2). Changing search, category, filters or sort rebuilds
  // the URL without it, so those always start again at page 1.
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { devices, total, loading, error } = useDevicePage(filters, page, pageSize)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const goToPage = (n, replace = false) => {
    const next = new URLSearchParams(params)
    if (n <= 1) next.delete('page')
    else next.set('page', String(n))
    setParams(next, { replace })
    window.scrollTo({ top: 0 })
  }

  const changePageSize = (n) => {
    setPageSize(n)
    try {
      localStorage.setItem(PER_PAGE_KEY, String(n))
    } catch {
      /* storage unavailable: the choice just won't be remembered */
    }
    // a different page size makes the old page number meaningless, so go back to page 1
    if (params.has('page')) {
      const next = new URLSearchParams(params)
      next.delete('page')
      setParams(next, { replace: true })
    }
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
  const first = (page - 1) * pageSize + 1

  return (
    <div>
      {/* Sticky header: stays at the top of the window while you scroll. The negative margins let its
          background run edge to edge across the page padding. */}
      {/* On a phone the search box gets its own full-width row, directly above the "Show categories & filters"
          button; from the md breakpoint up everything sits on one row. */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-page/95 px-4 py-2 backdrop-blur md:-mx-6 md:flex-nowrap md:gap-x-4 md:px-6">
        <Logo className="h-16 md:h-20" />
        {/* The page heading stays for screen readers and search engines. */}
        <h1 className="sr-only">{label}</h1>
        <SearchBar className="order-3 w-full md:order-2 md:ml-auto md:max-w-md md:flex-1" />
        <CompareButton className="order-2 ml-auto rounded-full px-4 py-2 text-base md:order-3 md:ml-0" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Sidebar className="shrink-0 md:w-64" />

        <div className="min-w-0 flex-1">
          {current.soon && <ComingSoonCard />}
          {!current.soon && error && <p className="text-danger">Could not load {noun}: {error.message}</p>}
          {!current.soon && !error && devices.length === 0 && loading && <p>Loading…</p>}
          {!current.soon && !error && !(devices.length === 0 && loading) && (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-base text-muted">
                  {total} {total === 1 ? noun.replace(/s$/, '') : noun}
                  {total > pageSize && devices.length > 0 && ` · showing ${first}–${first + devices.length - 1}`}
                </p>
                <label className="flex items-center gap-2 text-base text-muted">
                  Show
                  <select
                    value={pageSize}
                    onChange={(e) => changePageSize(Number(e.target.value))}
                    className="rounded border border-line bg-surface px-2 py-1 text-base text-ink outline-none focus:border-primary"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  per page
                </label>
              </div>
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
