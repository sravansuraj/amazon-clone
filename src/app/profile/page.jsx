'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const avatarOptions = ['👤', '🧑', '👨', '👩', '🧔', '👱', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎓', '😎', '🥷'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '', city: '', state: '', pincode: '', avatar_emoji: '👤' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar px-4 h-14 flex items-center gap-4">
        <div className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => router.push('/')}>
          amazon<span className="text-white">.clone</span>
        </div>
        <span className="text-white text-sm ml-2">/ Your Profile</span>
        <button onClick={() => router.push('/')} className="text-white text-sm ml-auto hover:underline">← Back to shopping</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-8 text-center relative">
            <div
              className="text-7xl mb-3 cursor-pointer hover:scale-110 transition-transform inline-block"
              onClick={() => setShowAvatarPicker(prev => !prev)}
              title="Click to change avatar"
            >
              {profile.avatar_emoji}
            </div>
            <p className="text-white font-semibold text-lg">{profile.full_name || 'Your Name'}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs mt-1">Click avatar to change</p>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 w-64">
                <p className="text-xs text-gray-500 mb-2 font-medium">Choose your avatar</p>
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { setProfile(p => ({ ...p, avatar_emoji: emoji })); setShowAvatarPicker(false); }}
                      className={`text-2xl p-1 rounded-lg hover:bg-gray-100 transition-colors ${profile.avatar_emoji === emoji ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading profile...</div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-gray-900 mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { k: 'full_name', label: 'Full Name', placeholder: 'Sravan Kumar', col: 2 },
                    { k: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                    { k: 'city', label: 'City', placeholder: 'Hyderabad' },
                    { k: 'address', label: 'Address', placeholder: 'Flat / House No, Street', col: 2 },
                    { k: 'state', label: 'State', placeholder: 'Telangana' },
                    { k: 'pincode', label: 'PIN Code', placeholder: '500001' },
                  ].map(f => (
                    <div key={f.k} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                      <label className="text-sm font-medium text-gray-700 block mb-1">{f.label}</label>
                      <input
                        type="text"
                        value={profile[f.k] || ''}
                        onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {saved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 font-medium">
                    ✅ Profile saved successfully!
                  </div>
                )}

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-full text-sm disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-100 px-6 py-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '📦 Your Orders', path: '/orders' },
                { label: '❤️ Your Wishlist', path: '/wishlist' },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  className="border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              onClick={handleSignOut}
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-full text-sm transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}