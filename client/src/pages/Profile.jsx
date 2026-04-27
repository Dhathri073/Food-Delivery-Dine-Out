import { useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

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

  const roleColors = { customer: 'bg-blue-100 text-blue-700', restaurant_owner: 'bg-purple-100 text-purple-700', courier: 'bg-green-100 text-green-700' };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-600">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <span className={`badge mt-1 ${roleColors[user?.role] || 'bg-gray-100 text-gray-600'}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {user?.role === 'customer' && (
          <div className="flex gap-4 mb-6 p-3 bg-orange-50 rounded-lg">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-orange-500">{user?.totalPoints || 0}</p>
              <p className="text-xs text-gray-500">Total Points</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-orange-500">{user?.reviewCount || 0}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" className="input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input bg-gray-50" value={user?.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" className="input" placeholder="+1 234 567 8900" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
