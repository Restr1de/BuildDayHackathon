import { screenCategory } from './filters.js'

// Photos we have locally (public/phones), keyed by model name without the storage size.
const LOCAL_PHOTOS = {
  'iphone 16 plus': '/phones/iphone-16-plus.png',
  'iphone 16': '/phones/iphone-16.png',
  'iphone 15 pro': '/phones/iphone-15-pro.png',
  'iphone 15': '/phones/iphone-15.png',
  'iphone 14': '/phones/iphone-14.png',
  'iphone 13': '/phones/iphone-13.png',
  'iphone 12': '/phones/iphone-12.png',
}

const withoutStorage = (model) =>
  String(model ?? '').replace(/\s*\d+\s*(gb|tb)\s*$/i, '').trim().toLowerCase()

// The dataset has no category column, so tablets are recognised by name.
export const looksLikeTablet = (model) => /\b(ipad|tab|tablet)\b/i.test(String(model ?? ''))

const present = (v) => v !== undefined && v !== null && v !== ''
const pick = (doc, keys) => keys.map((k) => doc[k]).find(present)

// "6.1", 6.1 or "6.1 inches" -> 6.1; anything unusable -> null
function toNumber(v) {
  if (!present(v)) return null
  const n = Number(String(v).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

// Turns an Appwrite document (dataset columns: CompanyName, screenSize, launchPriceUSA, ...) into the
// shape the app uses everywhere (name, brand, price, currency, screenInches, tags, imageUrl).
// The original fields are kept on the object, so the Compare page can read every dataset column.
export function toDevice(doc) {
  const brand = doc.CompanyName ?? doc.brand ?? ''
  // The dataset's model column name isn't fixed, so accept the usual spellings.
  const model = pick(doc, ['modelName', 'ModelName', 'Model Name', 'model', 'Model', 'name', 'Name'])
  const category = doc.category ?? (looksLikeTablet(model) ? 'tablet' : 'phone')
  const name = model
    ? String(model).startsWith(brand) ? String(model) : `${brand} ${model}`.trim()
    : brand || 'Unknown device'

  const hasPrice = present(doc.price)
  const price = hasPrice ? toNumber(doc.price) : toNumber(doc.launchPriceUSA)
  const currency = hasPrice ? (doc.currency ?? '£') : '$'

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
    imageUrl: doc.imageUrl ?? (brand === 'Apple' ? LOCAL_PHOTOS[withoutStorage(model)] : undefined) ?? null,
  }
}
