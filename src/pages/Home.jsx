import { Link } from 'react-router-dom'
import { useDevicePage } from '../hooks/useDevices.js'
import PhoneGrid from '../components/PhoneGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { readFilters } from '../lib/filters.js'

// Home shows the first four phones, unfiltered.
const FEATURED = readFilters(new URLSearchParams())

export default function Home() {
  const { devices } = useDevicePage(FEATURED, 1, 4)

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold">Find the right phone, simply.</h1>
      <p className="mt-4 text-lg text-muted">
        Compare phones, tablets and laptops side by side with clear, easy-to-read information.
      </p>
      <div className="mt-6 mb-8 flex items-center justify-between gap-4">
        <Link to="/phones" className="shrink-0 rounded bg-primary px-6 py-3 text-lg text-on-primary hover:bg-primary-hover">
          Browse all devices
        </Link>
        <SearchBar className="w-full max-w-md" />
      </div>
      <PhoneGrid phones={devices} />
    </div>
  )
}
