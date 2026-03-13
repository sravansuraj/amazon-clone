'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTheme } from '@/context/ThemeContext';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { products } from '@/data/products';

export default function Navbar({ onSearch, onCategoryClick, onLiveSearch }) {
  const { totalItems, setIsOpen } = useCart();
  const { wishlist } = useWishlist();
  const { dark, setDark } = useTheme();
  const { orders } = useOrders();
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const router = useRouter();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 0) {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        p.category.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setFiltered(results);
      setShowDropdown(true);
      onLiveSearch(val);
    } else {
      setShowDropdown(false);
      onLiveSearch('');
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowDropdown(false);
    }
  };

  const handleSelectProduct = (product) => {
    setShowDropdown(false);
    setQuery('');
    router.push(`/product/${product.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="flex items-center gap-3 px-4 h-14">
        <div
          className="text-2xl font-bold text-yellow-400 tracking-tight whitespace-nowrap cursor-pointer"
          onClick={() => onCategoryClick('all')}
        >
          amazon<span className="text-white">.clone</span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl h-10 relative" ref={searchRef}>
          <select className="bg-gray-100 border-none px-2 text-xs rounded-l cursor-pointer text-gray-700 outline-none">
            <option>All</option>
            <option>Electronics</option>
            <option>Books</option>
            <option>Clothing</option>
            <option>Home</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query && setShowDropdown(true)}
            placeholder="Search Amazon Clone"
            className="flex-1 border-none px-3 text-sm outline-none text-gray-800"
          />
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-4 rounded-r text-gray-800 text-lg">
            🔍
          </button>

          {showDropdown && filtered.length > 0 && (
            <div className="search-dropdown">
              {filtered.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="search-dropdown-item flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <span className="text-2xl">{product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category} · ₹{product.price.toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-yellow-500">{'★'.repeat(Math.floor(product.rating))}</span>
                </div>
              ))}
              <div
                onClick={handleSearch}
                className="search-dropdown-item px-4 py-2.5 cursor-pointer text-sm text-blue-600 font-medium text-center"
              >
                See all results for "{query}"
              </div>
            </div>
          )}
        </form>

        <div className="hidden md:flex items-center gap-1 ml-auto">
          <button
            onClick={() => setDark(!dark)}
            className="text-white text-xl px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className="text-white text-xs px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white cursor-pointer text-left"
              >
                <span className="block text-gray-300">Hello,</span>
                <strong className="text-sm truncate max-w-[120px] block">{user.email.split('@')[0]}</strong>
              </button>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="text-white text-xs px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white cursor-pointer text-left"
              >
                <span className="block text-gray-300">Hello, Sign in</span>
                <strong className="text-sm">Account & Lists</strong>
              </button>
            )}

            {showUserMenu && user && (
              <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 w-52 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); router.push('/orders'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  📦 Your Orders
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); router.push('/wishlist'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  ❤️ Your Wishlist
                </button>
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            onClick={() => router.push('/wishlist')}
            className="text-white text-xs px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white cursor-pointer"
          >
            <span className="block text-gray-300">Saved</span>
            <strong className="text-sm">Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</strong>
          </div>
          <div
            onClick={() => router.push('/orders')}
            className="text-white text-xs px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white cursor-pointer"
          >
            <span className="block text-gray-300">Returns</span>
            <strong className="text-sm">& Orders {orders.length > 0 && `(${orders.length})`}</strong>
          </div>
        </div>

        <button
          onClick={() => user ? setIsOpen(true) : router.push('/auth/login')}
          className="flex items-center gap-1 text-white px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white"
        >
          <span className="text-2xl">🛒</span>
          <strong className="text-sm hidden sm:block">Cart</strong>
          <span className="bg-yellow-400 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {totalItems}
          </span>
        </button>
      </div>

      <div className="sub-nav flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {['all', 'Electronics', 'Books', 'Clothing', 'Home', 'Sports', 'Beauty'].map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryClick(cat)}
            className="text-white text-sm whitespace-nowrap px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white"
          >
            {cat === 'all' ? 'All Departments' : cat}
          </button>
        ))}
        <button
          onClick={() => router.push('/wishlist')}
          className="text-yellow-300 text-sm whitespace-nowrap px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white ml-auto"
        >
          ❤️ Wishlist
        </button>
        <button
          onClick={() => router.push('/orders')}
          className="text-yellow-300 text-sm whitespace-nowrap px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white"
        >
          📦 Orders
        </button>
      </div>
    </nav>
  );
}