import { useCompare } from '../context/CompareContext.jsx'
import { formatPrice } from '../lib/format.js'

export default function PhoneCard({ phone }) {
  const { has, toggle, isFull } = useCompare()
  const selected = has(phone.$id)
  const blocked = isFull && !selected

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
      <div className="h-64 w-full bg-surface-alt">
        {phone.imageUrl ? (
          <img
            src={phone.imageUrl}
            alt={phone.name}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-faint">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {phone.tags?.length > 0 && (
          <ul className="mb-2 flex h-6 flex-wrap gap-1 overflow-hidden">
            {phone.tags.map((tag) => (
              <li
                key={tag}
                className="grow shrink-0 whitespace-nowrap rounded-full text-center bg-accent-soft px-1 py-0 text-[11px] leading-5 font-medium text-accent-soft-text"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-xl font-semibold">{phone.name}</h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-primary">
            {formatPrice(phone)}
          </p>
          <button
            onClick={() => toggle(phone.$id)}
            aria-pressed={selected}
            disabled={blocked}
            title={blocked ? 'You can compare up to 4 phones' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full border border-primary px-2 py-0.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
              selected
                ? 'bg-primary text-on-primary'
                : 'text-primary hover:bg-accent-soft'
            }`}
          >
            + Compare
          </button>
        </div>
      </div>
    </div>
  )
}
