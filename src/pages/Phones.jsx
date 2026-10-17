import usePhones from '../hooks/usePhones.js'
import PhoneCard from '../components/PhoneCard.jsx'

export default function Phones() {
  const { phones, loading, error } = usePhones()

  if (loading) return <p>Loading…</p>
  if (error) return <p className="text-red-700">Could not load phones: {error.message}</p>

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Phones</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {phones.map((p) => <PhoneCard key={p.$id} phone={p} />)}
      </div>
    </div>
  )
}
