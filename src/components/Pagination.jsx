// Page numbers for a list: « Prev 1 … 4 5 6 … 38 Next »
function pageItems(page, pageCount) {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1])
  const nums = [...wanted].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b)
  const items = []
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) items.push('gap-' + n)
    items.push(n)
  })
  return items
}

const base = 'flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-base font-semibold'

export default function Pagination({ page, pageCount, onChange, className = '' }) {
  if (pageCount <= 1) return null

  return (
    <nav aria-label="Pagination" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${base} border-line bg-surface text-ink hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink`}
      >
        ‹ Prev
      </button>

      {pageItems(page, pageCount).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="px-1 text-muted" aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${base} ${
              item === page
                ? 'border-primary bg-primary text-on-primary'
                : 'border-line bg-surface text-ink hover:border-primary hover:text-primary'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className={`${base} border-line bg-surface text-ink hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink`}
      >
        Next ›
      </button>
    </nav>
  )
}
