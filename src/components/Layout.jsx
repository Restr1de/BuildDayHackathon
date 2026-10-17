import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <main className="mx-auto max-w-[110rem] px-4 py-4 md:px-6">
        <Outlet />
      </main>
    </div>
  )
}
