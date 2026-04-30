import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const count = itemCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[60] h-16 sm:h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-orange-500 tracking-tighter shrink-0">
            <span className="bg-orange-500 text-white p-1.5 rounded-lg">🍔</span>
            <span className="hidden sm:inline">FoodHub</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 lg:mx-16">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search for restaurants, cuisines, or a dish..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden lg:flex items-center gap-6 mr-2">
              <Link to="/restaurants" className="text-gray-600 font-bold hover:text-orange-500 transition-colors text-sm">Explore</Link>
              {user?.role === 'restaurant_owner' && (
                <Link to="/merchant" className="text-gray-600 font-bold hover:text-orange-500 transition-colors text-sm">Merchant</Link>
              )}
              {user?.role === 'courier' && (
                <Link to="/courier" className="text-gray-600 font-bold hover:text-orange-500 transition-colors text-sm">Delivery</Link>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-2 border-l border-gray-100 pl-4 sm:pl-6">
              {token ? (
                <>
                  {user?.role === 'customer' && (
                    <Link to="/cart" className="relative p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:text-orange-500 transition-all hover:bg-orange-50 group">
                      <span className="text-xl group-hover:scale-110 transition-transform inline-block">🛒</span>
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                          {count}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-orange-600 font-black border-2 border-white shadow-sm group-hover:border-orange-500 transition-all">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Logout"
                  >
                    🚪
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                  <Link to="/login" className="text-gray-600 font-bold hover:text-orange-500 px-4 py-2 text-sm">Login</Link>
                  <Link to="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all active:scale-95">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
