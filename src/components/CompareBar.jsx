'use client';
import { useRouter } from 'next/navigation';

export default function CompareBar({ compareList, onRemove, onClear }) {
  const router = useRouter();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-yellow-400 shadow-2xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Compare ({compareList.length}/3):
          </span>
          {compareList.map(product => (
            <div key={product.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 shrink-0">
              <span className="text-xl">{product.emoji}</span>
              <span className="text-xs text-gray-700 max-w-24 truncate">{product.name.split(' ').slice(0, 3).join(' ')}</span>
              <button
                onClick={() => onRemove(product.id)}
                className="text-gray-400 hover:text-red-500 text-sm ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 3 - compareList.length }).map((_, i) => (
            <div key={i} className="flex items-center justify-center w-28 h-9 border-2 border-dashed border-gray-300 rounded-lg shrink-0">
              <span className="text-xs text-gray-400">+ Add item</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 border border-gray-300 rounded-lg"
          >
            Clear
          </button>
          <button
            onClick={() => router.push(`/compare?ids=${compareList.map(p => p.id).join(',')}`)}
            disabled={compareList.length < 2}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-lg"
          >
            Compare Now →
          </button>
        </div>
      </div>
    </div>
  );
}