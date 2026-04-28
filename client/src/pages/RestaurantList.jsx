import { useState, useEffect } from 'react';
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
          {r.distance && <span>📍 {(r.distance / 1000).toFixed(1)} km away</span>}
        </div>
      </div>
    </Link>
  );
}

export default function RestaurantList() {
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | granted | denied

  // Auto-request location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000 }
    );
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurants', search, coords],
    queryFn: async () => {
      if (coords) {
        const nearby = await api.get(`/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=20000`);
        if (!search && nearby.restaurants.length === 0) {
          return api.get('/restaurants');
        }
        return nearby;
      }
      return api.get(`/restaurants?search=${search}`);
    },
    // Don't fetch until we know location status
    enabled: locationStatus !== 'requesting'
  });

  const handleRetryLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { timeout: 8000 }
    );
  };

  const handleShowAll = () => {
    setCoords(null);
    setLocationStatus('denied');
  };

  const restaurants = data?.restaurants || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
        {locationStatus === 'granted' && coords && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            📍 Showing nearby restaurants
          </span>
        )}
      </div>

      {/* Location banner */}
      {locationStatus === 'requesting' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="animate-spin text-xl">🔄</div>
          <div>
            <p className="font-medium text-blue-800">Detecting your location...</p>
            <p className="text-sm text-blue-600">Please allow location access in your browser to see nearby restaurants.</p>
          </div>
        </div>
      )}

      {locationStatus === 'denied' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-medium text-amber-800">Location access denied</p>
              <p className="text-sm text-amber-600">Enable location in your browser settings to find nearby restaurants, or search by name below.</p>
            </div>
          </div>
          <button onClick={handleRetryLocation} className="btn-secondary text-sm shrink-0">
            Try Again
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          className="input flex-1"
          placeholder="Search restaurants by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {locationStatus === 'granted' ? (
          <button
            onClick={handleShowAll}
            className="btn-secondary text-sm text-gray-500"
          >
            🗺️ Show All
          </button>
        ) : (
          <button onClick={handleRetryLocation} className="btn-secondary flex items-center gap-2">
            📍 Use My Location
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {(isLoading || locationStatus === 'requesting') ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium">Could not load restaurants</p>
          <p className="text-gray-400 text-sm mt-1">Make sure the server is running and MongoDB is connected.</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="font-medium">No restaurants found</p>
          {locationStatus === 'granted' ? (
            <>
              <p className="text-sm mt-2">No nearby restaurants were found. You can still view all restaurants.</p>
              <button onClick={handleShowAll} className="btn-primary mt-4">
                Show all restaurants
              </button>
            </>
          ) : (
            <p className="text-sm mt-2">Try searching by name or enable location access.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
            {locationStatus === 'granted' ? ' near you' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(r => <RestaurantCard key={r._id} r={r} />)}
          </div>
        </>
      )}
    </div>
  );
}
