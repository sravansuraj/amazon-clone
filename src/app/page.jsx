'use client';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import CartPanel from '@/components/CartPanel';
import AISearch from '@/components/AISearch';
import Toast from '@/components/Toast';
import ChatBot from '@/components/ChatBot';
import CompareBar from '@/components/CompareBar';
import { products, categories } from '@/data/products';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [highlightIds, setHighlightIds] = useState([]);
  const [aiSectionTitle, setAiSectionTitle] = useState('');
  const [liveQuery, setLiveQuery] = useState('');
  const [compareList, setCompareList] = useState([]);
  const { recentlyViewed } = useRecentlyViewed();

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setHighlightIds([]);
    setAiSectionTitle('');
    setSort('featured');
    setLiveQuery('');
  };

  const handleTopSearch = (query) => {
    setLiveQuery(query);
  };

  const handleAIResults = (ids, query) => {
    setHighlightIds(ids);
    setAiSectionTitle(ids.length > 0 ? `AI Results for "${query}"` : '');
    setActiveCategory('all');
    setLiveQuery('');
  };

  const handleLiveSearch = (query) => {
    setLiveQuery(query);
    if (query) {
      setHighlightIds([]);
      setAiSectionTitle('');
      setActiveCategory('all');
    }
  };

  const handleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  };

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all' ? [...products] : products.filter(p => p.category === activeCategory);

    if (liveQuery.trim()) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(liveQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(liveQuery.toLowerCase())
      );
    }

    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'prime') list = list.filter(p => p.prime);

    if (highlightIds.length) {
      list.sort((a, b) => highlightIds.includes(b.id) - highlightIds.includes(a.id));
    }
    return list;
  }, [activeCategory, sort, highlightIds, liveQuery]);

  const sectionTitle = liveQuery
    ? `Results for "${liveQuery}" (${filteredProducts.length})`
    : aiSectionTitle || (activeCategory === 'all' ? 'Featured Products' : activeCategory);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        onSearch={handleTopSearch}
        onCategoryClick={handleCategoryClick}
        onLiveSearch={handleLiveSearch}
      />
      <AISearch onResults={handleAIResults} />

      <main className="max-w-7xl mx-auto px-4 py-6" style={{ paddingBottom: compareList.length > 0 ? '100px' : '24px' }}>
        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && !liveQuery && !aiSectionTitle && activeCategory === 'all' && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🕐 Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentlyViewed.map(product => (
                <div
                  key={product.id}
                  onClick={() => window.location.href = `/product/${product.id}`}
                  className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow shrink-0 w-36"
                >
                  <div className="text-4xl text-center mb-2">{product.emoji}</div>
                  <p className="text-xs text-gray-700 line-clamp-2 text-center leading-snug mb-1">{product.name}</p>
                  <p className="text-sm font-bold text-center text-gray-900">₹{product.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Pills */}
        {activeCategory === 'all' && !aiSectionTitle && !liveQuery && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-3xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-medium text-gray-800">{cat.name}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Sort:</span>
          {[
            { key: 'featured', label: 'Featured' },
            { key: 'price-low', label: 'Price: Low to High' },
            { key: 'price-high', label: 'Price: High to Low' },
            { key: 'rating', label: 'Top Rated' },
            { key: 'prime', label: '✓ Prime Only' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sort === s.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Products */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-gray-700">No results found for "{liveQuery}"</p>
            <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                highlight={highlightIds.includes(product.id)}
                onCompare={handleCompare}
                isComparing={compareList.some(p => p.id === product.id)}
              />
            ))}
          </div>
        )}
      </main>

      <CartPanel />
      <CompareBar
        compareList={compareList}
        onRemove={id => setCompareList(prev => prev.filter(p => p.id !== id))}
        onClear={() => setCompareList([])}
      />
      <ChatBot />
      <Toast />
    </div>
  );
}