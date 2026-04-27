import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my'),
    refetchInterval: 10000
  });

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-spin">🍔</div>;

  const orders = data?.orders || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>No orders yet</p>
          <Link to="/restaurants" className="btn-primary mt-4 inline-block">Order Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{order.restaurantName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <p className="font-bold text-gray-900 mt-2">${order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
