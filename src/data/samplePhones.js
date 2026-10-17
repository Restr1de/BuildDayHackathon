import { screenCategory } from '../lib/filters.js'

// Placeholder data used until the Appwrite collection is populated.
// `brand` and `screenInches` drive the filters; `tags` is a string array (an Appwrite string[] attribute) shown as pills.
// `category` is 'phone' (default), 'tablet' or 'laptop'.
// `specs` is a flat object of display strings shown on the Compare page (see SPEC_ROWS in pages/Compare.jsx).
export const samplePhones = [
  {
    $id: '1', name: 'Apple iPhone 16 Plus', price: 799, imageUrl: '/phones/iphone-16-plus.png', brand: 'Apple', screenInches: 6.7,
    tags: ['Apple', '2024', '6.7" large screen'],
    specs: { year: '2024', screen: '6.7" OLED', storage: '128 GB', battery: 'Up to 27 hours video', camera: '48 MP + 12 MP', weight: '199 g', chip: 'A18', unlock: 'Face ID', charging: 'USB-C' },
  },
  {
    $id: '2', name: 'Apple iPhone 16', price: 699, imageUrl: '/phones/iphone-16.png', brand: 'Apple', screenInches: 6.1,
    tags: ['Apple', '2024', '6.1" medium screen'],
    specs: { year: '2024', screen: '6.1" OLED', storage: '128 GB', battery: 'Up to 22 hours video', camera: '48 MP + 12 MP', weight: '170 g', chip: 'A18', unlock: 'Face ID', charging: 'USB-C' },
  },
  {
    $id: '3', name: 'Apple iPhone 15 Pro', price: 699, imageUrl: '/phones/iphone-15-pro.png', brand: 'Apple', screenInches: 6.1,
    tags: ['Apple', '2023', '6.1" medium screen'],
    specs: { year: '2023', screen: '6.1" OLED', storage: '128 GB', battery: 'Up to 23 hours video', camera: '48 MP + 12 MP + 12 MP', weight: '187 g', chip: 'A17 Pro', unlock: 'Face ID', charging: 'USB-C' },
  },
  {
    $id: '4', name: 'Apple iPhone 15', price: 599, imageUrl: '/phones/iphone-15.png', brand: 'Apple', screenInches: 6.1,
    tags: ['Apple', '2023', '6.1" medium screen'],
    specs: { year: '2023', screen: '6.1" OLED', storage: '128 GB', battery: 'Up to 20 hours video', camera: '48 MP + 12 MP', weight: '171 g', chip: 'A16 Bionic', unlock: 'Face ID', charging: 'USB-C' },
  },
  {
    $id: '5', name: 'Apple iPhone 14', price: 499, imageUrl: '/phones/iphone-14.png', brand: 'Apple', screenInches: 6.1,
    tags: ['Apple', '2022', '6.1" medium screen'],
    specs: { year: '2022', screen: '6.1" OLED', storage: '128 GB', battery: 'Up to 20 hours video', camera: '12 MP + 12 MP', weight: '172 g', chip: 'A15 Bionic', unlock: 'Face ID', charging: 'Lightning' },
  },
  {
    $id: '6', name: 'Apple iPhone 13', price: 429, imageUrl: '/phones/iphone-13.png', brand: 'Apple', screenInches: 6.1,
    tags: ['Apple', '2021', '6.1" medium screen'],
    specs: { year: '2021', screen: '6.1" OLED', storage: '128 GB', battery: 'Up to 19 hours video', camera: '12 MP + 12 MP', weight: '174 g', chip: 'A15 Bionic', unlock: 'Face ID', charging: 'Lightning' },
  },
  {
    $id: '7', name: 'Apple iPhone SE (2022)', price: 329, imageUrl: '/phones/iphone-se-2022.png', brand: 'Apple', screenInches: 4.7,
    tags: ['Apple', '2022', '4.7" small screen'],
    specs: { year: '2022', screen: '4.7" LCD', storage: '64 GB', battery: 'Up to 15 hours video', camera: '12 MP', weight: '144 g', chip: 'A15 Bionic', unlock: 'Touch ID (home button)', charging: 'Lightning' },
  },
  {
    $id: '8', name: 'Apple iPhone 12', price: 349, imageUrl: '/phones/iphone-12.png', brand: 'Apple', screenInches: 6.1,
    tags: ['Apple', '2020', '6.1" medium screen'],
    specs: { year: '2020', screen: '6.1" OLED', storage: '64 GB', battery: 'Up to 17 hours video', camera: '12 MP + 12 MP', weight: '164 g', chip: 'A14 Bionic', unlock: 'Face ID', charging: 'Lightning' },
  },
]

// Tablets and laptops: placeholder specs and no photos yet (cards show a "No image" box).
const device = (category, o) => ({
  category,
  brand: o.brand,
  $id: o.$id,
  name: o.name,
  price: o.price,
  imageUrl: o.imageUrl ?? null,
  screenInches: o.screenInches,
  tags: [o.brand, o.specs.year, `${o.screenInches}" ${screenCategory(o.screenInches, category)} screen`],
  specs: o.specs,
})

samplePhones.push(
  device('tablet', { $id: '9', brand: 'Apple', name: 'Apple iPad (10th generation)', price: 349, screenInches: 10.9,
    specs: { year: '2022', screen: '10.9" LCD', storage: '64 GB', battery: 'Up to 10 hours web', camera: '12 MP', weight: '477 g', chip: 'A14 Bionic', unlock: 'Touch ID (top button)', charging: 'USB-C', os: 'iPadOS' } }),
  device('tablet', { $id: '10', brand: 'Apple', name: 'Apple iPad Air 11" (M2)', price: 599, screenInches: 11,
    specs: { year: '2024', screen: '11" LCD', storage: '128 GB', battery: 'Up to 10 hours web', camera: '12 MP', weight: '462 g', chip: 'M2', unlock: 'Touch ID (top button)', charging: 'USB-C', os: 'iPadOS' } }),
  device('tablet', { $id: '11', brand: 'Apple', name: 'Apple iPad mini (A17 Pro)', price: 499, screenInches: 8.3,
    specs: { year: '2024', screen: '8.3" LCD', storage: '128 GB', battery: 'Up to 10 hours web', camera: '12 MP', weight: '293 g', chip: 'A17 Pro', unlock: 'Touch ID (top button)', charging: 'USB-C', os: 'iPadOS' } }),
  device('tablet', { $id: '12', brand: 'Samsung', name: 'Samsung Galaxy Tab A9+', price: 229, screenInches: 11,
    specs: { year: '2023', screen: '11" LCD', storage: '64 GB', battery: '7,040 mAh', camera: '8 MP', weight: '480 g', chip: 'Snapdragon 695', unlock: 'Face recognition', charging: 'USB-C', os: 'Android' } }),
  device('tablet', { $id: '13', brand: 'Amazon', name: 'Amazon Fire HD 10', price: 140, screenInches: 10.1,
    specs: { year: '2023', screen: '10.1" LCD', storage: '32 GB', battery: 'Up to 13 hours', camera: '5 MP', weight: '433 g', chip: 'Octa-core 2.0 GHz', unlock: 'PIN or password', charging: 'USB-C', os: 'Fire OS' } }),

  device('laptop', { $id: '14', brand: 'Apple', name: 'Apple MacBook Air 13" (M3)', price: 1099, screenInches: 13.6,
    specs: { year: '2024', screen: '13.6" Retina', memory: '8 GB', storage: '256 GB', battery: 'Up to 18 hours', weight: '1.24 kg', chip: 'M3', unlock: 'Touch ID', charging: 'MagSafe or USB-C', os: 'macOS' } }),
  device('laptop', { $id: '15', brand: 'Apple', name: 'Apple MacBook Air 15" (M3)', price: 1299, screenInches: 15.3,
    specs: { year: '2024', screen: '15.3" Retina', memory: '8 GB', storage: '256 GB', battery: 'Up to 18 hours', weight: '1.51 kg', chip: 'M3', unlock: 'Touch ID', charging: 'MagSafe or USB-C', os: 'macOS' } }),
  device('laptop', { $id: '16', brand: 'Dell', name: 'Dell Inspiron 15', price: 549, screenInches: 15.6,
    specs: { year: '2024', screen: '15.6" Full HD', memory: '8 GB', storage: '512 GB', battery: 'Up to 8 hours', weight: '1.65 kg', chip: 'Intel Core i5', unlock: 'Password or PIN', charging: 'Mains charger', os: 'Windows 11' } }),
  device('laptop', { $id: '17', brand: 'Lenovo', name: 'Lenovo IdeaPad Slim 3', price: 449, screenInches: 15.6,
    specs: { year: '2024', screen: '15.6" Full HD', memory: '8 GB', storage: '256 GB', battery: 'Up to 8 hours', weight: '1.62 kg', chip: 'AMD Ryzen 5', unlock: 'Password or PIN', charging: 'USB-C', os: 'Windows 11' } }),
  device('laptop', { $id: '18', brand: 'HP', name: 'HP 14" Laptop', price: 379, screenInches: 14,
    specs: { year: '2024', screen: '14" HD', memory: '8 GB', storage: '256 GB', battery: 'Up to 10 hours', weight: '1.4 kg', chip: 'Intel Core i3', unlock: 'Password or PIN', charging: 'Mains charger', os: 'Windows 11' } }),
)
