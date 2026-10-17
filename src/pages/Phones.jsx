import usePhones from '../hooks/usePhones.js'
import PhoneGrid from '../components/PhoneGrid.jsx'

export default function Phones() {
  const { phones, loading, error } = usePhones()

  if (loading) return <p>Loading…</p>
  if (error) return <p className="text-danger">Could not load phones: {error.message}</p>

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Phones</h1>
      <PhoneGrid phones={phones} />
    </div>
  )
}
