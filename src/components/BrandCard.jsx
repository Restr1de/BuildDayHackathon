import { useState } from 'react'
import { brandLogoUrl } from '../lib/brandLogos.js'

// A selectable card: the brand's logo above its name. Without a logo it shows the brand's first letter.
export default function BrandCard({ name, selected, onToggle }) {
  const url = brandLogoUrl(name)
  const [failed, setFailed] = useState(false)

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-3 text-center ${
        selected
          ? 'border-primary bg-accent-soft'
          : 'border-line bg-surface hover:border-primary'
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center">
        {url && !failed ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="max-h-9 max-w-9 object-contain"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt text-lg font-bold text-muted"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="text-sm leading-tight font-semibold text-ink">{name}</span>
    </button>
  )
}
