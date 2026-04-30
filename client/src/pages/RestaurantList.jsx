import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Button from '../components/Button';
import RestaurantCard from '../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';

export default function RestaurantList() {
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | granted | denied

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
    <div className="bg-gray-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Explore Restaurants</h1>
            <p className="text-gray-500 font-medium">Discover the best food near you</p>
          </div>
          {locationStatus === 'granted' && coords && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Showing restaurants near your location
            </div>
          )}
        </div>

        {/* Location banner */}
        {locationStatus === 'requesting' && (
          <div className="mb-8 p-6 bg-white border border-blue-100 rounded-3xl shadow-sm flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🔄</div>
            <div>
              <p className="font-black text-gray-900">Detecting your location...</p>
              <p className="text-sm text-gray-500 font-medium">Please allow location access to see nearby favorites.</p>
            </div>
          </div>
        )}

        {locationStatus === 'denied' && (
          <div className="mb-8 p-6 bg-white border border-amber-100 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📍</div>
              <div>
                <p className="font-black text-gray-900">Location access denied</p>
                <p className="text-sm text-gray-500 font-medium">Enable location to find nearby restaurants, or search by name below.</p>
              </div>
            </div>
            <Button variant="secondary" onClick={handleRetryLocation} className="shrink-0">
              Try Again
            </Button>
          </div>
        )}

        {/* Search & Filter bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-xl">🔍</span>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500 font-medium transition-all"
                placeholder="Search by restaurant name or cuisine..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {locationStatus === 'granted' ? (
              <Button variant="secondary" onClick={handleShowAll} className="flex items-center gap-2">
                <span>🗺️</span> Show All
              </Button>
            ) : (
              <Button onClick={handleRetryLocation} className="flex items-center gap-2">
                <span>📍</span> Use My Location
              </Button>
            )}
          </div>
        </div>

        {/* Loading skeletons */}
        {(isLoading || locationStatus === 'requesting') ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100 shadow-sm">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Could not load restaurants</h3>
            <p className="text-gray-500 font-medium mb-8">Something went wrong while fetching the data. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Retry Now</Button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100 shadow-sm">
            <div className="text-6xl mb-6">🍽️</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No restaurants found</h3>
            {locationStatus === 'granted' ? (
              <>
                <p className="text-gray-500 font-medium mb-8">We couldn't find any nearby restaurants. Try exploring all restaurants instead.</p>
                <Button onClick={handleShowAll}>Show All Restaurants</Button>
              </>
            ) : (
              <p className="text-gray-500 font-medium">Try searching for something else or enable location access.</p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map(r => <RestaurantCard key={r._id} r={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
