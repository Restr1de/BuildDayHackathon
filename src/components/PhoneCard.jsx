export default function PhoneCard({ phone, onSelect }) {
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
                className="shrink-0 whitespace-nowrap rounded-full bg-accent-soft px-1.5 py-0 text-[11px] leading-5 font-medium text-accent-soft-text"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-xl font-semibold">{phone.name}</h3>
        <p className="mt-1 text-lg font-bold text-primary">
          £{Number(phone.price).toFixed(2)}
        </p>
        {onSelect && (
          <button
            onClick={() => onSelect(phone)}
            className="mt-auto rounded bg-primary px-4 py-2 text-on-primary hover:bg-primary-hover"
          >
            Add to compare
          </button>
        )}
      </div>
    </div>
  )
}
