// Data access. With Appwrite configured, every call asks the database for just what the screen needs
// (one page, one search, a few ids), with filters, sorting and paging done by the query itself.
// Without Appwrite it falls back to the sample data in memory.
import { Query } from 'appwrite'
import { databases, DATABASE_ID, PHONES_COLLECTION_ID, appwriteConfigured } from './appwrite.js'
import { samplePhones } from '../data/samplePhones.js'
import { SCREEN_CUTOFFS, applyFilters, categoryOf } from './filters.js'
import { looksLikeTablet, toDevice } from './phones.js'

const list = (queries) => databases.listDocuments(DATABASE_ID, PHONES_COLLECTION_ID, queries)

// The dataset has no category column: a model is a tablet when its name has one of these words.
const TABLET_WORDS = ['iPad', 'Tab']

function categoryQueries(category) {
  if (category === 'tablet') return [Query.or(TABLET_WORDS.map((w) => Query.contains('ModelName', [w])))]
  if (category === 'phone') return TABLET_WORDS.map((w) => Query.notContains('ModelName', [w]))
  return null // no laptops in the database
}

// Every typed word must appear in the model name or the company name.
function searchQueries(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((w) => Query.or([Query.contains('ModelName', [w]), Query.contains('CompanyName', [w])]))
}

// screenSize is stored as whole inches, so the size bands become whole-number ranges.
function screenQuery(category, size) {
  const [small, medium] = SCREEN_CUTOFFS[category] ?? SCREEN_CUTOFFS.phone
  const maxSmall = Math.ceil(small) - 1
  const maxMedium = Math.floor(medium)
  if (size === 'small') return Query.lessThanEqual('screenSize', maxSmall)
  if (size === 'medium') {
    return Query.and([Query.greaterThan('screenSize', maxSmall), Query.lessThanEqual('screenSize', maxMedium)])
  }
  return Query.greaterThan('screenSize', maxMedium)
}

// ---- Brand list --------------------------------------------------------------------------------
// The database can't list distinct values, so the brand filter reads just two short fields
// (company + model name) once per browser session and works the brands out from those.

const CATALOG_KEY = 'device-catalog-v1'
let catalogPromise = null

function loadCatalog() {
  catalogPromise ??= (async () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CATALOG_KEY) ?? 'null')
      if (Array.isArray(cached)) return cached
    } catch {
      /* no cache */
    }
    const select = (offset) =>
      list([Query.limit(100), Query.offset(offset), Query.select(['CompanyName', 'ModelName'])])
    const first = await select(0)
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, Math.ceil(first.total / 100) - 1) }, (_, i) => select((i + 1) * 100)),
    )
    const rows = [first, ...rest]
      .flatMap((r) => r.documents)
      .map((d) => ({ b: d.CompanyName ?? '', m: d.ModelName ?? '' }))
    try {
      sessionStorage.setItem(CATALOG_KEY, JSON.stringify(rows))
    } catch {
      /* storage full or unavailable */
    }
    return rows
  })().catch((e) => {
    catalogPromise = null
    throw e
  })
  return catalogPromise
}

// [{ name: 'POCO', variants: ['POCO', 'Poco'] }, ...] for one category. "POCO" and "Poco" are one brand.
export async function fetchBrands(category) {
  if (!appwriteConfigured) {
    const names = [...new Set(samplePhones.filter((p) => categoryOf(p) === category).map((p) => p.brand))]
    return names.sort().map((name) => ({ name, variants: [name] }))
  }
  const rows = (await loadCatalog()).filter((r) => r.b && (looksLikeTablet(r.m) ? 'tablet' : 'phone') === category)
  const byLower = new Map()
  for (const { b } of rows) {
    const forms = byLower.get(b.toLowerCase()) ?? new Map()
    forms.set(b, (forms.get(b) ?? 0) + 1)
    byLower.set(b.toLowerCase(), forms)
  }
  return [...byLower.values()]
    .map((forms) => {
      const sorted = [...forms].sort((a, b) => b[1] - a[1])
      return { name: sorted[0][0], variants: sorted.map(([form]) => form) }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ---- Queries -----------------------------------------------------------------------------------

let hasPrimaryColumn = true

// One page of devices matching the filters, plus the total number of matches.
export async function fetchDevices(filters, page, pageSize) {
  if (!appwriteConfigured) {
    const all = applyFilters(samplePhones, filters)
    return { devices: all.slice((page - 1) * pageSize, page * pageSize), total: all.length }
  }

  const category = categoryQueries(filters.category)
  if (!category) return { devices: [], total: 0 }

  const queries = [Query.limit(pageSize), Query.offset((page - 1) * pageSize), ...category]
  queries.push(...searchQueries(filters.q))

  if (filters.brands.length) {
    const known = await fetchBrands(filters.category)
    const variants = filters.brands.flatMap((n) => known.find((b) => b.name === n)?.variants ?? [n])
    queries.push(Query.equal('CompanyName', variants))
  }
  if (filters.min !== '') queries.push(Query.greaterThanEqual('launchPriceUSA', Number(filters.min)))
  if (filters.max !== '') queries.push(Query.lessThanEqual('launchPriceUSA', Number(filters.max)))
  if (filters.screens.length) {
    const bands = filters.screens.map((s) => screenQuery(filters.category, s))
    queries.push(bands.length === 1 ? bands[0] : Query.or(bands))
  }

  if (filters.sort === 'price-asc') queries.push(Query.orderAsc('launchPriceUSA'))
  if (filters.sort === 'price-desc') queries.push(Query.orderDesc('launchPriceUSA'))
  if (filters.sort === 'newest') queries.push(Query.orderDesc('launchYear'))
  queries.push(Query.orderAsc('$id')) // keeps the order stable between pages

  // One row per model: scripts/group-variants.mjs marks the primary row of each model. Until that has been
  // run the column doesn't exist, so fall back to listing every row.
  let res
  if (hasPrimaryColumn) {
    try {
      res = await list([...queries, Query.equal('isPrimary', [true])])
    } catch (e) {
      if (!/isPrimary|attribute/i.test(e.message ?? '')) throw e
      hasPrimaryColumn = false
    }
  }
  res ??= await list(queries)
  return { devices: res.documents.map(toDevice), total: res.total }
}

// The devices with these ids, in the order given.
export async function fetchDevicesByIds(ids) {
  if (!ids.length) return []
  if (!appwriteConfigured) return ids.map((id) => samplePhones.find((p) => p.$id === id)).filter(Boolean)
  const res = await list([Query.equal('$id', ids), Query.limit(ids.length)])
  const byId = new Map(res.documents.map((d) => [d.$id, toDevice(d)]))
  return ids.map((id) => byId.get(id)).filter(Boolean)
}
