// "£799.00" / "$1,199.00".
export function formatMoney(amount, currency = '£') {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return 'Price n/a'
  const text = Number(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency}${text}`
}

// Sample data is in pounds; documents from Appwrite carry their own `currency`.
export function formatPrice(device) {
  return formatMoney(device.price, device.currency ?? '£')
}

// 128 -> "128 GB", 1024 -> "1 TB", 2048 -> "2 TB"; anything unusable -> ''
export function formatStorage(gb) {
  const n = Number(gb)
  if (!Number.isFinite(n) || n <= 0) return ''
  return n >= 1024 ? `${n / 1024} TB` : `${n} GB`
}

// "Apple iPhone 16" + its own storage size -> "Apple iPhone 16 · 128 GB"
export function displayName(device) {
  const storage = formatStorage(device.Storage)
  return storage ? `${device.name} · ${storage}` : device.name
}
