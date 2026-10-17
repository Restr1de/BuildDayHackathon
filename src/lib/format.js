// "£799.00" / "$1,199.00". Sample data is in pounds; documents from Appwrite carry their own `currency`.
export function formatPrice(device) {
  if (device.price === null || device.price === undefined || Number.isNaN(Number(device.price))) {
    return 'Price n/a'
  }
  const amount = Number(device.price).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${device.currency ?? '£'}${amount}`
}
