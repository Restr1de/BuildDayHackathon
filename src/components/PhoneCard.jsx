export default function PhoneCard({ phone, onSelect }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-xl font-semibold">{phone.name}</h3>
      <p className="text-slate-600">{phone.brand}</p>
      {onSelect && (
        <button
          onClick={() => onSelect(phone)}
          className="mt-3 rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Add to compare
        </button>
      )}
    </div>
  )
}
