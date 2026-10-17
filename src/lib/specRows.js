// Rows shown on the Compare page, grouped, in display order.
//
// `keys` are looked up in order on device.specs, then on the device itself, so a row works with
// both our sample data (specs.chip, specs.year ...) and the dataset columns
// (CompanyName, mobileWeight, RAM, frontCamera, backCamera, processor, batteryCapacity, screenSize,
// launchPrice*, launchYear, ramTier, processorTier, predictedBatteryLife, cameraTier, weightTier).
// A row is hidden when none of the compared devices has a value for it.

import { formatStorage } from './format.js'

const isNumeric = (v) => typeof v === 'number' || /^\d+(\.\d+)?$/.test(String(v).trim())

const suffix = (unit) => (v) => (isNumeric(v) ? `${v}${unit}` : String(v))
const money = (symbol) => (v) => (isNumeric(v) ? `${symbol}${Number(v).toLocaleString('en-GB')}` : String(v))

const launchInfo = (place) =>
  `The price when this phone first went on sale in ${place}, shown in local money. What you pay today is usually less, especially for a used or refurbished one.`

// `info` is the plain-language explanation behind each row's (i) button, written for people who are
// not into tech. `title` is the heading of that explanation (defaults to the label).
export const SPEC_ROWS = [
  { group: 'Overview', label: 'Company', keys: ['CompanyName', 'brand'],
    info: 'The company that makes the phone. Well-known makers usually have more help online and more shops that can repair the phone.' },
  { group: 'Overview', label: 'Released', keys: ['year', 'launchYear'],
    info: 'The year this model came out. Newer phones usually keep getting safety updates for longer, which helps keep your photos and bank details safe.' },
  { group: 'Overview', label: 'Screen', keys: ['screen', 'screenSize'], format: suffix(' inches'),
    info: 'The screen size, measured corner to corner in inches. Bigger screens (about 6.5 inches and up) make writing and buttons easier to see, but the phone is heavier and harder to hold in one hand.' },
  { group: 'Overview', label: 'Software', keys: ['os'],
    info: 'The system the device runs on, such as iOS or Android. It decides how the menus look and how you open apps.' },

  { group: 'Ratings', label: 'Memory (RAM)', title: 'Memory rating', keys: ['ramTier'],
    info: 'How well the phone copes with several apps open at once. “Low” can feel slow when you switch between apps. “High” stays smooth.' },
  { group: 'Ratings', label: 'Processor', title: 'Processor rating', keys: ['processorTier'],
    info: 'How quickly the phone’s “brain” works. A higher rating means apps open faster and you wait less.' },
  { group: 'Ratings', label: 'Camera', title: 'Camera rating', keys: ['cameraTier'],
    info: 'How good the photos are likely to be. A higher rating means clearer pictures, especially indoors or when zooming in on family photos.' },
  { group: 'Ratings', label: 'Weight', title: 'Weight rating', keys: ['weightTier'],
    info: 'How heavy the phone feels. “Light” is easier to hold for a long time, which matters if you have sore hands or wrists.' },
  { group: 'Ratings', label: 'Predicted battery life', keys: ['predictedBatteryLife'],
    info: 'How long a full charge should last with normal use. “1 day” means you’d likely charge it every night.' },

  { group: 'Hardware', label: 'Processor', keys: ['chip', 'processor'],
    info: 'The phone’s “brain”. Newer names and higher numbers are faster. Most people don’t need the very fastest one for calls, messages and photos.' },
  { group: 'Hardware', label: 'Memory (RAM)', keys: ['memory', 'RAM'], format: suffix(' GB'),
    info: 'The phone’s short-term memory, used to run apps. More memory means fewer slowdowns. 4 GB is fine for everyday use; 8 GB or more is very smooth.' },
  { group: 'Hardware', label: 'Storage', keys: ['storage', 'Storage'], format: (v) => (isNumeric(v) ? formatStorage(v) : String(v)),
    info: 'Space to keep photos, apps and music. 128 GB holds many thousands of photos. If you back your photos up online, you can manage with less.' },
  { group: 'Hardware', label: 'Battery', keys: ['battery'],
    info: 'How long the battery lasts on one charge, for example watching video. More hours means less time plugged in.' },
  { group: 'Hardware', label: 'Battery capacity', keys: ['batteryCapacity'], format: suffix(' mAh'),
    info: 'The size of the battery, in “mAh”. A bigger number usually lasts longer between charges. About 4,000 mAh or more is good.' },
  { group: 'Hardware', label: 'Camera', keys: ['camera'],
    info: 'The cameras on the phone, in megapixels (MP). A higher number can mean more detail, but it isn’t the only thing that makes a good photo.' },
  { group: 'Hardware', label: 'Front camera', keys: ['frontCamera'], format: suffix(' MP'),
    info: 'The camera on the screen side, used for selfies and video calls with family. 8 MP or more is plenty for clear video calls.' },
  { group: 'Hardware', label: 'Back camera', keys: ['backCamera'], format: suffix(' MP'),
    info: 'The main camera on the back, for taking photos. A higher number, such as 48 MP, gives sharper detail when you zoom in.' },
  { group: 'Hardware', label: 'Weight', keys: ['weight', 'mobileWeight'], format: suffix(' g'),
    info: 'How heavy the phone is, in grams. Under about 170 g feels light. Over 200 g can feel heavy to hold for long.' },

  { group: 'Everyday use', label: 'Unlock with', keys: ['unlock'],
    info: 'How you open the phone. Face ID and fingerprint are quick. A home button is a real button you press, which some people find simpler.' },
  { group: 'Everyday use', label: 'Charging', keys: ['charging'],
    info: 'The type of plug the phone uses. USB-C is the newer, common one and works with many chargers. Lightning is Apple’s older plug.' },

  { group: 'Launch price', label: 'USA', title: 'Launch price: USA', keys: ['launchPriceUSA'], format: money('$'), info: launchInfo('the USA') },
  { group: 'Launch price', label: 'India', title: 'Launch price: India', keys: ['launchPriceIndia'], format: money('₹'), info: launchInfo('India') },
  { group: 'Launch price', label: 'China', title: 'Launch price: China', keys: ['launchPriceChina'], format: money('¥'), info: launchInfo('China') },
  { group: 'Launch price', label: 'Pakistan', title: 'Launch price: Pakistan', keys: ['launchPricePakistan'], format: money('PKR '), info: launchInfo('Pakistan') },
  { group: 'Launch price', label: 'Dubai', title: 'Launch price: Dubai', keys: ['launchPriceDubai'], format: money('AED '), info: launchInfo('Dubai') },
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
