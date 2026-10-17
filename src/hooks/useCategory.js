import { useLocation } from 'react-router-dom'
import { categoryFromPath } from '../lib/filters.js'

// 'phone' | 'tablet' | 'laptop', from the page you are on.
export default function useCategory() {
  return categoryFromPath(useLocation().pathname)
}
