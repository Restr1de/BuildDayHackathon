import { Link } from 'react-router-dom'
import usePhones from '../hooks/usePhones.js'
import { useCompare } from '../context/CompareContext.jsx'
import AddPhonePicker from '../components/AddPhonePicker.jsx'

// Rows shown under the devices, in order. `key` reads from device.specs.
// A row is hidden when none of the compared devices has a value for it.
const SPEC_ROWS = [
  { key: 'year', label: 'Released' },
  { key: 'screen', label: 'Screen' },
  { key: 'chip', label: 'Processor' },
  { key: 'memory', label: 'Memory (RAM)' },
  { key: 'storage', label: 'Storage' },
  { key: 'battery', label: 'Battery' },
  { key: 'camera', label: 'Camera' },
  { key: 'weight', label: 'Weight' },
  { key: 'unlock', label: 'Unlock with' },
  { key: 'charging', label: 'Charging' },
  { key: 'os', label: 'Software' },
]

function BackLink() {
  return (
    <Link to="/phones" className="mb-2 inline-block text-base text-primary hover:underline">
      ← Back to phones
    </Link>
  )
}

export default function Compare() {
  const { phones, loading, error } = usePhones()
  const { ids, remove, clear } = useCompare()

  if (loading) return <p>Loading…</p>
  if (error) return <p className="text-danger">Could not load phones: {error.message}</p>

  // Keep the order phones were added in.
  const selected = ids.map((id) => phones.find((p) => p.$id === id)).filter(Boolean)

  if (selected.length === 0) {
    return (
      <div>
        <BackLink />
        <h1 className="text-3xl font-bold">Compare</h1>
        <p className="mt-2 text-muted">
          You haven’t picked any phones yet. Press “+ Compare” on a phone to add it here.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <AddPhonePicker phones={phones} />
          <Link to="/phones" className="text-base text-primary hover:underline">
            or browse all phones
          </Link>
        </div>
      </div>
    )
  }

  const rows = SPEC_ROWS.filter((r) => selected.some((p) => p.specs?.[r.key]))

  // One grid so every spec row lines up with its phone column.
  const gridStyle = {
    gridTemplateColumns: `8rem repeat(${selected.length}, minmax(11rem, 1fr))`,
  }

  return (
    <div>
      <BackLink />
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Compare</h1>
        <div className="flex items-center gap-4">
          <button onClick={clear} className="text-base text-muted hover:underline">
            Clear all
          </button>
          <AddPhonePicker phones={phones} />
        </div>
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
              <h2 className="mt-3 text-lg font-semibold">{p.name}</h2>
              <p className="text-lg font-bold text-primary">£{Number(p.price).toFixed(2)}</p>
            </div>
          ))}

          {/* Specs beneath */}
          {rows.map((row, i) => {
            const shade = i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'
            return [
              <div key={`${row.key}-label`} className={`px-3 py-3 text-sm font-semibold text-muted ${shade}`}>
                {row.label}
              </div>,
              ...selected.map((p) => (
                <div key={`${row.key}-${p.$id}`} className={`border-l border-line px-3 py-3 text-center ${shade}`}>
                  {p.specs?.[row.key] ?? '—'}
                </div>
              )),
            ]
          })}
        </div>
      </div>
    </div>
  )
}
