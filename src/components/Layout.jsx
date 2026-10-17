import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="bg-primary text-on-primary">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">Phone Compare</Link>
          <div className="flex gap-6 text-lg">
            <Link to="/phones" className="hover:underline">Phones</Link>
            <Link to="/compare" className="hover:underline">Compare</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  )
}
