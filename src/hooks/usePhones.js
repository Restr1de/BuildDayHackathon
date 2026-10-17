import { useEffect, useState } from 'react'
import { listPhones } from '../lib/phones.js'

export default function usePhones() {
  const [phones, setPhones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listPhones()
      .then(setPhones)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { phones, loading, error }
}
