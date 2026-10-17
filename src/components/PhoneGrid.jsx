import PhoneCard from './PhoneCard.jsx'

export default function PhoneGrid({ phones, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {phones.map((p) => (
        <PhoneCard key={p.$id} phone={p} onSelect={onSelect} />
      ))}
    </div>
  )
}
