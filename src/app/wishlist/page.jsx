'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import CartPanel from '@/components/CartPanel';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        onSearch={() => router.push('/')}
        onCategoryClick={() => router.push('/')}
        onLiveSearch={() => {}}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ❤️ Your Wishlist <span className="text-gray-400 font-normal text-lg">({wishlist.length} items)</span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Save items you love by clicking the ❤️ on any product</p>
            <button onClick={() => router.push('/')} className="btn-add w-auto px-8 py-3">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wishlist.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
                <div
                  className="text-5xl text-center py-4 cursor-pointer"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {product.emoji}
                </div>
                <p className="text-xs text-gray-700 line-clamp-2 text-center mb-1 leading-snug">{product.name}</p>
                <p className="text-sm font-bold text-center mb-3">₹{product.price.toLocaleString()}</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { addItem(product); }}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-semibold py-1.5 rounded-full"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="w-full border border-red-300 text-red-500 hover:bg-red-50 text-xs font-medium py-1.5 rounded-full"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <CartPanel />
      <Toast />
    </div>
  );
}