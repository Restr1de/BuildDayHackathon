import { Link } from 'react-router-dom'
import usePhones from '../hooks/usePhones.js'
import PhoneGrid from '../components/PhoneGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { categoryOf } from '../lib/filters.js'

export default function Home() {
  const { phones } = usePhones()
  const featured = phones.filter((p) => categoryOf(p) === 'phone').slice(0, 4)

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
      <PhoneGrid phones={featured} />
    </div>
  )
}
