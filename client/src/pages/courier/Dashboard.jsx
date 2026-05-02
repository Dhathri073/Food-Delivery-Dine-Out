import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

// ── Courier Layout Shell ──────────────────────────────────────────────────────
function CourierLayout({ children, activeCount = 0 }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const NAV = [
    { path: '/courier', label: 'Dashboard', icon: '🏠' },
    { path: '/courier/available', label: 'Available', icon: '📦', badge: activeCount },
    { path: '/courier/active', label: 'Active', icon: '🚴' },
    { path: '/courier/history', label: 'History', icon: '📋' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-40">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-lg">🚴</div>
            <div>
              <p className="font-black text-gray-900 text-sm">Courier Portal</p>
              <p className="text-xs text-gray-400 truncate max-w-[140px]">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="text-xl">{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
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
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-black text-gray-900 text-lg">
            {NAV.find(n => isActive(n.path))?.label || 'Courier'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black">
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
            className={`flex flex-col items-center gap-1 relative ${isActive(item.path) ? 'text-blue-500' : 'text-gray-400'}`}>
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[10px] font-black">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ user, available, active, delivered }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white">
        <p className="text-blue-100 text-sm font-bold mb-1">Welcome back 👋</p>
        <h2 className="text-2xl font-black">{user?.name}</h2>
        <p className="text-blue-100 text-sm mt-2">Ready to deliver? {available.length} orders waiting.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available', value: available.length, icon: '📦', color: 'bg-orange-50 text-orange-600' },
          { label: 'Active', value: active.length, icon: '🚴', color: 'bg-blue-50 text-blue-600' },
          { label: 'Delivered', value: delivered.length, icon: '✅', color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active delivery alert */}
      {active.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="font-black text-blue-800 mb-3">🚴 You have {active.length} active delivery!</p>
          {active.map(order => (
            <Link key={order._id} to="/courier/active"
              className="flex items-center justify-between bg-white rounded-xl p-3 hover:bg-blue-50 transition-colors">
              <div>
                <p className="font-bold text-sm">{order.restaurantName}</p>
                <p className="text-xs text-gray-500">→ {order.deliveryAddress}</p>
              </div>
              <span className="text-blue-500 font-bold text-sm">View →</span>
            </Link>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/courier/available" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-200 transition-all flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
          <div>
            <p className="font-black text-gray-900 text-sm">Pick Up</p>
            <p className="text-xs text-gray-500">{available.length} waiting</p>
          </div>
        </Link>
        <Link to="/courier/history" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 transition-all flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
          <div>
            <p className="font-black text-gray-900 text-sm">History</p>
            <p className="text-xs text-gray-500">{delivered.length} completed</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ── Available Pickups ─────────────────────────────────────────────────────────
function AvailablePage({ available, refetchAvailable, refetchMine }) {
  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/courier/${orderId}/accept`);
      toast.success('🎉 Delivery accepted!');
      refetchAvailable(); refetchMine();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-bold">{available.length} order{available.length !== 1 ? 's' : ''} ready for pickup</p>
        <button onClick={refetchAvailable} className="text-xs text-blue-500 font-bold hover:underline">🔄 Refresh</button>
      </div>

      {available.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🏍️</div>
          <p className="font-bold text-lg">No deliveries available</p>
          <p className="text-sm mt-2">Check back in a moment</p>
        </div>
      ) : (
        available.map(order => (
          <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-black text-gray-900">{order.restaurantName}</p>
                <p className="text-sm text-gray-500 mt-1">📍 Pickup: {order.restaurant?.address || 'See restaurant'}</p>
                <p className="text-sm text-gray-500">🏠 Deliver to: {order.deliveryAddress}</p>
              </div>
              <p className="font-black text-orange-500 text-lg">${order.grandTotal?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 font-bold mb-1">ORDER ITEMS</p>
              <p className="text-sm text-gray-700">{order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">👤 {order.user?.name}</p>
              <button onClick={() => handleAccept(order._id)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors">
                Accept Delivery
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Active Deliveries ─────────────────────────────────────────────────────────
function ActivePage({ active, refetchMine }) {
  const handleDelivered = async (orderId) => {
    try {
      await api.patch(`/courier/${orderId}/delivered`);
      toast.success('✅ Marked as delivered!');
      refetchMine();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      {active.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">✅</div>
          <p className="font-bold text-lg">No active deliveries</p>
          <p className="text-sm mt-2">Accept a delivery to get started</p>
          <Link to="/courier/available" className="inline-block mt-4 bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            Find Deliveries
          </Link>
        </div>
      ) : (
        active.map(order => (
          <div key={order._id} className="bg-white rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-blue-600 font-black text-sm">IN PROGRESS</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🏪</span>
                <div>
                  <p className="text-xs text-gray-400 font-bold">PICKUP FROM</p>
                  <p className="font-bold text-gray-900">{order.restaurantName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🏠</span>
                <div>
                  <p className="text-xs text-gray-400 font-bold">DELIVER TO</p>
                  <p className="font-bold text-gray-900">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">👤</span>
                <div>
                  <p className="text-xs text-gray-400 font-bold">CUSTOMER</p>
                  <p className="font-bold text-gray-900">{order.user?.name} • {order.user?.phone || 'No phone'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <p className="font-black text-orange-500">${order.grandTotal?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
              <button onClick={() => handleDelivered(order._id)}
                className="bg-green-500 hover:bg-green-600 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors">
                ✅ Mark Delivered
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function HistoryPage({ delivered }) {
  const total = delivered.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white">
        <p className="text-green-100 text-sm font-bold">Total Deliveries</p>
        <p className="text-3xl font-black">{delivered.length}</p>
        <p className="text-green-100 text-sm mt-1">Total value: ${total.toFixed(2)}</p>
      </div>

      {delivered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="font-bold">No completed deliveries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {delivered.map(order => (
            <div key={order._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">{order.restaurantName}</p>
                <p className="text-xs text-gray-500 mt-0.5">→ {order.deliveryAddress}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="badge bg-green-100 text-green-700 text-xs">✅ Delivered</span>
                <p className="font-black text-gray-900 mt-1">${order.grandTotal?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function CourierDashboard() {
  const { user } = useAuthStore();

  const { data: availableData, refetch: refetchAvailable } = useQuery({
    queryKey: ['available-deliveries'],
    queryFn: () => api.get('/courier/available'),
    refetchInterval: 20000
  });

  const { data: myData, refetch: refetchMine } = useQuery({
    queryKey: ['my-deliveries'],
    queryFn: () => api.get('/courier/my-deliveries'),
    refetchInterval: 15000
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('JOIN_COURIER_ROOM');
    const handler = () => { refetchAvailable(); refetchMine(); };
    socket.on('ORDER_STATUS_UPDATED', handler);
    socket.on('ORDER_CREATED', () => { toast('📦 New delivery available!'); refetchAvailable(); });
    return () => { socket.off('ORDER_STATUS_UPDATED', handler); };
  }, []);

  const available = availableData?.orders || [];
  const myDeliveries = myData?.orders || [];
  const active = myDeliveries.filter(o => o.status === 'OUT_FOR_DELIVERY');
  const delivered = myDeliveries.filter(o => o.status === 'DELIVERED');

  return (
    <CourierLayout activeCount={available.length}>
      <Routes>
        <Route index element={<Overview user={user} available={available} active={active} delivered={delivered} />} />
        <Route path="available" element={<AvailablePage available={available} refetchAvailable={refetchAvailable} refetchMine={refetchMine} />} />
        <Route path="active" element={<ActivePage active={active} refetchMine={refetchMine} />} />
        <Route path="history" element={<HistoryPage delivered={delivered} />} />
      </Routes>
    </CourierLayout>
  );
}
