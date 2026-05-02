import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Sidebar() {
  const { user, token } = useAuthStore();
  const location = useLocation();

  // Owner and courier have their own dedicated layouts — no sidebar needed
  if (user?.role === 'restaurant_owner' || user?.role === 'courier') return null;

  const isActive = (path) => location.pathname === path;

  const NAV_ITEMS = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Delivery', path: '/delivery', icon: '🚚' },
    { label: 'Dine-Out', path: '/dineout', icon: '🍽️' },
    { label: 'Events', path: '/events', icon: '🎉' },
    { label: 'Orders', path: '/orders', icon: '📋' },
    { label: 'Cart', path: '/cart', icon: '🛒', role: 'customer' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  const filteredItems = NAV_ITEMS.filter(item => {
    if (item.role && user?.role !== item.role) return false;
    if (!token && item.path !== '/' && item.path !== '/restaurants') return false;
    return true;
  });

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-80px)] sticky top-20 bg-white border-r border-gray-100 p-6">
      <div className="flex-1 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-4">Menu</p>
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
              isActive(item.path)
                ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
            {isActive(item.path) && (
              <div className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full" />
            )}
          </Link>
        ))}
      </div>

      {token && (
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Welcome back,</p>
            <p className="font-black text-lg truncate mb-3">{user?.name}</p>
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3"></div>
            </div>
            <p className="text-[10px] mt-2 font-bold opacity-80">You're 3 orders away from a reward!</p>
          </div>
        </div>
      )}
    </aside>
  );
}
