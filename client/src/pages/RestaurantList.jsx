import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function RestaurantCard({ r }) {
  const emoji = r.cuisine?.[0] === 'Italian' ? '🍕' : r.cuisine?.[0] === 'Indian' ? '🍛' : r.cuisine?.[0] === 'American' ? '🍔' : '🍽️';
  return (
    <Link to={`/restaurants/${r._id}`} className="card hover:shadow-md transition-all overflow-hidden group">
      <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-6xl">
        {emoji}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">{r.name}</h3>
          <span className={`badge ${r.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {r.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{r.cuisine?.join(' · ')}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{r.address}</p>
        <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
          <span>⭐ {r.rating?.toFixed(1)}</span>
          <span>🕐 {r.deliveryTime} min</span>
          <span>🚚 ${r.deliveryFee}</span>
          {r.distance && <span>📍 {(r.distance / 1000).toFixed(1)}km</span>}
        </div>
      </div>
    </Link>
  );
}

export default function RestaurantList() {
  const [search, setSearch] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [coords, setCoords] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', search, coords],
    queryFn: () => {
      if (coords) return api.get(`/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=10000`);
      return api.get(`/restaurants?search=${search}`);
    }
  });

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setUseLocation(true); },
      () => alert('Location access denied')
    );
  };

  const restaurants = data?.restaurants || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Restaurants</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input type="text" className="input flex-1" placeholder="Search restaurants..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={handleLocate} className={`btn-secondary flex items-center gap-2 ${useLocation ? 'border-orange-400 text-orange-600' : ''}`}>
          📍 {useLocation ? 'Nearby' : 'Find Nearby'}
        </button>
        {useLocation && (
          <button onClick={() => { setCoords(null); setUseLocation(false); }} className="btn-secondary text-red-500">
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🍽️</div>
          <p>No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(r => <RestaurantCard key={r._id} r={r} />)}
        </div>
      )}
    </div>
  );
}
