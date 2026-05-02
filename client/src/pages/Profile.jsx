import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Button from '../components/Button';

export default function Profile() {
  const { user, refreshUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshUser().catch(err => console.error('Failed to refresh user:', err));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { 
    customer: 'bg-blue-50 text-blue-600 border-blue-100', 
    restaurant_owner: 'bg-purple-50 text-purple-600 border-purple-100', 
    courier: 'bg-green-50 text-green-600 border-green-100' 
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-[40px] flex items-center justify-center text-5xl font-black text-orange-600 border-4 border-white shadow-xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2.5 rounded-2xl shadow-lg border-2 border-white hover:bg-orange-600 transition-all active:scale-90">
                📸
              </button>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-6">{user?.email}</p>
            
            <div className={`inline-block px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-8 ${roleColors[user?.role] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
              {user?.role?.replace('_', ' ')}
            </div>

            {user?.role === 'customer' && (
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-500">{user?.totalPoints || 0}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Points</p>
                </div>
                <div className="text-center border-l border-gray-50">
                  <p className="text-2xl font-black text-orange-500">{user?.reviewCount || 0}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reviews</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
              <span>👤</span> Personal Details
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500 focus:bg-white focus:border-transparent transition-all outline-none"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500 focus:bg-white focus:border-transparent transition-all outline-none"
                    placeholder="+1 234 567 8900" 
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-300 cursor-not-allowed outline-none"
                  value={user?.email} 
                  disabled 
                />
                <p className="text-[10px] text-gray-400 mt-2 px-1 font-medium">Email cannot be changed for security reasons.</p>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <Button type="submit" loading={saving} size="lg">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 bg-orange-50 rounded-[32px] p-8 border border-orange-100 flex items-center justify-between gap-6">
            <div>
              <h4 className="text-orange-900 font-black text-lg mb-1">Loyalty Program</h4>
              <p className="text-orange-700 text-sm font-medium">You're currently a <span className="font-black">Gold Member</span>. Order more to reach Platinum!</p>
            </div>
            <div className="text-4xl">🏅</div>
          </div>
        </div>
      </div>
    </div>
  );
}
