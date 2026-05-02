import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

// ── Merchant Layout Shell ─────────────────────────────────────────────────────
function MerchantLayout({ children, activeOrders = 0 }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const NAV = [
    { path: '/merchant', label: 'Dashboard', icon: '📊' },
    { path: '/merchant/orders', label: 'Orders', icon: '📋', badge: activeOrders },
    { path: '/merchant/menu', label: 'Menu', icon: '🍽️' },
    { path: '/merchant/revenue', label: 'Revenue', icon: '💰' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-40">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg">🏪</div>
            <div>
              <p className="font-black text-gray-900 text-sm">Merchant Portal</p>
              <p className="text-xs text-gray-400 truncate max-w-[140px]">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all relative ${
                isActive(item.path) ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="text-xl">{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 font-bold text-sm w-full transition-all">
            <span className="text-xl">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-black text-gray-900 text-lg">
            {NAV.find(n => isActive(n.path))?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            {activeOrders > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                🔔 {activeOrders} active order{activeOrders > 1 ? 's' : ''}
              </span>
            )}
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-black">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 z-50">
        {NAV.slice(0, 4).map(item => (
          <Link key={item.path} to={item.path}
            className={`flex flex-col items-center gap-1 relative ${isActive(item.path) ? 'text-orange-500' : 'text-gray-400'}`}>
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[10px] font-black">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// ── Overview Page ─────────────────────────────────────────────────────────────
function Overview({ restaurant, revenueData, activeOrders, refetchOrders }) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 text-white">
        <p className="text-orange-100 text-sm font-bold mb-1">Welcome back 👋</p>
        <h2 className="text-2xl font-black">{restaurant?.name || 'Your Restaurant'}</h2>
        <div className="flex items-center gap-4 mt-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black ${restaurant?.isOpen ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
            {restaurant?.isOpen ? '🟢 Open' : '🔴 Closed'}
          </span>
          <span className="text-orange-100 text-sm">⭐ {restaurant?.rating?.toFixed(1)} ({restaurant?.ratingCount} reviews)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `$${revenueData?.today?.revenue?.toFixed(2) || '0.00'}`, sub: `${revenueData?.today?.count || 0} orders`, icon: '💵', color: 'bg-green-50 text-green-600' },
          { label: 'Active Orders', value: activeOrders, sub: 'need attention', icon: '🔥', color: 'bg-red-50 text-red-600' },
          { label: 'This Month', value: `$${revenueData?.thisMonth?.revenue?.toFixed(2) || '0.00'}`, sub: `${revenueData?.thisMonth?.count || 0} orders`, icon: '📅', color: 'bg-blue-50 text-blue-600' },
          { label: 'All Time', value: `$${revenueData?.total?.revenue?.toFixed(2) || '0.00'}`, sub: `${revenueData?.total?.count || 0} orders`, icon: '🏆', color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 font-bold mt-1">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/merchant/orders" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-orange-200 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
          <div>
            <p className="font-black text-gray-900">Manage Orders</p>
            <p className="text-sm text-gray-500">{activeOrders} active right now</p>
          </div>
          <span className="ml-auto text-gray-400">→</span>
        </Link>
        <Link to="/merchant/menu" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-orange-200 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
          <div>
            <p className="font-black text-gray-900">Manage Menu</p>
            <p className="text-sm text-gray-500">{restaurant?.menuItems?.length || 0} items</p>
          </div>
          <span className="ml-auto text-gray-400">→</span>
        </Link>
      </div>
    </div>
  );
}

// ── Orders Page ───────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700', ACCEPTED: 'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-orange-100 text-orange-700', OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700'
};

function OrdersPage({ orders, refetchOrders }) {
  const [filter, setFilter] = useState('active');

  const handleAccept = async (orderId) => {
    try { await api.patch(`/merchant/orders/${orderId}/accept`); toast.success('Order accepted'); refetchOrders(); }
    catch (err) { toast.error(err.message); }
  };
  const handleReject = async (orderId) => {
    try { await api.patch(`/merchant/orders/${orderId}/reject`, { reason: 'Restaurant busy' }); toast.success('Order rejected'); refetchOrders(); }
    catch (err) { toast.error(err.message); }
  };
  const handleStatus = async (orderId, status) => {
    try { await api.patch(`/orders/${orderId}/status`, { status }); refetchOrders(); }
    catch (err) { toast.error(err.message); }
  };

  const filtered = filter === 'active'
    ? orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
    : filter === 'history'
    ? orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status))
    : orders;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[['active', '🔥 Active'], ['history', '📋 History'], ['all', '🗂️ All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === val ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-bold">No orders here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(order => (
            <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-black text-gray-900">#{order._id?.slice(-8)}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{order.user?.name} • {order.user?.phone || 'No phone'}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs px-2 py-1 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                  <p className="font-black text-orange-600 mt-1">${order.grandTotal?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
              <p className="text-xs text-gray-400 mb-3">📍 {order.deliveryAddress}</p>
              <div className="flex gap-2">
                {order.status === 'PLACED' && <>
                  <button onClick={() => handleAccept(order._id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 rounded-xl transition-colors">✅ Accept</button>
                  <button onClick={() => handleReject(order._id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2 rounded-xl transition-colors">❌ Reject</button>
                </>}
                {order.status === 'ACCEPTED' && <button onClick={() => handleStatus(order._id, 'PREPARING')} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 rounded-xl transition-colors">🍳 Start Preparing</button>}
                {order.status === 'PREPARING' && <button onClick={() => handleStatus(order._id, 'OUT_FOR_DELIVERY')} className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-2 rounded-xl transition-colors">📦 Ready for Pickup</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Menu Page ─────────────────────────────────────────────────────────────────
function MenuPage({ restaurant, queryClient }) {
  const handleToggle = async (itemId) => {
    try {
      await api.patch(`/menu/${restaurant._id}/items/${itemId}/toggle`);
      queryClient.invalidateQueries(['merchant-restaurant']);
      toast.success('Updated');
    } catch (err) { toast.error(err.message); }
  };

  const grouped = restaurant?.menuItems?.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-black text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-500 rounded-full inline-block"></span> {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(item => (
              <div key={item._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  <p className="text-orange-600 font-black mt-1">${item.price?.toFixed(2)}</p>
                </div>
                <button onClick={() => handleToggle(item._id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                  {item.isAvailable ? '✅ On' : '❌ Off'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Revenue Page ──────────────────────────────────────────────────────────────
function RevenuePage({ revenueData }) {
  const stats = [
    { label: "Today", revenue: revenueData?.today?.revenue || 0, orders: revenueData?.today?.count || 0, icon: '☀️', color: 'from-yellow-400 to-orange-400' },
    { label: "This Month", revenue: revenueData?.thisMonth?.revenue || 0, orders: revenueData?.thisMonth?.count || 0, icon: '📅', color: 'from-blue-400 to-indigo-400' },
    { label: "All Time", revenue: revenueData?.total?.revenue || 0, orders: revenueData?.total?.count || 0, icon: '🏆', color: 'from-purple-400 to-pink-400' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-3xl p-6 text-white`}>
            <div className="text-3xl mb-3">{s.icon}</div>
            <p className="text-3xl font-black">${s.revenue.toFixed(2)}</p>
            <p className="text-white/80 font-bold mt-1">{s.label}</p>
            <p className="text-white/60 text-sm mt-1">{s.orders} orders completed</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <p className="font-black text-gray-700 mb-2">Average Order Value</p>
        <p className="text-3xl font-black text-orange-500">
          ${revenueData?.total?.count ? (revenueData.total.revenue / revenueData.total.count).toFixed(2) : '0.00'}
        </p>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function MerchantDashboard() {
  const queryClient = useQueryClient();

  const { data: restaurantData } = useQuery({ queryKey: ['merchant-restaurant'], queryFn: () => api.get('/merchant/restaurant') });
  const { data: ordersData, refetch: refetchOrders } = useQuery({ queryKey: ['merchant-orders'], queryFn: () => api.get('/merchant/orders'), refetchInterval: 15000 });
  const { data: revenueData } = useQuery({ queryKey: ['merchant-revenue'], queryFn: () => api.get('/merchant/revenue') });

  const restaurant = restaurantData?.restaurant;
  const orders = ordersData?.orders || [];
  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !restaurant) return;
    socket.emit('JOIN_RESTAURANT_ROOM', restaurant._id);
    const handler = () => { toast.success('🔔 New order received!'); refetchOrders(); };
    socket.on('ORDER_CREATED', handler);
    socket.on('ORDER_STATUS_UPDATED', refetchOrders);
    return () => { socket.off('ORDER_CREATED', handler); socket.off('ORDER_STATUS_UPDATED', refetchOrders); };
  }, [restaurant]);

  return (
    <MerchantLayout activeOrders={activeOrders}>
      <Routes>
        <Route index element={<Overview restaurant={restaurant} revenueData={revenueData} activeOrders={activeOrders} refetchOrders={refetchOrders} />} />
        <Route path="orders" element={<OrdersPage orders={orders} refetchOrders={refetchOrders} />} />
        <Route path="menu" element={<MenuPage restaurant={restaurant} queryClient={queryClient} />} />
        <Route path="revenue" element={<RevenuePage revenueData={revenueData} />} />
      </Routes>
    </MerchantLayout>
  );
}
