'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/Toast';

function Stars({ rating }) {
  return <span className="stars">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>;
}

const attributes = [
  { label: 'Price', key: 'price', format: v => `₹${v.toLocaleString()}` },
  { label: 'Rating', key: 'rating', format: v => `${v} / 5` },
  { label: 'Reviews', key: 'reviews', format: v => v.toLocaleString() },
  { label: 'Category', key: 'category', format: v => v },
  { label: 'Prime', key: 'prime', format: v => v ? '✓ Yes' : '✗ No' },
  { label: 'Badge', key: 'badge', format: v => v || '—' },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const ids = searchParams.get('ids')?.split(',').map(Number) || [];
  const compareProducts = ids.map(id => products.find(p => p.id === id)).filter(Boolean);

  if (compareProducts.length < 2) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <p className="text-xl font-semibold mb-2">Not enough products to compare</p>
          <p className="text-gray-500 text-sm mb-6">Select at least 2 products from the homepage</p>
          <button onClick={() => router.push('/')} className="btn-add w-auto px-8">Go Shopping</button>
        </div>
      </div>
    );
  }

  // Find best value for price (lowest) and rating (highest)
  const lowestPrice = Math.min(...compareProducts.map(p => p.price));
  const highestRating = Math.max(...compareProducts.map(p => p.rating));

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <span className="text-white text-sm ml-2">/ Compare Products</span>
        <button onClick={() => router.push('/')} className="text-white text-sm ml-auto hover:underline">← Back</button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">⚖️ Product Comparison</h1>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Product headers */}
          <div className={`grid border-b border-gray-200`} style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}>
            <div className="p-4 bg-gray-50 border-r border-gray-200" />
            {compareProducts.map(product => (
              <div key={product.id} className="p-4 text-center border-r border-gray-200 last:border-0">
                <div className="text-5xl mb-2">{product.emoji}</div>
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-2">{product.name}</p>
                {product.prime && <p className="prime text-xs mb-2">✓ prime</p>}
                {product.price === lowestPrice && (
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mb-2">Best Price</span>
                )}
                {product.rating === highestRating && (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mb-2">Top Rated</span>
                )}
                <button
                  onClick={() => addToCart(product)}
                  className="btn-add text-xs py-1.5 mt-1"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Attribute rows */}
          {attributes.map((attr, i) => (
            <div
              key={attr.key}
              className={`grid border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}
            >
              <div className="p-4 text-sm font-medium text-gray-600 border-r border-gray-200 flex items-center">
                {attr.label}
              </div>
              {compareProducts.map(product => {
                const val = product[attr.key];
                const formatted = attr.format(val);
                const isBest =
                  (attr.key === 'price' && val === lowestPrice) ||
                  (attr.key === 'rating' && val === highestRating);

                return (
                  <div key={product.id} className={`p-4 text-sm text-center border-r border-gray-200 last:border-0 flex items-center justify-center ${isBest ? 'font-bold text-green-600' : 'text-gray-800'}`}>
                    {attr.key === 'rating' ? (
                      <div className="text-center">
                        <Stars rating={val} />
                        <p className={`text-xs mt-0.5 ${isBest ? 'text-green-600 font-bold' : 'text-gray-500'}`}>{formatted}</p>
                      </div>
                    ) : attr.key === 'prime' ? (
                      <span className={val ? 'text-blue-500 font-semibold' : 'text-gray-400'}>{formatted}</span>
                    ) : (
                      formatted
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h3 className="text-base font-bold text-yellow-800 mb-3">🏆 Quick Verdict</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">💰 Best Value</p>
              <p className="text-sm text-gray-800">{compareProducts.find(p => p.price === lowestPrice)?.name.split(' ').slice(0, 4).join(' ')}...</p>
              <p className="text-xs text-green-600 mt-0.5">₹{lowestPrice.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">⭐ Best Rated</p>
              <p className="text-sm text-gray-800">{compareProducts.find(p => p.rating === highestRating)?.name.split(' ').slice(0, 4).join(' ')}...</p>
              <p className="text-xs text-blue-600 mt-0.5">{highestRating} / 5 stars</p>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-5xl">⚖️</div></div>}>
      <CompareContent />
    </Suspense>
  );
}