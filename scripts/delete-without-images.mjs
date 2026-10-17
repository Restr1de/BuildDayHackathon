// Permanently deletes every row that has no picture, so only devices that can be shown with an image stay.
// A device counts as "having a picture" when its row has an imageUrl, or when it is one of the Apple
// phones whose photo lives in public/phones (see LOCAL_PHOTOS in src/lib/phones.js). This cannot be undone.
//
// Usage (from the project folder; the key is read from .env as APPWRITE_API_KEY):
//   Preview (deletes nothing):  node --env-file=.env scripts/delete-without-images.mjs --dry
//   Delete:                     node --env-file=.env scripts/delete-without-images.mjs
// Key scopes needed: databases.read, documents.read, documents.write.

import { Client, Databases, Query } from 'node-appwrite'
import { LOCAL_PHOTOS, withoutStorage } from '../src/lib/phones.js'

const env = process.env
const dry = process.argv.includes('--dry')
const databaseId = env.VITE_APPWRITE_DATABASE_ID
const collectionId = env.VITE_APPWRITE_PHONES_COLLECTION_ID

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
  console.error(`Missing: ${missing.join(', ')}`)
  process.exit(1)
}

const client = new Client().setEndpoint(env.VITE_APPWRITE_ENDPOINT).setProject(env.VITE_APPWRITE_PROJECT_ID)
if (!dry) client.setKey(env.APPWRITE_API_KEY)
const db = new Databases(client)

const rows = []
let cursor = null
for (;;) {
  const queries = [Query.limit(100), Query.select(['CompanyName', 'ModelName', 'imageUrl'])]
  if (cursor) queries.push(Query.cursorAfter(cursor))
  const res = await db.listDocuments({ databaseId, collectionId, queries })
  rows.push(...res.documents)
  if (res.documents.length < 100) break
  cursor = res.documents[res.documents.length - 1].$id
}

const hasPicture = (d) =>
  Boolean(d.imageUrl) || (d.CompanyName === 'Apple' && Boolean(LOCAL_PHOTOS[withoutStorage(d.ModelName)]))

const targets = rows.filter((d) => !hasPicture(d))
const byBrand = {}
for (const d of targets) (byBrand[d.CompanyName] ??= new Set()).add(d.ModelName)

console.log(`${rows.length} rows in the collection; ${targets.length} have no picture`)
for (const [brand, models] of Object.entries(byBrand)) {
  console.log(`  ${brand}: ${models.size} models - ${[...models].join(', ')}`)
}
if (dry || targets.length === 0) {
  console.log(dry ? 'Dry run: nothing deleted.' : 'Nothing to delete.')
  process.exit(0)
}

let done = 0
const queue = [...targets]
const worker = async () => {
  while (queue.length) {
    const d = queue.pop()
    await db.deleteDocument({ databaseId, collectionId, documentId: d.$id })
    if (++done % 50 === 0) console.log(`  ${done}/${targets.length}`)
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
console.log(`Deleted ${done} rows.`)
