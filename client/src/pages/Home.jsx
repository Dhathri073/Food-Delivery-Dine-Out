import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function RestaurantCard({ r }) {
  return (
    <Link to={`/restaurants/${r._id}`} className="card hover:shadow-md transition-shadow overflow-hidden group">
      <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-5xl">
        {r.cuisine?.[0] === 'Italian' ? '🍕' : r.cuisine?.[0] === 'Indian' ? '🍛' : r.cuisine?.[0] === 'American' ? '🍔' : '🍽️'}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">{r.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{r.cuisine?.join(', ')}</p>
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="flex items-center gap-1">⭐ {r.rating?.toFixed(1)} ({r.ratingCount})</span>
          <span className="text-gray-500">{r.deliveryTime} min</span>
          <span className="text-gray-500">${r.deliveryFee} delivery</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data } = useQuery({
    queryKey: ['restaurants-featured'],
    queryFn: () => api.get('/restaurants?limit=6')
  });

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Delicious food, delivered fast 🚀</h1>
          <p className="text-orange-100 text-lg mb-8">Order from the best restaurants near you</p>
          <Link to="/restaurants" className="bg-white text-orange-600 font-bold py-3 px-8 rounded-full hover:bg-orange-50 transition-colors inline-block">
            Browse Restaurants
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: '🗺️', title: 'Find Nearby', desc: 'Discover restaurants close to you with real-time geolocation' },
            { icon: '⚡', title: 'Fast Delivery', desc: 'Track your order in real-time from kitchen to your door' },
            { icon: '🏆', title: 'Earn Points', desc: 'Write reviews and earn gamified reward points' }
          ].map(f => (
            <div key={f.title} className="card p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.restaurants?.map(r => <RestaurantCard key={r._id} r={r} />)}
        </div>
      </div>
    </div>
  );
}
