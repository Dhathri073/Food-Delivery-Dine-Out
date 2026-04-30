import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Button from '../components/Button';

const STATUS_COLORS = {
  PLACED: 'bg-blue-50 text-blue-600 border-blue-100',
  ACCEPTED: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  PREPARING: 'bg-orange-50 text-orange-600 border-orange-100',
  OUT_FOR_DELIVERY: 'bg-purple-50 text-purple-600 border-purple-100',
  DELIVERED: 'bg-green-50 text-green-600 border-green-100',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100'
};

const STATUS_ICONS = {
  PLACED: '📝',
  ACCEPTED: '✅',
  PREPARING: '🍳',
  OUT_FOR_DELIVERY: '🚴',
  DELIVERED: '🎁',
  CANCELLED: '🚫'
};

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my'),
    refetchInterval: 10000
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-6xl animate-bounce mb-4">🍱</div>
        <p className="text-gray-500 font-bold animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1 font-medium">Track and manage your past and current orders</p>
        </div>
        {orders.length > 0 && (
          <div className="bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 text-orange-600 font-black text-sm">
            {orders.length} Orders Total
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 p-16 text-center shadow-sm">
          <div className="text-8xl mb-6">📦</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">Hungry? Discover the best restaurants near you and start ordering!</p>
          <Link to="/restaurants">
            <Button size="lg">Explore Restaurants</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map(order => (
            <Link 
              key={order._id} 
              to={`/orders/${order._id}`} 
              className="group bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                  {STATUS_ICONS[order.status] || '🍔'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-orange-600 transition-colors">{order.restaurantName}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1 mb-2">
                    {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                    <span>#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                <p className="text-2xl font-black text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                <button className="text-orange-500 font-black text-xs uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Details <span>→</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
