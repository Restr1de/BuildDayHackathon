// Permanently deletes every row of one brand from the phones collection. This cannot be undone.
//
// Usage (from the project folder; the key is read from .env as APPWRITE_API_KEY):
//   Preview (deletes nothing):  node --env-file=.env scripts/delete-brand.mjs "Infinix" --dry
//   Delete:                     node --env-file=.env scripts/delete-brand.mjs "Infinix"
// The brand name is matched ignoring upper/lower case, so "POCO" also removes "Poco".
// Key scopes needed: databases.read, documents.read, documents.write.

import { Client, Databases, Query } from 'node-appwrite'

const env = process.env
const brand = process.argv.slice(2).find((a) => !a.startsWith('--'))
const dry = process.argv.includes('--dry')
const databaseId = env.VITE_APPWRITE_DATABASE_ID
const collectionId = env.VITE_APPWRITE_PHONES_COLLECTION_ID

if (!brand) {
  console.error('Give the brand name, for example: node --env-file=.env scripts/delete-brand.mjs "Infinix" --dry')
  process.exit(1)
}
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

// Read every row's company and model, then keep the ones whose company matches.
const rows = []
let cursor = null
for (;;) {
  const queries = [Query.limit(100), Query.select(['CompanyName', 'ModelName'])]
  if (cursor) queries.push(Query.cursorAfter(cursor))
  const res = await db.listDocuments({ databaseId, collectionId, queries })
  rows.push(...res.documents)
  if (res.documents.length < 100) break
  cursor = res.documents[res.documents.length - 1].$id
}
const targets = rows.filter((d) => String(d.CompanyName ?? '').trim().toLowerCase() === brand.trim().toLowerCase())
const models = [...new Set(targets.map((d) => d.ModelName))]

console.log(`${rows.length} rows in the collection; ${targets.length} belong to "${brand}" (${models.length} models)`)
console.log(models.slice(0, 12).join(', ') + (models.length > 12 ? ', ...' : ''))
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
