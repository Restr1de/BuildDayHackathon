import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext.jsx'

export default function CompareButton({ className = 'rounded-full px-4 py-2 text-base' }) {
  const { ids } = useCompare()

  return (
    <Link
      to="/compare"
      className={`flex shrink-0 items-center justify-center gap-1.5 bg-primary font-semibold text-on-primary hover:bg-primary-hover ${className}`}
    >
      Compare
      {ids.length > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-on-primary px-1 text-xs font-bold text-primary">
          {ids.length}
        </span>
      )}
    </Link>
  )
}
