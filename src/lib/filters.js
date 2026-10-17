// Filter state lives in the URL (?cat=&q=&brand=&min=&max=&screen=&sort=) so it can be shared and survives refresh.

export const CATEGORIES = [
  { key: 'phone', label: 'Phones', singular: 'phone', path: '/phones' },
  { key: 'tablet', label: 'Tablets', singular: 'tablet', path: '/tablets' },
  { key: 'laptop', label: 'Laptops', singular: 'laptop', path: '/laptops', soon: true },
]

// Each category has its own page (/phones, /tablets, /laptops); anywhere else (Home, Compare) counts as phones.
export function categoryFromPath(pathname) {
  return CATEGORIES.find((c) => pathname === c.path || pathname.startsWith(c.path + '/'))?.key ?? 'phone'
}

export function pathFor(category) {
  return (CATEGORIES.find((c) => c.key === category) ?? CATEGORIES[0]).path
}

export const SORTS = [
  { key: '', label: 'Recommended' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'newest', label: 'Newest first' },
]

export const SCREEN_SIZES = ['small', 'medium', 'large']

// [max inches for "small", max inches for "medium"] - anything bigger is "large".
export const SCREEN_CUTOFFS = {
  phone: [5.5, 6.5],
  tablet: [9, 11],
  laptop: [13, 15],
}

export function categoryOf(item) {
  return item.category ?? 'phone'
}

export function screenCategory(inches, category = 'phone') {
  const [small, medium] = SCREEN_CUTOFFS[category] ?? SCREEN_CUTOFFS.phone
  if (inches < small) return 'small'
  if (inches <= medium) return 'medium'
  return 'large'
}

// The category comes from the page (see categoryFromPath); everything else comes from the address's ?query.
export function readFilters(params, category = 'phone') {
  return {
    category,
    q: (params.get('q') ?? '').trim(),
    brands: params.getAll('brand'),
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    screens: params.getAll('screen'),
    sort: SORTS.some((s) => s.key === params.get('sort')) ? params.get('sort') : '',
  }
}

// Number of narrowing filters in use (category, search text and sort don't count).
export function activeFilterCount(f) {
  return f.brands.length + f.screens.length + (f.min !== '') + (f.max !== '')
}

export function applyFilters(items, f) {
  const q = f.q.toLowerCase()
  const list = items.filter((p) => {
    if (categoryOf(p) !== f.category) return false
    if (q && ![p.name, ...(p.tags ?? [])].join(' ').toLowerCase().includes(q)) return false
    if (f.brands.length && !f.brands.includes(p.brand)) return false
    if ((f.min !== '' || f.max !== '') && p.price == null) return false
    if (f.min !== '' && p.price < Number(f.min)) return false
    if (f.max !== '' && p.price > Number(f.max)) return false
    if (f.screens.length && (p.screenInches == null || !f.screens.includes(screenCategory(p.screenInches, f.category)))) return false
    return true
  })

  const year = (p) => Number(p.specs?.year ?? p.launchYear) || 0
  // Devices with no price always sort last.
  const priceKey = (p, missing) => (p.price == null ? missing : p.price)
  if (f.sort === 'price-asc') list.sort((a, b) => priceKey(a, Infinity) - priceKey(b, Infinity))
  if (f.sort === 'price-desc') list.sort((a, b) => priceKey(b, -Infinity) - priceKey(a, -Infinity))
  if (f.sort === 'newest') list.sort((a, b) => year(b) - year(a))
  return list
}

export function buildSearch({ q, brands, min, max, screens, sort }) {
  const p = new URLSearchParams()
  if (q) p.set('q', q)
  brands.forEach((b) => p.append('brand', b))
  if (min !== '') p.set('min', min)
  if (max !== '') p.set('max', max)
  screens.forEach((s) => p.append('screen', s))
  if (sort) p.set('sort', sort)
  const str = p.toString()
  return str ? `?${str}` : ''
}
