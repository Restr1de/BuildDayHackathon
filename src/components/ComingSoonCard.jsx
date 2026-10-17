import { Link } from 'react-router-dom'
import { CATEGORIES } from '../lib/filters.js'
import useCategory from '../hooks/useCategory.js'

// Shown in the results area for a category that has no devices yet (currently laptops).
export default function ComingSoonCard() {
  const category = useCategory()
  const current = CATEGORIES.find((c) => c.key === category)
  const others = CATEGORIES.filter((c) => !c.soon && c.key !== category)

  return (
    <div>
      <section className="mx-auto max-w-xl rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-14 w-14"
            aria-hidden="true"
          >
            <rect x="4" y="5" width="16" height="11" rx="1.5" />
            <path d="M2 19h20" />
          </svg>
        </div>

        <p className="mt-6 inline-block rounded-full bg-primary px-3 py-1 text-sm font-semibold tracking-wide text-on-primary uppercase">
          Coming soon
        </p>
        <h2 className="mt-4 text-3xl font-bold">{current?.label ?? 'This page'} are on their way</h2>
        <p className="mt-3 text-lg text-muted">
          We’re getting {current?.label.toLowerCase() ?? 'this section'} ready to compare, with the same clear,
          easy-to-read details as our phones and tablets. Check back soon.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {others.map((c, i) => (
            <Link
              key={c.key}
              to={c.path}
              className={`rounded px-6 py-3 text-lg font-semibold ${
                i === 0
                  ? 'bg-primary text-on-primary hover:bg-primary-hover'
                  : 'border-2 border-primary text-primary hover:bg-accent-soft'
              }`}
            >
              Browse {c.label.toLowerCase()}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
