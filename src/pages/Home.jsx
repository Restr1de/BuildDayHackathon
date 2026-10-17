import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold">Find the right phone, simply.</h1>
      <p className="mt-4 text-lg text-slate-700">
        Compare phones side by side with clear, easy-to-read information.
      </p>
      <Link to="/phones" className="mt-6 inline-block rounded bg-blue-700 px-6 py-3 text-lg text-white hover:bg-blue-800">
        Browse phones
      </Link>
    </div>
  )
}
