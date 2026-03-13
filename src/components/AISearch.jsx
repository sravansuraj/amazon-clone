'use client';
import { useState } from 'react';

export default function AISearch({ onResults }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(data.message);
      onResults(data.productIds, query, data.message);
    } catch (e) {
      setError('AI search unavailable. Check your API key in .env.local');
      onResults([], query, '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Find exactly what you need with AI</h2>
        <p className="text-sm text-gray-500">Describe what you're looking for in plain English</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl p-5 shadow-md border border-yellow-200">
        <h3 className="text-sm font-semibold text-yellow-600 mb-3">✨ AI Smart Search</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. I need a gift for a programmer under ₹2000..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg whitespace-nowrap"
          >
            {loading ? (
              <span className="flex gap-1 items-center">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </span>
            ) : 'Search with AI'}
          </button>
        </div>

        {message && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
            <strong>🤖 AI says:</strong> {message}
          </div>
        )}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
