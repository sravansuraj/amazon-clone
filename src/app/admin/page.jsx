'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { products } from '@/data/products';

const ADMIN_EMAIL = 'sravansurajc@gmail.com'; // change this to your email

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.email !== ADMIN_EMAIL) { router.push('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*');
    if (profilesData) setUsers(profilesData);

    setLoading(false);
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.grand_total, 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  const statusColors = {
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Shipped': 'bg-yellow-100 text-yellow-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <span className="text-white text-sm font-semibold ml-2">⚙️ Admin Dashboard</span>
        <button onClick={() => router.push('/')} className="text-white text-sm ml-auto hover:underline">← Back to store</button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, emoji: '💰', color: 'bg-green-50 border-green-200' },
            { label: 'Total Orders', value: totalOrders, emoji: '📦', color: 'bg-blue-50 border-blue-200' },
            { label: 'Total Users', value: totalUsers, emoji: '👥', color: 'bg-purple-50 border-purple-200' },
            { label: 'Total Products', value: totalProducts, emoji: '🛍️', color: 'bg-yellow-50 border-yellow-200' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl border ${stat.color} p-5`}>
              <div className="text-3xl mb-2">{stat.emoji}</div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'orders', 'products', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">Loading data...</div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-base font-bold mb-4">🕐 Recent Orders</h2>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-gray-800 font-mono text-xs">{order.order_id}</p>
                          <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.grand_total.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-base font-bold mb-4">🏆 Top Products</h2>
                  <div className="space-y-3">
                    {products.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-3 border-b border-gray-50 pb-2 last:border-0">
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category} · ₹{p.price.toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-yellow-600 font-medium">★ {p.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">All Orders ({orders.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Order ID', 'Date', 'Items', 'Total', 'Payment', 'City', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.order_id}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3 text-gray-600">{order.items?.length || 0} items</td>
                          <td className="px-4 py-3 font-bold text-gray-900">₹{order.grand_total.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{order.pay_method}</td>
                          <td className="px-4 py-3 text-gray-600">{order.city}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={e => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-yellow-400"
                            >
                              {['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet</p>}
                </div>
              </div>
            )}

            {/* Products tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">All Products ({products.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Product', 'Category', 'Price', 'Rating', 'Reviews', 'Stock', 'Prime'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{p.emoji}</span>
                              <span className="font-medium text-gray-800 text-xs line-clamp-1 max-w-[150px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{p.category}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">₹{p.price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-yellow-600 font-medium">★ {p.rating}</td>
                          <td className="px-4 py-3 text-gray-600">{p.reviews.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 3 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                              {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                            </span>
                          </td>
                          <td className="px-4 py-3">{p.prime ? '✅' : '❌'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Avatar', 'Name', 'City', 'State', 'Phone', 'Joined'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-2xl">{u.avatar_emoji || '👤'}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{u.full_name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{u.city || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{u.state || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <p className="text-center text-gray-400 py-8">No users yet</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}