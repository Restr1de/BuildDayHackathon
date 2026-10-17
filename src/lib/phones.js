import { databases, DATABASE_ID, PHONES_COLLECTION_ID } from './appwrite.js'

export async function listPhones() {
  const res = await databases.listDocuments(DATABASE_ID, PHONES_COLLECTION_ID)
  return res.documents
}

export async function getPhone(id) {
  return databases.getDocument(DATABASE_ID, PHONES_COLLECTION_ID, id)
}
