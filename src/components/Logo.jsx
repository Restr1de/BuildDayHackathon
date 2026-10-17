import { Link } from 'react-router-dom'

// The ClearChoices logo. Clicking it goes back to the home page.
export default function Logo({ className = 'h-24' }) {
  return (
    <Link to="/" aria-label="ClearChoices, back to the home page" className="shrink-0">
      <img
        src="/logo.png"
        alt="ClearChoices: Compare Devices. Make Life Easier."
        className={`w-auto ${className}`}
      />
    </Link>
  )
}
