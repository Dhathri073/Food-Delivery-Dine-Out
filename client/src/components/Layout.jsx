import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const { user, token } = useAuthStore();
  const { fetchCart } = useCartStore();
  const location = useLocation();

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
        {/* Only show Sidebar on desktop and not on landing pages if preferred, 
            but for app-like feel we keep it consistent */}
        <Sidebar />

        <main className="flex-1 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation - Zomato Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[60] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
          <span className="text-2xl">{isActive('/') ? '🏠' : '🏠'}</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </Link>
        <Link to="/restaurants" className={`flex flex-col items-center gap-1 transition-all ${isActive('/restaurants') ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
          <span className="text-2xl">🔍</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
        </Link>
        <Link to="/orders" className={`flex flex-col items-center gap-1 transition-all ${isActive('/orders') ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
          <span className="text-2xl">📋</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Orders</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 transition-all ${isActive('/profile') ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
        </Link>
      </nav>

      <footer className="hidden md:block bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-black text-white mb-4">FoodHub</div>
            <p className="max-w-xs text-sm leading-relaxed">
              Your favorite food, delivered fast and fresh. Order from thousands of local restaurants with just a few clicks.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white">About Us</Link></li>
              <li><Link to="#" className="hover:text-white">Team</Link></li>
              <li><Link to="#" className="hover:text-white">Careers</Link></li>
              <li><Link to="#" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white">Help Center</Link></li>
              <li><Link to="#" className="hover:text-white">Safety</Link></li>
              <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          © 2024 FoodHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
