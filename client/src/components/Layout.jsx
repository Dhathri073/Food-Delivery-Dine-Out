import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { useEffect } from 'react';

export default function Layout() {
  const { user, token, logout } = useAuthStore();
  const { fetchCart, itemCount } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  const count = itemCount();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-orange-500">
              🍔 FoodHub
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/restaurants" className="text-gray-600 hover:text-orange-500 transition-colors">Restaurants</Link>
              {user?.role === 'restaurant_owner' && (
                <Link to="/merchant" className="text-gray-600 hover:text-orange-500 transition-colors">Dashboard</Link>
              )}
              {user?.role === 'courier' && (
                <Link to="/courier" className="text-gray-600 hover:text-orange-500 transition-colors">Deliveries</Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {token ? (
                <>
                  {user?.role === 'customer' && (
                    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500">
                      🛒
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link to="/orders" className="text-gray-600 hover:text-orange-500 text-sm">Orders</Link>
                  <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm">Login</Link>
                  <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm mt-auto">
        © 2024 FoodHub — Integrated Food Delivery & Dine-Out Platform
      </footer>
    </div>
  );
}
