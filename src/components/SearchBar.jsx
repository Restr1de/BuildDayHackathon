import { useNavigate, useSearchParams } from 'react-router-dom'
import useCategory from '../hooks/useCategory.js'
import { buildSearch, pathFor, readFilters } from '../lib/filters.js'

// Just the search box. The Compare button is separate, so a page can place the two independently.
export default function SearchBar({ className = '' }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const category = useCategory()
  const filters = readFilters(params, category)

  const onSubmit = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q').trim()
    navigate(`${pathFor(category)}${buildSearch({ ...filters, q })}`)
  }

  return (
    <form onSubmit={onSubmit} role="search" className={`relative min-w-0 ${className}`}>
      <button
        type="submit"
        aria-label="Search"
        className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted hover:text-primary"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      <input
        key={filters.q}
        name="q"
        type="search"
        defaultValue={filters.q}
        placeholder="Search"
        aria-label="Search"
        className="w-full rounded-full border border-line bg-surface py-2 pr-4 pl-10 text-base text-ink placeholder:text-faint outline-none focus:border-primary focus:ring-2 focus:ring-primary"
      />
    </form>
  )
}
