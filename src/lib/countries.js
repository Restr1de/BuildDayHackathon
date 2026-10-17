// The countries the dataset has launch prices for. Choosing one switches every price on the site (cards,
// price filter, sort, Compare) to that country's launch price, in its own currency.
// `field` is the column in Appwrite; `flag` is the two-letter code of the flag picture (flagcdn.com).
export const COUNTRIES = [
  // The dataset has no UK prices. The UK card shows the US launch price number as pounds, with no conversion.
  // `priceKey` is where that number sits in each model's saved list of per-country prices.
  { key: 'uk', label: 'United Kingdom', field: 'launchPriceUSA', priceKey: 'usa', currency: 'GBP', symbol: '£', flag: 'gb' },
  { key: 'india', label: 'India', field: 'launchPriceIndia', currency: 'INR', symbol: '₹', flag: 'in' },
  { key: 'china', label: 'China', field: 'launchPriceChina', currency: 'CNY', symbol: '¥', flag: 'cn' },
  { key: 'pakistan', label: 'Pakistan', field: 'launchPricePakistan', currency: 'PKR', symbol: 'PKR ', flag: 'pk' },
  { key: 'dubai', label: 'Dubai (UAE)', field: 'launchPriceDubai', currency: 'AED', symbol: 'AED ', flag: 'ae' },
]

export const DEFAULT_COUNTRY = 'uk'

export function countryByKey(key) {
  return COUNTRIES.find((c) => c.key === key) ?? COUNTRIES[0]
}

export const flagUrl = (country) => `https://flagcdn.com/w80/${country.flag}.png`
