import { Link } from 'react-router-dom'
import { useDevicePage } from '../hooks/useDevices.js'
import CompareButton from '../components/CompareButton.jsx'
import PhoneGrid from '../components/PhoneGrid.jsx'
import { useCountry } from '../context/CountryContext.jsx'
import { readFilters } from '../lib/filters.js'

// Home shows the first four phones, unfiltered.
const FEATURED = readFilters(new URLSearchParams())

export default function Home() {
  const { country } = useCountry()
  const { devices } = useDevicePage({ ...FEATURED, country: country.key }, 1, 4)

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome to ClearChoices</h1>
        <p className="mt-3 text-lg text-muted">
          Compare phones, tablets and laptops side by side with clear, easy-to-read information.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/phones"
            className="block rounded bg-primary px-5 py-2.5 text-center text-base font-semibold text-on-primary hover:bg-primary-hover"
          >
            Browse all devices
          </Link>
          <CompareButton className="rounded px-5 py-2.5 text-base" />
        </div>
      </div>
      <section aria-label="Sponsored phones" className="relative rounded-xl border-2 border-primary p-4 pt-6">
        <span className="absolute -top-3.5 left-4 rounded-full bg-primary px-3 py-0.5 text-sm font-semibold text-on-primary">
          Sponsored
        </span>
        <PhoneGrid phones={devices} />
      </section>
    </div>
  )
}
