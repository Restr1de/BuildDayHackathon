import { Query } from 'appwrite'
import { databases, DATABASE_ID, PHONES_COLLECTION_ID } from './appwrite.js'
import { screenCategory } from './filters.js'

const PAGE = 100 // Appwrite's maximum page size

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
  const category = doc.category ?? 'phone'

  // The dataset's model column name isn't fixed, so accept the usual spellings.
  const model = pick(doc, ['modelName', 'ModelName', 'Model Name', 'model', 'Model', 'name', 'Name'])
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
    imageUrl: doc.imageUrl ?? null,
  }
}

export async function listPhones() {
  const all = []
  let cursor = null
  for (;;) {
    const queries = [Query.limit(PAGE)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const res = await databases.listDocuments(DATABASE_ID, PHONES_COLLECTION_ID, queries)
    all.push(...res.documents)
    if (res.documents.length < PAGE) break
    cursor = res.documents[res.documents.length - 1].$id
  }
  return all.map(toDevice)
}

export async function getPhone(id) {
  return toDevice(await databases.getDocument(DATABASE_ID, PHONES_COLLECTION_ID, id))
}
