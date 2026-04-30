import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ReservationCard from '../components/ReservationCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';

export default function DineOut() {
  const { data, isLoading } = useQuery({
    queryKey: ['restaurants-dineout'],
    queryFn: () => api.get('/restaurants?limit=12')
  });

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">Dine-Out</h1>
          <p className="text-lg text-gray-600 font-medium">Reserve a table at premium restaurants</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-teal-50 rounded-3xl p-6 border border-teal-100">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-black text-lg mb-2 text-gray-900">Premium Selection</h3>
            <p className="text-gray-600 text-sm font-medium">Hand-picked restaurants with excellent ambiance</p>
          </div>
          <div className="bg-teal-50 rounded-3xl p-6 border border-teal-100">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-black text-lg mb-2 text-gray-900">Easy Booking</h3>
            <p className="text-gray-600 text-sm font-medium">Reserve tables instantly with our hassle-free system</p>
          </div>
          <div className="bg-teal-50 rounded-3xl p-6 border border-teal-100">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-black text-lg mb-2 text-gray-900">Special Occasions</h3>
            <p className="text-gray-600 text-sm font-medium">Perfect for dates, celebrations, and business dinners</p>
          </div>
        </div>

        {/* Featured Restaurants */}
        <div>
          <h2 className="text-2xl font-black mb-8 text-gray-900">Featured Restaurants</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(6).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          ) : data?.restaurants?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.restaurants.map(r => <ReservationCard key={r._id} restaurant={r} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No restaurants available</h3>
              <p className="text-gray-500 font-medium">Try again later</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[40px] p-12 text-white text-center">
          <h3 className="text-3xl font-black mb-4">Ready to book your table?</h3>
          <p className="text-lg font-medium mb-8 opacity-90">Select a restaurant above to check availability and make your reservation</p>
        </div>
      </div>
    </div>
  );
}
