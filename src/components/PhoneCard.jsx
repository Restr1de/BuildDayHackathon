import { useState } from 'react'
import { useCompare } from '../context/CompareContext.jsx'
import { formatMoney, formatPrice, formatStorage } from '../lib/format.js'

export default function PhoneCard({ phone }) {
  const { has, toggle, remove, isFull } = useCompare()

  // A model with several storage sizes is one card; the pills pick the size (and so the price).
  // `variants` is [{ id, storage, price }] sorted from the smallest size; without it the card is just itself.
  const variants = phone.variants?.length > 1 ? phone.variants : null
  const inComparison = (variants ?? [{ id: phone.$id }]).find((v) => has(v.id))
  const [chosen, setChosen] = useState(null)
  const current =
    variants?.find((v) => v.id === (inComparison?.id ?? chosen)) ?? variants?.[0] ?? null

  const activeId = current?.id ?? phone.$id
  const price = current ? formatMoney(current.price, phone.currency) : formatPrice(phone)
  const selected = Boolean(inComparison)
  const blocked = isFull && !selected

  const pick = (variant) => {
    setChosen(variant.id)
    // If this model is already being compared, switch that entry to the size just picked.
    if (inComparison && inComparison.id !== variant.id) {
      remove(inComparison.id)
      toggle(variant.id)
    }
  }

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
        <p className="mt-1 text-lg font-bold text-primary">{price}</p>

        {variants && (
          <div className="mt-3" role="group" aria-label="Storage size">
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Storage</p>
            <ul className="flex flex-wrap gap-1.5">
              {variants.map((v) => {
                const active = v.id === current.id
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => pick(v)}
                      aria-pressed={active}
                      className={`rounded-full border px-2.5 py-0.5 text-sm font-semibold ${
                        active
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-line bg-surface text-ink hover:border-primary hover:text-primary'
                      }`}
                    >
                      {formatStorage(v.storage) || '—'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Pinned to the bottom of the card, so the buttons line up across a row of cards. */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => toggle(activeId)}
            aria-pressed={selected}
            disabled={blocked}
            title={blocked ? 'You can compare up to 4 phones' : undefined}
            className={`w-full rounded-lg border-2 border-primary px-4 py-2 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? 'bg-primary text-on-primary' : 'text-primary hover:bg-accent-soft'
            }`}
          >
            + Compare
          </button>
        </div>
      </div>
    </div>
  )
}
