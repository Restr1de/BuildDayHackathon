import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Phones from './pages/Phones.jsx'
import Compare from './pages/Compare.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/phones" element={<Phones />} />
        <Route path="/tablets" element={<Phones />} />
        <Route path="/laptops" element={<Phones />} />
        <Route path="/compare" element={<Compare />} />
      </Route>
    </Routes>
  )
}
