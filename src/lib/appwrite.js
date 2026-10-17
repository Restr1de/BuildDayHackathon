import { Client, Databases } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '')

export const databases = new Databases(client)

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
export const PHONES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PHONES_COLLECTION_ID

// When any of these is missing the app falls back to the sample data in src/data/samplePhones.js.
export const appwriteConfigured = Boolean(
  import.meta.env.VITE_APPWRITE_PROJECT_ID && DATABASE_ID && PHONES_COLLECTION_ID,
)
