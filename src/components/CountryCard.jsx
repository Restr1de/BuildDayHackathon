import { useState } from 'react'
import { flagUrl } from '../lib/countries.js'

// A selectable card: the country's flag above its name and currency. Choose one; prices follow it.
export default function CountryCard({ country, selected, onSelect }) {
  const [failed, setFailed] = useState(false)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 px-1 py-2.5 text-center ${
        selected ? 'border-primary bg-accent-soft' : 'border-line bg-surface hover:border-primary'
      }`}
    >
      {failed ? (
        <span
          aria-hidden="true"
          className="flex h-7 w-10 items-center justify-center rounded bg-surface-alt text-sm font-bold text-muted"
        >
          {country.flag.toUpperCase()}
        </span>
      ) : (
        <img
          src={flagUrl(country)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-6 w-9 rounded-sm border border-line object-cover"
        />
      )}
      <span className="text-xs leading-tight font-semibold text-ink">{country.label}</span>
      <span className="text-[11px] font-medium text-muted">{country.currency}</span>
    </button>
  )
}
