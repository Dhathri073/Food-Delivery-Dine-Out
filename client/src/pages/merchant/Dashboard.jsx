import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

function OrderCard({ order, onAccept, onReject, onStatusUpdate }) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">#{order._id?.slice(-8)}</p>
          <p className="text-sm text-gray-500">{order.user?.name} • {order.user?.phone}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <div className="text-right">
          <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
          <p className="font-bold mt-1">${order.totalAmount?.toFixed(2)}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-3">
        {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
      </div>
      <p className="text-xs text-gray-400 mb-3">📍 {order.deliveryAddress}</p>
      <div className="flex gap-2">
        {order.status === 'PLACED' && (
          <>
            <button onClick={() => onAccept(order._id)} className="btn-primary text-sm flex-1">Accept</button>
            <button onClick={() => onReject(order._id)} className="btn-secondary text-sm text-red-500 flex-1">Reject</button>
          </>
        )}
        {order.status === 'ACCEPTED' && (
          <button onClick={() => onStatusUpdate(order._id, 'PREPARING')} className="btn-primary text-sm w-full">
            Start Preparing
          </button>
        )}
        {order.status === 'PREPARING' && (
          <button onClick={() => onStatusUpdate(order._id, 'OUT_FOR_DELIVERY')} className="btn-primary text-sm w-full">
            Ready for Pickup
          </button>
        )}
      </div>
    </div>
  );
}

export default function MerchantDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders');

  const { data: restaurantData } = useQuery({
    queryKey: ['merchant-restaurant'],
    queryFn: () => api.get('/merchant/restaurant')
  });

  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn: () => api.get('/merchant/orders'),
    refetchInterval: 15000
  });

  const { data: revenueData } = useQuery({
    queryKey: ['merchant-revenue'],
    queryFn: () => api.get('/merchant/revenue')
  });

  const restaurant = restaurantData?.restaurant;

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !restaurant) return;
    socket.emit('JOIN_RESTAURANT_ROOM', restaurant._id);
    const handler = (data) => {
      toast.success('New order received!');
      refetchOrders();
    };
    socket.on('ORDER_CREATED', handler);
    socket.on('ORDER_STATUS_UPDATED', () => refetchOrders());
    return () => { socket.off('ORDER_CREATED', handler); };
  }, [restaurant]);

  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/merchant/orders/${orderId}/accept`);
      toast.success('Order accepted');
      refetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async (orderId) => {
    try {
      await api.patch(`/merchant/orders/${orderId}/reject`, { reason: 'Restaurant busy' });
      toast.success('Order rejected');
      refetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      refetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const handleToggleItem = async (itemId) => {
    try {
      await api.patch(`/menu/${restaurant._id}/items/${itemId}/toggle`);
      queryClient.invalidateQueries(['merchant-restaurant']);
      toast.success('Item availability updated');
    } catch (err) { toast.error(err.message); }
  };

  const orders = ordersData?.orders || [];
  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
        <span className="text-gray-500">{restaurant?.name}</span>
      </div>

      {/* Revenue Summary */}
      {revenueData && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Today's Revenue", value: `$${revenueData.today?.revenue?.toFixed(2) || '0.00'}`, sub: `${revenueData.today?.count || 0} orders` },
            { label: "This Month", value: `$${revenueData.thisMonth?.revenue?.toFixed(2) || '0.00'}`, sub: `${revenueData.thisMonth?.count || 0} orders` },
            { label: "All Time", value: `$${revenueData.total?.revenue?.toFixed(2) || '0.00'}`, sub: `${revenueData.total?.count || 0} orders` }
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['orders', 'menu'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {tab} {tab === 'orders' && activeOrders.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{activeOrders.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Active Orders ({activeOrders.length})</h2>
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No active orders</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map(order => (
                <OrderCard key={order._id} order={order}
                  onAccept={handleAccept} onReject={handleReject} onStatusUpdate={handleStatusUpdate} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu' && restaurant && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Menu Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {restaurant.menuItems?.map(item => (
              <div key={item._id} className="card p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category} • ${item.price}</p>
                </div>
                <button onClick={() => handleToggleItem(item._id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
