import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useBrands, useDevicesByIds } from '../hooks/useDevices.js'
import { appwriteConfigured } from '../lib/appwrite.js'
import { displayName } from '../lib/format.js'
import { useCompare } from '../context/CompareContext.jsx'
import {
  CATEGORIES,
  SCREEN_SIZES,
  SORTS,
  activeFilterCount,
  buildSearch,
  readFilters,
} from '../lib/filters.js'

function CategoryIcon({ type }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'h-7 w-7 shrink-0',
    'aria-hidden': true,
  }
  if (type === 'tablet')
    return (
      <svg {...common}>
        <rect x="4" y="2.5" width="16" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </svg>
    )
  if (type === 'laptop')
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="11" rx="1.5" />
        <path d="M2 19h20" />
      </svg>
    )
  return (
    <svg {...common}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </svg>
  )
}

function Section({ title, children }) {
  return (
    <section className="border-t border-line pt-4">
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  )
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5 text-base capitalize">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  )
}

const inputCls =
  'w-full rounded border border-line bg-surface px-2 py-1 text-base text-ink outline-none focus:border-primary'

export default function Sidebar({ className = '' }) {
  const [params, setParams] = useSearchParams()
  const { ids, remove } = useCompare()
  const [mobileOpen, setMobileOpen] = useState(false)

  const f = readFilters(params)
  const count = activeFilterCount(f)
  const label = CATEGORIES.find((c) => c.key === f.category).label

  const update = (patch) =>
    setParams(new URLSearchParams(buildSearch({ ...f, ...patch })), { replace: true })

  const toggle = (key, value) =>
    update({ [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] })

  const brands = useBrands(f.category).map((b) => b.name)
  const { devices: picked } = useDevicesByIds(ids)
  const currency = appwriteConfigured ? '$' : '£'

  const selectCategory = (key) =>
    update({ category: key, brands: [], screens: [], min: '', max: '' })

  return (
    <aside className={className}>
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        className="mb-3 w-full rounded-lg border border-line bg-surface px-4 py-2 text-left text-base font-semibold md:hidden"
      >
        {mobileOpen ? 'Hide' : 'Show'} categories &amp; filters{count ? ` (${count})` : ''}
      </button>

      <div className={`${mobileOpen ? 'block' : 'hidden'} space-y-4 md:block`}>
        {/* Category switcher */}
        <div className="grid grid-cols-1 gap-2" role="group" aria-label="Category">
          {CATEGORIES.map((c) => {
            const active = c.key === f.category
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => selectCategory(c.key)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-lg font-semibold ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-surface text-ink hover:border-primary hover:text-primary'
                }`}
              >
                <CategoryIcon type={c.key} />
                {c.label}
              </button>
            )
          })}
        </div>

        <Section title="Sort by">
          <select
            value={f.sort}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sort by"
            className={inputCls}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </Section>

        <Section title="Brand">
          {brands.map((b) => (
            <Check key={b} label={b} checked={f.brands.includes(b)} onChange={() => toggle('brands', b)} />
          ))}
          {brands.length === 0 && <p className="text-sm text-muted">No brands yet.</p>}
        </Section>

        <Section title={`Price (${currency})`}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min"
              aria-label="Minimum price"
              value={f.min}
              onChange={(e) => update({ min: e.target.value })}
              className={inputCls}
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max"
              aria-label="Maximum price"
              value={f.max}
              onChange={(e) => update({ max: e.target.value })}
              className={inputCls}
            />
          </div>
        </Section>

        <Section title="Screen size">
          {SCREEN_SIZES.map((s) => (
            <Check key={s} label={s} checked={f.screens.includes(s)} onChange={() => toggle('screens', s)} />
          ))}
        </Section>

        {count > 0 && (
          <button
            type="button"
            onClick={() => update({ brands: [], screens: [], min: '', max: '' })}
            className="text-base text-primary hover:underline"
          >
            Clear all filters ({count})
          </button>
        )}

        <Section title="Your comparison">
          {picked.length === 0 ? (
            <p className="text-sm text-muted">
              Press “+ Compare” on any {label.toLowerCase().replace(/s$/, '')} to add it here.
            </p>
          ) : (
            <>
              <ul className="mb-3 space-y-1">
                {picked.map((p) => (
                  <li key={p.$id} className="flex items-center justify-between gap-2 text-base">
                    <span className="truncate">{displayName(p)}</span>
                    <button
                      type="button"
                      onClick={() => remove(p.$id)}
                      aria-label={`Remove ${p.name}`}
                      className="shrink-0 rounded-full px-2 text-lg leading-none text-muted hover:bg-accent-soft hover:text-ink"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                to="/compare"
                className="block rounded-lg bg-primary px-4 py-2 text-center text-base font-semibold text-on-primary hover:bg-primary-hover"
              >
                Compare now ({picked.length})
              </Link>
            </>
          )}
        </Section>
      </div>
    </aside>
  )
}
