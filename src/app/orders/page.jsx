'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';

const statusColors = {
  'Confirmed': 'bg-blue-100 text-blue-700',
  'Shipped': 'bg-yellow-100 text-yellow-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

const statusSteps = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrdersPage() {
  const router = useRouter();
  const { orders } = useOrders();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <span className="text-white text-sm ml-2">/ Your Orders</span>
        <button onClick={() => router.push('/')} className="text-white text-sm ml-auto hover:underline">← Back to shopping</button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          📦 Your Orders <span className="text-gray-400 font-normal text-lg">({orders.length} orders)</span>
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Your order history will appear here after you place an order</p>
            <button onClick={() => router.push('/')} className="btn-add w-auto px-8 py-3">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex flex-wrap items-center gap-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Order placed</p>
                    <p className="text-sm font-medium text-gray-800">{order.date} at {order.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-medium text-gray-800">₹{order.grandTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ship to</p>
                    <p className="text-sm font-medium text-gray-800">{order.city}, {order.state}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    <p className="text-xs text-gray-500 font-mono">{order.id}</p>
                  </div>
                </div>

                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200 z-0" />
                    <div className="absolute left-0 top-3 h-0.5 bg-yellow-400 z-0 transition-all"
                      style={{ width: `${(statusSteps.indexOf(order.status) / (statusSteps.length - 1)) * 100}%` }} />
                    {statusSteps.map((s, i) => {
                      const currentIdx = statusSteps.indexOf(order.status);
                      const done = i <= currentIdx;
                      return (
                        <div key={s} className="flex flex-col items-center z-10 flex-1">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs mb-1 ${done ? 'bg-yellow-400 border-yellow-400 text-gray-900' : 'bg-white border-gray-300 text-gray-400'}`}>
                            {done ? '✓' : i + 1}
                          </div>
                          <p className={`text-xs text-center leading-tight ${done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{s}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-green-600 font-medium mt-3">🚚 {order.estimatedDelivery}</p>
                </div>

                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex gap-3 items-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2"
                        onClick={() => router.push(`/product/${item.id}`)}>
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl shrink-0 border border-gray-100">{item.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 line-clamp-1 hover:text-orange-500">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Qty: {item.qty} · ₹{item.price.toLocaleString()} each</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0">₹{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {order.discount > 0 && <p className="text-green-600">🎟️ Coupon saved ₹{order.discount.toLocaleString()}</p>}
                      {order.deliveryFee === 0 && <p className="text-green-600">🚚 Free delivery</p>}
                      <p>Payment: {order.payMethod === 'card' ? 'Credit/Debit Card' : order.payMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
                    </div>
                    <button onClick={() => router.push('/')} className="text-sm text-orange-500 hover:text-orange-600 font-medium hover:underline">Buy Again →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}