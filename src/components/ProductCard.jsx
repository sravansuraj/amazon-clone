'use client';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

function Stars({ rating }) {
  const full = Math.floor(rating);
  return (
    <span className="stars text-sm">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

function StockBadge({ stock }) {
  if (stock > 10) return null;
  if (stock === 0) return <p className="text-xs text-red-600 font-semibold mb-1">❌ Out of Stock</p>;
  if (stock <= 3) return <p className="text-xs text-red-500 font-semibold mb-1">🔥 Only {stock} left!</p>;
  return <p className="text-xs text-orange-500 font-medium mb-1">⚡ Only {stock} left in stock</p>;
}

export default function ProductCard({ product, highlight, onCompare, isComparing }) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const router = useRouter();
  const wishlisted = isWishlisted(product.id);

  const handleOpen = () => {
    addToRecentlyViewed(product);
    router.push(`/product/${product.id}`);
  };

  return (
    <div className={`product-card bg-white rounded-lg p-4 border flex flex-col relative ${highlight ? 'product-highlight' : 'border-gray-200'} ${isComparing ? 'ring-2 ring-blue-400' : ''}`}>
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 text-xl z-10 hover:scale-110 transition-transform"
      >
        {wishlisted ? '❤️' : '🤍'}
      </button>

      <div className="flex items-center justify-center h-40 bg-gray-50 rounded text-6xl mb-3 cursor-pointer" onClick={handleOpen}>
        {product.emoji}
      </div>

      {product.badge && (
        <span className="inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded mb-2 self-start">
          {product.badge}
        </span>
      )}

      <p className="text-sm font-medium text-gray-900 leading-snug mb-2 flex-1 cursor-pointer hover:text-orange-600" onClick={handleOpen}>
        {product.name}
      </p>

      <div className="flex items-center gap-1 mb-1">
        <Stars rating={product.rating} />
        <span className="text-gray-500 text-xs">({product.reviews.toLocaleString()})</span>
      </div>

      {product.prime && <p className="prime mb-1">✓ prime</p>}

      <StockBadge stock={product.stock} />

      <p className="text-xl font-bold text-gray-900 mb-3">
        <span className="text-sm align-top mt-1 inline-block">₹</span>
        {product.price.toLocaleString()}
      </p>

      <button
        className="btn-add mb-2"
        onClick={() => addItem(product)}
        disabled={product.stock === 0}
        style={product.stock === 0 ? { background: '#e0e0e0', cursor: 'not-allowed' } : {}}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>

      <button
        onClick={() => onCompare(product)}
        className={`w-full text-xs py-1.5 rounded-full border transition-colors ${isComparing ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'}`}
      >
        {isComparing ? '✓ Comparing' : '+ Compare'}
      </button>
    </div>
  );
}