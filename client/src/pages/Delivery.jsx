import { useState } from 'react';
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
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', activeFilter],
    queryFn: () => api.get(`/restaurants?cuisine=${activeFilter === 'All' ? '' : activeFilter}`)
  });

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">Delivery</h1>
          <p className="text-lg text-gray-600 font-medium">Order from your favorite restaurants</p>
        </div>

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
