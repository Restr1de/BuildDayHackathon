import PhoneCard from './PhoneCard.jsx'

export default function PhoneGrid({ phones, columns = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {phones.map((p) => (
        <PhoneCard key={p.$id} phone={p} />
      ))}
    </div>
  )
}
