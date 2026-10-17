import { useEffect, useRef, useState } from 'react'
import { MAX_COMPARE, useCompare } from '../context/CompareContext.jsx'
import { formatPrice } from '../lib/format.js'

// "+ Add phone" button that opens a searchable list of phones to add to the comparison.
export default function AddPhonePicker({ phones }) {
  const { has, toggle, isFull, ids } = useCompare()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const results = phones.filter((p) =>
    !q || [p.name, ...(p.tags ?? [])].join(' ').toLowerCase().includes(q),
  )

  const pick = (id) => {
    toggle(id)
    // Close once the comparison is full so the next step is obvious.
    if (ids.length + 1 >= MAX_COMPARE && !has(id)) setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={isFull}
        title={isFull ? `You can compare up to ${MAX_COMPARE} phones` : undefined}
        className="rounded-full bg-primary px-4 py-1.5 text-base font-semibold text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add phone
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Add a phone"
          className="absolute right-0 z-20 mt-2 w-80 max-w-[85vw] rounded-lg border border-line bg-surface p-3 shadow-lg"
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search devices to add"
            className="w-full rounded-full border border-line bg-surface px-4 py-2 text-base text-ink placeholder:text-faint outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
          <ul className="mt-2 max-h-72 overflow-y-auto">
            {results.map((p) => {
              const added = has(p.$id)
              return (
                <li key={p.$id}>
                  <button
                    type="button"
                    onClick={() => pick(p.$id)}
                    className="flex w-full items-center gap-3 rounded px-2 py-1.5 text-left hover:bg-accent-soft"
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-12 w-8 shrink-0 object-contain" />
                    ) : (
                      <span className="h-12 w-8 shrink-0 rounded bg-surface-alt" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium">{p.name}</span>
                      <span className="block text-sm text-primary">{formatPrice(p)}</span>
                    </span>
                    {added && <span className="text-sm font-semibold text-muted">Added ✓</span>}
                  </button>
                </li>
              )
            })}
            {results.length === 0 && (
              <li className="px-2 py-3 text-base text-muted">No phones match.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
