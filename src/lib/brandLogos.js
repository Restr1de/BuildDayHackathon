// Brand logos come from the Simple Icons service (https://simpleicons.org), as small SVGs in each brand's colour.
// A brand can also be [name, hex colour] to override the logo colour.
// Brands it doesn't have (Infinix, iQOO, POCO, Realme, Tecno, Amazon ...) simply have no entry here and the
// card shows the brand's first letter instead. Add a brand by putting its Simple Icons name below.
const SLUGS = {
  apple: 'apple',
  google: 'google',
  honor: 'honor',
  huawei: 'huawei',
  lenovo: 'lenovo',
  motorola: 'motorola',
  nokia: 'nokia',
  oneplus: 'oneplus',
  oppo: 'oppo',
  samsung: 'samsung',
  sony: ['sony', '000000'], // Simple Icons' own colour for Sony is white, which vanishes on a white card
  vivo: 'vivo',
  xiaomi: 'xiaomi',
  asus: 'asus',
}

// Logos kept in the project (public/brands) where the one-colour Simple Icons version isn't right.
const LOCAL = {
  google: '/brands/google.svg', // the four-colour "G"
}

export function brandLogoUrl(name) {
  const key = String(name ?? '').trim().toLowerCase()
  if (LOCAL[key]) return LOCAL[key]
  const entry = SLUGS[key]
  if (!entry) return null
  const [slug, color] = Array.isArray(entry) ? entry : [entry]
  return `https://cdn.simpleicons.org/${slug}${color ? `/${color}` : ''}`
}
