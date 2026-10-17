// Rows shown on the Compare page, grouped, in display order.
//
// `keys` are looked up in order on device.specs, then on the device itself, so a row works with
// both our sample data (specs.chip, specs.year ...) and the dataset columns
// (CompanyName, mobileWeight, RAM, frontCamera, backCamera, processor, batteryCapacity, screenSize,
// launchPrice*, launchYear, ramTier, processorTier, predictedBatteryLife, cameraTier, weightTier).
// A row is hidden when none of the compared devices has a value for it.

const isNumeric = (v) => typeof v === 'number' || /^\d+(\.\d+)?$/.test(String(v).trim())

const suffix = (unit) => (v) => (isNumeric(v) ? `${v}${unit}` : String(v))
const money = (symbol) => (v) => (isNumeric(v) ? `${symbol}${Number(v).toLocaleString('en-GB')}` : String(v))

export const SPEC_ROWS = [
  { group: 'Overview', label: 'Company', keys: ['CompanyName', 'brand'] },
  { group: 'Overview', label: 'Released', keys: ['year', 'launchYear'] },
  { group: 'Overview', label: 'Screen', keys: ['screen', 'screenSize'], format: suffix(' inches') },
  { group: 'Overview', label: 'Software', keys: ['os'] },

  { group: 'Hardware', label: 'Processor', keys: ['chip', 'processor'] },
  { group: 'Hardware', label: 'Memory (RAM)', keys: ['memory', 'RAM'], format: suffix(' GB') },
  { group: 'Hardware', label: 'Storage', keys: ['storage'] },
  { group: 'Hardware', label: 'Battery', keys: ['battery'] },
  { group: 'Hardware', label: 'Battery capacity', keys: ['batteryCapacity'], format: suffix(' mAh') },
  { group: 'Hardware', label: 'Camera', keys: ['camera'] },
  { group: 'Hardware', label: 'Front camera', keys: ['frontCamera'], format: suffix(' MP') },
  { group: 'Hardware', label: 'Back camera', keys: ['backCamera'], format: suffix(' MP') },
  { group: 'Hardware', label: 'Weight', keys: ['weight', 'mobileWeight'], format: suffix(' g') },

  { group: 'Everyday use', label: 'Unlock with', keys: ['unlock'] },
  { group: 'Everyday use', label: 'Charging', keys: ['charging'] },

  { group: 'Launch price', label: 'USA', keys: ['launchPriceUSA'], format: money('$') },
  { group: 'Launch price', label: 'India', keys: ['launchPriceIndia'], format: money('₹') },
  { group: 'Launch price', label: 'China', keys: ['launchPriceChina'], format: money('¥') },
  { group: 'Launch price', label: 'Pakistan', keys: ['launchPricePakistan'], format: money('PKR ') },
  { group: 'Launch price', label: 'Dubai', keys: ['launchPriceDubai'], format: money('AED ') },

  { group: 'Ratings', label: 'Memory (RAM)', keys: ['ramTier'] },
  { group: 'Ratings', label: 'Processor', keys: ['processorTier'] },
  { group: 'Ratings', label: 'Camera', keys: ['cameraTier'] },
  { group: 'Ratings', label: 'Weight', keys: ['weightTier'] },
  { group: 'Ratings', label: 'Predicted battery life', keys: ['predictedBatteryLife'] },
]

const present = (v) => v !== undefined && v !== null && v !== ''

// Display text for one device on one row, or null if it has no value.
export function specValue(device, row) {
  for (const key of row.keys) {
    const v = device.specs?.[key] ?? device[key]
    if (present(v)) return row.format ? row.format(v) : String(v)
  }
  return null
}
