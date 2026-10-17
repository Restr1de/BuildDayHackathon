// Data access. With Appwrite configured, every call asks the database for just what the screen needs
// (one page, one search, a few ids), with filters, sorting and paging done by the query itself.
// Without Appwrite it falls back to the sample data in memory.
import { Query } from 'appwrite'
import { databases, DATABASE_ID, PHONES_COLLECTION_ID, appwriteConfigured } from './appwrite.js'
import { samplePhones } from '../data/samplePhones.js'
import { SCREEN_CUTOFFS, applyFilters, categoryOf } from './filters.js'
import { countryByKey } from './countries.js'
import { looksLikeTablet, toDevice } from './phones.js'

const list = (queries) => databases.listDocuments(DATABASE_ID, PHONES_COLLECTION_ID, queries)

// Rows carry a `category` column ('phone' or 'tablet') once scripts/group-variants.mjs has been run.
// Before that (the column doesn't exist yet) a model counts as a tablet when its name has one of these words.
let hasCategoryColumn = true
const TABLET_WORDS = ['iPad', 'Tab']

function categoryQueries(category) {
  if (category !== 'phone' && category !== 'tablet') return null // no laptops in the database
  if (hasCategoryColumn) return [Query.equal('category', [category])]
  if (category === 'tablet') return [Query.or(TABLET_WORDS.map((w) => Query.contains('ModelName', [w])))]
  return TABLET_WORDS.map((w) => Query.notContains('ModelName', [w]))
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

const CATALOG_KEY = 'device-catalog-v4'
const CATALOG_TTL = 60 * 1000 // a minute: removed brands disappear quickly, and it is still only ~10 small requests
let catalogPromise = null
let catalogAt = 0

function loadCatalog() {
  // The list in memory expires too, so an open tab picks up database changes without a full reload.
  if (catalogPromise && Date.now() - catalogAt > CATALOG_TTL) catalogPromise = null
  if (!catalogPromise) catalogAt = Date.now()
  catalogPromise ??= (async () => {
    try {
      // Kept for a few minutes only, so brands added or removed in the database show up soon.
      const cached = JSON.parse(sessionStorage.getItem(CATALOG_KEY) ?? 'null')
      if (cached && Array.isArray(cached.rows) && Date.now() - cached.at < CATALOG_TTL) return cached.rows
    } catch {
      /* no cache */
    }
    // `category` may not exist yet, in which case it is simply left out of what comes back.
    const select = (offset) =>
      list([Query.limit(100), Query.offset(offset), Query.select(['CompanyName', 'ModelName', 'category'])]).catch(
        () => list([Query.limit(100), Query.offset(offset), Query.select(['CompanyName', 'ModelName'])]),
      )
    const first = await select(0)
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, Math.ceil(first.total / 100) - 1) }, (_, i) => select((i + 1) * 100)),
    )
    const rows = [first, ...rest]
      .flatMap((r) => r.documents)
      .map((d) => ({
        b: d.CompanyName ?? '',
        c: d.category || (looksLikeTablet(d.ModelName) ? 'tablet' : 'phone'),
      }))
    try {
      sessionStorage.setItem(CATALOG_KEY, JSON.stringify({ at: Date.now(), rows }))
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
  const rows = (await loadCatalog()).filter((r) => r.b && r.c === category)
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

  if (!categoryQueries(filters.category)) return { devices: [], total: 0 }

  // Brand names are mapped to every spelling used in the data ("POCO" and "Poco").
  let brandSpellings = []
  if (filters.brands.length) {
    const known = await fetchBrands(filters.category)
    brandSpellings = filters.brands.flatMap((n) => known.find((b) => b.name === n)?.variants ?? [n])
  }

  // Price filter and price sort use the chosen country's launch price column.
  const priceField = countryByKey(filters.country).field

  const build = () => {
    const queries = [Query.limit(pageSize), Query.offset((page - 1) * pageSize), ...categoryQueries(filters.category)]
    queries.push(...searchQueries(filters.q))
    if (brandSpellings.length) queries.push(Query.equal('CompanyName', brandSpellings))
    if (filters.min !== '') queries.push(Query.greaterThanEqual(priceField, Number(filters.min)))
    if (filters.max !== '') queries.push(Query.lessThanEqual(priceField, Number(filters.max)))
    if (filters.screens.length) {
      const bands = filters.screens.map((s) => screenQuery(filters.category, s))
      queries.push(bands.length === 1 ? bands[0] : Query.or(bands))
    }

    if (filters.sort === 'price-asc') queries.push(Query.orderAsc(priceField))
    if (filters.sort === 'price-desc') queries.push(Query.orderDesc(priceField))
    if (filters.sort === 'newest') queries.push(Query.orderDesc('launchYear'))
    queries.push(Query.orderAsc('$id')) // keeps the order stable between pages

    // One row per model: scripts/group-variants.mjs marks the primary row of each model.
    if (hasPrimaryColumn) queries.push(Query.equal('isPrimary', [true]))
    return queries
  }

  // `isPrimary` and `category` only exist after scripts/group-variants.mjs has been run. If the database
  // says one is missing, carry on without it (older behaviour) instead of failing.
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await list(build())
      return { devices: res.documents.map((d) => toDevice(d, filters.country)), total: res.total }
    } catch (e) {
      const msg = e.message ?? ''
      // (Two requests can fail together, so a flag that is already off still means "try again".)
      if (attempt < 3 && /isPrimary/i.test(msg)) hasPrimaryColumn = false
      else if (attempt < 3 && /category/i.test(msg)) hasCategoryColumn = false
      else throw e
    }
  }
}

// The devices with these ids, in the order given.
export async function fetchDevicesByIds(ids, country = 'uk') {
  if (!ids.length) return []
  if (!appwriteConfigured) return ids.map((id) => samplePhones.find((p) => p.$id === id)).filter(Boolean)
  const res = await list([Query.equal('$id', ids), Query.limit(ids.length)])
  const byId = new Map(res.documents.map((d) => [d.$id, toDevice(d, country)]))
  return ids.map((id) => byId.get(id)).filter(Boolean)
}
