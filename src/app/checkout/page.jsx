'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { coupons } from '@/data/products';

const steps = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, totalItems, changeQty, removeItem, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [emailBody, setEmailBody] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [form, setForm] = useState({
    name: '', email: user?.email || '', phone: '', address: '', city: '', pincode: '', state: '',
    cardName: '', cardNumber: '', expiry: '', cvv: '', upi: '',
    payMethod: 'card',
  });

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const deliveryFee = totalPrice > 499 ? 0 : 40;
  const tax = Math.round(totalPrice * 0.18);

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') return Math.round(totalPrice * appliedCoupon.discount / 100);
    return appliedCoupon.discount;
  };

  const discount = getDiscount();
  const grandTotal = totalPrice + deliveryFee + tax - discount;

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const coupon = coupons[code];
    if (!coupon) {
      setCouponError('Invalid coupon code. Try SRAVAN10, SAVE200, PRIME50 or NEWUSER');
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async () => {
    const order = await placeOrder({
      items: cart,
      grandTotal,
      totalItems,
      deliveryFee,
      tax,
      discount,
      payMethod: form.payMethod,
      city: form.city || 'Hyderabad',
      state: form.state || 'Telangana',
      name: form.name || user?.email?.split('@')[0] || 'User',
    });

    if (order) {
      await clearCart();

      // Add notification
      await addNotification(`Order ${order.id} placed! ₹${grandTotal.toLocaleString()} — Delivering to ${form.city || 'Hyderabad'}`, 'order');

      // Generate AI email
      try {
        const res = await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, email: user.email, items: cart }),
        });
        const data = await res.json();
        if (data.emailBody) setEmailBody(data.emailBody);
      } catch {}

      setPlacedOrder(order);
      setPlaced(true);
    }
  };

  if (!user) return null;

  if (cart.length === 0 && !placed) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-xl font-semibold mb-2">Your cart is empty</p>
        <p className="text-gray-500 text-sm mb-6">Add some items before checking out</p>
        <button onClick={() => router.push('/')} className="btn-add w-auto px-8">Continue Shopping</button>
      </div>
    </div>
  );

  if (placed && placedOrder) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-lg border border-gray-200">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-1">Thank you, <strong>{form.name || user?.email?.split('@')[0]}</strong>!</p>
        <p className="text-gray-500 text-sm mb-2">Your order of <strong>{totalItems} item{totalItems > 1 ? 's' : ''}</strong> has been confirmed.</p>
        {discount > 0 && <p className="text-green-600 text-sm mb-2">🎟️ You saved <strong>₹{discount.toLocaleString()}</strong> with coupon!</p>}
        <p className="text-gray-700 font-semibold mb-2">Total paid: ₹{grandTotal.toLocaleString()}</p>
        <p className="text-xs text-gray-400 font-mono mb-4">{placedOrder.id}</p>

        {emailBody && (
          <div className="mb-4">
            <button
              onClick={() => setShowEmail(prev => !prev)}
              className="text-sm text-blue-500 hover:underline"
            >
              {showEmail ? 'Hide' : '📧 View'} AI-generated confirmation email
            </button>
            {showEmail && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-left text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {emailBody}
              </div>
            )}
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-green-700 font-medium mb-1">📦 Estimated Delivery</p>
          <p className="text-sm text-green-600">Tomorrow by 9 PM</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/orders')} className="btn-add text-base py-3">View Order History 📦</button>
          <button onClick={() => router.push('/')} className="w-full border border-gray-300 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50">Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <div className="flex items-center gap-6 mx-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-yellow-400 text-gray-900' : 'bg-gray-600 text-gray-300'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? 'text-yellow-400 font-semibold' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <span className="text-gray-500 ml-2">›</span>}
            </div>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-5">📦 Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { k: 'name', label: 'Full Name', placeholder: 'Sravan Kumar', col: 2 },
                  { k: 'email', label: 'Email', placeholder: 'sravan@email.com' },
                  { k: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                  { k: 'address', label: 'Address', placeholder: 'Flat / House No, Street', col: 2 },
                  { k: 'city', label: 'City', placeholder: 'Hyderabad' },
                  { k: 'pincode', label: 'PIN Code', placeholder: '500001' },
                  { k: 'state', label: 'State', placeholder: 'Telangana' },
                ].map(f => (
                  <div key={f.k} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{f.label}</label>
                    <input type="text" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-add mt-6 text-base py-3">Continue to Payment →</button>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-5">💳 Payment Method</h2>
              <div className="flex gap-3 mb-6 flex-wrap">
                {[
                  { k: 'card', label: '💳 Credit/Debit Card' },
                  { k: 'upi', label: '📱 UPI' },
                  { k: 'cod', label: '💵 Cash on Delivery' },
                ].map(m => (
                  <button key={m.k} onClick={() => set('payMethod', m.k)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${form.payMethod === m.k ? 'border-yellow-400 bg-yellow-50 text-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
              {form.payMethod === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { k: 'cardName', label: 'Name on Card', placeholder: 'Sravan Kumar', col: 2 },
                    { k: 'cardNumber', label: 'Card Number', placeholder: '1234 5678 9012 3456', col: 2 },
                    { k: 'expiry', label: 'Expiry Date', placeholder: 'MM/YY' },
                    { k: 'cvv', label: 'CVV', placeholder: '•••' },
                  ].map(f => (
                    <div key={f.k} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                      <label className="text-sm font-medium text-gray-700 block mb-1">{f.label}</label>
                      <input type={f.k === 'cvv' ? 'password' : 'text'} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
                    </div>
                  ))}
                </div>
              )}
              {form.payMethod === 'upi' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">UPI ID</label>
                  <input type="text" value={form.upi} onChange={e => set('upi', e.target.value)} placeholder="yourname@upi"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
                </div>
              )}
              {form.payMethod === 'cod' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  💵 Pay ₹{grandTotal.toLocaleString()} in cash when your order is delivered.
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50">← Back</button>
                <button onClick={() => setStep(2)} className="btn-add flex-1 text-base py-3">Review Order →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-5">✅ Review Your Order</h2>
              <div className="space-y-3 mb-5">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 items-center pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-2xl shrink-0">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-1">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => changeQty(item.id, -1)} className="w-5 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">−</button>
                        <span className="text-xs">{item.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)} className="w-5 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">+</button>
                        <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 ml-1 hover:underline">Remove</button>
                      </div>
                    </div>
                    <p className="text-sm font-bold shrink-0">₹{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 mb-5">
                <div className="flex justify-between text-gray-600"><span>Delivering to:</span><span className="font-medium text-gray-800">{form.city || 'Hyderabad'}, {form.state || 'Telangana'}</span></div>
                <div className="flex justify-between text-gray-600"><span>Payment:</span><span className="font-medium text-gray-800">{form.payMethod === 'card' ? 'Credit/Debit Card' : form.payMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50">← Back</button>
                <button onClick={handlePlaceOrder} className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-full text-base">Place Order 🎉</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            <h2 className="text-base font-bold mb-4 pb-3 border-b border-gray-100">Order Summary</h2>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">🎟️ Coupon Code</p>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-green-700">{couponCode.toUpperCase()} applied!</p>
                    <p className="text-xs text-green-600">{appliedCoupon.desc}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-sm ml-2">✕</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()} placeholder="Enter code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-yellow-400" />
                  <button onClick={applyCoupon} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-lg">Apply</button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              {!appliedCoupon && !couponError && <p className="text-xs text-gray-400 mt-1">Try: SRAVAN10, SAVE200, PRIME50, NEWUSER</p>}
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600"><span>Items ({totalItems})</span><span>₹{totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Discount</span><span>− ₹{discount.toLocaleString()}</span></div>}
            </div>
            <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200">
              <span>Order Total</span><span>₹{grandTotal.toLocaleString()}</span>
            </div>
            {discount > 0 && <p className="text-green-600 text-xs mt-2">🎉 You're saving ₹{discount.toLocaleString()} with coupon!</p>}
            {deliveryFee === 0 && <p className="text-green-600 text-xs mt-1">🚚 Free delivery applied!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}