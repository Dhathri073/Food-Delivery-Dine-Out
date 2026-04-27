import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import toast from 'react-hot-toast';

export default function CourierDashboard() {
  const { data: availableData, refetch: refetchAvailable } = useQuery({
    queryKey: ['available-deliveries'],
    queryFn: () => api.get('/courier/available'),
    refetchInterval: 20000
  });

  const { data: myData, refetch: refetchMine } = useQuery({
    queryKey: ['my-deliveries'],
    queryFn: () => api.get('/courier/my-deliveries')
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('JOIN_COURIER_ROOM');
    socket.on('ORDER_STATUS_UPDATED', () => { refetchAvailable(); refetchMine(); });
    return () => socket.off('ORDER_STATUS_UPDATED');
  }, []);

  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/courier/${orderId}/accept`);
      toast.success('Delivery accepted!');
      refetchAvailable(); refetchMine();
    } catch (err) { toast.error(err.message || 'Failed to accept'); }
  };

  const handleDelivered = async (orderId) => {
    try {
      await api.patch(`/courier/${orderId}/delivered`);
      toast.success('Marked as delivered!');
      refetchMine();
    } catch (err) { toast.error(err.message || 'Failed to update'); }
  };

  const available = availableData?.orders || [];
  const myDeliveries = myData?.orders || [];
  const active = myDeliveries.filter(o => o.status === 'OUT_FOR_DELIVERY');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Courier Dashboard</h1>

      {/* Active Deliveries */}
      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">🚴 Active Deliveries</h2>
          <div className="space-y-3">
            {active.map(order => (
              <div key={order._id} className="card p-4 border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{order.restaurantName}</p>
                    <p className="text-sm text-gray-500">📍 {order.deliveryAddress}</p>
                    <p className="text-sm text-gray-500">👤 {order.user?.name} • {order.user?.phone}</p>
                  </div>
                  <p className="font-bold text-orange-500">${order.totalAmount?.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDelivered(order._id)} className="btn-primary w-full text-sm">
                  ✅ Mark as Delivered
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Pickups */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-3">📦 Available for Pickup ({available.length})</h2>
        {available.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🏍️</div>
            <p>No deliveries available right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map(order => (
              <div key={order._id} className="card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{order.restaurantName}</p>
                    <p className="text-sm text-gray-500">📍 {order.restaurant?.address}</p>
                    <p className="text-sm text-gray-500">🏠 Deliver to: {order.deliveryAddress}</p>
                    <p className="text-xs text-gray-400 mt-1">{order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                  </div>
                  <p className="font-bold text-orange-500">${order.totalAmount?.toFixed(2)}</p>
                </div>
                <button onClick={() => handleAccept(order._id)} className="btn-primary w-full text-sm">
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">📋 Delivery History</h2>
        <div className="space-y-2">
          {myDeliveries.filter(o => o.status === 'DELIVERED').slice(0, 10).map(order => (
            <div key={order._id} className="card p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{order.restaurantName}</p>
                <p className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="badge bg-green-100 text-green-700">Delivered</span>
                <p className="text-sm font-semibold mt-1">${order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
