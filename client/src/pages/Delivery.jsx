import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import RestaurantCard from '../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';

const CUISINES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Chinese', icon: '🥡' },
  { name: 'Italian', icon: '🍝' },
];

export default function Delivery() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get('cuisine') || 'All');
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    const cuisine = searchParams.get('cuisine');
    if (cuisine) setActiveFilter(cuisine);
  }, [searchParams]);

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
    queryKey: ['restaurants', activeFilter, coords],
    queryFn: async () => {
      const cuisineParam = activeFilter === 'All' ? '' : encodeURIComponent(activeFilter);
      if (coords) {
        const nearby = await api.get(
          `/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=20000${cuisineParam ? `&cuisine=${cuisineParam}` : ''}`
        );
        if (nearby.restaurants.length > 0) {
          return nearby;
        }
        return api.get(`/restaurants?cuisine=${cuisineParam}`);
      }
      return api.get(`/restaurants?cuisine=${cuisineParam}`);
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
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000 }
    );
  };

  const handleShowAll = () => {
    setCoords(null);
    setLocationStatus('denied');
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">Delivery</h1>
          <p className="text-lg text-gray-600 font-medium">Order from your favorite restaurants</p>
        </div>

        {/* Location status */}
        {(locationStatus === 'requesting' || locationStatus === 'granted' || locationStatus === 'denied') && (
          <div className={`mb-8 p-6 rounded-3xl shadow-sm border ${
            locationStatus === 'requesting'
              ? 'bg-blue-50 border-blue-100'
              : locationStatus === 'granted'
              ? 'bg-green-50 border-green-100'
              : 'bg-amber-50 border-amber-100'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
                  {locationStatus === 'requesting' ? '🔄' : locationStatus === 'granted' ? '📍' : '⚠️'}
                </div>
                <div>
                  <p className="font-black text-gray-900">
                    {locationStatus === 'requesting'
                      ? 'Detecting your location...'
                      : locationStatus === 'granted'
                      ? 'Showing restaurants near you'
                      : 'Location access disabled'}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    {locationStatus === 'requesting'
                      ? 'Please allow location access so we can show nearby restaurants and faster delivery.'
                      : locationStatus === 'granted'
                      ? 'We are using GPS to show restaurants close to your current location.'
                      : 'Enable location permissions to see nearby restaurant recommendations.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {locationStatus === 'denied' ? (
                  <button onClick={handleRetryLocation} className="px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all">
                    Enable Location
                  </button>
                ) : (
                  <button onClick={handleShowAll} className="px-5 py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
                    Show All Restaurants
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cuisine Filter */}
        <div className="bg-white rounded-[40px] shadow-lg p-8 sm:p-10 mb-12 border border-gray-100">
          <h2 className="text-xl font-black mb-6">Filter by Cuisine</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {CUISINES.map(cuisine => (
              <button
                key={cuisine.name}
                onClick={() => setActiveFilter(cuisine.name)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeFilter === cuisine.name
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{cuisine.icon}</span>
                {cuisine.name}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div>
          <h2 className="text-2xl font-black mb-8 text-gray-900">
            {activeFilter === 'All' ? 'All Restaurants' : `${activeFilter} Restaurants`}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(6).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          ) : data?.restaurants?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.restaurants.map(r => <RestaurantCard key={r._id} r={r} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500 font-medium">Try changing your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
