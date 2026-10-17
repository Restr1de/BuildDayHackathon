// A link that searches Amazon for a device (brand + model + storage size). It opens Amazon's search results,
// so what appears is Amazon's choice: the right model is normally at the top, but it isn't guaranteed.
//
// Site: set VITE_AMAZON_DOMAIN in .env to use another country (default: www.amazon.co.uk).
// Optional: if you join the Amazon Associates programme, put your tracking id in VITE_AMAZON_TAG and every
// link will carry it (and then the page needs to say that links may earn you a commission).
import { formatStorage } from './format.js'

const DOMAIN = import.meta.env.VITE_AMAZON_DOMAIN || 'www.amazon.co.uk'
const TAG = import.meta.env.VITE_AMAZON_TAG || ''

// `storageGb` is the size of the chosen version (for example 128); leave it out to search the model only.
export function amazonSearchUrl(device, storageGb) {
  const storage = formatStorage(storageGb ?? device.Storage).replace(' ', '') // "128 GB" -> "128GB"
  const kind = device.category === 'tablet' ? 'tablet' : 'smartphone'
  const words = [device.name, storage, kind].filter(Boolean).join(' ')
  const params = new URLSearchParams({ k: words })
  if (TAG) params.set('tag', TAG)
  return `https://${DOMAIN}/s?${params.toString()}`
}

export const amazonLinkIsAffiliate = Boolean(TAG)
