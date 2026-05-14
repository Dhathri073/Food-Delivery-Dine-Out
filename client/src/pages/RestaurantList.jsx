import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { requestLocation, getCachedLocation } from '../lib/geolocation';
import Button from '../components/Button';
import RestaurantCard from '../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';
import useAuthStore from '../store/authStore';

export default function RestaurantList() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const cuisineFilter = searchParams.get('cuisine');
  const nearParam = searchParams.get('near');
  const isNearSearch = nearParam === '1' || nearParam === 'true';
  const profileCoords = user?.currentLocation?.coordinates?.length === 2
    ? { lat: user.currentLocation.coordinates[1], lng: user.currentLocation.coordinates[0] }
    : null;

  useEffect(() => {
    if (!isNearSearch) {
      setCoords(null);
      setLocationStatus('idle');
      setLocationAccuracy(null);
      return;
    }

    if (!navigator.geolocation) {
      if (profileCoords) {
        setCoords(profileCoords);
        setLocationStatus('profile');
        return;
      }
      setCoords(null);
      setLocationStatus('denied');
      return;
    }

    // Try cached location first
    const cached = getCachedLocation();
    if (cached) {
      setCoords(cached);
      setLocationAccuracy(cached.accuracy);
      setLocationStatus('granted');
      return;
    }

    setLocationStatus('requesting');
    requestLocation(8000)
      .then((location) => {
        setCoords({ lat: location.lat, lng: location.lng });
        setLocationAccuracy(location.accuracy);
        setLocationStatus('granted');
      })
      .catch(() => {
        if (profileCoords) {
          setCoords(profileCoords);
          setLocationStatus('profile');
          return;
        }
        setCoords(null);
        setLocationStatus('denied');
      });
  }, [isNearSearch, profileCoords]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['restaurants', search, coords, cuisineFilter, isNearSearch],
    queryFn: async () => {
      const cuisineParam = encodeURIComponent(cuisineFilter || '');
      
      // If nearby search is requested and we have coordinates, fetch nearby first
      if (coords && isNearSearch) {
        try {
          const nearby = await api.get(
            `/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=20000${cuisineParam ? `&cuisine=${cuisineParam}` : ''}`
          );
          if (nearby.restaurants.length > 0) {
            return { ...nearby, isNearby: true };
          }
        } catch (err) {
          console.warn('Nearby fetch failed, falling back to all restaurants');
        }
      }

      // Default: fetch all restaurants
      return api.get(`/restaurants?cuisine=${cuisineParam}&search=${encodeURIComponent(search)}&limit=20`);
    },
    enabled: !isNearSearch || locationStatus !== 'requesting',
    staleTime: 5 * 60 * 1000 // 5 minutes
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
  const showFallbackNearby = coords && data?.isNearby === false && isNearSearch;
  const pageTitle = cuisineFilter ? `${cuisineFilter} Restaurants` : 'Explore Restaurants';

  return (
    <div className="bg-gray-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{pageTitle}</h1>
            <p className="text-gray-500 font-medium">
              {cuisineFilter ? `Discover the best ${cuisineFilter.toLowerCase()} restaurants near you` : 'Discover the best food near you'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            {(locationStatus === 'granted' || locationStatus === 'profile') && coords && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>
                  {locationStatus === 'profile'
                    ? 'Using saved location'
                    : showFallbackNearby
                    ? 'Showing all restaurants'
                    : `Nearby${locationAccuracy ? ` (±${locationAccuracy}m)` : ''}`}
                </span>
              </div>
            )}
            {(!coords || locationStatus !== 'granted') && (
              <Button onClick={handleRetryLocation} variant="primary" size="sm" className="flex items-center gap-2">
                <span>📍</span> Use My Location
              </Button>
            )}
          </div>
        </div>

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
                <p className="font-black text-gray-900">Location access disabled</p>
                <p className="text-sm text-gray-500 font-medium">Enable location to find nearby restaurants, or search by name below.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetryLocation} variant="primary" size="sm">
                Enable Location
              </Button>
              <Button onClick={handleShowAll} variant="secondary" size="sm">
                Show All
              </Button>
            </div>
            {isNearSearch && locationStatus === 'denied' && (
              <p className="mt-4 text-sm text-gray-500 max-w-xl">
                If you do not see a browser prompt, enable location permissions for this site in your browser settings and retry.
                Otherwise, use Show All to browse restaurants without GPS.
              </p>
            )}
          </div>
        )}

        <div className="mb-12">
          <input
            type="text"
            placeholder={cuisineFilter ? `Search ${cuisineFilter} restaurants...` : 'Search restaurants...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium"
          />
        </div>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
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
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((r) => (
                <RestaurantCard key={r._id} r={r} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500 font-medium mb-8">
                {search
                  ? 'Try searching with different keywords.'
                  : 'Try enabling location or searching for a restaurant.'}
              </p>
              <Link to="/" className="inline-block px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
