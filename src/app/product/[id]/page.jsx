'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/Toast';

function Stars({ rating, interactive = false, onRate }) {
  const full = Math.floor(rating);
  if (interactive) {
    return (
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <button key={i} onClick={() => onRate(i)} className="text-2xl hover:scale-110 transition-transform">
            <span className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          </button>
        ))}
      </div>
    );
  }
  return <span className="stars">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>;
}

const staticReviews = [
  { user: 'Rahul M.', rating: 5, date: 'Jan 2026', text: 'Absolutely love this product! Exceeded my expectations in every way. Build quality is top-notch.' },
  { user: 'Priya S.', rating: 4, date: 'Dec 2025', text: 'Great value for money. Works perfectly and arrived well packaged. Would recommend!' },
  { user: 'Arjun K.', rating: 5, date: 'Feb 2026', text: 'This is my second purchase. The first one lasted years and I trust this brand completely.' },
  { user: 'Neha R.', rating: 3, date: 'Jan 2026', text: 'Decent product but delivery was delayed. Quality is okay for the price point.' },
];

export default function ProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const product = products.find(p => p.id === parseInt(id));
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // User review state
  const [userReviews, setUserReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (product) addToRecentlyViewed(product);
    loadReviews();
  }, [product]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', parseInt(id))
      .order('created_at', { ascending: false });
    if (data) {
      setUserReviews(data);
      if (user) {
        const mine = data.find(r => r.user_id === user.id);
        if (mine) { setMyReview(mine); setReviewForm({ rating: mine.rating, title: mine.title || '', body: mine.body }); }
      }
    }
  };

  const submitReview = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!reviewForm.body.trim()) return;
    setSubmittingReview(true);
    const reviewData = {
      user_id: user.id,
      product_id: parseInt(id),
      rating: reviewForm.rating,
      title: reviewForm.title,
      body: reviewForm.body,
    };
    if (myReview) {
      await supabase.from('reviews').update(reviewData).eq('id', myReview.id);
    } else {
      await supabase.from('reviews').insert(reviewData);
    }
    setSubmittingReview(false);
    setReviewSuccess(true);
    setShowReviewForm(false);
    loadReviews();
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const deleteReview = async () => {
    if (!myReview) return;
    await supabase.from('reviews').delete().eq('id', myReview.id);
    setMyReview(null);
    setReviewForm({ rating: 5, title: '', body: '' });
    loadReviews();
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-xl font-semibold mb-4">Product not found</p>
        <button onClick={() => router.push('/')} className="btn-add w-auto px-8">Back to Home</button>
      </div>
    </div>
  );

  const wishlisted = isWishlisted(product.id);
  const handleAddToCart = () => { for (let i = 0; i < qty; i++) addItem(product); };
  const allReviews = [...userReviews, ...staticReviews];

  const handleAISummary = async () => {
    setSummaryLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch('/api/ai-review-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: product.name, rating: product.rating, reviews: allReviews }),
      });
      const data = await res.json();
      setAiSummary(data);
    } catch {
      setAiSummary({ error: 'Could not generate summary. Please try again.' });
    }
    setSummaryLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <button onClick={() => router.push('/')} className="text-white text-sm ml-auto hover:underline">← Back to results</button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-6">
          <span className="cursor-pointer hover:underline hover:text-orange-500" onClick={() => router.push('/')}>Home</span>
          {' › '}
          <span className="cursor-pointer hover:underline hover:text-orange-500" onClick={() => router.push('/')}>{product.category}</span>
          {' › '}
          <span className="text-gray-800">{product.name.split(' ').slice(0, 4).join(' ')}...</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-xl p-8 flex items-center justify-center border border-gray-200 relative">
            <div className="text-9xl">{product.emoji}</div>
            <button onClick={() => toggleWishlist(product)} className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform">
              {wishlisted ? '❤️' : '🤍'}
            </button>
            {product.badge && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded">{product.badge}</span>
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3 leading-snug">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <Stars rating={product.rating} />
              <span className="text-orange-500 text-sm font-medium">{product.rating}</span>
              <span className="text-blue-600 text-sm cursor-pointer hover:underline" onClick={() => setActiveTab('reviews')}>
                {product.reviews.toLocaleString()} ratings
              </span>
            </div>
            {product.prime && <div className="prime text-sm mb-3">✓ prime — FREE delivery Tomorrow</div>}
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <p className="text-3xl font-bold text-gray-900">
                <span className="text-lg align-top mt-1 inline-block">₹</span>{product.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>
            <p className="text-green-600 font-semibold mb-4">In Stock</p>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">Qty:</label>
              <select value={qty} onChange={e => setQty(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-yellow-400 bg-white">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn-add text-base py-3" onClick={handleAddToCart}>Add to Cart</button>
              <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-full text-base"
                onClick={() => { handleAddToCart(); router.push('/checkout'); }}>
                Buy Now
              </button>
              <button onClick={() => toggleWishlist(product)} className="w-full border border-gray-300 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50">
                {wishlisted ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['overview', 'reviews', 'details'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}>
                {tab} {tab === 'reviews' && userReviews.length > 0 && `(+${userReviews.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-orange-500">•</span> Premium quality {product.category.toLowerCase()} product with industry-leading performance</li>
                <li className="flex gap-2"><span className="text-orange-500">•</span> Trusted by {product.reviews.toLocaleString()}+ customers with {product.rating}/5 average rating</li>
                {product.prime && <li className="flex gap-2"><span className="text-orange-500">•</span> Eligible for Amazon Prime — free next-day delivery</li>}
                <li className="flex gap-2"><span className="text-orange-500">•</span> 1-year manufacturer warranty included</li>
                <li className="flex gap-2"><span className="text-orange-500">•</span> Easy returns within 30 days of delivery</li>
              </ul>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* AI Summary */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm font-semibold text-yellow-700">✨ AI Review Summary</p>
                      <p className="text-xs text-yellow-600 mt-0.5">Let AI analyze all reviews and give you a quick verdict</p>
                    </div>
                    <button onClick={handleAISummary} disabled={summaryLoading}
                      className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg">
                      {summaryLoading ? <span className="flex gap-1 items-center"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></span> : 'Summarize Reviews'}
                    </button>
                  </div>
                  {aiSummary && !aiSummary.error && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-700">{aiSummary.summary}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">👍 Pros</p>
                          <ul className="space-y-1">{aiSummary.pros?.map((p, i) => <li key={i} className="text-xs text-green-700">• {p}</li>)}</ul>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">👎 Cons</p>
                          <ul className="space-y-1">{aiSummary.cons?.map((c, i) => <li key={i} className="text-xs text-red-700">• {c}</li>)}</ul>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">🤖 AI Verdict</p>
                        <p className="text-sm text-blue-700">{aiSummary.verdict}</p>
                      </div>
                    </div>
                  )}
                  {aiSummary?.error && <p className="text-sm text-red-500 mt-2">{aiSummary.error}</p>}
                </div>

                {/* Write a review */}
                <div className="mb-6">
                  {reviewSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 mb-3">
                      ✅ Review submitted successfully!
                    </div>
                  )}
                  {!showReviewForm && (
                    <button
                      onClick={() => { if (!user) { router.push('/auth/login'); return; } setShowReviewForm(true); }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-colors"
                    >
                      {myReview ? '✏️ Edit your review' : '✍️ Write a review'}
                    </button>
                  )}
                  {showReviewForm && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <h3 className="font-semibold text-gray-900 mb-3">{myReview ? 'Edit your review' : 'Write a review'}</h3>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Your rating</p>
                        <Stars rating={reviewForm.rating} interactive onRate={r => setReviewForm(f => ({ ...f, rating: r }))} />
                      </div>
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Title (optional)</label>
                        <input type="text" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Summarize your experience"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
                      </div>
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Review</label>
                        <textarea value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                          placeholder="Share your experience with this product..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={submitReview} disabled={submittingReview || !reviewForm.body.trim()}
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-lg text-sm disabled:opacity-60">
                          {submittingReview ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                        </button>
                        <button onClick={() => setShowReviewForm(false)} className="px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
                        {myReview && (
                          <button onClick={deleteReview} className="px-4 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50">Delete</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-4">
                  <div className="text-5xl font-bold text-gray-900">{product.rating}</div>
                  <div>
                    <Stars rating={product.rating} />
                    <p className="text-sm text-gray-500 mt-1">Based on {product.reviews.toLocaleString()} ratings + {userReviews.length} user reviews</p>
                  </div>
                </div>

                {/* User reviews */}
                {userReviews.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Reviews ({userReviews.length})</h3>
                    <div className="space-y-4">
                      {userReviews.map(r => (
                        <div key={r.id} className="pb-4 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">U</div>
                            <span className="text-sm font-medium">{r.user_id === user?.id ? 'You' : 'User'}</span>
                            {r.user_id === user?.id && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Your review</span>}
                            <span className="text-xs text-gray-400 ml-auto">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                          <Stars rating={r.rating} />
                          {r.title && <p className="text-sm font-semibold text-gray-800 mt-1">{r.title}</p>}
                          <p className="text-sm text-gray-700 mt-1">{r.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Static reviews */}
                <div className="space-y-5">
                  {staticReviews.map((r, i) => (
                    <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">{r.user[0]}</div>
                        <span className="text-sm font-medium">{r.user}</span>
                        <span className="text-xs text-gray-400 ml-auto">{r.date}</span>
                      </div>
                      <Stars rating={r.rating} />
                      <p className="text-sm text-gray-700 mt-1">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Brand', product.name.split(' ')[0]],
                    ['Category', product.category],
                    ['Rating', `${product.rating} / 5`],
                    ['Total Reviews', product.reviews.toLocaleString()],
                    ['Price', `₹${product.price.toLocaleString()}`],
                    ['Availability', 'In Stock'],
                    ['Delivery', product.prime ? 'FREE Prime Delivery' : 'Standard Delivery ₹40'],
                    ['Returns', '30-day return policy'],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2.5 text-gray-500 w-1/3">{k}</td>
                      <td className="py-2.5 text-gray-900 font-medium">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}