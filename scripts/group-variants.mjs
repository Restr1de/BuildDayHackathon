// One-off data preparation: marks ONE row per phone model and stores that model's storage options on it,
// so the website can show one card per model (with storage pills) and still ask for one page at a time.
//
// What it does, in the phones collection:
//   1. adds three columns if they are missing:  isPrimary (true/false),  variants (text)  and  category (text)
//   2. groups rows by CompanyName + ModelName (identical duplicate rows are ignored)
//   3. for each model, the row with the smallest Storage becomes the "primary" row: isPrimary = true and
//      variants = [{ id, storage, price, prices }, ...] listing every storage size and its launch price in each country
//   4. every other row gets isPrimary = false
//   5. every row gets category = 'tablet' (iPad, Galaxy Tab, Tablet ... in the model name) or 'phone', so the
//      website can filter by category with a plain query
// It is safe to run again (for example after re-importing data): it only writes rows that changed.
//
// Run it from the project folder (the API key is only used for this run, never saved in a file):
//   PowerShell:  $env:APPWRITE_API_KEY="your-key"; node --env-file=.env scripts/group-variants.mjs
//   Preview only (changes nothing, needs no key):  node --env-file=.env scripts/group-variants.mjs --dry
//
// Create the key in the Appwrite console: Overview -> Integrations -> API keys -> Create API key,
// with the scopes  databases.read, databases.write, collections.read, collections.write,
// attributes.read, attributes.write, documents.read, documents.write.  Delete the key afterwards.

import { Client, Databases, Query } from 'node-appwrite'

const env = process.env
const endpoint = env.VITE_APPWRITE_ENDPOINT
const project = env.VITE_APPWRITE_PROJECT_ID
const databaseId = env.VITE_APPWRITE_DATABASE_ID
const collectionId = env.VITE_APPWRITE_PHONES_COLLECTION_ID
const apiKey = env.APPWRITE_API_KEY
const dry = process.argv.includes('--dry')

const missing = Object.entries({
  VITE_APPWRITE_ENDPOINT: endpoint,
  VITE_APPWRITE_PROJECT_ID: project,
  VITE_APPWRITE_DATABASE_ID: databaseId,
  VITE_APPWRITE_PHONES_COLLECTION_ID: collectionId,
  ...(dry ? {} : { APPWRITE_API_KEY: apiKey }),
})
  .filter(([, v]) => !v)
  .map(([k]) => k)
if (missing.length) {
  console.error(`Missing: ${missing.join(', ')}\nSee the comment at the top of scripts/group-variants.mjs.`)
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(project)
if (!dry) client.setKey(apiKey) // a preview only reads, which the public read permission already allows
const db = new Databases(client)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 1. columns ---------------------------------------------------------------------------------
async function ensureColumns() {
  const existing = async () =>
    (await db.listAttributes({ databaseId, collectionId, queries: [Query.limit(100)] })).attributes
  const have = new Set((await existing()).map((a) => a.key))

  if (!have.has('isPrimary')) {
    console.log('Adding column isPrimary ...')
    await db.createBooleanAttribute({ databaseId, collectionId, key: 'isPrimary', required: false, xdefault: false })
  }
  if (!have.has('variants')) {
    console.log('Adding column variants ...')
    await db.createStringAttribute({ databaseId, collectionId, key: 'variants', size: 4000, required: false })
  }

  if (!have.has('category')) {
    console.log('Adding column category ...')
    await db.createStringAttribute({ databaseId, collectionId, key: 'category', size: 20, required: false })
  }

  // New columns take a few seconds to become usable.
  for (let i = 0; i < 60; i++) {
    const wanted = (await existing()).filter((a) => ['isPrimary', 'variants', 'category'].includes(a.key))
    if (wanted.length === 3 && wanted.every((a) => a.status === 'available')) return
    await sleep(1000)
  }
  throw new Error('The new columns did not become available in time. Wait a minute and run the script again.')
}

// ---- 2. read every row --------------------------------------------------------------------------
async function readAll() {
  const docs = []
  let cursor = null
  for (;;) {
    const queries = [Query.limit(100)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const res = await db.listDocuments({ databaseId, collectionId, queries })
    docs.push(...res.documents)
    if (res.documents.length < 100) return docs
    cursor = res.documents[res.documents.length - 1].$id
  }
}

// ---- 3. group -----------------------------------------------------------------------------------
// A model is a tablet when its name says so (same rule the website uses before this column exists).
const categoryOf = (d) => (/\b(ipad|tab|tablet|pad|matepad)\b/i.test(String(d.ModelName ?? '')) ? 'tablet' : 'phone')

const storageOf = (d) => {
  const n = Number(d.Storage ?? d.storage)
  return Number.isFinite(n) && n > 0 ? n : null
}

function plan(docs) {
  const groups = new Map()
  for (const d of docs) {
    const key = `${String(d.CompanyName ?? '').trim().toLowerCase()}|${String(d.ModelName ?? '').trim().toLowerCase()}`
    groups.set(key, [...(groups.get(key) ?? []), d])
  }

  const wanted = new Map() // $id -> { isPrimary, variants, category }
  let duplicates = 0
  for (const rows of groups.values()) {
    // one row per storage size; if a size appears twice keep the first one created
    const bySize = new Map()
    for (const d of [...rows].sort((a, b) => a.$id.localeCompare(b.$id))) {
      const size = storageOf(d)
      const k = size ?? 'none'
      if (bySize.has(k)) duplicates++
      else bySize.set(k, d)
    }
    const variants = [...bySize.values()].sort(
      (a, b) => (storageOf(a) ?? Infinity) - (storageOf(b) ?? Infinity),
    )
    const json = JSON.stringify(
      variants.map((d) => ({
        id: d.$id,
        storage: storageOf(d),
        price: d.launchPriceUSA ?? null, // kept for older versions of the site
        // every country's launch price, so the card can switch country without another request
        prices: {
          usa: d.launchPriceUSA ?? null,
          india: d.launchPriceIndia ?? null,
          china: d.launchPriceChina ?? null,
          pakistan: d.launchPricePakistan ?? null,
          dubai: d.launchPriceDubai ?? null,
        },
      })),
    )
    for (const d of rows) wanted.set(d.$id, { isPrimary: false, variants: null, category: categoryOf(d) })
    wanted.set(variants[0].$id, { isPrimary: true, variants: json, category: categoryOf(variants[0]) })
  }
  return { wanted, models: groups.size, duplicates }
}

// ---- 4. write -----------------------------------------------------------------------------------
async function main() {
  if (!dry) await ensureColumns()

  const docs = await readAll()
  const { wanted, models, duplicates } = plan(docs)
  const changes = docs.filter((d) => {
    const w = wanted.get(d.$id)
    return d.isPrimary !== w.isPrimary || (d.variants ?? null) !== w.variants || (d.category ?? null) !== w.category
  })

  const tablets = [...wanted.values()].filter((w) => w.isPrimary && w.category === 'tablet').length
  console.log(`${docs.length} rows -> ${models} models (${duplicates} duplicate rows ignored)`)
  console.log(`${models - tablets} phones and ${tablets} tablets`)
  console.log(`${changes.length} rows need updating${dry ? ' (dry run, nothing written)' : ''}`)
  if (dry) return

  let done = 0
  const queue = [...changes]
  const worker = async () => {
    while (queue.length) {
      const d = queue.pop()
      const w = wanted.get(d.$id)
      await db.updateDocument({
        databaseId,
        collectionId,
        documentId: d.$id,
        data: { isPrimary: w.isPrimary, variants: w.variants, category: w.category },
      })
      if (++done % 100 === 0) console.log(`  ${done}/${changes.length}`)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  console.log(`Done. ${models} models are ready; reload the website.`)
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
