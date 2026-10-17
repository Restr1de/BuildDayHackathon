import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDevicesByIds } from '../hooks/useDevices.js'
import { useCompare } from '../context/CompareContext.jsx'
import { SPEC_ROWS, specValue } from '../lib/specRows.js'
import { formatPrice, formatStorage } from '../lib/format.js'
import InfoTip from '../components/InfoTip.jsx'
import { amazonSearchUrl } from '../lib/amazon.js'

// Goes back to the page you came from (usually the phones list). If this page was opened directly,
// there is nothing to go back to, so it goes to the phones list instead.
function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/phones'))

  return (
    <button
      type="button"
      onClick={goBack}
      className="rounded-full bg-primary px-6 py-2 text-base font-semibold text-on-primary hover:bg-primary-hover"
    >
      Back
    </button>
  )
}

export default function Compare() {
  const { ids, remove, clear } = useCompare()
  const { devices: selected, loading, error } = useDevicesByIds(ids)

  if (error) return <p className="text-danger">Could not load phones: {error.message}</p>
  if (loading && selected.length === 0 && ids.length > 0) return <p>Loading…</p>

  if (selected.length === 0) {
    return (
      <div>
        <BackButton />
        <h1 className="sr-only">Compare</h1>
        <p className="mt-4 text-muted">
          You haven’t picked any phones yet. Press “+ Compare” on a phone to add it here.
        </p>
        <Link
          to="/phones"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-lg font-semibold text-on-primary hover:bg-primary-hover"
        >
          Browse phones
        </Link>
      </div>
    )
  }

  const rows = SPEC_ROWS.filter((r) => selected.some((p) => specValue(p, r) !== null))

  // One grid so every spec row lines up with its phone column.
  const gridStyle = {
    gridTemplateColumns: `10rem repeat(${selected.length}, minmax(11rem, 1fr))`,
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <BackButton />
        <h1 className="sr-only">Compare</h1>
        <button onClick={clear} className="text-base text-muted hover:underline">
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-sm">
        <div className="grid min-w-max" style={gridStyle}>
          {/* Row of phones */}
          <div className="border-b border-line" />
          {selected.map((p) => (
            <div key={p.$id} className="relative border-b border-l border-line p-3 text-center">
              <button
                onClick={() => remove(p.$id)}
                aria-label={`Remove ${p.name}`}
                title="Remove"
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-alt text-lg leading-none text-muted hover:bg-accent-soft hover:text-ink"
              >
                ×
              </button>
              <div className="h-44 bg-surface-alt">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-faint">No image</div>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold">
                <a
                  href={amazonSearchUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  title="Search for this on Amazon"
                  className="hover:text-primary hover:underline"
                >
                  {p.name}
                  <span className="sr-only"> (searches Amazon, opens in a new tab)</span>
                </a>
              </h2>
              {p.Storage && <p className="text-sm font-semibold text-muted">{formatStorage(p.Storage)}</p>}
              <p className="text-lg font-bold text-primary">{formatPrice(p)}</p>
            </div>
          ))}

          {/* Specs beneath, with a heading whenever the group changes */}
          {rows.map((row, i) => {
            const shade = i % 2 === 0 ? 'bg-surface' : 'bg-row-alt'
            const newGroup = i === 0 || rows[i - 1].group !== row.group
            return [
              newGroup && (
                <div
                  key={`group-${row.group}`}
                  className="col-span-full border-t border-line bg-group-row px-3 py-1.5 text-sm font-bold tracking-wide text-accent-soft-text uppercase"
                >
                  {row.group}
                </div>
              ),
              <div
                key={`${row.group}-${row.label}-label`}
                className={`flex items-center justify-between gap-1 px-3 py-3 text-sm font-semibold text-muted ${shade}`}
              >
                <span>{row.label}</span>
                {row.info && <InfoTip title={row.title ?? row.label}>{row.info}</InfoTip>}
              </div>,
              ...selected.map((p) => (
                <div key={`${row.group}-${row.label}-${p.$id}`} className={`border-l border-line px-3 py-3 text-center ${shade}`}>
                  {specValue(p, row) ?? '—'}
                </div>
              )),
            ]
          })}
        </div>
      </div>
    </div>
  )
}
