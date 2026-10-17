// Stores a picture link on every row of each model listed in scripts/image-links.json:
//   { "Apple": { "iPhone 11": "https://…/apple-iphone-11.jpg", ... } }   (company -> model name -> link)
// The website shows the link as that model's picture (the `imageUrl` column). Models that already
// have a photo in public/phones are left out of the file on purpose.
//
// It adds the imageUrl column if it is missing and only writes rows whose link changed, so it is safe to
// run again after you add more models or brands to the JSON file.
//
// Run it from the project folder (the API key is only used for this run, never saved in a file):
//   PowerShell:  $env:APPWRITE_API_KEY="your-key"; node --env-file=.env scripts/set-image-links.mjs
//   Preview only (changes nothing, needs no key):  node --env-file=.env scripts/set-image-links.mjs --dry
// Key scopes needed: databases.read, databases.write, collections.read, collections.write,
// attributes.read, attributes.write, documents.read, documents.write. Delete the key afterwards.

import { readFileSync } from 'node:fs'
import { Client, Databases, Query } from 'node-appwrite'

const env = process.env
const databaseId = env.VITE_APPWRITE_DATABASE_ID
const collectionId = env.VITE_APPWRITE_PHONES_COLLECTION_ID
const dry = process.argv.includes('--dry')

const missing = Object.entries({
  VITE_APPWRITE_ENDPOINT: env.VITE_APPWRITE_ENDPOINT,
  VITE_APPWRITE_PROJECT_ID: env.VITE_APPWRITE_PROJECT_ID,
  VITE_APPWRITE_DATABASE_ID: databaseId,
  VITE_APPWRITE_PHONES_COLLECTION_ID: collectionId,
  ...(dry ? {} : { APPWRITE_API_KEY: env.APPWRITE_API_KEY }),
})
  .filter(([, v]) => !v)
  .map(([k]) => k)
if (missing.length) {
  console.error(`Missing: ${missing.join(', ')}\nSee the comment at the top of scripts/set-image-links.mjs.`)
  process.exit(1)
}

const links = JSON.parse(readFileSync(new URL('./image-links.json', import.meta.url), 'utf8'))
const client = new Client().setEndpoint(env.VITE_APPWRITE_ENDPOINT).setProject(env.VITE_APPWRITE_PROJECT_ID)
if (!dry) client.setKey(env.APPWRITE_API_KEY) // a preview only reads, which the public read permission allows
const db = new Databases(client)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ensureColumn() {
  const existing = async () =>
    (await db.listAttributes({ databaseId, collectionId, queries: [Query.limit(100)] })).attributes
  if (!(await existing()).some((a) => a.key === 'imageUrl')) {
    console.log('Adding column imageUrl ...')
    await db.createStringAttribute({ databaseId, collectionId, key: 'imageUrl', size: 1000, required: false })
  }
  for (let i = 0; i < 60; i++) {
    const col = (await existing()).find((a) => a.key === 'imageUrl')
    if (col?.status === 'available') return
    await sleep(1000)
  }
  throw new Error('The imageUrl column did not become available in time. Wait a minute and run the script again.')
}

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

async function main() {
  if (!dry) await ensureColumn()

  const docs = await readAll()
  const wanted = docs
    .map((d) => ({ d, url: links[d.CompanyName]?.[d.ModelName] }))
    .filter((x) => x.url)
  const changes = wanted.filter((x) => (x.d.imageUrl ?? null) !== x.url)

  const models = new Set(wanted.map((x) => `${x.d.CompanyName}|${x.d.ModelName}`))
  const listed = Object.values(links).reduce((n, m) => n + Object.keys(m).length, 0)
  console.log(`${listed} links in the file; ${models.size} of those models found in the database (${wanted.length} rows)`)
  console.log(`${changes.length} rows need updating${dry ? ' (dry run, nothing written)' : ''}`)
  if (dry) return

  let done = 0
  const queue = [...changes]
  const worker = async () => {
    while (queue.length) {
      const { d, url } = queue.pop()
      await db.updateDocument({ databaseId, collectionId, documentId: d.$id, data: { imageUrl: url } })
      if (++done % 100 === 0) console.log(`  ${done}/${changes.length}`)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  console.log('Done. Reload the website.')
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
