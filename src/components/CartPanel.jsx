'use client';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CartPanel() {
  const { cart, isOpen, setIsOpen, changeQty, removeItem, totalItems, totalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div className={`cart-panel fixed right-0 top-0 w-80 h-full bg-white z-50 flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="navbar px-4 py-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">🛒 Shopping Cart</h2>
          <button onClick={() => setIsOpen(false)} className="text-white text-2xl leading-none hover:text-gray-300">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                  <div className="w-14 h-14 bg-gray-50 rounded flex items-center justify-center text-3xl shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 leading-snug mb-1 line-clamp-2">{item.name}</p>
                    <p className="text-sm font-bold">₹{(item.price * item.qty).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 bg-gray-200 rounded text-sm flex items-center justify-center hover:bg-gray-300">−</button>
                      <span className="text-xs">{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 bg-gray-200 rounded text-sm flex items-center justify-center hover:bg-gray-300">+</button>
                      <button onClick={() => removeItem(item.id)} className="text-xs text-red-600 ml-1 hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t-2 border-gray-200">
            <p className="text-base font-bold mb-3">
              Subtotal ({totalItems} items): <span>₹{totalPrice.toLocaleString()}</span>
            </p>
            <button className="btn-checkout" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}