import { useEffect, useState } from 'react'
import { useCompare } from '../context/CompareContext.jsx'
import { fetchBrands, fetchDevices, fetchDevicesByIds } from '../lib/devices.js'

// One page of devices for the current filters. While the next page loads, the previous one stays on screen.
export function useDevicePage(filters, page, pageSize) {
  const [state, setState] = useState({ devices: [], total: 0, loading: true, error: null })
  const key = JSON.stringify([filters, page, pageSize])

  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fetchDevices(filters, page, pageSize)
      .then((r) => live && setState({ devices: r.devices, total: r.total, loading: false, error: null }))
      .catch((error) => live && setState((s) => ({ ...s, loading: false, error })))
    return () => {
      live = false
    }
    // `key` stands for filters, page and pageSize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}

// The devices behind a list of ids (the comparison), in the same order.
export function useDevicesByIds(ids) {
  const { retain } = useCompare()
  const [state, setState] = useState({ devices: [], loading: ids.length > 0, error: null })
  const key = ids.join(',')

  useEffect(() => {
    let live = true
    if (!ids.length) {
      setState({ devices: [], loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    fetchDevicesByIds(ids)
      .then((devices) => {
        if (!live) return
        setState({ devices, loading: false, error: null })
        // Saved picks that are no longer in the database are forgotten.
        if (devices.length < ids.length) retain(devices.map((d) => d.$id))
      })
      .catch((error) => live && setState((s) => ({ ...s, loading: false, error })))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}

// Brands for the sidebar: [{ name, variants }]
export function useBrands(category) {
  const [brands, setBrands] = useState([])

  useEffect(() => {
    let live = true
    fetchBrands(category)
      .then((b) => live && setBrands(b))
      .catch(() => live && setBrands([]))
    return () => {
      live = false
    }
  }, [category])

  return brands
}
