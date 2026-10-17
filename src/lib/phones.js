import { screenCategory } from './filters.js'
import { countryByKey } from './countries.js'

// Photos we have locally (public/phones), keyed by model name without the storage size.
export const LOCAL_PHOTOS = {
  'iphone 16 plus': '/phones/iphone-16-plus.png',
  'iphone 16': '/phones/iphone-16.png',
  'iphone 15 pro': '/phones/iphone-15-pro.png',
  'iphone 15': '/phones/iphone-15.png',
  'iphone 14': '/phones/iphone-14.png',
  'iphone 13': '/phones/iphone-13.png',
  'iphone 12': '/phones/iphone-12.png',
}

export const withoutStorage = (model) =>
  String(model ?? '').replace(/\s*\d+\s*(gb|tb)\s*$/i, '').trim().toLowerCase()

// The dataset has no category column, so tablets are recognised by name.
export const looksLikeTablet = (model) => /\b(ipad|tab|tablet|pad|matepad)\b/i.test(String(model ?? ''))

const present = (v) => v !== undefined && v !== null && v !== ''
const pick = (doc, keys) => keys.map((k) => doc[k]).find(present)

// "6.1", 6.1 or "6.1 inches" -> 6.1; anything unusable -> null
function toNumber(v) {
  if (!present(v)) return null
  const n = Number(String(v).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

// A model's storage options, written by scripts/group-variants.mjs onto its primary row:
// '[{"id":"…","storage":128,"price":799,"prices":{"usa":799,"india":79999,…}}, …]'. Null when there are none.
function parseVariants(raw) {
  if (!raw) return null
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(list) && list.length ? list : null
  } catch {
    return null
  }
}

// Turns an Appwrite document (dataset columns: CompanyName, screenSize, launchPriceUSA, ...) into the
// shape the app uses everywhere (name, brand, price, currency, screenInches, tags, imageUrl).
// The original fields are kept on the object, so the Compare page can read every dataset column.
// `countryKey` picks which country's launch price becomes `price` (see lib/countries.js).
export function toDevice(doc, countryKey = 'uk') {
  const country = countryByKey(countryKey)
  const brand = doc.CompanyName ?? doc.brand ?? ''
  // The dataset's model column name isn't fixed, so accept the usual spellings.
  const model = pick(doc, ['modelName', 'ModelName', 'Model Name', 'model', 'Model', 'name', 'Name'])
  const category = doc.category ?? (looksLikeTablet(model) ? 'tablet' : 'phone')
  const name = model
    ? String(model).startsWith(brand) ? String(model) : `${brand} ${model}`.trim()
    : brand || 'Unknown device'

  const hasPrice = present(doc.price)
  const price = hasPrice ? toNumber(doc.price) : toNumber(doc[country.field])
  const currency = hasPrice ? (doc.currency ?? '£') : country.symbol

  const screenInches = toNumber(doc.screenSize ?? doc.screenInches)
  const year = doc.launchYear ?? doc.specs?.year

  const tags = doc.tags?.length
    ? doc.tags
    : [
        brand,
        year,
        screenInches && `${screenInches}" ${screenCategory(screenInches, category)} screen`,
      ].filter(Boolean).map(String)

  return {
    ...doc,
    name,
    brand,
    category,
    price,
    currency,
    screenInches,
    tags,
    variants: parseVariants(doc.variants),
    imageUrl: doc.imageUrl ?? (brand === 'Apple' ? LOCAL_PHOTOS[withoutStorage(model)] : undefined) ?? null,
  }
}
