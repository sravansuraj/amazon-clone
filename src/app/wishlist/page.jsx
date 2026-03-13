'use client';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/Toast';

function Stars({ rating }) {
  return <span className="stars text-sm">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>;
}

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <span className="text-white text-sm ml-2">/ Wishlist</span>
        <button onClick={() => router.push('/')} className="text-white text-sm ml-auto hover:underline">← Back to shopping</button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ❤️ Your Wishlist <span className="text-gray-400 font-normal text-lg">({wishlist.length} items)</span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="text-6xl mb-4">🤍</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Save items you love by clicking the heart icon on any product</p>
            <button onClick={() => router.push('/')} className="btn-add w-auto px-8 py-3">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map(product => (
              <div key={product.id} className="product-card bg-white rounded-lg p-4 border border-gray-200 flex flex-col relative">
                <button onClick={() => toggleWishlist(product)} className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform">❤️</button>
                <div className="flex items-center justify-center h-36 bg-gray-50 rounded text-6xl mb-3 cursor-pointer" onClick={() => router.push(`/product/${product.id}`)}>
                  {product.emoji}
                </div>
                {product.badge && <span className="inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded mb-2 self-start">{product.badge}</span>}
                <p className="text-sm font-medium text-gray-900 leading-snug mb-2 flex-1 cursor-pointer hover:text-orange-600 line-clamp-2" onClick={() => router.push(`/product/${product.id}`)}>
                  {product.name}
                </p>
                <div className="flex items-center gap-1 mb-1">
                  <Stars rating={product.rating} />
                  <span className="text-gray-400 text-xs">({product.reviews.toLocaleString()})</span>
                </div>
                {product.prime && <p className="prime mb-1 text-xs">✓ prime</p>}
                <p className="text-xl font-bold text-gray-900 mb-3">
                  <span className="text-sm align-top mt-1 inline-block">₹</span>{product.price.toLocaleString()}
                </p>
                <button className="btn-add mb-2" onClick={() => addToCart(product)}>Add to Cart</button>
                <button className="w-full border border-gray-300 rounded-full py-1.5 text-xs text-gray-500 hover:bg-gray-50" onClick={() => toggleWishlist(product)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
}