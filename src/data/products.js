export const products = [
  { id: 1, name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", price: 24990, rating: 4.8, reviews: 12043, category: "Electronics", emoji: "🎧", badge: "Best Seller", prime: true, stock: 12 },
  { id: 2, name: "Kindle Paperwhite (8GB) — 6.8\" display, adjustable warm light", price: 14499, rating: 4.7, reviews: 89032, category: "Electronics", emoji: "📱", badge: "Amazon's Choice", prime: true, stock: 8 },
  { id: 3, name: "Clean Code: A Handbook of Agile Software Craftsmanship", price: 899, rating: 4.6, reviews: 5421, category: "Books", emoji: "📘", prime: true, stock: 34 },
  { id: 4, name: "Logitech MX Master 3S Wireless Performance Mouse", price: 8995, rating: 4.7, reviews: 3201, category: "Electronics", emoji: "🖱️", prime: true, stock: 3 },
  { id: 5, name: "Nike Dri-FIT Men's Running T-Shirt", price: 1499, rating: 4.4, reviews: 2310, category: "Clothing", emoji: "👕", badge: "Sale", stock: 19 },
  { id: 6, name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 5.7L", price: 7999, rating: 4.6, reviews: 41200, category: "Home", emoji: "🍲", badge: "Deal", prime: true, stock: 7 },
  { id: 7, name: "The Pragmatic Programmer: 20th Anniversary Edition", price: 1199, rating: 4.8, reviews: 4567, category: "Books", emoji: "💻", prime: true, stock: 22 },
  { id: 8, name: "Samsung 32\" FHD Monitor with AMD FreeSync (LS32C330)", price: 16999, rating: 4.5, reviews: 7823, category: "Electronics", emoji: "🖥️", prime: true, stock: 5 },
  { id: 9, name: "Boldfit Yoga Mat Anti-Slip 6mm Thick with Carry Bag", price: 799, rating: 4.3, reviews: 18900, category: "Sports", emoji: "🧘", badge: "Sale", stock: 41 },
  { id: 10, name: "boAt Airdopes 141 Bluetooth True Wireless Earbuds", price: 1299, rating: 4.2, reviews: 98321, category: "Electronics", emoji: "🎵", badge: "Budget Pick", prime: true, stock: 2 },
  { id: 11, name: "L'Oreal Paris Revitalift 1.5% Pure Hyaluronic Acid Serum", price: 649, rating: 4.4, reviews: 23100, category: "Beauty", emoji: "✨", stock: 15 },
  { id: 12, name: "Philips Hue White & Color Smart Bulb Starter Kit", price: 5999, rating: 4.5, reviews: 8912, category: "Home", emoji: "💡", prime: true, stock: 9 },
  { id: 13, name: "Levi's Men's 511 Slim Jeans", price: 2499, rating: 4.3, reviews: 11200, category: "Clothing", emoji: "👖", prime: true, stock: 28 },
  { id: 14, name: "Dyson V12 Detect Slim Cordless Vacuum Cleaner", price: 44900, rating: 4.7, reviews: 3100, category: "Home", emoji: "🌀", badge: "Premium", prime: true, stock: 4 },
  { id: 15, name: "Fujifilm Instax Mini 12 Instant Camera", price: 6999, rating: 4.6, reviews: 15600, category: "Electronics", emoji: "📷", badge: "Trending", prime: true, stock: 6 },
];

export const categories = [
  { name: "Electronics", emoji: "📱" },
  { name: "Books", emoji: "📚" },
  { name: "Clothing", emoji: "👗" },
  { name: "Home", emoji: "🏠" },
  { name: "Sports", emoji: "⚽" },
  { name: "Beauty", emoji: "💄" },
];

export const coupons = {
  'SRAVAN10': { discount: 10, type: 'percent', desc: '10% off on all orders' },
  'SAVE200': { discount: 200, type: 'flat', desc: '₹200 off on orders above ₹999' },
  'PRIME50': { discount: 50, type: 'flat', desc: '₹50 off for Prime members' },
  'NEWUSER': { discount: 15, type: 'percent', desc: '15% off for new users' },
};