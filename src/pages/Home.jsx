import { Link } from 'react-router-dom'
import usePhones from '../hooks/usePhones.js'
import PhoneGrid from '../components/PhoneGrid.jsx'

export default function Home() {
  const { phones } = usePhones()

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold">Find the right phone, simply.</h1>
      <p className="mt-4 text-lg text-muted">
        Compare phones side by side with clear, easy-to-read information.
      </p>
      <Link to="/phones" className="mt-6 mb-8 inline-block rounded bg-primary px-6 py-3 text-lg text-on-primary hover:bg-primary-hover">
        Browse all phones
      </Link>
      <PhoneGrid phones={phones.slice(0, 4)} />
    </div>
  )
}
